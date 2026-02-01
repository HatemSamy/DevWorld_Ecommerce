import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { generateGuestId, isValidGuestId } from '../utils/guestId.util.js';

/**
 * Optional authentication middleware
 * Supports both authenticated users and guest users
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            req.isGuest = false;
        } catch (error) {
            req.isGuest = true;
        }
    } else {
        req.isGuest = true;
    }

    if (req.isGuest) {
        let guestId = req.headers['x-guest-id'];

        if (!guestId || !isValidGuestId(guestId)) {
            guestId = generateGuestId();
        }

        req.guestId = guestId;
        res.setHeader('x-guest-id', guestId);
    }

    next();
});
