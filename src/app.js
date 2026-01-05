import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import languageMiddleware from './middlewares/language.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
import swaggerSpec from './config/swagger.config.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import brandRoutes from './routes/brand.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import offerRoutes from './routes/offer.routes.js';
import paymentMethodRoutes from './routes/paymentMethod.routes.js';
import homeRoutes from './routes/home.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import cartRoutes from './routes/cart.routes.js';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Language middleware
app.use(languageMiddleware);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/payment-methods', paymentMethodRoutes);
app.use('/api/v1/home', homeRoutes);
app.use('/api/v1/banner', bannerRoutes);
app.use('/api/v1/cart', cartRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Electronics Store API Docs'
}));

// API Documentation JSON
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
