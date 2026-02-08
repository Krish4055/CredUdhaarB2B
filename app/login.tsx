import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { Input, Button, Badge } from '../components/ui';
import { useApp } from '../hooks/useApp';
import { UserProfile } from '../types';
import { colors, typography, spacing } from '../constants/theme';
import { isValidEmail, isValidPhone } from '../services/validation';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { businesses, setUserProfile } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleDemoLogin = async (role: 'SUPPLIER' | 'BUYER') => {
    const business = businesses[0];
    if (!business) {
      showAlert('No businesses available', 'Please register first.');
      return;
    }

    const profile: UserProfile = {
      role,
      business,
      overdueAmount: 0,
      ...(role === 'BUYER' && {
        creditLimit: 500000,
        creditUsed: 0,
        availableCredit: 500000,
        onTimePaymentRate: 95,
        creditScore: 82,
      }),
    };

    await setUserProfile(profile);
    router.replace('/(tabs)');
  };

  const handleSendOtp = () => {
    if (!identifier || !password) {
      showAlert('Validation Error', 'Enter email/phone and password first.');
      return;
    }
    const isEmail = identifier.includes('@');
    if (isEmail && !isValidEmail(identifier)) {
      showAlert('Validation Error', 'Enter a valid email.');
      return;
    }
    if (!isEmail && !isValidPhone(identifier)) {
      showAlert('Validation Error', 'Enter a valid 10-digit phone.');
      return;
    }
    setOtpSent(true);
    showAlert('OTP Sent', 'OTP sent to your phone (mock: 123456).');
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      showAlert('Validation Error', 'Enter email/phone and password');
      return;
    }
    if (!otpSent) {
      showAlert('OTP Required', 'Please request OTP before login.');
      return;
    }
    if (otp !== '123456') {
      showAlert('OTP Invalid', 'Please enter the correct OTP (mock: 123456).');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showAlert('Login Mocked', 'Use demo login buttons below for now.');
    }, 600);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Secure access with OTP + password</Text>
        </View>

        <Input
          label="Email or Phone"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="email@company.com or 9876543210"
          required
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 8 characters"
          secureTextEntry
          required
        />

        <Input
          label="OTP"
          value={otp}
          onChangeText={setOtp}
          placeholder="6-digit OTP"
          keyboardType="numeric"
          required
          maxLength={6}
        />

        <Button title={otpSent ? 'OTP Sent' : 'Send OTP'} onPress={handleSendOtp} variant="outline" fullWidth />

        <Button title="Login" onPress={handleLogin} fullWidth loading={loading} />

        <Pressable onPress={() => router.push('/forgot-password')}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Quick Demo Login</Text>
        <View style={styles.badges}>
          <Badge label="Mock Data" variant="info" />
          <Badge label="OTP Required" variant="warning" />
        </View>

        <Button
          title="Login as Supplier (Demo)"
          onPress={() => handleDemoLogin('SUPPLIER')}
          fullWidth
        />
        <Button
          title="Login as Buyer (Demo)"
          onPress={() => handleDemoLogin('BUYER')}
          variant="outline"
          fullWidth
        />

        <Pressable onPress={() => router.push('/register?role=BUYER')}>
          <Text style={styles.link}>New here? Register your business</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/terms')}>
          <Text style={styles.footnote}>By continuing, you agree to our Terms</Text>
        </Pressable>
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
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  footnote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
