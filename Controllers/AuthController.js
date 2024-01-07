const express = require("express")
const bcrypt = require("bcrypt");

const AuthRouter = express.Router()
const {cleanUpAndValidate, loginValidation} = require("../Utils/AuthUtils")
const UserSchema = require("../Schemas/UserSchema")
const User = require("../Models/UserModel");
const SessionSchema = require("../Schemas/SessionSchema");
 



AuthRouter.post("/register",async(req,res)=>{
const {name,username,email,password} = req.body

try{
    await cleanUpAndValidate({name,username,email,password})
}
catch(error){
    console.log(error)
return res.send({
    status:400,
    message:"Data issue",
    error:error
})
}


try{

    await User.findUsernameOrEmailExist({ email, username })

    const userObj = new User({name,username,email,password})

    const userDb = await userObj.registerUser()

    return res.send({
        status:201,
        message:"User created successfully",
        data:userDb
    })
}
catch(error){
    return res.send({
        status:500,
        message:"Data issue",
        error:error
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
        message:"Data issue",
        error:error})
   }

   try{
    const userDb = await User.findRegisteredEmailOrUsername({loginId,password})

    const isMatch = bcrypt.compare(password,userDb.password)

        if(!isMatch){
            return res.send({
                status:400,
                message:"Password does not match"
            })
        }
    
        //session base auth
req.session.isAuth=true
req.session.user={
    userId:userDb._id,
    email:userDb.email,
    username:userDb.username
}

// const responseData = {
//     user:{
//         email:userDb.email,
//         username:userDb.username
//     },
//     blogs:{
//         blog:userDb.blogs
//     }
// }
    return res.send({
        status:200,
        message:"login successful",
    })

   }
   catch(error){
    console.log(error)
    return res.send({
        status:500,
        message:"Database issue",
        error:error
    })
   }
     
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

// AuthRouter.post("/logout_from_all_devices",async(req,res)=>{
// const username = req.session.user.username

// try{

//     const deleteSessionCount = await SessionSchema.deleteMany({"session.user.usernam":username})
// console.log(deleteSessionCount)
//     return res.send({
//         status:200,
//         message:"Logged out from all devices successfully",
//         data:deleteSessionCount
//     })
// }
// catch(error){
//     return res.send({
//         status:500,
//         message:"Database error",
//         error:error
//     })
// }

// })

module.exports = AuthRouter