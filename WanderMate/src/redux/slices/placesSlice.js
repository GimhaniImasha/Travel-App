import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { placesSearch, placesByTypeNear } from '../../api/tapi';

const initialState = {
  searchResults: [],
  selectedPlace: null,
  nearbyStops: [],
  nearbyStations: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

/**
 * Search for places by query
 */
export const searchPlaces = createAsyncThunk(
  'places/searchPlaces',
  async (query, { rejectWithValue }) => {
    try {
      const result = await placesSearch(query);
      
      if (result.success) {
        // Extract member array from TransportAPI response
        const places = result.data?.member || [];
        return places;
      } else {
        return rejectWithValue(result.error || 'Search failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

/**
 * Fetch nearby transport (bus stops and train stations)
 */
export const fetchNearbyTransport = createAsyncThunk(
  'places/fetchNearbyTransport',
  async ({ lat, lon }, { rejectWithValue }) => {
    try {
      // Fetch both bus stops and train stations in parallel
      const [busResult, trainResult] = await Promise.all([
        placesByTypeNear(lat, lon, 'bus_stop', 2), // Within 2km
        placesByTypeNear(lat, lon, 'train_station', 5), // Within 5km
      ]);
      
      const busStops = busResult.success ? (busResult.data?.member || []) : [];
      const trainStations = trainResult.success ? (trainResult.data?.member || []) : [];
      
      return {
        nearbyStops: busStops,
        nearbyStations: trainStations,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch nearby transport');
    }
  }
);

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setSelectedPlace: (state, action) => {
      state.selectedPlace = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.error = null;
      state.status = 'idle';
    },
    clearNearbyTransport: (state) => {
      state.nearbyStops = [];
      state.nearbyStations = [];
    },
    resetPlaces: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search places
      .addCase(searchPlaces.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchPlaces.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchPlaces.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch nearby transport
      .addCase(fetchNearbyTransport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNearbyTransport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.nearbyStops = action.payload.nearbyStops;
        state.nearbyStations = action.payload.nearbyStations;
        state.error = null;
      })
      .addCase(fetchNearbyTransport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectPlaces = (state) => state.places;
export const selectSearchResults = (state) => state.places.searchResults;
export const selectSelectedPlace = (state) => state.places.selectedPlace;
export const selectNearbyStops = (state) => state.places.nearbyStops;
export const selectNearbyStations = (state) => state.places.nearbyStations;
export const selectPlacesStatus = (state) => state.places.status;
export const selectPlacesError = (state) => state.places.error;

export const {
  setSelectedPlace,
  clearSearchResults,
  clearNearbyTransport,
  resetPlaces,
} = placesSlice.actions;
export default placesSlice.reducer;
