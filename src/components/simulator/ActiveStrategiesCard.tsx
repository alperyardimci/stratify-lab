import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Card } from '../common';
import { PresetStrategy } from '../../constants/presetStrategies';
import { getStrategyName, Language } from '../../i18n';

interface ActiveStrategiesCardProps {
  activeStrategies: PresetStrategy[];
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const ActiveStrategiesCard: React.FC<ActiveStrategiesCardProps> = ({
  activeStrategies,
  language,
  t,
}) => {
  if (activeStrategies.length === 0) {
    return (
      <Card style={styles.noStrategyCard}>
        <Text style={styles.noStrategyIcon}>📊</Text>
        <Text style={styles.noStrategyText}>
          {t('simulator.noStrategySelected')}
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.activeStrategiesCard}>
      <View style={styles.activeHeader}>
        <View style={styles.activeDot} />
        <Text style={styles.activeTitle}>
          {t('simulator.strategiesActive', { count: activeStrategies.length })}
        </Text>
      </View>
      <View style={styles.strategyChips}>
        {activeStrategies.map(strategy => (
          <View
            key={strategy.id}
            style={[styles.strategyChip, { backgroundColor: strategy.color + '20' }]}
          >
            <Text style={styles.strategyChipIcon}>{strategy.icon}</Text>
            <Text style={[styles.strategyChipText, { color: strategy.color }]}>
              {getStrategyName(language as Language, strategy.id) || strategy.name}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  activeStrategiesCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.success + '10',
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.sm,
  },
  activeTitle: {
    color: theme.colors.success,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  strategyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  strategyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  strategyChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  strategyChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  noStrategyCard: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  noStrategyIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  noStrategyText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
});
