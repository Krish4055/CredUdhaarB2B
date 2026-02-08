// Local Storage Service - Mock Backend
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@credUdhaar_user_profile',
  PRODUCTS: '@credUdhaar_products',
  PURCHASE_ORDERS: '@credUdhaar_pos',
  INVOICES: '@credUdhaar_invoices',
  PAYMENTS: '@credUdhaar_payments',
  ALL_BUSINESSES: '@credUdhaar_businesses',
};

export const storage = {
  // User Profile
  async saveUserProfile(profile: any) {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },
  
  async getUserProfile() {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  },
  
  async clearUserProfile() {
    await AsyncStorage.removeItem(KEYS.USER_PROFILE);
  },
  
  // Products
  async saveProducts(products: any[]) {
    await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  async getProducts() {
    const data = await AsyncStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  
  // Purchase Orders
  async savePurchaseOrders(pos: any[]) {
    await AsyncStorage.setItem(KEYS.PURCHASE_ORDERS, JSON.stringify(pos));
  },
  
  async getPurchaseOrders() {
    const data = await AsyncStorage.getItem(KEYS.PURCHASE_ORDERS);
    return data ? JSON.parse(data) : [];
  },
  
  // Invoices
  async saveInvoices(invoices: any[]) {
    await AsyncStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },
  
  async getInvoices() {
    const data = await AsyncStorage.getItem(KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },
  
  // Payments
  async savePayments(payments: any[]) {
    await AsyncStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  },
  
  async getPayments() {
    const data = await AsyncStorage.getItem(KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  },
  
  // All Businesses (for marketplace)
  async saveBusinesses(businesses: any[]) {
    await AsyncStorage.setItem(KEYS.ALL_BUSINESSES, JSON.stringify(businesses));
  },
  
  async getBusinesses() {
    const data = await AsyncStorage.getItem(KEYS.ALL_BUSINESSES);
    return data ? JSON.parse(data) : [];
  },
};
