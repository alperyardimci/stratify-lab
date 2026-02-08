import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore, usePortfolioStore } from '../store';
import { theme } from '../constants/theme';
import { SimulationResult } from '../types';
import { Card, Badge, EmptyState, LoadingSpinner } from '../components/common';

type SortOption = 'date' | 'profit' | 'profitPercent';
type SortOrder = 'asc' | 'desc';

export const HistoryScreen: React.FC = () => {
  const { user } = useUserStore();
  const { allSimulationResults, isLoading, fetchAllSimulationResults } = usePortfolioStore();

  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (user?.id) {
      fetchAllSimulationResults(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchAllSimulationResults(user.id);
    }
    setRefreshing(false);
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('desc');
    }
  };

  const sortedResults = [...allSimulationResults].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime();
        break;
      case 'profit':
        comparison = a.profit_loss - b.profit_loss;
        break;
      case 'profitPercent':
        comparison = a.profit_percentage - b.profit_percentage;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate statistics
  const stats = {
    totalSimulations: allSimulationResults.length,
    profitable: allSimulationResults.filter(r => r.profit_loss > 0).length,
    avgProfit: allSimulationResults.length > 0
      ? allSimulationResults.reduce((sum, r) => sum + r.profit_percentage, 0) / allSimulationResults.length
      : 0,
    bestResult: allSimulationResults.length > 0
      ? Math.max(...allSimulationResults.map(r => r.profit_percentage))
      : 0,
    worstResult: allSimulationResults.length > 0
      ? Math.min(...allSimulationResults.map(r => r.profit_percentage))
      : 0,
  };

  const renderSortButton = (option: SortOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === option && styles.sortButtonActive,
      ]}
      onPress={() => toggleSort(option)}
    >
      <Text
        style={[
          styles.sortButtonText,
          sortBy === option && styles.sortButtonTextActive,
        ]}
      >
        {label}
        {sortBy === option && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
      </Text>
    </TouchableOpacity>
  );

  const renderResultItem = ({ item }: { item: SimulationResult }) => (
    <Card style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultDate}>
          {new Date(item.calculated_at).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Badge
          text={item.profit_loss >= 0 ? 'Kar' : 'Zarar'}
          variant={item.profit_loss >= 0 ? 'success' : 'error'}
          size="small"
        />
      </View>

      <View style={styles.resultContent}>
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Başlangıç</Text>
            <Text style={styles.resultValue}>
              ${item.initial_value.toLocaleString()}
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Bitiş</Text>
            <Text style={styles.resultValue}>
              ${item.final_value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Kar/Zarar</Text>
            <Text
              style={[
                styles.resultValue,
                { color: item.profit_loss >= 0 ? theme.colors.success : theme.colors.error },
              ]}
            >
              {item.profit_loss >= 0 ? '+' : ''}${item.profit_loss.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Yüzde</Text>
            <Text
              style={[
                styles.resultValueLarge,
                { color: item.profit_percentage >= 0 ? theme.colors.success : theme.colors.error },
              ]}
            >
              {item.profit_percentage >= 0 ? '+' : ''}{item.profit_percentage.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {item.transactions.length > 0 && (
        <View style={styles.transactionsSummary}>
          <Text style={styles.transactionsText}>
            {item.transactions.length} işlem yapıldı
          </Text>
        </View>
      )}
    </Card>
  );

  if (isLoading && allSimulationResults.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner fullScreen message="Yükleniyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Simülasyon Geçmişi</Text>
      </View>

      {allSimulationResults.length === 0 ? (
        <EmptyState
          title="Geçmiş Yok"
          message="Henüz simülasyon yapılmadı. Simülatör ekranından ilk simülasyonunuzu başlatın."
        />
      ) : (
        <>
          {/* Statistics */}
          <View style={styles.statsContainer}>
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalSimulations}</Text>
                  <Text style={styles.statLabel}>Toplam</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>
                    {stats.profitable}
                  </Text>
                  <Text style={styles.statLabel}>Karlı</Text>
                </View>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: stats.avgProfit >= 0 ? theme.colors.success : theme.colors.error },
                    ]}
                  >
                    {stats.avgProfit >= 0 ? '+' : ''}{stats.avgProfit.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>Ortalama</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>
                    +{stats.bestResult.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>En İyi</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.error }]}>
                    {stats.worstResult.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>En Kötü</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {((stats.profitable / stats.totalSimulations) * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.statLabel}>Başarı</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sırala:</Text>
            {renderSortButton('date', 'Tarih')}
            {renderSortButton('profit', 'Kar')}
            {renderSortButton('profitPercent', '%')}
          </View>

          {/* Results List */}
          <FlatList
            data={sortedResults}
            keyExtractor={(item) => item.id}
            renderItem={renderResultItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  statsCard: {
    padding: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  sortLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sortButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  sortButtonTextActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  resultCard: {
    marginBottom: theme.spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultDate: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  resultContent: {},
  resultRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  resultItem: {
    flex: 1,
  },
  resultLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 2,
  },
  resultValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  resultValueLarge: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  transactionsSummary: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  transactionsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontStyle: 'italic',
  },
});

export default HistoryScreen;
