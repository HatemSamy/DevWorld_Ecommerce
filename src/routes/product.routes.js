import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createProductSchema, updateProductSchema, productSuggestSchema } from '../validations/product.validation.js';
import { createRatingSchema } from '../validations/rating.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseProductFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/trending', productController.getTrendingProduct);
router.get('/filters', productController.getProductFilters);
router.get('/suggest', validation({ query: productSuggestSchema }), productController.getProductSuggestions);

router.get('/admin', protect, authorize('admin', 'superAdmin'), productController.getAllProductsAdmin);
router.get('/admin/:id', protect, authorize('admin', 'superAdmin'), productController.getProductAdmin);
router.post('/admin/:id/trending', protect, authorize('admin', 'superAdmin'), productController.setTrendingProduct);

router.post('/admin',
  protect,
  authorize('admin', 'superAdmin'),
  myMulter(fileValidation.image).array('images', 5),
  parseProductFields,
  validation({ body: createProductSchema }),
  productController.createProduct
);

router.put('/admin/:id',
  protect,
  authorize('admin', 'superAdmin'),
  myMulter(fileValidation.image).array('images', 5),
  parseProductFields,
  validation({ body: updateProductSchema }),
  productController.updateProduct
);

router.delete('/admin/:id', protect, authorize('admin', 'superAdmin'), productController.deleteProduct);

router.get('/:id/ratings', productController.getProductRatings);
router.get('/:id', productController.getProduct);

router.post('/:productId/preferred', protect, productController.togglePreferredProduct);

router.post('/:id/rating',
  protect,
  validation({ params: createRatingSchema }),
  productController.addOrUpdateRating
);
router.get('/:id/rating', protect, productController.getUserRating);
router.delete('/:id/rating', protect, productController.deleteRating);

export default router;
