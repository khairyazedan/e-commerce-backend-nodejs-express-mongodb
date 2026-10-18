const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/refreshToken.model.js");

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");

exports.signAccessToken = (userId) =>
  jwt.sign({ _id: userId }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
    subject: "accessAPI",
  });

exports.issueRefreshToken = async (userId, family = crypto.randomUUID()) => {
  const token = jwt.sign(
    { _id: userId, family },
    process.env.REFRESH_SECRET_KEY,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_IN,
      subject: "refreshTokenAPI",
    },
  );
  await RefreshToken.create({
    user: userId,
    tokenHash: hash(token),
    family,
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
  });
  return token;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth", 
};

exports.setRefreshCookie = (res, token) =>
  res.cookie("refreshToken", token, {
    ...cookieOptions,
    maxAge: REFRESH_MAX_AGE,
  });

exports.clearRefreshCookie = (res) =>
  res.clearCookie("refreshToken", cookieOptions);

exports.hashToken = hash;
