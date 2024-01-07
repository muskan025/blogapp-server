const ObjectId  = require("mongodb").ObjectId
const FollowSchema = require("../Schemas/FollowSchema")
const UserSchema = require("../Schemas/UserSchema")
const { LIMIT } = require("../privateConstants")

const follow = async ({followingUserId,followerUserId})=>{

    return new Promise(async(resolve,reject)=>{

        try{
        //verify if the follower already follows the user

            // const followerExist = await FollowSchema.aggregate([
            //     {
            //        $facet:{
            //          data:[{followerUserId: new ObjectId(followerUserId)},{followingUserId: new ObjectId(followingUserId)}]
            //        }
            //     }
            // ])

            //check if user you're trying to follow exists
            if(!ObjectId.isValid(followingUserId)) return reject("User you're trying to follow doesn't exist")

            
            //Check if user is following himself
           console.log(followingUserId.toString(),followerUserId.toString())
            if(followingUserId.toString() ===  followerUserId.toString()) {
                 
            return reject("You can't follow yourself")
        }

            //Check if user1 already follow user2
            const followerExist = await FollowSchema.findOne({followerUserId,followingUserId})
            if(followerExist) return reject("You already follow this user")

            //create follow entry
            const followObj = await FollowSchema({
                followerUserId:followerUserId,
                followingUserId:followingUserId,
                creationDateTime:Date.now()
            }) 
        
            const followDb = await followObj.save()

            resolve(followDb)
        }
        catch(error){
            reject(error)
        }
    })
 
}

const following = async ({followerUserId,SKIP})=>{

    return new Promise (async(resolve,reject)=>{

        try{

            //Retrieve followings' data
            //1ST METHOD 
            const followingDb = await FollowSchema.aggregate([
                {
                    $match:{followerUserId:new ObjectId(followerUserId)}
                },
                {
                    $sort:{creationDateTime:-1}
                },
                {
                    $facet:{
                        data:[{$skip:SKIP},{$limit:LIMIT}]
                    }
                }
            ])

            const followingUserIds = await followingDb[0].data.map((following)=>following.followingUserId)

            const followingUserDetails = await UserSchema.aggregate([
                {
                    $match:{ _id: { $in : followingUserIds}}
                }
            ])

            //2nd METHOD 
            // To exclude certain feilds in query : 
            // second parameter should be {key : 0} , eg:{password:0,name:0}
            
            //  const followingDb = await FollowSchema.find({followerUserId:userId}).populate("followingUserId",{password:0,name:0}).sort({creationDateTime:-1})

             
             resolve(followingUserDetails.reverse())
        }
        catch(error){
        reject(error)
        }
    })
}

const followers = async ({userId,SKIP})=>{

    return new Promise (async(resolve,reject)=>{  

        try{

            //Retrieve followings' data
            //1ST METHOD 

            const followersDb = await FollowSchema.aggregate([
                {
                    $match:{followingUserId:new ObjectId(userId)}
                },
                {
                    $sort:{creationDateTime:-1}
                },
                {
                    $facet:{
                        data:[{$skip:SKIP},{$limit:LIMIT}]
                    }
                }
            ])


            //fetching all follower Ids
            const followerUserIds = await followersDb[0].data.map((follower)=>follower.followerUserId)

            followerUserIds.map(async(id)=>{
                 const userDetails = await UserSchema.findOne({_id:id})
            }
            )

            //fetching all the followers data from user collection
            const followersUserDetails = await UserSchema.aggregate([
                {$match:{_id: { $in : followerUserIds}}}
            ])

            console.log(followersUserDetails)
            //2nd METHOD
            // const followersDb = await FollowSchema.find({followingUserId:userId}).populate("followerUserId",{password:0,name:0}).sort({creationDateTime:-1})
           
            resolve(followersUserDetails.reverse())
        }
        catch(error){
        reject(error)
        }
    })
}

const unfollow = async ({followerUserId,followingUserId})=>{

    return new Promise (async(resolve,reject)=>{

        try{

            const followObj = await FollowSchema.findOneAndDelete({followingUserId,followerUserId})
 
            resolve(followObj)
         }
        catch(error){
            reject(error)
        }
    })

}
module.exports = {follow,following,followers,unfollow}



