import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const MONGO_URL=process.env.MONGO_URL as string;

const connectDb=async ()=>{
    try{
        await mongoose.connect(MONGO_URL)
        console.log("Mongo db connected successfully")
    }catch(error){
      console.error("Mongodb connection error:",error)
      process.exit(1)
    }
}

export default connectDb