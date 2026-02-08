import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Button } from '../common';

interface ActionButtonsProps {
  isOptimizing: boolean;
  isLoading: boolean;
  onOptimize: () => void;
  onSimulate: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isOptimizing,
  isLoading,
  onOptimize,
  onSimulate,
  t,
}) => {
  return (
    <View style={styles.actionButtons}>
      <Button
        title={isOptimizing ? t('simulator.analyzing') : t('simulator.findBestStrategy')}
        onPress={onOptimize}
        loading={isOptimizing}
        disabled={isOptimizing || isLoading}
        variant="outline"
        style={styles.optimizeButton}
      />
      <Button
        title={isLoading ? t('simulator.simulating') : t('simulator.startSimulation')}
        onPress={onSimulate}
        loading={isLoading}
        disabled={isLoading || isOptimizing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  optimizeButton: {
    borderColor: theme.colors.warning,
  },
});
