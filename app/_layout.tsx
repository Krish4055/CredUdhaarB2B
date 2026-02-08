import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { AppProvider } from '../contexts/AppContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="register" />
            <Stack.Screen name="products" />
            <Stack.Screen name="marketplace" />
            <Stack.Screen name="product-detail" />
            <Stack.Screen name="purchase-orders" />
            <Stack.Screen name="invoices" />
            <Stack.Screen name="profile" />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
