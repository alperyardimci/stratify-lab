import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Strategy, StrategyBlock } from '../types';
import { presetStrategies, PresetStrategy } from '../constants/presetStrategies';

interface StrategyState {
  strategies: Strategy[];
  publicStrategies: Strategy[];
  currentStrategy: Strategy | null;
  editingBlocks: StrategyBlock[];
  selectedBlockId: string | null;
  isLoading: boolean;
  error: string | null;

  // Preset strategies
  enabledStrategies: string[];

  // Preset strategy actions
  toggleStrategy: (strategyId: string) => void;
  isStrategyEnabled: (strategyId: string) => boolean;
  getEnabledStrategies: () => PresetStrategy[];
  getActiveBlocks: () => StrategyBlock[];

  // Strategy CRUD
  fetchStrategies: (userId: string) => Promise<void>;
  fetchPublicStrategies: () => Promise<void>;
  addStrategy: (userId: string, name: string, blocks: StrategyBlock[], isPublic?: boolean) => Promise<Strategy>;
  editStrategy: (strategyId: string, updates: Partial<Strategy>) => Promise<void>;
  removeStrategy: (strategyId: string) => Promise<void>;
  setCurrentStrategy: (strategy: Strategy | null) => void;

  // Block editing
  setEditingBlocks: (blocks: StrategyBlock[]) => void;
  addBlock: (block: Omit<StrategyBlock, 'id'>, parentId?: string) => void;
  updateBlock: (blockId: string, updates: Partial<StrategyBlock>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: 'up' | 'down') => void;
  addChildBlock: (parentId: string, block: Omit<StrategyBlock, 'id'>) => void;
  setSelectedBlock: (blockId: string | null) => void;
  clearEditingBlocks: () => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

// Cryptographically secure ID generation
const generateId = (): string => {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return 'block_' + Date.now().toString(36) + array[0].toString(36) + array[1].toString(36);
};

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      strategies: [],
      publicStrategies: [],
      currentStrategy: null,
      editingBlocks: [],
      selectedBlockId: null,
      isLoading: false,
      error: null,
      enabledStrategies: [],

      // Preset strategy actions
      toggleStrategy: (strategyId: string) => {
        set(state => {
          const isEnabled = state.enabledStrategies.includes(strategyId);
          if (isEnabled) {
            return {
              enabledStrategies: state.enabledStrategies.filter(id => id !== strategyId),
            };
          } else {
            return {
              enabledStrategies: [...state.enabledStrategies, strategyId],
            };
          }
        });
      },

      isStrategyEnabled: (strategyId: string) => {
        return get().enabledStrategies.includes(strategyId);
      },

      getEnabledStrategies: () => {
        const enabledIds = get().enabledStrategies;
        return presetStrategies.filter(s => enabledIds.includes(s.id));
      },

      getActiveBlocks: () => {
        const enabledStrategies = get().getEnabledStrategies();
        return enabledStrategies.flatMap(s => s.blocks);
      },

      fetchStrategies: async (_userId: string) => {
        // Local-only: strategies stored in AsyncStorage via zustand persist
        set({ isLoading: false });
      },

      fetchPublicStrategies: async () => {
        set({ isLoading: false });
      },

      addStrategy: async (_userId: string, name: string, blocks: StrategyBlock[], isPublic = false) => {
        const strategy: Strategy = {
          id: generateId(),
          user_id: 'local',
          name,
          blocks,
          is_public: isPublic,
          created_at: new Date().toISOString(),
        };
        set(state => ({
          strategies: [strategy, ...state.strategies],
        }));
        return strategy;
      },

      editStrategy: async (strategyId: string, updates: Partial<Strategy>) => {
        set(state => ({
          strategies: state.strategies.map(s => (s.id === strategyId ? { ...s, ...updates } : s)),
          currentStrategy: state.currentStrategy?.id === strategyId
            ? { ...state.currentStrategy, ...updates } as Strategy
            : state.currentStrategy,
        }));
      },

      removeStrategy: async (strategyId: string) => {
        set(state => ({
          strategies: state.strategies.filter(s => s.id !== strategyId),
          currentStrategy: state.currentStrategy?.id === strategyId ? null : state.currentStrategy,
        }));
      },

      setCurrentStrategy: (strategy: Strategy | null) => {
        set({
          currentStrategy: strategy,
          editingBlocks: strategy?.blocks || [],
        });
      },

      setEditingBlocks: (blocks: StrategyBlock[]) => {
        set({ editingBlocks: blocks });
      },

      addBlock: (block: Omit<StrategyBlock, 'id'>, parentId?: string) => {
        const newBlock: StrategyBlock = {
          ...block,
          id: generateId(),
        };

        set(state => {
          if (parentId) {
            // Add as child to parent block
            const addToParent = (blocks: StrategyBlock[]): StrategyBlock[] => {
              return blocks.map(b => {
                if (b.id === parentId) {
                  return {
                    ...b,
                    children: [...(b.children || []), newBlock],
                  };
                }
                if (b.children) {
                  return {
                    ...b,
                    children: addToParent(b.children),
                  };
                }
                return b;
              });
            };
            return { editingBlocks: addToParent(state.editingBlocks) };
          }
          return { editingBlocks: [...state.editingBlocks, newBlock] };
        });
      },

      updateBlock: (blockId: string, updates: Partial<StrategyBlock>) => {
        set(state => {
          const updateInBlocks = (blocks: StrategyBlock[]): StrategyBlock[] => {
            return blocks.map(b => {
              if (b.id === blockId) {
                return { ...b, ...updates };
              }
              if (b.children) {
                return {
                  ...b,
                  children: updateInBlocks(b.children),
                };
              }
              return b;
            });
          };
          return { editingBlocks: updateInBlocks(state.editingBlocks) };
        });
      },

      removeBlock: (blockId: string) => {
        set(state => {
          const removeFromBlocks = (blocks: StrategyBlock[]): StrategyBlock[] => {
            return blocks
              .filter(b => b.id !== blockId)
              .map(b => {
                if (b.children) {
                  return {
                    ...b,
                    children: removeFromBlocks(b.children),
                  };
                }
                return b;
              });
          };
          return {
            editingBlocks: removeFromBlocks(state.editingBlocks),
            selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
          };
        });
      },

      moveBlock: (blockId: string, direction: 'up' | 'down') => {
        set(state => {
          const moveInBlocks = (blocks: StrategyBlock[]): StrategyBlock[] => {
            const index = blocks.findIndex(b => b.id === blockId);
            if (index === -1) {
              // Try in children
              return blocks.map(b => {
                if (b.children) {
                  return {
                    ...b,
                    children: moveInBlocks(b.children),
                  };
                }
                return b;
              });
            }

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= blocks.length) {
              return blocks;
            }

            const newBlocks = [...blocks];
            [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
            return newBlocks;
          };

          return { editingBlocks: moveInBlocks(state.editingBlocks) };
        });
      },

      addChildBlock: (parentId: string, block: Omit<StrategyBlock, 'id'>) => {
        get().addBlock(block, parentId);
      },

      setSelectedBlock: (blockId: string | null) => {
        set({ selectedBlockId: blockId });
      },

      clearEditingBlocks: () => {
        set({ editingBlocks: [], selectedBlockId: null });
      },

      clearError: () => set({ error: null }),

      reset: () => set({
        strategies: [],
        publicStrategies: [],
        currentStrategy: null,
        editingBlocks: [],
        selectedBlockId: null,
        isLoading: false,
        error: null,
        enabledStrategies: [],
      }),
    }),
    {
      name: 'strategy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ enabledStrategies: state.enabledStrategies }),
    }
  )
);

export default useStrategyStore;
