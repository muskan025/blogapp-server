const mongoose = require("mongoose")
const Schema = mongoose.Schema

const blogSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim: true,
        minLength:2,
        maxLength:70
    },
    textBody:{
        type:String, 
        required:true,
        trim: true,
        minLength:30,
        maxLength:10000
    },
    readTime:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    }, 
    likes:[{
        type: Schema.Types.ObjectId,
        ref: 'user',
    }],
    likesCount:{
        type:Number,
        default:0
    },
    notes: [{
        userId: {
          type: Schema.Types.ObjectId,
            default: null
        },
        content: {
          type: String,
          trim: true,
          default: ''
        }
      }],
    userId:{
        type:Schema.Types.ObjectId,    
        required:true,
        ref:"user"
    },
    isDeleted:{
        type:Boolean, 
        default:false
    },
    deletionDateTime:{
        type:Date,    
    },
},{timestamps: true})

module.exports = mongoose.model("blog",blogSchema)