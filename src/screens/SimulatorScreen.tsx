import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStrategyStore, useLanguageStore } from '../store';
import { theme } from '../constants/theme';
import { AssetType, UnifiedPortfolioResult, PriceData } from '../types';
import { SimulationEngine, StrategyOptimizer, OptimizationResult, OptimizationProgress } from '../services/simulation';
import { POPULAR_STOCKS, POPULAR_CRYPTO, POPULAR_FOREX, POPULAR_BIST30 } from '../constants/api';
import { Card } from '../components/common';
import { getEngineLabels, Language } from '../i18n';
import {
  ActiveStrategiesCard,
  AssetSelectionSection,
  InvestmentDetailsSection,
  ActionButtons,
  PortfolioSummaryCard,
  PriceChartsSection,
  AssetSummariesList,
  TransactionHistory,
  OptimizationModal,
  CryptoPickerModal,
  BistPickerModal,
} from '../components/simulator';

// Date period configurations
const datePeriodConfigs = [
  { value: '1w', days: 7 },
  { value: '1m', days: 30 },
  { value: '3m', days: 90 },
  { value: '6m', days: 180 },
  { value: '1y', days: 365 },
  { value: '2y', days: 730 },
];

export const SimulatorScreen: React.FC = () => {
  const { enabledStrategies, toggleStrategy, getActiveBlocks, getEnabledStrategies } = useStrategyStore();
  const { t, language } = useLanguageStore();

  const [assetType, setAssetType] = useState<AssetType>('crypto');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['bitcoin']);
  const [amount, setAmount] = useState('10000');
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  // Predefined date periods with translations
  const datePeriods = datePeriodConfigs.map(p => ({
    ...p,
    label: t(`simulator.periods.${p.value}`),
  }));

  const getDateRange = () => {
    const period = datePeriods.find(p => p.value === selectedPeriod);
    const days = period?.days || 365;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return { startDate, endDate };
  };

  // Unified portfolio result
  const [unifiedResult, setUnifiedResult] = useState<UnifiedPortfolioResult | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Price history for charts
  const [priceHistoryMap, setPriceHistoryMap] = useState<Map<string, PriceData[]>>(new Map());

  // Optimization states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState<OptimizationProgress | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[] | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);

  // Picker modals
  const [showCryptoPicker, setShowCryptoPicker] = useState(false);
  const [showBistPicker, setShowBistPicker] = useState(false);

  const activeStrategies = getEnabledStrategies();
  const activeBlocks = getActiveBlocks();

  const assetTypeOptions = [
    { value: 'stock', label: t('simulator.stock') },
    { value: 'crypto', label: t('simulator.crypto') },
    { value: 'bist', label: t('simulator.bist') },
    { value: 'forex', label: t('simulator.forex') },
  ];

  const getPopularAssets = () => {
    switch (assetType) {
      case 'stock':
        return POPULAR_STOCKS
          .sort((a, b) => a.symbol.localeCompare(b.symbol))
          .map(s => ({ value: s.symbol, label: `${s.symbol} - ${s.name}` }));
      case 'crypto':
        return POPULAR_CRYPTO.map(c => ({ value: c.id, label: `${c.symbol} - ${c.name}` }));
      case 'bist':
        return POPULAR_BIST30
          .sort((a, b) => a.symbol.localeCompare(b.symbol))
          .map(b => ({ value: b.symbol, label: `${b.symbol} - ${b.name}` }));
      case 'forex':
        return POPULAR_FOREX
          .sort((a, b) => a.pair.localeCompare(b.pair))
          .map(f => ({ value: f.pair, label: `${f.pair} - ${f.name}` }));
      default:
        return [];
    }
  };

  const getSelectedCryptoLabel = () => {
    if (selectedSymbols.length === 0) return t('simulator.selectCrypto');
    if (selectedSymbols.length === 1) {
      const crypto = POPULAR_CRYPTO.find(c => c.id === selectedSymbols[0]);
      return crypto ? `${crypto.symbol} - ${crypto.name}` : t('simulator.selectCrypto');
    }
    return t('simulator.cryptosSelected', { count: selectedSymbols.length });
  };

  const getSelectedBistLabel = () => {
    if (selectedSymbols.length === 0) return t('simulator.selectBist');
    if (selectedSymbols.length === 1) {
      const bist = POPULAR_BIST30.find(b => b.symbol === selectedSymbols[0]);
      return bist ? `${bist.symbol} - ${bist.name}` : t('simulator.selectBist');
    }
    return t('simulator.bistsSelected', { count: selectedSymbols.length });
  };

  const toggleCryptoSelection = (id: string) => {
    setSelectedSymbols(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      return [...prev, id];
    });
  };

  const toggleBistSelection = (symbol: string) => {
    setSelectedSymbols(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      }
      return [...prev, symbol];
    });
  };

  // Resolve asset name from symbol based on asset type
  const getAssetName = (sym: string): string => {
    switch (assetType) {
      case 'crypto': {
        const crypto = POPULAR_CRYPTO.find(c => c.id === sym);
        return crypto?.name || sym;
      }
      case 'bist': {
        const bist = POPULAR_BIST30.find(b => b.symbol === sym);
        return bist?.name || sym;
      }
      case 'stock': {
        const stock = POPULAR_STOCKS.find(s => s.symbol === sym);
        return stock?.name || sym;
      }
      case 'forex': {
        const forex = POPULAR_FOREX.find(f => f.pair === sym);
        return forex?.name || sym;
      }
      default:
        return sym;
    }
  };

  const validateInputs = (): boolean => {
    if (selectedSymbols.length === 0) {
      Alert.alert(t('common.error'), t('simulator.selectAssetAlert'));
      return false;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert(t('common.error'), t('simulator.validAmountAlert'));
      return false;
    }
    return true;
  };

  const handleSimulate = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setUnifiedResult(null);
    setShowAllEvents(false);
    setPriceHistoryMap(new Map());
    setLoadingProgress({ current: 0, total: selectedSymbols.length });

    const { startDate, endDate } = getDateRange();

    try {
      const assets: { symbol: string; name: string; priceData: any[] }[] = [];
      const newPriceHistoryMap = new Map<string, PriceData[]>();

      for (let i = 0; i < selectedSymbols.length; i++) {
        const sym = selectedSymbols[i];
        setLoadingProgress({ current: i + 1, total: selectedSymbols.length });

        const engineForData = new SimulationEngine(getEngineLabels(language as Language));
        await engineForData.loadHistoricalData(sym, assetType, startDate, endDate);

        const priceData = engineForData.getPriceData();
        assets.push({
          symbol: sym,
          name: getAssetName(sym),
          priceData: priceData,
        });

        newPriceHistoryMap.set(sym, priceData);
      }

      const engine = new SimulationEngine(getEngineLabels(language as Language));
      const result = await engine.runUnifiedPortfolioSimulation(
        assets,
        activeBlocks,
        Number(amount)
      );

      setUnifiedResult(result);
      setPriceHistoryMap(newPriceHistoryMap);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('simulator.simulationFailed'));
    }

    setIsLoading(false);
  };

  const handleOptimize = async () => {
    if (!validateInputs()) return;

    setIsOptimizing(true);
    setOptimizationProgress(null);
    setOptimizationResults(null);
    setShowOptimizationModal(true);

    const { startDate, endDate } = getDateRange();

    try {
      const optimizer = new StrategyOptimizer();

      if (selectedSymbols.length === 1) {
        const symbol = selectedSymbols[0];
        await optimizer.loadData(symbol, assetType, startDate, endDate);

        const investment = {
          asset_type: assetType,
          asset_symbol: symbol,
          amount: Number(amount),
          entry_date: startDate.toISOString(),
        };

        const results = await optimizer.quickOptimize(investment, (progress) => {
          setOptimizationProgress(progress);
        });

        setOptimizationResults(results);
      } else {
        const assets: { symbol: string; name: string; priceData: any[] }[] = [];

        for (let i = 0; i < selectedSymbols.length; i++) {
          const sym = selectedSymbols[i];
          const name = getAssetName(sym);

          setOptimizationProgress({
            current: i + 1,
            total: selectedSymbols.length,
            currentStrategy: t('optimization.loadingData', { name }),
            bestSoFar: null,
            profitableCount: 0,
            phase: 'single',
          });

          const engineForOpt = new SimulationEngine(getEngineLabels(language as Language));
          await engineForOpt.loadHistoricalData(sym, assetType, startDate, endDate);

          assets.push({
            symbol: sym,
            name,
            priceData: engineForOpt.getPriceData(),
          });
        }

        const results = await optimizer.multiAssetOptimize(
          assets,
          Number(amount),
          assetType,
          (progress) => {
            setOptimizationProgress(progress);
          }
        );

        setOptimizationResults(results);
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('simulator.simulationFailed'));
      setShowOptimizationModal(false);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyStrategy = (strategyIds: string[]) => {
    enabledStrategies.forEach(id => {
      if (!strategyIds.includes(id)) {
        toggleStrategy(id);
      }
    });

    strategyIds.forEach(id => {
      if (!enabledStrategies.includes(id)) {
        toggleStrategy(id);
      }
    });

    setShowOptimizationModal(false);
    Alert.alert(t('common.success'), t('simulator.strategyApplied'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t('simulator.title')}</Text>
          <Text style={styles.subtitle}>{t('simulator.subtitle')}</Text>

          <ActiveStrategiesCard
            activeStrategies={activeStrategies}
            language={language}
            t={t}
          />

          <AssetSelectionSection
            assetType={assetType}
            setAssetType={setAssetType}
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
            assetTypeOptions={assetTypeOptions}
            getPopularAssets={getPopularAssets}
            getSelectedCryptoLabel={getSelectedCryptoLabel}
            onOpenCryptoPicker={() => setShowCryptoPicker(true)}
            getSelectedBistLabel={getSelectedBistLabel}
            onOpenBistPicker={() => setShowBistPicker(true)}
            t={t}
          />

          <InvestmentDetailsSection
            amount={amount}
            setAmount={setAmount}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            datePeriods={datePeriods}
            t={t}
          />

          <ActionButtons
            isOptimizing={isOptimizing}
            isLoading={isLoading}
            onOptimize={handleOptimize}
            onSimulate={handleSimulate}
            t={t}
          />

          {/* Loading Progress */}
          {isLoading && (
            <Card style={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>
                {t('simulator.simulating')} {loadingProgress.current}/{loadingProgress.total}
              </Text>
            </Card>
          )}

          {/* Unified Portfolio Results */}
          {unifiedResult && (
            <View>
              <PortfolioSummaryCard result={unifiedResult} t={t} />

              <PriceChartsSection
                priceHistoryMap={priceHistoryMap}
                events={unifiedResult.events}
                t={t}
              />

              <AssetSummariesList
                summaries={unifiedResult.assetSummaries}
                t={t}
              />

              <TransactionHistory
                events={unifiedResult.events}
                showAllEvents={showAllEvents}
                setShowAllEvents={setShowAllEvents}
                t={t}
              />
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      <OptimizationModal
        showOptimizationModal={showOptimizationModal}
        isOptimizing={isOptimizing}
        optimizationProgress={optimizationProgress}
        optimizationResults={optimizationResults}
        selectedSymbols={selectedSymbols}
        amount={amount}
        language={language}
        onClose={() => setShowOptimizationModal(false)}
        onApplyStrategy={handleApplyStrategy}
        t={t}
      />

      <CryptoPickerModal
        showCryptoPicker={showCryptoPicker}
        selectedSymbols={selectedSymbols}
        onToggleCrypto={toggleCryptoSelection}
        onClearAll={() => setSelectedSymbols([])}
        onClose={() => setShowCryptoPicker(false)}
        t={t}
      />

      <BistPickerModal
        showBistPicker={showBistPicker}
        selectedSymbols={selectedSymbols}
        onToggleBist={toggleBistSelection}
        onClearAll={() => setSelectedSymbols([])}
        onClose={() => setShowBistPicker(false)}
        t={t}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.lg,
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
  },
  bottomPadding: {
    height: 100,
  },
});

export default SimulatorScreen;
