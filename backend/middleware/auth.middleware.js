const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authorize by Role
const authorizeRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.',
          requiredRoles: roles,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization error', error: error.message });
    }
  };
};

// Authorize by Permission
const authorizePermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const hasPermission = permissions.some(permission => 
        user.permissions && user.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Access denied. Required permission not found.',
          requiredPermissions: permissions
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization error', error: error.message });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizePermission
};
