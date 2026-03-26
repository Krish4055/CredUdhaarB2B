// Role Selection & Dashboard
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../hooks/useApp';
import { Button, StatCard, Badge } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { formatCurrency } from '../../services/mockData';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, isLoggedIn, purchaseOrders, invoices } = useApp();

  if (!isLoggedIn || !userProfile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>CredUdhaar B2B</Text>
            <Text style={styles.subtitle}>Bank-Backed Wholesale Trade Platform</Text>
          </View>

          {/* Role Cards */}
          <View style={styles.roleSection}>
            <Text style={styles.sectionTitle}>Select Your Role</Text>
            
            <Pressable
              style={({ pressed }) => [
                styles.roleCard,
                { backgroundColor: colors.supplier },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/register?role=SUPPLIER')}
            >
              <MaterialIcons name="storefront" size={48} color={colors.textInverse} />
              <Text style={styles.roleTitle}>I&apos;m a Supplier</Text>
              <Text style={styles.roleDesc}>
                List products, manage orders, receive payments with bank guarantee
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.roleCard,
                { backgroundColor: colors.buyer },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/register?role=BUYER')}
            >
              <MaterialIcons name="shopping-cart" size={48} color={colors.textInverse} />
              <Text style={styles.roleTitle}>I&apos;m a Buyer</Text>
              <Text style={styles.roleDesc}>
                Browse products, place orders, build credit history with flexible payment terms
              </Text>
            </Pressable>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem icon="verified" text="Bank-guaranteed payments" />
            <FeatureItem icon="schedule" text="Flexible payment terms (15-90 days)" />
            <FeatureItem icon="trending-up" text="Build B2B credit score" />
            <FeatureItem icon="security" text="Legal enforcement via RBI guidelines" />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Logged in - show dashboard based on role
  const isSupplier = userProfile.role === 'SUPPLIER';

  // Calculate stats
  const myPOs = isSupplier
    ? purchaseOrders.filter((po) => po.supplierId === userProfile.business.id)
    : purchaseOrders.filter((po) => po.buyerId === userProfile.business.id);

  const pendingPOs = myPOs.filter((po) => po.status === 'PENDING').length;
  const confirmedPOs = myPOs.filter((po) => po.status === 'CONFIRMED').length;

  const myInvoices = isSupplier
    ? invoices.filter((inv) => inv.supplierId === userProfile.business.id)
    : invoices.filter((inv) => inv.buyerId === userProfile.business.id);

  const overdueInvoices = myInvoices.filter((inv) => inv.status === 'OVERDUE');
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);
  const outstandingAmount = myInvoices.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);
  const activeBuyerCount = new Set(myPOs.map((po) => po.buyerId)).size;
  const activeSupplierCount = new Set(myPOs.map((po) => po.supplierId)).size;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.businessName}>{userProfile.business.legalName}</Text>
            <View style={styles.headerMeta}>
              {userProfile.business.isVerified && (
                <MaterialIcons name="verified" size={16} color={colors.verified} />
              )}
              <Text style={styles.businessType}>{userProfile.business.businessType}</Text>
              <Badge
                label={userProfile.business.verificationStatus}
                variant={userProfile.business.verificationStatus === 'VERIFIED' ? 'success' : userProfile.business.verificationStatus === 'REJECTED' ? 'error' : 'warning'}
                small
              />
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push('/notifications')} style={styles.iconButton}>
              <MaterialIcons name="notifications" size={22} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => router.push('/profile')} style={styles.iconButton}>
              <MaterialIcons name="account-circle" size={36} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Role Badge */}
        <Badge label={isSupplier ? '🏭 Supplier Mode' : '🛒 Buyer Mode'} variant="info" />

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text style={styles.summaryValue}>{formatCurrency(outstandingAmount)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <Text style={styles.summaryLabel}>Overdue</Text>
              <Text style={[styles.summaryValue, overdueAmount > 0 && styles.summaryDanger]}>
                {formatCurrency(overdueAmount)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryFoot}>
            <MaterialIcons name="security" size={16} color={colors.success} />
            <Text style={styles.summaryFootText}>Bank-backed guarantees apply after day 5 overdue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Pressable onPress={() => router.push('/help')}>
            <Text style={styles.sectionLink}>Help</Text>
          </Pressable>
        </View>
        <View style={styles.quickActions}>
          {isSupplier ? (
            <>
              <QuickAction icon="inventory" label="Add Product" onPress={() => router.push('/products')} />
              <QuickAction icon="receipt-long" label="Confirm POs" onPress={() => router.push('/purchase-orders')} />
              <QuickAction icon="request-quote" label="Invoices" onPress={() => router.push('/invoices')} />
              <QuickAction icon="group" label="Buyers" onPress={() => router.push('/supplier/buyers')} />
            </>
          ) : (
            <>
              <QuickAction icon="shopping-bag" label="Marketplace" onPress={() => router.push('/marketplace')} />
              <QuickAction icon="receipt-long" label="My Orders" onPress={() => router.push('/purchase-orders')} />
              <QuickAction icon="payments" label="Pay Invoices" onPress={() => router.push('/invoices')} />
              <QuickAction icon="storefront" label="Suppliers" onPress={() => router.push('/buyer/suppliers')} />
            </>
          )}
        </View>

        {/* Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <Text style={styles.sectionHint}>Last 30 days</Text>
        </View>
        <View style={styles.statsGrid}>
          {isSupplier ? (
            <>
              <StatItem>
                <StatCard label="Pending POs" value={pendingPOs} variant={pendingPOs > 0 ? 'warning' : 'default'} />
              </StatItem>
              <StatItem>
                <StatCard label="Confirmed POs" value={confirmedPOs} variant="success" />
              </StatItem>
              <StatItem>
                <StatCard label="Active Buyers" value={activeBuyerCount} />
              </StatItem>
              <StatItem>
                <StatCard label="Available Credit" value={formatCurrency(0)} subtitle="Mock" />
              </StatItem>
              <StatItem>
                <StatCard label="Avg Payment Days" value="22" subtitle="Mock" />
              </StatItem>
              <StatItem>
                <StatCard
                  label="Supplier Rating"
                  value={`⭐ ${userProfile.business.rating.toFixed(1)}`}
                  subtitle={`${userProfile.business.reviewCount} reviews`}
                />
              </StatItem>
            </>
          ) : (
            <>
              <StatItem>
                <StatCard label="Total Credit Limit" value={formatCurrency(userProfile.creditLimit || 0)} />
              </StatItem>
              <StatItem>
                <StatCard label="Credit Used" value={formatCurrency(userProfile.creditUsed || 0)} />
              </StatItem>
              <StatItem>
                <StatCard label="Credit Available" value={formatCurrency(userProfile.availableCredit || 0)} variant="success" />
              </StatItem>
              <StatItem>
                <StatCard label="Active Suppliers" value={activeSupplierCount} />
              </StatItem>
              <StatItem>
                <StatCard label="On-Time Rate" value={`${userProfile.onTimePaymentRate || 100}%`} variant={(userProfile.onTimePaymentRate || 100) >= 80 ? 'success' : 'warning'} />
              </StatItem>
              <StatItem>
                <StatCard label="Credit Score" value={`${userProfile.creditScore || 0}/100`} variant={(userProfile.creditScore || 0) >= 80 ? 'success' : (userProfile.creditScore || 0) >= 60 ? 'warning' : 'error'} />
              </StatItem>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isSupplier ? (
            <>
              <Button
                title="Manage Products"
                onPress={() => router.push('/products')}
                fullWidth
              />
              <Button
                title="View Purchase Orders"
                onPress={() => router.push('/purchase-orders')}
                variant="outline"
                fullWidth
              />
            </>
          ) : (
            <>
              <Button
                title="Browse & Order Products"
                onPress={() => router.push('/marketplace')}
                fullWidth
              />
              <Button
                title="View My Invoices"
                onPress={() => router.push('/invoices')}
                variant="outline"
                fullWidth
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <MaterialIcons name={icon} size={20} color={colors.success} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]} onPress={onPress}>
      <MaterialIcons name={icon} size={22} color={colors.primary} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function StatItem({ children }: { children: React.ReactNode }) {
  return <View style={styles.statItem}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  roleCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  roleTitle: {
    ...typography.h2,
    color: colors.textInverse,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  roleDesc: {
    ...typography.body,
    color: colors.textInverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  features: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  dashboardContent: {
    padding: spacing.lg,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  businessName: {
    ...typography.h2,
    color: colors.text,
  },
  businessType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  summaryCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  summaryDanger: {
    color: colors.error,
  },
  summaryFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryFootText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLink: {
    ...typography.caption,
    color: colors.primary,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  quickLabel: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statsGrid: {
    marginTop: spacing.lg,
    gap: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});
