import express from 'express';
import * as paymentMethodController from '../controllers/paymentMethod.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { createPaymentMethodSchema, updatePaymentMethodSchema } from '../validations/paymentMethod.validation.js';

const router = express.Router();

/**
 * Validation middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        next();
    };
};

// Public routes
router.get('/', paymentMethodController.getAllPaymentMethods);
router.get('/:id', paymentMethodController.getPaymentMethod);

// Admin routes
router.post('/', protect, admin, validate(createPaymentMethodSchema), paymentMethodController.createPaymentMethod);
router.put('/:id', protect, admin, validate(updatePaymentMethodSchema), paymentMethodController.updatePaymentMethod);
router.delete('/:id', protect, admin, paymentMethodController.deletePaymentMethod);

export default router;
