import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { PriceData, Transaction } from '../../types';
import { theme } from '../../constants/theme';

interface PriceChartProps {
  data: PriceData[];
  transactions?: Transaction[];
  height?: number;
  showVolume?: boolean;
  labels?: {
    noData?: string;
    buy?: string;
    sell?: string;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  transactions = [],
  height = 200,
  showVolume = false,
  labels = {},
}) => {
  const {
    noData = 'No data',
    buy = 'Buy',
    sell = 'Sell',
  } = labels;

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>{noData}</Text>
      </View>
    );
  }

  const chartWidth = screenWidth - 64;
  const chartHeight = height - 60;
  const padding = { top: 20, right: 10, bottom: 40, left: 50 };

  // Memoize price calculations
  const { prices, minPrice, maxPrice, priceRange } = useMemo(() => {
    const p = data.map(d => d.close);
    const min = Math.min(...p);
    const max = Math.max(...p);
    return { prices: p, minPrice: min, maxPrice: max, priceRange: max - min || 1 };
  }, [data]);

  // Scale functions
  const scaleX = (index: number) =>
    padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
  const scaleY = (price: number) =>
    padding.top + (1 - (price - minPrice) / priceRange) * chartHeight;

  // Memoize line path
  const linePath = useMemo(() =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.close)}`).join(' '),
    [data, minPrice, priceRange, chartWidth, chartHeight]
  );

  // Memoize transaction points
  const { buyPoints, sellPoints } = useMemo(() => {
    const dateIndexMap = new Map(data.map((d, i) => [d.date, i]));
    const bp = transactions
      .filter(t => t.type === 'buy')
      .map(t => {
        const index = dateIndexMap.get(t.date);
        return index !== undefined ? { x: scaleX(index), y: scaleY(t.price) } : null;
      })
      .filter(Boolean) as { x: number; y: number }[];

    const sp = transactions
      .filter(t => t.type === 'sell')
      .map(t => {
        const index = dateIndexMap.get(t.date);
        return index !== undefined ? { x: scaleX(index), y: scaleY(t.price) } : null;
      })
      .filter(Boolean) as { x: number; y: number }[];

    return { buyPoints: bp, sellPoints: sp };
  }, [data, transactions, minPrice, priceRange, chartWidth, chartHeight]);

  // Y-axis labels
  const yLabels = [minPrice, (minPrice + maxPrice) / 2, maxPrice];

  const svgHeight = transactions.length > 0 ? height - 28 : height;

  return (
    <View
      style={[styles.container, { height }]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Price chart with ${prices.length} data points. Range: $${minPrice.toFixed(2)} to $${maxPrice.toFixed(2)}. ${buyPoints.length} buys, ${sellPoints.length} sells.`}
    >
      <Svg width={chartWidth} height={svgHeight}>
        {/* Y-axis grid lines and labels */}
        {yLabels.map((price, i) => (
          <G key={i}>
            <Line
              x1={padding.left}
              y1={scaleY(price)}
              x2={chartWidth - padding.right}
              y2={scaleY(price)}
              stroke={theme.colors.border}
              strokeWidth={1}
              strokeDasharray="5,5"
              opacity={0.5}
            />
            <SvgText
              x={padding.left - 5}
              y={scaleY(price) + 4}
              fontSize={10}
              fill={theme.colors.textSecondary}
              textAnchor="end"
            >
              {price.toFixed(0)}
            </SvgText>
          </G>
        ))}

        {/* Price line */}
        <Path
          d={linePath}
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth={2}
        />

        {/* Buy points */}
        {buyPoints.map((point, i) => (
          <Circle
            key={`buy-${i}`}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={theme.colors.success}
          />
        ))}

        {/* Sell points */}
        {sellPoints.map((point, i) => (
          <Circle
            key={`sell-${i}`}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={theme.colors.error}
          />
        ))}

        {/* X-axis labels */}
        {[0, Math.floor(data.length / 2), data.length - 1].map((index, i) => {
          const date = new Date(data[index].date);
          return (
            <SvgText
              key={i}
              x={scaleX(index)}
              y={svgHeight - 10}
              fontSize={10}
              fill={theme.colors.textSecondary}
              textAnchor="middle"
            >
              {`${date.getDate()}/${date.getMonth() + 1}`}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      {transactions.length > 0 && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.legendText}>{buy} ({buyPoints.length})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
            <Text style={styles.legendText}>{sell} ({sellPoints.length})</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  noData: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
});

export default PriceChart;
