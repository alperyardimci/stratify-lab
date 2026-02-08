import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Card, Input } from '../common';

interface DatePeriod {
  value: string;
  label: string;
  days: number;
}

interface InvestmentDetailsSectionProps {
  amount: string;
  setAmount: (value: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
  datePeriods: DatePeriod[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const InvestmentDetailsSection: React.FC<InvestmentDetailsSectionProps> = ({
  amount,
  setAmount,
  selectedPeriod,
  setSelectedPeriod,
  datePeriods,
  t,
}) => {
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{t('simulator.investmentDetails')}</Text>

      <Input
        label={t('simulator.investmentAmount')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="10000"
      />

      <Text style={styles.inputLabel}>{t('simulator.timeRange')}</Text>
      <View style={styles.periodSelector}>
        {datePeriods.map((period) => (
          <View key={period.value} style={styles.periodButton}>
            <TouchableOpacity
              style={[
                styles.periodButtonInner,
                selectedPeriod === period.value && styles.periodButtonInnerSelected,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
              accessibilityRole="button"
              accessibilityLabel={period.label}
              accessibilityState={{ selected: selectedPeriod === period.value }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextSelected,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    marginHorizontal: -4,
  },
  periodButton: {
    width: '33.33%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  periodButtonInner: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonInnerSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  periodButtonTextSelected: {
    color: '#FFFFFF',
  },
});
