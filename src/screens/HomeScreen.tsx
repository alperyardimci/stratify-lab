import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useUserStore, usePortfolioStore } from '../store';
import { theme } from '../constants/theme';
import { Card, Button, Badge, LoadingSpinner } from '../components/common';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useUserStore();
  const {
    portfolios,
    allSimulationResults,
    isLoading,
    fetchPortfolios,
    fetchAllSimulationResults,
  } = usePortfolioStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPortfolios(user.id);
      fetchAllSimulationResults(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await Promise.all([
        fetchPortfolios(user.id),
        fetchAllSimulationResults(user.id),
      ]);
    }
    setRefreshing(false);
  };

  // Calculate summary stats
  const totalProfit = allSimulationResults.reduce((sum, r) => sum + r.profit_loss, 0);
  const totalInvested = allSimulationResults.reduce((sum, r) => sum + r.initial_value, 0);
  const avgProfitPercent = allSimulationResults.length > 0
    ? allSimulationResults.reduce((sum, r) => sum + r.profit_percentage, 0) / allSimulationResults.length
    : 0;

  const recentSimulations = allSimulationResults.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hosgeldiniz</Text>
          <Text style={styles.userName}>{user?.email || 'Yatirimci'}</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Toplam Yatirim</Text>
            <Text style={styles.summaryValue}>
              ${totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Kar/Zarar</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: totalProfit >= 0 ? theme.colors.success : theme.colors.error },
              ]}
            >
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
          </Card>
        </View>

        <Card style={styles.avgCard}>
          <Text style={styles.avgLabel}>Ortalama Performans</Text>
          <Text
            style={[
              styles.avgValue,
              { color: avgProfitPercent >= 0 ? theme.colors.success : theme.colors.error },
            ]}
          >
            {avgProfitPercent >= 0 ? '+' : ''}{avgProfitPercent.toFixed(2)}%
          </Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizli Erisim</Text>
          <View style={styles.actionsRow}>
            <Button
              title="Yeni Simulasyon"
              onPress={() => navigation.navigate('Simulator')}
              style={styles.actionButton}
            />
            <Button
              title="Strateji Olustur"
              onPress={() => navigation.navigate('Strategy')}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Recent Simulations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Simulasyonlar</Text>
            <Button
              title="Tümü"
              onPress={() => navigation.navigate('History')}
              variant="outline"
              size="small"
            />
          </View>

          {isLoading ? (
            <LoadingSpinner />
          ) : recentSimulations.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henüz simulasyon yapilmadı</Text>
              <Button
                title="Ilk Simulasyonu Baslat"
                onPress={() => navigation.navigate('Simulator')}
                style={styles.emptyButton}
              />
            </Card>
          ) : (
            recentSimulations.map((result) => (
              <Card key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultDate}>
                    {new Date(result.calculated_at).toLocaleDateString('tr-TR')}
                  </Text>
                  <Badge
                    text={result.profit_percentage >= 0 ? 'Kar' : 'Zarar'}
                    variant={result.profit_percentage >= 0 ? 'success' : 'error'}
                    size="small"
                  />
                </View>
                <View style={styles.resultDetails}>
                  <View>
                    <Text style={styles.resultLabel}>Baslangıç</Text>
                    <Text style={styles.resultValue}>
                      ${result.initial_value.toLocaleString()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.resultLabel}>Bitiş</Text>
                    <Text style={styles.resultValue}>
                      ${result.final_value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.resultLabel}>Değişim</Text>
                    <Text
                      style={[
                        styles.resultValue,
                        { color: result.profit_percentage >= 0 ? theme.colors.success : theme.colors.error },
                      ]}
                    >
                      {result.profit_percentage >= 0 ? '+' : ''}{result.profit_percentage.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Portfolios */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portföyler</Text>
            <Button
              title="Tümü"
              onPress={() => navigation.navigate('Portfolio')}
              variant="outline"
              size="small"
            />
          </View>

          {portfolios.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henüz portföy oluşturulmadı</Text>
            </Card>
          ) : (
            portfolios.slice(0, 3).map((portfolio) => (
              <Card
                key={portfolio.id}
                style={styles.portfolioCard}
                onPress={() => {
                  // Navigate to portfolio detail
                }}
              >
                <Text style={styles.portfolioName}>{portfolio.name}</Text>
                <Text style={styles.portfolioDate}>
                  {new Date(portfolio.created_at).toLocaleDateString('tr-TR')}
                </Text>
              </Card>
            ))
          )}
        </View>
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
  welcomeSection: {
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  userName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
  },
  avgCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avgLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  avgValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  emptyButton: {
    minWidth: 200,
  },
  resultCard: {
    marginBottom: theme.spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  resultDate: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  portfolioCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  portfolioName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  portfolioDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
});

export default HomeScreen;
