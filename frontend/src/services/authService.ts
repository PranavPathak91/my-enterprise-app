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

// Interface for user registration data
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Interface for user login data
export interface LoginData {
  email: string;
  password: string;
}

// Interface for authentication response
export interface AuthResponse {
  token: string;
  data: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    }
  }
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Register a new user
   * @param userData User registration details
   * @returns Promise with authentication response
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/register', userData);
      
      // Store token and user info if registration is successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      // Handle registration errors
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * User login
   * @param credentials User login credentials
   * @returns Promise with authentication response
   */
  static async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
      
      // Store token and user info if login is successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      // Handle login errors
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * Removes stored token and user info
   */
  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Get current authenticated user
   * @returns User object or null
   */
  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   * @returns Boolean indicating authentication status
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get authentication token
   * @returns Token string or null
   */
  static getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export default AuthService;
