const express = require("express")
const bcrypt = require("bcrypt");
const {cleanUpAndValidate, loginValidation} = require("../Utils/AuthUtils")
const UserSchema = require("../Schemas/UserSchema")
const User = require("../Models/UserModel");
const SessionSchema = require("../Schemas/SessionSchema");
const uploadFiles = require("../Utils/FileUtils");
const Blog = require("../Models/BlogModel");

const AuthRouter = express.Router()

AuthRouter.post("/register",async(req,res)=>{
const {name,username,email,password} = req.body
const update = false

try{
    await cleanUpAndValidate({ name, username, email, password,update})
 }
catch(error){
 return res.send({
    status:400,
    message:error,
    error:"Data issue"
})
}

try{

    await User.findUsernameOrEmailExist({ email, username })
    const userObj = new User({ name, username, email, password})

    const userDb = await userObj.registerUser()

    return res.send({
        status:201,
        message:"User created successfully",
    })
}
catch(error){
    console.log(error)
    return res.send({ 
        status:500,
        message: "Something went wrong,please try again",
        error:error,
    }) 
}
})

AuthRouter.post("/login",async(req,res)=>{
    
   const {loginId,password} = req.body

   try{
    await loginValidation({loginId,password})
   }
   catch(error){
    return res.send( {status:400,
        message:error,
        error:"Data issue"
    })
   }
   
let userDb={}
   try{
     userDb = await User.findRegisteredEmailOrUsername({loginId})
   }
   catch(error){
    return res.send( {status:400,
        message:error,
        error:"Data issue"
    })
   }
   try{
    
    const isMatch = await bcrypt.compare(password,userDb.password)

        if(!isMatch){
            return res.send({
                status:400,
                message:"Password does not match"
            })
        }
     
        req.session.isAuth=true
        req.session.user={
            userId:userDb._id,
            email:userDb.email,
            username:userDb.username
        }

     return res.send({  
        status:200,  
        message:"login successful",
        data: {
        userId: userDb._id,
        name: userDb.name,
        username: userDb.username,
        bio:userDb.bio,
        niche:userDb.niche,
        profileImg:userDb.profileImg,
        followingsCount:userDb.followingsCount,
        followersCount:userDb.followersCount,
        },
    })
 
   }
   catch(error){      
    console.log(error)
     return res.send({
        status:500,
        message:error,
        error:"Something went wrong, please try again",
    })
   }
     
})

AuthRouter.post('/user/:userId',async(req,res)=>{

    const userId = req.params.userId
 
    try {
        
        const userDb = await User.verifyUserId({userId})

        return res.send({  
            status:200,  
            data: {
            userId: userDb._id,
            name: userDb.name,
            username: userDb.username,
            bio:userDb.bio,
            niche:userDb.niche,
            profileImg:userDb.profileImg,
            followingsCount:userDb.followingsCount,
            followersCount:userDb.followersCount,
            },
        })
    } catch (error) {
        
        return res.send({
            status:500,
            message:'Something went wrong,please try again'
        })
    }
})

AuthRouter.patch('/edit-profile/:username',async(req,res)=>{
  
     const userId = req.session.user?.userId

    const {name,username,profileImg, bio, niche} = req.body
 
    const update = true
    try{
        await cleanUpAndValidate({ name, username,update,bio,niche})  
    }
    catch(error){
         return res.send({
            status:400,
            message:error
        })
    }

    try {

        const userDb = await User.verifyUserId({userId})
        const email=userDb.email
        const password=userDb.password

        const updatedProfile = await User.editProfile({userId, name, username, email, password, bio, niche, profileImg});
         
        console.log('profile update',updatedProfile)
         return res.send({
            status:200,
            message:'Profile updated!',
            data: {
                userId: updatedProfile._id,
                name: updatedProfile.name,
                username: updatedProfile.username,
                 bio:updatedProfile.bio,
                niche:updatedProfile.niche,
                profileImg:updatedProfile.profileImg,
                followingsCount:updatedProfile.followingsCount,
                followersCount:updatedProfile.followersCount,
                },
        })
        
      } catch (error) {
        console.log(error)
        return res.send({
            status:500,
            message: "Something went wrong, please try again",
        })
      }
    
    // try {
    //     const userProfile = await Blog.myBlogs({SKIP,userId})
        
    //     console.log("userprofile",userProfile)
    //     return res.send({
    //         status:200,
    //         message:'Read success',
    //         data:userProfile,
    //         isAuth:true  
    //     })
    // } catch (error) {
    //     console.log(error)
    //     return res.send({
    //         status:500,
    //         message:'Database error',
    //         error:error
    //     })
    // }
})

AuthRouter.post("/logout",async(req,res)=>{
 
   req.session.destroy((err)=>{

    if(err) {
        return res.send({
            status:500,
        message:"Logout unsuccessful",
        error:err
        })
    }
   })
   
    return res.send({status:200,
        message:"Logout successful",
    })
})
  
AuthRouter.post("/logout_from_all_devices",async(req,res)=>{
const username = req.session.user.username

try{
    const deleteSessionCount = await SessionSchema.deleteMany({"session.user.username":username})
console.log(deleteSessionCount)
    return res.send({
        status:200,
        message:"Logged out from all devices successfully",
        data:deleteSessionCount
    })
} 
catch(error){
    return res.send({
        status:500,
        message:"Something went wrong,please try again",
        error:error
    })
}

})

// User.deleteUsers()

module.exports = AuthRouter