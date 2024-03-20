import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/fileUpload.js"
import jwt from "jsonwebtoken";


const generateAccessTokenAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    }
    catch(error){
        throw new Error("Something went wrong while generating Access & Refresh Token")
    }
}


const registerUser=async(req,res,next)=>{
    //get user detail from frontend
    //Validation 
    //Check if user already exist or not
    //check for images or avtar
    //upload them in cloudinary
    //create user object - entry in db
    //remove password & refresh token from response
    //check for user creation
    //return res

    try{
        //json or text format data can be fetched from req.body but url format cannot be fetched from req.body
        const {fullName,userName,email,password}=req.body
        //console.log("Email:",email);

        if([fullName,userName,email,password].some((field)=>field?.trim()==="")){
            throw new Error("All fields are required")
        }

        const existedUser=await User.findOne({
            $or:[{userName},{email}]
        })

        if(existedUser){
            throw new Error("User already exists")
        }

        //console.log(req.file)
        const avatarLocalPath=req.files?.avatar[0]?.path;
        const coverImageLocalPath=req.files?.coverImage[0]?.path;

        //console.log(avatarLocalPath)

        if(!avatarLocalPath){
            throw new Error("Avatar Image is required")
        }

        const avatar=await uploadOnCloudinary(avatarLocalPath)
        const coverImage=await uploadOnCloudinary(coverImageLocalPath)

        //console.log(avatar)

        if(!avatar){
            throw new Error("Avatar File is required")
        }

        const user= await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url||"",
            email,
            userName:userName.toLowerCase(),
            password
        })

        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new Error("Something went wrong while registering User")
        }

        return res.status(201).json({
            statusCode:200,
            data:createdUser,
            message:"User Created Successfully"
        })
    }
    catch(error){
        next(error)
    }
}

const loginUser=async(req,res,next)=>{
    //Get Login details from frontend
    //Check user exist
    //If exist, then check password
    //If password correct, then provide access token & refresh token
    // send it with cookies
    //send the response
    try{
        const {userName,email,password}=req.body;

        if(!userName && !email){
            throw new Error("Username or Email required")
        }

        /*
        User.findOne(userName) //Find user based on userName
        User.findOne(email)    //Find user based on email
        */

        const user=await User.findOne({
            $or:[{userName},{email}]
        })

        if(!user){
            throw new Error("User doesn't exist")
        }

        console.log(user)
        const isPasswordValid=await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new Error("Invalid User Credentials")
        }

        const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);

        const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

        const options={
            httpOnly:true,
            secure:true
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json({
            statusCode:201,
            data:{
                user:loggedInUser,accessToken,refreshToken
            },
            message:"User Logged In Successfully"
        })
    }
    catch(error){
        next(error)
    }
}

//Logout user
const logoutUser=async(req,res,next)=>{
    //clear the cookies
    //clear refresh token
    try{
        await User.findByIdAndUpdate(req.user._id,
            {
                $set:{
                    refreshToken:undefined
                },
            },
            {
                new:true
            }
        )
        
        const options={
            httpOnly:true,
            secure:true
        }

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json({
            statusCode:200,
            data:{},
            message:"User Logged Out Successfully"
        })

    }
    catch(error){
        next(error)
    }
}

const refreshAccessToken=async(req,res,next)=>{
    try{
        const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
        if(!incomingRefreshToken){
            throw new Error("Unauthorized Request")
        }

        try{
            const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
            const user=await User.findById(decodedToken?._id)

            if(!user){
                throw new Error("Invalid Refresh Token")
            }

            if(incomingRefreshToken!==user.refreshToken){
                throw new Error("Refresh Token is Expired or used")
            }

            const options={
                httpOnly:true,
                secure:true
            }
            
            const {accessToken,newRefreshToken} =await generateAccessTokenAndRefreshToken(user._id)

            return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json({
                statusCode:200,
                data:{accessToken,refreshToken:newRefreshToken},
                message:"Access Token refreshed"
            })
        }
        catch(error){
            throw new Error(error?.message||"Invalid Refresh Token")
        }
    }
    catch(error){
        next(error)
    }
}

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};