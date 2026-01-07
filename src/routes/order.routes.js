import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/order.validation.js';

const router = express.Router();

// User routes
router.post('/', protect, validation({ body: createOrderSchema }), orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrder);

// Admin routes
router.get('/admin/all', protect, admin, orderController.getAllOrders);
router.put('/:id/status', protect, admin, validation({ body: updateOrderStatusSchema }), orderController.updateOrderStatus);

export default router;
