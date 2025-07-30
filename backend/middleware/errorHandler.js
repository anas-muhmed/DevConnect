const globalErrorHandler=(err,req,res,next)=>{
    let statusCode=err.statusCode || 500;
    let message=err.message||'Something Went Wrong';

    //debugging
    console.error(`Error ${statusCode}:${message}`);

    //send response to client
    res.status(statusCode).json({
        success:false,
        message:message
    });
};

module.exports=globalErrorHandler;
