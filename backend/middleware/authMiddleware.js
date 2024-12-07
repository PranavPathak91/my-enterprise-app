const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */
class AuthMiddleware {
  /**
   * Protect routes by verifying JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async protect(req, res, next) {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if no token
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return res.status(401).json({
          status: 'error',
          message: 'User no longer exists'
        });
      }

      // Attach user to request object
      req.user = currentUser;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      });
    }
  }

  /**
   * Restrict route access to specific roles
   * @param {string[]} roles - Array of allowed roles
   */
  static restrictTo(...roles) {
    return (req, res, next) => {
      // Check if user's role is in the allowed roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to perform this action'
        });
      }
      next();
    };
  }

  /**
   * Generate JWT token for authentication
   * @param {string} id - User ID
   * @returns {string} JWT token
   */
  static generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
  }
}

module.exports = AuthMiddleware;
