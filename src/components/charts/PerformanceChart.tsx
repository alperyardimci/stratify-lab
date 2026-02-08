import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, G, Text as SvgText } from 'react-native-svg';
import { PriceData } from '../../types';
import { theme } from '../../constants/theme';

interface PerformanceChartProps {
  data: PriceData[];
  initialValue: number;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  initialValue,
  height = 200,
}) => {
  if (data.length === 0 || initialValue === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>Veri bulunamadi</Text>
      </View>
    );
  }

  const chartWidth = screenWidth - 64;
  const chartHeight = height - 80;
  const padding = { top: 20, right: 10, bottom: 40, left: 50 };

  // Calculate performance percentage for each data point
  const performanceData = data.map((item) => {
    const currentValue = (initialValue / data[0].close) * item.close;
    return ((currentValue - initialValue) / initialValue) * 100;
  });

  const minPercent = Math.min(...performanceData, 0);
  const maxPercent = Math.max(...performanceData, 0);
  const range = maxPercent - minPercent || 1;

  // Scale functions
  const scaleX = (index: number) =>
    padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
  const scaleY = (percent: number) =>
    padding.top + (1 - (percent - minPercent) / range) * chartHeight;

  // Find zero line position
  const zeroY = scaleY(0);

  // Create area path
  const linePath = performanceData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p)}`)
    .join(' ');

  const areaPath = `
    ${linePath}
    L ${scaleX(data.length - 1)} ${zeroY}
    L ${scaleX(0)} ${zeroY}
    Z
  `;

  const isPositive = performanceData[performanceData.length - 1] >= 0;
  const finalValue = (initialValue / data[0].close) * data[data.length - 1].close;
  const finalPercent = performanceData[performanceData.length - 1];

  // Y-axis labels
  const yLabels = [minPercent, 0, maxPercent].filter((v, i, arr) =>
    arr.indexOf(v) === i
  );

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={chartWidth} height={height - 40}>
        {/* Zero line */}
        <Line
          x1={padding.left}
          y1={zeroY}
          x2={chartWidth - padding.right}
          y2={zeroY}
          stroke={theme.colors.textSecondary}
          strokeWidth={1}
          strokeDasharray="5,5"
        />

        {/* Y-axis labels */}
        {yLabels.map((percent, i) => (
          <G key={i}>
            <Line
              x1={padding.left}
              y1={scaleY(percent)}
              x2={chartWidth - padding.right}
              y2={scaleY(percent)}
              stroke={theme.colors.border}
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.5}
            />
            <SvgText
              x={padding.left - 5}
              y={scaleY(percent) + 4}
              fontSize={10}
              fill={theme.colors.textSecondary}
              textAnchor="end"
            >
              {percent > 0 ? '+' : ''}{percent.toFixed(0)}%
            </SvgText>
          </G>
        ))}

        {/* Area fill */}
        <Path
          d={areaPath}
          fill={isPositive ? theme.colors.success + '30' : theme.colors.error + '30'}
        />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={isPositive ? theme.colors.success : theme.colors.error}
          strokeWidth={2}
        />

        {/* X-axis labels */}
        {[0, Math.floor(data.length / 2), data.length - 1].map((index, i) => {
          const date = new Date(data[index].date);
          return (
            <SvgText
              key={i}
              x={scaleX(index)}
              y={height - 50}
              fontSize={10}
              fill={theme.colors.textSecondary}
              textAnchor="middle"
            >
              {`${date.getDate()}/${date.getMonth() + 1}`}
            </SvgText>
          );
        })}
      </Svg>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Baslangic</Text>
          <Text style={styles.summaryValue}>${initialValue.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Güncel</Text>
          <Text style={styles.summaryValue}>
            ${finalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Degisim</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: isPositive ? theme.colors.success : theme.colors.error },
            ]}
          >
            {isPositive ? '+' : ''}{finalPercent.toFixed(2)}%
          </Text>
        </View>
      </View>
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
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 2,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});

export default PerformanceChart;
