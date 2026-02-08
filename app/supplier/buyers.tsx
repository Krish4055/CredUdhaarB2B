import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { formatCurrency } from '../../services/mockData';

export default function SupplierBuyers() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, businesses, purchaseOrders, invoices } = useApp();

  if (!userProfile) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  const buyerIds = new Set(
    purchaseOrders
      .filter((po) => po.supplierId === userProfile.business.id)
      .map((po) => po.buyerId)
  );

  const buyers = businesses.filter((b) => buyerIds.has(b.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Buyers</Text>
        {buyers.length === 0 ? (
          <Text style={styles.empty}>No buyer accounts yet.</Text>
        ) : (
          buyers.map((buyer) => {
            const buyerInvoices = invoices.filter((inv) => inv.buyerId === buyer.id);
            const totalSpent = buyerInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
            return (
              <Pressable
                key={buyer.id}
                style={styles.card}
                onPress={() => router.push(`/supplier/buyers/${buyer.id}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{buyer.legalName}</Text>
                  {buyer.isVerified && <MaterialIcons name="verified" size={18} color={colors.verified} />}
                </View>
                <Text style={styles.meta}>Total Orders: {buyerInvoices.length}</Text>
                <Text style={styles.meta}>Total Spent: {formatCurrency(totalSpent)}</Text>
                <Text style={styles.meta}>Rating: ⭐ {buyer.rating.toFixed(1)}</Text>
              </Pressable>
            );
          })
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  cardTitle: { ...typography.h3, color: colors.text, flex: 1 },
  meta: { ...typography.caption, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
});
