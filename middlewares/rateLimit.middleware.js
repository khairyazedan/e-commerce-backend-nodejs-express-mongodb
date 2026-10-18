const { rateLimit } = require('express-rate-limit');
const logger = require('../utils/logger.util.js');

exports.backupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(
      `Backup rate limit hit | user: ${req.user?._id || 'n/a'} | ip: ${req.ip} | path: ${req.originalUrl}`
    );
    res.status(options.statusCode).json({
      message: "Too many backup requests, please try again later.",
    });
  },
});

exports.restoreLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 2,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(
      `Restore rate limit hit | user: ${req.user?._id || 'n/a'} | ip: ${req.ip} | path: ${req.originalUrl}`
    );
    res.status(options.statusCode).json({
      message: "Too many restore requests, please try again later.",
    });
  },
});

exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8', 
  legacyHeaders: false,
  message: { status: 429, message: "Too many requests, please try again later." },
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(
      `Too many login attempts | ip: ${req.ip} | email: ${req.body?.email || 'n/a'} | path: ${req.originalUrl}`
    );
    res.status(options.statusCode).json({
      message: "Too many login attempts, please try again later.",
    });
  },
});

// const {rateLimit} = require('express-rate-limit');

// exports.globalLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     limit: 100,
//     standardHeaders: true,
//     legacyHeaders:false,
//     message:{
//         status : 429,
//         error: "Too many requests, please try again later."
//     }
// })

// // login middleware

// exports.authLimiter = rateLimit({
//     windowMs: 60 * 1000, //1 minute
//     limit: 5,
//     message:{
//         status : 429,
//         error: "Too many login attempts from this IP, please try again after a minute."
//     }
// })