import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Card } from '../common';
import { PriceChart } from '../charts';
import { PriceData, PortfolioEvent, Transaction } from '../../types';
import { POPULAR_CRYPTO } from '../../constants/api';

// Convert portfolio events to transactions for a specific symbol
const eventsToTransactions = (events: PortfolioEvent[], symbol: string): Transaction[] => {
  return events
    .filter(e => e.symbol === symbol && (e.eventType === 'buy' || e.eventType === 'sell'))
    .map(e => ({
      date: e.date,
      type: e.eventType as 'buy' | 'sell',
      price: e.price,
      amount: e.amount || 0,
      value: e.value || 0,
      reason: e.reason,
      strategyName: e.strategyName,
      strategyIcon: e.strategyIcon,
      strategyColor: e.strategyColor,
      triggerDetails: e.triggerDetails,
    }));
};

interface PriceChartsSectionProps {
  priceHistoryMap: Map<string, PriceData[]>;
  events: PortfolioEvent[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const PriceChartsSection: React.FC<PriceChartsSectionProps> = ({
  priceHistoryMap,
  events,
  t,
}) => {
  if (priceHistoryMap.size === 0) return null;

  return (
    <View style={styles.chartsSection}>
      <Text style={styles.resultListTitle}>{t('chart.priceChart')}</Text>
      {Array.from(priceHistoryMap.entries()).map(([symbol, priceData]) => {
        const crypto = POPULAR_CRYPTO.find(c => c.id === symbol);
        const transactions = eventsToTransactions(events, symbol);

        return (
          <Card key={symbol} style={styles.chartCard}>
            <Text style={styles.chartAssetName}>
              {crypto?.symbol || symbol} - {crypto?.name || symbol}
            </Text>
            <PriceChart
              data={priceData}
              transactions={transactions}
              height={220}
              labels={{
                noData: t('chart.noData'),
                buy: t('chart.buy'),
                sell: t('chart.sell'),
              }}
            />
          </Card>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  chartsSection: {
    marginTop: theme.spacing.md,
  },
  resultListTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  chartCard: {
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  chartAssetName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
});
