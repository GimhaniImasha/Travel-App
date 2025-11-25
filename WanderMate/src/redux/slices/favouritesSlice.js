import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Load favorites from AsyncStorage
 */
export const loadFavorites = createAsyncThunk(
  'favourites/loadFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const result = await storage.getFavorites();
      
      if (result.success) {
        return result.data || [];
      } else {
        return rejectWithValue(result.error || 'Failed to load favorites');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load favorites');
    }
  }
);

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (!exists) {
        state.items.push(action.payload);
        // Persist to storage
        storage.saveFavorites(state.items);
      }
    },
    removeFavorite: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
      // Persist to storage
      storage.saveFavorites(state.items);
    },
    clearFavorites: (state) => {
      state.items = [];
      // Persist to storage
      storage.saveFavorites([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectFavorites = (state) => state.favourites.items;
export const selectFavoritesLoading = (state) => state.favourites.loading;
export const selectFavoritesError = (state) => state.favourites.error;
export const selectIsFavorite = (placeId) => (state) =>
  state.favourites.items.some((item) => item.id === placeId);

export const { addFavorite, removeFavorite, clearFavorites } = favouritesSlice.actions;
export default favouritesSlice.reducer;
