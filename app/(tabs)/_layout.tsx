import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { colors } from '../../constants/theme';
import { useApp } from '../../hooks/useApp';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { userProfile, isLoggedIn } = useApp();
  const role = userProfile?.role;
  const showTabs = isLoggedIn && !!role;

  const tabBarStyle = showTabs
    ? {
        height: Platform.select({
          ios: insets.bottom + 56,
          android: insets.bottom + 56,
          default: 60,
        }),
        paddingTop: 6,
        paddingBottom: Platform.select({
          ios: insets.bottom + 6,
          android: insets.bottom + 6,
          default: 6,
        }),
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      }
    : { display: 'none' as const };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      {/* Always rendered but conditionally shown — Expo Router needs all tabs declared */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Market',
          href: role === 'BUYER' ? '/(tabs)/marketplace' : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="storefront" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          href: role === 'SUPPLIER' ? '/(tabs)/products' : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory-2" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="purchase-orders"
        options={{
          title: 'Orders',
          href: showTabs ? '/(tabs)/purchase-orders' : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          href: showTabs ? '/(tabs)/invoices' : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="description" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: showTabs ? '/(tabs)/profile' : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
