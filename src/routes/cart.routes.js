import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { optionalAuth } from '../middlewares/optionalAuth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validations/cart.validation.js';
import '../swagger/cart.swagger.js';

const router = express.Router();

router.get('/', optionalAuth, cartController.getCart);
router.post('/', optionalAuth, validation({ body: addToCartSchema }), cartController.addToCart);
router.put('/:itemId', optionalAuth, validation({ body: updateCartItemSchema }), cartController.updateCartItem);
router.delete('/:itemId', optionalAuth, cartController.removeFromCart);
router.delete('/', optionalAuth, cartController.clearCart);

router.post('/merge', protect, cartController.mergeCart);

export default router;
