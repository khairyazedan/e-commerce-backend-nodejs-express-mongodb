const User = require("../models/user.model.js");
const RefreshToken = require("../models/refreshToken.model.js");
const {
  issueRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  hashToken
} = require("../utils/token.utils.js");
const logger = require("../utils/logger.util.js");
const catchAsync = require("../utils/catchAsync.utils.js");
const AppError = require("../utils/appError.utils.js");
const jwt = require('jsonwebtoken');

exports.signupUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res
        .status(422)
        .json({ message: "please enter name, email and password!" });
    }
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res
        .status(409)
        .json({ message: "User with this email already exist!" });
    }
    const newUser = await User.create({ userName, email, password });
    return res
      .status(201)
      .json({ message: "User Created Successfully!", data: newUser });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ error: "Email already exists" });
    if (error.name === "ValidationError")
      return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: "Error creating user" });
  }
};

exports.loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Please enter your email and password!", 422);
    // return res.status(422).json({message: "please enter your email and password!"})
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isCorrectPassword(password))) {
    logger.warn(`Failed login | email: ${email} | ip: ${req.ip}`);
    // same message for both cases so an attacker can't tell which one failed
    throw new AppError("Email or password is invalid", 401);
  } 
  if (user.status !== "active")
    throw new AppError("Account is not active", 403);

  const accessToken = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_IN,
      subject: "accessAPI",
    })
  const refreshToken = await issueRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  res
    .status(200)
    .json({
      id: user._id,
      name: user.userName,
      email: user.email,
      accessToken,
    });
});

exports.logout = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.updateOne({ tokenHash: hashToken(token) }, { revokedAt: new Date() });
  }
  clearRefreshCookie(res);
  res.status(200).json({ message: "Logged out" });
});

 
exports.logoutAll = catchAsync(async (req, res) => {
  await RefreshToken.updateMany({ user: req.user._id, revokedAt: null }, { revokedAt: new Date() });
  clearRefreshCookie(res);
  res.status(200).json({ message: "Logged out from all devices" });
});
