# Electronics Store Backend API

A comprehensive REST API for an electronics store built with Node.js, Express.js, and MongoDB. Supports bilingual content (English/Arabic), dynamic product attributes, and a complete admin dashboard.

## Features

### 🌐 Multi-Language Support
- Bilingual API (English & Arabic)
- Automatic language detection via `Accept-Language` header
- Localized responses for all content

### 🔐 Authentication & Authorization
- User registration and login with JWT
- Password reset via email verification code
- Role-based access control (User/Admin)
- Address management for users

### 📦 Product Catalog
- **Brands**: Manage product brands with images
- **Categories**: Dynamic category attributes schema
- **Products**: 
  - Flexible dynamic attributes per category
  - Multiple images support
  - Sale pricing
  - Stock management
  - Condition tracking (new/used)
  
### 🔍 Advanced Filtering
- Filter by brand, category, price range
- Filter by dynamic attributes (e.g., RAM, Color, Storage)
- Text search across product names
- Pagination support

### 🛒 Shopping Cart
- User-specific shopping carts
- Add/remove/update items
- Quantity management with stock validation
- Price snapshots at time of adding
- Support for product attributes
- Automatic total calculation

### 🛒 Shopping & Orders
- Complete order management system
- Multiple items per order
- Payment method selection
- Shipping address
- Order status tracking (pending, processing, shipped, delivered, cancelled)
- Admin order dashboard

### 💰 Offers & Discounts
- Time-based offers/promotions
- Discount percentage configuration
- Target specific products or categories
- Home page banner integration

### 🎨 Banner Management
- Singleton banner resource for homepage slider
- Multiple images/slides per banner
- Bilingual titles and subtitles (English/Arabic)
- Configurable display order
- Individual slide enable/disable
- Optional click-through links

### 💳 Payment Methods
- Configurable payment methods (Cash on Delivery, Bank Transfer, E-Wallets, etc.)
- Admin can add/update/remove methods
- Bilingual payment instructions

### 🏠 Home Page API
- Banner images for homepage slider
- Featured products
- Latest products
- Active offers and discounts

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Joi
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
src/
├── config/          # Database connection
├── controllers/     # Business logic
├── middlewares/     # Auth, error handling, language
├── models/          # Mongoose schemas
├── routes/          # API endpoints
├── utils/           # Helpers (email, localization)
└── validations/     # Joi schemas
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd DevelopmentWord_Store
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your secret key for JWT
- `EMAIL_*`: Email configuration for password reset

4. **Run the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Language Support
Include the `Accept-Language` header in requests:
- `Accept-Language: en` for English
- `Accept-Language: ar` for Arabic

Default is English if not specified.

### API Endpoints Summary

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset code
- `POST /auth/verify-code` - Verify reset code
- `POST /auth/reset-password` - Reset password

#### Users
- `GET /users/profile` - Get user profile (Protected)
- `POST /users/addresses` - Add address (Protected)
- `PUT /users/addresses/:addressId` - Update address (Protected)
- `DELETE /users/addresses/:addressId` - Delete address (Protected)

#### Brands
- `GET /brands` - Get all brands
- `GET /brands/:id` - Get single brand
- `POST /brands` - Create brand (Admin)
- `PUT /brands/:id` - Update brand (Admin)
- `DELETE /brands/:id` - Delete brand (Admin)

#### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get single category
- `POST /categories` - Create category (Admin)
- `PUT /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

#### Products
- `GET /products` - Get all products with filters
- `GET /products/:id` - Get single product
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

**Product Filters:**
- `?brand=<brandId>` - Filter by brand
- `?category=<categoryId>` - Filter by category
- `?minPrice=<number>` - Minimum price
- `?maxPrice=<number>` - Maximum price
- `?condition=new|used` - Product condition
- `?search=<text>` - Text search
- `?<attribute>=<value>` - Dynamic attributes (e.g., `?RAM=16GB`)

#### Orders
- `POST /orders` - Create order (Protected)
- `GET /orders/my-orders` - Get user's orders (Protected)
- `GET /orders/:id` - Get single order (Protected)
- `GET /orders/admin/all` - Get all orders (Admin)
- `PUT /orders/:id/status` - Update order status (Admin)

#### Offers
- `GET /offers` - Get active offers
- `GET /offers/:id` - Get single offer
- `POST /offers` - Create offer (Admin)
- `PUT /offers/:id` - Update offer (Admin)
- `DELETE /offers/:id` - Delete offer (Admin)

#### Payment Methods
- `GET /payment-methods` - Get active payment methods
- `GET /payment-methods/:id` - Get single payment method
- `POST /payment-methods` - Create payment method (Admin)
- `PUT /payment-methods/:id` - Update payment method (Admin)
- `DELETE /payment-methods/:id` - Delete payment method (Admin)

#### Banner
- `GET /banner` - Get the singleton banner
- `PUT /banner` - Update banner images (Admin)
- `POST /banner/initialize` - Initialize banner (Admin)

#### Home
- `GET /home` - Get home page data (banner, offers, featured & latest products)

### Example Request: Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }'
```

### Example Request: Get Products (Arabic)

```bash
curl -X GET "http://localhost:5000/api/v1/products?category=CATEGORY_ID&minPrice=100&maxPrice=500&RAM=16GB" \
  -H "Accept-Language: ar"
```

### Example Response Format

```json
{
  "success": true,
  "message": "Optional message",
  "count": 10,
  "data": { ... }
}
```

## Models Overview

### User
- Basic info (firstName, lastName, email, phone)
- Password (hashed)
- Multiple addresses
- Role (user/admin)

### Product
- Bilingual name and description
- Price and sale price
- Brand and Category references
- Multiple images
- Stock tracking
- **Dynamic attributes** (Map type for flexibility)

### Category
- Bilingual name
- Image
- **Attributes schema** (defines what fields products in this category can have)

### Order
- User reference
- Items with quantity and price at purchase
- Total amount
- Payment method
- Shipping address
- Status tracking

### Offer
- Bilingual title and description
- Banner image
- Discount percentage
- Target products/categories
- Valid date range

### Banner
- Singleton resource (one banner per application)
- Array of images/slides
- Each slide contains:
  - Image URL
  - Bilingual title and subtitle (optional)
  - Click-through link (optional)
  - Display order
  - Active status

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with middleware
- Role-based authorization
- Rate limiting (100 requests per 15 minutes per IP)
- Helmet for HTTP headers security
- CORS enabled

## Development

### Run in development mode
```bash
npm run dev
```

Uses nodemon for auto-restart on file changes.

## License

ISC

## Support

For support, email: your-email@example.com
