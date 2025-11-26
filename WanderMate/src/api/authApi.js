import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance for DummyJSON API
const authClient = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage key for registered users
const REGISTERED_USERS_KEY = 'registered_users';

// Store registered users in memory (in a real app, this would be in backend/database)
const registeredUsers = new Map();

/**
 * Load registered users from AsyncStorage into memory
 */
const loadRegisteredUsers = async () => {
  try {
    const data = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
    if (data) {
      const users = JSON.parse(data);
      Object.entries(users).forEach(([username, userData]) => {
        registeredUsers.set(username, userData);
      });
    }
  } catch (error) {
    console.error('Error loading registered users:', error);
  }
};

/**
 * Save registered users from memory to AsyncStorage
 */
const saveRegisteredUsers = async () => {
  try {
    const users = {};
    registeredUsers.forEach((userData, username) => {
      users[username] = userData;
    });
    await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving registered users:', error);
  }
};

// Load users on module initialization
loadRegisteredUsers();

/**
 * Login user with username and password
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} - Response with success status and data/error
 * 
 * @example
 * const result = await login({ username: 'emilys', password: 'emilyspass' });
 * if (result.success) {
 *   console.log('Token:', result.data.token);
 *   console.log('User:', result.data);
 * }
 */
export const login = async ({ username, password }) => {
  try {
    if (!username || !password) {
      return {
        success: false,
        error: 'Username and password are required',
      };
    }

    // Ensure users are loaded from storage
    await loadRegisteredUsers();

    // Check if user is registered locally first
    const localUser = registeredUsers.get(username);
    if (localUser) {
      if (localUser.password === password) {
        return {
          success: true,
          data: {
            id: localUser.id,
            username: localUser.username,
            email: localUser.email,
            firstName: localUser.firstName,
            lastName: localUser.lastName,
            token: 'local-token-' + Date.now(),
          },
        };
      } else {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }
    }

    // Try DummyJSON API for demo users
    const response = await authClient.post('/auth/login', {
      username,
      password,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Login error:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Invalid credentials',
    };
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.username - Desired username (extracted from email)
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - Password
 * @returns {Promise<Object>} - Response with success status and data/error
 * 
 * @example
 * const result = await register({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   username: 'johndoe',
 *   email: 'johndoe@example.com',
 *   password: 'password123'
 * });
 * if (result.success) {
 *   console.log('User created:', result.data);
 * }
 */
export const register = async ({ firstName, lastName, username, email, password }) => {
  try {
    if (!firstName || !lastName || !username || !email || !password) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }

    // Ensure users are loaded from storage
    await loadRegisteredUsers();

    // Check if username already exists
    if (registeredUsers.has(username)) {
      return {
        success: false,
        error: 'This email is already registered',
      };
    }

    // Store user locally
    const userId = Date.now();
    
    registeredUsers.set(username, {
      id: userId,
      firstName,
      lastName,
      username,
      password,
      email,
    });

    // Persist to AsyncStorage
    await saveRegisteredUsers();

    // Also try to register with DummyJSON (optional, for demo)
    try {
      await authClient.post('/users/add', {
        firstName,
        lastName,
        username,
        password,
        email,
      });
    } catch (dummyError) {
      // Ignore DummyJSON errors since we stored locally
      console.log('DummyJSON registration skipped (using local storage)');
    }

    return {
      success: true,
      data: {
        id: userId,
        firstName,
        lastName,
        username,
        email,
      },
    };
  } catch (error) {
    console.error('Register error:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Registration failed',
    };
  }
};

// Export the axios client for advanced usage if needed
export default authClient;
