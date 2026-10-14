const User = require('../models/user.model.js');
exports.getCurrentAccount = async (req, res)=>{
    try{
        const { _id, name, email } = req.user;
        const user = await User.findOne(req.user);
        return res.status(200).json({message: "user Founded successfully!", _id: user._id, name:user.name, email:user.email});
        // return res.status(200).json({message: "user Founded successfully!", _id: user._id, name:user.name, email:user.email});
    }catch(error){
        return res.status(500).json({message: error.message}) 
    }
}