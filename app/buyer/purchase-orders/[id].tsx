import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button } from '../../../components/ui';
import { useApp } from '../../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';
import { formatCurrency } from '../../../services/mockData';

export default function BuyerPurchaseOrderDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { purchaseOrders } = useApp();

  const po = purchaseOrders.find((p) => p.id === id);

  if (!po) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Purchase order not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{po.poNumber}</Text>
        <Badge label={po.status} variant="info" />

        <View style={styles.card}>
          <Text style={styles.label}>Supplier</Text>
          <Text style={styles.value}>{po.supplierName}</Text>
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
