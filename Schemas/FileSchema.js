const mongoose = require("mongoose")
const Schema = mongoose.Schema

const fileSchema = new Schema({
    filename: {
        type: String,
        required: true,
      },
      contentType: {
        type: String,
        required: true,
      },
      data: {
        type: Buffer,
        required: true,
      }
})

module.exports = mongoose.model("file",fileSchema)