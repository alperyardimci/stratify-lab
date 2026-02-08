import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Card } from '../common';
import { UnifiedPortfolioResult } from '../../types';
import { POPULAR_CRYPTO } from '../../constants/api';

interface PortfolioSummaryCardProps {
  result: UnifiedPortfolioResult;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  result,
  t,
}) => {
  return (
    <Card style={styles.totalSummaryCard}>
      <Text style={styles.sectionTitle}>{t('simulator.portfolioSummary')}</Text>
      <View style={styles.totalRow}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>{t('simulator.initial')}</Text>
          <Text style={styles.totalValue}>${result.initialCash.toLocaleString()}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>{t('simulator.portfolioValue')}</Text>
          <Text style={styles.totalValue}>
            ${result.finalPortfolioValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>{t('simulator.profitLoss')}</Text>
          <Text style={[
            styles.totalValue,
            { color: result.profitLoss >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {result.profitLoss >= 0 ? '+' : ''}
            {result.profitPercentage.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Current positions */}
      <View style={styles.positionsContainer}>
        <Text style={styles.positionsTitle}>{t('simulator.currentPositions')}</Text>
        <View style={styles.positionRow}>
          <Text style={styles.positionLabel}>💵 {t('simulator.cash')}:</Text>
          <Text style={styles.positionValue}>${result.finalCash.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>
        {Object.entries(result.finalPositions).map(([sym, pos]) => {
          const crypto = POPULAR_CRYPTO.find(c => c.id === sym);
          if (pos.amount === 0) return null;
          return (
            <View key={sym} style={styles.positionRow}>
              <Text style={styles.positionLabel}>🪙 {crypto?.symbol || sym}:</Text>
              <Text style={styles.positionValue}>
                {pos.amount.toFixed(6)} (${pos.value.toLocaleString('en-US', { maximumFractionDigits: 2 })})
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  totalSummaryCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  totalItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 2,
  },
  totalValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  positionsContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  positionsTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  positionLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
  },
  positionValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
});
