const express = require("express")
const Blog = require("../Models/BlogModel")
const User = require("../Models/UserModel")
const { BlogDataValidator } = require("../Utils/BlogUtils")
const { following } = require("../Models/FollowModel")

const BlogRouter = express.Router()

BlogRouter.post("/create-blog",async(req,res)=>{

    const {title,textBody,readTime,blogImage} = req.body
    const creationDateTime = Date.now()
    const userId = req.session.user.userId
    

    //to validate the blog
    try {
        await BlogDataValidator({ title, textBody,readTime,blogImage });
      } catch (error) {
        return res.send({
          status: 400,
          message: "Data invalidate",
          error: error,
        }); 
      }
    

    //to verify if the correct user is creating the blogs
    try{
        const userDb = await User.verifyUserId({userId})
   
    }
    catch(error){
        return res.send({
        status:400,
        error:error
        })
    }

//to create blog
    try{

    const blogObj = await new Blog({title,textBody,creationDateTime,readTime,blogImage,userId})
    const blogDb = await blogObj.createBlog()

        return res.send({  
            status:201,
            message:"Blog created successfully",
            data:blogDb
        })
    }
    catch(error){
        return res.send({
            status:500,
            message:"Database error",
            error:error
        })
    }
})

BlogRouter.get("/get-blogs",async(req,res)=>{

    const SKIP = parseInt(req.query.skip) || 0
    const followerUserId = req.session.user.userId
    try{
        const followingUserDetails = await following({followerUserId,SKIP:0})
     
        const followingUserIds = followingUserDetails.map(user=>(user._id))
 
        const blogDb = await Blog.getBlogs({followingUserIds,SKIP})

        
         return res.send({ 
            status:200,
            message:"Read success",
            data:blogDb,
            blogCount:blogDb.length
        })
    }
    catch(error){
        console.log(error)
        return res.send({
            status:500,
            message:"Database error",
            error:error 
        })
    }



})

BlogRouter.get("/my-blogs",async(req,res)=>{

    const userId = req.session.user.userId
    const SKIP = parseInt(req.query.skip) || 0

    try{

        const myBlogDb = await Blog.myBlogs({SKIP,userId})
         return res.send({
            status:200,
            message:"Read success",
            data:myBlogDb 
        })
    }
    catch(error){
        console.log(error)
        return res.send({
            status:500,
            message:"Database error",
            error:error 
        })
    }

})

BlogRouter.put("/edit-blog",async(req,res)=>{

    const {title,textBody} = req.body.data
    const blogId = req.body.blogId
    const userId = req.session.user.userId
 
   //to validate the blog
   try {
    await BlogDataValidator({ title, textBody });
  } catch (error) {
    console.log(error)
    return res.send({
      status: 400,
      message: "Data invalidate",
      error: error,
    });
  }
  
try{
    
  const blogDb = await Blog.getBlogWithId({blogId})
 
  if(blogDb.userId.toString() !== userId.toString())
  {
      return res.send({
        status: 401,
          message: "UnAuthorized to edit",
      })
  }

  //Don't allow user to edit after 30 mins
 const timeDiff = new Date( (String(Date.now()) - blogDb.creationDateTime)).getTime()/(1000*60)

 console.log(timeDiff)
  if(timeDiff > 30){

      return res.send({
        status: 400,
          message: "Not allowed to edit after 30 mins",
      })
  }

  const blogObj = new Blog({
    title,textBody,userId,creationDateTime:blogDb.creationDateTime,blogId
  })

  const oldBlogDb = await blogObj.updateBlog({blogId})

  return res.send({
    status: 200,
      message: "Blog edited successfully",
      data:oldBlogDb
  })


}
catch(error){
     return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
}
})

BlogRouter.delete("/delete-blog",async(req,res)=>{

    const blogId = req.body.blogId
    const userId = req.session.user.userId
try{
    
    const blogDb = await Blog.getBlogWithId({blogId})

    if(!blogDb.userId.equals(userId)){
        return res.send({
            status:401,
            message:"Unauthorized to delete the blog"
        })
    }

    const deletedBlog = await Blog.deleteBlog({blogId})
    return res.send({
            status:200,
            message:"Blog deleted successfully",
            data:deletedBlog
        })
}
catch(error){
    return res.send({
        status:500,
        message:"Database error",
        error:error
    })
}
}
)

module.exports = BlogRouter