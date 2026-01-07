import express from 'express';
import * as homeController from '../controllers/home.controller.js';
// Import Swagger documentation
import '../swagger/home.swagger.js';

const router = express.Router();

router.get('/', homeController.getHomePageData);

export default router;
