import express from 'express';
import * as offerController from '../controllers/offer.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createOfferSchema, updateOfferSchema } from '../validations/offer.validation.js';

const router = express.Router();

// Public routes
router.get('/', offerController.getAllOffers);
router.get('/:id', offerController.getOffer);

// Admin routes
router.post('/', protect, admin, validation({ body: createOfferSchema }), offerController.createOffer);
router.put('/:id', protect, admin, validation({ body: updateOfferSchema }), offerController.updateOffer);
router.delete('/:id', protect, admin, offerController.deleteOffer);

export default router;
