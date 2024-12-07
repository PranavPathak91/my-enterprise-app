// Enterprise Backend Application
/**
 * This is the main entry point for our backend application.
 * It sets up the Express server, configures middleware, 
 * connects to the database, and defines core application routes.
 * 
 * Key Responsibilities:
 * 1. Initialize Express application
 * 2. Configure middleware for parsing and security
 * 3. Establish database connection
 * 4. Set up core routes and error handling
 * 5. Start the server
 * 
 * Architecture Principles:
 * - Separation of Concerns
 * - Modular Design
 * - Error Resilience
 * - Environment Configuration
 */

// Early error handling
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
  
  // Write to a basic error file as a fallback
  const fs = require('fs');
  const path = require('path');
  const errorLogPath = path.join(__dirname, 'early-error.log');
  
  fs.appendFileSync(errorLogPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'Uncaught Exception',
    name: error.name,
    message: error.message,
    stack: error.stack
  }, null, 2) + '\n');

  process.exit(1);
});

// Capture any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...', {
    reason: reason,
    promise: promise
  });
  
  // Write to a basic error file as a fallback
  const fs = require('fs');
  const path = require('path');
  const errorLogPath = path.join(__dirname, 'early-rejection.log');
  
  fs.appendFileSync(errorLogPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'Unhandled Rejection',
    reason: reason,
    promise: promise.toString()
  }, null, 2) + '\n');

  process.exit(1);
});

// Import required modules
// Core Node.js and Express dependencies
const express = require('express');     // Web application framework
const mongoose = require('mongoose');   // MongoDB object modeling tool
const cors = require('cors');           // Enable Cross-Origin Resource Sharing
const dotenv = require('dotenv');       // Load environment variables from .env file
const path = require('path');           // Node.js path module
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import logger from config
const logger = require('./config/logger');

// Import custom error handling
const AppError = require('./utils/appError');

// Import route modules
const authRoutes = require('./routes/authRoutes');

// Database Connection
const connectDB = require('./config/database');

// Create Express application instance
// This is the core of our backend, handling HTTP requests and routing
const app = express();

// Define the port for the server to listen on
// Uses environment variable or defaults to 5000
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/enterprise_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Successfully connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error message
  let errorMessage = 'An internal server error occurred';
  let statusCode = 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    errorMessage = 'Duplicate key error';
  }

  res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Server Startup Function with Database Connection
const startServer = async (app, initialPort) => {
  try {
    // Connect to database before starting server
    const dbConnection = await connectDB();

    // Dynamically find an available port if default is in use
    const net = require('net');
    
    // Ensure port is a valid number
    const port = Number(initialPort);
    if (isNaN(port) || port < 0 || port > 65535) {
      throw new Error(`Invalid port: ${initialPort}. Port must be between 0 and 65535.`);
    }
    
    const findAvailablePort = (portToTry) => {
      return new Promise((resolve, reject) => {
        const server = net.createServer();
        
        server.listen(portToTry, () => {
          const actualPort = server.address().port;
          server.close(() => {
            // Start Express server on this port
            const httpServer = app.listen(actualPort, () => {
              logger.info(` Server running on port ${actualPort}`);
              resolve({ 
                port: actualPort, 
                dbConnection 
              });
            });

            // Handle server errors
            httpServer.on('error', (err) => {
              logger.error('Server startup error', {
                error: err.message,
                stack: err.stack
              });
              reject(err);
            });
          });
        });

        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            // If port is in use, try next port
            findAvailablePort(portToTry + 1).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        });
      });
    };

    const server = await findAvailablePort(port);
    
    // Ensure port file is created after successful startup
    const ensurePortFile = (port) => {
      const fs = require('fs');
      const path = require('path');
      const portFilePath = path.join(__dirname, '.port');

      try {
        // Write port to file
        fs.writeFileSync(portFilePath, port.toString(), 'utf8');
        
        logger.info('Port file created successfully', {
          portFilePath,
          port
        });
      } catch (error) {
        logger.error('Failed to create port file', {
          error: error.message,
          portFilePath
        });
      }
    };

    ensurePortFile(server.port);

    return server.port;
  } catch (error) {
    // Comprehensive error logging
    logger.error('Server Startup Failed', {
      error: error.message,
      stack: error.stack,
      port: initialPort
    });
    
    // Attempt graceful shutdown
    process.exit(1);
  }
};

// Start the server with initial port configuration
startServer(app, PORT)
  .then((actualPort) => {
    logger.info(`Server successfully started on port ${actualPort}`);
    
    // Update environment variable with the actual port
    process.env.PORT = actualPort;
  })
  .catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
  });

// Graceful Shutdown Handling
// Ensures clean shutdown of server and database connections
process.on('SIGTERM', () => {
  logger.info('SIGTERM received: Closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Export the app for potential testing or advanced usage
module.exports = app;
