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
             if(followingUserId.toString() ===  followerUserId.toString()) return reject("You can't follow yourself")

            //Check if user1 already follows user2
            const followerExist = await FollowSchema.findOne({followerUserId,followingUserId})
            if(followerExist) return reject("You already follow this user")

            const followObj = await FollowSchema({
                followerUserId:followerUserId,
                followingUserId:followingUserId,
                creationDateTime:Date.now()
            }) 
        
           const followingsCount =  await UserSchema.findByIdAndUpdate(
                {_id:followerUserId},
                { $inc: { followingsCount: 1 } }
              );
              const followersCount = await UserSchema.findByIdAndUpdate(
                {_id:followingUserId},
                { $inc: { followersCount: 1 } }
              );

              const data = {followingsCount, followersCount}
              const followDb = await followObj.save()
               
            resolve(data)
         }
        catch(error){
            reject(error)
        }
    })
 
}

const following = async ({userId,SKIP})=>{

    return new Promise (async(resolve,reject)=>{

        try{

            //Retrieve followings' data
            //1ST METHOD 
            const followingDb = await FollowSchema.aggregate([
                {
                    $match:{followerUserId:new ObjectId(userId)}
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

             const followersUserDetails = await UserSchema.aggregate([
                {$match:{_id: { $in : followerUserIds}}}
            ])

            console.log("followersUserDetails dbb:",followersUserDetails)

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

            const followingsCount =  await UserSchema.findByIdAndUpdate(
                {_id:followerUserId},
                { $inc: { followingsCount: -1 } }
              );
              const followersCount = await UserSchema.findByIdAndUpdate(
                {_id:followingUserId},
                { $inc: { followersCount: -1 } }
              );
 
              const data={followingsCount,followersCount}
            resolve(data)
         }
        catch(error){
            reject(error)
        }
    })

}
module.exports = {follow,following,followers,unfollow}



