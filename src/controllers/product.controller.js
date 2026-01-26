import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Brand from '../models/brand.model.js';
import Rating from '../models/rating.model.js';
import mongoose from 'mongoose';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';
import { paginate } from '../utils/pagination.util.js';
import cloudinary from '../config/cloudinary.config.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Get all products with advanced filtering using MongoDB aggregation
 * @route   GET /api/v1/products
 * @access  Public
 * @query   brand, category, minPrice, maxPrice, condition, search, sort, page, size, ...dynamic attributes
 */
export const getAllProducts = asyncHandler(async (req, res) => {
    const {
        brand,
        category,
        minPrice,
        maxPrice,
        condition,
        search,
        sort = '-createdAt',
        page,
        size,
        ...dynamicFilters
    } = req.query;

    const { limit, skip } = paginate(page, size);

    const matchStage = { isActive: true };

    if (brand) {
        if (mongoose.Types.ObjectId.isValid(brand)) {
            matchStage.brand = new mongoose.Types.ObjectId(brand);
        }
    }
    if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
            matchStage.category = new mongoose.Types.ObjectId(category);
        }
    }
    if (condition) {
        matchStage.condition = condition;
    }

    if (minPrice || maxPrice) {
        matchStage.price = {};
        if (minPrice) matchStage.price.$gte = Number(minPrice);
        if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }

    if (search) {
        matchStage.$or = [
            { 'name.en': { $regex: search, $options: 'i' } },
            { 'name.ar': { $regex: search, $options: 'i' } },
            { 'description.en': { $regex: search, $options: 'i' } },
            { 'description.ar': { $regex: search, $options: 'i' } }
        ];
    }

    Object.keys(dynamicFilters).forEach(key => {
        if (dynamicFilters[key] && key !== 'page' && key !== 'size' && key !== 'sort' && key !== 'search') {
            const value = dynamicFilters[key];
            const numValue = Number(value);
            if (!isNaN(numValue) && !isNaN(parseFloat(value)) && isFinite(value)) {
                matchStage[`attributes.${key}`] = numValue;
            } else {
                matchStage[`attributes.${key}`] = value;
            }
        }
    });

    const sortStage = {};
    if (sort) {
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortOrder = sort.startsWith('-') ? -1 : 1;
        sortStage[sortField] = sortOrder;
    } else {
        sortStage.createdAt = -1;
    }

    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: sortStage },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: 'count' }
                ]
            }
        }
    ];

    const result = await Product.aggregate(pipeline);
    const products = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    const productIds = products.map(p => p._id);

    const ratingStats = await Rating.aggregate([
        {
            $match: {
                product: { $in: productIds }
            }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                ratingsCount: { $sum: 1 }
            }
        }
    ]);

    const ratingMap = {};
    ratingStats.forEach(stat => {
        ratingMap[stat._id.toString()] = {
            averageRating: Math.round(stat.averageRating * 10) / 10,
            ratingsCount: stat.ratingsCount
        };
    });

    products.forEach(product => {
        const stats = ratingMap[product._id.toString()] || { averageRating: 0, ratingsCount: 0 };
        product.averageRating = stats.averageRating;
        product.ratingsCount = stats.ratingsCount;
    });

    const localizedProducts = localizeDocuments(products, req.language);

    res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: parseInt(page) || 1,
        pages: Math.ceil(total / limit),
        data: localizedProducts
    });
});

/**
 * @desc    Get available filter values for products
 * @route   GET /api/v1/products/filters
 * @access  Public
 * @query   category - Optional category ID to filter by
 */
export const getProductFilters = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const matchStage = { isActive: true };

    // Filter by category if provided
    if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
            matchStage.category = new mongoose.Types.ObjectId(category);
        }
    }

    // Aggregation pipeline to get all unique filter values
    const pipeline = [
        { $match: matchStage },

        // Group to get unique values
        {
            $facet: {
                // Brands
                brands: [
                    {
                        $group: {
                            _id: '$brand',
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $lookup: {
                            from: 'brands',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'brandData'
                        }
                    },
                    { $unwind: { path: '$brandData', preserveNullAndEmptyArrays: true } },
                    {
                        $match: {
                            _id: { $ne: null }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: '$brandData.name',
                            image: '$brandData.image',
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

                // Dynamic attributes (all unique attribute keys and values)
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
                            }
                        }
                    }
                ]
            }
        }
    ];

    const result = await Product.aggregate(pipeline);
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
        attributes[attr._id] = attr.values;
    });

    res.status(200).json({
        success: true,
        data: {
            brands,
            priceRange: {
                min: priceRange.minPrice,
                max: priceRange.maxPrice
            },
            conditions,
            attributes
        }
    });
});

/**
 * @desc    Get product autocomplete suggestions
 * @route   GET /api/v1/products/suggest
 * @access  Public
 * @query   q - Search query string (minimum 1 character)
 */
export const getProductSuggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;

    // Build case-insensitive prefix query for both languages
    const suggestions = await Product.find({
        isActive: true,
        $or: [
            { 'name.en': { $regex: `^${q}`, $options: 'i' } },
            { 'name.ar': { $regex: `^${q}`, $options: 'i' } }
        ]
    })
        .select('name description images')
        .limit(10)
        .lean();

    // Extract product id, name, description, and image (localized based on user's language preference)
    const localizedSuggestions = suggestions.map(product => {
        const localized = localizeDocument(product, req.language);
        return {
            _id: product._id,
            name: localized.name,
            description: localized.description,
            image: product.images && product.images.length > 0 ? product.images[0] : null
        };
    });

    res.status(200).json({
        success: true,
        count: localizedSuggestions.length,
        data: localizedSuggestions
    });
});

/**
 * @desc    Get single product
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('brand', 'name image')
        .populate('category', 'name attributesSchema');

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    // Get rating statistics
    const ratingStats = await Rating.aggregate([
        {
            $match: {
                product: product._id
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                ratingsCount: { $sum: 1 }
            }
        }
    ]);

    // Add rating stats to product
    if (ratingStats.length > 0) {
        product.averageRating = Math.round(ratingStats[0].averageRating * 10) / 10;
        product.ratingsCount = ratingStats[0].ratingsCount;
    } else {
        product.averageRating = 0;
        product.ratingsCount = 0;
    }

    const localizedProduct = localizeDocument(product, req.language);

    res.status(200).json({
        success: true,
        data: localizedProduct
    });
});

/**
 * @desc    Create product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
    // Check if image files are uploaded
    if (!req.files || req.files.length === 0) {
        throw ApiError.badRequest('At least one product image is required');
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
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    let imageUrls;

    if (req.files && req.files.length > 0) {
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(imageUrl => {
                const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                return cloudinary.uploader.destroy(`electronics-store/products/${publicId}`);
            });
            await Promise.all(deletePromises);
        }

        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: 'electronics-store/products',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' }
                ]
            })
        );

        const results = await Promise.all(uploadPromises);
        imageUrls = results.map(result => result.secure_url);
    }

    // Prepare update data - add images separately if new ones were uploaded
    const updateData = {
        ...req.body,
        ...(imageUrls && { images: imageUrls })
    };

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
    });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

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
});

/**
 * @desc    Set trending product (only one product can be trending)
 * @route   POST /api/v1/products/admin/:id/trending
 * @access  Private/Admin
 */
export const setTrendingProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    if (!product.isActive) {
        throw ApiError.badRequest('Cannot mark inactive product as trending');
    }

    await Product.updateMany(
        { isTrending: true },
        { $set: { isTrending: false } }
    );

    product.isTrending = true;

    await product.save();

    res.status(200).json({
        success: true,
        message: 'Product marked as trending',
        data: {
            id: product._id,
            isTrending: product.isTrending
        }
    });
});

/**
 * @desc    Get trending product (Public)
 * @route   GET /api/v1/products/trending
 * @access  Public
 */
export const getTrendingProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ isTrending: true, isActive: true })
        .populate('brand', 'name image')
        .populate('category', 'name');

    if (!product) {
        throw ApiError.notFound('No trending product found');
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

/**
 * @desc    Toggle preferred product
 * @route   POST /api/v1/products/:productId/preferred
 * @access  Private
 */
export const togglePreferredProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw ApiError.notFound('Product not found');
    }

    const user = await User.findById(req.user._id);

    const index = user.preferredProducts.findIndex(
        id => id.toString() === productId
    );

    let isPreferred;

    if (index > -1) {
        user.preferredProducts.splice(index, 1);
        isPreferred = false;
    } else {
        user.preferredProducts.push(productId);
        isPreferred = true;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: isPreferred
            ? 'Product added to preferred'
            : 'Product removed from preferred',
        isPreferred
    });
});

/**
 * @desc    Get user's preferred products
 * @route   GET /api/v1/products/preferred
 * @access  Private
 */
export const getPreferredProducts = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: 'preferredProducts',
        match: { isActive: true },
        select: 'name price images stock'
    });

    res.status(200).json({
        success: true,
        data: user.preferredProducts
    });
});

/**
 * Helper function to update product rating statistics
 */
const updateProductRatingStats = async (productId) => {
    const stats = await Rating.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                ratingsCount: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
            ratingsCount: stats[0].ratingsCount
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            ratingsCount: 0
        });
    }
};

/**
 * @desc    Add or update product rating
 * @route   POST /api/v1/products/:id/rating
 * @access  Private
 */
export const addOrUpdateRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ratingvalue } = req.body;

    const userId = req.user._id;

    const rating = Number(ratingvalue); // convert string param to number

    // Validate product exists
    const product = await Product.findById(id);
    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    // Check if rating already exists
    let existingRating = await Rating.findOne({
        user: userId,
        product: id
    });

    let isNew = false;

    if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        await existingRating.save();
    } else {
        // Create new rating
        isNew = true;
        existingRating = await Rating.create({
            user: userId,
            product: id,
            rating
        });
    }

    await updateProductRatingStats(id);

    await existingRating.populate('user', 'firstName lastName');

    res.status(isNew ? 201 : 200).json({
        success: true,
        message: isNew ? 'Rating added successfully' : 'Rating updated successfully',
        data: {
            _id: existingRating._id,
            user: existingRating.user,
            product: existingRating.product,
            rating: existingRating.rating,
            createdAt: existingRating.createdAt,
            updatedAt: existingRating.updatedAt,
            __v: existingRating.__v
        }
    });
});

/**
 * @desc    Get product ratings
 * @route   GET /api/v1/products/:id/ratings
 * @access  Public
 */
export const getProductRatings = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page, size } = req.query;

    const product = await Product.findById(id);
    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    const { limit, skip } = paginate(page, size);

    const ratings = await Rating.find({
        product: id
    })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Rating.countDocuments({
        product: id
    });

    res.status(200).json({
        success: true,
        count: ratings.length,
        total,
        page: parseInt(page) || 1,
        pages: Math.ceil(total / limit),
        data: ratings
    });
});

/**
 * @desc    Delete user's rating for a product
 * @route   DELETE /api/v1/products/:id/rating
 * @access  Private
 */
export const deleteRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(id);
    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    const rating = await Rating.findOneAndDelete({
        user: userId,
        product: id
    });

    if (!rating) {
        throw ApiError.notFound('Rating not found');
    }

    await updateProductRatingStats(id);

    res.status(200).json({
        success: true,
        message: 'Rating deleted successfully'
    });
});

/**
 * @desc    Get user's rating for a product
 * @route   GET /api/v1/products/:id/rating
 * @access  Private
 */
export const getUserRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(id);
    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    const rating = await Rating.findOne({
        user: userId,
        product: id
    }).populate('user', 'firstName lastName email');

    if (!rating) {
        throw ApiError.notFound('Rating not found');
    }

    res.status(200).json({
        success: true,
        data: rating
    });
});

/**
 * @desc    Get all products (Admin - Basic product info)
 * @route   GET /api/v1/products/admin
 * @access  Private/Admin
 */
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
    const { page, size } = req.query;
    const { limit, skip } = paginate(page, size);

    const products = await Product.find()
        .select('name price stock images isActive isFeatured isTrending brand category createdAt')
        .populate('brand', 'name image')
        .populate('category', 'name')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean();

    const total = await Product.countDocuments();

    res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: parseInt(page) || 1,
        pages: Math.ceil(total / limit),
        data: products
    });
});

/**
 * @desc    Get single product (Admin - Full bilingual data)
 * @route   GET /api/v1/products/admin/:id
 * @access  Private/Admin
 */
export const getProductAdmin = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('brand', 'name image')
        .populate('category', 'name attributesSchema')
        .lean();

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    res.status(200).json({
        success: true,
        data: product
    });
});
