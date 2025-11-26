import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme, spacing, fontSize, borderRadius } from './theme';
import { selectIsDarkMode } from '../redux/slices/uiSlice';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const isDarkMode = useSelector(selectIsDarkMode);
  
  const theme = {
    colors: isDarkMode ? darkTheme.colors : lightTheme.colors,
    spacing,
    fontSize,
    borderRadius,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
