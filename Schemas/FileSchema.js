const mongoose = require("mongoose")
const Schema = mongoose.Schema

const fileSchema = new Schema({
    filename: {
        type: String,
        required: true,
      },
      mimetype: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
})

module.exports = mongoose.model("file",fileSchema)