import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#0B4A7A', // NH Salem Blue
  secondary: '#FFB800', // Gold/Yellow
  background: '#F9FAFB', // Light Gray
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
  textLight: '#9CA3AF',
  surfaceDark: '#1E293B',
  adminPrimary: '#1E3A8A',
  admin: {
    primary: '#1E3A8A', // Dark Navy
    surface: '#F1F5F9', // Light Slate
  }
};

export const Typography = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700', color: Colors.text },
  h2: { fontSize: 20, fontWeight: '600', color: Colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: Colors.text },
  body: { fontSize: 16, color: Colors.text },
  bodySmall: { fontSize: 14, color: Colors.textSecondary },
  caption: { fontSize: 12, color: Colors.textSecondary },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
