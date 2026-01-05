const dataMethod = ['body', 'params', 'query', 'headers'];

/**
 * Generic validation middleware
 * Validates request body, params, query, and headers against provided Joi schemas
 * 
 * @param {Object} Schema - Object containing Joi schemas for different request parts
 * @param {Object} Schema.body - Joi schema for request body
 * @param {Object} Schema.params - Joi schema for request params
 * @param {Object} Schema.query - Joi schema for request query
 * @param {Object} Schema.headers - Joi schema for request headers
 * @returns {Function} Express middleware function
 */
export const validation = (Schema) => {
    return (req, res, next) => {
        const validationArr = [];

        dataMethod.forEach(key => {
            if (Schema[key]) {
                const validationResult = Schema[key].validate(req[key], { abortEarly: false });
                if (validationResult?.error) {
                    validationArr.push(validationResult.error.details);
                }
            }
        });

        if (validationArr.length) {
            const errors = validationArr.flat().map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors
            });
        }

        next();
    };
};
