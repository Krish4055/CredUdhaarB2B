// CredUdhaar B2B Design System
export const colors = {
  // Primary - Trust & Financial
  primary: '#1A73E8',      // Professional blue
  primaryDark: '#135AB8',
  primaryLight: '#4A90E2',
  
  // Success & Status
  success: '#0F9D58',
  successLight: '#D4F4DD',
  warning: '#F9AB00',
  warningLight: '#FFF4E5',
  error: '#D93025',
  errorLight: 'rgba(217, 48, 37, 0.1)',
  
  // Surfaces
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Text
  text: '#202124',
  textSecondary: '#5F6368',
  textTertiary: '#80868B',
  textInverse: '#FFFFFF',
  
  // Semantic
  verified: '#0F9D58',
  pending: '#F9AB00',
  overdue: '#D93025',
  
  // Backgrounds
  backgroundSecondary: '#F5F5F5',
  
  // Role-specific
  supplier: '#1A73E8',
  buyer: '#7C3AED',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  bodySemibold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  captionMedium: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  smallMedium: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};
