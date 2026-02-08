import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlockDefinition, BlockType } from '../../types';
import { triggerBlocks, conditionBlocks, actionBlocks, modifierBlocks } from '../../constants/blocks';
import { theme } from '../../constants/theme';

interface BlockPaletteProps {
  onSelectBlock: (block: BlockDefinition) => void;
  filterType?: BlockType;
}

interface BlockCategoryProps {
  title: string;
  blocks: BlockDefinition[];
  onSelectBlock: (block: BlockDefinition) => void;
}

const BlockCategory: React.FC<BlockCategoryProps> = ({ title, blocks, onSelectBlock }) => {
  if (blocks.length === 0) return null;

  return (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.blocksGrid}>
        {blocks.map(block => (
          <TouchableOpacity
            key={block.name}
            style={[styles.paletteBlock, { borderLeftColor: block.color }]}
            onPress={() => onSelectBlock(block)}
            activeOpacity={0.7}
          >
            <View style={[styles.blockIcon, { backgroundColor: block.color }]}>
              <Text style={styles.blockIconText}>
                {block.type.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.blockInfo}>
              <Text style={styles.blockLabel}>{block.label}</Text>
              <Text style={styles.blockDescription} numberOfLines={1}>
                {block.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  onSelectBlock,
  filterType,
}) => {
  const getFilteredBlocks = (blocks: BlockDefinition[]) => {
    if (!filterType) return blocks;
    return blocks.filter(b => b.type === filterType);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <BlockCategory
        title="Tetikleyiciler"
        blocks={getFilteredBlocks(triggerBlocks)}
        onSelectBlock={onSelectBlock}
      />
      <BlockCategory
        title="Kosullar"
        blocks={getFilteredBlocks(conditionBlocks)}
        onSelectBlock={onSelectBlock}
      />
      <BlockCategory
        title="Eylemler"
        blocks={getFilteredBlocks(actionBlocks)}
        onSelectBlock={onSelectBlock}
      />
      <BlockCategory
        title="Degistiriciler"
        blocks={getFilteredBlocks(modifierBlocks)}
        onSelectBlock={onSelectBlock}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  category: {
    marginBottom: theme.spacing.lg,
  },
  categoryTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  blocksGrid: {
    gap: theme.spacing.sm,
  },
  paletteBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  blockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  blockIconText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  blockInfo: {
    flex: 1,
  },
  blockLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  blockDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
});

export default BlockPalette;
