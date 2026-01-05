// import mongoose from 'mongoose'
// const connectDB  = async ()=>{
//     return await mongoose.connect(process.env.MONGODB_URI)
//     .then(res=>console.log(`DB Connected successfully on .........${process.env.MONGODB_URI} `))
//     .catch(err=>console.log(` Fail to connect  DB.........${err} `))
// }


// export default connectDB;


import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("DB Connected successfully");
    })
    .catch((err) => {
      console.error("Fail to connect DB:", err.message);
      throw err;
    });
};

export default connectDB;
