import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../constants/theme';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.body}>
          These terms govern usage of CredUdhaar B2B. By using the platform, you agree to
          OTP-based authentication, legally enforceable purchase orders, and payment recovery
          policies. Interest on overdue invoices is charged at 18% p.a. starting day 5 after due date.
        </Text>
        <Text style={styles.sectionTitle}>Bank Guarantee</Text>
        <Text style={styles.body}>
          For overdue invoices, a bank-backed guarantee process is initiated to ensure supplier payment.
          This is displayed in-app for MVP, with full bank integration planned for Phase 2.
        </Text>
        <Text style={styles.sectionTitle}>Data & Security</Text>
        <Text style={styles.body}>
          Sensitive data such as bank account numbers are masked and stored securely.
          Phone and email verification are required for account access.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h2, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
});
