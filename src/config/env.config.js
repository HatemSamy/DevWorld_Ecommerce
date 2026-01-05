/**
 * Environment configuration with fallbacks
 * Maps user-provided environment variables to expected names
 */
export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || process.env.MOOD || 'DEV',
    BASEURL: process.env.BASEURL || '/api/v1',
    MONGODB_URI: process.env.MONGODB_URI || process.env.DBURI || 'mongodb://localhost:27017/EduAcademy',
    DBURI: process.env.DBURI || process.env.MONGODB_URI || 'mongodb://localhost:27017/EduAcademy',
    SALTROUND: parseInt(process.env.SALTROUND) || 9,
    JWT_SECRET: process.env.JWT_SECRET || process.env.tokenSignature || 'default-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.office365.com',
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
    EMAIL_USER: process.env.EMAIL_USER || process.env.senderEmail || process.env.nodeMailerEmail,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || process.env.senderPassword || process.env.nodeMailerPassword,
    EMAIL_FROM: process.env.EMAIL_FROM || process.env.senderEmail,
    // Legacy support
    senderEmail: process.env.senderEmail,
    senderPassword: process.env.senderPassword,
    emailToken: process.env.emailToken,
    tokenSignature: process.env.tokenSignature,
    BearerKey: process.env.BearerKey,
    nodeMailerEmail: process.env.nodeMailerEmail,
    nodeMailerPassword: process.env.nodeMailerPassword
};

export default env;

