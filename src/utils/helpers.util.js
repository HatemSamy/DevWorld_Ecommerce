/**
 * Generate 6-digit verification code
 */
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get localized field value based on request language
 */
export const getLocalizedField = (field, language = 'en') => {
    if (!field) return null;
    return field[language] || field.en || field.ar;
};

/**
 * Transform document to include only requested language
 */
export const localizeDocument = (doc, language = 'en') => {
    if (!doc) return null;

    const obj = doc.toObject ? doc.toObject() : doc;
    const localized = { ...obj };

    // Handle name field
    if (localized.name && typeof localized.name === 'object') {
        localized.name = getLocalizedField(localized.name, language);
    }

    // Handle description field
    if (localized.description && typeof localized.description === 'object') {
        localized.description = getLocalizedField(localized.description, language);
    }

    // Handle title field (for offers)
    if (localized.title && typeof localized.title === 'object') {
        localized.title = getLocalizedField(localized.title, language);
    }

    return localized;
};

/**
 * Localize array of documents
 */
export const localizeDocuments = (docs, language = 'en') => {
    if (!Array.isArray(docs)) return [];
    return docs.map(doc => localizeDocument(doc, language));
};
