import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';
import { Input, Button } from '../components/ui';
import { colors, typography, spacing } from '../constants/theme';
import { isValidEmail, isValidPhone } from '../services/validation';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (!identifier) {
      showAlert('Validation Error', 'Please enter email or phone');
      return;
    }
    const isEmail = identifier.includes('@');
    if (isEmail && !isValidEmail(identifier)) {
      showAlert('Validation Error', 'Enter a valid email');
      return;
    }
    if (!isEmail && !isValidPhone(identifier)) {
      showAlert('Validation Error', 'Enter a valid 10-digit phone');
      return;
    }
    setOtpSent(true);
    showAlert('OTP Sent', 'OTP sent (mock: 123456)');
  };

  const handleReset = () => {
    if (!identifier || !otp || !newPassword || !confirmPassword) {
      showAlert('Validation Error', 'Please fill in all fields');
      return;
    }
    if (!otpSent) {
      showAlert('OTP Required', 'Please request OTP first');
      return;
    }
    if (otp !== '123456') {
      showAlert('OTP Invalid', 'Enter the correct OTP (mock: 123456)');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match');
      return;
    }

    showAlert('Password Updated', 'You can now login with your new password', [
      { text: 'Go to Login', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Verify via OTP to reset your password</Text>

        <Input
          label="Email or Phone"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="email@company.com or 9876543210"
          required
        />

        <Input
          label="OTP"
          value={otp}
          onChangeText={setOtp}
          placeholder="6-digit OTP"
          keyboardType="numeric"
          maxLength={6}
          required
        />

        <Button title={otpSent ? 'OTP Sent' : 'Send OTP'} onPress={handleSendOtp} variant="outline" fullWidth />

        <Input
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Minimum 8 characters"
          secureTextEntry
          required
        />

        <Input
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
          required
        />

        <Button title="Reset Password" onPress={handleReset} fullWidth />
        <Button title="Back to Login" onPress={() => router.replace('/login')} variant="outline" fullWidth />
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
