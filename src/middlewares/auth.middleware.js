import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        console.log('=== AUTH MIDDLEWARE DEBUG ===');
        console.log('Authorization header:', req.headers.authorization);

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        console.log('Token extracted:', token);

        if (!token) {
            console.log('No token found!');
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Verify token
        const jwtSecret = process.env.JWT_SECRET || process.env.tokenSignature || 'default-secret';
        
        const decoded = jwt.verify(token, jwtSecret);
        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.log('User not found in database!');
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        next();
    } catch (error) {
        console.log('=== AUTH ERROR ===');
        console.log('Error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

/**
 * Admin authorization middleware
 */
export const admin = (req, res, next) => {

    if (req.user && req.user.role === 'admin') {
        console.log('Admin check passed!');
        next();
    } else {
        console.log('Admin check failed!');
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};
