import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import { restoreSession } from './src/redux/slices/authSlice';
import { loadFavorites } from './src/redux/slices/favouritesSlice';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore session and favorites on app launch
    dispatch(restoreSession());
    dispatch(loadFavorites());
  }, [dispatch]);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}
