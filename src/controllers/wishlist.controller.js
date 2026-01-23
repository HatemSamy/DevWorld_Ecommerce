import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist/:productId
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw ApiError.notFound('Product not found');
    }

    const user = await User.findById(userId);
    if (user.wishlist.includes(productId)) {
        throw ApiError.badRequest('Product already in wishlist');
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Product added to wishlist',
        data: productId
    });
});

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, size = 10 } = req.query;

    const user = await User.findById(userId).populate({
        path: 'wishlist',
        match: { isActive: true },
        select: 'name price images brand category',
    });

    const total = user.wishlist.length;
    const start = (page - 1) * size;
    const end = start + Number(size);
    const wishlistItems = user.wishlist.slice(start, end);

    res.status(200).json({
        success: true,
        count: wishlistItems.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / size),
        data: wishlistItems
    });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user.wishlist.includes(productId)) {
        throw ApiError.notFound('Product not in wishlist');
    }

    user.wishlist = user.wishlist.filter(p => p.toString() !== productId);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: productId
    });
});
