const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const AppError = require("../utils/appError.utils.js");

module.exports = async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return next();

    let payload;
    try {
      payload = jwt.verify(header.split(" ")[1], process.env.SECRET_KEY, { subject: "accessAPI" });
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }

    const user = await User.findById(payload._id).select("role status");
    if (!user || user.status !== "active") throw new AppError("Not authorized", 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};