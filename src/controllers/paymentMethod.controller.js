import PaymentMethod from '../models/paymentMethod.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';
import cloudinary from '../config/cloudinary.config.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Get all payment methods
 *          - Admin: returns all payment methods (active and inactive)
 *          - User/Public: returns only active payment methods
 * @route   GET /api/v1/payment-methods
 * @access  Public/Private
 */
export const getAllPaymentMethods = asyncHandler(async (req, res) => {
    // Check if user is authenticated and is admin
    const isAdmin = req.user && req.user.role === 'admin';

    // Build query based on user role
    const query = isAdmin ? {} : { isActive: true };

    const paymentMethods = await PaymentMethod.find(query);

    const localizedMethods = localizeDocuments(paymentMethods, req.language);

    res.status(200).json({
        success: true,
        count: paymentMethods.length,
        data: localizedMethods
    });
});

/**
 * @desc    Get single payment method
 * @route   GET /api/v1/payment-methods/:id
 * @access  Public
 */
export const getPaymentMethod = asyncHandler(async (req, res) => {
    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
        throw ApiError.notFound('Payment method not found');
    }

    const localizedMethod = localizeDocument(paymentMethod, req.language);

    res.status(200).json({
        success: true,
        data: localizedMethod
    });
});

/**
 * @desc    Create payment method (Admin only)
 * @route   POST /api/v1/payment-methods/admin/create
 * @access  Private/Admin
 */
export const createPaymentMethod = asyncHandler(async (req, res) => {
    // Check if icon file is uploaded
    if (!req.file) {
        throw ApiError.badRequest('Payment method icon is required');
    }

    const { name, instructions } = req.body;

    // Check if payment method with same name already exists
    const existingMethod = await PaymentMethod.findOne({
        'name.en': name.en
    });

    if (existingMethod) {
        throw ApiError.badRequest('Payment method with this name already exists');
    }

    // Upload icon to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'electronics-store/payment-methods',
        transformation: [
            { width: 200, height: 200, crop: 'limit' }
        ]
    });

    const paymentMethod = await PaymentMethod.create({
        name,
        icon: result.secure_url,
        instructions,
        isActive: true
    });

    res.status(201).json({
        success: true,
        message: 'Payment method created successfully',
        data: paymentMethod
    });
});

/**
 * @desc    Toggle payment method active status (Admin only)
 * @route   PATCH /api/v1/payment-methods/admin/:id
 * @access  Private/Admin
 */
export const togglePaymentMethodStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true, runValidators: true }
    );

    if (!paymentMethod) {
        throw ApiError.notFound('Payment method not found');
    }

    res.status(200).json({
        success: true,
        message: `Payment method ${isActive ? 'enabled' : 'disabled'} successfully`,
        data: paymentMethod
    });
});
