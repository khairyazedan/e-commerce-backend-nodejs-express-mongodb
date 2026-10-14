const express = require("express");
const router = express.Router();
const client = require("../config/imagekit.config.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/role.middleware.js");

router.get("/auth", authMiddleware, authorize("admin"), (req, res) => {
  try {
    const { token, expire, signature } = client.helper.getAuthenticationParameters();

    res.status(200).json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("error creating imagekit auth", error);
    res.status(500).json({ message: "Error creating upload authentication" });
  }
});

module.exports = router;