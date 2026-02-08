// Product Detail & Create PO (Buyer)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { useApp } from '../hooks/useApp';
import { Button, Input, Badge } from '../components/ui';
import { POItem, PurchaseOrder, PaymentTerms } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { formatCurrency, calculatePrice, generatePONumber, calculateDueDate } from '../services/mockData';

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();
  const { products, businesses, userProfile, addPurchaseOrder } = useApp();
  
  const [quantity, setQuantity] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(30);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  const product = products.find((p) => p.id === id);
  const supplier = product ? businesses.find((b) => b.id === product.supplierId) : null;

  if (!product || !supplier) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Product not found</Text>
      </View>
    );
  }

  const qty = parseInt(quantity) || 0;
  const unitPrice = calculatePrice(product, qty);
  const subtotal = qty * unitPrice;
  
  // Payment terms adjustments
  const adjustments = {
    15: -0.015,  // 1.5% discount
    30: 0,       // standard
    45: 0.005,   // 0.5% surcharge
    60: 0.01,    // 1% surcharge
    90: 0.02,    // 2% surcharge
  };
  
  const adjustment = adjustments[paymentTerms];
  const total = subtotal * (1 + adjustment);

  const handleCreatePO = async () => {
    if (!userProfile || userProfile.role !== 'BUYER') {
      showAlert('Error', 'Only buyers can create purchase orders');
      return;
    }
    
    if (!quantity || qty < product.moq) {
      showAlert('Validation Error', `Minimum order quantity is ${product.moq} ${product.unitType}`);
      return;
    }
    
    if (!deliveryAddress) {
      showAlert('Validation Error', 'Please enter a delivery address');
      return;
    }
    
    // Check credit availability
    const availableCredit = userProfile.availableCredit || 0;
    if (total > availableCredit) {
      showAlert('Insufficient Credit', `You have ₹${availableCredit.toLocaleString('en-IN')} available credit. This order requires ₹${total.toLocaleString('en-IN')}.`);
      return;
    }

    const poItem: POItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      unitPrice: unitPrice,
      subtotal: qty * unitPrice,
    };

    const po: PurchaseOrder = {
      id: `PO${Date.now()}`,
      poNumber: generatePONumber(),
      supplierId: supplier.id,
      supplierName: supplier.legalName,
      buyerId: userProfile.business.id,
      buyerName: userProfile.business.legalName,
      items: [poItem],
      subtotal: subtotal,
      deliveryCharges: 0,
      total: total,
      deliveryAddress: deliveryAddress,
      paymentTerms: paymentTerms,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await addPurchaseOrder(po);
    
    showAlert(
      'Purchase Order Created!',
      `${po.poNumber} sent to ${supplier.legalName} for confirmation`,
      [{ text: 'View Orders', onPress: () => router.replace('/purchase-orders') }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Image */}
        {product.imageUrl && (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.metaRow}>
            <Badge label={product.category} variant="info" />
            <Text style={styles.sku}>SKU: {product.sku}</Text>
          </View>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Supplier Profile */}
        <View style={styles.supplierCard}>
          <View style={styles.supplierHeader}>
            <MaterialIcons name="storefront" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text style={styles.supplierName}>{supplier.legalName}</Text>
                {supplier.isVerified && (
                  <MaterialIcons name="verified" size={16} color={colors.verified} />
                )}
              </View>
              <Text style={styles.supplierRating}>
                ⭐ {supplier.rating.toFixed(1)} ({supplier.reviewCount} reviews)
              </Text>
            </View>
          </View>
          <View style={styles.supplierDetails}>
            <SupplierDetail icon="location-on" text={`${supplier.address.city}, ${supplier.address.state}`} />
            <SupplierDetail icon="event" text={`Est. ${supplier.yearEstablished}`} />
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <PricingTier
            label="Base Price"
            minQty={product.moq}
            price={product.wholesalePrice}
            unitType={product.unitType}
          />
          {product.bulkTier1 && (
            <PricingTier
              label="Bulk Tier 1"
              minQty={product.bulkTier1.minQuantity}
              price={product.bulkTier1.price}
              unitType={product.unitType}
            />
          )}
          {product.bulkTier2 && (
            <PricingTier
              label="Bulk Tier 2"
              minQty={product.bulkTier2.minQuantity}
              price={product.bulkTier2.price}
              unitType={product.unitType}
            />
          )}
        </View>

        {/* Order Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Place Order</Text>
          
          <Input
            label={`Quantity (Min: ${product.moq} ${product.unitType})`}
            value={quantity}
            onChangeText={setQuantity}
            placeholder={`Enter quantity (≥${product.moq})`}
            keyboardType="numeric"
            required
          />

          {qty > 0 && (
            <View style={styles.calculation}>
              <Text style={styles.calcText}>
                {qty} × {formatCurrency(unitPrice)} = {formatCurrency(subtotal)}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Payment Terms</Text>
          <View style={styles.paymentTerms}>
            {([15, 30, 45, 60, 90] as PaymentTerms[]).map((term) => (
              <Pressable
                key={term}
                style={[
                  styles.termButton,
                  paymentTerms === term && styles.termButtonActive,
                ]}
                onPress={() => setPaymentTerms(term)}
              >
                <Text style={[
                  styles.termText,
                  paymentTerms === term && styles.termTextActive,
                ]}>
                  {term} days
                </Text>
                {adjustments[term] !== 0 && (
                  <Text style={[
                    styles.termAdjust,
                    paymentTerms === term && styles.termAdjustActive,
                  ]}>
                    {adjustments[term] > 0 ? '+' : ''}{(adjustments[term] * 100).toFixed(1)}%
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

          <Input
            label="Delivery Address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Enter delivery address"
            multiline
            numberOfLines={2}
            required
          />

          {qty > 0 && deliveryAddress && (
            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
              </View>
              {adjustment !== 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    {adjustment > 0 ? 'Surcharge' : 'Discount'} ({paymentTerms} days):
                  </Text>
                  <Text style={[styles.totalValue, adjustment < 0 ? styles.discount : styles.surcharge]}>
                    {adjustment > 0 ? '+' : ''}{formatCurrency(subtotal * adjustment)}
                  </Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>Total Due:</Text>
                <Text style={styles.totalValueFinal}>{formatCurrency(total)}</Text>
              </View>
            </View>
          )}

          <Button
            title="Create Purchase Order"
            onPress={handleCreatePO}
            fullWidth
            disabled={!quantity || !deliveryAddress || qty < product.moq}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function PricingTier({ label, minQty, price, unitType }: any) {
  return (
    <View style={styles.pricingTier}>
      <Text style={styles.tierLabel}>{label}</Text>
      <Text style={styles.tierValue}>
        {formatCurrency(price)}/{unitType} for {minQty}+ units
      </Text>
    </View>
  );
}

function SupplierDetail({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.supplierDetail}>
      <MaterialIcons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.supplierDetailText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: colors.backgroundSecondary,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  name: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sku: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  supplierCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  supplierName: {
    ...typography.h3,
    color: colors.text,
  },
  supplierRating: {
    ...typography.small,
    color: colors.textSecondary,
  },
  supplierDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  supplierDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  supplierDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  pricingTier: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tierLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tierValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  calculation: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  calcText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  label: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  paymentTerms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  termButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  termTextActive: {
    color: colors.textInverse,
  },
  termAdjust: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  termAdjustActive: {
    color: colors.textInverse,
  },
  totalCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  totalLabelFinal: {
    ...typography.h3,
    color: colors.text,
  },
  totalValueFinal: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  discount: {
    color: colors.success,
  },
  surcharge: {
    color: colors.warning,
  },
  error: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
