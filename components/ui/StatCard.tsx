import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  onPress?: () => void;
}

export function StatCard({ label, value, subtitle, variant = 'default', onPress }: StatCardProps) {
  const Wrapper = onPress ? Pressable : View;
  
  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: any) => [
        styles.card,
        onPress && pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, styles[`${variant}Value`]]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  defaultValue: {
    color: colors.text,
  },
  successValue: {
    color: colors.success,
  },
  warningValue: {
    color: colors.warning,
  },
  errorValue: {
    color: colors.error,
  },
  subtitle: {
    ...typography.small,
    color: colors.textTertiary,
  },
});
