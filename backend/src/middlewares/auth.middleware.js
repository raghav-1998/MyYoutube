import jwt from "jsonwebtoken"
import { User } from "../models/user.model"
export const verifyJWT=async(req,res,next)=>{
    try{
        try{
            const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
            if(!token){
                throw new Error("Unauthorized Request")
            }

            const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

            const user=await User.findById(decodedToken?._id).select("-password -refreshToken")

            if(!user){
                throw new Error("Invalid Access Token")
            }

            req.user=user
            next();
        }
        catch(error){
            throw new Error("Invalid Access Token")
        }
    }
    catch(error){
        next(error)
    }
}