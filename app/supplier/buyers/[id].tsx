import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button } from '../../../components/ui';
import { useApp } from '../../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';
import { formatCurrency } from '../../../services/mockData';

export default function SupplierBuyerDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { businesses, invoices, purchaseOrders } = useApp();

  const buyer = businesses.find((b) => b.id === id);

  if (!buyer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Buyer not found.</Text>
      </View>
    );
  }

  const buyerPOs = purchaseOrders.filter((po) => po.buyerId === buyer.id);
  const buyerInvoices = invoices.filter((inv) => inv.buyerId === buyer.id);
  const totalSpent = buyerInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{buyer.legalName}</Text>
        <View style={styles.badges}>
          {buyer.isVerified && <Badge label="Verified" variant="success" />}
          <Badge label={`⭐ ${buyer.rating.toFixed(1)}`} variant="info" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>{buyer.contactName}</Text>
          <Text style={styles.value}>{buyer.contactPhone}</Text>
          <Text style={styles.value}>{buyer.contactEmail}</Text>
          <Text style={styles.label}>Business Type</Text>
          <Text style={styles.value}>{buyer.businessType}</Text>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        <Text style={styles.meta}>Total Orders: {buyerPOs.length}</Text>
        <Text style={styles.meta}>Total Spent: {formatCurrency(totalSpent)}</Text>
        <Text style={styles.meta}>Average Rating: ⭐ {buyer.rating.toFixed(1)}</Text>

        <Button title="Back" onPress={() => router.back()} variant="outline" fullWidth />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  badges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  value: { ...typography.body, color: colors.text },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  error: { ...typography.body, color: colors.textSecondary, padding: spacing.lg, textAlign: 'center' },
});
