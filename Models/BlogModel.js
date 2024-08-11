const sanitizeHtml = require("sanitize-html");
const BlogSchema = require("../Schemas/BlogSchema");
const { LIMIT } = require("../privateConstants");
const UserSchema = require("../Schemas/UserSchema");
const ObjectId = require("mongodb").ObjectId;

const Blog = class {
  title;
  textBody;
  creationDateTime;
  readTime;
  thumbnail;
  userId;
  blogId;
  likes;

  constructor({ title, textBody,creationDateTime,readTime,thumbnail,userId,blogId,likes }) {
    this.title = title;
    this.textBody = textBody;
    this.creationDateTime = creationDateTime,
    this.readTime = readTime;
    this.thumbnail = thumbnail;
    this.userId = userId;
    this.blogId = blogId 
    this.likes = likes 
  }

  createBlog() {
    return new Promise(async (resolve, reject) => {
      this.title.trim();
      this.textBody.trim();

      
    const sanitizedHtml = sanitizeHtml(this.textBody, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt']
      }
    });

       const blogObj = new BlogSchema({
        title: this.title,
        textBody:  sanitizedHtml,
        creationDateTime: this.creationDateTime,
        readTime: this.readTime,
        thumbnail: this.thumbnail,
        likes:this.likes,
        userId: this.userId,
      });

      try {
        const blogDb = await blogObj.save();

      resolve(blogDb);
      } catch (err) { 
        reject(err);
      }   
    });
  } 

  static getBlogs({followingUserIds,isLoggedin,SKIP }) {
    return new Promise(async (resolve, reject) => {
     
       
      let followingBlogsDb = []
      let notfollowingBlogsDb = []
      let blogsDb = []

      
      try {

        if(!isLoggedin){
        
          blogsDb = await BlogSchema.aggregate([
            {
              $sort: {creationDateTime: -1}
            },
            {
              $facet: {
                data: [{$skip: SKIP}, {$limit: LIMIT}]
              }
            }
          ])

          const blogs = [...blogsDb[0].data]
          const blogIds = blogs.map(blog => blog._id)
          const populatedBlogs = await BlogSchema.find({ _id: { $in: blogIds } })
        .populate('userId', 'name username profileImg bio niche')  
        .exec();

          console.log("not loggedin blogsDB:",blogsDb)
          console.log("not loggedin blogs:",blogsDb)
          console.log("not loggedin populated:",populatedBlogs)
          resolve(populatedBlogs)
        }

        followingBlogsDb = await BlogSchema.aggregate([
          {
            $match : {userId: { $in : followingUserIds}, isDeleted : {$ne:true}}
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
      } catch (error) {
        reject(error);
      }

      try {
          notfollowingBlogsDb = await BlogSchema.aggregate([
          {
            $match : {userId: { $nin : followingUserIds}, isDeleted : {$ne:true}}
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

        const blogs = [...followingBlogsDb[0].data,...notfollowingBlogsDb[0].data]
        const blogIds = blogs.map(blog => blog._id)

        const populatedBlogs = await BlogSchema.find({ _id: { $in: blogIds } })
        .populate('userId', 'name username profileImg bio niche')  
        .exec();
      
        resolve(populatedBlogs); 
      } catch (error) {
        reject(error);
      }

    });
  }

  static myBlogs({ SKIP, userId }) {
    return new Promise(async (resolve, reject) => {
       
       try {
        const blogs = await BlogSchema.find({ userId: new ObjectId(userId), isDeleted: { $ne: true } })
                .sort({ creationDateTime: -1 })
                .skip(SKIP)
                .limit(LIMIT)
                .populate('userId', 'name username profileImg bio niche')  
                .exec();
                
            resolve(blogs);
         
      } catch (error) {
        reject(error);
      }
    });
  } 

 static getBlogWithId({blogId}){

  return new Promise(async(resolve,reject)=>{
    try{

       const blog = await BlogSchema.findOne({_id:blogId}) 
      
        if(!blog) reject("Blog Id not found") 
 
      resolve(blog)
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
  readTime:this.readTime,
  creationDateTime:this.creationDateTime
}
 

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

 static toggleLike({ userId, blog }) {
  return new Promise(async (resolve, reject) => {
      try {

        
          const userIndex = blog.likes.findIndex(id => id.equals(userId));

          if (userIndex === -1) {
              blog.likes.push(userId);
          } else {
              blog.likes.splice(userIndex, 1);
          }

          await blog.save();

          const likesCount = blog.likes.length;

          const updatedBlog = await BlogSchema.findByIdAndUpdate(
              { _id: blog._id },
              { likes: blog.likes, likesCount: likesCount },
              { new: true } // To return the updated document
          );

          if (!updatedBlog) {
              return reject(new Error('Blog not found'));
          }

           const message = userIndex === -1 ? "Liked Blog" : "Unliked Blog";
          resolve([updatedBlog, message]);
      } catch (error) {
          reject(error);
      }
  });
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

//  static async deleteBlogs() {

//   try{
    
//     const deletedBlogs = await BlogSchema.deleteMany({})

//     if(!deletedBlogs) throw new Error ("couldn't delete")

//       return deletedBlogs
//   }
//   catch (error) {
//     throw error;
//   }

// }

};



module.exports = Blog;
