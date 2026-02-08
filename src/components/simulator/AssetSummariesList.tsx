import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Card } from '../common';
import { AssetSummary } from '../../types';
import { POPULAR_CRYPTO } from '../../constants/api';

interface AssetSummariesListProps {
  summaries: AssetSummary[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const AssetSummariesList: React.FC<AssetSummariesListProps> = ({
  summaries,
  t,
}) => {
  const sorted = [...summaries].sort((a, b) => b.realizedProfitLoss - a.realizedProfitLoss);

  return (
    <View>
      <Text style={styles.resultListTitle}>{t('simulator.assetBasedSummary')}</Text>
      {sorted.map((summary, index) => {
        const crypto = POPULAR_CRYPTO.find(c => c.id === summary.symbol);
        return (
          <Card key={summary.symbol} style={styles.assetSummaryCard}>
            <View style={styles.assetSummaryHeader}>
              <Text style={styles.assetSummaryRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
              <View style={styles.assetSummaryInfo}>
                <Text style={styles.assetSummarySymbol}>{crypto?.symbol || summary.symbol}</Text>
                <Text style={styles.assetSummaryName}>{summary.name}</Text>
              </View>
              <View style={styles.assetSummaryStats}>
                <Text style={styles.assetStatText}>
                  {summary.buyCount} {t('simulator.buys')}, {summary.sellCount} {t('simulator.sells')}
                </Text>
                {summary.skipCount > 0 && (
                  <Text style={styles.assetSkipText}>{summary.skipCount} {t('simulator.skipped')}</Text>
                )}
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  resultListTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  assetSummaryCard: {
    marginBottom: theme.spacing.sm,
  },
  assetSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetSummaryRank: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  assetSummaryInfo: {
    flex: 1,
  },
  assetSummarySymbol: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  assetSummaryName: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  assetSummaryStats: {
    alignItems: 'flex-end',
  },
  assetStatText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  assetSkipText: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.xs,
  },
});
