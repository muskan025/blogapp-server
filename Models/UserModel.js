const BlogSchema = require("../Schemas/BlogSchema");
const FollowSchema = require("../Schemas/FollowSchema");
const SessionSchema = require("../Schemas/SessionSchema");
const UserSchema = require("../Schemas/UserSchema");
const userSchema = require("../Schemas/UserSchema");
const bcrypt = require("bcrypt");
const ObjectId = require("mongodb").ObjectId
const User = class {
  username;
  name;
  email;
  password;
  bio;
  niche;
  profileImg;
  followingsCount;
  followersCount;
   

  constructor({ name, username, email, password,bio,niche,profileImg }) {
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password;
    this.bio = bio;
    this.niche = niche;
    this.profileImg = profileImg;
    this.followingsCount = 0,
    this.followersCount = 0
  }

  registerUser() {
    return new Promise(async (resolve, reject) => {
      const hashedPassword = await bcrypt.hash(
        this.password,
        parseInt(process.env.SALT)
      );

      const userObj = new userSchema({
        name: this.name,
        username: this.username,
        email: this.email,
        password: hashedPassword,
        bio:this.bio,
        niche:this.niche,
        profileImg:this.profileImg,
        followingsCount:this.followingsCount,
        followersCount:this.followersCount
       });
 
      try {
        const userDb = await userObj.save();

        resolve(userDb);
      } catch (error) {
        reject(error); 
      }
    });
  }

  //To prevent user registering with email/username that already exists in db
  static findUsernameOrEmailExist({ email, username }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userExist = await userSchema.findOne({
          $or: [{ email }, { username }],
        });
         
        if(userExist && userExist.email === email )
        reject("Email already in use")

        if(userExist && userExist.username === username)
        reject("Username already in use")

    resolve()
      } catch (error) {
        reject(error)
      }
    });
  }

  static findRegisteredEmailOrUsername({loginId}){

    return new Promise(async(resolve,reject)=>{
      try{

        const userDb = await userSchema.findOne({
          $or:[{email:loginId},{username:loginId}]
        })
  
        if(!userDb) reject("User does not exist, please register first")
       
        resolve(userDb)
      }
      catch(error){
        reject(error)
      }
    })
  }

  static verifyUserId({userId}){
    return new Promise(async (resolve,reject)=>{

      if(!ObjectId.isValid(userId)) reject("Invalid User")

      try{
       
        const userDb = await UserSchema.findOne({_id:userId}) 
        if(!userDb) reject("No user found")
        resolve (userDb)
      }
      catch(error){
      reject(error)
      }
    })
  }

  static async editProfile({userId, name, username, bio, niche, profileImg}) {
    return new Promise(async (resolve, reject) => {
      const newProfile = {
        name,
        username,
        profileImg,
        bio,
        niche
      };
      try { 
        const updatedProfile = await UserSchema.findOneAndUpdate({_id: userId}, newProfile, {new: true});
        resolve(updatedProfile);
      } catch (error) {
        reject(error);
      }
    });
  }

  // static async deleteUsers() {

  //   try{
      
  //     const deletedUsers = await FollowSchema.deleteMany({})

  //     if(!deletedUsers) throw new Error ("couldn't delete")

  //       return deletedUsers
  //   }
  //   catch (error) {
  //     throw error;
  //   }
  
  // }
 
}; 



module.exports = User;
