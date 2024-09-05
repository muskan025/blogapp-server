const express = require("express")
const Blog = require("../Models/BlogModel")
const User = require("../Models/UserModel")
const sanitizeHtml = require('sanitize-html')
const { BlogDataValidator } = require("../Utils/BlogUtils")
const { following } = require("../Models/FollowModel")
const BlogSchema = require("../Schemas/BlogSchema")
const isAuth = require("../Middlewares/isAuth")

const BlogRouter = express.Router()

// Blog.deleteBlogs()

BlogRouter.post("/create-blog",isAuth,async(req,res)=>{

    const {title,textBody,readTime,thumbnail} = req.body
    
    const creationDateTime = Date.now()
    const userId = req.session.user.userId
     
    //to validate the blog
    try {
        await BlogDataValidator({ title, textBody,readTime,thumbnail });
      } catch (error) {
        return res.send({
          status: 400, 
          message: error,
          error: "Data invalidate",
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

    const blogObj = new Blog({title,textBody,creationDateTime,readTime,thumbnail,userId})
     const blogDb = await blogObj.createBlog()

        return res.send({  
            status:201,
            message:"Blog created successfully",
            data:{
                id:blogDb._id,
                title:blogDb.title,
                textBody:blogDb.textBody,
                readTime:blogDb.readTime,
                thumbnail:blogDb.thumbnail,
                notes:blogDb.notes,
                likesCount:blogDb.likesCount
            }
        })
    }
    catch(error){
         return res.send({
            status:500,
            message:"Something went wrong, please try again", 
            error:error
        })
    }
})

BlogRouter.get("/get-blogs",async(req,res)=>{

    const SKIP = parseInt(req.query.skip) || 0
    const isLoggedin = req.session.user !== undefined
    const followerUserId = isLoggedin && req.session.user.userId
 
    try{

        let blogDb = []
        if(isLoggedin){
        const followingUserDetails = await following({followerUserId,SKIP:0})
      
        const followingUserIds = followingUserDetails.map(user=>(user._id))
 
          blogDb = await Blog.getBlogs({followingUserIds,isLoggedin,SKIP})
        }
        else{
          blogDb = await Blog.getBlogs({isLoggedin,SKIP})
        }
          return res.send({ 
            status:200,
            message:"Read success",
            data: blogDb,
            blogCount:blogDb.length
        })
    }
    catch(error){
        console.log(error)
        return res.send({
            status:500,
            message:error,
         })
    }

})

BlogRouter.post("/user-blogs",async(req,res)=>{

    const userId = req.body.userId
    const SKIP = parseInt(req.query.skip) || 0
     try{ 

        const blogDb = await Blog.userBlogs({SKIP,userId})

           return res.send({
            status:200,
            message:"Read success",
            data:blogDb,  
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

BlogRouter.put("/edit-blog/:blogId",isAuth,async(req,res)=>{

    const {title,textBody,readTime,thumbnail} = req.body
    const blogId = req.params.blogId
    const userId = req.session.user.userId
 
   //to validate the blog
   try {
     await BlogDataValidator({ title, textBody,readTime,thumbnail }); 
  } catch (error) {
    console.log(error)  
    return res.send({  
      status: 400,
      message: error,
       
    });
  }  
  
try{
  const blogDb = await Blog.getBlogWithId({blogId})
 
  if(blogDb.userId.toString() !== userId.toString())
  {
      return res.send({
        status: 401,
          message: "You're UnAuthorized to proceed",
      })
  }  
  //Don't allow user to edit after 30 mins
 const timeDiff = new Date( (String(Date.now()) - blogDb.creationDateTime)).getTime()/(1000*60)

   if(timeDiff > 30){
      return res.send({ 
        status: 400,
          message: "Not allowed to edit after 30 mins",
      })
  }

  const blogObj = new Blog({
    title,textBody,userId,readTime,creationDateTime:blogDb.creationDateTime,blogId,thumbnail
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

BlogRouter.post("/like-blog",isAuth,async(req,res)=>{

    const blogId = req.body.blogId
     
    const userId = req.session.user.userId

    try{
        await User.verifyUserId({userId})
    }
    catch(error){
        console.log(error)
        return res.send({
        status:400,
        message:error
        })
    }

    try {
        const blog = await Blog.getBlogWithId({blogId})

        console.log("blog:",blog)
        const likedBlog = await Blog.toggleLike({userId,blog})
        
        return res.send({ 
            status:200, 
            message:likedBlog[1],
            data:likedBlog[0]
        })
        
    } catch (error) {
        console.log(error)
        return res.send({
            status:500,
             message:"Something went wrong",
             error:error
        })
    }
    

})


BlogRouter.post('/notes/:blogId', async (req, res) => {
    const { blogId } = req.params;
    const { userId,content } = req.body;
     let blog = []
      
    try{
      blog = await Blog.getBlogWithId({blogId});
    }
    catch(error){
      return res.send({ 
        status:400,
        message: error
      });
    }
     try {
      
      const addedNote = await Blog.addNote({userId,blog,content})
      return res.send({
        status:200
      })
    } catch (error) {
        console.log(error)
        return res.send({
            status:500,
            message:"Something went wrong, please try again"
          });
        }
  });

BlogRouter.delete("/delete-blog/:blogId",isAuth,async(req,res)=>{

    const blogId = req.params.blogId
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
        message:"Something went wrong, please try again",
        error:error
    })
}
}


)

module.exports = BlogRouter