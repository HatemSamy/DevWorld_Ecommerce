import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';
import { myMulter, fileValidation } from '../middlewares/multer.middleware.js';
import { parseCategoryFields } from '../middlewares/parseJson.middleware.js';

const router = express.Router();

/**
 * Validation middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        console.log('=== VALIDATION MIDDLEWARE DEBUG ===');
        console.log('Validating req.body:', req.body);

        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            console.log('Validation errors:', errors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        console.log('Validation passed!');
        next();
    };
};

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);

// Admin routes
router.post('/',
    protect,
    admin,
    (req, res, next) => {
        console.log('=== BEFORE MULTER ===');
        console.log('Content-Type:', req.headers['content-type']);
        next();
    },
    myMulter(fileValidation.image).single('image'),
    (req, res, next) => {
        console.log('=== AFTER MULTER ===');
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);
        next();
    },
    parseCategoryFields, // Parse JSON strings to objects
    validate(createCategorySchema),
    categoryController.createCategory
);

router.put('/:id',
    protect,
    admin,
    myMulter(fileValidation.image).single('image'),
    parseCategoryFields, // Parse JSON strings to objects
    validate(updateCategorySchema),
    categoryController.updateCategory
);

router.delete('/:id', protect, admin, categoryController.deleteCategory);

export default router;
