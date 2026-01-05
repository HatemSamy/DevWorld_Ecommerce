import multer from 'multer';

/**
 * File validation types
 */
export const fileValidation = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
    pdf: ['application/pdf'],
};

/**
 * Create multer middleware with custom file validation
 * @param {Array} customValidation - Array of allowed MIME types
 * @returns {object} - Configured multer upload instance
 */
export function myMulter(customValidation = fileValidation.image) {
    const storage = multer.diskStorage({});

    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb('invalid format', false);
        }
    }

    const upload = multer({
        fileFilter,
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    return upload;
}
