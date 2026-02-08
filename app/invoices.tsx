// Invoices & Payment Tracking
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { useApp } from '../hooks/useApp';
import { InvoiceCard, Button, Badge } from '../components/ui';
import { InvoiceStatus, Payment, PaymentMethod } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { formatCurrency, getDaysUntilDue } from '../services/mockData';

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { userProfile, invoices, updateInvoice, addPayment } = useApp();
  
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentReference, setPaymentReference] = useState('');

  if (!userProfile) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  const isSupplier = userProfile.role === 'SUPPLIER';
  
  const myInvoices = invoices.filter((inv) =>
    isSupplier ? inv.supplierId === userProfile.business.id : inv.buyerId === userProfile.business.id
  );

  // Auto-update overdue status
  React.useEffect(() => {
    myInvoices.forEach((inv) => {
      if (inv.status === 'PENDING' && getDaysUntilDue(inv.dueDate) < 0) {
        updateInvoice(inv.id, { status: 'OVERDUE' });
      }
    });
  }, []);

  const filteredInvoices = selectedStatus === 'ALL'
    ? myInvoices
    : myInvoices.filter((inv) => inv.status === selectedStatus);

  const statuses: (InvoiceStatus | 'ALL')[] = ['ALL', 'PENDING', 'PARTIALLY_PAID', 'OVERDUE', 'PAID'];

  const handlePayInvoice = async (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    const amountDue = invoice.amount - invoice.amountPaid;

    // Calculate interest if overdue
    const daysOverdue = Math.abs(Math.min(0, getDaysUntilDue(invoice.dueDate)));
    const interestRate = 0.18; // 18% p.a.
    const interest = daysOverdue > 5 ? (amountDue * interestRate * daysOverdue) / 365 : 0;
    const totalDue = amountDue + interest;

    showAlert(
      'Payment Confirmation',
      `Amount Due: ${formatCurrency(amountDue)}\n${interest > 0 ? `Interest (${daysOverdue} days overdue): ${formatCurrency(interest)}\n` : ''}Total: ${formatCurrency(totalDue)}\n\nProceed with ${paymentMethod} payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Payment',
          onPress: async () => {
            // Create payment record
            const payment: Payment = {
              id: `PAY${Date.now()}`,
              invoiceId: invoice.id,
              from: invoice.buyerName,
              to: invoice.supplierName,
              amount: totalDue,
              method: paymentMethod,
              reference: paymentReference || `TXN${Date.now()}`,
              status: paymentMethod === 'UPI' ? 'CONFIRMED' : 'PENDING',
              createdAt: new Date().toISOString(),
            };

            await addPayment(payment);

            // Update invoice
            const newAmountPaid = invoice.amountPaid + totalDue;
            const newStatus = newAmountPaid >= invoice.amount ? 'PAID' : 'PARTIALLY_PAID';
            
            await updateInvoice(invoice.id, {
              amountPaid: newAmountPaid,
              status: newStatus,
              interestAccrued: invoice.interestAccrued + interest,
            });

            showAlert('Payment Successful!', `Receipt: ${payment.reference}`);
            setSelectedInvoice(null);
            setPaymentReference('');
          },
        },
      ]
    );
  };

  const selectedInvoiceData = invoices.find((inv) => inv.id === selectedInvoice);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Invoices</Text>
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

      {/* Invoice List */}
      <ScrollView contentContainerStyle={styles.content}>
        {filteredInvoices.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="receipt" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No invoices</Text>
          </View>
        ) : (
          filteredInvoices
            .sort((a, b) => {
              // Sort by: OVERDUE first, then by due date
              if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
              if (a.status !== 'OVERDUE' && b.status === 'OVERDUE') return 1;
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                viewMode={isSupplier ? 'supplier' : 'buyer'}
                onPress={() => setSelectedInvoice(invoice.id)}
              />
            ))
        )}
      </ScrollView>

      {/* Invoice Detail Modal */}
      {selectedInvoiceData && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedInvoiceData.invoiceNumber}</Text>
              <Pressable onPress={() => setSelectedInvoice(null)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {isSupplier ? 'Buyer' : 'Supplier'}:
                </Text>
                <Text style={styles.detailValue}>
                  {isSupplier ? selectedInvoiceData.buyerName : selectedInvoiceData.supplierName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Badge
                  label={selectedInvoiceData.status}
                  variant={selectedInvoiceData.status === 'OVERDUE' ? 'error' : 'info'}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice Amount:</Text>
                <Text style={styles.detailValue}>{formatCurrency(selectedInvoiceData.amount)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Paid:</Text>
                <Text style={[styles.detailValue, { color: colors.success }]}>
                  {formatCurrency(selectedInvoiceData.amountPaid)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Due:</Text>
                <Text style={[styles.detailValue, { color: colors.error }]}>
                  {formatCurrency(selectedInvoiceData.amount - selectedInvoiceData.amountPaid)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedInvoiceData.dueDate).toLocaleDateString('en-IN')}
                </Text>
              </View>

              {selectedInvoiceData.status === 'OVERDUE' && (
                <View style={styles.overdueBox}>
                  <MaterialIcons name="warning" size={20} color={colors.error} />
                  <Text style={styles.overdueText}>
                    Overdue by {Math.abs(getDaysUntilDue(selectedInvoiceData.dueDate))} days
                  </Text>
                </View>
              )}

              {selectedInvoiceData.interestAccrued > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Interest Accrued:</Text>
                  <Text style={[styles.detailValue, { color: colors.error }]}>
                    {formatCurrency(selectedInvoiceData.interestAccrued)}
                  </Text>
                </View>
              )}

              {!isSupplier && selectedInvoiceData.status !== 'PAID' && (
                <View style={styles.paymentForm}>
                  <Text style={styles.paymentTitle}>Make Payment</Text>
                  
                  <Text style={styles.methodLabel}>Payment Method:</Text>
                  <View style={styles.methods}>
                    {(['UPI', 'BANK_TRANSFER', 'CASH'] as PaymentMethod[]).map((method) => (
                      <Pressable
                        key={method}
                        style={[
                          styles.methodButton,
                          paymentMethod === method && styles.methodButtonActive,
                        ]}
                        onPress={() => setPaymentMethod(method)}
                      >
                        <Text style={[
                          styles.methodText,
                          paymentMethod === method && styles.methodTextActive,
                        ]}>
                          {method.replace('_', ' ')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Button
                    title={`Pay ${formatCurrency(selectedInvoiceData.amount - selectedInvoiceData.amountPaid)}`}
                    onPress={() => handlePayInvoice(selectedInvoiceData.id)}
                    fullWidth
                  />
                </View>
              )}

              {selectedInvoiceData.status === 'PAID' && (
                <View style={styles.paidBox}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={styles.paidText}>This invoice has been paid in full</Text>
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
  overdueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  overdueText: {
    ...typography.body,
    color: colors.error,
    flex: 1,
    fontWeight: '600',
  },
  paymentForm: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  paymentTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  methodLabel: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  methods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  methodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodText: {
    ...typography.body,
    color: colors.text,
  },
  methodTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  paidBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  paidText: {
    ...typography.body,
    color: colors.success,
    flex: 1,
    fontWeight: '600',
  },
});
