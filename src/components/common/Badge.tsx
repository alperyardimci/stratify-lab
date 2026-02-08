import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return theme.colors.success + '20';
      case 'error':
        return theme.colors.error + '20';
      case 'warning':
        return theme.colors.warning + '20';
      case 'info':
        return theme.colors.primary + '20';
      default:
        return theme.colors.border;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        size === 'small' ? styles.badgeSmall : styles.badgeMedium,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'small' ? styles.textSmall : styles.textMedium,
          { color: getTextColor() },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeMedium: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: theme.fontSize.xs,
  },
  textMedium: {
    fontSize: theme.fontSize.sm,
  },
});

export default Badge;
