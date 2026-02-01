import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { localizeDocument } from '../utils/helpers.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';
import { mergeGuestCartToUser } from '../utils/cartMerge.util.js';
import { isValidGuestId } from '../utils/guestId.util.js';

/**
 * @desc    Get user's or guest's cart
 * @route   GET /api/v1/cart
 * @access  Public (with optional auth)
 */
export const getCart = asyncHandler(async (req, res) => {
    const query = req.isGuest
        ? { guestId: req.guestId }
        : { user: req.user._id };

    let cart = await Cart.findOne(query).populate({
        path: 'items.product',
        select: 'name description images price stock slug'
    });

    if (!cart) {
        const cartData = req.isGuest
            ? { guestId: req.guestId, items: [] }
            : { user: req.user._id, items: [] };
        cart = await Cart.create(cartData);
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
 * @access  Public (with optional auth)
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { product: productId, quantity, attributes } = req.body;

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

    const query = req.isGuest
        ? { guestId: req.guestId }
        : { user: req.user._id };

    let cart = await Cart.findOne(query);
    if (!cart) {
        const cartData = req.isGuest
            ? { guestId: req.guestId, items: [] }
            : { user: req.user._id, items: [] };
        cart = new Cart(cartData);
    }

    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    const price = product.price;

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;

        if (product.stock < cart.items[existingItemIndex].quantity) {
            throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
        }
    } else {
        cart.items.push({
            product: productId,
            quantity,
            price,
            attributes: attributes || {}
        });
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name description images price stock isActive slug'
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
 * @access  Public (with optional auth)
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const query = req.isGuest
        ? { guestId: req.guestId }
        : { user: req.user._id };

    const cart = await Cart.findOne(query);
    if (!cart) {
        throw ApiError.notFound('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
        throw ApiError.notFound('Item not found in cart');
    }

    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
        throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name description images price stock isActive slug'
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
 * @access  Public (with optional auth)
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const query = req.isGuest
        ? { guestId: req.guestId }
        : { user: req.user._id };

    const cart = await Cart.findOne(query);
    if (!cart) {
        throw ApiError.notFound('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
        throw ApiError.notFound('Item not found in cart');
    }

    item.deleteOne();
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name description images price stock isActive slug'
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
 * @access  Public (with optional auth)
 */
export const clearCart = asyncHandler(async (req, res) => {
    const query = req.isGuest
        ? { guestId: req.guestId }
        : { user: req.user._id };

    const cart = await Cart.findOne(query);
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

/**
 * @desc    Merge guest cart into user cart
 * @route   POST /api/v1/cart/merge
 * @access  Private
 */
export const mergeCart = asyncHandler(async (req, res) => {
    const { guestId } = req.body;

    if (!guestId || !isValidGuestId(guestId)) {
        throw ApiError.badRequest('Invalid guest ID');
    }

    const mergedCart = await mergeGuestCartToUser(guestId, req.user._id);

    if (!mergedCart) {
        return res.status(200).json({
            success: true,
            message: 'No guest cart to merge',
            data: null
        });
    }

    const populatedCart = await Cart.findById(mergedCart._id).populate({
        path: 'items.product',
        select: 'name description images price stock isActive slug'
    });

    const localizedCart = localizeDocument(populatedCart.toObject(), req.language);

    res.status(200).json({
        success: true,
        message: 'Carts merged successfully',
        data: localizedCart
    });
});
