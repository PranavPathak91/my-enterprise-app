# Enterprise Authentication Application

A full-stack enterprise authentication application with React frontend and Node.js backend.

## Project Structure

```
my-enterprise-app/
├── backend/
│   ├── app.js                 # Main Express application
│   ├── controllers/
│   │   └── userController.js  # User authentication logic
│   ├── models/
│   │   └── User.js           # User model schema
│   ├── routes/
│   │   └── authRoutes.js     # Authentication routes
│   └── utils/
│       └── appError.js       # Error handling utilities
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── authService.ts # Authentication service
│   │   ├── components/
│   │   ├── context/
│   │   └── index.tsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Backend Configuration

### app.js
```javascript
// CORS Configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
```

### authRoutes.js
```javascript
const express = require('express');
const UserController = require('../controllers/userController');
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
      host: req.get('Host')
    }
  });
  next();
});

// Routes
router.post('/login', UserController.login);
router.post('/register', UserController.register);

module.exports = router;
```

## Frontend Configuration

### authService.ts
```typescript
import axios from 'axios';

// Base URL for API calls
const API_URL = 'http://localhost:5001';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,  // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request Config:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      message: error.message,
      config: error.config,
      response: error.response
    });
    return Promise.reject(error);
  }
);

class AuthService {
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  }

  static async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }
}

export default AuthService;
```

## Running the Application

1. Start the Backend:
```bash
cd backend
npm run dev
# Server runs on port 5001
```

2. Start the Frontend:
```bash
cd frontend
npm start
# Frontend runs on port 3001
```

## API Endpoints

### Authentication

- **Register User**
  - POST `/api/auth/register`
  - Body: `{ firstName, lastName, email, password }`

- **Login User**
  - POST `/api/auth/login`
  - Body: `{ email, password }`

## Test Users

1. **Jane Smith**
   - Email: jane.smith@example.com
   - Password: SecurePass456!

2. **John Doe**
   - Email: john.doe@example.com

## Important Notes

1. The backend uses MongoDB for data storage
2. CORS is configured to allow all origins (*)
3. Frontend is configured with Axios for API requests
4. JWT is used for authentication
5. Request logging is implemented on both frontend and backend

## Debugging Tips

1. Check the browser console for detailed request/response logs
2. Backend logs show comprehensive request information
3. MongoDB connection status is logged on server start
4. CORS headers are properly configured for cross-origin requests

## Security Considerations

1. Passwords are hashed before storage
2. JWT tokens are used for session management
3. CORS is configured to allow necessary cross-origin requests
4. Input validation is implemented on both frontend and backend

## Complete Code Backup

### Backend

#### app.js
```javascript
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

// Middleware to log and debug all incoming requests
app.use((req, res, next) => {
  logger.info('Comprehensive Request Logging', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
    query: req.query,
    cookies: req.cookies,
    ip: req.ip
  });

  // Add CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Additional CORS headers middleware
app.use((req, res, next) => {
  logger.info('Additional CORS Middleware - Origin', req.get('origin'));
  logger.info('Additional CORS Middleware - Method', req.method);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    logger.info('Responding to OPTIONS request');
    return res.sendStatus(200);
  }
  
  next();
});

// Mongoose Configuration
mongoose.set('strictQuery', false);
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  dbName: 'enterprise_app'
})
.then(() => {
  logger.info(' Successfully connected to MongoDB database');
})
.catch((err) => {
  logger.error(' MongoDB Connection Error', err);
  process.exit(1);
});

// Mount routes
app.use('/api/auth', authRoutes);
```

#### routes/authRoutes.js
```javascript
const express = require('express');
const UserController = require('../controllers/userController');
const AppError = require('../utils/appError');

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

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  res.sendStatus(200);
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
  
  req.middlewareStage = 'login-route';
  next();
}, UserController.login);

router.post('/register', UserController.register);

module.exports = router;
```

#### controllers/userController.js
```javascript
const User = require('../models/User');
const AuthMiddleware = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');

class UserController {
  static async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      if (!email || !password) {
        return next(AppError.create.badRequest('Please provide email and password', {
          missingFields: !email ? ['email'] : !password ? ['password'] : []
        }));
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(AppError.create.conflict('User with this email already exists', {
          email
        }));
      }

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: role || 'user'
      });

      const token = AuthMiddleware.generateToken(newUser._id);

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

      if (!email || !password) {
        console.error('❌ LOGIN VALIDATION FAILURE', { 
          email: !!email, 
          password: !!password 
        });
        return next(AppError.create.badRequest('Please provide email and password'));
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return next(AppError.create.unauthorized('Incorrect email or password'));
      }

      const token = AuthMiddleware.generateToken(user._id);

      const userResponse = {
        _id: user._id,
        email: user.email,
        role: user.role
      };

      res.status(200).json({
        status: 'success',
        token,
        data: { user: userResponse }
      });
    } catch (error) {
      next(AppError.create.internalServer('Login failed', {
        originalError: error.message
      }));
    }
  }
}

module.exports = UserController;
```

### Frontend

#### src/services/authService.ts
```typescript
import axios from 'axios';

// Base URL for API calls
const API_URL = 'http://localhost:5001';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,  // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request Config:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      message: error.message,
      config: error.config,
      response: error.response
    });
    return Promise.reject(error);
  }
);

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  data: {
    user: {
      _id: string;
      firstName?: string;
      lastName?: string;
      email: string;
      role: string;
    }
  }
}

class AuthService {
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  }

  static async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }

  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export default AuthService;
```

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
