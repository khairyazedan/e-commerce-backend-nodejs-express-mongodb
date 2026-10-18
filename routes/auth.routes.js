const express = require('express');
const {validateBody} = require("../middlewares/validateBody.middleware.js");
const {signupUser, loginUser, logout, logoutAll} = require('../controllers/auth.controller.js');
const router = express.Router();
const signupSchema = require('../validation/signup.validation.js');
const {authLimiter} =require("../middlewares/rateLimit.middleware.js");
const {authMiddleware} = require("../middlewares/auth.middleware.js")

router.use(authLimiter);

router.post('/signup', validateBody(signupSchema), signupUser);

router.post('/login', loginUser);

router.get('/logout', logout);
 
router.get('/logout-all', authMiddleware, logoutAll)

module.exports = router;