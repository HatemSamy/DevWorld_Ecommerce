/**
 * Custom API Error class for handling application errors
 * @extends Error
 */
export class ApiError extends Error {
    /**
     * Create an ApiError
     * @param {number} status - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - Optional array of error details
     */
    constructor(status, message, errors = null) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.name = 'ApiError';

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Create a 400 Bad Request error
     * @param {string} message - Error message
     * @param {Array} errors - Optional validation errors
     * @returns {ApiError}
     */
    static badRequest(message = 'Bad Request', errors = null) {
        return new ApiError(400, message, errors);
    }

    /**
     * Create a 401 Unauthorized error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    /**
     * Create a 403 Forbidden error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    /**
     * Create a 404 Not Found error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static notFound(message = 'Not Found') {
        return new ApiError(404, message);
    }

    /**
     * Create a 409 Conflict error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }

    /**
     * Create a 422 Unprocessable Entity error
     * @param {string} message - Error message
     * @param {Array} errors - Optional validation errors
     * @returns {ApiError}
     */
    static unprocessableEntity(message = 'Unprocessable Entity', errors = null) {
        return new ApiError(422, message, errors);
    }

    /**
     * Create a 500 Internal Server Error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static internal(message = 'Internal Server Error') {
        return new ApiError(500, message);
    }
}

export default ApiError;
