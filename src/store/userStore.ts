import { create } from 'zustand';
import { User } from '../types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  clearError: () => void;
}

// Local-only user store - no external auth dependency
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    // No external auth needed - app works locally
    set({ isLoading: false });
  },

  clearError: () => set({ error: null }),
}));

export default useUserStore;
