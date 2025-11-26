import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

const initialState = {
  isDarkMode: false,
  loading: false,
};

/**
 * Load theme preference from AsyncStorage
 */
export const loadTheme = createAsyncThunk(
  'ui/loadTheme',
  async (_, { rejectWithValue }) => {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return theme === 'dark';
    } catch (error) {
      console.error('Error loading theme:', error);
      return rejectWithValue(error.message);
    }
  }
);

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Persist to AsyncStorage
      AsyncStorage.setItem(THEME_KEY, state.isDarkMode ? 'dark' : 'light');
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      // Persist to AsyncStorage
      AsyncStorage.setItem(THEME_KEY, action.payload ? 'dark' : 'light');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTheme.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.isDarkMode = action.payload;
      })
      .addCase(loadTheme.rejected, (state) => {
        state.loading = false;
        state.isDarkMode = false;
      });
  },
});

// Selectors
export const selectIsDarkMode = (state) => state.ui.isDarkMode;
export const selectThemeLoading = (state) => state.ui.loading;

export const { toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
