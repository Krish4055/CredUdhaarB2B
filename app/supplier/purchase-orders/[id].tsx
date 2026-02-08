import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';
import { Button, Badge, Input } from '../../../components/ui';
import { useApp } from '../../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';
import { calculateDueDate, formatCurrency, generateInvoiceNumber } from '../../../services/mockData';
import { Invoice } from '../../../types';

export default function SupplierPurchaseOrderDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();
  const { purchaseOrders, updatePurchaseOrder, addInvoice } = useApp();

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState('');

  const po = purchaseOrders.find((p) => p.id === id);

  if (!po) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Purchase order not found.</Text>
      </View>
    );
  }

  const handleConfirm = async () => {
    const charges = parseFloat(deliveryCharges) || 0;
    const total = po.subtotal + charges;
    const dueDate = calculateDueDate(po.paymentTerms);

    await updatePurchaseOrder(po.id, {
      status: 'CONFIRMED',
      deliveryCharges: charges,
      total,
      dueDate,
      confirmedAt: new Date().toISOString(),
    });

    const invoice: Invoice = {
      id: `INV${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      poId: po.id,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      buyerId: po.buyerId,
      buyerName: po.buyerName,
      amount: total,
      amountPaid: 0,
      dueDate,
      status: 'PENDING',
      interestAccrued: 0,
      createdAt: new Date().toISOString(),
    };

    await addInvoice(invoice);

    showAlert('PO Confirmed', `Invoice ${invoice.invoiceNumber} created.`);
    router.replace('/supplier/purchase-orders');
  };

  const handleReject = async () => {
    await updatePurchaseOrder(po.id, {
      status: 'REJECTED',
      rejectionReason: 'Out of stock',
    });
    showAlert('PO Rejected', 'Buyer has been notified');
    router.replace('/supplier/purchase-orders');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{po.poNumber}</Text>
        <Badge label={po.status} variant="info" />

        <View style={styles.card}>
          <Text style={styles.label}>Buyer</Text>
          <Text style={styles.value}>{po.buyerName}</Text>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>{formatCurrency(po.total)}</Text>
          <Text style={styles.label}>Payment Terms</Text>
          <Text style={styles.value}>{po.paymentTerms} days</Text>
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        {po.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemMeta}>{item.quantity} × {formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.itemTotal}>{formatCurrency(item.subtotal)}</Text>
          </View>
        ))}

        {po.status === 'PENDING' && (
          <>
            <Text style={styles.sectionTitle}>Confirm PO</Text>
            <Input
              label="Delivery Date (DD-MM-YYYY)"
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholder="e.g., 15-02-2026"
            />
            <Input
              label="Delivery Charges (optional)"
              value={deliveryCharges}
              onChangeText={setDeliveryCharges}
              placeholder="₹0"
              keyboardType="numeric"
            />

            <Button title="Confirm & Create Invoice" onPress={handleConfirm} fullWidth />
            <Button title="Reject PO" onPress={handleReject} variant="outline" fullWidth />
          </>
        )}

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
  itemRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemName: { ...typography.body, color: colors.text },
  itemMeta: { ...typography.caption, color: colors.textSecondary },
  itemTotal: { ...typography.body, color: colors.text, textAlign: 'right' },
  error: { ...typography.body, color: colors.textSecondary, padding: spacing.lg, textAlign: 'center' },
});
