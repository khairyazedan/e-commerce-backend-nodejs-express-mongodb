const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshToken.model.js");
const {signAccessToken, issueRefreshToken, setRefreshCookie, clearRefreshCookie, hashToken} = require('../utils/token.utils.js')
const User = require('../models/user.model.js')
const catchAsync = require('../utils/catchAsync.utils.js') ;
const AppError = require("../utils/appError.utils.js");
const logger = require("../utils/logger.util.js");

exports.refresh = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError("Refresh token not found", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_SECRET_KEY, {
      algorithms: ["HS256"],
      subject: "refreshTokenAPI",
    });
  } catch {  
    clearRefreshCookie(res);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // atomic: only one request can revoke a given token
  const stored = await RefreshToken.findOneAndUpdate(
    { tokenHash: hashToken(token), revokedAt: null },
    { revokedAt: new Date() }
  );

  if (!stored) {
    // already used (or unknown): treat as theft and kill the whole session family
    await RefreshToken.updateMany(
      { family: decoded.family, revokedAt: null },
      { revokedAt: new Date() }
    );
    logger.warn(`Refresh token reuse | user: ${decoded._id} | ip: ${req.ip}`);
    clearRefreshCookie(res);
    throw new AppError("Session expired, please log in again", 403);
  }

  const user = await User.findById(decoded._id)
  if (!user || user.status !== "active") {
    clearRefreshCookie(res);
    throw new AppError("Session expired, please log in again", 401);
  }

  const newRefresh = await issueRefreshToken(user._id, decoded.family); 
  setRefreshCookie(res, newRefresh);
  const accessToken = signAccessToken(user._id) 

  res.status(200).json({ message:"access token issued successfully!", data:accessToken});
});