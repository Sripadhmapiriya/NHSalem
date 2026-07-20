import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'admin';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.border;
    switch (variant) {
      case 'primary': return Colors.primary;
      case 'secondary': return Colors.secondary;
      case 'outline': return 'transparent';
      case 'admin': return Colors.admin.primary;
      default: return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textSecondary;
    switch (variant) {
      case 'outline': return Colors.primary;
      case 'secondary': return Colors.text;
      default: return Colors.surface;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md };
      case 'large': return { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl };
      default: return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1, borderColor: Colors.primary },
        getPadding(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    ...Typography.h3,
    fontWeight: '600',
  },
});
