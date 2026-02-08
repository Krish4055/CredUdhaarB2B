import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export default function BuyerSuppliers() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, businesses, purchaseOrders } = useApp();

  if (!userProfile) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  const supplierIds = new Set(
    purchaseOrders
      .filter((po) => po.buyerId === userProfile.business.id)
      .map((po) => po.supplierId)
  );

  const suppliers = businesses.filter((b) => supplierIds.has(b.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Suppliers</Text>
        {suppliers.length === 0 ? (
          <Text style={styles.empty}>No suppliers yet.</Text>
        ) : (
          suppliers.map((supplier) => (
            <Pressable
              key={supplier.id}
              style={styles.card}
              onPress={() => router.push(`/buyer/suppliers/${supplier.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{supplier.legalName}</Text>
                {supplier.isVerified && <MaterialIcons name="verified" size={18} color={colors.verified} />}
              </View>
              <Text style={styles.meta}>Rating: ⭐ {supplier.rating.toFixed(1)}</Text>
              <Text style={styles.meta}>Established: {supplier.yearEstablished}</Text>
            </Pressable>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  cardTitle: { ...typography.h3, color: colors.text, flex: 1 },
  meta: { ...typography.caption, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
});
