// Global App State
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, Product, PurchaseOrder, Invoice, Payment, Business } from '../types';
import { storage } from '../services/storage';
import { generateMockSuppliers, generateMockProducts } from '../services/mockData';

interface AppContextType {
  // User
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isLoggedIn: boolean;
  
  // Products
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  
  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: PurchaseOrder) => Promise<void>;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  
  // Payments
  payments: Payment[];
  addPayment: (payment: Payment) => Promise<void>;
  
  // Businesses (for marketplace)
  businesses: Business[];
  
  // Actions
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await storage.getUserProfile();
      setUserProfileState(profile);
      
      let allProducts = await storage.getProducts();
      let allBusinesses = await storage.getBusinesses();
      
      // Initialize with mock data if empty
      if (allProducts.length === 0) {
        allProducts = generateMockProducts();
        await storage.saveProducts(allProducts);
      }
      
      if (allBusinesses.length === 0) {
        allBusinesses = generateMockSuppliers();
        await storage.saveBusinesses(allBusinesses);
      }
      
      setProducts(allProducts);
      setBusinesses(allBusinesses);
      
      const pos = await storage.getPurchaseOrders();
      setPurchaseOrders(pos);
      
      const invs = await storage.getInvoices();
      setInvoices(invs);
      
      const pays = await storage.getPayments();
      setPayments(pays);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserProfile = async (profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      await storage.saveUserProfile(profile);
    } else {
      await storage.clearUserProfile();
    }
  };

  const addProduct = async (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    await storage.saveProducts(updated);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    await storage.saveProducts(updated);
  };

  const addPurchaseOrder = async (po: PurchaseOrder) => {
    const updated = [...purchaseOrders, po];
    setPurchaseOrders(updated);
    await storage.savePurchaseOrders(updated);
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    const updated = purchaseOrders.map((po) => (po.id === id ? { ...po, ...updates } : po));
    setPurchaseOrders(updated);
    await storage.savePurchaseOrders(updated);
  };

  const addInvoice = async (invoice: Invoice) => {
    const updated = [...invoices, invoice];
    setInvoices(updated);
    await storage.saveInvoices(updated);
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    setInvoices(updated);
    await storage.saveInvoices(updated);
  };

  const addPayment = async (payment: Payment) => {
    const updated = [...payments, payment];
    setPayments(updated);
    await storage.savePayments(updated);
  };

  const logout = async () => {
    setUserProfileState(null);
    await storage.clearUserProfile();
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        isLoggedIn: !!userProfile,
        products,
        addProduct,
        updateProduct,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        invoices,
        addInvoice,
        updateInvoice,
        payments,
        addPayment,
        businesses,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
