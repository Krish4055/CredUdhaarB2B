import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui';
import { colors, typography, spacing } from '../../../constants/theme';

export default function BuyerCreatePO() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Create Purchase Order</Text>
      <Text style={styles.subtitle}>Start by selecting products from the marketplace.</Text>
      <Button title="Browse Marketplace" onPress={() => router.push('/buyer/marketplace')} fullWidth />
      <Button title="Back" onPress={() => router.back()} variant="outline" fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
});
