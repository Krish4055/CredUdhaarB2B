import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Badge } from '../../../../components/ui';
import { useApp } from '../../../../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../../../../constants/theme';
import { formatCurrency } from '../../../../services/mockData';

export default function SupplierEditProduct() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useApp();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Product</Text>
        <Badge label={product.isActive ? 'ACTIVE' : 'INACTIVE'} variant={product.isActive ? 'success' : 'error'} />

        <View style={styles.card}>
          <Text style={styles.label}>Product Name</Text>
          <Text style={styles.value}>{product.name}</Text>
          <Text style={styles.label}>SKU</Text>
          <Text style={styles.value}>{product.sku}</Text>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{product.category}</Text>
          <Text style={styles.label}>MOQ</Text>
          <Text style={styles.value}>{product.moq} {product.unitType}</Text>
          <Text style={styles.label}>Wholesale Price</Text>
          <Text style={styles.value}>{formatCurrency(product.wholesalePrice)}</Text>
          <Text style={styles.label}>Stock Quantity</Text>
          <Text style={styles.value}>{product.currentStock} units</Text>
        </View>

        <Button title="Open Product Manager" onPress={() => router.push('/products')} fullWidth />
        <Button title="Back" onPress={() => router.back()} variant="outline" fullWidth />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  value: { ...typography.body, color: colors.text },
  error: { ...typography.body, color: colors.textSecondary, padding: spacing.lg, textAlign: 'center' },
});
