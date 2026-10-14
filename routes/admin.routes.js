const express = require('express');
const router = express.Router();
const {authMiddleware} = require("../middlewares/auth.middleware.js");
const {authorize} = require("../middlewares/role.middleware.js")
const {backupLimiter, restoreLimiter, globalLimiter} = require("../middlewares/rateLimit.middleware.js");
const {createBackup, createRestore}=require("../controllers/dbBackup.controller.js")

router.get('/db-backup', authMiddleware, authorize('admin'),backupLimiter, createBackup);
router.post('/db-restore', authMiddleware, authorize('admin'),restoreLimiter, createRestore);



module.exports = router;