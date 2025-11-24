import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  places: [],
  selectedPlace: null,
  loading: false,
  error: null,
  searchQuery: '',
};

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    fetchPlacesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPlacesSuccess: (state, action) => {
      state.loading = false;
      state.places = action.payload;
      state.error = null;
    },
    fetchPlacesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedPlace: (state, action) => {
      state.selectedPlace = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearPlaces: (state) => {
      state.places = [];
      state.selectedPlace = null;
      state.error = null;
    },
  },
});

export const {
  fetchPlacesStart,
  fetchPlacesSuccess,
  fetchPlacesFailure,
  setSelectedPlace,
  setSearchQuery,
  clearPlaces,
} = placesSlice.actions;
export default placesSlice.reducer;
