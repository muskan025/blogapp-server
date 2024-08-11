
const uploadFiles = ({file,username})=>{

    return new Promise((resolve,reject)=>{

        const filename = file.name;
        const allowedTypes = ['image/jpeg', 'image/png'];  

       try{ 
        if (!file || Object.keys(file.data).length === 0) reject('No files were uploaded.')
        
        if (!allowedTypes.includes(file.mimetype)) reject('Only JPEG and PNG files are allowed.')
        
        resolve()
    }
        catch(error){
            reject(error)
        }
    })
}

module.exports = uploadFiles