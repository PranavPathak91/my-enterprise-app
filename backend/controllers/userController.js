const User = require('../models/User');
const AuthMiddleware = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');

/**
 * User Controller
 * Handles user-related operations like registration, login, profile management
 */
class UserController {
  /**
   * Register a new user
   * @route POST /api/users/register
   */
  static async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Validate input
      if (!email || !password) {
        return next(AppError.create.badRequest('Please provide email and password', {
          missingFields: !email ? ['email'] : !password ? ['password'] : []
        }));
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(AppError.create.conflict('User with this email already exists', {
          email
        }));
      }

      // Create new user
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: role || 'user'
      });

      // Generate token
      const token = AuthMiddleware.generateToken(newUser._id);

      // Prepare response (exclude password)
      const userResponse = {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      };

      res.status(201).json({
        status: 'success',
        token,
        data: { user: userResponse }
      });
    } catch (error) {
      next(AppError.create.internalServer('Registration failed', {
        originalError: error.message
      }));
    }
  }

  /**
   * User login
   * @route POST /api/users/login
   */
  static async login(req, res, next) {
    try {
      console.log('🔍 COMPREHENSIVE Login Request Analysis', {
        requestBody: req.body,
        requestHeaders: req.headers,
        requestDetails: {
          method: req.method,
          path: req.path,
          timestamp: new Date().toISOString()
        }
      });

      const { email, password } = req.body;

      // Extensive input validation and logging
      console.log('🔐 FORENSIC Login Credentials Breakdown', {
        email: {
          exists: !!email,
          type: typeof email,
          length: email ? email.length : 'N/A',
          firstChars: email ? email.slice(0, 10) + '...' : 'N/A'
        },
        password: {
          exists: !!password,
          type: typeof password,
          length: password ? password.length : 'N/A',
          firstChars: password ? password.slice(0, 5) + '...' : 'N/A'
        }
      });

      if (!email || !password) {
        console.error('❌ LOGIN VALIDATION FAILURE', { 
          email, 
          password,
          missingFields: !email ? ['email'] : !password ? ['password'] : []
        });
        return next(AppError.create.badRequest('Please provide email and password', {
          missingFields: !email ? ['email'] : !password ? ['password'] : []
        }));
      }

      // Find user with password included
      console.time('🕒 User Lookup Duration');
      const user = await User.findOne({ email }).select('+password');
      console.timeEnd('🕒 User Lookup Duration');

      console.log('🔍 FORENSIC User Lookup Analysis', {
        email,
        userFound: !!user,
        userDetails: user ? {
          _id: user._id,
          email: user.email,
          passwordLength: user.password ? user.password.length : 'N/A',
          passwordFirstChars: user.password ? user.password.slice(0, 20) + '...' : 'N/A'
        } : null
      });

      // Check if user exists
      if (!user) {
        console.error('❌ AUTHENTICATION FAILURE: User Not Found', { 
          email,
          searchCriteria: { email }
        });
        return next(AppError.create.unauthorized('Incorrect email or password', {
          email,
          reason: 'User not found'
        }));
      }

      // Detailed password comparison
      console.time('🕒 Password Verification Duration');
      const isMatch = await user.comparePassword(password);
      console.timeEnd('🕒 Password Verification Duration');
      
      console.log('🔑 FORENSIC Password Verification Result', {
        isMatch,
        userId: user._id,
        email: user.email,
        verificationDetails: {
          candidatePasswordLength: password.length,
          storedPasswordLength: user.password.length
        }
      });

      if (!isMatch) {
        console.error('❌ AUTHENTICATION FAILURE: Password Mismatch', { 
          email,
          passwordMatchFailed: true,
          userId: user._id
        });
        return next(AppError.create.unauthorized('Incorrect email or password', {
          email,
          reason: 'Password mismatch'
        }));
      }

      // Generate token
      const token = AuthMiddleware.generateToken(user._id);

      console.log('✅ SUCCESSFUL LOGIN', {
        userId: user._id,
        email: user.email,
        tokenGenerated: !!token
      });

      // Respond with token and user info
      res.status(200).json({
        status: 'success',
        token,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('🆘 CATASTROPHIC Login Process Failure', {
        timestamp: new Date().toISOString(),
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        requestBody: req.body
      });

      next(AppError.create.internalServer('Login process failed', {
        originalError: error.message,
        errorDetails: {
          name: error.name,
          message: error.message
        }
      }));
    }
  }

  /**
   * Get current user profile
   * @route GET /api/users/me
   */
  static async getMe(req, res, next) {
    try {
      // This is a placeholder. In a real app, you'd use authentication middleware
      res.status(200).json({
        status: 'success',
        data: {
          message: 'User profile endpoint'
        }
      });
    } catch (error) {
      next(AppError.create.internalServer('Failed to retrieve user profile', {
        originalError: error.message
      }));
    }
  }
}

module.exports = UserController;
