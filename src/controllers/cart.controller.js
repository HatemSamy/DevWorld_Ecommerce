import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { localizeDocument } from '../utils/helpers.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { product: productId, quantity, attributes } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    if (!product.isActive) {
        throw ApiError.badRequest('Product is not available');
    }

    if (product.stock < quantity) {
        throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
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
            throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
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
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/:itemId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw ApiError.notFound('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
        throw ApiError.notFound('Item not found in cart');
    }

    // Check product stock
    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
        throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
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
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/:itemId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw ApiError.notFound('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
        throw ApiError.notFound('Item not found in cart');
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
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw ApiError.notFound('Cart not found');
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: cart
    });
});
