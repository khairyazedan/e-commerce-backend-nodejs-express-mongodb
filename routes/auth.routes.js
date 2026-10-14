const express = require('express');
const {validateBody} = require("../middlewares/validateBody.middleware.js");
const {signupUser, loginUser} = require('../controllers/auth.controller.js');
const router = express.Router();
const signupSchema = require('../validation/signup.validation.js');
const {authLimiter} =require("../middlewares/rateLimit.middleware.js");

router.use(authLimiter);

router.post('/signup', validateBody(signupSchema), signupUser);

router.post('/login', loginUser);





module.exports = router;