

const File = class {

    filename;
    contentType;
    data;

    constructor({filename,contentType,data}){
        this.filename = filename,
        this.contentType = contentType,
        this.data = data
    }

    saveFile(){
        return new Promise(async(resolve,reject)=>{

            const fileObj = new FileSchema({
                filename: this.filename,
                contentType: this.contentType,
                data: this.data
              });

            try{
                const fileDb = await fileObj.save()

                resolve(fileDb)
            }
            catch(error){
                reject(error)
            }

        })
    }
}

module.exports = File