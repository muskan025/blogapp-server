const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImg:{
        type:String,
        default:null
    },
    bio: {
        type: String,
        trim: true,
        default:''
    },
    niche:{
        type:String,
        trim: true,
        default:''
    },
    blogs: [{
        type: Schema.Types.ObjectId,
        ref: "blog"
    }],
}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)