import Product from '../models/product.model.js';
import User from '../models/user.model.js';


export const addToWishlist = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const user = await User.findById(userId);
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
            data: productId
        });
    } catch (error) {
        next(error);
    }
};



export const getWishlist = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};


export const removeFromWishlist = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        if (!user.wishlist.includes(productId)) {
            return res.status(404).json({ success: false, message: 'Product not in wishlist' });
        }

        user.wishlist = user.wishlist.filter(p => p.toString() !== productId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            data: productId
        });
    } catch (error) {
        next(error);
    }
};
