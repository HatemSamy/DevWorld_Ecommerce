/**
 * Async handler wrapper to eliminate try/catch blocks
 * Wraps async route handlers and automatically catches rejected promises
 * Forwards errors to the global error handling middleware
 * 
 * @param {Function} fn - Async controller function
 * @returns {Function} - Express middleware function
 * 
 * @example
 * export const getUsers = asyncHandler(async (req, res) => {
 *     const users = await User.find();
 *     res.json({ success: true, data: users });
 * });
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
