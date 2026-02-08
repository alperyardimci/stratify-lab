import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { InvestmentWithResult } from '../../types';
import { theme } from '../../constants/theme';

interface PortfolioChartProps {
  investments: InvestmentWithResult[];
  size?: number;
}

const COLORS = [
  theme.colors.primary,
  theme.colors.success,
  theme.colors.warning,
  theme.colors.secondary,
  theme.colors.error,
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#F97316', // Orange
];

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  investments,
  size = 200,
}) => {
  if (investments.length === 0) {
    return (
      <View style={[styles.container, { height: size }]}>
        <Text style={styles.noData}>Yatirim bulunamadi</Text>
      </View>
    );
  }

  // Calculate total value
  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);

  // Create pie chart data
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;
  const center = size / 2;

  // Calculate angles for each slice
  let currentAngle = -Math.PI / 2; // Start from top

  const slices = investments.map((inv, index) => {
    const value = inv.currentValue || inv.amount;
    const percentage = value / totalValue;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate path
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const ix1 = center + innerRadius * Math.cos(startAngle);
    const iy1 = center + innerRadius * Math.sin(startAngle);
    const ix2 = center + innerRadius * Math.cos(endAngle);
    const iy2 = center + innerRadius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = `
      M ${ix1} ${iy1}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
      Z
    `;

    return {
      path,
      color: COLORS[index % COLORS.length],
      percentage,
      symbol: inv.asset_symbol,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {slices.map((slice, i) => (
            <Path
              key={i}
              d={slice.path}
              fill={slice.color}
              stroke={theme.colors.background}
              strokeWidth={2}
            />
          ))}
        </Svg>
        {/* Center text */}
        <View style={[styles.centerLabel, { width: size, height: size }]}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalValue}>
            ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {investments.map((inv, index) => (
          <View key={inv.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS[index % COLORS.length] },
              ]}
            />
            <View style={styles.legendContent}>
              <Text style={styles.legendSymbol}>{inv.asset_symbol}</Text>
              <Text style={styles.legendValue}>
                ${(inv.currentValue || inv.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
            </View>
            <Text
              style={[
                styles.legendPercent,
                { color: (inv.profitLossPercent || 0) >= 0 ? theme.colors.success : theme.colors.error },
              ]}
            >
              {(inv.profitLossPercent || 0) >= 0 ? '+' : ''}{(inv.profitLossPercent || 0).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  totalValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  legend: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  legendContent: {
    flex: 1,
  },
  legendSymbol: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  legendValue: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  legendPercent: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  noData: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default PortfolioChart;
