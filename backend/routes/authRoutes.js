const express = require('express');
const UserController = require('../controllers/userController');
const AppError = require('../utils/appError');

/**
 * Authentication Routes
 * Defines routes for user registration, login, and profile management
 */
const router = express.Router();

// Comprehensive Logging Middleware
router.use((req, res, next) => {
  console.log(' AUTH ROUTES: Middleware Entry Point', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: {
      contentType: req.get('Content-Type'),
      origin: req.get('Origin'),
      host: req.get('Host'),
      referer: req.get('Referer')
    },
    body: req.body ? JSON.stringify(req.body) : 'No body',
    remoteAddress: req.socket.remoteAddress,
    protocol: req.protocol
  });

  // Add a flag to track middleware progression
  req.middlewareStage = 'initial';
  next();
});

// CORS Pre-flight handler with detailed logging
router.options('*', (req, res) => {
  console.log('DETAILED CORS Pre-flight Request:', {
    timestamp: new Date().toISOString(),
    origin: req.get('Origin'),
    method: req.get('Access-Control-Request-Method'),
    requestHeaders: req.get('Access-Control-Request-Headers'),
    fullHeaders: req.headers
  });

  // Explicitly set CORS headers with wildcard origin
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight response for 24 hours
  
  res.sendStatus(200);
});

// Explicit CORS middleware with comprehensive logging
router.use((req, res, next) => {
  console.log('COMPREHENSIVE CORS Middleware Debug:', {
    origin: req.get('Origin'),
    method: req.method,
    contentType: req.get('Content-Type'),
    fullHeaders: req.headers,
    body: req.body
  });

  // Explicitly set CORS headers for all routes
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Content Type Validation Middleware
router.use((req, res, next) => {
  console.log('Content Type Validation:', {
    method: req.method,
    contentType: req.get('Content-Type'),
    body: req.body
  });

  // Explicitly parse JSON if needed
  if (req.method === 'POST' && req.get('Content-Type') === 'application/json') {
    try {
      req.body = JSON.parse(JSON.stringify(req.body));
    } catch (error) {
      console.error('JSON Parsing Error:', error);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  next();
});

// Public Routes
router.post('/login', (req, res, next) => {
  console.log(' LOGIN Route Reached', {
    timestamp: new Date().toISOString(),
    body: req.body,
    headers: {
      contentType: req.get('Content-Type'),
      origin: req.get('Origin')
    }
  });
  
  // Debug: Log all request details
  console.log('Full Login Request Details:', {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body
  });
  
  req.middlewareStage = 'login-route';
  next();
}, UserController.login);

router.post('/register', UserController.register);
router.get('/me', UserController.getMe);

// Error Handling Middleware
router.use((err, req, res, next) => {
  console.error(' AUTH ROUTES Error Handler:', {
    timestamp: new Date().toISOString(),
    error: err,
    middlewareStage: req.middlewareStage || 'unknown',
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    headers: req.headers
  });

  // Default to 500 if no status code
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stage: req.middlewareStage,
      stack: err.stack 
    })
  });
});

// Catch-all route handler for auth routes
router.use((req, res, next) => {
  next(AppError.create.notFound(`Cannot ${req.method} ${req.originalUrl} in auth routes`));
});

module.exports = router;
