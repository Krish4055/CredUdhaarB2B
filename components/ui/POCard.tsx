import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PurchaseOrder } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { formatCurrency, getDaysUntilDue } from '../../services/mockData';
import { Badge } from './Badge';

interface POCardProps {
  po: PurchaseOrder;
  onPress: () => void;
  viewMode: 'supplier' | 'buyer';
}

export function POCard({ po, onPress, viewMode }: POCardProps) {
  const statusColors = {
    DRAFT: 'info',
    PENDING: 'warning',
    CONFIRMED: 'info',
    SHIPPED: 'info',
    DELIVERED: 'success',
    REJECTED: 'error',
  } as const;

  const daysUntilDue = po.dueDate ? getDaysUntilDue(po.dueDate) : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.poNumber}>{po.poNumber}</Text>
        <Badge label={po.status} variant={statusColors[po.status]} />
      </View>

      <View style={styles.row}>
        <MaterialIcons
          name={viewMode === 'supplier' ? 'person' : 'storefront'}
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.party}>
          {viewMode === 'supplier' ? po.buyerName : po.supplierName}
        </Text>
      </View>

      <View style={styles.items}>
        <Text style={styles.itemsLabel}>
          {po.items.length} item{po.items.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.total}>{formatCurrency(po.total)}</Text>
      </View>

      {po.status === 'PENDING' && viewMode === 'supplier' && (
        <View style={styles.urgency}>
          <MaterialIcons name="schedule" size={14} color={colors.warning} />
          <Text style={styles.urgencyText}>Awaiting confirmation</Text>
        </View>
      )}

      {daysUntilDue !== null && po.status === 'CONFIRMED' && (
        <View style={styles.urgency}>
          <MaterialIcons name="event" size={14} color={colors.textSecondary} />
          <Text style={styles.dateText}>
            Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <Text style={styles.date}>
        Created {new Date(po.createdAt).toLocaleDateString('en-IN')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  poNumber: {
    ...typography.h3,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  party: {
    ...typography.body,
    color: colors.textSecondary,
  },
  items: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemsLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  total: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  urgency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  urgencyText: {
    ...typography.small,
    color: colors.warning,
    fontWeight: '600',
  },
  dateText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
