import PaymentMethod from '../models/paymentMethod.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';

/**
 * @desc    Get all active payment methods
 * @route   GET /api/v1/payment-methods
 * @access  Public
 */
export const getAllPaymentMethods = async (req, res, next) => {
    try {
        const paymentMethods = await PaymentMethod.find({ isActive: true });

        const localizedMethods = localizeDocuments(paymentMethods, req.language);

        res.status(200).json({
            success: true,
            count: paymentMethods.length,
            data: localizedMethods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single payment method
 * @route   GET /api/v1/payment-methods/:id
 * @access  Public
 */
export const getPaymentMethod = async (req, res, next) => {
    try {
        const paymentMethod = await PaymentMethod.findById(req.params.id);

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        const localizedMethod = localizeDocument(paymentMethod, req.language);

        res.status(200).json({
            success: true,
            data: localizedMethod
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create payment method (Admin)
 * @route   POST /api/v1/payment-methods
 * @access  Private/Admin
 */
export const createPaymentMethod = async (req, res, next) => {
    try {
        const paymentMethod = await PaymentMethod.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Payment method created successfully',
            data: paymentMethod
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update payment method (Admin)
 * @route   PUT /api/v1/payment-methods/:id
 * @access  Private/Admin
 */
export const updatePaymentMethod = async (req, res, next) => {
    try {
        const paymentMethod = await PaymentMethod.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment method updated successfully',
            data: paymentMethod
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete payment method (Admin)
 * @route   DELETE /api/v1/payment-methods/:id
 * @access  Private/Admin
 */
export const deletePaymentMethod = async (req, res, next) => {
    try {
        const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
