const multer=require('multer')
const path=require('path')

//storage configuration
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/uploads/')  //save it in this folder
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname));
    }
})
//filter images only
const fileFilter=(req,file,cb)=>{
    if (file.mimetype.startsWith('image/')){
        cb(null,true);
    }else{
        cb(new Error('Not an image file!'), false);
    }

}
const upload = multer({ storage, fileFilter });

module.exports=upload;