import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/order.validation.js';

const router = express.Router();

// User routes
router.post('/', protect, validation({ body: createOrderSchema }), orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrder);
router.put('/:id/cancel', protect, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', protect, authorize('admin', 'superAdmin'), orderController.getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'superAdmin'), validation({ body: updateOrderStatusSchema }), orderController.updateOrderStatus);

export default router;
