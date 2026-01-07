import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validations/cart.validation.js';
// Import Swagger documentation
import '../swagger/cart.swagger.js';

const router = express.Router();

router.get('/', protect, cartController.getCart);
router.post('/', protect, validation({ body: addToCartSchema }), cartController.addToCart);
router.put('/:itemId', protect, validation({ body: updateCartItemSchema }), cartController.updateCartItem);
router.delete('/:itemId', protect, cartController.removeFromCart);
router.delete('/', protect, cartController.clearCart);

export default router;
