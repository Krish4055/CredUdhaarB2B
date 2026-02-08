import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const faqs = [
  {
    q: 'How does the bank guarantee work?',
    a: 'For overdue invoices (5+ days), the platform initiates a bank recovery process. For MVP, the UI shows this state.'
  },
  {
    q: 'When is interest charged?',
    a: 'Interest is charged at 18% p.a. starting day 5 after due date.'
  },
  {
    q: 'How is credit score calculated?',
    a: 'It uses on-time payment %, turnover tier, transaction history, and business age.'
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Help & FAQ</Text>
        {faqs.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.answer}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  question: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  answer: { ...typography.body, color: colors.textSecondary },
});
