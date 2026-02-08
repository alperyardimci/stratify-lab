import { en } from './translations/en';
import { tr } from './translations/tr';

export type Language = 'en' | 'tr';

export const translations = {
  en,
  tr,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  tr: 'Türkçe',
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  tr: '🇹🇷',
};

// Helper function to get nested translation value
export function getTranslation(
  lang: Language,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split('.');
  let value: any = translations[lang];

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return path; // Return path if not found
        }
      }
      break;
    }
  }

  if (typeof value !== 'string') {
    return path;
  }

  // Replace parameters like {count} with actual values
  if (params) {
    let result = value;
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
    return result;
  }

  return value;
}

// Helper function to get translated strategy name
export function getStrategyName(lang: Language, strategyId: string): string | null {
  const names = translations[lang].strategyNames as Record<string, string>;
  return names[strategyId] || null;
}

// Helper function to get translated strategy description
export function getStrategyDescription(lang: Language, strategyId: string): string | null {
  const descriptions = translations[lang].strategyDescriptions as Record<string, string>;
  return descriptions[strategyId] || null;
}

// Get engine labels for a given language
export function getEngineLabels(lang: Language) {
  return translations[lang].engine;
}

export { en, tr };
