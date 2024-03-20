import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
export const verifyJWT=async(req,res,next)=>{
    try{
        try{
            console.log(req.header("Authorization"))
            const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
            //console.log(token)
            if(!token){
                throw new Error("Unauthorized Request")
            }

            const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
            //console.log(decodedToken)

            const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
            //console.log(user)

            if(!user){
                throw new Error("Invalid Access Token")
            }

            req.user=user
            next();
        }
        catch(error){
            console.log(error)
            throw new Error("Invalid Access Token")
        }
    }
    catch(error){
        next(error)
    }
}