const { authenticateToken, authorizeRole, authorizePermission } = require('./auth.middleware');
const { errorHandler, notFound } = require('./error.middleware');
const { validate } = require('./validation.middleware');

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizePermission,
  errorHandler,
  notFound,
  validate
};
