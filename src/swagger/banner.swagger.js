/**
 * @swagger
 * /banner:
 *   get:
 *     summary: Get the singleton banner
 *     description: Retrieve the banner with active slides sorted by display order. Supports multi-language responses.
 *     tags: [Banner]
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *         description: Language preference (English or Arabic)
 *     responses:
 *       200:
 *         description: Banner retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /banner:
 *   put:
 *     summary: Update banner images
 *     description: Update the singleton banner with new images/slides. Admin only.
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/banner1.jpg"
 *                     title:
 *                       $ref: '#/components/schemas/BilingualText'
 *                     subtitle:
 *                       $ref: '#/components/schemas/BilingualText'
 *                     linkUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/sale"
 *                     displayOrder:
 *                       type: number
 *                       example: 0
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *           example:
 *             images:
 *               - imageUrl: "https://example.com/banner1.jpg"
 *                 title:
 *                   en: "Summer Sale"
 *                   ar: "تخفيضات الصيف"
 *                 subtitle:
 *                   en: "Up to 70% Off"
 *                   ar: "خصومات تصل إلى 70%"
 *                 linkUrl: "https://example.com/sale"
 *                 displayOrder: 0
 *                 isActive: true
 *             isActive: true
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /banner/initialize:
 *   post:
 *     summary: Initialize banner
 *     description: Create the banner if it doesn't exist. Admin only.
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banner initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
