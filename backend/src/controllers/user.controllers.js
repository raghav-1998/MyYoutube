const registerUser=async(req,res,next)=>{
    try{
        res.status(201).json({
            message:"User Registered Successfully"
        })
    }
    catch(error){
        next(error)
    }
}

export {registerUser};