import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys
const KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  FAVORITES: 'favorites',
};

/**
 * Secure storage for sensitive data (auth tokens)
 */
export const secureStorage = {
  /**
   * Save auth token securely
   */
  async saveToken(token) {
    try {
      await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
      return { success: true };
    } catch (error) {
      console.error('Error saving token:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get auth token
   */
  async getToken() {
    try {
      const token = await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
      return { success: true, data: token };
    } catch (error) {
      console.error('Error getting token:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete auth token
   */
  async deleteToken() {
    try {
      await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
      return { success: true };
    } catch (error) {
      console.error('Error deleting token:', error);
      return { success: false, error: error.message };
    }
  },
};

/**
 * Regular storage for non-sensitive data
 */
export const storage = {
  /**
   * Save user data
   */
  async saveUser(user) {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.error('Error saving user:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user data
   */
  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(KEYS.USER_DATA);
      return { success: true, data: userData ? JSON.parse(userData) : null };
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete user data
   */
  async deleteUser() {
    try {
      await AsyncStorage.removeItem(KEYS.USER_DATA);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save favorites
   */
  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
      return { success: true };
    } catch (error) {
      console.error('Error saving favorites:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get favorites
   */
  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(KEYS.FAVORITES);
      return { success: true, data: favorites ? JSON.parse(favorites) : [] };
    } catch (error) {
      console.error('Error getting favorites:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Clear all storage
   */
  async clearAll() {
    try {
      await AsyncStorage.clear();
      await secureStorage.deleteToken();
      return { success: true };
    } catch (error) {
      console.error('Error clearing storage:', error);
      return { success: false, error: error.message };
    }
  },
};

export default storage;
