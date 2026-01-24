import Category from '../models/category.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';
import { paginate } from '../utils/pagination.util.js';
import cloudinary from '../config/cloudinary.config.js';
import productModel from '../models/product.model.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
    const { page, size } = req.query;
    const { limit, skip } = paginate(page, size);

    const categories = await Category.find({ isActive: true })
        .select('_id name slug image')
        .limit(limit)
        .skip(skip);

    const total = await Category.countDocuments({ isActive: true });

    // Localize response
    const localizedCategories = localizeDocuments(categories, req.language);

    res.status(200).json({
        success: true,
        count: categories.length,
        total,
        page: parseInt(page) || 1,
        pages: Math.ceil(total / limit),
        data: localizedCategories
    });
});

/**
 * @desc    Get available filter values for a specific category
 * @route   GET /api/v1/categories/:id/filters
 * @access  Public
 */
export const getCategoryFilters = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw ApiError.badRequest('Invalid category ID');
    }

    const matchStage = {
        isActive: true,
        category: new mongoose.Types.ObjectId(categoryId)
    };

    // Aggregation pipeline to get filter values for this category
    const pipeline = [
        { $match: matchStage },

        // Lookup brand
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },

        // Group to get unique values
        {
            $facet: {
                // Brands
                brands: [
                    {
                        $group: {
                            _id: '$brand._id',
                            name: { $first: '$brand.name' },
                            image: { $first: '$brand.image' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            image: 1,
                            count: 1
                        }
                    }
                ],

                // Price range
                priceRange: [
                    {
                        $group: {
                            _id: null,
                            minPrice: { $min: '$price' },
                            maxPrice: { $max: '$price' }
                        }
                    }
                ],

                // Conditions
                conditions: [
                    {
                        $group: {
                            _id: '$condition',
                            count: { $sum: 1 }
                        }
                    }
                ],

                // Dynamic attributes based on category schema
                attributes: [
                    {
                        $project: {
                            attributes: {
                                $objectToArray: '$attributes'
                            }
                        }
                    },
                    { $unwind: '$attributes' },
                    {
                        $group: {
                            _id: {
                                key: '$attributes.k',
                                value: '$attributes.v'
                            },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id.key',
                            values: {
                                $push: {
                                    value: '$_id.value',
                                    count: '$count'
                                }
                            },
                            totalCount: { $sum: '$count' }
                        }
                    }
                ]
            }
        }
    ];

    const result = await productModel.aggregate(pipeline);
    const filters = result[0] || {};

    // Process brands
    const brands = (filters.brands || []).map(b => ({
        id: b._id,
        name: b.name,
        image: b.image,
        count: b.count
    }));

    // Process price range
    const priceRange = filters.priceRange?.[0] || { minPrice: 0, maxPrice: 0 };

    // Process conditions
    const conditions = (filters.conditions || []).map(c => ({
        value: c._id,
        count: c.count
    }));

    // Process dynamic attributes
    const attributes = {};
    (filters.attributes || []).forEach(attr => {
        attributes[attr._id] = {
            values: attr.values,
            totalCount: attr.totalCount
        };
    });

    // Get category attributes schema for reference
    const categoryAttributes = category.attributesSchema || [];

    res.status(200).json({
        success: true,
        data: {
            category: {
                id: category._id,
                name: localizeDocument(category, req.language).name,
                attributesSchema: categoryAttributes
            },
            filters: {
                brands,
                priceRange: {
                    min: priceRange.minPrice,
                    max: priceRange.maxPrice
                },
                conditions,
                attributes
            }
        }
    });
});

/**
 * @desc    Get single category
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    // 🔤 Localize category
    const localizedCategory = localizeDocument(category, req.language);

    // 📦 Get products in this category
    const products = await productModel.find({ category: category._id, isActive: true })
        .select('name price images')
        .sort({ createdAt: -1 });

    // 🔤 Localize products
    const localizedProducts = products.map(product => {
        const localized = localizeDocument(product, req.language);
        return {
            id: localized._id,
            name: localized.name,
            price: localized.price,
            image: localized.images?.[0] || null
        };
    });

    res.status(200).json({
        success: true,
        data: {
            category: {
                id: localizedCategory._id,
                name: localizedCategory.name,
                slug: localizedCategory.slug,
                image: localizedCategory.image
            },
            products: localizedProducts,
            count: localizedProducts.length
        }
    });
});

/**
 * @desc    Create category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
    // Check if image file is uploaded
    if (!req.file) {
        throw ApiError.badRequest('Category image is required');
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'electronics-store/categories',
        transformation: [
            { width: 500, height: 500, crop: 'limit' }
        ]
    });

    // Create category with Cloudinary URL
    const category = await Category.create({
        ...req.body,
        image: result.secure_url
    });

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
    });
});

/**
 * @desc    Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    // If new image is uploaded
    if (req.file) {
        // Delete old image from Cloudinary
        if (category.image) {
            const publicId = category.image.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(`electronics-store/categories/${publicId}`);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'electronics-store/categories',
            transformation: [
                { width: 500, height: 500, crop: 'limit' }
            ]
        });

        req.body.image = result.secure_url;
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
    });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    // Delete image from Cloudinary
    if (category.image) {
        const publicId = category.image.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`electronics-store/categories/${publicId}`);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
    });
});

// ============================================
// ADMIN-SPECIFIC ENDPOINTS
// ============================================

/**
 * @desc    Get all categories (Admin - Full bilingual data)
 * @route   GET /api/v1/categories/admin
 * @access  Private/Admin
 */
export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
    const { page, size } = req.query;
    const { limit, skip } = paginate(page, size);

    // Return ALL categories (including inactive) with essential fields for admin listing
    const categories = await Category.find()
        .select('_id name slug image isActive createdAt')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean();

    const total = await Category.countDocuments();

    // NO localization - return raw bilingual data for admin panel
    res.status(200).json({
        success: true,
        count: categories.length,
        total,
        page: parseInt(page) || 1,
        pages: Math.ceil(total / limit),
        data: categories
    });
});

/**
 * @desc    Get single category (Admin - Full bilingual data)
 * @route   GET /api/v1/categories/admin/:id
 * @access  Private/Admin
 */
export const getCategoryAdmin = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).lean();

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    // NO localization - return full bilingual data
    res.status(200).json({
        success: true,
        data: category
    });
});
