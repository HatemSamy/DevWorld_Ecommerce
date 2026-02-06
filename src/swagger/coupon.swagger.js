/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Apply coupon to calculate discount
 *     description: Validates a coupon code and calculates the discount amount based on the provided subtotal. This endpoint does not apply the coupon to an order, it only previews the discount.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponCode
 *               - subtotal
 *             properties:
 *               couponCode:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 description: The coupon code to validate (case-insensitive)
 *                 example: SAVE20
 *               subtotal:
 *                 type: number
 *                 minimum: 0
 *                 description: The order subtotal before discount
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Coupon is valid and discount calculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Coupon is valid
 *                 data:
 *                   type: object
 *                   properties:
 *                     couponCode:
 *                       type: string
 *                       example: SAVE20
 *                     discountPercentage:
 *                       type: number
 *                       example: 20
 *                     discountAmount:
 *                       type: number
 *                       example: 200
 *                     subtotal:
 *                       type: number
 *                       example: 1000
 *                     totalAfterDiscount:
 *                       type: number
 *                       example: 800
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: 2026-12-31T23:59:59.000Z
 *                     minOrderAmount:
 *                       type: number
 *                       nullable: true
 *                       example: 500
 *                     maxDiscountAmount:
 *                       type: number
 *                       nullable: true
 *                       example: 500
 *       400:
 *         description: Invalid coupon code or coupon validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidCode:
 *                 value:
 *                   success: false
 *                   message: Invalid coupon code
 *               expired:
 *                 value:
 *                   success: false
 *                   message: Coupon has expired
 *               minOrderNotMet:
 *                 value:
 *                   success: false
 *                   message: Minimum order amount of 500 required to use this coupon
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create a new coupon
 *     description: Create a new discount coupon. Admin only.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - value
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 description: Unique coupon code (will be converted to uppercase)
 *                 example: SAVE20
 *               value:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Discount percentage (0-100)
 *                 example: 20
 *               minOrderAmount:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Minimum order amount required to use the coupon
 *                 example: 500
 *               maxDiscountAmount:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Maximum discount amount cap
 *                 example: 500
 *               usageLimit:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 description: Maximum number of times the coupon can be used
 *                 example: 100
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Coupon expiration date
 *                 example: 2026-12-31T23:59:59.000Z
 *               isActive:
 *                 type: boolean
 *                 description: Whether the coupon is active
 *                 default: true
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Coupon created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Validation error or coupon code already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get all coupons
 *     description: Retrieve all coupons with pagination and filtering. Admin only.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by coupon code
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pages:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     description: Retrieve a single coupon by its ID. Admin only.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /coupons/{id}:
 *   put:
 *     summary: Update a coupon
 *     description: Update an existing coupon. Admin only.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Discount percentage (0-100)
 *                 example: 25
 *               minOrderAmount:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 600
 *               maxDiscountAmount:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 600
 *               usageLimit:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 example: 150
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2027-01-31T23:59:59.000Z
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Coupon updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete a coupon
 *     description: Permanently delete a coupon. Admin only.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Coupon deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     code:
 *                       type: string
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         code:
 *           type: string
 *           example: SAVE20
 *         value:
 *           type: number
 *           example: 20
 *           description: Discount percentage
 *         minOrderAmount:
 *           type: number
 *           nullable: true
 *           example: 500
 *         maxDiscountAmount:
 *           type: number
 *           nullable: true
 *           example: 500
 *         usageLimit:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         usedCount:
 *           type: integer
 *           example: 25
 *           description: Number of times the coupon has been used
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: 2026-12-31T23:59:59.000Z
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
