const{body,validationResult}=require('express-validator');

const validateRegistration=[
body('email')
.isEmail()
.withMessage('Please provide a valid email address')
.normalizeEmail(),
body('password')
.isLength({min:8,max:50})
.withMessage('Password must be atleast 8-50 characters'),
body('username')
.isLength({min:3,max:20})
.withMessage('Username must be between 3-20 charecters')
.isAlphanumeric()
.withMessage('Username can only contain letters and numbers')
];

//function to handle validation errors
const handleValidationErrors=(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            message:'Validation Failed',
            errors:errors.array()
        });
    }
    next();
    
}

module.exports={
    validateRegistration,
    handleValidationErrors
};