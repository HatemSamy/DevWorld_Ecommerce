import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/order.validation.js';

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

// User routes
router.post('/', protect, validate(createOrderSchema), orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrder);

// Admin routes
router.get('/admin/all', protect, admin, orderController.getAllOrders);
router.put('/:id/status', protect, admin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
