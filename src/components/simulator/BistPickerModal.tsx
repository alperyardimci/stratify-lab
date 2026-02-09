import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { getGroupedBist, POPULAR_BIST30 } from '../../constants/api';
import { theme } from '../../constants/theme';

interface BistPickerModalProps {
  showBistPicker: boolean;
  selectedSymbols: string[];
  onToggleBist: (symbol: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const BistPickerModal: React.FC<BistPickerModalProps> = ({
  showBistPicker,
  selectedSymbols,
  onToggleBist,
  onClearAll,
  onClose,
  t,
}) => {
  const groupedBist = getGroupedBist();

  return (
    <Modal
      visible={showBistPicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>{t('bistPicker.title')}</Text>
            <Text style={styles.modalSubtitle}>{t('bistPicker.selected', { count: selectedSymbols.length })}</Text>
          </View>
          <View style={styles.modalHeaderButtons}>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={onClearAll}
            >
              <Text style={styles.clearAllText}>{t('bistPicker.clearAll')}</Text>
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
              {selectedSymbols.map(symbol => {
                const bist = POPULAR_BIST30.find(b => b.symbol === symbol);
                return (
                  <TouchableOpacity
                    key={symbol}
                    style={styles.selectedChip}
                    onPress={() => onToggleBist(symbol)}
                  >
                    <Text style={styles.selectedChipText}>{bist?.symbol || symbol}</Text>
                    <Text style={styles.selectedChipRemove}>✕</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.pickerContent}>
          {groupedBist.map((group) => (
            <View key={group.sector} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupIcon}>{group.icon}</Text>
                <Text style={styles.groupTitle}>{group.label}</Text>
                <Text style={styles.groupCount}>{group.stocks.length}</Text>
              </View>
              <View style={styles.groupItems}>
                {group.stocks.map((stock) => {
                  const isSelected = selectedSymbols.includes(stock.symbol);
                  return (
                    <TouchableOpacity
                      key={stock.symbol}
                      style={[
                        styles.item,
                        isSelected && styles.itemSelected,
                      ]}
                      onPress={() => onToggleBist(stock.symbol)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${stock.symbol} - ${stock.name}`}
                      accessibilityState={{ checked: isSelected }}
                    >
                      <Text style={[
                        styles.itemSymbol,
                        isSelected && styles.itemSymbolSelected,
                      ]}>
                        {stock.symbol}
                      </Text>
                      <Text style={[
                        styles.itemName,
                        isSelected && styles.itemNameSelected,
                      ]}>
                        {stock.name}
                      </Text>
                      {isSelected && (
                        <Text style={styles.itemCheck}>✓</Text>
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
  pickerContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  group: {
    marginBottom: theme.spacing.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  groupIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  groupCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  groupItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  item: {
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
  itemSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  itemSymbol: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  itemSymbolSelected: {
    color: theme.colors.primary,
  },
  itemName: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    flex: 1,
  },
  itemNameSelected: {
    color: theme.colors.primary,
  },
  itemCheck: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  modalBottomPadding: {
    height: 50,
  },
});

export default BistPickerModal;
