const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const  addressSchema = require('./address.model.js');

const userAddressSchema = new mongoose.Schema({
    ...addressSchema.obj,
    isDefault:{
        type:Boolean,
        default: false
    },
    label:{
        type:String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home'
    }
}, {_id: true});

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        trim: true, 
        minlength: 3, 
        maxlength: 20 
    },
    email:{
        type: String,
        required:true,
        unique: true,
        lowercase: true, 
        trim: true 
    },
    password:{
        type: String, 
        required: true,
        select: false
    },
    phoneNum:{
        type:String,
    },
    address:[userAddressSchema],
    role:{
        type:String,
        enum:['customer', 'admin', 'support'],
        default: 'customer'
    },
    userAvatar:{
        type:String,
        default: null
    },
    status:{
        type:String,
        enum:['active', 'suspended', 'deactivated'],
        default: 'active'
    },
    lastLogin:{
        type: Date
    },
    isEmailVerified:{
        type:Boolean,
        default: false
    },
    emailVerificationToken:{
        type:String,
        select: false
    },
    passwordChangedAt: { 
        type: Date, 
        select: false 
    },
    passwordResetToken:{
        type:String,
        select: false
    },
    passwordResetExpires:{
        type:Date,
        select: false
    },
},{
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
          delete ret.password;
          delete ret.emailVerificationToken;
          delete ret.passwordResetToken;
          delete ret.passwordResetExpires;
          delete ret.__v;
          return ret;
        },
    }
});
userSchema.pre('save', async function (){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
        if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
    } 
});
 
userSchema.methods.isCorrectPassword = async function (inputPassword){
    return await bcrypt.compare(inputPassword, this.password);
}

userSchema.methods.isPasswordChanged = function (jwtIssuedAt) {
    if (!this.passwordChangedAt) return false;
    return jwtIssuedAt < Math.floor(this.passwordChangedAt.getTime() / 1000);
  };

const User = mongoose.model("user", userSchema);
module.exports = User;