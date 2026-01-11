import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseCategoryFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id/filters', categoryController.getCategoryFilters);
router.get('/:id', categoryController.getCategory);

// Admin routes
router.post('/',
    protect,
    admin,
    myMulter(fileValidation.image).single('image'),
    parseCategoryFields, // Parse JSON strings to objects
    validation({ body: createCategorySchema }),
    categoryController.createCategory
);

router.put('/:id',
    protect,
    admin,
    myMulter(fileValidation.image).single('image'),
    parseCategoryFields, // Parse JSON strings to objects
    validation({ body: updateCategorySchema }),
    categoryController.updateCategory
);

router.delete('/:id', protect, admin, categoryController.deleteCategory);

export default router;
