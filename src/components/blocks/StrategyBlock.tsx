import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StrategyBlock as StrategyBlockType, BlockDefinition } from '../../types';
import { getBlockDefinition } from '../../constants/blocks';
import { theme } from '../../constants/theme';

interface StrategyBlockProps {
  block: StrategyBlockType;
  isSelected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  depth?: number;
}

export const StrategyBlock: React.FC<StrategyBlockProps> = ({
  block,
  isSelected = false,
  onPress,
  onDelete,
  depth = 0,
}) => {
  const definition = getBlockDefinition(block.name);

  if (!definition) {
    return null;
  }

  const getBlockColor = () => {
    switch (block.type) {
      case 'trigger':
        return theme.colors.trigger;
      case 'condition':
        return theme.colors.condition;
      case 'action':
        return theme.colors.action;
      case 'modifier':
        return theme.colors.modifier;
      default:
        return theme.colors.primary;
    }
  };

  const color = getBlockColor();

  const renderParamValue = () => {
    const params = block.params;
    const paramStrings: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
      const paramDef = definition.params.find(p => p.name === key);
      if (paramDef) {
        if (paramDef.type === 'select') {
          const option = paramDef.options?.find(o => o.value === value);
          paramStrings.push(`${paramDef.label}: ${option?.label || value}`);
        } else {
          paramStrings.push(`${paramDef.label}: ${value}`);
        }
      }
    });

    return paramStrings.join(', ');
  };

  return (
    <View style={[styles.container, { marginLeft: depth * 20 }]}>
      <TouchableOpacity
        style={[
          styles.block,
          { borderLeftColor: color, borderLeftWidth: 4 },
          isSelected && styles.blockSelected,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={[styles.typeIndicator, { backgroundColor: color }]}>
            <Text style={styles.typeText}>
              {block.type.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{definition.label}</Text>
            <Text style={styles.params} numberOfLines={1}>
              {renderParamValue()}
            </Text>
          </View>
          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Render children */}
      {block.children && block.children.length > 0 && (
        <View style={styles.childrenContainer}>
          {block.children.map(child => (
            <StrategyBlock
              key={child.id}
              block={child}
              depth={depth + 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  block: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  blockSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  typeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  typeText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  params: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  deleteText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  childrenContainer: {
    marginTop: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    marginLeft: theme.spacing.md,
  },
});

export default StrategyBlock;
