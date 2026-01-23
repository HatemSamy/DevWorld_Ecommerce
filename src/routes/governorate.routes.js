import express from 'express';
import * as governorateController from '../controllers/governorate.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createGovernorateSchema, updateGovernorateSchema } from '../validations/governorate.validation.js';

const router = express.Router();

// Public routes - users can view governorates when selecting address
router.get('/', governorateController.getAllGovernorates);
router.get('/:id', governorateController.getGovernorate);

// Admin routes - only admins can create/update/delete governorates
router.post(
    '/',
    protect,
    admin,
    validation({ body: createGovernorateSchema }),
    governorateController.createGovernorate
);

router.put(
    '/:id',
    protect,
    admin,
    validation({ body: updateGovernorateSchema }),
    governorateController.updateGovernorate
);

router.delete(
    '/:id',
    protect,
    admin,
    governorateController.deleteGovernorate
);

export default router;
