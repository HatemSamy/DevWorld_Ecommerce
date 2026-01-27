import express from 'express';
import * as bannerController from '../controllers/banner.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createBannerSchema, updateBannerSchema } from '../validations/banner.validation.js';
import { myMulter } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

router.post(
    '/',
    protect,
    authorize('admin', 'superAdmin'),
    myMulter().array('images', 10),
    validation({ body: createBannerSchema }),
    bannerController.createBanner
);

router.put(
    '/:id',
    protect,
    authorize('admin', 'superAdmin'),
    myMulter().array('images', 10),
    validation({ body: updateBannerSchema }),
    bannerController.updateBanner
);

router.delete('/:id', protect, authorize('admin', 'superAdmin'), bannerController.deleteBanner);

router.post(
    '/:id/images',
    protect,
    authorize('admin', 'superAdmin'),
    myMulter().array('images', 10),
    bannerController.addImagesToBanner
);

router.delete('/:id/images/:imageId', protect, authorize('admin', 'superAdmin'), bannerController.removeImageFromBanner);

export default router;
