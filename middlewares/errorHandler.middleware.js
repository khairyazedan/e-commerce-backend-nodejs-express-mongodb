const logger = require('../utils/logger.util.js');

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status && typeof err.status === 'string' ? err.status : 'error';

  if (!err.isOperational) {
    logger.error(`${err.message} | ${err.stack}`);
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
    });
  }

  if (err.isOperational) {
    return res.status(statusCode).json({ status, message: err.message });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong, try again later.',
  });
};