import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { createProductSchema, updateProductSchema } from '../validations/product.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseProductFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

/**
 * Validation middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        next();
    };
};

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.post(
  '/',
  myMulter(fileValidation.image).array('images', 5), // Handle up to 5 images
  parseProductFields,  // ✅ Must parse JSON before validation
  validate(createProductSchema),
  productController.createProduct
);

router.put('/:id',
    protect,
    admin,
    myMulter(fileValidation.image).array('images', 5), // Up to 5 images
    parseProductFields, // Parse JSON strings to objects
    validate(updateProductSchema),
    productController.updateProduct
);

router.delete('/:id', protect, admin, productController.deleteProduct);

export default router;
