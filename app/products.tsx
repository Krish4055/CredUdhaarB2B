// Product Catalog Management (Supplier)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { useApp } from '../hooks/useApp';
import { Button, ProductCard, Input } from '../components/ui';
import { Product, ProductCategory, UnitType } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { userProfile, products, addProduct, updateProduct } = useApp();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [step, setStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Textiles' as ProductCategory,
    sku: '',
    unitType: 'Pieces' as UnitType,
    moq: '',
    wholesalePrice: '',
    bulkTier1MinQty: '',
    bulkTier1Price: '',
    bulkTier2MinQty: '',
    bulkTier2Price: '',
    currentStock: '',
    reorderLevel: '',
    imageUrl: '',
  });

  const myProducts = products.filter((p) => p.supplierId === userProfile?.business.id);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Textiles',
      sku: '',
      unitType: 'Pieces',
      moq: '',
      wholesalePrice: '',
      bulkTier1MinQty: '',
      bulkTier1Price: '',
      bulkTier2MinQty: '',
      bulkTier2Price: '',
      currentStock: '',
      reorderLevel: '',
      imageUrl: '',
    });
    setStep(1);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.description || !formData.sku || !formData.moq) {
        showAlert('Validation Error', 'Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.wholesalePrice || !formData.currentStock) {
        showAlert('Validation Error', 'Please fill in all required fields');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handlePublish();
    }
  };

  const handlePublish = async () => {
    const newProduct: Product = {
      id: editingProduct?.id || `PROD${Date.now()}`,
      supplierId: userProfile?.business.id || '',
      name: formData.name,
      description: formData.description,
      category: formData.category,
      sku: formData.sku,
      unitType: formData.unitType,
      moq: parseInt(formData.moq) || 1,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
      bulkTier1: formData.bulkTier1MinQty && formData.bulkTier1Price
        ? { minQuantity: parseInt(formData.bulkTier1MinQty), price: parseFloat(formData.bulkTier1Price) }
        : undefined,
      bulkTier2: formData.bulkTier2MinQty && formData.bulkTier2Price
        ? { minQuantity: parseInt(formData.bulkTier2MinQty), price: parseFloat(formData.bulkTier2Price) }
        : undefined,
      currentStock: parseInt(formData.currentStock) || 0,
      reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : undefined,
      imageUrl: formData.imageUrl || `https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=400`,
      isActive: true,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, newProduct);
      showAlert('Success', 'Product updated successfully!');
    } else {
      await addProduct(newProduct);
      showAlert('Success', `Product created! SKU: ${formData.sku}`);
    }
    
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      sku: product.sku,
      unitType: product.unitType,
      moq: product.moq.toString(),
      wholesalePrice: product.wholesalePrice.toString(),
      bulkTier1MinQty: product.bulkTier1?.minQuantity.toString() || '',
      bulkTier1Price: product.bulkTier1?.price.toString() || '',
      bulkTier2MinQty: product.bulkTier2?.minQuantity.toString() || '',
      bulkTier2Price: product.bulkTier2?.price.toString() || '',
      currentStock: product.currentStock.toString(),
      reorderLevel: product.reorderLevel?.toString() || '',
      imageUrl: product.imageUrl || '',
    });
    setShowAddForm(true);
  };

  const handleToggleActive = async (product: Product) => {
    await updateProduct(product.id, { isActive: !product.isActive });
    showAlert('Success', `Product ${product.isActive ? 'deactivated' : 'activated'}`);
  };

  if (!userProfile || userProfile.role !== 'SUPPLIER') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Only suppliers can manage products</Text>
      </View>
    );
  }

  if (showAddForm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.formContent}>
          <View style={styles.header}>
            <Pressable onPress={resetForm}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Step Indicators */}
          <View style={styles.steps}>
            <StepIndicator number={1} label="Basic Info" active={step === 1} completed={step > 1} />
            <View style={styles.stepLine} />
            <StepIndicator number={2} label="Pricing" active={step === 2} completed={step > 2} />
            <View style={styles.stepLine} />
            <StepIndicator number={3} label="Review" active={step === 3} completed={false} />
          </View>

          {step === 1 && (
            <>
              <Input
                label="Product Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Premium Cotton Fabric"
                required
              />
              <Input
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe your product..."
                multiline
                numberOfLines={3}
                required
              />
              <Input
                label="SKU / Product Code"
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
                placeholder="e.g., RAJ-COT-001"
                required
              />
              <Input
                label="Minimum Order Quantity (MOQ)"
                value={formData.moq}
                onChangeText={(text) => setFormData({ ...formData, moq: text })}
                placeholder="e.g., 500"
                keyboardType="numeric"
                required
              />
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="Wholesale Price per Unit (₹)"
                value={formData.wholesalePrice}
                onChangeText={(text) => setFormData({ ...formData, wholesalePrice: text })}
                placeholder="e.g., 120"
                keyboardType="numeric"
                required
              />
              <Text style={styles.sectionTitle}>Bulk Discount Tier 1 (Optional)</Text>
              <Input
                label="Minimum Quantity"
                value={formData.bulkTier1MinQty}
                onChangeText={(text) => setFormData({ ...formData, bulkTier1MinQty: text })}
                placeholder="e.g., 2500 (5×MOQ)"
                keyboardType="numeric"
              />
              <Input
                label="Price per Unit (₹)"
                value={formData.bulkTier1Price}
                onChangeText={(text) => setFormData({ ...formData, bulkTier1Price: text })}
                placeholder="e.g., 110"
                keyboardType="numeric"
              />
              <Text style={styles.sectionTitle}>Bulk Discount Tier 2 (Optional)</Text>
              <Input
                label="Minimum Quantity"
                value={formData.bulkTier2MinQty}
                onChangeText={(text) => setFormData({ ...formData, bulkTier2MinQty: text })}
                placeholder="e.g., 5000 (10×MOQ)"
                keyboardType="numeric"
              />
              <Input
                label="Price per Unit (₹)"
                value={formData.bulkTier2Price}
                onChangeText={(text) => setFormData({ ...formData, bulkTier2Price: text })}
                placeholder="e.g., 100"
                keyboardType="numeric"
              />
              <Input
                label="Current Stock Quantity"
                value={formData.currentStock}
                onChangeText={(text) => setFormData({ ...formData, currentStock: text })}
                placeholder="e.g., 15000"
                keyboardType="numeric"
                required
              />
            </>
          )}

          {step === 3 && (
            <View style={styles.review}>
              <Text style={styles.reviewTitle}>Review & Publish</Text>
              <ReviewRow label="Product Name" value={formData.name} />
              <ReviewRow label="SKU" value={formData.sku} />
              <ReviewRow label="Category" value={formData.category} />
              <ReviewRow label="MOQ" value={`${formData.moq} ${formData.unitType}`} />
              <ReviewRow label="Wholesale Price" value={`₹${formData.wholesalePrice}/${formData.unitType}`} />
              {formData.bulkTier1MinQty && (
                <ReviewRow label="Bulk Tier 1" value={`₹${formData.bulkTier1Price} for ${formData.bulkTier1MinQty}+ units`} />
              )}
              {formData.bulkTier2MinQty && (
                <ReviewRow label="Bulk Tier 2" value={`₹${formData.bulkTier2Price} for ${formData.bulkTier2MinQty}+ units`} />
              )}
              <ReviewRow label="Stock" value={formData.currentStock} />
            </View>
          )}

          <View style={styles.formActions}>
            {step > 1 && (
              <Button
                title="Back"
                onPress={() => setStep(step - 1)}
                variant="outline"
                fullWidth
              />
            )}
            <Button
              title={step === 3 ? 'Publish Product' : 'Next'}
              onPress={handleNext}
              fullWidth
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Product Catalog</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Button
          title="+ Create New Product"
          onPress={() => setShowAddForm(true)}
          fullWidth
        />

        <Text style={styles.sectionTitle}>Your Products ({myProducts.length})</Text>

        {myProducts.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="inventory-2" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubtext}>Add your first product to start receiving orders</Text>
          </View>
        ) : (
          myProducts.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <ProductCard
                product={product}
                onPress={() => handleEdit(product)}
              />
              <View style={styles.productActions}>
                <Button
                  title="Edit"
                  onPress={() => handleEdit(product)}
                  variant="outline"
                  icon="edit"
                />
                <Button
                  title={product.isActive ? 'Deactivate' : 'Activate'}
                  onPress={() => handleToggleActive(product)}
                  variant={product.isActive ? 'outline' : 'default'}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function StepIndicator({ number, label, active, completed }: any) {
  return (
    <View style={styles.stepIndicator}>
      <View style={[
        styles.stepCircle,
        active && styles.stepCircleActive,
        completed && styles.stepCircleCompleted,
      ]}>
        <Text style={[
          styles.stepNumber,
          (active || completed) && styles.stepNumberActive,
        ]}>{number}</Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}:</Text>
      <Text style={styles.reviewValue}>{value}</Text>
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
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  formContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepNumber: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.textInverse,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  formActions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  review: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reviewTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  reviewValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  productItem: {
    marginBottom: spacing.md,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  error: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
