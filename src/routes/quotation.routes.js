import express from 'express';
import * as quotationController from '../controllers/quotation.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createQuotationSchema, updateQuotationSchema } from '../validations/quotation.validation.js';

const router = express.Router();

// Public route - create quotation (supports both authenticated and guest users)
// The protect middleware is optional here - we'll handle authentication in the controller
router.post(
    '/',
    (req, res, next) => {
        // Optional authentication: attach user if token exists, but don't require it
        if (req.headers.authorization) {
            return protect(req, res, next);
        }
        next();
    },
    validation({ body: createQuotationSchema }),
    quotationController.createQuotation
);

// User routes (require authentication)
router.get('/my-quotations', protect, quotationController.getMyQuotations);
router.get('/:id', protect, quotationController.getQuotation);
router.put('/:id', protect, validation({ body: updateQuotationSchema }), quotationController.updateQuotation);

// Admin routes
router.get('/admin/all', protect, authorize('admin', 'superAdmin'), quotationController.getAllQuotations);

export default router;
