/**
 * Pagination utility
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Items per page (default: 20)
 * @returns {object} - Object with limit and skip for MongoDB queries
 */
export function paginate(page, size) {
    if (!page || page <= 0) {
        page = 1;
    }

    if (!size || size <= 0) {
        size = 20;
    }

    const skip = (page - 1) * size;
    return { limit: parseInt(size), skip: parseInt(skip) };
}
