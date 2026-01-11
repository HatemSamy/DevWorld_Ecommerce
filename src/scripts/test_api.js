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
    const tests = [
        {
            name: 'Get All Offers',
            url: `${BASE_URL}/offers`,
            method: 'GET'
        },
        {
            name: 'Get Home Data',
            url: `${BASE_URL}/home`,
            method: 'GET'
        },
        {
            name: 'Create Brand (Admin)',
            url: `${BASE_URL}/brands`,
            method: 'POST',
            body: {
                name: { en: 'Test Brand', ar: 'ماركة تجريبية' },
                image: 'https://placehold.co/100'
            }
        }
    ];

    for (const test of tests) {
        try {
            const options = {
                method: test.method,
                headers: test.body ? headers : { ...headers, 'Authorization': undefined } // Some might be public
            };

            // Add auth if we have a token and it's not explicitly public (assumption: mostly testing protected or using token to be safe)
            // Actually, let's just always send token if we have it, except where it might cause issues? No, Bearer usually fine.
            if (authToken) options.headers['Authorization'] = `Bearer ${authToken}`;

            if (test.body) options.body = JSON.stringify(test.body);

            const res = await fetch(test.url, options);
            const data = await res.json();

            if (res.ok) {
                log(`${test.name}: Success (${res.status})`, 'success');
            } else {
                log(`${test.name}: Failed (${res.status}) - ${data.message || res.statusText}`, 'error');
            }
        } catch (e) {
            log(`${test.name}: Error - ${e.message}`, 'error');
        }
    }
}

(async () => {
    await setupAdmin();
    await runTests();
})();
