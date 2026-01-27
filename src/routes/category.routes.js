import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseCategoryFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);

router.get('/admin', protect, authorize('admin', 'superAdmin'), categoryController.getAllCategoriesAdmin);
router.get('/admin/:id', protect, authorize('admin', 'superAdmin'), categoryController.getCategoryAdmin);

router.post('/admin',
    protect,
    authorize('admin', 'superAdmin'),
    myMulter(fileValidation.image).single('image'),
    parseCategoryFields,
    validation({ body: createCategorySchema }),
    categoryController.createCategory
);

router.put('/admin/:id',
    protect,
    authorize('admin', 'superAdmin'),
    myMulter(fileValidation.image).single('image'),
    parseCategoryFields,
    validation({ body: updateCategorySchema }),
    categoryController.updateCategory
);

router.delete('/admin/:id', protect, authorize('admin', 'superAdmin'), categoryController.deleteCategory);

router.get('/:id/filters', categoryController.getCategoryFilters);
router.get('/:id', categoryController.getCategory);

export default router;
