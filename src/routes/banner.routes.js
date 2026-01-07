import express from 'express';
import * as bannerController from '../controllers/banner.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { updateBannerSchema } from '../validations/banner.validation.js';
// Import Swagger documentation
import '../swagger/banner.swagger.js';

const router = express.Router();

router.get('/', bannerController.getBanner);
router.put('/', protect, admin, validation({ body: updateBannerSchema }), bannerController.updateBanner);
router.post('/initialize', protect, admin, bannerController.initializeBanner);

export default router;
