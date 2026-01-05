/**
 * Middleware to parse JSON string fields from form-data
 * Useful when sending nested objects through multipart/form-data
 */
export const parseJsonFields = (fields = []) => {
    return (req, res, next) => {
        try {
            console.log('=== PARSE JSON FIELDS DEBUG ===');
            console.log('Fields to parse:', fields);
            console.log('req.body before parsing:', req.body);

            // If no specific fields provided, try to parse common fields
            const fieldsToProcess = fields.length > 0 ? fields : ['name', 'description', 'attributes', 'attributesSchema'];

            fieldsToProcess.forEach(field => {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    try {
                        req.body[field] = JSON.parse(req.body[field]);
                        console.log(`Parsed ${field}:`, req.body[field]);
                    } catch (e) {
                        console.log(`Failed to parse ${field}, keeping as string`);
                        // If parsing fails, leave as is
                        // It might not be a JSON string
                    }
                }
            });

            console.log('req.body after parsing:', req.body);
            next();
        } catch (error) {
            console.log('Parse error:', error);
            next(error);
        }
    };
};

/**
 * Helper middleware specifically for parsing bilingual fields
 */
export const parseBilingualFields = parseJsonFields(['name', 'description']);

/**
 * Helper middleware for category attributes
 */
export const parseCategoryFields = parseJsonFields(['name', 'attributesSchema']);

/**
 * Helper middleware for product attributes
 */
export const parseProductFields = parseJsonFields(['name', 'description', 'attributes']);
