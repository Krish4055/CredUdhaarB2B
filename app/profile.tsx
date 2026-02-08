import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { Input, Button, Badge } from '../components/ui';
import { useApp } from '../hooks/useApp';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { userProfile, setUserProfile, logout } = useApp();

  if (!userProfile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Please login to view your profile.</Text>
        <Button title="Go to Login" onPress={() => router.replace('/login')} fullWidth />
      </View>
    );
  }

  const [formData, setFormData] = useState({
    legalName: userProfile.business.legalName,
    contactName: userProfile.business.contactName,
    contactEmail: userProfile.business.contactEmail,
    contactPhone: userProfile.business.contactPhone,
    city: userProfile.business.address.city,
    state: userProfile.business.address.state,
    street: userProfile.business.address.street,
    pincode: userProfile.business.address.pincode,
    accountNumber: userProfile.business.bankAccount.accountNumber,
    ifscCode: userProfile.business.bankAccount.ifscCode,
    accountHolderName: userProfile.business.bankAccount.accountHolderName,
  });

  const handleSave = async () => {
    const updated = {
      ...userProfile,
      business: {
        ...userProfile.business,
        legalName: formData.legalName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: {
          ...userProfile.business.address,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        bankAccount: {
          ...userProfile.business.bankAccount,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
        },
      },
    };

    await setUserProfile(updated);
    showAlert('Profile Updated', 'Your profile changes are saved.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.badges}>
          <Badge label={userProfile.role} variant="info" />
          <Badge
            label={userProfile.business.verificationStatus}
            variant={userProfile.business.verificationStatus === 'VERIFIED' ? 'success' : userProfile.business.verificationStatus === 'REJECTED' ? 'error' : 'warning'}
          />
        </View>

        <Text style={styles.sectionTitle}>Business Details</Text>
        <Input label="Business Legal Name" value={formData.legalName} onChangeText={(text) => setFormData({ ...formData, legalName: text })} required />
        <Input label="Contact Name" value={formData.contactName} onChangeText={(text) => setFormData({ ...formData, contactName: text })} required />
        <Input label="Contact Email" value={formData.contactEmail} onChangeText={(text) => setFormData({ ...formData, contactEmail: text })} required />
        <Input label="Contact Phone" value={formData.contactPhone} onChangeText={(text) => setFormData({ ...formData, contactPhone: text })} required />

        <Text style={styles.sectionTitle}>Address</Text>
        <Input label="Street Address" value={formData.street} onChangeText={(text) => setFormData({ ...formData, street: text })} />
        <Input label="City" value={formData.city} onChangeText={(text) => setFormData({ ...formData, city: text })} />
        <Input label="State" value={formData.state} onChangeText={(text) => setFormData({ ...formData, state: text })} />
        <Input label="Pincode" value={formData.pincode} onChangeText={(text) => setFormData({ ...formData, pincode: text })} />

        <Text style={styles.sectionTitle}>Bank Details</Text>
        <Input label="Account Number" value={formData.accountNumber} onChangeText={(text) => setFormData({ ...formData, accountNumber: text })} />
        <Input label="IFSC Code" value={formData.ifscCode} onChangeText={(text) => setFormData({ ...formData, ifscCode: text })} />
        {userProfile.business.bankAccount.bankName && (
          <Badge label={`Bank: ${userProfile.business.bankAccount.bankName}`} variant="info" />
        )}
        <Input label="Account Holder Name" value={formData.accountHolderName} onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })} />

        <Button title="Save Profile" onPress={handleSave} fullWidth />
        <Button title="Logout" onPress={logout} variant="outline" fullWidth />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h2, color: colors.text },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.lg,
    textAlign: 'center',
  },
});
