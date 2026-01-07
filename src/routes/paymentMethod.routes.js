import express from 'express';
import * as paymentMethodController from '../controllers/paymentMethod.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createPaymentMethodSchema, updatePaymentMethodSchema } from '../validations/paymentMethod.validation.js';

const router = express.Router();

// Public routes
router.get('/', paymentMethodController.getAllPaymentMethods);
router.get('/:id', paymentMethodController.getPaymentMethod);

// Admin routes
router.post('/', protect, admin, validation({ body: createPaymentMethodSchema }), paymentMethodController.createPaymentMethod);
router.put('/:id', protect, admin, validation({ body: updatePaymentMethodSchema }), paymentMethodController.updatePaymentMethod);
router.delete('/:id', protect, admin, paymentMethodController.deletePaymentMethod);

export default router;
