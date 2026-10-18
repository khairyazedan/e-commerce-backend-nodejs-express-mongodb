const express = require('express'); 
const { getCurrentAccount, editUserAccount, deleteUserAccount} = require('../controllers/account.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');
const {authorize} = require("../middlewares/role.middleware.js");
const router = express.Router();

router.get('/current', authMiddleware , authorize("admin", "customer"),getCurrentAccount);
router.put('/current/edit', authMiddleware, authorize('customer'), editUserAccount);

// router.put('/current/edit/:id', authMiddleware, authorize('admin'), editUserAccount);

router.delete('/current', authMiddleware, authorize('customer'), deleteUserAccount);


router.delete('/current/:id', authMiddleware, authorize('admin'), deleteUserAccount);



module.exports = router;