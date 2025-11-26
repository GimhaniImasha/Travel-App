import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import placesReducer from './slices/placesSlice';
import favouritesReducer from './slices/favouritesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    favourites: favouritesReducer,
    ui: uiReducer,
  },
});

export default store;
