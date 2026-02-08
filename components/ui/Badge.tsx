import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'verified' | 'pending';
  small?: boolean;
}

export function Badge({ label, variant = 'info', small = false }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], small && styles.small]}>
      <Text style={[styles.text, small && styles.textSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  success: {
    backgroundColor: colors.successLight,
  },
  warning: {
    backgroundColor: colors.warningLight,
  },
  error: {
    backgroundColor: colors.errorLight,
  },
  info: {
    backgroundColor: '#E8F0FE',
  },
  verified: {
    backgroundColor: colors.successLight,
  },
  pending: {
    backgroundColor: colors.warningLight,
  },
  text: {
    ...typography.smallMedium,
    color: colors.text,
  },
  textSmall: {
    fontSize: 10,
  },
});
