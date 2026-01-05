// import mongoose from 'mongoose'
// const connectDB  = async ()=>{
//     return await mongoose.connect(process.env.MONGODB_URI)
//     .then(res=>console.log(`DB Connected successfully on .........${process.env.MONGODB_URI} `))
//     .catch(err=>console.log(` Fail to connect  DB.........${err} `))
// }


// export default connectDB;


import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = () => {
    if (cached.conn) return Promise.resolve(cached.conn);

    if (!cached.promise) {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        cached.promise = mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
    }

    return cached.promise.then((conn) => {
        cached.conn = conn;
        console.log("✅ MongoDB connected");
        return conn;
    });
};

export default connectDB;
