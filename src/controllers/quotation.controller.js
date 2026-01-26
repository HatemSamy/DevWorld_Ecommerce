import Quotation from '../models/quotation.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/pagination.util.js';
import { getLocalizedField } from '../utils/helpers.util.js';

/**
 * @desc    Create new quotation
 * @route   POST /api/v1/quotations
 * @access  Public (supports both authenticated and guest users)
 */
export const createQuotation = asyncHandler(async (req, res) => {
    const { items, notes, userSnapshot } = req.body;

    // Determine if user is authenticated
    const isAuthenticated = !!req.user;
    let finalUserSnapshot;
    let userId = null;

    if (isAuthenticated) {
        // Authenticated user: auto-populate userSnapshot from user profile
        userId = req.user._id;

        // Use provided userSnapshot or create from user profile
        if (userSnapshot) {
            finalUserSnapshot = userSnapshot;
        } else {
            finalUserSnapshot = {
                fullName: `${req.user.firstName} ${req.user.lastName}`,
                email: req.user.email,
                phone: req.user.phone
            };
        }
    } else {
        // Guest user: require userSnapshot in request
        if (!userSnapshot) {
            throw ApiError.badRequest('User information (fullName, email, phone) is required for guest quotations');
        }

        // Validate userSnapshot completeness
        if (!userSnapshot.fullName || !userSnapshot.email || !userSnapshot.phone) {
            throw ApiError.badRequest('User snapshot must include fullName, email, and phone');
        }

        finalUserSnapshot = userSnapshot;
    }

    // Process items and create snapshots
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
        // Validate product exists
        const product = await Product.findById(item.product);
        if (!product) {
            throw ApiError.notFound(`Product with ID ${item.product} not found`);
        }

        // Check if product is active
        if (!product.isActive) {
            throw ApiError.badRequest(`Product "${product.name.en}" is not available`);
        }

        // Create item with snapshots
        const totalItemPrice = product.price * item.quantity;

        processedItems.push({
            product: product._id,
            productNameSnapshot: {
                en: product.name.en,
                ar: product.name.ar
            },
            unitPriceSnapshot: product.price,
            quantity: item.quantity,
            totalItemPrice
        });

        subtotal += totalItemPrice;
    }

    // Create quotation
    const quotation = await Quotation.create({
        user: userId,
        userSnapshot: finalUserSnapshot,
        items: processedItems,
        subtotal,
        notes: notes || ''
    });

    // Populate products for response
    await quotation.populate('items.product', 'name images price description');

    // Get language from request (set by language middleware)
    const language = req.language || 'en';

    // Format response with flattened and localized product info
    const response = {
        quotationCode: quotation.quotationCode,
        date: quotation.createdAt,
        userSnapshot: quotation.userSnapshot,
        items: quotation.items.map(item => ({
            productId: item.product._id,
            productName: getLocalizedField(item.product.name, language),
            productDescription: getLocalizedField(item.product.description, language),
            productPrice: item.product.price,
            productImages: item.product.images,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceSnapshot,
            totalItemPrice: item.totalItemPrice
        })),
        subtotal: quotation.subtotal,
        notes: quotation.notes
    };

    res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        data: response
    });
});

/**
 * @desc    Get user's quotations
 * @route   GET /api/v1/quotations/my-quotations
 * @access  Private
 */
export const getMyQuotations = asyncHandler(async (req, res) => {
    const { page, size } = req.query;
    const { limit, skip } = paginate(page, size);

    const quotations = await Quotation.find({ user: req.user._id })
        .populate('items.product', 'name images price description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Quotation.countDocuments({ user: req.user._id });

    // Get language from request
    const language = req.language || 'en';

    // Format quotations list with localized product info
    const formattedQuotations = quotations.map(quotation => ({
        id: quotation._id,
        quotationCode: quotation.quotationCode,
        date: quotation.createdAt,
        itemCount: quotation.items.length,
        items: quotation.items.map(item => ({
            productId: item.product._id,
            productName: getLocalizedField(item.product.name, language),
            productDescription: getLocalizedField(item.product.description, language),
            productPrice: item.product.price,
            productImages: item.product.images,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceSnapshot,
            totalItemPrice: item.totalItemPrice
        })),
        subtotal: quotation.subtotal,
        notes: quotation.notes
    }));

    res.status(200).json({
        success: true,
        count: formattedQuotations.length,
        total,
        page: Number(page) || 1,
        pages: Math.ceil(total / limit),
        data: formattedQuotations
    });
});

/**
 * @desc    Get single quotation details
 * @route   GET /api/v1/quotations/:id
 * @access  Private (User: own quotations only, Admin: all quotations)
 */
export const getQuotation = asyncHandler(async (req, res) => {
    const quotation = await Quotation.findById(req.params.id)
        .populate('items.product', 'name images price description');

    if (!quotation) {
        throw ApiError.notFound('Quotation not found');
    }

    // Authorization check
    const isAdmin = req.user.role === 'admin';
    const isOwner = quotation.user && quotation.user.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
        throw ApiError.forbidden('Not authorized to access this quotation');
    }

    // Get language from request
    const language = req.language || 'en';

    // Format response with localized product info
    const response = {
        id: quotation._id,
        quotationCode: quotation.quotationCode,
        date: quotation.createdAt,
        userSnapshot: quotation.userSnapshot,
        items: quotation.items.map(item => ({
            productId: item.product._id,
            productName: getLocalizedField(item.product.name, language),
            productDescription: getLocalizedField(item.product.description, language),
            productPrice: item.product.price,
            productImages: item.product.images,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceSnapshot,
            totalItemPrice: item.totalItemPrice
        })),
        subtotal: quotation.subtotal,
        notes: quotation.notes,
        createdAt: quotation.createdAt,
        updatedAt: quotation.updatedAt
    };

    res.status(200).json({
        success: true,
        data: response
    });
});

/**
 * @desc    Update quotation
 * @route   PUT /api/v1/quotations/:id
 * @access  Private (User: own quotations only, Admin: any quotation)
 */
export const updateQuotation = asyncHandler(async (req, res) => {
    const { items, notes } = req.body;

    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
        throw ApiError.notFound('Quotation not found');
    }

    // Authorization check
    const isAdmin = req.user.role === 'admin';
    const isOwner = quotation.user && quotation.user.toString() === req.user._id.toString();

    // Users can only update their own quotations, admins can update any
    if (!isOwner && !isAdmin) {
        throw ApiError.forbidden('Not authorized to update this quotation');
    }

    // Update items if provided
    if (items && items.length > 0) {
        let newSubtotal = 0;
        const processedItems = [];

        for (const item of items) {
            // Validate product exists
            const product = await Product.findById(item.product);
            if (!product) {
                throw ApiError.notFound(`Product with ID ${item.product} not found`);
            }

            // Check if product is active (only for users, admins can add inactive products)
            if (!isAdmin && !product.isActive) {
                throw ApiError.badRequest(`Product "${product.name.en}" is not available`);
            }

            // Create new snapshot with current product data
            const totalItemPrice = product.price * item.quantity;

            processedItems.push({
                product: product._id,
                productNameSnapshot: {
                    en: product.name.en,
                    ar: product.name.ar
                },
                unitPriceSnapshot: product.price,
                quantity: item.quantity,
                totalItemPrice
            });

            newSubtotal += totalItemPrice;
        }

        quotation.items = processedItems;
        quotation.subtotal = newSubtotal;
    }

    // Update notes if provided
    if (notes !== undefined) {
        quotation.notes = notes;
    }

    await quotation.save();

    // Populate products before returning
    await quotation.populate('items.product', 'name images price description');

    // Get language from request
    const language = req.language || 'en';

    // Format response with localized product info
    const response = {
        id: quotation._id,
        quotationCode: quotation.quotationCode,
        date: quotation.createdAt,
        userSnapshot: quotation.userSnapshot,
        items: quotation.items.map(item => ({
            productId: item.product._id,
            productName: getLocalizedField(item.product.name, language),
            productDescription: getLocalizedField(item.product.description, language),
            productPrice: item.product.price,
            productImages: item.product.images,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceSnapshot,
            totalItemPrice: item.totalItemPrice
        })),
        subtotal: quotation.subtotal,
        notes: quotation.notes,
        updatedAt: quotation.updatedAt
    };

    res.status(200).json({
        success: true,
        message: 'Quotation updated successfully',
        data: response
    });
});

/**
 * @desc    Get all quotations (Admin)
 * @route   GET /api/v1/quotations/admin/all
 * @access  Private/Admin
 */
export const getAllQuotations = asyncHandler(async (req, res) => {
    const { page, size, startDate, endDate } = req.query;
    const { limit, skip } = paginate(page, size);

    const query = {};

    // Optional date range filter
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const quotations = await Quotation.find(query)
        .populate('user', 'firstName lastName email phone')
        .populate('items.product', 'name images price description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Quotation.countDocuments(query);

    // Get language from request
    const language = req.language || 'en';

    // Format quotations for admin dashboard with localized product info
    const formattedQuotations = quotations.map(quotation => ({
        id: quotation._id,
        quotationCode: quotation.quotationCode,
        date: quotation.createdAt,
        user: quotation.user ? {
            id: quotation.user._id,
            name: `${quotation.user.firstName} ${quotation.user.lastName}`,
            email: quotation.user.email,
            phone: quotation.user.phone
        } : null,
        userSnapshot: quotation.userSnapshot,
        isGuest: !quotation.user,
        itemCount: quotation.items.length,
        items: quotation.items.map(item => ({
            productId: item.product._id,
            productName: getLocalizedField(item.product.name, language),
            productDescription: getLocalizedField(item.product.description, language),
            productPrice: item.product.price,
            productImages: item.product.images,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceSnapshot,
            totalItemPrice: item.totalItemPrice
        })),
        subtotal: quotation.subtotal
    }));

    res.status(200).json({
        success: true,
        count: formattedQuotations.length,
        total,
        page: Number(page) || 1,
        pages: Math.ceil(total / limit),
        data: formattedQuotations
    });
});
