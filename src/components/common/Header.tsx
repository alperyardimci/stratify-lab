import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.sm }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftIcon && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              disabled={!onLeftPress}
            >
              {leftIcon}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.rightSection}>
          {rightIcon && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              disabled={!onRightPress}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
});

export default Header;
