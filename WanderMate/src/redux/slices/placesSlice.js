import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchResults: [],
  selectedPlace: null,
  status: 'idle',
  error: null,
};

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.status = 'succeeded';
    },
    setSelectedPlace: (state, action) => {
      state.selectedPlace = action.payload;
    },
    setLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.error = null;
      state.status = 'idle';
    },
    resetPlaces: (state) => {
      return initialState;
    },
  },
});

// Selectors
export const selectPlaces = (state) => state.places;
export const selectSearchResults = (state) => state.places.searchResults;
export const selectSelectedPlace = (state) => state.places.selectedPlace;
export const selectPlacesStatus = (state) => state.places.status;
export const selectPlacesError = (state) => state.places.error;

export const {
  setSearchResults,
  setSelectedPlace,
  setLoading,
  setError,
  clearSearchResults,
  resetPlaces,
} = placesSlice.actions;

export default placesSlice.reducer;
