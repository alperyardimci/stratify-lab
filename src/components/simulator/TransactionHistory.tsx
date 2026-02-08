import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Card } from '../common';
import { PortfolioEvent } from '../../types';
import { POPULAR_CRYPTO } from '../../constants/api';

const eventTypeStyles: Record<string, { color: string; icon: string }> = {
  buy: { color: '#22C55E', icon: '📈' },
  sell: { color: '#EF4444', icon: '📉' },
  skip_buy: { color: '#F59E0B', icon: '⚠️' },
  skip_sell: { color: '#F59E0B', icon: '⚠️' },
};

interface TransactionHistoryProps {
  events: PortfolioEvent[];
  showAllEvents: boolean;
  setShowAllEvents: (show: boolean) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  events,
  showAllEvents,
  setShowAllEvents,
  t,
}) => {
  const visibleEvents = showAllEvents ? events : events.slice(0, 10);

  return (
    <View style={styles.eventsSection}>
      <View style={styles.eventsSectionHeader}>
        <Text style={styles.resultListTitle}>{t('simulator.transactionHistory')}</Text>
        <Text style={styles.eventsCount}>{events.length} {t('simulator.events')}</Text>
      </View>

      {visibleEvents.map((event, index) => {
        const eventStyle = eventTypeStyles[event.eventType];
        const eventLabel = t(`simulator.eventTypes.${event.eventType}`);
        const crypto = POPULAR_CRYPTO.find(c => c.id === event.symbol);
        const isSkipped = event.eventType.startsWith('skip_');

        return (
          <Card
            key={`${event.date}-${event.symbol}-${index}`}
            style={[
              styles.eventCard,
              isSkipped && styles.eventCardSkipped
            ]}
          >
            {/* Event Header */}
            <View style={styles.eventHeader}>
              <View style={styles.eventDateContainer}>
                <Text style={styles.eventDate}>{event.date}</Text>
                <Text style={styles.eventSymbol}>{crypto?.symbol || event.symbol}</Text>
              </View>
              <View style={[styles.eventTypeBadge, { backgroundColor: eventStyle.color + '20' }]}>
                <Text style={styles.eventTypeIcon}>{eventStyle.icon}</Text>
                <Text style={[styles.eventTypeText, { color: eventStyle.color }]}>
                  {eventLabel}
                </Text>
              </View>
            </View>

            {/* Event Details */}
            <View>
              {!isSkipped ? (
                <>
                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDetailLabel}>{t('simulator.price')}:</Text>
                    <Text style={styles.eventDetailValue}>${event.price.toFixed(4)}</Text>
                  </View>
                  {event.amount !== undefined && (
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>{t('simulator.amount')}:</Text>
                      <Text style={styles.eventDetailValue}>{event.amount.toFixed(6)}</Text>
                    </View>
                  )}
                  {event.value !== undefined && (
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>{t('simulator.total')}:</Text>
                      <Text style={[
                        styles.eventDetailValue,
                        { color: event.eventType === 'buy' ? theme.colors.error : theme.colors.success }
                      ]}>
                        {event.eventType === 'buy' ? '-' : '+'}${event.value.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.skipReasonBox}>
                  <Text style={styles.skipReasonText}>{event.reason}</Text>
                </View>
              )}

              {/* Strategy info */}
              {event.strategyName && (
                <View style={[styles.eventStrategyBox, { backgroundColor: (event.strategyColor || theme.colors.primary) + '10' }]}>
                  <Text style={styles.eventStrategyIcon}>{event.strategyIcon}</Text>
                  <View style={styles.eventStrategyInfo}>
                    <Text style={[styles.eventStrategyName, { color: event.strategyColor || theme.colors.primary }]}>
                      {event.strategyName}
                    </Text>
                    {event.triggerDetails && (
                      <Text style={styles.eventTriggerDetails}>{event.triggerDetails}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Portfolio snapshot */}
              <View style={styles.portfolioSnapshot}>
                <Text style={styles.snapshotLabel}>{t('simulator.afterTransaction')}:</Text>
                <Text style={styles.snapshotValue}>
                  {t('simulator.cash')}: ${event.cashAfter.toFixed(2)} | Portfolio: ${event.portfolioValueAfter.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        );
      })}

      {events.length > 10 && !showAllEvents && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAllEvents(true)}
          accessibilityRole="button"
          accessibilityLabel={t('simulator.showMore', { count: events.length - 10 })}
        >
          <Text style={styles.showMoreText}>
            {t('simulator.showMore', { count: events.length - 10 })}
          </Text>
        </TouchableOpacity>
      )}

      {showAllEvents && events.length > 10 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAllEvents(false)}
          accessibilityRole="button"
          accessibilityLabel={t('simulator.collapse')}
        >
          <Text style={styles.showMoreText}>{t('simulator.collapse')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  eventsSection: {
    marginTop: theme.spacing.md,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  resultListTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  eventsCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  eventCard: {
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  eventCardSkipped: {
    borderLeftColor: theme.colors.warning,
    opacity: 0.8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eventDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  eventSymbol: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  eventTypeIcon: {
    fontSize: 12,
  },
  eventTypeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  eventDetailLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  eventDetailValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  skipReasonBox: {
    backgroundColor: theme.colors.warning + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.warning,
  },
  skipReasonText: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.sm,
  },
  eventStrategyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  eventStrategyIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  eventStrategyInfo: {
    flex: 1,
  },
  eventStrategyName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  eventTriggerDetails: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  portfolioSnapshot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  snapshotLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  snapshotValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  showMoreText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
