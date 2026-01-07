import express from 'express';
import * as brandController from '../controllers/brand.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createBrandSchema, updateBrandSchema } from '../validations/brand.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseBilingualFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

// Public routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrand);

// Admin routes
router.post('/',
    protect,
    admin,
    myMulter(fileValidation.image).single('image'),
    parseBilingualFields, // Parse JSON strings to objects
    validation({ body: createBrandSchema }),
    brandController.createBrand
);

router.put('/:id',
    protect,
    admin,
    myMulter(fileValidation.image).single('image'),
    parseBilingualFields, // Parse JSON strings to objects
    validation({ body: updateBrandSchema }),
    brandController.updateBrand
);

router.delete('/:id', protect, admin, brandController.deleteBrand);

export default router;
