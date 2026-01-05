import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { localizeDocument } from '../utils/helpers.util.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name description images price salePrice stock isActive'
            });

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const localizedCart = localizeDocument(cart.toObject(), req.language);

        res.status(200).json({
            success: true,
            data: localizedCart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
    try {
        const { product: productId, quantity, attributes } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        const price = product.salePrice || product.price;

        if (existingItemIndex > -1) {
            // Update quantity if product already exists
            cart.items[existingItemIndex].quantity += quantity;

            // Check stock again
            if (product.stock < cart.items[existingItemIndex].quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price,
                attributes: attributes || {}
            });
        }

        await cart.save();

        // Populate and return
        cart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name description images price salePrice stock isActive'
        });

        const localizedCart = localizeDocument(cart.toObject(), req.language);

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: localizedCart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/:itemId
 * @access  Private
 */
export const updateCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Check product stock
        const product = await Product.findById(item.product);
        if (product && product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        item.quantity = quantity;
        await cart.save();

        // Populate and return
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name description images price salePrice stock isActive'
        });

        const localizedCart = localizeDocument(updatedCart.toObject(), req.language);

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: localizedCart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/:itemId
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        item.deleteOne();
        await cart.save();

        // Populate and return
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name description images price salePrice stock isActive'
        });

        const localizedCart = localizeDocument(updatedCart.toObject(), req.language);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: localizedCart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};
