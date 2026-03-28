const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Token comes in the header as: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to the request so controllers can use it
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next(); // pass to the next handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role-based access: pass allowed roles as an array
// Example: authorize(['SUPER_ADMIN', 'HR_MANAGER'])
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };