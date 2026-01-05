import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendPasswordResetEmail } from '../utils/email.util.js';
import { generateVerificationCode } from '../utils/helpers.util.js';

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Phone number already registered'
            });
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
        const jwtSecret = process.env.JWT_SECRET || process.env.tokenSignature || 'default-secret';
        const jwtExpires = process.env.JWT_EXPIRES_IN || '30d';
        const token = jwt.sign({ id: user._id }, jwtSecret, {
            expiresIn: jwtExpires
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
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ phone }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || process.env.tokenSignature || 'default-secret';
        const jwtExpires = process.env.JWT_EXPIRES_IN || '30d';
        const token = jwt.sign({ id: user._id }, jwtSecret, {
            expiresIn: jwtExpires
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
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password - send verification code
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
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
            return res.status(500).json({
                success: false,
                message: 'Error sending email. Please try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error) {
        next(error);
    }
};



/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { code, newPassword } = req.body;

        // Find user by reset code only
        const user = await User.findOne({
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
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
    } catch (error) {
        next(error);
    }
};
