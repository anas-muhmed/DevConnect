const globalErrorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    console.error(`Error ${statusCode}: ${err.message}`);

    // In production, don't leak internal error details for 500s
    const message = (statusCode === 500 && isProduction)
        ? 'Something went wrong'
        : err.message || 'Something went wrong';

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports=globalErrorHandler;
