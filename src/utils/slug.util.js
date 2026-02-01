/**
 * Generate a URL-safe slug from text
 * @param {String} text - Text to convert to slug
 * @returns {String} - URL-safe slug
 */
export const generateSlug = (text) => {
    if (!text) return '';

    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .substring(0, 100);
};

/**
 * Check if slug is unique and append suffix if needed
 * @param {Model} Product - Mongoose Product model
 * @param {String} baseSlug - Base slug to check
 * @param {String} productId - Product ID to exclude from uniqueness check
 * @returns {String} - Unique slug
 */
export const ensureUniqueSlug = async (Product, baseSlug, productId = null) => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };
        if (productId) {
            query._id = { $ne: productId };
        }

        const existingProduct = await Product.findOne(query);

        if (!existingProduct) {
            return slug;
        }

        if (counter === 1 && productId) {
            slug = `${baseSlug}-${productId.toString().slice(-6)}`;
        } else {
            slug = `${baseSlug}-${counter}`;
        }

        counter++;

        if (counter > 100) {
            throw new Error('Unable to generate unique slug after 100 attempts');
        }
    }
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {String} str - String to check
 * @returns {Boolean} - True if valid ObjectId
 */
export const isValidObjectId = (str) => {
    return /^[0-9a-fA-F]{24}$/.test(str);
};
