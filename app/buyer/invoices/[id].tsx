import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button } from '../../../components/ui';
import { useApp } from '../../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';
import { formatCurrency, getDaysUntilDue } from '../../../services/mockData';

export default function BuyerInvoiceDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices } = useApp();

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Invoice not found.</Text>
      </View>
    );
  }

  const daysUntilDue = getDaysUntilDue(invoice.dueDate);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{invoice.invoiceNumber}</Text>
        <Badge label={invoice.status} variant={invoice.status === 'OVERDUE' ? 'error' : 'info'} />

        <View style={styles.card}>
          <Text style={styles.label}>Supplier</Text>
          <Text style={styles.value}>{invoice.supplierName}</Text>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>{formatCurrency(invoice.amount)}</Text>
          <Text style={styles.label}>Amount Paid</Text>
          <Text style={styles.value}>{formatCurrency(invoice.amountPaid)}</Text>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.value}>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</Text>
          <Text style={styles.label}>Due Status</Text>
          <Text style={styles.value}>{daysUntilDue >= 0 ? `Due in ${daysUntilDue} days` : `OVERDUE by ${Math.abs(daysUntilDue)} days`}</Text>
        </View>

        <Button title="Pay Now" onPress={() => router.push(`/buyer/payment/${invoice.id}`)} fullWidth />
        <Button title="Back" onPress={() => router.back()} variant="outline" fullWidth />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  value: { ...typography.body, color: colors.text },
  error: { ...typography.body, color: colors.textSecondary, padding: spacing.lg, textAlign: 'center' },
});
