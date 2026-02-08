import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore, usePortfolioStore } from '../store';
import { theme } from '../constants/theme';
import { Portfolio, Investment } from '../types';
import { Card, Button, Input, Badge, EmptyState, LoadingSpinner } from '../components/common';
import { PortfolioChart } from '../components/charts';

export const PortfolioScreen: React.FC = () => {
  const { user } = useUserStore();
  const {
    portfolios,
    currentPortfolio,
    investments,
    isLoading,
    fetchPortfolios,
    addPortfolio,
    removePortfolio,
    setCurrentPortfolio,
    fetchInvestments,
    getPortfolioSummary,
  } = usePortfolioStore();

  const [showNewPortfolioModal, setShowNewPortfolioModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchPortfolios(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (currentPortfolio) {
      fetchInvestments(currentPortfolio.id);
    }
  }, [currentPortfolio]);

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      Alert.alert('Hata', 'Portföy adı giriniz');
      return;
    }

    if (!user?.id) {
      Alert.alert('Hata', 'Giriş yapmanız gerekiyor');
      return;
    }

    try {
      const portfolio = await addPortfolio(user.id, newPortfolioName.trim());
      setShowNewPortfolioModal(false);
      setNewPortfolioName('');
      setCurrentPortfolio(portfolio);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  const handleDeletePortfolio = (portfolio: Portfolio) => {
    Alert.alert(
      'Portföyü Sil',
      `"${portfolio.name}" portföyünü silmek istediğinizden emin misiniz? Tüm yatırımlar da silinecektir.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePortfolio(portfolio.id);
            } catch (error: any) {
              Alert.alert('Hata', error.message);
            }
          },
        },
      ]
    );
  };

  const summary = getPortfolioSummary();

  const renderPortfolioItem = ({ item }: { item: Portfolio }) => (
    <Card
      style={[
        styles.portfolioCard,
        currentPortfolio?.id === item.id ? styles.portfolioCardSelected : null,
      ]}
      onPress={() => setCurrentPortfolio(item)}
    >
      <View style={styles.portfolioHeader}>
        <Text style={styles.portfolioName}>{item.name}</Text>
        <TouchableOpacity
          onPress={() => handleDeletePortfolio(item)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.portfolioDate}>
        {new Date(item.created_at).toLocaleDateString('tr-TR')}
      </Text>
    </Card>
  );

  const renderInvestmentItem = ({ item }: { item: Investment }) => {
    const investmentWithResult = summary.investments.find(i => i.id === item.id);

    return (
      <Card style={styles.investmentCard}>
        <View style={styles.investmentHeader}>
          <View>
            <Text style={styles.investmentSymbol}>{item.asset_symbol}</Text>
            <Badge
              text={item.asset_type.toUpperCase()}
              variant="info"
              size="small"
            />
          </View>
          <View style={styles.investmentValues}>
            <Text style={styles.investmentAmount}>
              ${item.amount.toLocaleString()}
            </Text>
            {investmentWithResult?.profitLossPercent !== undefined && (
              <Text
                style={[
                  styles.investmentProfit,
                  {
                    color:
                      investmentWithResult.profitLossPercent >= 0
                        ? theme.colors.success
                        : theme.colors.error,
                  },
                ]}
              >
                {investmentWithResult.profitLossPercent >= 0 ? '+' : ''}
                {investmentWithResult.profitLossPercent.toFixed(2)}%
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.investmentDate}>
          Giriş: {new Date(item.entry_date).toLocaleDateString('tr-TR')}
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Portföyler</Text>
        <Button
          title="+ Yeni"
          onPress={() => setShowNewPortfolioModal(true)}
          size="small"
        />
      </View>

      {/* Portfolio List */}
      <View style={styles.portfolioListContainer}>
        <FlatList
          data={portfolios}
          keyExtractor={(item) => item.id}
          renderItem={renderPortfolioItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.portfolioList}
          ListEmptyComponent={
            <Text style={styles.emptyPortfolioText}>Henüz portföy yok</Text>
          }
        />
      </View>

      {/* Selected Portfolio Content */}
      {currentPortfolio ? (
        <View style={styles.portfolioContent}>
          {/* Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Toplam Yatırım</Text>
                <Text style={styles.summaryValue}>
                  ${summary.totalInvested.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Güncel Değer</Text>
                <Text style={styles.summaryValue}>
                  ${summary.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Kar/Zarar</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        summary.totalProfitLoss >= 0
                          ? theme.colors.success
                          : theme.colors.error,
                    },
                  ]}
                >
                  {summary.totalProfitLoss >= 0 ? '+' : ''}$
                  {summary.totalProfitLoss.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Yüzde</Text>
                <Text
                  style={[
                    styles.summaryValueLarge,
                    {
                      color:
                        summary.totalProfitLossPercent >= 0
                          ? theme.colors.success
                          : theme.colors.error,
                    },
                  ]}
                >
                  {summary.totalProfitLossPercent >= 0 ? '+' : ''}
                  {summary.totalProfitLossPercent.toFixed(2)}%
                </Text>
              </View>
            </View>
          </Card>

          {/* Chart */}
          {investments.length > 0 && (
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Dağılım</Text>
              <PortfolioChart investments={summary.investments} />
            </Card>
          )}

          {/* Investments List */}
          <Text style={styles.sectionTitle}>Yatırımlar</Text>
          {isLoading ? (
            <LoadingSpinner />
          ) : investments.length === 0 ? (
            <EmptyState
              title="Yatırım Yok"
              message="Bu portföyde henüz yatırım bulunmuyor"
            />
          ) : (
            <FlatList
              data={investments}
              keyExtractor={(item) => item.id}
              renderItem={renderInvestmentItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.investmentsList}
            />
          )}
        </View>
      ) : (
        <EmptyState
          title="Portföy Seçin"
          message={
            portfolios.length === 0
              ? 'Yatırımlarınızı takip etmek için ilk portföyünüzü oluşturun'
              : 'Detayları görmek için bir portföy seçin'
          }
          actionTitle={portfolios.length === 0 ? 'Portföy Oluştur' : undefined}
          onAction={portfolios.length === 0 ? () => setShowNewPortfolioModal(true) : undefined}
        />
      )}

      {/* New Portfolio Modal */}
      <Modal
        visible={showNewPortfolioModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewPortfolioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Portföy</Text>

            <Input
              label="Portföy Adı"
              value={newPortfolioName}
              onChangeText={setNewPortfolioName}
              placeholder="Örn: Ana Portföy"
            />

            <View style={styles.modalButtons}>
              <Button
                title="İptal"
                onPress={() => {
                  setShowNewPortfolioModal(false);
                  setNewPortfolioName('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Oluştur"
                onPress={handleCreatePortfolio}
                loading={isLoading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
  },
  portfolioListContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  portfolioList: {
    padding: theme.spacing.md,
    paddingTop: 0,
    gap: theme.spacing.sm,
  },
  emptyPortfolioText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  portfolioCard: {
    minWidth: 150,
    marginRight: theme.spacing.sm,
  },
  portfolioCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  portfolioName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  portfolioDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 4,
  },
  portfolioContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  summaryCard: {
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: 4,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  summaryValueLarge: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
  },
  chartCard: {
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  investmentsList: {
    paddingBottom: theme.spacing.xl,
  },
  investmentCard: {
    marginBottom: theme.spacing.sm,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  investmentSymbol: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  investmentValues: {
    alignItems: 'flex-end',
  },
  investmentAmount: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  investmentProfit: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginTop: 2,
  },
  investmentDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});

export default PortfolioScreen;
