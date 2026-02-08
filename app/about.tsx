import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../constants/theme';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>About CredUdhaar B2B</Text>
        <Text style={styles.body}>
          CredUdhaar B2B digitizes trust-based wholesale credit by converting purchase orders into
          legally enforceable payment obligations with bank-backed guarantees. Suppliers can extend
          credit safely, and buyers build a verified credit history.
        </Text>
        <Text style={styles.sectionTitle}>Why it matters</Text>
        <Text style={styles.body}>
          Delayed payments can break working capital cycles. CredUdhaar brings transparent payment
          terms, credit scoring, and structured recovery so wholesalers can grow without fear of default.
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
