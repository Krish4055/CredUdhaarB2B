// Global App State
import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { UserProfile, Product, PurchaseOrder, Invoice, Payment, Business } from '../types';
import { storage } from '../services/storage';
import { supabase, subscribeToTable } from '../services/supabase';
import { generateMockSuppliers, generateMockProducts, calculateCreditScore, calculateDefaultCreditLine } from '../services/mockData';

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

  // Use refs to keep track of state for realtime callbacks
  const productsRef = useRef(products);
  const posRef = useRef(purchaseOrders);
  const invsRef = useRef(invoices);

  useEffect(() => {
    productsRef.current = products;
    posRef.current = purchaseOrders;
    invsRef.current = invoices;
  }, [products, purchaseOrders, invoices]);

  // Load data on mount
  useEffect(() => {
    loadData();

    // Set up Realtime Subscriptions
    const prodSub = subscribeToTable('products', (payload) => {
      if (payload.eventType === 'INSERT') {
        setProducts((prev) => [payload.new as Product, ...prev.filter(p => p.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE') {
        setProducts((prev) => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
      }
    });

    const poSub = subscribeToTable('purchase_orders', (payload) => {
      if (payload.eventType === 'INSERT') {
        setPurchaseOrders((prev) => [payload.new as PurchaseOrder, ...prev.filter(po => po.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE') {
        setPurchaseOrders((prev) => prev.map(po => po.id === payload.new.id ? payload.new as PurchaseOrder : po));
      }
    });

    const invSub = subscribeToTable('invoices', (payload) => {
      if (payload.eventType === 'INSERT') {
        setInvoices((prev) => [payload.new as Invoice, ...prev.filter(inv => inv.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE') {
        setInvoices((prev) => prev.map(inv => inv.id === payload.new.id ? payload.new as Invoice : inv));
      }
    });

    return () => {
      prodSub.unsubscribe();
      poSub.unsubscribe();
      invSub.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      const profile = await storage.getUserProfile();
      setUserProfileState(profile);
      
      // Try fetching from Supabase if keys exist
      const hasSupabase = !!supabase;

      let allProducts = await storage.getProducts();
      let allBusinesses = await storage.getBusinesses();
      
      if (hasSupabase && supabase) {
        const { data: dbProds } = await supabase.from('products').select('*');
        if (dbProds && dbProds.length > 0) allProducts = dbProds as Product[];

        const { data: dbBiz } = await supabase.from('user_profiles').select('business');
        if (dbBiz) allBusinesses = dbBiz.map(b => b.business);
      }

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
      
      let pos = await storage.getPurchaseOrders();
      if (supabase) {
        const { data: dbPos } = await supabase.from('purchase_orders').select('*');
        if (dbPos) pos = dbPos as PurchaseOrder[];
      }
      setPurchaseOrders(pos);
      
      let invs = await storage.getInvoices();
      if (supabase) {
        const { data: dbInvs } = await supabase.from('invoices').select('*');
        if (dbInvs) invs = dbInvs as Invoice[];
      }
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
      if (supabase) {
        await supabase.from('user_profiles').upsert({
          id: profile.business.id,
          role: profile.role,
          business: profile.business,
          credit_limit: profile.creditLimit,
          credit_used: profile.creditUsed,
          available_credit: profile.availableCredit,
          on_time_payment_rate: profile.onTimePaymentRate,
          credit_score: profile.creditScore,
          total_transactions: profile.totalTransactions,
          transaction_history_months: profile.transactionHistoryMonths,
        });
      }
    } else {
      await storage.clearUserProfile();
    }
  };

  const addProduct = async (product: Product) => {
    const updated = [product, ...products.filter(p => p.id !== product.id)];
    setProducts(updated);
    await storage.saveProducts(updated);
    if (supabase) {
      await supabase.from('products').upsert(product);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    await storage.saveProducts(updated);
    if (supabase) {
      await supabase.from('products').update(updates).eq('id', id);
    }
  };

  const addPurchaseOrder = async (po: PurchaseOrder) => {
    const updated = [po, ...purchaseOrders.filter(p => p.id !== po.id)];
    setPurchaseOrders(updated);
    await storage.savePurchaseOrders(updated);
    if (supabase) {
      await supabase.from('purchase_orders').upsert(po);
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    const updated = purchaseOrders.map((po) => (po.id === id ? { ...po, ...updates } : po));
    setPurchaseOrders(updated);
    await storage.savePurchaseOrders(updated);
    if (supabase) {
      await supabase.from('purchase_orders').update(updates).eq('id', id);
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    const updated = [invoice, ...invoices.filter(i => i.id !== invoice.id)];
    setInvoices(updated);
    await storage.saveInvoices(updated);
    if (supabase) {
      await supabase.from('invoices').upsert(invoice);
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    setInvoices(updated);
    await storage.saveInvoices(updated);
    if (supabase) {
      await supabase.from('invoices').update(updates).eq('id', id);
    }
  };

  const addPayment = async (payment: Payment) => {
    const updated = [payment, ...payments.filter(p => p.id !== payment.id)];
    setPayments(updated);
    await storage.savePayments(updated);
    if (supabase) {
      await supabase.from('payments').upsert(payment);
    }

    if (!userProfile || userProfile.role !== 'BUYER') return;

    const invoice = invoices.find((inv) => inv.id === payment.invoiceId);
    if (!invoice || invoice.buyerId !== userProfile.business.id) return;

    const paidDate = new Date(payment.createdAt);
    const dueDate = new Date(invoice.dueDate);
    const onTime = paidDate.getTime() <= dueDate.getTime();

    const buyerInvoices = invoices.filter((inv) => inv.buyerId === userProfile.business.id);
    const paidInvoices = buyerInvoices.filter((inv) => inv.status === 'PAID');
    const onTimeCount = paidInvoices.filter((inv) => {
      const lastPayment = updated.find((p) => p.invoiceId === inv.id);
      if (!lastPayment) return false;
      return new Date(lastPayment.createdAt).getTime() <= new Date(inv.dueDate).getTime();
    }).length;

    const onTimePaymentRate = paidInvoices.length > 0
      ? Math.round((onTimeCount / paidInvoices.length) * 100)
      : 100;

    const firstInvoiceDate = buyerInvoices.length > 0
      ? new Date(buyerInvoices[0].createdAt)
      : new Date();
    const now = new Date();
    const monthsDiff = Math.max(0, (now.getFullYear() - firstInvoiceDate.getFullYear()) * 12 + (now.getMonth() - firstInvoiceDate.getMonth()));

    const businessAgeYears = Math.max(0, new Date().getFullYear() - userProfile.business.yearEstablished);
    const creditScore = calculateCreditScore({
      onTimePaymentRate,
      annualTurnover: userProfile.business.annualTurnover,
      transactionHistoryMonths: monthsDiff,
      businessAgeYears,
    });

    const creditLimit = userProfile.creditLimit ?? calculateDefaultCreditLine(userProfile.business.annualTurnover, creditScore);
    const creditUsed = Math.max(0, (userProfile.creditUsed || 0) - (onTime ? payment.amount : 0));
    const availableCredit = Math.max(0, creditLimit - creditUsed);

    const updatedProfile = {
      ...userProfile,
      creditScore,
      creditLimit,
      creditUsed,
      availableCredit,
      onTimePaymentRate,
      totalTransactions: (userProfile.totalTransactions || 0) + 1,
      transactionHistoryMonths: monthsDiff,
    };

    await setUserProfile(updatedProfile);
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
