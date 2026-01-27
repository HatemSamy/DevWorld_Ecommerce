import express from 'express';
import * as offerController from '../controllers/offer.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createOfferSchema, updateOfferSchema } from '../validations/offer.validation.js';

const router = express.Router();

// Public routes
router.get('/', offerController.getAllOffers);
router.get('/:id', offerController.getOffer);

// Admin routes
router.post('/', protect, authorize('admin', 'superAdmin'), validation({ body: createOfferSchema }), offerController.createOffer);
router.put('/:id', protect, authorize('admin', 'superAdmin'), validation({ body: updateOfferSchema }), offerController.updateOffer);
router.delete('/:id', protect, authorize('admin', 'superAdmin'), offerController.deleteOffer);

export default router;
