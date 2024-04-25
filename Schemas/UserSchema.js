const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    username:{
        type:String,
        require:true,
        unique:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    bio:{
        type:String,
        required:true
    },
    niche:{
        type:String,
        required:true
    },
    blog:{
        type:Schema.Types.ObjectId,
        ref:"blog",
        require:true
    }
})

module.exports = mongoose.model("user",userSchema)



  