import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api/v1`;
const DB_URI = process.env.DBURI || 'mongodb://localhost:27017/EduAcademy';

const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
    yellow: '\x1b[33m'
};

const log = (msg, type = 'info') => {
    if (type === 'success') console.log(`${COLORS.green}✔ ${msg}${COLORS.reset}`);
    else if (type === 'error') console.log(`${COLORS.red}✖ ${msg}${COLORS.reset}`);
    else console.log(`${COLORS.yellow}ℹ ${msg}${COLORS.reset}`);
};

const adminUser = {
    firstName: 'Test',
    lastName: 'Admin',
    email: 'testadmin@example.com',
    password: 'password123',
    phone: '+201000000000',
    role: 'admin'
};

let authToken = '';

async function setupAdmin() {
    try {
        await mongoose.connect(DB_URI);
        log('Connected to DB for setup');

        let user = await User.findOne({ email: adminUser.email });
        if (!user) {
            user = await User.create(adminUser);
            log('Admin user created successfully', 'success');
        } else {
            // Ensure role is admin
            if (user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
                log('Existing user promoted to admin', 'success');
            } else {
                log('Admin user already exists');
            }
        }
        await mongoose.disconnect();
    } catch (error) {
        log(`DB Setup Error: ${error.message}`, 'error');
        process.exit(1);
    }
}

async function runTests() {
    log(`Starting API Tests against ${BASE_URL}\n`);

    // 1. Login
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: adminUser.email,
                password: adminUser.password
            })
        });

        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.success) {
            authToken = loginData.data.token;
            log('Login: Success', 'success');
        } else {
            throw new Error(`Login failed: ${loginData.message}`);
        }
    } catch (e) {
        log(e.message, 'error');
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    // 2. Tests
    let createdBrandId = null;
    let createdCategoryId = null;
    let createdProductId = null;
    let createdOfferId = null;
    let createdPaymentMethodId = null;

    const tests = [
        // Health Check
        {
            name: 'Health Check',
            url: `http://localhost:${process.env.PORT || 5000}/health`,
            method: 'GET',
            public: true
        },
        // Auth - Public
        {
            name: 'Register User',
            url: `${BASE_URL}/auth/register`,
            method: 'POST',
            body: {
                firstName: 'Test',
                lastName: 'User',
                email: 'testuser@example.com',
                phone: '+201111111111',
                password: 'password123'
            },
            public: true
        },
        // Home & Public Endpoints
        {
            name: 'Get Home Data',
            url: `${BASE_URL}/home`,
            method: 'GET',
            public: true
        },
        {
            name: 'Get All Brands',
            url: `${BASE_URL}/brands`,
            method: 'GET',
            public: true
        },
        {
            name: 'Get All Categories',
            url: `${BASE_URL}/categories`,
            method: 'GET',
            public: true
        },
        {
            name: 'Get All Products',
            url: `${BASE_URL}/products`,
            method: 'GET',
            public: true
        },
        {
            name: 'Get All Offers',
            url: `${BASE_URL}/offers`,
            method: 'GET',
            public: true
        },
        {
            name: 'Get Payment Methods',
            url: `${BASE_URL}/payment-methods`,
            method: 'GET',
            public: true
        },
        // Admin - Create Brand
        {
            name: 'Create Brand (Admin)',
            url: `${BASE_URL}/brands`,
            method: 'POST',
            body: {
                name: { en: 'Test Brand', ar: 'ماركة تجريبية' },
                image: 'https://placehold.co/100'
            },
            saveId: (data) => createdBrandId = data?.data?.brand?._id || data?.data?._id
        },
        // Admin - Create Category
        {
            name: 'Create Category (Admin)',
            url: `${BASE_URL}/categories`,
            method: 'POST',
            body: {
                name: { en: 'Laptops', ar: 'أجهزة لابتوب' },
                attributes: [
                    { name: { en: 'RAM', ar: 'الذاكرة' }, type: 'string' },
                    { name: { en: 'Storage', ar: 'التخزين' }, type: 'string' },
                    { name: { en: 'Color', ar: 'اللون' }, type: 'string' }
                ]
            },
            saveId: (data) => createdCategoryId = data?.data?.category?._id || data?.data?._id
        },
        // Admin - Create Product
        {
            name: 'Create Product (Admin)',
            url: `${BASE_URL}/products`,
            method: 'POST',
            body: {
                name: { en: 'Test Laptop', ar: 'لابتوب تجريبي' },
                description: { en: 'A test laptop', ar: 'لابتوب تجريبي' },
                brand: createdBrandId || 'PLACEHOLDER',
                category: createdCategoryId || 'PLACEHOLDER',
                price: 999.99,
                images: ['https://placehold.co/300'],
                stock: 10,
                condition: 'new'
            },
            saveId: (data) => createdProductId = data?.data?.product?._id || data?.data?._id,
            skipIf: () => !createdBrandId || !createdCategoryId
        },
        // Admin - Create Offer
        {
            name: 'Create Offer (Admin)',
            url: `${BASE_URL}/offers`,
            method: 'POST',
            body: {
                title: { en: 'Test Offer', ar: 'عرض تجريبي' },
                description: { en: 'Test offer description', ar: 'وصف العرض التجريبي' },
                bannerImage: 'https://placehold.co/800x200',
                discountPercentage: 20,
                products: createdProductId ? [createdProductId] : [],
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            saveId: (data) => createdOfferId = data?.data?.offer?._id || data?.data?._id
        },
        // Admin - Create Payment Method
        {
            name: 'Create Payment Method (Admin)',
            url: `${BASE_URL}/payment-methods`,
            method: 'POST',
            body: {
                name: { en: 'Cash on Delivery', ar: 'الدفع عند الاستلام' },
                instructions: { en: 'Pay when you receive', ar: 'ادفع عند الاستلام' },
                isActive: true
            },
            saveId: (data) => createdPaymentMethodId = data?.data?.paymentMethod?._id || data?.data?._id
        },
        // User Profile
        {
            name: 'Get User Profile',
            url: `${BASE_URL}/users/profile`,
            method: 'GET'
        },
        // Get Single Resources
        {
            name: 'Get Brand by ID',
            url: `${BASE_URL}/brands/${createdBrandId || 'test'}`,
            method: 'GET',
            public: true,
            skipIf: () => !createdBrandId
        },
        {
            name: 'Get Category by ID',
            url: `${BASE_URL}/categories/${createdCategoryId || 'test'}`,
            method: 'GET',
            public: true,
            skipIf: () => !createdCategoryId
        },
        {
            name: 'Get Product by ID',
            url: `${BASE_URL}/products/${createdProductId || 'test'}`,
            method: 'GET',
            public: true,
            skipIf: () => !createdProductId
        }
    ];

    for (const test of tests) {
        try {
            // Skip test if condition is met
            if (test.skipIf && test.skipIf()) {
                log(`${test.name}: Skipped (prerequisites not met)`, 'info');
                continue;
            }

            // Prepare headers
            const testHeaders = { 'Content-Type': 'application/json' };
            if (!test.public && authToken) {
                testHeaders['Authorization'] = `Bearer ${authToken}`;
            }

            // Prepare body
            let body = test.body;
            if (body) {
                // Replace placeholders with actual IDs
                if (typeof body === 'object') {
                    body = JSON.parse(JSON.stringify(body));
                    if (body.brand === 'PLACEHOLDER' && createdBrandId) body.brand = createdBrandId;
                    if (body.category === 'PLACEHOLDER' && createdCategoryId) body.category = createdCategoryId;
                    if (Array.isArray(body.products) && body.products.length === 0 && createdProductId) {
                        body.products = [createdProductId];
                    }
                }
                body = JSON.stringify(body);
            }

            const options = {
                method: test.method,
                headers: testHeaders
            };

            if (body) options.body = body;

            const res = await fetch(test.url, options);
            const data = await res.json();

            if (res.ok) {
                log(`${test.name}: Success (${res.status})`, 'success');
                // Save ID if callback provided
                if (test.saveId && data) {
                    test.saveId(data);
                }
            } else {
                log(`${test.name}: Failed (${res.status}) - ${data.message || res.statusText}`, 'error');
                if (data.errors) {
                    log(`  Errors: ${JSON.stringify(data.errors)}`, 'error');
                }
            }
        } catch (e) {
            log(`${test.name}: Error - ${e.message}`, 'error');
        }
    }

    log('\n=== Test Summary ===', 'info');
    log(`Created Brand ID: ${createdBrandId || 'None'}`, 'info');
    log(`Created Category ID: ${createdCategoryId || 'None'}`, 'info');
    log(`Created Product ID: ${createdProductId || 'None'}`, 'info');
    log(`Created Offer ID: ${createdOfferId || 'None'}`, 'info');
    log(`Created Payment Method ID: ${createdPaymentMethodId || 'None'}`, 'info');
}

(async () => {
    await setupAdmin();
    await runTests();
})();
