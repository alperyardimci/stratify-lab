import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Card, Select } from '../common';
import { AssetType } from '../../types';

interface AssetSelectionSectionProps {
  assetType: AssetType;
  setAssetType: (type: AssetType) => void;
  selectedSymbols: string[];
  setSelectedSymbols: (symbols: string[]) => void;
  assetTypeOptions: { value: string; label: string }[];
  getPopularAssets: () => { value: string; label: string }[];
  getSelectedCryptoLabel: () => string;
  onOpenCryptoPicker: () => void;
  getSelectedBistLabel?: () => string;
  onOpenBistPicker?: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const AssetSelectionSection: React.FC<AssetSelectionSectionProps> = ({
  assetType,
  setAssetType,
  selectedSymbols,
  setSelectedSymbols,
  assetTypeOptions,
  getPopularAssets,
  getSelectedCryptoLabel,
  onOpenCryptoPicker,
  getSelectedBistLabel,
  onOpenBistPicker,
  t,
}) => {
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{t('simulator.assetSelection')}</Text>

      <Select
        label={t('simulator.assetType')}
        options={assetTypeOptions}
        value={assetType}
        onChange={(value) => {
          setAssetType(value as AssetType);
          setSelectedSymbols([]);
        }}
      />

      {assetType === 'crypto' ? (
        <View>
          <Text style={styles.inputLabel}>{t('simulator.cryptoMultiSelect')}</Text>
          <TouchableOpacity
            style={styles.cryptoPickerButton}
            onPress={onOpenCryptoPicker}
            accessibilityRole="button"
            accessibilityLabel={getSelectedCryptoLabel()}
            accessibilityHint="Double tap to select cryptocurrencies"
          >
            <Text style={[
              styles.cryptoPickerText,
              selectedSymbols.length === 0 && styles.cryptoPickerPlaceholder
            ]}>
              {getSelectedCryptoLabel()}
            </Text>
            <Text style={styles.cryptoPickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      ) : assetType === 'bist' ? (
        <View>
          <Text style={styles.inputLabel}>{t('simulator.bistMultiSelect')}</Text>
          <TouchableOpacity
            style={styles.cryptoPickerButton}
            onPress={onOpenBistPicker}
            accessibilityRole="button"
            accessibilityLabel={getSelectedBistLabel?.() || t('simulator.selectBist')}
            accessibilityHint="Double tap to select BIST stocks"
          >
            <Text style={[
              styles.cryptoPickerText,
              selectedSymbols.length === 0 && styles.cryptoPickerPlaceholder
            ]}>
              {getSelectedBistLabel?.() || t('simulator.selectBist')}
            </Text>
            <Text style={styles.cryptoPickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Select
          label={t('simulator.assetType')}
          placeholder={t('simulator.selectAsset')}
          options={getPopularAssets()}
          value={selectedSymbols[0] || ''}
          onChange={(val) => setSelectedSymbols([val])}
        />
      )}
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
  cryptoPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cryptoPickerText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  cryptoPickerPlaceholder: {
    color: theme.colors.textSecondary,
  },
  cryptoPickerArrow: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
