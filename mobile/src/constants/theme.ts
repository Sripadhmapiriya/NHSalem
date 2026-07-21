import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#0B4A7A', // NH Salem Blue
  secondary: '#FFB800', // Gold/Yellow
  background: '#f8fafc',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#64748b',
  border: '#f1f5f9',
  error: '#ef4444',
  success: '#166534',
  white: '#FFFFFF',
  textLight: '#94a3b8',
  surfaceDark: '#1E293B',
  adminPrimary: '#1E3A8A',
  admin: {
    primary: '#1E3A8A',
    surface: '#F1F5F9',
  }
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: '#0f172a', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: '#0f172a', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '700' as const, color: '#0f172a', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400' as const, color: '#374151', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: '#64748b', lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '600' as const, color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase' as const },
};

export const Typography = StyleSheet.create(typography);

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32
};

export const shadows = {
  sm: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
  },
  md: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4
  },
  lg: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 8
  }
};
