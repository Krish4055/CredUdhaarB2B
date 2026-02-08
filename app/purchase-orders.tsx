// Purchase Orders Management
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { useApp } from '../hooks/useApp';
import { POCard, Button, Badge, Input } from '../components/ui';
import { POStatus, Invoice } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { formatCurrency, generateInvoiceNumber, calculateDueDate } from '../services/mockData';

export default function PurchaseOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { userProfile, purchaseOrders, updatePurchaseOrder, addInvoice } = useApp();
  
  const [selectedStatus, setSelectedStatus] = useState<POStatus | 'ALL'>('ALL');
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState('');

  if (!userProfile) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  const isSupplier = userProfile.role === 'SUPPLIER';
  
  const myPOs = purchaseOrders.filter((po) =>
    isSupplier ? po.supplierId === userProfile.business.id : po.buyerId === userProfile.business.id
  );

  const filteredPOs = selectedStatus === 'ALL'
    ? myPOs
    : myPOs.filter((po) => po.status === selectedStatus);

  const statuses: (POStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'REJECTED'];

  const handleConfirmPO = async (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    const charges = parseFloat(deliveryCharges) || 0;
    const total = po.subtotal + charges;
    const dueDate = calculateDueDate(po.paymentTerms);

    // Update PO
    await updatePurchaseOrder(poId, {
      status: 'CONFIRMED',
      deliveryCharges: charges,
      total: total,
      dueDate: dueDate,
      confirmedAt: new Date().toISOString(),
    });

    // Create Invoice
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
      dueDate: dueDate,
      status: 'PENDING',
      interestAccrued: 0,
      createdAt: new Date().toISOString(),
    };

    await addInvoice(invoice);

    showAlert(
      'PO Confirmed!',
      `Invoice ${invoice.invoiceNumber} created. Due: ${new Date(dueDate).toLocaleDateString('en-IN')}`,
      [{ text: 'OK', onPress: () => setSelectedPO(null) }]
    );
  };

  const handleRejectPO = async (poId: string) => {
    showAlert(
      'Reject Purchase Order',
      'Are you sure you want to reject this PO?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await updatePurchaseOrder(poId, {
              status: 'REJECTED',
              rejectionReason: 'Out of stock',
            });
            showAlert('PO Rejected', 'Buyer has been notified');
            setSelectedPO(null);
          },
        },
      ]
    );
  };

  const selectedPOData = purchaseOrders.find((po) => po.id === selectedPO);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Purchase Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {statuses.map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterChip,
              selectedStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.filterText,
              selectedStatus === status && styles.filterTextActive,
            ]}>
              {status}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* PO List */}
      <ScrollView contentContainerStyle={styles.content}>
        {filteredPOs.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="receipt-long" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No purchase orders</Text>
          </View>
        ) : (
          filteredPOs.map((po) => (
            <POCard
              key={po.id}
              po={po}
              viewMode={isSupplier ? 'supplier' : 'buyer'}
              onPress={() => setSelectedPO(po.id)}
            />
          ))
        )}
      </ScrollView>

      {/* PO Detail Modal */}
      {selectedPOData && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPOData.poNumber}</Text>
              <Pressable onPress={() => setSelectedPO(null)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {isSupplier ? 'Buyer' : 'Supplier'}:
                </Text>
                <Text style={styles.detailValue}>
                  {isSupplier ? selectedPOData.buyerName : selectedPOData.supplierName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Badge label={selectedPOData.status} variant="info" />
              </View>

              <Text style={styles.itemsTitle}>Items:</Text>
              {selectedPOData.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemSKU}>SKU: {item.sku}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemQty}>{item.quantity} units</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(selectedPOData.subtotal)}</Text>
                </View>
                {selectedPOData.deliveryCharges > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Delivery:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(selectedPOData.deliveryCharges)}</Text>
                  </View>
                )}
                <View style={[styles.totalRow, styles.totalRowFinal]}>
                  <Text style={styles.totalLabelFinal}>Total:</Text>
                  <Text style={styles.totalValueFinal}>{formatCurrency(selectedPOData.total)}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Terms:</Text>
                <Text style={styles.detailValue}>{selectedPOData.paymentTerms} days</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Delivery Address:</Text>
                <Text style={styles.detailValue}>{selectedPOData.deliveryAddress}</Text>
              </View>

              {selectedPOData.status === 'PENDING' && isSupplier && (
                <View style={styles.confirmForm}>
                  <Text style={styles.confirmTitle}>Confirm Order</Text>
                  <Input
                    label="Delivery Charges (optional)"
                    value={deliveryCharges}
                    onChangeText={setDeliveryCharges}
                    placeholder="₹0"
                    keyboardType="numeric"
                  />
                  <View style={styles.confirmActions}>
                    <Button
                      title="Reject"
                      onPress={() => handleRejectPO(selectedPOData.id)}
                      variant="outline"
                    />
                    <Button
                      title="Confirm & Create Invoice"
                      onPress={() => handleConfirmPO(selectedPOData.id)}
                    />
                  </View>
                </View>
              )}

              {selectedPOData.status === 'REJECTED' && (
                <View style={styles.rejectedBox}>
                  <MaterialIcons name="error" size={20} color={colors.error} />
                  <Text style={styles.rejectedText}>
                    Rejected: {selectedPOData.rejectionReason || 'No reason provided'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
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
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  itemsTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  itemSKU: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemQty: {
    ...typography.small,
    color: colors.textSecondary,
  },
  itemPrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  totalSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  confirmForm: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  confirmTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  rejectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  rejectedText: {
    ...typography.body,
    color: colors.error,
    flex: 1,
  },
});
