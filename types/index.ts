// Core Types
export type UserRole = 'SUPPLIER' | 'BUYER';

export type BusinessType = 'MANUFACTURER' | 'DISTRIBUTOR' | 'WHOLESALER' | 'RETAILER_BULK';

export type AnnualTurnover = '<25L' | '25L-1Cr' | '1-5Cr' | '5-20Cr' | '>20Cr';

export interface Business {
  id: string;
  legalName: string;
  businessType: BusinessType;
  gstNumber: string;
  panNumber: string;
  yearEstablished: number;
  annualTurnover: AnnualTurnover;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    bankName?: string;
    accountHolderName: string;
  };
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rating: number; // 1-5
  reviewCount: number;
  createdAt: string;
}

export type ProductCategory = 'Textiles' | 'Electronics' | 'Food' | 'Chemicals' | 'Machinery' | 'Other';

export type UnitType = 'Pieces' | 'Kilogram' | 'Liter' | 'Meter' | 'Bag' | 'Box' | 'Carton';

export interface BulkTier {
  minQuantity: number;
  price: number;
}

export interface Product {
  id: string;
  supplierId: string;
  name: string;
  description: string;
  category: ProductCategory;
  sku: string;
  unitType: UnitType;
  moq: number;
  wholesalePrice: number;
  bulkTier1?: BulkTier;
  bulkTier2?: BulkTier;
  currentStock: number;
  reorderLevel?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export type POStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'REJECTED';

export type PaymentTerms = 15 | 30 | 45 | 60 | 90;

export interface POItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  buyerId: string;
  buyerName: string;
  items: POItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  deliveryAddress: string;
  paymentTerms: PaymentTerms;
  dueDate?: string;
  specialInstructions?: string;
  status: POStatus;
  createdAt: string;
  confirmedAt?: string;
  rejectionReason?: string;
}

export type InvoiceStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'DISPUTED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: InvoiceStatus;
  interestAccrued: number;
  createdAt: string;
}

export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';

export interface Payment {
  id: string;
  invoiceId: string;
  from: string;
  to: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: 'CONFIRMED' | 'PENDING';
  createdAt: string;
}

export interface UserProfile {
  role: UserRole;
  business: Business;
  creditLimit?: number;      // For buyers
  creditUsed?: number;        // For buyers
  availableCredit?: number;   // For buyers
  overdueAmount: number;
  onTimePaymentRate?: number; // For buyers
  creditScore?: number;       // For buyers, 0-100
  totalTransactions?: number;
  transactionHistoryMonths?: number;
}
