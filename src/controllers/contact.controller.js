import Contact from '../models/contact.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/pagination.util.js';

/**
 * @desc    Create new contact
 * @route   POST /api/v1/contacts
 * @access  Public
 */
export const createContact = asyncHandler(async (req, res) => {
    const { name, email, phone, purpose } = req.body;

    // Create contact
    const contact = await Contact.create({
        name,
        email,
        phone,
        purpose
    });

    res.status(201).json({
        success: true,
        message: 'Contact submission received successfully. We will get back to you soon.',
        data: {
            id: contact._id,
            name: contact.name,
            email: contact.email,
            createdAt: contact.createdAt
        }
    });
});

/**
 * @desc    Get all contacts
 * @route   GET /api/v1/contacts/admin/all
 * @access  Private/Admin
 */
export const getAllContacts = asyncHandler(async (req, res) => {
    const { page, size, status } = req.query;
    const { limit, skip } = paginate(page, size);

    // Build filter
    const filter = {};
    if (status) {
        filter.status = status;
    }

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
        success: true,
        count: contacts.length,
        total,
        page: Number(page) || 1,
        pages: Math.ceil(total / limit),
        data: contacts
    });
});

/**
 * @desc    Get single contact by ID
 * @route   GET /api/v1/contacts/admin/:id
 * @access  Private/Admin
 */
export const getContactById = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        throw ApiError.notFound('Contact not found');
    }

    res.status(200).json({
        success: true,
        data: contact
    });
});

/**
 * @desc    Update contact status
 * @route   PUT /api/v1/contacts/admin/:id/status
 * @access  Private/Admin
 */
export const updateContactStatus = asyncHandler(async (req, res) => {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        throw ApiError.notFound('Contact not found');
    }

    // Update fields if provided
    if (status) {
        contact.status = status;
    }
    if (adminNotes !== undefined) {
        contact.adminNotes = adminNotes;
    }

    await contact.save();

    res.status(200).json({
        success: true,
        message: 'Contact updated successfully',
        data: contact
    });
});

/**
 * @desc    Delete contact
 * @route   DELETE /api/v1/contacts/admin/:id
 * @access  Private/Admin
 */
export const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        throw ApiError.notFound('Contact not found');
    }

    await contact.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Contact deleted successfully'
    });
});
