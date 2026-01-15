/**
 * @swagger
 * components:
 *   schemas:
 *     Banner:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           example: "Summer Sale"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           example: "https://res.cloudinary.com/example/image/upload/v1234/banners/banner1.jpg"
 *         publicId:
 *           type: string
 *           example: "electronics-store/banners/banner1"
 *         linkUrl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/sale"
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

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get all banners
 *     description: Retrieve all banners. Optionally filter by active status.
 *     tags: [Banner]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Banner'
 */

/**
 * @swagger
 * /banners/{id}:
 *   get:
 *     summary: Get banner by ID
 *     description: Retrieve a single banner by its ID.
 *     tags: [Banner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
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
 * /banners:
 *   post:
 *     summary: Create a new banner
 *     description: Create a new banner with an image. Admin only.
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Sale"
 *               image:
 *                 type: string
 *                 format: binary
 *               linkUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/sale"
 *               isActive:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 example: "true"
 *     responses:
 *       201:
 *         description: Banner created successfully
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
 *                   example: "Banner created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       400:
 *         description: Validation error or missing image
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /banners/{id}:
 *   put:
 *     summary: Update a banner
 *     description: Update an existing banner. Optionally upload a new image. Admin only.
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Sale Title"
 *               image:
 *                 type: string
 *                 format: binary
 *               linkUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/new-sale"
 *               isActive:
 *                 type: string
 *                 enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: Banner updated successfully
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
 *                   example: "Banner updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /banners/{id}:
 *   delete:
 *     summary: Delete a banner
 *     description: Delete a banner and its image from Cloudinary. Admin only.
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner deleted successfully
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
 *                   example: "Banner deleted successfully"
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
