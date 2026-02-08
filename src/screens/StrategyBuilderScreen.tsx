import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStrategyStore, useLanguageStore } from '../store';
import { theme } from '../constants/theme';
import {
  presetStrategies,
  strategyCategories,
  riskLevelLabels,
  PresetStrategy,
} from '../constants/presetStrategies';
import { Card } from '../components/common';
import { getStrategyName, getStrategyDescription, Language } from '../i18n';

interface StrategyCardProps {
  strategy: PresetStrategy;
  isEnabled: boolean;
  onToggle: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  language: Language;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isEnabled, onToggle, t, language }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const riskInfo = riskLevelLabels[strategy.riskLevel];
  const riskLabel = t(`strategies.riskLevels.${strategy.riskLevel}`);

  // Get translated name and description
  const strategyName = getStrategyName(language, strategy.id) || strategy.name;
  const strategyDescription = getStrategyDescription(language, strategy.id) || strategy.description;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onToggle}
      >
        <Card
          style={[
            styles.strategyCard,
            isEnabled && styles.strategyCardEnabled,
            { borderLeftColor: strategy.color },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.strategyIcon}>{strategy.icon}</Text>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.strategyName}>{strategyName}</Text>
                <View style={[styles.riskBadge, { backgroundColor: riskInfo.color + '20' }]}>
                  <Text style={[styles.riskText, { color: riskInfo.color }]}>
                    {riskLabel}
                  </Text>
                </View>
              </View>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={onToggle}
              trackColor={{ false: theme.colors.border, true: strategy.color + '80' }}
              thumbColor={isEnabled ? strategy.color : theme.colors.textSecondary}
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <Text style={styles.strategyDescription}>{strategyDescription}</Text>

          {/* Mini block preview */}
          <View style={styles.blockPreview}>
            {strategy.blocks.slice(0, 2).map((block, index) => (
              <View
                key={block.id}
                style={[
                  styles.miniBlock,
                  { backgroundColor: getBlockColor(block.type) + '30' },
                ]}
              >
                <View
                  style={[styles.miniBlockDot, { backgroundColor: getBlockColor(block.type) }]}
                />
                <Text style={styles.miniBlockText} numberOfLines={1}>
                  {getBlockLabel(block.name)}
                </Text>
              </View>
            ))}
            {strategy.blocks.length > 2 && (
              <Text style={styles.moreBlocksText}>+{strategy.blocks.length - 2}</Text>
            )}
          </View>

          {isEnabled && (
            <View style={[styles.enabledIndicator, { backgroundColor: strategy.color }]}>
              <Text style={styles.enabledText}>{t('strategies.enabled')}</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getBlockColor = (type: string): string => {
  switch (type) {
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

const getBlockLabel = (name: string): string => {
  const labels: Record<string, string> = {
    WHEN_DATE: 'Tarih',
    WHEN_CHANGE_PERCENT: 'Degisim',
    IF_RSI: 'RSI',
    IF_MOVING_AVG: 'MA',
    IF_VOLUME: 'Hacim',
    BUY_PERCENT: 'Al',
    SELL_PERCENT: 'Sat',
    STOP_LOSS: 'Stop Loss',
    TAKE_PROFIT: 'Kar Al',
    TRAILING_STOP: 'Trailing',
  };
  return labels[name] || name;
};

export const StrategyBuilderScreen: React.FC = () => {
  const { enabledStrategies, toggleStrategy, isStrategyEnabled } = useStrategyStore();
  const { t, language } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');

  const enabledCount = enabledStrategies.length;

  // Get active strategies
  const activeStrategies = useMemo(() => {
    return presetStrategies
      .filter(s => enabledStrategies.includes(s.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [enabledStrategies]);

  // Get grouped and sorted strategies (excluding active ones)
  const groupedStrategies = useMemo(() => {
    const filtered = presetStrategies.filter(s => {
      // Exclude active strategies (they show at top)
      if (enabledStrategies.includes(s.id)) return false;

      // Apply search filter - search both English and translated names
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const translatedName = getStrategyName(language as Language, s.id) || '';
        const translatedDesc = getStrategyDescription(language as Language, s.id) || '';
        return (
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          translatedName.toLowerCase().includes(query) ||
          translatedDesc.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Group by category
    const groups: { category: string; label: string; icon: string; strategies: PresetStrategy[] }[] = [];

    strategyCategories.slice(1).forEach(cat => { // Skip 'all'
      const categoryStrategies = filtered
        .filter(s => s.category === cat.id)
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      if (categoryStrategies.length > 0) {
        groups.push({
          category: cat.id,
          label: cat.name,
          icon: cat.icon,
          strategies: categoryStrategies,
        });
      }
    });

    return groups;
  }, [searchQuery, enabledStrategies]);

  // Filter active strategies by search too - bilingual search
  const filteredActiveStrategies = useMemo(() => {
    if (!searchQuery.trim()) return activeStrategies;
    const query = searchQuery.toLowerCase();
    return activeStrategies.filter(s => {
      const translatedName = getStrategyName(language as Language, s.id) || '';
      const translatedDesc = getStrategyDescription(language as Language, s.id) || '';
      return (
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        translatedName.toLowerCase().includes(query) ||
        translatedDesc.toLowerCase().includes(query)
      );
    });
  }, [activeStrategies, searchQuery, language]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('strategies.title')}</Text>
          <Text style={styles.subtitle}>
            {t('simulator.strategiesActive', { count: enabledCount })}
          </Text>
        </View>
        {enabledCount > 0 && (
          <View style={styles.activeIndicator}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{t('strategies.enabled')}</Text>
          </View>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'tr' ? 'Strateji ara...' : 'Search strategies...'}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Strategy List */}
      <ScrollView
        style={styles.strategyList}
        contentContainerStyle={styles.strategyListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Active Strategies Section */}
        {filteredActiveStrategies.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>⚡</Text>
              <Text style={styles.sectionTitle}>{language === 'tr' ? 'Aktif Stratejiler' : 'Active Strategies'}</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{filteredActiveStrategies.length}</Text>
              </View>
            </View>
            {filteredActiveStrategies.map(strategy => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                isEnabled={true}
                onToggle={() => toggleStrategy(strategy.id)}
                t={t}
                language={language}
              />
            ))}
          </View>
        )}

        {/* Grouped Strategies by Category */}
        {groupedStrategies.map(group => (
          <View key={group.category} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{group.icon}</Text>
              <Text style={styles.sectionTitle}>{t(`strategies.categories.${group.category}`) || group.label}</Text>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>{group.strategies.length}</Text>
              </View>
            </View>
            {group.strategies.map(strategy => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                isEnabled={isStrategyEnabled(strategy.id)}
                onToggle={() => toggleStrategy(strategy.id)}
                t={t}
                language={language}
              />
            ))}
          </View>
        ))}

        {/* Empty State */}
        {filteredActiveStrategies.length === 0 && groupedStrategies.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>{language === 'tr' ? 'Strateji bulunamadı' : 'No strategies found'}</Text>
            <Text style={styles.emptySubtext}>{language === 'tr' ? 'Farklı bir arama deneyin' : 'Try a different search'}</Text>
          </View>
        )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  activeText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    paddingVertical: theme.spacing.sm,
  },
  clearButton: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    padding: theme.spacing.xs,
  },
  strategyList: {
    flex: 1,
  },
  strategyListContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  sectionBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  sectionCountBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  sectionCountText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  strategyCard: {
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  strategyCardEnabled: {
    backgroundColor: theme.colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  strategyIcon: {
    fontSize: 28,
    marginRight: theme.spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
  },
  strategyName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: 4,
  },
  riskText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  strategyDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  blockPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  miniBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  miniBlockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  miniBlockText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
  },
  moreBlocksText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  enabledIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  enabledText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

export default StrategyBuilderScreen;
