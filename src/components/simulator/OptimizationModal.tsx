import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { OptimizationResult, OptimizationProgress } from '../../services/simulation';
import { presetStrategies } from '../../constants/presetStrategies';
import { getStrategyName, Language } from '../../i18n';
import { theme } from '../../constants/theme';

interface OptimizationModalProps {
  showOptimizationModal: boolean;
  isOptimizing: boolean;
  optimizationProgress: OptimizationProgress | null;
  optimizationResults: OptimizationResult[] | null;
  selectedSymbols: string[];
  amount: string;
  language: string;
  onClose: () => void;
  onApplyStrategy: (strategyIds: string[]) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  showOptimizationModal,
  isOptimizing,
  optimizationProgress,
  optimizationResults,
  selectedSymbols,
  amount,
  language,
  onClose,
  onApplyStrategy,
  t,
}) => {
  return (
    <Modal
      visible={showOptimizationModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !isOptimizing && onClose()}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('optimization.title')}</Text>
          {!isOptimizing && (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>{t('common.close')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isOptimizing ? (
          <View style={styles.optimizingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.optimizingTitle}>{t('optimization.testing')}</Text>
            {optimizationProgress && (
              <>
                <View style={styles.phaseIndicator}>
                  <Text style={styles.phaseText}>
                    {optimizationProgress.phase === 'analyzing' && t('optimization.analyzing')}
                    {optimizationProgress.phase === 'single' && t('optimization.phase1')}
                    {optimizationProgress.phase === 'pairs' && t('optimization.phase2')}
                    {optimizationProgress.phase === 'triples' && t('optimization.phase3')}
                    {optimizationProgress.phase === 'complete' && t('optimization.complete')}
                  </Text>
                </View>
                {/* Market condition display */}
                {(optimizationProgress as any).marketCondition && (
                  <View style={styles.marketConditionBadge}>
                    <Text style={styles.marketConditionText}>
                      {(optimizationProgress as any).marketCondition}
                    </Text>
                  </View>
                )}
                {selectedSymbols.length > 1 && (
                  <View style={styles.unifiedBudgetInfo}>
                    <Text style={styles.unifiedBudgetIcon}>💰</Text>
                    <Text style={styles.multiAssetNote}>
                      {t('optimization.assetsUnifiedBudget', { count: selectedSymbols.length, amount: Number(amount).toLocaleString() })}
                    </Text>
                  </View>
                )}
                <Text style={styles.optimizingProgress}>
                  {t('optimization.progressTested', {
                    current: optimizationProgress.current,
                    total: optimizationProgress.total
                  })}
                </Text>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, (optimizationProgress.current / optimizationProgress.total) * 100)}%`
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressPercent}>
                  {Math.round((optimizationProgress.current / optimizationProgress.total) * 100)}%
                </Text>
                <Text style={styles.optimizingStrategy}>
                  {optimizationProgress.currentStrategy}
                </Text>
                <Text style={styles.profitableCountText}>
                  {t('optimization.profitableFound', { count: optimizationProgress.profitableCount })}
                </Text>
                {optimizationProgress.bestSoFar && (
                  <View style={styles.bestSoFar}>
                    <Text style={styles.bestSoFarLabel}>{t('optimization.bestSoFar')}</Text>
                    <Text style={styles.bestSoFarValue}>
                      {optimizationProgress.bestSoFar.strategyIds
                        .map(id => getStrategyName(language as Language, id) || optimizationProgress.bestSoFar!.strategyNames[optimizationProgress.bestSoFar!.strategyIds.indexOf(id)])
                        .join(' + ')}
                    </Text>
                    <Text
                      style={[
                        styles.bestSoFarPercent,
                        {
                          color: optimizationProgress.bestSoFar.profitPercentage >= 0
                            ? theme.colors.success
                            : theme.colors.error,
                        },
                      ]}
                    >
                      {optimizationProgress.bestSoFar.profitPercentage >= 0 ? '+' : ''}
                      {optimizationProgress.bestSoFar.profitPercentage.toFixed(2)}%
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        ) : optimizationResults ? (
          <ScrollView style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>{t('optimization.bestStrategies')}</Text>
            <Text style={styles.resultsSubtitle}>
              {t('optimization.combinationsTested', { count: optimizationResults.length })}
            </Text>

            {optimizationResults.slice(0, 10).map((optResult, index) => {
              const isFirst = index === 0;
              const strategy = optResult.strategyIds.length > 0
                ? presetStrategies.find(s => s.id === optResult.strategyIds[0])
                : null;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.resultCard,
                    isFirst && styles.resultCardBest,
                  ]}
                  onPress={() => onApplyStrategy(optResult.strategyIds)}
                  accessibilityRole="button"
                  accessibilityLabel={`Strategy #${index + 1}: ${optResult.strategyNames.join(' + ')}. ${optResult.profitPercentage >= 0 ? '+' : ''}${optResult.profitPercentage.toFixed(2)}%`}
                  accessibilityHint="Double tap to apply this strategy"
                >
                  {isFirst && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>{t('optimization.best')}</Text>
                    </View>
                  )}

                  <View style={styles.resultCardHeader}>
                    <View style={styles.resultCardTitle}>
                      <Text style={styles.resultRank}>#{index + 1}</Text>
                      <View style={styles.strategyInfo}>
                        {optResult.strategyIds.length > 0 ? (
                          optResult.strategyIds.map((stratId, i) => {
                            const strat = presetStrategies.find(s => s.id === stratId);
                            const translatedName = getStrategyName(language as Language, stratId) || optResult.strategyNames[i];
                            return (
                              <View key={i} style={styles.strategyNameRow}>
                                <Text style={styles.strategyIcon}>{strat?.icon || '📊'}</Text>
                                <Text style={styles.strategyName}>{translatedName}</Text>
                              </View>
                            );
                          })
                        ) : (
                          <View style={styles.strategyNameRow}>
                            <Text style={styles.strategyIcon}>📈</Text>
                            <Text style={styles.strategyName}>{t('optimization.buyAndHold')}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.resultCardProfit}>
                      <Text
                        style={[
                          styles.profitPercent,
                          {
                            color: optResult.profitPercentage >= 0
                              ? theme.colors.success
                              : theme.colors.error,
                          },
                        ]}
                      >
                        {optResult.profitPercentage >= 0 ? '+' : ''}
                        {optResult.profitPercentage.toFixed(2)}%
                      </Text>
                      <Text style={styles.profitValue}>
                        ${optResult.result.final_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                  </View>

                  {/* Multi-asset info */}
                  {optResult.assetResults && optResult.assetResults.length > 1 && (
                    <View style={styles.multiAssetResults}>
                      <View style={styles.winRateContainer}>
                        <Text style={styles.winRateLabel}>{t('optimization.successRate')}</Text>
                        <Text style={[
                          styles.winRateValue,
                          { color: (optResult.winRate || 0) >= 50 ? theme.colors.success : theme.colors.error }
                        ]}>
                          %{(optResult.winRate || 0).toFixed(0)} ({optResult.assetResults.filter(a => a.profitPercentage > 0).length}/{optResult.assetResults.length})
                        </Text>
                      </View>
                      <View style={styles.assetBreakdown}>
                        {optResult.assetResults.slice(0, 3).map((asset, i) => (
                          <View key={asset.symbol} style={styles.assetBreakdownItem}>
                            <Text style={styles.assetBreakdownSymbol}>{asset.symbol.toUpperCase().slice(0, 4)}</Text>
                            <Text style={[
                              styles.assetBreakdownProfit,
                              { color: asset.profitPercentage >= 0 ? theme.colors.success : theme.colors.error }
                            ]}>
                              {asset.profitPercentage >= 0 ? '+' : ''}{asset.profitPercentage.toFixed(1)}%
                            </Text>
                          </View>
                        ))}
                        {optResult.assetResults.length > 3 && (
                          <Text style={styles.moreAssetsText}>+{optResult.assetResults.length - 3}</Text>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.resultCardFooter}>
                    <Text style={styles.transactionCount}>
                      {optResult.result.transactions.length} {t('optimization.transactions')}
                    </Text>
                    <Text style={styles.applyHint}>{t('optimization.tapToApply')}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalBottomPadding} />
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  optimizingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  optimizingTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  optimizingProgress: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressPercent: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  phaseIndicator: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  phaseText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  marketConditionBadge: {
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  marketConditionText: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  unifiedBudgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  unifiedBudgetIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  multiAssetNote: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  profitableCountText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
  },
  bestSoFar: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },
  bestSoFarLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  bestSoFarValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  bestSoFarPercent: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
  },
  optimizingStrategy: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  resultsTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  resultsSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.lg,
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resultCardBest: {
    borderColor: theme.colors.success,
    borderWidth: 2,
  },
  bestBadge: {
    position: 'absolute',
    top: -1,
    right: theme.spacing.md,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: theme.borderRadius.sm,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  bestBadgeText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultCardTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  resultRank: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginRight: theme.spacing.sm,
    width: 30,
  },
  strategyInfo: {
    flex: 1,
  },
  strategyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  strategyIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  strategyName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  resultCardProfit: {
    alignItems: 'flex-end',
  },
  profitPercent: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
  },
  profitValue: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  multiAssetResults: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  winRateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  winRateLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  winRateValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  assetBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  assetBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  assetBreakdownSymbol: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginRight: 4,
  },
  assetBreakdownProfit: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  moreAssetsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    alignSelf: 'center',
  },
  resultCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  transactionCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  applyHint: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  modalBottomPadding: {
    height: 50,
  },
});

export default OptimizationModal;
