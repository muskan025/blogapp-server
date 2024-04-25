const uploadMiddleware = (req, res, next) => {
    
    if (!req.files || !req.files.file) {
      return res.status(400).send('No files were uploaded.');
    }
  
    const file = req.files.file;
    const filename = file.name;
    const allowedTypes = ['image/jpeg', 'image/png'];  
  
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).send('Only JPEG and PNG files are allowed.');
    }
  
     
    file.mv("./uploads/" + filename, function (err) {
      if (err) {
        return res.status(500).send(err);
      }
  
      next();
    });
  };

  module.exports = uploadMiddleware