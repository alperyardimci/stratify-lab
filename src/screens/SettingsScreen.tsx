import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { useLanguageStore } from '../store';
import { Language, languageNames, languageFlags } from '../i18n';
import { Card } from '../components/common';

const languages: Language[] = ['en', 'tr'];

export const SettingsScreen: React.FC = () => {
  const { language, setLanguage, t } = useLanguageStore();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* Language Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <Text style={styles.sectionDescription}>
            {t('settings.languageDescription')}
          </Text>

          <View style={styles.languageOptions}>
            {languages.map((lang) => {
              const isSelected = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    isSelected && styles.languageOptionSelected,
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <Text style={styles.languageFlag}>{languageFlags[lang]}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      isSelected && styles.languageNameSelected,
                    ]}
                  >
                    {languageNames[lang]}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* About Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>{t('settings.version')}</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Name</Text>
            <Text style={styles.aboutValue}>Stratify Lab</Text>
          </View>
        </Card>

        {/* Disclaimer Section */}
        <Card style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>{t('settings.disclaimerTitle')}</Text>
          <Text style={styles.disclaimerText}>{t('settings.disclaimerText')}</Text>
          <View style={styles.disclaimerDivider} />
          <Text style={styles.disclaimerNote}>
            {language === 'tr'
              ? '📊 Bu uygulama gerçek para ile işlem yapmaz.'
              : '📊 This app does not trade with real money.'}
          </Text>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  languageOptions: {
    gap: theme.spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  languageName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    flex: 1,
  },
  languageNameSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  aboutLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  aboutValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  disclaimerSection: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.warning + '15',
    borderWidth: 1,
    borderColor: theme.colors.warning + '40',
  },
  disclaimerTitle: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  disclaimerText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
    textAlign: 'justify',
  },
  disclaimerDivider: {
    height: 1,
    backgroundColor: theme.colors.warning + '30',
    marginVertical: theme.spacing.md,
  },
  disclaimerNote: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});

export default SettingsScreen;
