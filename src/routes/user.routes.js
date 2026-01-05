import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { addAddressSchema } from '../validations/auth.validation.js';

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

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.post('/addresses', protect, validate(addAddressSchema), userController.addAddress);
router.put('/addresses/:addressId', protect, validate(addAddressSchema), userController.updateAddress);
router.delete('/addresses/:addressId', protect, userController.deleteAddress);

export default router;
