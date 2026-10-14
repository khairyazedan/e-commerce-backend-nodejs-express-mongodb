const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const catchAsync = require("../utils/catchAsync.utils.js");
const AppError = require("../utils/appError.utils.js");

exports.authMiddleware = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Access token not found", 401);
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY, {
      algorithms: ["HS256"],
      subject: "accessAPI",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const error = new AppError("Access token expired", 401);
      error.code = "TOKEN_EXPIRED";
      throw error;
    }
    throw new AppError("Access token invalid", 401);
  }

  const user = await User.findById(decoded._id).select("+passwordChangedAt");
  if (!user) throw new AppError("User no longer exists", 401);

  if (user.status !== "active") throw new AppError("Account is not active", 403);

  if (user.isPasswordChanged(decoded.iat)) {
    throw new AppError("Password changed, please log in again", 401);
  }

  req.user = user;
  next();
});





// const User = require('../models/user.model.js');
// const jwt = require('jsonwebtoken');

// exports.authMiddleware = async(req, res, next)=>{
//     const accessToken = req.headers.authorization;
//     if(!accessToken?.startsWith('Bearer ')){
//         return res.status(401).json({message:"Access token not found"})
//     } 
   
//     const token = accessToken.split(' ')[1];
//     try{
//         const decodedAccessToken = jwt.verify(token, process.env.SECRET_KEY);
//         req.user = await User.findById(decodedAccessToken._id)
//         if(!req.user){
//             return res.status(401).json({error: 'user not found', message: error.message});
//         }
//         next();
//     } catch (error) {
//         console.log(error.name, error.message);
//         return res.status(401).json({ message: "Access token invalid or expired." });
//     }
// }