import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { formatCurrency } from '../../services/mockData';

export default function SupplierPayments() {
  const insets = useSafeAreaInsets();
  const { userProfile, invoices, payments } = useApp();

  if (!userProfile) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  const invoiceIds = new Set(invoices.filter((inv) => inv.supplierId === userProfile.business.id).map((inv) => inv.id));
  const myPayments = payments.filter((p) => invoiceIds.has(p.invoiceId));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Payments</Text>
        {myPayments.length === 0 ? (
          <Text style={styles.empty}>No payments recorded.</Text>
        ) : (
          myPayments.map((payment) => (
            <View key={payment.id} style={styles.card}>
              <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
              <Text style={styles.meta}>{payment.from}</Text>
              <Text style={styles.meta}>{payment.method} • {payment.reference}</Text>
              <Text style={styles.meta}>{new Date(payment.createdAt).toLocaleString('en-IN')}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amount: { ...typography.h3, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary },
});
