// Light Theme
export const lightTheme = {
  colors: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#A5D6A7',
    secondary: '#FF5722',
    secondaryDark: '#E64A19',
    secondaryLight: '#FFCCBC',
    
    background: '#FFFFFF',
    backgroundLight: '#E8F5E9',
    surface: '#F8F9FA',
    
    text: '#212121',
    textSecondary: '#757575',
    textLight: '#FFFFFF',
    
    border: '#E0E0E0',
    divider: '#BDBDBD',
    
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2E7D32',
    
    shadow: '#000000',
  },
};

// Dark Theme
export const darkTheme = {
  colors: {
    primary: '#66BB6A',
    primaryDark: '#2E7D32',
    primaryLight: '#81C784',
    secondary: '#FF5722',
    secondaryDark: '#D84315',
    secondaryLight: '#FF7043',
    
    background: '#121212',
    backgroundLight: '#1a1f1a',
    surface: '#1E1E1E',
    
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textLight: '#FFFFFF',
    
    border: '#2C2C2C',
    divider: '#3C3C3C',
    
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#66BB6A',
    
    shadow: '#000000',
  },
};

// Legacy exports for backward compatibility
export const colors = lightTheme.colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export default {
  lightTheme,
  darkTheme,
  spacing,
  fontSize,
  borderRadius,
};
