import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as authApiLogin } from '../../api/authApi';
import { secureStorage, storage } from '../../utils/storage';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

/**
 * Login user and persist to secure storage
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const result = await authApiLogin(payload);
      
      if (result.success) {
        // Persist token and user data
        await secureStorage.saveToken(result.data.token);
        await storage.saveUser(result.data);
        
        return {
          user: result.data,
          token: result.data.token,
        };
      } else {
        return rejectWithValue(result.error || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Restore session from storage on app launch
 */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const tokenResult = await secureStorage.getToken();
      const userResult = await storage.getUser();
      
      if (tokenResult.success && tokenResult.data && userResult.success && userResult.data) {
        return {
          user: userResult.data,
          token: tokenResult.data,
        };
      } else {
        return rejectWithValue('No session found');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Session restoration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear storage
      secureStorage.deleteToken();
      storage.deleteUser();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Restore session
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
