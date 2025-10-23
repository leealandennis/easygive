const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { company: true }
      });
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user account is inactive'
        });
      }

      // Get company information
      req.company = req.user.company;
      
      if (!req.company || !req.company.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, company account is inactive'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user belongs to the same company
const checkCompanyAccess = (req, res, next) => {
  if (!req.user || !req.company) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, user or company not found'
    });
  }

  // Super admins can access any company
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if the requested resource belongs to the user's company
  const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (requestedCompanyId && requestedCompanyId !== req.user.companyId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access resources from another company'
    });
  }

  next();
};

// Check if user can access another user's data
const checkUserAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, user not found'
    });
  }

  const requestedUserId = req.params.userId || req.params.id;
  
  // Super admins can access any user
  if (req.user.role === 'super_admin') {
    return next();
  }

  // HR admins can access users in their company
  if (req.user.role === 'hr_admin') {
    return next();
  }

  // Employees can only access their own data
  if (requestedUserId && requestedUserId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access another user\'s data'
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { company: true }
      });
      
      if (req.user && req.user.isActive) {
        req.company = req.user.company;
      }
    } catch (error) {
      // Ignore token errors for optional auth
      console.log('Optional auth token error:', error.message);
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  checkCompanyAccess,
  checkUserAccess,
  optionalAuth
};
