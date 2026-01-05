import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validations/cart.validation.js';

const router = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's shopping cart
 *     description: Retrieve the authenticated user's cart with all items and product details
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalAmount:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, cartController.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the user's cart or update quantity if already exists
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *             properties:
 *               product:
 *                 type: string
 *                 description: Product ID
 *               quantity:
 *                 type: number
 *                 default: 1
 *                 minimum: 1
 *               attributes:
 *                 type: object
 *                 description: Product attributes (e.g., color, size)
 *           example:
 *             product: "507f1f77bcf86cd799439011"
 *             quantity: 2
 *             attributes:
 *               RAM: "16GB"
 *               Storage: "512GB SSD"
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Validation error or insufficient stock
 *       404:
 *         description: Product not found
 */
router.post('/', protect, validation({ body: addToCartSchema }), cartController.addToCart);

/**
 * @swagger
 * /cart/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific item in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *           example:
 *             quantity: 3
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       404:
 *         description: Cart or item not found
 */
router.put('/:itemId', protect, validation({ body: updateCartItemSchema }), cartController.updateCartItem);

/**
 * @swagger
 * /cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Cart or item not found
 */
router.delete('/:itemId', protect, cartController.removeFromCart);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 */
router.delete('/', protect, cartController.clearCart);

export default router;
