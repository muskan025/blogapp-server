const express = require("express");
const uploadMiddleware = require("../Middlewares/uploadMiddleware");


const FileRouter = express.Router()

FileRouter.get("/upload", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

FileRouter.post("/upload",uploadMiddleware, async(req, res) => {

    try{

        const file = res.files.file

        const newFile={
            filename:file.name,
            mimetype:file.mimetype,
            size:file.size,
            path:"/uploads/"+file.name
        }

        const savedFile = await newFile.save()

      return res.send("File uploaded succesfully")
    }
    catch(error){
      return res.send(error)
    }
  });

module.exports = FileRouter