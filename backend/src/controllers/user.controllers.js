import { User } from "../models/user.model"
import { uploadOnCloudinary } from "../utils/fileUpload"
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

        const avatarLocalPath=req.file?.avatar[0]?.path;
        const coverImageLocalPath=req.file?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new Error("Avatar Image is required")
        }

        const avatar=await uploadOnCloudinary(avatarLocalPath)
        const coverImage=await uploadOnCloudinary(coverImageLocalPath)

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

export {registerUser};