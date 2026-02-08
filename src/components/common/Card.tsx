import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { theme } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 'medium',
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return theme.spacing.sm;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };

  const cardContent = (
    <View style={[styles.card, { padding: getPadding() }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default Card;
