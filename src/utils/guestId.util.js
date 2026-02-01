import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique guest ID
 * @returns {String} - Guest ID in format: guest_{uuid}
 */
export const generateGuestId = () => {
    return `guest_${uuidv4()}`;
};

/**
 * Validate if a string is a valid guest ID
 * @param {String} guestId - Guest ID to validate
 * @returns {Boolean} - True if valid guest ID format
 */
export const isValidGuestId = (guestId) => {
    if (!guestId || typeof guestId !== 'string') {
        return false;
    }
    return /^guest_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guestId);
};
