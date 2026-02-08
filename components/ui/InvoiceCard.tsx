import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Invoice } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { formatCurrency, getDaysUntilDue } from '../../services/mockData';
import { Badge } from './Badge';

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
  viewMode: 'supplier' | 'buyer';
}

export function InvoiceCard({ invoice, onPress, viewMode }: InvoiceCardProps) {
  const statusColors = {
    PENDING: 'warning',
    PARTIALLY_PAID: 'info',
    PAID: 'success',
    OVERDUE: 'error',
    DISPUTED: 'error',
  } as const;

  const daysUntilDue = getDaysUntilDue(invoice.dueDate);
  const amountDue = invoice.amount - invoice.amountPaid;
  const paymentProgress = (invoice.amountPaid / invoice.amount) * 100;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
        <Badge label={invoice.status} variant={statusColors[invoice.status]} />
      </View>

      <View style={styles.row}>
        <MaterialIcons
          name={viewMode === 'supplier' ? 'person' : 'storefront'}
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.party}>
          {viewMode === 'supplier' ? invoice.buyerName : invoice.supplierName}
        </Text>
      </View>

      <View style={styles.amounts}>
        <View>
          <Text style={styles.label}>Amount Due</Text>
          <Text style={[styles.amount, invoice.status === 'OVERDUE' && styles.overdue]}>
            {formatCurrency(amountDue)}
          </Text>
        </View>
        <View>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>{formatCurrency(invoice.amount)}</Text>
        </View>
      </View>

      {invoice.amountPaid > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${paymentProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {formatCurrency(invoice.amountPaid)} paid
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {invoice.status === 'OVERDUE' ? (
          <View style={styles.urgency}>
            <MaterialIcons name="error" size={14} color={colors.error} />
            <Text style={styles.overdueText}>
              OVERDUE by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : invoice.status !== 'PAID' && daysUntilDue <= 7 ? (
          <View style={styles.urgency}>
            <MaterialIcons name="schedule" size={14} color={colors.warning} />
            <Text style={styles.dueSoonText}>
              Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : invoice.status !== 'PAID' ? (
          <Text style={styles.dueDate}>
            Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
          </Text>
        ) : (
          <View style={styles.urgency}>
            <MaterialIcons name="check-circle" size={14} color={colors.success} />
            <Text style={styles.paidText}>Paid in full</Text>
          </View>
        )}
      </View>

      {invoice.interestAccrued > 0 && (
        <Text style={styles.interest}>
          Interest accrued: {formatCurrency(invoice.interestAccrued)}
        </Text>
      )}
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
  invoiceNumber: {
    ...typography.h3,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  party: {
    ...typography.body,
    color: colors.textSecondary,
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  amount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  overdue: {
    color: colors.error,
  },
  total: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    marginBottom: spacing.xs,
  },
  urgency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  overdueText: {
    ...typography.small,
    color: colors.error,
    fontWeight: '600',
  },
  dueSoonText: {
    ...typography.small,
    color: colors.warning,
    fontWeight: '600',
  },
  paidText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
  },
  dueDate: {
    ...typography.small,
    color: colors.textSecondary,
  },
  interest: {
    ...typography.caption,
    color: colors.error,
    fontStyle: 'italic',
  },
});
