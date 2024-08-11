const BlogDataValidator = ({ title, textBody,readTime,thumbnail}) => {
    return new Promise((resolve, reject) => {
      if (!title) {
        return reject("Title is required");
      }
      
      if (!textBody) {
        return reject("Text body is required");
      }
      
      if (!readTime) {
        return reject("Read time is required");
      }
      
      if (!thumbnail) {
        return reject("Thumbnail is required");
      }
  
      if (typeof title !== "string") reject("Title is not a text");
       if (typeof readTime !== "string") reject("Read time is not a text");
  
      resolve();
    });
  };
  
  module.exports = { BlogDataValidator }; 