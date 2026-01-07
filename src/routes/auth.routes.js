import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../validations/auth.validation.js';

const router = express.Router();

// Public routes
router.post('/register', validation({ body: registerSchema }), authController.register);
router.post('/login', validation({ body: loginSchema }), authController.login);
router.post('/forgot-password', validation({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validation({ body: resetPasswordSchema }), authController.resetPassword);

export default router;
