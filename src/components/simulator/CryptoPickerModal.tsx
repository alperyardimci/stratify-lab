import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { getGroupedCrypto, POPULAR_CRYPTO } from '../../constants/api';
import { theme } from '../../constants/theme';

interface CryptoPickerModalProps {
  showCryptoPicker: boolean;
  selectedSymbols: string[];
  onToggleCrypto: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const CryptoPickerModal: React.FC<CryptoPickerModalProps> = ({
  showCryptoPicker,
  selectedSymbols,
  onToggleCrypto,
  onClearAll,
  onClose,
  t,
}) => {
  const groupedCrypto = getGroupedCrypto();

  return (
    <Modal
      visible={showCryptoPicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>{t('cryptoPicker.title')}</Text>
            <Text style={styles.modalSubtitle}>{t('cryptoPicker.selected', { count: selectedSymbols.length })}</Text>
          </View>
          <View style={styles.modalHeaderButtons}>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={onClearAll}
            >
              <Text style={styles.clearAllText}>{t('cryptoPicker.clearAll')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected chips */}
        {selectedSymbols.length > 0 && (
          <View style={styles.selectedChipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedSymbols.map(id => {
                const crypto = POPULAR_CRYPTO.find(c => c.id === id);
                return (
                  <TouchableOpacity
                    key={id}
                    style={styles.selectedChip}
                    onPress={() => onToggleCrypto(id)}
                  >
                    <Text style={styles.selectedChipText}>{crypto?.symbol}</Text>
                    <Text style={styles.selectedChipRemove}>✕</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.cryptoPickerContent}>
          {groupedCrypto.map((group) => (
            <View key={group.category} style={styles.cryptoGroup}>
              <View style={styles.cryptoGroupHeader}>
                <Text style={styles.cryptoGroupIcon}>{group.icon}</Text>
                <Text style={styles.cryptoGroupTitle}>{group.label}</Text>
                <Text style={styles.cryptoGroupCount}>{group.coins.length}</Text>
              </View>
              <View style={styles.cryptoGroupItems}>
                {group.coins.map((coin) => {
                  const isSelected = selectedSymbols.includes(coin.id);
                  return (
                    <TouchableOpacity
                      key={coin.id}
                      style={[
                        styles.cryptoItem,
                        isSelected && styles.cryptoItemSelected,
                      ]}
                      onPress={() => onToggleCrypto(coin.id)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${coin.symbol} - ${coin.name}`}
                      accessibilityState={{ checked: isSelected }}
                    >
                      <Text style={[
                        styles.cryptoItemSymbol,
                        isSelected && styles.cryptoItemSymbolSelected,
                      ]}>
                        {coin.symbol}
                      </Text>
                      <Text style={[
                        styles.cryptoItemName,
                        isSelected && styles.cryptoItemNameSelected,
                      ]}>
                        {coin.name}
                      </Text>
                      {isSelected && (
                        <Text style={styles.cryptoItemCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
          <View style={styles.modalBottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  closeButton: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  clearAllButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  clearAllText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
  },
  selectedChipsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
  },
  selectedChipText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  selectedChipRemove: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
  cryptoPickerContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  cryptoGroup: {
    marginBottom: theme.spacing.lg,
  },
  cryptoGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cryptoGroupIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  cryptoGroupTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  cryptoGroupCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  cryptoGroupItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 100,
  },
  cryptoItemSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  cryptoItemSymbol: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  cryptoItemSymbolSelected: {
    color: theme.colors.primary,
  },
  cryptoItemName: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    flex: 1,
  },
  cryptoItemNameSelected: {
    color: theme.colors.primary,
  },
  cryptoItemCheck: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  modalBottomPadding: {
    height: 50,
  },
});

export default CryptoPickerModal;
