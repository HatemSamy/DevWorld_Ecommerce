import express from 'express';
import * as bannerController from '../controllers/banner.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createBannerSchema, updateBannerSchema } from '../validations/banner.validation.js';
import { myMulter } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Public routes
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

// Admin routes
router.post(
    '/',
    protect,
    admin,
    myMulter().array('images', 10), // Allow up to 10 images for slider
    validation({ body: createBannerSchema }),
    bannerController.createBanner
);

router.put(
    '/:id',
    protect,
    admin,
    myMulter().array('images', 10), // Allow up to 10 images for slider
    validation({ body: updateBannerSchema }),
    bannerController.updateBanner
);

router.delete('/:id', protect, admin, bannerController.deleteBanner);

// Image management routes
router.post(
    '/:id/images',
    protect,
    admin,
    myMulter().array('images', 10),
    bannerController.addImagesToBanner
);

router.delete('/:id/images/:imageId', protect, admin, bannerController.removeImageFromBanner);

export default router;
