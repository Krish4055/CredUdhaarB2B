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
              <Text style={styles.roleTitle}>I'm a Supplier</Text>
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
              <Text style={styles.roleTitle}>I'm a Buyer</Text>
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.businessName}>{userProfile.business.legalName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              {userProfile.business.isVerified && (
                <MaterialIcons name="verified" size={16} color={colors.verified} />
              )}
              <Text style={styles.businessType}>{userProfile.business.businessType}</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/profile')}>
            <MaterialIcons name="account-circle" size={40} color={colors.primary} />
          </Pressable>
        </View>

        {/* Role Badge */}
        <Badge label={isSupplier ? '🏭 Supplier Mode' : '🛒 Buyer Mode'} variant="info" />

        {/* Stats */}
        <View style={styles.statsGrid}>
          {isSupplier ? (
            <>
              <StatCard label="Pending POs" value={pendingPOs} variant={pendingPOs > 0 ? 'warning' : 'default'} />
              <StatCard label="Confirmed POs" value={confirmedPOs} variant="success" />
              <StatCard label="Overdue Amount" value={formatCurrency(overdueAmount)} variant={overdueAmount > 0 ? 'error' : 'default'} />
              <StatCard
                label="Supplier Rating"
                value={`⭐ ${userProfile.business.rating.toFixed(1)}`}
                subtitle={`${userProfile.business.reviewCount} reviews`}
              />
            </>
          ) : (
            <>
              <StatCard
                label="Credit Available"
                value={formatCurrency(userProfile.availableCredit || 0)}
                variant="success"
              />
              <StatCard
                label="Credit Used"
                value={formatCurrency(userProfile.creditUsed || 0)}
              />
              <StatCard
                label="Overdue Amount"
                value={formatCurrency(overdueAmount)}
                variant={overdueAmount > 0 ? 'error' : 'default'}
              />
              <StatCard
                label="On-Time Rate"
                value={`${userProfile.onTimePaymentRate || 100}%`}
                variant={(userProfile.onTimePaymentRate || 100) >= 80 ? 'success' : 'warning'}
              />
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
  businessName: {
    ...typography.h2,
    color: colors.text,
  },
  businessType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statsGrid: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});
