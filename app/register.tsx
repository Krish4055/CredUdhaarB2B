// Business Registration
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';
import { Input, Button } from '../components/ui';
import { useApp } from '../hooks/useApp';
import { Business, UserRole, BusinessType, AnnualTurnover, UserProfile } from '../types';
import { colors, typography, spacing } from '../constants/theme';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { setUserProfile } = useApp();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    legalName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.legalName || !formData.contactName || !formData.contactEmail || !formData.contactPhone) {
      showAlert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    // Simulate registration
    const business: Business = {
      id: `BUS${Date.now()}`,
      legalName: formData.legalName,
      businessType: 'WHOLESALER',
      gstNumber: '27XXXXXX1234C1Z5',
      panNumber: 'XXXXX1234C',
      yearEstablished: 2020,
      annualTurnover: '1-5Cr',
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      address: {
        street: '',
        city: formData.city,
        state: formData.state,
        pincode: '',
      },
      bankAccount: {
        accountNumber: '****0000',
        ifscCode: 'XXXX0000000',
        accountHolderName: formData.legalName,
      },
      isVerified: true,
      rating: 4.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    const profile: UserProfile = {
      role: role || 'BUYER',
      business,
      overdueAmount: 0,
      ...(role === 'BUYER' && {
        creditLimit: 500000,
        creditUsed: 0,
        availableCredit: 500000,
        onTimePaymentRate: 100,
        creditScore: 75,
      }),
    };

    await setUserProfile(profile);
    setLoading(false);

    showAlert(
      'Registration Successful!',
      `Welcome to CredUdhaar B2B, ${formData.legalName}!`,
      [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Register as {role === 'SUPPLIER' ? 'Supplier' : 'Buyer'}
        </Text>
        <Text style={styles.subtitle}>Complete your business profile (Simplified V1.0)</Text>

        <Input
          label="Business Legal Name"
          value={formData.legalName}
          onChangeText={(text) => setFormData({ ...formData, legalName: text })}
          placeholder="e.g., Raj Textiles Pvt Ltd"
          required
        />

        <Input
          label="Contact Person Name"
          value={formData.contactName}
          onChangeText={(text) => setFormData({ ...formData, contactName: text })}
          placeholder="e.g., Rajesh Kumar"
          required
        />

        <Input
          label="Contact Email"
          value={formData.contactEmail}
          onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
          placeholder="email@example.com"
          keyboardType="email-address"
          required
        />

        <Input
          label="Contact Phone"
          value={formData.contactPhone}
          onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          required
          maxLength={10}
        />

        <Input
          label="City"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
          placeholder="e.g., Mumbai"
        />

        <Input
          label="State"
          value={formData.state}
          onChangeText={(text) => setFormData({ ...formData, state: text })}
          placeholder="e.g., Maharashtra"
        />

        <Button
          title="Complete Registration"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
        />

        <Button
          title="Back"
          onPress={() => router.back()}
          variant="outline"
          fullWidth
        />
      </ScrollView>
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
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
