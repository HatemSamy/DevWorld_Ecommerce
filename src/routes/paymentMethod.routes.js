import express from 'express';
import * as paymentMethodController from '../controllers/paymentMethod.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createPaymentMethodSchema, updatePaymentMethodSchema } from '../validations/paymentMethod.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseJsonFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

// Public routes
router.get('/', paymentMethodController.getAllPaymentMethods);
router.get('/:id', paymentMethodController.getPaymentMethod);

// Admin routes
router.post(
    '/admin/create',
    protect,
    authorize('admin', 'superAdmin'),
    myMulter(fileValidation.image).single('icon'),
    parseJsonFields(['name', 'instructions']),
    validation({ body: createPaymentMethodSchema }),
    paymentMethodController.createPaymentMethod
);

router.patch('/admin/:id', protect, authorize('admin', 'superAdmin'), validation({ body: updatePaymentMethodSchema }), paymentMethodController.togglePaymentMethodStatus);

export default router;
