import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import connectDB from './src/config/database.js';
import languageMiddleware from './src/middlewares/language.middleware.js';
import errorHandler from './src/middlewares/error.middleware.js';
import swaggerSpec from './src/config/swagger.config.js';

// Route imports
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import brandRoutes from './src/routes/brand.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import productRoutes from './src/routes/product.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import offerRoutes from './src/routes/offer.routes.js';
import paymentMethodRoutes from './src/routes/paymentMethod.routes.js';
import homeRoutes from './src/routes/home.routes.js';
import bannerRoutes from './src/routes/banner.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import wishlistRoutes from './src/routes/wishlist.routes.js';
import governorateRoutes from './src/routes/governorate.routes.js';
import quotationRoutes from './src/routes/quotation.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import couponRoutes from './src/routes/coupon.routes.js';
import contactRoutes from './src/routes/contact.routes.js';



// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/governorates', governorateRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/contacts', contactRoutes);



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

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
