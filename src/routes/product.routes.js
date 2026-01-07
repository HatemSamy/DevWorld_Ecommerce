import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createProductSchema, updateProductSchema } from '../validations/product.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseProductFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/preferred', protect, productController.getPreferredProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.post(
    '/',
    protect,
    admin,
    myMulter(fileValidation.image).array('images', 5), // Handle up to 5 images
    parseProductFields,  // Must parse JSON before validation
    validation({ body: createProductSchema }),
    productController.createProduct
);

router.put('/:id',
    protect,
    admin,
    myMulter(fileValidation.image).array('images', 5), // Up to 5 images
    parseProductFields, // Parse JSON strings to objects
    validation({ body: updateProductSchema }),
    productController.updateProduct
);

router.delete('/:id', protect, admin, productController.deleteProduct);




// Toggle prefer / unprefer (BEST PRACTICE)
router.post(
  '/:productId/preferred',
  protect,
  productController.togglePreferredProduct
);


export default router;
