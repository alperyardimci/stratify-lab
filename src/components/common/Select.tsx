import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { theme } from '../../constants/theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Seciniz...',
  options,
  value,
  onChange,
  error,
  containerStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.selectButtonError,
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="combobox"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ expanded: isOpen }}
        accessibilityHint="Double tap to open options"
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.placeholder,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.chevron}>&#x25BC;</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close options"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Seciniz'}</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  accessibilityRole="menuitem"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: item.value === value }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
  },
  selectButtonError: {
    borderColor: theme.colors.error,
  },
  selectText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  placeholder: {
    color: theme.colors.textSecondary,
  },
  chevron: {
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '60%',
  },
  modalHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default Select;
