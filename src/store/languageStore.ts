import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, getTranslation } from '../i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en', // Default to English

      setLanguage: (lang: Language) => {
        set({ language: lang });
      },

      t: (path: string, params?: Record<string, string | number>) => {
        return getTranslation(get().language, path, params);
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language }),
    }
  )
);

export default useLanguageStore;
