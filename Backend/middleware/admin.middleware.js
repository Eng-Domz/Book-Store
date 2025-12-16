const { authenticate } = require('./auth.middleware');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.user_type === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Combined middleware: authenticate + admin check
const adminAuth = [authenticate, isAdmin];

module.exports = { isAdmin, adminAuth };

