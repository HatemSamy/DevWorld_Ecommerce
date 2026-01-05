import mongoose from 'mongoose';

/**
 * Global cached connection for serverless environments
 * This prevents creating multiple connections in serverless functions
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with connection caching and proper error handling
 * Works for both traditional servers and serverless environments (Vercel, AWS Lambda, etc.)
 */
const connectDB = async () => {
    // Return existing connection if available
    if (cached.conn) {
        console.log('📦 Using cached database connection');
        return cached.conn;
    }

    // Validate MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('❌ MONGODB_URI is not defined in environment variables');
    }

    // Create new connection if no existing promise
    if (!cached.promise) {
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10,
            minPoolSize: 2,
        };

        cached.promise = mongoose.connect(MONGODB_URI, options)
            .then((mongooseInstance) => {
                console.log('✅ MongoDB connected successfully');
                return mongooseInstance;
            })
            .catch((error) => {
                cached.promise = null; // Reset on error
                console.error('❌ MongoDB connection error:', error.message);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
};

/**
 * Connection event listeners for monitoring
 */
mongoose.connection.on('connected', () => {
    console.log('🔌 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
});

/**
 * Graceful shutdown for traditional servers
 */
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('🛑 MongoDB connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
});

export default connectDB;


