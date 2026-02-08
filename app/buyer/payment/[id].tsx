import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';
import { Badge, Button, Input } from '../../../components/ui';
import { useApp } from '../../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';
import { formatCurrency, getDaysUntilDue } from '../../../services/mockData';
import { PaymentMethod, Payment } from '../../../types';

const methods: PaymentMethod[] = ['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE'];

export default function BuyerPaymentForm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();
  const { invoices, addPayment, updateInvoice } = useApp();

  const invoice = invoices.find((inv) => inv.id === id);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [reference, setReference] = useState('');

  if (!invoice) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Invoice not found.</Text>
      </View>
    );
  }

  const amountDue = invoice.amount - invoice.amountPaid;
  const daysOverdue = Math.abs(Math.min(0, getDaysUntilDue(invoice.dueDate)));
  const interest = daysOverdue > 5 ? (amountDue * 0.18 * daysOverdue) / 365 : 0;
  const totalDue = amountDue + interest;

  const handleConfirm = async () => {
    const payment: Payment = {
      id: `PAY${Date.now()}`,
      invoiceId: invoice.id,
      from: invoice.buyerName,
      to: invoice.supplierName,
      amount: totalDue,
      method,
      reference: reference || `TXN${Date.now()}`,
      status: method === 'UPI' ? 'CONFIRMED' : 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await addPayment(payment);
    await updateInvoice(invoice.id, {
      amountPaid: invoice.amountPaid + totalDue,
      status: invoice.amountPaid + totalDue >= invoice.amount ? 'PAID' : 'PARTIALLY_PAID',
      interestAccrued: invoice.interestAccrued + interest,
    });

    showAlert('Payment Successful', `Receipt: ${payment.reference}`, [
      { text: 'Back to Invoices', onPress: () => router.replace('/buyer/invoices') },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pay Invoice</Text>
        <Badge label={invoice.status} variant={invoice.status === 'OVERDUE' ? 'error' : 'info'} />

        <View style={styles.card}>
          <Text style={styles.label}>Invoice</Text>
          <Text style={styles.value}>{invoice.invoiceNumber}</Text>
          <Text style={styles.label}>Amount Due</Text>
          <Text style={styles.value}>{formatCurrency(amountDue)}</Text>
          {interest > 0 && (
            <>
              <Text style={styles.label}>Interest ({daysOverdue} days)</Text>
              <Text style={styles.value}>{formatCurrency(interest)}</Text>
            </>
          )}
          <Text style={styles.label}>Total Payable</Text>
          <Text style={styles.value}>{formatCurrency(totalDue)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {methods.map((m) => (
          <Pressable
            key={m}
            style={[styles.methodChip, method === m && styles.methodChipActive]}
            onPress={() => setMethod(m)}
          >
            <Text style={[styles.methodText, method === m && styles.methodTextActive]}>{m}</Text>
          </Pressable>
        ))}

        <Input
          label="Reference / UTR"
          value={reference}
          onChangeText={setReference}
          placeholder="Transaction reference"
        />

        <Button title="Confirm & Pay" onPress={handleConfirm} fullWidth />
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
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  methodChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  methodChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  methodText: { ...typography.body, color: colors.text },
  methodTextActive: { color: colors.textInverse, fontWeight: '600' },
  error: { ...typography.body, color: colors.textSecondary, padding: spacing.lg, textAlign: 'center' },
});
