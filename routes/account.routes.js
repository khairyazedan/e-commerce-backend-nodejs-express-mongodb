const express = require('express'); 
const { getCurrentAccount } = require('../controllers/account.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');
const {authorize} = require("../middlewares/role.middleware.js");
const router = express.Router();

router.get('/current', authMiddleware , authorize("admin", "customer"),getCurrentAccount);





module.exports = router;