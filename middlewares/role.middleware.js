const User = require("../models/user.model.js");

exports.authorize=(...allowedRoles)=>{
    return async (req, res, next)=>{
        const user = await User.findOne({_id:req.user._id})
        if(! user || !allowedRoles.includes(user.role)){
            return res.status(403).json({message: "Access denied"})
        }
        next()
    }
}