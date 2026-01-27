import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Create a new admin account
 * @route   POST /api/v1/admin
 * @access  Private/Admin
 */
export const createAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if admin with email or phone already exists
    const existingAdmin = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (existingAdmin) {
        const message = existingAdmin.email === email
            ? 'Email already registered'
            : 'Phone number already registered';
        throw ApiError.conflict(message);
    }

    // Create admin user
    const admin = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password, // Will be hashed by User model pre-save hook
        role: 'admin'
    });

    // Return response without password
    res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt
        }
    });
});

/**
 * @desc    Get all admin accounts
 * @route   GET /api/v1/admin
 * @access  Private/Admin
 */
export const getAllAdmins = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, isActive, search } = req.query;

    // Build query filter
    const query = { role: 'admin' };

    // Filter by active status if provided
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    // Search by name or email
    if (search && search.trim()) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count and admins
    const [total, admins] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
            .select('firstName lastName email phone role isActive addresses createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
    ]);

    res.status(200).json({
        success: true,
        count: admins.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: admins
    });
});

/**
 * @desc    Get admin account by ID
 * @route   GET /api/v1/admin/:id
 * @access  Private/Admin
 */
export const getAdminById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const admin = await User.findById(id)
        .select('firstName lastName email phone role isActive addresses createdAt');

    if (!admin) {
        throw ApiError.notFound('Admin not found');
    }

    // Verify it's actually an admin
    if (admin.role !== 'admin') {
        throw ApiError.notFound('Admin not found');
    }

    res.status(200).json({
        success: true,
        data: admin
    });
});

/**
 * @desc    Update admin account details
 * @route   PUT /api/v1/admin/:id
 * @access  Private/Admin
 */
export const updateAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    // Find admin
    const admin = await User.findById(id);

    if (!admin) {
        throw ApiError.notFound('Admin not found');
    }

    // Verify it's actually an admin
    if (admin.role !== 'admin') {
        throw ApiError.notFound('Admin not found');
    }

    // Check for duplicate email or phone (excluding current admin)
    if (email || phone) {
        const existingUser = await User.findOne({
            _id: { $ne: id },
            $or: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : [])
            ]
        });

        if (existingUser) {
            const message = existingUser.email === email
                ? 'Email already in use'
                : 'Phone number already in use';
            throw ApiError.conflict(message);
        }
    }

    // Update fields
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    await admin.save();

    // Return updated admin without sensitive data
    const updatedAdmin = await User.findById(id)
        .select('-password -resetPasswordCode -resetPasswordExpires');

    res.status(200).json({
        success: true,
        message: 'Admin account updated successfully',
        data: updatedAdmin
    });
});

/**
 * @desc    Delete admin account (permanent delete)
 * @route   DELETE /api/v1/admin/:id
 * @access  Private/Admin
 */
export const deactivateAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const admin = await User.findById(id);

    if (!admin) {
        throw ApiError.notFound('Admin not found');
    }

    // Verify it's actually an admin
    if (admin.role !== 'admin') {
        throw ApiError.notFound('Admin not found');
    }

    // Permanently delete the admin
    await User.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Admin account deleted successfully',
        data: {
            id: admin._id
        }
    });
});
