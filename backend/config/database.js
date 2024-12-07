const mongoose = require('mongoose');
const logger = require('./logger');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Database connection configuration
const connectDB = async () => {
  try {
    // Detailed environment variable logging
    logger.info('Database Configuration Check', {
      envFilePath: envPath,
      mongoURI: process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    });

    // Validate MONGODB_URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const mongoURI = process.env.MONGODB_URI;
    
    // Mongoose connection options
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Detailed connection logging (mask sensitive info)
    logger.info('Attempting MongoDB Connection', {
      uri: mongoURI.replace(/:[^:]*@/, ':****@'), // Mask any potential password
      options: Object.keys(connectionOptions)
    });

    // Establish connection
    const connection = await mongoose.connect(mongoURI, connectionOptions);

    // Safe connection logging
    logger.info('Successfully connected to MongoDB database', {
      database: connection.connection?.db?.databaseName || 'Unknown',
      host: connection.connection?.host || 'Unknown'
    });

    // Optional: Log database events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose default connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error', {
        error: err.message,
        stack: err.stack
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose connection disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });

    return connection;
  } catch (error) {
    // Comprehensive error logging
    logger.error('MongoDB Connection Failed', {
      error: error.message,
      stack: error.stack,
      mongoURI: process.env.MONGODB_URI ? 'DEFINED' : 'UNDEFINED',
      envFilePath: envPath,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Rethrow to allow top-level error handling
    throw error;
  }
};

module.exports = connectDB;
