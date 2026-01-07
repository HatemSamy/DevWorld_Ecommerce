/**
 * @swagger
 * /home:
 *   get:
 *     summary: Get home page data
 *     description: Retrieve banner images, active offers, featured products, and latest products for the home page
 *     tags: [Home]
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *         description: Language preference (English or Arabic)
 *     responses:
 *       200:
 *         description: Home page data retrieved successfully
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
 *                     bannerImages:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Active banner slides
 *                     offers:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Active promotional offers
 *                     featuredProducts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                       description: Featured products
 *                     latestProducts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                       description: Latest products
 */
