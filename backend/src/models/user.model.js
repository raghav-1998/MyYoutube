import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Used for hashing the password
import jwt from "jsonwebtoken";

const userSchema= new mongoose.Schema(
    {
        userName:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        fullName:{
            type:String,
            required:true,
            lowercase:true,
            index:true
        },
        avatar:{
            type:String,  //3rd Party service(cloudinary) url
            required:true
        },
        coverImage:{
            type:String  //3rd Party service(cloudinary) url
        },
        watchHistory:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        password:{
            type:String,
            required:true
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        return next();
    }
    this.password=bcrypt.hash(this.password,10);
    next();
})

//Custom method for comparing password
userSchema.method.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.method.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.method.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
export const User=mongoose.model("User",userSchema);