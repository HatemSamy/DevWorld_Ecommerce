import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendPasswordResetEmail } from '../utils/email.util.js';
import { generateVerificationCode } from '../utils/helpers.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
        const message = existingUser.email === email
            ? 'Email already registered'
            : 'Phone number already registered';
        throw ApiError.badRequest(message);
    }

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ phone }).select('+password');

    if (!user) {
        throw ApiError.unauthorized('Invalid phone or password');
    }

    // Check if user is active
    if (!user.isActive) {
        throw ApiError.unauthorized('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid phone or password');
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        }
    });
});

/**
 * @desc    Forgot password - send verification code
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Generate 6-digit code
    const resetCode = generateVerificationCode();

    // Save code and expiry (10 minutes)
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email
    try {
        await sendPasswordResetEmail(email, resetCode);
    } catch (emailError) {
        console.error('Email send error:', emailError);
        throw ApiError.internal('Error sending email. Please try again later.');
    }

    res.status(200).json({
        success: true,
        message: 'Verification code sent to your email'
    });
});

/**
 * @desc    Verify reset code
 * @route   POST /api/v1/auth/verify-code
 * @access  Public
 */
export const verifyCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    const user = await User.findOne({
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired verification code');
    }

    res.status(200).json({
        success: true,
        message: 'Code verified successfully'
    });
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired verification code');
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully'
    });
});
