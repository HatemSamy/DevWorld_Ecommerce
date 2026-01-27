import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { addAddressSchema, updatePasswordSchema } from '../validations/auth.validation.js';

const router = express.Router();

router.get('/admin/getusers', protect, authorize('admin', 'superAdmin'), userController.getAllUsers);

router.get('/profile', protect, userController.getProfile);
router.put('/update-password', protect, validation({ body: updatePasswordSchema }), userController.updatePassword);

router.post('/addresses', protect, validation({ body: addAddressSchema }), userController.addAddress);

router.put('/addresses/:addressId', protect, validation({ body: addAddressSchema }), userController.updateAddress);
router.delete('/addresses/:addressId', protect, userController.deleteAddress);

export default router;
