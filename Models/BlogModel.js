const BlogSchema = require("../Schemas/BlogSchema");
const { LIMIT } = require("../privateConstants");
const ObjectId = require("mongodb").ObjectId;

const Blog = class {
  title;
  textBody;
  creationDateTime;
  userId;
  blogId;

  constructor({ title, textBody, creationDateTime, userId,blogId }) {
    this.title = title;
    this.textBody = textBody;
    this.creationDateTime = creationDateTime;
    this.userId = userId;
    this.blogId = blogId
  }

  createBlog() {
    return new Promise(async (resolve, reject) => {
      this.title.trim();
      this.textBody.trim();

      const blogObj = await new BlogSchema({
        title: this.title,
        textBody: this.textBody,
        creationDateTime: this.creationDateTime,
        userId: this.userId,
      });

      try {
        const blogDb = await blogObj.save();
        resolve(blogDb);
      } catch (err) {
        reject(error);
      }
    });
  }

  static getBlogs({followingUserIds, SKIP }) {
    return new Promise(async (resolve, reject) => {

      let blogs = []
      let followingBlogsDb = []
      let notfollowingBlogsDb = []
      try {
        followingBlogsDb = await BlogSchema.aggregate([
          {
            $match : {userId: { $in : followingUserIds}, isDeleted : {$ne:true}}
          },
          {
            $sort: { creationDateTime: -1 }, //desc order of time | -1 for asce
          },
          {
            $facet: {
              data: [{ $skip: SKIP }, { $limit: LIMIT }],
            },
          },
        ]);
      } catch (error) {
        reject(error);
      }

      try {
          notfollowingBlogsDb = await BlogSchema.aggregate([
          {
            $match : {userId: { $nin : followingUserIds}, isDeleted : {$ne:true}}
          },
          {
            $sort: { creationDateTime: -1 }, //desc order of time | -1 for asce
          },
          {
            $facet: {
              data: [{ $skip: SKIP }, { $limit: LIMIT }],
            },
          },
        ]);
        const blogs = [...followingBlogsDb[0].data,...notfollowingBlogsDb[0].data]

        resolve(blogs);
      } catch (error) {
        reject(error);
      }

    });
  }

  static myBlogs({ SKIP, userId }) {
    return new Promise(async (resolve, reject) => {
       
       try {
        const myblogDb = await BlogSchema.aggregate([
          {
            $match: { userId: new ObjectId(userId), isDeleted : {$ne:true} },
          },
          {
            $sort: { creationDateTime: -1 },
          },
          {
            $facet: {
              data: [{ $skip: SKIP }, { $limit: LIMIT }],
            },
          },
        ]);


        resolve(myblogDb[0].data);
      } catch (error) {
        reject(error);
      }
    });
  }

 static getBlogWithId({blogId}){

  return new Promise(async(resolve,reject)=>{
    try{

       const blogDb = await BlogSchema.findOne({_id:blogId})

   
        if(!blogDb) reject("Blog Id not found") 
 
      resolve(blogDb)
    }
    catch(error){
      reject(error)
    }
  })
 
 }

 updateBlog({blogId}){

    return new Promise(async (resolve,reject)=>{

let newBlogData = {
  title:this.title,
  textBody:this.textBody,
  creationDateTime:this.creationDateTime
}

// if(this.title){
// newBlogData.title = this.title
// }
// if(this.textBody){
// newBlogData.textBody = this.textBody
// }

try{

 const oldBlog = await BlogSchema.findOneAndUpdate({_id:blogId},newBlogData)

 

resolve(oldBlog)
}
catch(error){
reject(error)
}

    
    }
    )
 }
 static deleteBlog({blogId}){

  return new Promise(async(resolve,reject)=>{

    try{

       const deleteBlog = await BlogSchema.findOneAndUpdate({_id:blogId},{isDeleted:true, deletionDateTime:Date.now()})

        resolve(deleteBlog)
    }
    catch(error){
      reject(error)
    }
  })
 }
};


module.exports = Blog;
