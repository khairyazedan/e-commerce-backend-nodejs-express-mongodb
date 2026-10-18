const User = require('../models/user.model.js');
const catchAsync = require("../utils/catchAsync.utils.js");
const AppError = require("../utils/appError.utils.js");
const RefreshToken = require("../models/refreshToken.model.js");

exports.getCurrentAccount = catchAsync(async (req, res, next)=>{
        const { _id} = req.user;
        const user = await User.findOne(_id);
        if(!user){
            return next(new AppError('user not found', 404));
        }
        return res.status(200)
        .json({message: "user Founded successfully!", data: {user}});
});


exports.editUserAccount = catchAsync(async(req, res, next)=>{
    const {name, email} = req.body;
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id, {name, email}, {new: true}
    )
    return res.status(200).json({message: "Account updated successfully!", data: updatedUser})

});


exports.deleteUserAccount = catchAsync(async(req, res, next)=>{
    const userId = req.user._id || req.params.id;

    const user = await User.findByIdAndUpdate(userId, {status: 'deactivated'}, {new: true});
    if(!user){
        return next(new AppError('user not found', 404));
    }
    await RefreshToken.updateMany({user: userId, revokedAt: null}, {revokedAt: new Date()})

    return res.status(200)
        .json({message: "user deactivated successfully!"});
});