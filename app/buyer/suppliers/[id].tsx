import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button } from '../../../components/ui';
import { useApp } from '../../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';

export default function BuyerSupplierDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { businesses, products } = useApp();

  const supplier = businesses.find((b) => b.id === id);

  if (!supplier) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Supplier not found.</Text>
      </View>
    );
  }

  const supplierProducts = products.filter((p) => p.supplierId === supplier.id && p.isActive);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{supplier.legalName}</Text>
        <View style={styles.badges}>
          {supplier.isVerified && <Badge label="Verified" variant="success" />}
          <Badge label={`⭐ ${supplier.rating.toFixed(1)}`} variant="info" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{supplier.address.city}, {supplier.address.state}</Text>
          <Text style={styles.label}>Year Established</Text>
          <Text style={styles.value}>{supplier.yearEstablished}</Text>
          <Text style={styles.label}>Total Products</Text>
          <Text style={styles.value}>{supplierProducts.length}</Text>
        </View>

        <Button title="View Products" onPress={() => router.push('/buyer/marketplace')} fullWidth />
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
  error: { ...typography.body, color: colors.textSecondary, padding: spacing.lg, textAlign: 'center' },
});
