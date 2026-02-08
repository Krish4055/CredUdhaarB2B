import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const notifications = [
  { id: '1', title: 'PO Confirmed', message: 'PO-20250208-0001 confirmed and invoice created.', time: '2h ago' },
  { id: '2', title: 'Invoice Due Soon', message: 'INV-20250208-0003 due in 5 days.', time: '1d ago' },
  { id: '3', title: 'Overdue Alert', message: 'INV-20250208-0002 overdue by 6 days. Interest accruing.', time: '2d ago' },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="notifications" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardTitle: { ...typography.h3, color: colors.text, flex: 1 },
  time: { ...typography.caption, color: colors.textSecondary },
  message: { ...typography.body, color: colors.textSecondary },
});
