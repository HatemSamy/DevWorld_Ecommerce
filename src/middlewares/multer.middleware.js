import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

/**
 * File validation types
 */
export const fileValidation = {
    image: 'image', // Accepts all image formats (image/*)
    pdf: ['application/pdf'],
};

/**
 * Create multer middleware with custom file validation
 * @param {string|Array} customValidation - Mimetype pattern (e.g., 'image') or array of allowed MIME types
 * @returns {object} - Configured multer upload instance
 */
export function myMulter(customValidation = fileValidation.image) {
    const storage = multer.diskStorage({});

    function fileFilter(req, file, cb) {
        // If customValidation is a string like 'image', check if mimetype starts with it
        if (typeof customValidation === 'string') {
            if (file.mimetype.startsWith(`${customValidation}/`)) {
                cb(null, true);
            } else {
                cb(new ApiError(400, `Invalid file format. Only ${customValidation} files are allowed.`), false);
            }
        }
        // If customValidation is an array, check if mimetype is in the array
        else if (Array.isArray(customValidation)) {
            if (customValidation.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new ApiError(400, `Invalid file format. Allowed formats: ${customValidation.join(', ')}`), false);
            }
        } else {
            cb(new ApiError(400, 'Invalid file validation configuration'), false);
        }
    }

    const upload = multer({
        fileFilter,
        storage,
        limits: {
            fileSize: 15 * 1024 * 1024 
        }
    });

    return upload;
}
