const express = require("express")
const {follow, following, followers, unfollow} = require("../Models/FollowModel")
const User = require("../Models/UserModel")


const FollowRouter = express.Router()
FollowRouter.post("/follow",async(req,res)=>{

    const {followingUserId} = req.body
    const followerUserId = req.session.user.userId
    console.log('body:',req.body)
    
    try {
        await User.verifyUserId({userId:followingUserId})
    } catch (error) {
        return res.send({
            status:400,
            message:"Trying to follow Unauthorized user",
            error:error
        })
    }
    try {
        await User.verifyUserId({userId:followerUserId})
    } catch (error) {
        return res.send({
            status:400,
            message:"Only authorized user can proceed",
            error:error
        })
    }

try{

    const followDb = await follow({followingUserId,followerUserId})

    return res.send({
        status:200,
        message:"Following",
        data:followDb 
    })

}
catch(error){
    console.log(error)
      return res.send({
        status:500,
        message:error
    })
}
 

})

FollowRouter.post("/following",async(req,res)=>{

    const {userId} = req.body
    const SKIP = parseInt( req.query.skip) || 0
    console.log('following:',req.body)
     try{ 
        const followingDb = await following({userId,SKIP}) 
         return res.send({ 
            status:200,
            message:"Following list fetched successfully",
            data: followingDb
        })
    }
    catch(error){
        return res.send({
            status:500,
            message:error  
        })
    }
})   

FollowRouter.post("/follower",async(req,res)=>{    

    const {userId} = req.body
    const SKIP = parseInt(req.query.skip) || 0
  
    try{
        const followersDb = await followers({userId,SKIP})           
 
         return res.send({
            status:200,
            message:"Follower list fetched successfully",
            data: followersDb 
        }) 
 
    }
    catch(error){   
        console.log(error)
        return res.send({
            status:500,
            message:error, 
            error:error
        })
    }
})

FollowRouter.post("/unfollow",async(req,res)=>{

    const followingUserId = req.body.followingUserId
    const followerUserId = req.session.user.userId

    try {
        await User.verifyUserId({userId:followingUserId})
    } catch (error) {
        return res.send({
            status:400,
            message:"Trying to unfollow Unauthorized user",
            error:error
        })
    }
    try {
        await User.verifyUserId({userId:followerUserId})
    } catch (error) {
        return res.send({
            status:400,
            message:"Only authorized user can proceed",
            error:error
        })
    }

    try{

        const followDb = await unfollow({followerUserId,followingUserId})

        return res.send({
            status:200,
            message:"Unfollow successfull",
            data:followDb
        })
    }
    catch(error){
        return res.send({
            status:500,
            message: "Something went wrong, please try again",
        })
    }
})

module.exports = FollowRouter