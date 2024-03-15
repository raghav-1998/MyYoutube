//Creating the Express App

import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app= express();
var corsOption={
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
app.use(cors(corsOption))// Passing the options to configure CORS

app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))

//import routers
import userRouter from "./routes/user.routes.js";

//app.use('/user',userRouter)
app.use('/api/v1/user',userRouter)   //Standard Industry Practice
export default app;