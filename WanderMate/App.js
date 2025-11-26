import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/redux/store';
import { restoreSession } from './src/redux/slices/authSlice';
import { loadFavorites } from './src/redux/slices/favouritesSlice';
import { loadTheme } from './src/redux/slices/uiSlice';
import { ThemeProvider } from './src/theme/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.ui.isDarkMode);

  useEffect(() => {
    // Restore session, favorites, and theme on app launch
    dispatch(restoreSession());
    dispatch(loadFavorites());
    dispatch(loadTheme());
  }, [dispatch]);

  return (
    <>
      <AppNavigator />
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

