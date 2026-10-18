const express = require('express');
const {refresh}= require("../controllers/refreshToken.controller.js");
const router = express.Router();



router.post('/', refresh)


module.exports = router;