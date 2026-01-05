/**
 * Language middleware - handles Accept-Language header
 * Supported languages: en (default), ar
 */
const languageMiddleware = (req, res, next) => {
    const acceptLanguage = req.headers['accept-language'];

    // Default to English
    let language = 'en';

    if (acceptLanguage) {
        // Extract the primary language from Accept-Language header
        const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();

        // Check if it's one of our supported languages
        if (primaryLang === 'ar') {
            language = 'ar';
        }
    }

    // Attach language to request object for use in controllers
    req.language = language;

    next();
};

export default languageMiddleware;
