/**
 * EstateFox Theme Configuration
 *
 * Brand colors and styling constants extracted from the original EstateFox site.
 * This theme provides a consistent design system across the application.
 */

export const Colors = {
  // Brand Primary Colors
  primary: {
    navy: '#17425a',      // Primary navy blue - main brand color
    lightBlue: '#2d99d1', // Secondary light blue
    orange: '#ea8a2e',    // Accent orange
  },

  // Neutrals
  neutral: {
    white: '#ffffff',
    offWhite: '#f8f9fa',
    lightGray: '#e9ecef',
    gray: '#6c757d',
    darkGray: '#343a40',
    black: '#000000',
  },

  // Semantic Colors
  semantic: {
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },

  // UI States
  states: {
    disabled: '#adb5bd',
    border: '#dee2e6',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
};

export const Typography = {
  fonts: {
    primary: 'Raleway',   // Main font for headings and UI
    secondary: 'Bitter',  // Secondary font for body text
    monospace: 'monospace',
  },

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.states.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.states.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.states.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

/**
 * Default theme object combining all theme constants
 */
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  breakpoints: Breakpoints,
};

export default Theme;
