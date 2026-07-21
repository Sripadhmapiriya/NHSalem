import { StyleSheet, Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const COLORS = {
  primary: '#166534',
  primaryLight: '#dcfce7',
  primaryDark: '#14532d',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  navy: '#0f172a',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const SPACING = {
  xs: 4, sm: 8, md: 12,
  lg: 16, xl: 20, xxl: 24,
};

export const RADIUS = {
  sm: 8, md: 12, lg: 16,
  xl: 20, xxl: 24, full: 999,
};

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    marginVertical: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
