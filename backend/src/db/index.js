import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//Create async & await function for connecting database
const connectDB=async()=>{
    //If DB connection is successful
    try{
        //console.log(`${process.env.MONGODB_URL}`)
        //const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`Connection Successful !! DB Host:${connectionInstance.connection.host}`)
    }
    //If connection is not successfull
    catch(error){
        console.log("Error:",error);
        //throw error;
        process.exit(1)  //Synchronously exit all process
    }
}

export default connectDB;