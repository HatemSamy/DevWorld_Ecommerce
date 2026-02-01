import Coupon from '../models/coupon.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Validate coupon and calculate discount
 * @param   {String} couponCode - Coupon code to validate
 * @param   {Number} orderSubtotal - Order subtotal before discount
 * @returns {Object} - { isValid, coupon, discountAmount, message }
 */
export const validateCoupon = async (couponCode, orderSubtotal) => {
    // Find coupon by code
    const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim()
    });

    // Check if coupon exists
    if (!coupon) {
        return {
            isValid: false,
            message: 'Invalid coupon code'
        };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
        return {
            isValid: false,
            message: 'Coupon is not active'
        };
    }

    // Check if coupon has expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return {
            isValid: false,
            message: 'Coupon has expired'
        };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return {
            isValid: false,
            message: 'Coupon usage limit exceeded'
        };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
        return {
            isValid: false,
            message: `Minimum order amount of ${coupon.minOrderAmount} required to use this coupon`
        };
    }

    // Calculate discount amount
    let discountAmount = (orderSubtotal * coupon.value) / 100;

    // Apply max discount cap if exists
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
        isValid: true,
        coupon,
        discountAmount,
        message: 'Coupon is valid'
    };
};

/**
 * @desc    Create new coupon
 * @route   POST /api/v1/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
    const { code, value, minOrderAmount, maxDiscountAmount, usageLimit, expiresAt, isActive } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
        throw ApiError.badRequest('Coupon code already exists');
    }

    // Create coupon
    const coupon = await Coupon.create({
        code: code.toUpperCase().trim(),
        value,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        expiresAt,
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon
    });
});

/**
 * @desc    Get all coupons
 * @route   GET /api/v1/coupons
 * @access  Private/Admin
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, isActive, search } = req.query;

    const query = {};

    // Filter by active status if provided
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    // Search by code if provided
    if (search) {
        query.code = { $regex: search.toUpperCase(), $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [coupons, total] = await Promise.all([
        Coupon.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip),
        Coupon.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        count: coupons.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: coupons
    });
});

/**
 * @desc    Get coupon by ID
 * @route   GET /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        throw ApiError.notFound('Coupon not found');
    }

    res.status(200).json({
        success: true,
        data: coupon
    });
});

/**
 * @desc    Update coupon
 * @route   PUT /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
    const { value, minOrderAmount, maxDiscountAmount, usageLimit, expiresAt, isActive } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        throw ApiError.notFound('Coupon not found');
    }

    // Update only provided fields
    if (value !== undefined) coupon.value = value;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon
    });
});

/**
 * @desc    Delete coupon (permanently)
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
        throw ApiError.notFound('Coupon not found');
    }

    res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
        data: {
            id: coupon._id,
            code: coupon.code
        }
    });
});
