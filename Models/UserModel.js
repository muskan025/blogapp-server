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

  constructor({ name, username, email, password,bio,niche }) {
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password;
    this.bio = bio;
    this.niche = niche;
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

  static findRegisteredEmailOrUsername({loginId,password}){

    return new Promise(async(resolve,reject)=>{
      try{

        const userDb = await userSchema.findOne({
          $or:[{email:loginId},{username:loginId}]
        })

        if(!userDb) reject("User does not exits, please register first")
       
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
        const userDb = await userSchema.findOne({_id:userId})
        if(!userDb) reject("No user found")
        resolve (userDb)
      }
      catch(error){
reject(error)
      }
    })
  }

 

};

module.exports = User;
