import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to parse JSON string fields from form-data
 * Useful when sending nested objects through multipart/form-data
 * 
 * @param {string[]} fields - Array of field names to parse as JSON
 * @returns {Function} Express middleware function
 */
export const parseJsonFields = (fields = []) => {
    return (req, res, next) => {
        if (!req.body || typeof req.body !== 'object') {
            return next(ApiError.badRequest('Invalid request body'));
        }

        const fieldsToProcess = fields.length > 0 
            ? fields 
            : ['name', 'description', 'attributes', 'attributesSchema'];

        for (const field of fieldsToProcess) {
            if (req.body[field] && typeof req.body[field] === 'string') {
                try {
                    const parsed = JSON.parse(req.body[field]);
                    req.body[field] = parsed;
                } catch (parseError) {
                    // If JSON parsing fails, check if it's actually invalid JSON
                    // or just a regular string that shouldn't be parsed
                    const trimmed = req.body[field].trim();
                    
                    // If it looks like JSON (starts with { or [), it's likely a parsing error
                    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.length > 1) {
                        return next(
                            ApiError.unprocessableEntity(
                                `Invalid JSON format in field '${field}': ${parseError.message}`,
                                [{ field, message: parseError.message }]
                            )
                        );
                    }
                    // Otherwise, it's probably just a regular string - leave it as is
                    // This maintains backward compatibility
                }
            }
        }

        next();
    };
};

export const parseBilingualFields = parseJsonFields(['name', 'description']);

export const parseCategoryFields = parseJsonFields(['name', 'attributesSchema']);

export const parseProductFields = parseJsonFields(['name', 'description', 'attributes']);
