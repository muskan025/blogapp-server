const express = require("express")
const {follow, following, followers, unfollow} = require("../Models/FollowModel")
const User = require("../Models/UserModel")
const FollowRouter = express.Router()


FollowRouter.post("/follow",async(req,res)=>{

    const followingUserId = req.body.followingUserId
    const followerUserId = req.session.user.userId

    //verify users Ids

    try {
        await User.verifyUserId({userId:followingUserId})
    } catch (error) {
        return res.send({
            status:400,
            data:"Invalid following User Id",
            error:error
        })
    }
    try {
        await User.verifyUserId({userId:followerUserId})
    } catch (error) {
        return res.send({
            status:400,
            data:"Invalid follower User Id",
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
        message:"Database error",
        error:error
    })
}
 

})

//get following list of a particular user
FollowRouter.get("/following",async(req,res)=>{

    const followerUserId = req.session.user.userId
    const SKIP = parseInt( req.query.skip) || 0


    try{
        const followingDb = await following({followerUserId,SKIP})

        return res.send({
            status:200,
            message:"Following list fetched successfully",
            data:followingDb
        })

    }
    catch(error){
        return res.send({
            status:500,
            message:"Database error",
            error:error
        })
    }
})

FollowRouter.get("/followers",async(req,res)=>{

    const userId = req.session.user.userId
    const SKIP = parseInt(req.query.skip) || 0

    try{
        const followersDb = await followers({userId,SKIP})       
 
        
        // const followersUserIds = followersDb[0].data.map(follower=>(follower.followerUserId))


        return res.send({
            status:200,
            message:"Followers list fetched successfully",
            data:followersDb
        })

    }
    catch(error){
        console.log(error)
        return res.send({
            status:500,
            message:"Database error",
            error:error
        })
    }
})

FollowRouter.post("/unfollow",async(req,res)=>{

    const followingUserId = req.body.followingUserId
    const followerUserId = req.session.user.userId

      //verify users Ids
    try {
        await User.verifyUserId({userId:followingUserId})
    } catch (error) {
        return res.send({
            status:400,
            data:"Invalid following User Id",
            error:error
        })
    }
    try {
        await User.verifyUserId({userId:followerUserId})
    } catch (error) {
        return res.send({
            status:400,
            data:"Invalid follower User Id",
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

    }
})

module.exports = FollowRouter