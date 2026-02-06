import express from 'express';
import * as contactController from '../controllers/contact.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createContactSchema, updateContactStatusSchema } from '../validations/contact.validation.js';

const router = express.Router();

// Public route - create contact
router.post(
    '/',
    validation({ body: createContactSchema }),
    contactController.createContact
);

// Admin routes
router.get(
    '/admin/all',
    protect,
    authorize('admin', 'superAdmin'),
    contactController.getAllContacts
);

router.get(
    '/admin/:id',
    protect,
    authorize('admin', 'superAdmin'),
    contactController.getContactById
);

router.put(
    '/admin/:id/status',
    protect,
    authorize('admin', 'superAdmin'),
    validation({ body: updateContactStatusSchema }),
    contactController.updateContactStatus
);

router.delete(
    '/admin/:id',
    protect,
    authorize('admin', 'superAdmin'),
    contactController.deleteContact
);

export default router;
