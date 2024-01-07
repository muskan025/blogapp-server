const cron = require("node-cron");
const BlogSchema = require("./Schemas/BlogSchema");

//delete blogs after 30 days
const cleanUpBin = ()=>{

    cron.schedule("*/5 * * * * *",async ()=>{
         
        const deletedBlogs = await BlogSchema.find({isDeleted:true})

        if(deletedBlogs.length>0){

            deletedBlogs.map(blog=>{

                const diff = new Date(Date.now() - blog.deletionDateTime).getTime()/(1000 * 60* 60 * 24  )

                // 658fe9eb7d7dc97593933cd4
                console.log(diff)
                if(diff > 0.005){

                    BlogSchema.findOneAndDelete({_id:blog._id}).then(()=>{
                        console.log(`${blog.title} : blog deleted successfully `)
                    }).catch((err)=>{
                        console.log(err)
                    })
                }
            })
        }
    })
}

module.exports = cleanUpBin