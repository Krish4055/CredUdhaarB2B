import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Product, Business } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { formatCurrency } from '../../services/mockData';
import { Badge } from './Badge';

interface ProductCardProps {
  product: Product;
  supplier?: Business;
  onPress: () => void;
  showSupplier?: boolean;
}

export function ProductCard({ product, supplier, onPress, showSupplier = false }: ProductCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      {product.imageUrl && (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        {showSupplier && supplier && (
          <View style={styles.supplierRow}>
            <Text style={styles.supplier}>{supplier.legalName}</Text>
            {supplier.isVerified && (
              <MaterialIcons name="verified" size={14} color={colors.verified} />
            )}
            <Text style={styles.rating}>⭐ {supplier.rating.toFixed(1)}</Text>
          </View>
        )}
        
        <Text style={styles.category}>{product.category}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatCurrency(product.wholesalePrice)}/{product.unitType}
          </Text>
          {(product.bulkTier1 || product.bulkTier2) && (
            <Badge label="Bulk pricing" variant="info" size="small" />
          )}
        </View>
        
        <Text style={styles.moq}>MOQ: {product.moq} {product.unitType}</Text>
        
        <View style={styles.footer}>
          <View style={styles.stockRow}>
            <MaterialIcons
              name="inventory"
              size={16}
              color={product.currentStock > (product.reorderLevel || 0) ? colors.success : colors.warning}
            />
            <Text style={[
              styles.stock,
              product.currentStock > (product.reorderLevel || 0) ? styles.inStock : styles.lowStock
            ]}>
              {product.currentStock > 0 ? `${product.currentStock} in stock` : 'Out of stock'}
            </Text>
          </View>
          
          {!product.isActive && <Badge label="Inactive" variant="default" size="small" />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  supplier: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  rating: {
    ...typography.small,
    color: colors.textSecondary,
  },
  category: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  moq: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stock: {
    ...typography.small,
  },
  inStock: {
    color: colors.success,
  },
  lowStock: {
    color: colors.warning,
  },
});
