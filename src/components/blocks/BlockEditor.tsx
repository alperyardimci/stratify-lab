import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { StrategyBlock as StrategyBlockType, BlockDefinition } from '../../types';
import { useStrategyStore } from '../../store';
import { getBlockDefinition } from '../../constants/blocks';
import { theme } from '../../constants/theme';
import { StrategyBlock } from './StrategyBlock';
import { BlockPalette } from './BlockPalette';
import { BlockParamEditor } from './BlockParamEditor';
import { Button, Card, EmptyState } from '../common';

interface BlockEditorProps {
  onSave?: (blocks: StrategyBlockType[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ onSave }) => {
  const {
    editingBlocks,
    selectedBlockId,
    addBlock,
    updateBlock,
    removeBlock,
    setSelectedBlock,
  } = useStrategyStore();

  const [showPalette, setShowPalette] = useState(false);
  const [showParamEditor, setShowParamEditor] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<BlockDefinition | null>(null);
  const [addingToParentId, setAddingToParentId] = useState<string | null>(null);

  const handleSelectBlock = (definition: BlockDefinition) => {
    setSelectedDefinition(definition);
    setShowPalette(false);
    setShowParamEditor(true);
  };

  const handleParamSave = (params: Record<string, any>) => {
    if (selectedDefinition) {
      addBlock(
        {
          type: selectedDefinition.type,
          name: selectedDefinition.name,
          params,
          children: selectedDefinition.acceptsChildren ? [] : undefined,
        },
        addingToParentId || undefined
      );
    }
    setShowParamEditor(false);
    setSelectedDefinition(null);
    setAddingToParentId(null);
  };

  const handleBlockPress = (block: StrategyBlockType) => {
    setSelectedBlock(block.id === selectedBlockId ? null : block.id);
  };

  const handleAddChild = (parentId: string) => {
    setAddingToParentId(parentId);
    setShowPalette(true);
  };

  const handleEditBlock = () => {
    const block = findBlock(editingBlocks, selectedBlockId || '');
    if (block) {
      const definition = getBlockDefinition(block.name);
      if (definition) {
        setSelectedDefinition(definition);
        setShowParamEditor(true);
      }
    }
  };

  const findBlock = (blocks: StrategyBlockType[], id: string): StrategyBlockType | null => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.children) {
        const found = findBlock(block.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = selectedBlockId ? findBlock(editingBlocks, selectedBlockId) : null;

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Button
          title="+ Blok Ekle"
          onPress={() => {
            setAddingToParentId(null);
            setShowPalette(true);
          }}
          size="small"
        />
        {selectedBlock && (
          <>
            <Button
              title="Duzenle"
              onPress={handleEditBlock}
              variant="outline"
              size="small"
              style={styles.toolbarButton}
            />
            {selectedBlock.children !== undefined && (
              <Button
                title="+ Alt Blok"
                onPress={() => handleAddChild(selectedBlock.id)}
                variant="outline"
                size="small"
                style={styles.toolbarButton}
              />
            )}
            <Button
              title="Sil"
              onPress={() => {
                removeBlock(selectedBlock.id);
                setSelectedBlock(null);
              }}
              variant="danger"
              size="small"
              style={styles.toolbarButton}
            />
          </>
        )}
      </View>

      {/* Blocks area */}
      <ScrollView style={styles.blocksArea} showsVerticalScrollIndicator={false}>
        {editingBlocks.length === 0 ? (
          <EmptyState
            title="Strateji Boş"
            message="Blok ekleyerek stratejinizi oluşturun"
            actionTitle="Blok Ekle"
            onAction={() => setShowPalette(true)}
          />
        ) : (
          editingBlocks.map(block => (
            <StrategyBlock
              key={block.id}
              block={block}
              isSelected={block.id === selectedBlockId}
              onPress={() => handleBlockPress(block)}
              onDelete={() => removeBlock(block.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Save button */}
      {onSave && editingBlocks.length > 0 && (
        <View style={styles.saveContainer}>
          <Button
            title="Stratejiyi Kaydet"
            onPress={() => onSave(editingBlocks)}
          />
        </View>
      )}

      {/* Block Palette Modal */}
      <Modal
        visible={showPalette}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPalette(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Blok Seç</Text>
            <TouchableOpacity onPress={() => setShowPalette(false)}>
              <Text style={styles.closeButton}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <BlockPalette onSelectBlock={handleSelectBlock} />
        </View>
      </Modal>

      {/* Param Editor Modal */}
      <Modal
        visible={showParamEditor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowParamEditor(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedDefinition?.label || 'Blok Parametreleri'}
            </Text>
            <TouchableOpacity onPress={() => setShowParamEditor(false)}>
              <Text style={styles.closeButton}>Iptal</Text>
            </TouchableOpacity>
          </View>
          {selectedDefinition && (
            <BlockParamEditor
              definition={selectedDefinition}
              initialParams={selectedBlock?.params}
              onSave={handleParamSave}
              onCancel={() => setShowParamEditor(false)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  toolbar: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toolbarButton: {
    marginLeft: theme.spacing.xs,
  },
  blocksArea: {
    flex: 1,
    padding: theme.spacing.md,
  },
  saveContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
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
});

export default BlockEditor;
