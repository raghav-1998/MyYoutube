//require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import app from './app.js';

dotenv.config({
    path:'./.env'
})

//As async & await return a promise which is handle is by then
connectDB()
.then(()=>{
    //App is not connecting to db even after db get connected successfully
    app.on("error",(error)=>{
        console.log('Error:',error)
        process.exit(1)
    })
    
    // App is listening the db
    app.listen(process.env.PORT,()=>{
        console.log('App is listening on port',process.env.PORT)
    })
})
.catch((error)=>{
    console.log('Mongo DB connection failed',error)
})
/*
import express from "express"
const app=express();
( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        
        app.on("error",(error)=>{
            console.log("Error:",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }catch(error){
        console.log("Error:",error)
        throw error
    }
})()
*/


