const mongoose = require('mongoose');
const crypto = require("crypto")
const validator = require('validator');
const bcrypt = require('bcryptjs');
const usersschema = new mongoose.Schema({
    Username: {
        type: String,
        required: [true, "User must have name"],
        trim: true,
        min:[4, "user must have atleast more than 4 character name"],
        max:[8, "user must have up to 8 character name"]
    },
    Email:{
        type:String,
        require:[true, ' A user must have name'],
        unique: true,
        lowercase:true,
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    role:{
        type:String,
        enum: ['user', 'admin', 'member '],
        default: 'user' 
    },
    Password:{ 
        type:String,
        require:[true, 'A user should keep password'],
        minlength:8,
        select: false
    },
    ConfirmPassword:{
        type:String,
        require:[true, 'A user should do confirm password'],
        validate:{
            // This only work on SAVE!!
            validator: function (el){
                return el === this.Password
            },
            message: 'Password are not the same'
        }   
    },
    PasswordChangeAt: Date,
    PasswordResetToken: String,
    PasswordResetExpire: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})


usersschema.pre('save', async function(next){
    // only run this function if password was actually modified
    if(!this.isModified('Password')) return next();
    
    this.Password = await bcrypt.hash(this.Password, 12);
    this.ConfirmPassword = undefined;
    next();
})

usersschema.pre('save', function(next){
    if(!this.isModified('Password') || !this.isNew) return next();

    this.PasswordChangeAt = Date.now() -1000;
    next();
})

usersschema.pre(/^find/, function(next){
    // this points to the current query
    this.find({active: {$ne:false}});
    next();
});



usersschema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}
usersschema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.PasswordChangeAt){
        const changedTimestamp = parseInt(this.PasswordChangeAt.getTime()/1000);
        console.log(this.PasswordChangeAt, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    // false mean not changed at all
    return false;
}

usersschema.methods.createPasswordResetToken = async function(){
    // console.log("hello world");
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.PasswordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // console.log(resetToken);
    this.PasswordResetExpire = Date.now() + 10*60*1000;
    return resetToken;
}

const User = mongoose.model('User', usersschema);
module.exports = User; 