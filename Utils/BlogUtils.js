const BlogDataValidator = ({ title, textBody,readTime,blogImage}) => {
    return new Promise((resolve, reject) => {
      if (!title || !textBody || !readTime || !blogImage) {
        reject("Missing credentials");
      }
  
      if (typeof title !== "string") reject("Title is not a text");
      if (typeof textBody !== "string") reject("Blog Body is not a text");
      if (typeof readTime !== "string") reject("Read time is not a text");
  
      resolve();
    });
  };
  
  module.exports = { BlogDataValidator }; 