const jwt = require("jsonwebtoken");
const {promisify} = require('util')
const crypto = require('crypto')
const User = require("../RouteModule/userModule")
const catchAsynceErrorhandler = require("../middleware/CatchasyncError");

const ErrorHandler =require("../Utils/errorHander")
const sendEmail = require("../Utils/email");

const signToken = id =>{
    return jwt.sign( {id: id}, process.env.JSON__SECRET, {expiresIn:process.env.JSON__EXPIRE})
}
//   for signup
exports.signup = catchAsynceErrorhandler( async (req, res, next)=>{
    console.log("Signup happening")
    const newUser = await User.create(req.body);
    console.log(newUser);
    const token = signToken(newUser._id)

    const cookieoption = {
        expires: new Date(Date.now()+ process.env.JSON_COOKIE_EXPIRE * 24 * 60 * 60 *100 ),
    httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        cookieoption.secure = true
    }
    res.cookie('jwt', token, cookieoption
    )
    // Remove password from output, It does not effect actual Password
    newUser.Password = undefined;
 
    res.status(201).json({
        status: 'success',
        token,
        data: newUser
    })
      next(); 
});


// for login
exports.login = catchAsynceErrorhandler( async (req,res,next)=>{
    console.log("hello login");
    const {Email, Password} = req.body;
    console.log(Email, Password)
    //check email and password exits
    if(!Email && !Password) {
        return next();
    }
    // Taking data by email
    const user = await User.findOne({Email}).select('+Password') ;
    console.log(user)
    // console.log(user);
    // console.log("user part success")
    //checking either password is correect or not
    const correct = await user.correctPassword(Password, user.Password);
    // console.log(correct);
    //final checking of user and true result of correct
    if(!user|| !correct){
        return next(); 
    }
    // console.log("hello world");

   
    const token= signToken(user._id);
    // console.log("hello world");
    // console.log(token);
    const cookieoption = {
        expires: new Date(Date.now()+ process.env.JSON_COOKIE_EXPIRE * 24 * 60 * 60 *100 ),
    httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        cookieoption.secure = true
    }
    res.cookie('jwt', token, cookieoption
    )


    res.status(200).json({
        status:'success',
        token
    })
    next();

});

// for protecting file


exports.protect = catchAsynceErrorhandler( async(req,res,next)=>{

    // check token actually exits or not
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer') ){

        token = req.headers.authorization.split(' ')[1];
    } 
    if(!token){
        return next(new ErrorHandler("Token is not there", 404));
    }

    // verfication token
    const decode = await promisify(jwt.verify)(token, process.env.JSON__SECRET);


    // check if user still exits
    const freshUser = await User.findById(decode.id)
    if(!freshUser){
        return next(new ErrorHandler('the user belonging to this token does no longer exits', 401))
    }
  

    // check if user changed password after the token was issued
    if(freshUser.changePasswordAfter(decode.iat)){
        return next(new ErrorHandler("User recently changed password! Please log in again", 401))
    }

    // Grant access to protected route
    req.user = freshUser;

    next();
}

)

exports.restrictTo = (...roles)=>{
    return (req, res,next) =>{
        // role ['admin', 'user', 'member']
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler("You do not have permission to perform this action", 403 ));
        }
        next();
    }
}


exports.forgotPassword = catchAsynceErrorhandler(async(req, res,next)=>{
    // Get user based on Post email
    console.log(req.body.Email)
    const user = await User.findOne({Email: req.body.Email});
    if(!user){
        return next(new ErrorHandler('There is no user with email Address ', 404))
    }
    // console.log(user); 
    //Generate the random reset token
    // console.log("hello world");
    const resetToken = await user.createPasswordResetToken();
    console.log("hey world", resetToken);
    await user.save({validateBeforeSave: false});
    console.log(resetToken);

    // send it to user's email 
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you did not forget your password, please ignore this email!`;
    try {    
        console.log(user.Email)
        await sendEmail({
        Email: user.Email,
        subject: 'Password Reset Token (valid for 10 min)',
        message
    });
    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
    })}
    catch(err){
        user.PasswordResetToken = undefined;
        user.PasswordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next( new ErrorHandler('There was an error sending the email', 500))
    }
    // next();
})
exports.resetPassword = catchAsynceErrorhandler(async(req, res,next)=>{

    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        PasswordResetToken: hashedToken,
        PasswordResetExpires: {$gt: Date.now()}
    });
    // 2) If token has not expired, and there is user, set the new password
    if(!user){
        return next(new ErrorHandler('Token is invalid or has expired', 400))
    }
    user.Password = req.body.Password;
    user.PasswordConfirm = req.body.PasswordConfirm;
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({validateBeforeSave: false});
    // 3) Update changedPasswordAt property for the user
  
    // 4) Log the user in, send JWT
    const token = signToken(user._id);
    const cookieoption = {
        expires: new Date(Date.now()+ process.env.JSON_COOKIE_EXPIRE * 24 * 60 * 60 *100 ),
    httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        cookieoption.secure = true
    }
    res.cookie('jwt', token, cookieoption
    )

    res.status(200).json({
        status: 'success',
        token
    })
}
)

exports.updatePassword = catchAsynceErrorhandler(async(req,res,next)=>{
    // console.log("updating is coming my lord")
    // console.log(req.user.id)
    const {currentPassword, updatePassword, ConfirmPassword} = req.body;
    const user = await User.findById(req.user.id).select('+Password');
    if(!user){
        return next(new ErrorHandler(" User not Found"));
    }
    //checking either password is correect or not
    console.log(user)
    const correct = await user.correctPassword(currentPassword, user.Password);
    console.log(correct);
    //final checking of user and true result of correct
    if(!user|| !correct){
        return next(new ErrorHandler('Please Either Email or CurrentPassword is wrong, May be user not exits', 400)); 
    }
    user.Password = updatePassword;
    user.ConfirmPassword = ConfirmPassword;
    await user.save();
    const token = signToken(user._id);
    const cookieoption = {
        expires: new Date(Date.now()+ process.env.JSON_COOKIE_EXPIRE * 24 * 60 * 60 *100 ),
    httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        cookieoption.secure = true
    }
    res.cookie('jwt', token, cookieoption
    )

    res.status(200).json({
        status: 'success',
        token
    })
})