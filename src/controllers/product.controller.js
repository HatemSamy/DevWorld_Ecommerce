import Product from '../models/product.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';
import { paginate } from '../utils/pagination.util.js';
import cloudinary from '../config/cloudinary.config.js';

/**
 * @desc    Get all products with filtering
 * @route   GET /api/v1/products
 * @access  Public
 * @query   brand, category, minPrice, maxPrice, condition, search, ...dynamic attributes
 */
export const getAllProducts = async (req, res, next) => {
    try {
        const { brand, category, minPrice, maxPrice, condition, search, page, size, ...dynamicFilters } = req.query;

        // Use pagination utility
        const { limit, skip } = paginate(page, size);

        // Build query
        const query = { isActive: true };

        // Standard filters
        if (brand) query.brand = brand;
        if (category) query.category = category;
        if (condition) query.condition = condition;

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Dynamic attribute filters (e.g., ?RAM=16GB&Color=Red)
        Object.keys(dynamicFilters).forEach(key => {
            if (dynamicFilters[key]) {
                query[`attributes.${key}`] = dynamicFilters[key];
            }
        });

        // Execute query
        const products = await Product.find(query)
            .populate('brand', 'name image')
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        // Localize response
        const localizedProducts = localizeDocuments(products, req.language);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: parseInt(page) || 1,
            pages: Math.ceil(total / limit),
            data: localizedProducts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single product
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('brand', 'name image')
            .populate('category', 'name attributesSchema');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const localizedProduct = localizeDocument(product, req.language);

        res.status(200).json({
            success: true,
            data: localizedProduct
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
    try {
        // Check if image files are uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            });
        }

        // Upload all images to Cloudinary
        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: 'electronics-store/products',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' }
                ]
            })
        );

        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map(result => result.secure_url);

        // Create product with Cloudinary URLs
        const product = await Product.create({
            ...req.body,
            images: imageUrls
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // If new images are uploaded
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            if (product.images && product.images.length > 0) {
                const deletePromises = product.images.map(imageUrl => {
                    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                    return cloudinary.uploader.destroy(`electronics-store/products/${publicId}`);
                });
                await Promise.all(deletePromises);
            }

            // Upload new images
            const uploadPromises = req.files.map(file =>
                cloudinary.uploader.upload(file.path, {
                    folder: 'electronics-store/products',
                    transformation: [
                        { width: 800, height: 800, crop: 'limit' }
                    ]
                })
            );

            const results = await Promise.all(uploadPromises);
            req.body.images = results.map(result => result.secure_url);
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete all images from Cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(imageUrl => {
                const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                return cloudinary.uploader.destroy(`electronics-store/products/${publicId}`);
            });
            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
