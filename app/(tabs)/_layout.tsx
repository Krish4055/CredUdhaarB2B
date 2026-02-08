import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { colors } from '../../constants/theme';
import { useApp } from '../../hooks/useApp';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { userProfile } = useApp();
  const role = userProfile?.role;

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 60,
      android: insets.bottom + 60,
      default: 70,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 8,
      android: insets.bottom + 8,
      default: 8,
    }),
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />

      {role === 'BUYER' && (
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Marketplace',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="shopping-bag" size={size} color={color} />
            ),
          }}
        />
      )}

      {role === 'SUPPLIER' && (
        <Tabs.Screen
          name="products"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="inventory" size={size} color={color} />
            ),
          }}
        />
      )}

      {role && (
        <Tabs.Screen
          name="purchase-orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="receipt-long" size={size} color={color} />
            ),
          }}
        />
      )}

      {role && (
        <Tabs.Screen
          name="invoices"
          options={{
            title: 'Invoices',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="request-quote" size={size} color={color} />
            ),
          }}
        />
      )}

      {role && (
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="account-circle" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}
