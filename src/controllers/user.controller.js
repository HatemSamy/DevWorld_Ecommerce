import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { paginate } from '../utils/pagination.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/v1/users/admin
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const { page, size } = req.query;
    const { limit, skip } = paginate(page, size);

    const users = await User.find()
        .select('_id firstName lastName email phone role isActive createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

    const total = await User.countDocuments();

    res.status(200).json({
        success: true,
        count: users.length,
        total,
        page: parseInt(page) || 1,
        pages: Math.ceil(total / limit),
        data: users
    });
});

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc    Add address to user
 * @route   POST /api/v1/users/addresses
 * @access  Private
 */
export const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: user.addresses
    });
});

/**
 * @desc    Update address
 * @route   PUT /api/v1/users/addresses/:addressId
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        throw ApiError.notFound('Address not found');
    }

    if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, req.body);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: user.addresses
    });
});

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/users/addresses/:addressId
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    user.addresses.pull(req.params.addressId);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        data: user.addresses
    });
});

/**
 * @desc    Update password
 * @route   PUT /api/v1/users/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw ApiError.badRequest('Current password and new password are required');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
        throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});
