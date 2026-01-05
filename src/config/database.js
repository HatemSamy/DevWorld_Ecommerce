import mongoose from 'mongoose'
const connectDB  = async ()=>{
    return await mongoose.connect(process.env.MONGODB_URI)
    .then(res=>console.log(`DB Connected successfully on .........${process.env.MONGODB_URI} `))
    .catch(err=>console.log(` Fail to connect  DB.........${err} `))
}


export default connectDB;