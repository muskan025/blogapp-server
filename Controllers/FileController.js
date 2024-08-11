 
const express = require("express");
const path = require("path");
const fs = require("fs");
const isAuth = require("../Middlewares/isAuth");
const FileRouter = express.Router();

FileRouter.post("/file",isAuth, async (req, res) => {

  const uid = req.session.user.userId
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({
      status: 400,
      message: "No files were uploaded."
    });
  }

  const file = req.files.file;

  if (!/^image/.test(file.mimetype)) {
    return res.status(400).send({
      status: 400,
      message: "Not an image, please upload an image"
    });
  }

  try {

    const fileName = `${uid}${Date.now()}${path.extname(file.name)}`;
    const uploadPath = path.join(__dirname, '../upload', fileName);
    await file.mv(uploadPath);

    const fileURL = `upload/${fileName}`  
    
    return res.status(200).send({
      status: 200,
      message: "File uploaded successfully", 
      url: fileURL
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).send({
      status: 500, 
      message: "Error uploading file",
      error: error.message
    });
  }
});

module.exports = FileRouter;

 