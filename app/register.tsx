// Business Registration
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { Input, Button, Badge } from '../components/ui';
import { useApp } from '../hooks/useApp';
import { Business, UserRole, BusinessType, AnnualTurnover, UserProfile } from '../types';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import {
  isValidAccountNumber,
  isValidEmail,
  isValidGST,
  isValidIFSC,
  isValidPAN,
  isValidPhone,
  getBankNameFromIFSC,
  maskAccountNumber,
} from '../services/validation';
import { calculateCreditScore, calculateDefaultCreditLine } from '../services/mockData';

const businessTypes: BusinessType[] = ['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER_BULK'];
const turnoverOptions: AnnualTurnover[] = ['<25L', '25L-1Cr', '1-5Cr', '5-20Cr', '>20Cr'];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { setUserProfile } = useApp();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    legalName: '',
    businessType: 'WHOLESALER' as BusinessType,
    gstNumber: '',
    panNumber: '',
    yearEstablished: '',
    annualTurnover: '1-5Cr' as AnnualTurnover,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    otp: '',
    emailVerified: false,
  });

  const bankName = formData.ifscCode ? getBankNameFromIFSC(formData.ifscCode) : '';

  const validateStep1 = () => {
    if (formData.legalName.length < 5 || formData.legalName.length > 100) {
      showAlert('Validation Error', 'Business name must be 5-100 characters.');
      return false;
    }
    if (formData.gstNumber && !isValidGST(formData.gstNumber)) {
      showAlert('Validation Error', 'GST number format is invalid.');
      return false;
    }
    if (formData.panNumber && !isValidPAN(formData.panNumber)) {
      showAlert('Validation Error', 'PAN number format is invalid.');
      return false;
    }
    const year = parseInt(formData.yearEstablished);
    if (Number.isNaN(year) || year < 1980 || year > 2025) {
      showAlert('Validation Error', 'Year established must be between 1980 and 2025.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.contactName.length < 3 || formData.contactName.length > 50) {
      showAlert('Validation Error', 'Contact name must be 3-50 characters.');
      return false;
    }
    if (!isValidPhone(formData.contactPhone)) {
      showAlert('Validation Error', 'Phone must be 10 digits and start with 6-9.');
      return false;
    }
    if (!isValidEmail(formData.contactEmail)) {
      showAlert('Validation Error', 'Email format is invalid.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      showAlert('Validation Error', 'Complete business address is required.');
      return false;
    }
    if (!isValidAccountNumber(formData.accountNumber)) {
      showAlert('Validation Error', 'Account number must be 9-18 digits.');
      return false;
    }
    if (!isValidIFSC(formData.ifscCode)) {
      showAlert('Validation Error', 'IFSC code format is invalid.');
      return false;
    }
    if (formData.accountHolderName.trim() !== formData.legalName.trim()) {
      showAlert('Validation Error', 'Account holder name must match business name.');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!otpSent) {
      showAlert('OTP Required', 'Please request OTP before verification.');
      return false;
    }
    if (formData.otp !== '123456') {
      showAlert('OTP Invalid', 'Please enter the correct OTP (mock: 123456).');
      return false;
    }
    if (!formData.emailVerified) {
      showAlert('Email Verification', 'Please confirm email verification.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) setStep(4);
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    setLoading(true);

    const year = parseInt(formData.yearEstablished);
    const businessAge = new Date().getFullYear() - year;
    const creditScore = calculateCreditScore({
      onTimePaymentRate: 100,
      annualTurnover: formData.annualTurnover,
      transactionHistoryMonths: 0,
      businessAgeYears: businessAge,
    });

    const defaultCredit = calculateDefaultCreditLine(formData.annualTurnover, creditScore);

    const business: Business = {
      id: `BUS${Date.now()}`,
      legalName: formData.legalName,
      businessType: formData.businessType,
      gstNumber: formData.gstNumber ? formData.gstNumber.toUpperCase() : '',
      panNumber: formData.panNumber ? formData.panNumber.toUpperCase() : '',
      yearEstablished: year,
      annualTurnover: formData.annualTurnover,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      bankAccount: {
        accountNumber: maskAccountNumber(formData.accountNumber),
        ifscCode: formData.ifscCode.toUpperCase(),
        accountHolderName: formData.accountHolderName,
        bankName: bankName || undefined,
      },
      isVerified: true,
      verificationStatus: 'VERIFIED',
      rating: 4.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    const profile: UserProfile = {
      role: role || 'BUYER',
      business,
      overdueAmount: 0,
      ...(role === 'BUYER' && {
        creditLimit: defaultCredit,
        creditUsed: 0,
        availableCredit: defaultCredit,
        onTimePaymentRate: 100,
        creditScore,
        totalTransactions: 0,
        transactionHistoryMonths: 0,
      }),
    };

    await setUserProfile(profile);
    setLoading(false);

    showAlert(
      'Business registered successfully!',
      'GST verified ✓',
      [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const handleSendOtp = () => {
    if (!validateStep2()) return;
    setOtpSent(true);
    showAlert('OTP Sent', 'OTP sent to your phone (mock: 123456).');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Register as {role === 'SUPPLIER' ? 'Supplier' : 'Buyer'}</Text>
        <Text style={styles.subtitle}>Complete all steps to verify your business</Text>

        <View style={styles.steps}>
          {[1, 2, 3, 4].map((num) => (
            <View key={num} style={[styles.stepDot, step >= num && styles.stepDotActive]}>
              <Text style={styles.stepText}>{num}</Text>
            </View>
          ))}
        </View>

        {step === 1 && (
          <>
            <Input
              label="Business Legal Name"
              value={formData.legalName}
              onChangeText={(text) => setFormData({ ...formData, legalName: text })}
              placeholder="e.g., Raj Textiles Pvt Ltd"
              required
              maxLength={100}
            />

            <Text style={styles.sectionTitle}>Business Type</Text>
            <View style={styles.chips}>
              {businessTypes.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.chip, formData.businessType === type && styles.chipActive]}
                  onPress={() => setFormData({ ...formData, businessType: type })}
                >
                  <Text style={[styles.chipText, formData.businessType === type && styles.chipTextActive]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="GST Number"
              value={formData.gstNumber}
              onChangeText={(text) => setFormData({ ...formData, gstNumber: text.toUpperCase() })}
              placeholder="15-character GSTIN (Optional)"
              maxLength={15}
            />

            <Input
              label="PAN Number"
              value={formData.panNumber}
              onChangeText={(text) => setFormData({ ...formData, panNumber: text.toUpperCase() })}
              placeholder="10-character PAN (Optional)"
              maxLength={10}
            />

            <Input
              label="Year Established"
              value={formData.yearEstablished}
              onChangeText={(text) => setFormData({ ...formData, yearEstablished: text })}
              placeholder="1980-2025"
              keyboardType="numeric"
              required
              maxLength={4}
            />

            <Text style={styles.sectionTitle}>Annual Turnover</Text>
            <View style={styles.chips}>
              {turnoverOptions.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.chip, formData.annualTurnover === option && styles.chipActive]}
                  onPress={() => setFormData({ ...formData, annualTurnover: option })}
                >
                  <Text style={[styles.chipText, formData.annualTurnover === option && styles.chipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Button title="Next" onPress={handleNext} fullWidth />
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="Contact Name"
              value={formData.contactName}
              onChangeText={(text) => setFormData({ ...formData, contactName: text })}
              placeholder="e.g., Rajesh Kumar"
              required
            />

            <Input
              label="Contact Phone"
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              placeholder="10-digit mobile"
              keyboardType="phone-pad"
              required
              maxLength={10}
            />

            <Input
              label="Contact Email"
              value={formData.contactEmail}
              onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
              placeholder="email@example.com"
              keyboardType="email-address"
              required
            />

            <Button title="Next" onPress={handleNext} fullWidth />
            <Button title="Back" onPress={() => setStep(1)} variant="outline" fullWidth />
          </>
        )}

        {step === 3 && (
          <>
            <Input
              label="Business Address (Street)"
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
              placeholder="Street address"
              required
            />
            <Input
              label="City"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="City"
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              placeholder="State"
              required
            />
            <Input
              label="Pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              placeholder="Pincode"
              keyboardType="numeric"
              required
              maxLength={6}
            />

            <Text style={styles.sectionTitle}>Bank Details</Text>
            <Input
              label="Account Number"
              value={formData.accountNumber}
              onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
              placeholder="9-18 digits"
              keyboardType="numeric"
              required
              maxLength={18}
            />
            <Input
              label="IFSC Code"
              value={formData.ifscCode}
              onChangeText={(text) => setFormData({ ...formData, ifscCode: text.toUpperCase() })}
              placeholder="e.g., HDFC0001234"
              required
              maxLength={11}
            />
            {formData.ifscCode.length === 11 && (
              <Badge label={`Bank: ${bankName}`} variant="info" />
            )}
            <Input
              label="Account Holder Name"
              value={formData.accountHolderName}
              onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
              placeholder="Must match business name"
              required
            />

            <Button title="Next" onPress={handleNext} fullWidth />
            <Button title="Back" onPress={() => setStep(2)} variant="outline" fullWidth />
          </>
        )}

        {step === 4 && (
          <>
            <View style={styles.verifyRow}>
              <MaterialIcons name="verified" size={18} color={colors.success} />
              <Text style={styles.verifyText}>GST/PAN auto-verified ✓</Text>
            </View>

            <Input
              label="OTP (Phone)"
              value={formData.otp}
              onChangeText={(text) => setFormData({ ...formData, otp: text })}
              placeholder="Enter OTP"
              keyboardType="numeric"
              maxLength={6}
              required
            />

            <Button title={otpSent ? 'OTP Sent' : 'Send OTP'} onPress={handleSendOtp} fullWidth />

            <Pressable
              style={[styles.checkbox, formData.emailVerified && styles.checkboxChecked]}
              onPress={() => setFormData({ ...formData, emailVerified: !formData.emailVerified })}
            >
              <MaterialIcons
                name={formData.emailVerified ? 'check-box' : 'check-box-outline-blank'}
                size={20}
                color={formData.emailVerified ? colors.success : colors.textSecondary}
              />
              <Text style={styles.checkboxText}>Email verification link clicked</Text>
            </Pressable>

            <Button title="Complete Registration" onPress={handleSubmit} fullWidth loading={loading} />
            <Button title="Back" onPress={() => setStep(3)} variant="outline" fullWidth />
          </>
        )}
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
    marginBottom: spacing.lg,
  },
  steps: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepText: {
    ...typography.captionMedium,
    color: colors.textInverse,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  verifyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  checkboxChecked: {
    opacity: 1,
  },
  checkboxText: {
    ...typography.body,
    color: colors.text,
  },
});
