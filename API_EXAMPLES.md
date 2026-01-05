# API Examples and Testing Guide

## Authentication Flow

### 1. Register a New User

**Request:**
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "ahmed@example.com",
  "phone": "+201234567890",
  "password": "ahmed123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed@example.com",
      "phone": "+201234567890",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**Request:**
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "ahmed123"
}
```

### 3. Add User Address

**Request:**
```bash
POST http://localhost:5000/api/v1/users/addresses
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "city": "Cairo",
  "street": "Tahrir Street",
  "building": "10",
  "floor": "3",
  "apartment": "5A",
  "isDefault": true
}
```

## Product Catalog

### 1. Create Brand (Admin)

**Request:**
```bash
POST http://localhost:5000/api/v1/brands
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": {
    "en": "Dell",
    "ar": "ديل"
  },
  "image": "https://example.com/dell-logo.png"
}
```

### 2. Create Category with Attributes Schema (Admin)

**Request:**
```bash
POST http://localhost:5000/api/v1/categories
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": {
    "en": "Laptops",
    "ar": "أجهزة لابتوب"
  },
  "image": "https://example.com/laptops.jpg",
  "attributesSchema": [
    {
      "name": "RAM",
      "type": "string",
      "required": true,
      "options": ["8GB", "16GB", "32GB"]
    },
    {
      "name": "Storage",
      "type": "string",
      "required": true,
      "options": ["256GB SSD", "512GB SSD", "1TB SSD"]
    },
    {
      "name": "Processor",
      "type": "string",
      "required": true
    }
  ]
}
```

### 3. Create Product with Dynamic Attributes (Admin)

**Request:**
```bash
POST http://localhost:5000/api/v1/products
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": {
    "en": "Dell XPS 15",
    "ar": "ديل اكس بي اس 15"
  },
  "description": {
    "en": "High performance laptop for professionals",
    "ar": "لابتوب عالي الأداء للمحترفين"
  },
  "price": 1500,
  "salePrice": 1350,
  "images": [
    "https://example.com/xps-1.jpg",
    "https://example.com/xps-2.jpg"
  ],
  "brand": "BRAND_ID_HERE",
  "category": "CATEGORY_ID_HERE",
  "stock": 10,
  "condition": "new",
  "attributes": {
    "RAM": "16GB",
    "Storage": "512GB SSD",
    "Processor": "Intel Core i7",
    "Screen": "15.6 inch 4K"
  },
  "isFeatured": true
}
```

### 4. Filter Products

**Get laptops with 16GB RAM, price between $1000-$2000:**
```bash
GET http://localhost:5000/api/v1/products?category=LAPTOP_CATEGORY_ID&RAM=16GB&minPrice=1000&maxPrice=2000
Accept-Language: en
```

**Get all Dell products (in Arabic):**
```bash
GET http://localhost:5000/api/v1/products?brand=DELL_BRAND_ID
Accept-Language: ar
```

## Orders

### 1. Create Order

**Request:**
```bash
POST http://localhost:5000/api/v1/orders
Authorization: Bearer USER_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "product": "PRODUCT_ID_1",
      "quantity": 1,
      "attributesSelected": {
        "RAM": "16GB",
        "Storage": "512GB SSD"
      }
    },
    {
      "product": "PRODUCT_ID_2",
      "quantity": 2
    }
  ],
  "paymentMethod": "PAYMENT_METHOD_ID",
  "shippingAddress": {
    "city": "Cairo",
    "street": "Tahrir Street",
    "building": "10",
    "floor": "3",
    "apartment": "5A"
  },
  "notes": "Please call before delivery"
}
```

### 2. Get User Orders

**Request:**
```bash
GET http://localhost:5000/api/v1/orders/my-orders
Authorization: Bearer USER_TOKEN
```

### 3. Update Order Status (Admin)

**Request:**
```bash
PUT http://localhost:5000/api/v1/orders/ORDER_ID/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "shipped"
}
```

## Offers & Discounts

### 1. Create Offer (Admin)

**Request:**
```bash
POST http://localhost:5000/api/v1/offers
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "title": {
    "en": "Black Friday Sale",
    "ar": "تخفيضات الجمعة السوداء"
  },
  "description": {
    "en": "Up to 50% off on selected items",
    "ar": "خصم حتى 50% على منتجات مختارة"
  },
  "bannerImage": "https://example.com/black-friday.jpg",
  "discountPercentage": 50,
  "products": ["PRODUCT_ID_1", "PRODUCT_ID_2"],
  "validFrom": "2024-11-24T00:00:00Z",
  "validUntil": "2024-11-30T23:59:59Z"
}
```

### 2. Get Active Offers

**Request:**
```bash
GET http://localhost:5000/api/v1/offers
Accept-Language: ar
```

## Banner Management

### 1. Get Banner (Public)

**Request:**
```bash
GET http://localhost:5000/api/v1/banner
Accept-Language: en
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "images": [
      {
        "_id": "...",
        "imageUrl": "https://example.com/banner1.jpg",
        "title": "Summer Sale",
        "subtitle": "Up to 70% Off",
        "linkUrl": "https://example.com/summer-sale",
        "displayOrder": 0,
        "isActive": true
      },
      {
        "_id": "...",
        "imageUrl": "https://example.com/banner2.jpg",
        "title": "New Arrivals",
        "subtitle": "Check out our latest products",
        "linkUrl": "https://example.com/new-arrivals",
        "displayOrder": 1,
        "isActive": true
      }
    ],
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 2. Update Banner (Admin)

**Request:**
```bash
PUT http://localhost:5000/api/v1/banner
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "images": [
    {
      "imageUrl": "https://example.com/banner1.jpg",
      "title": {
        "en": "Summer Sale",
        "ar": "تخفيضات الصيف"
      },
      "subtitle": {
        "en": "Up to 70% Off",
        "ar": "خصومات تصل إلى 70%"
      },
      "linkUrl": "https://example.com/summer-sale",
      "displayOrder": 0,
      "isActive": true
    },
    {
      "imageUrl": "https://example.com/banner2.jpg",
      "title": {
        "en": "New Arrivals",
        "ar": "وصل حديثاً"
      },
      "subtitle": {
        "en": "Check out our latest products",
        "ar": "تفقد أحدث منتجاتنا"
      },
      "linkUrl": "https://example.com/new-arrivals",
      "displayOrder": 1,
      "isActive": true
    }
  ],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "_id": "...",
    "images": [...],
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 3. Initialize Banner (Admin)

**Request:**
```bash
POST http://localhost:5000/api/v1/banner/initialize
Authorization: Bearer ADMIN_TOKEN
```

## Home Page

### Get Home Page Data

**Request:**
```bash
GET http://localhost:5000/api/v1/home
Accept-Language: en
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bannerImages": [
      {
        "_id": "...",
        "imageUrl": "https://example.com/banner1.jpg",
        "title": "Summer Sale",
        "subtitle": "Up to 70% Off",
        "linkUrl": "https://example.com/summer-sale",
        "displayOrder": 0,
        "isActive": true
      }
    ],
    "offers": [...],
    "featuredProducts": [...],
    "latestProducts": [...]
  }
}
```

## Payment Methods

### 1. Create Payment Method (Admin)

**Request:**
```bash
POST http://localhost:5000/api/v1/payment-methods
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": {
    "en": "Cash on Delivery",
    "ar": "الدفع عند الاستلام"
  },
  "description": {
    "en": "Pay when you receive your order",
    "ar": "ادفع عند استلام طلبك"
  },
  "type": "cash_on_delivery",
  "instructions": {
    "en": "Please have exact amount ready",
    "ar": "يرجى تجهيز المبلغ المطلوب بالضبط"
  }
}
```

## Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Add user address
- [ ] Create brand (as admin)
- [ ] Create category with attributes schema (as admin)
- [ ] Create product with dynamic attributes (as admin)
- [ ] Filter products by brand
- [ ] Filter products by category
- [ ] Filter products by price range
- [ ] Filter products by dynamic attributes (e.g., RAM)
- [ ] Create payment method (as admin)
- [ ] Create offer (as admin)
- [ ] Get banner (public)
- [ ] Update banner images (as admin)
- [ ] Get home page data (verify banner images included)
- [ ] Create order
- [ ] View user orders
- [ ] Update order status (as admin)
- [ ] Test password reset flow
- [ ] Test Arabic language responses

## Notes

- Replace `PRODUCT_ID`, `BRAND_ID`, `CATEGORY_ID`, etc. with actual MongoDB ObjectIds
- Use valid JWT tokens in Authorization headers
- Admin token can be obtained by creating a user and manually updating their role to 'admin' in the database
