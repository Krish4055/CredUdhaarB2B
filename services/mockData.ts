// Mock Data Generator
import { Business, Product, PurchaseOrder, Invoice } from '../types';

export const generateMockSuppliers = (): Business[] => [
  {
    id: 'SUP001',
    legalName: 'Raj Textiles Pvt Ltd',
    businessType: 'MANUFACTURER',
    gstNumber: '27AABCT1234C1Z5',
    panNumber: 'AABCT1234C',
    yearEstablished: 2015,
    annualTurnover: '5-20Cr',
    contactName: 'Rajesh Kumar',
    contactPhone: '9876543210',
    contactEmail: 'raj@rajtextiles.com',
    address: {
      street: '123 Textile Market',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    bankAccount: {
      accountNumber: '****5678',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Raj Textiles Pvt Ltd',
      bankName: 'HDFC Bank',
    },
    isVerified: true,
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    reviewCount: 245,
    createdAt: new Date('2023-01-15').toISOString(),
  },
  {
    id: 'SUP002',
    legalName: 'Global Electronics Hub',
    businessType: 'DISTRIBUTOR',
    gstNumber: '09AADCE2456F1Z1',
    panNumber: 'AADCE2456F',
    yearEstablished: 2018,
    annualTurnover: '1-5Cr',
    contactName: 'Priya Sharma',
    contactPhone: '9123456789',
    contactEmail: 'priya@globalelec.com',
    address: {
      street: '45 Electronics Plaza',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
    bankAccount: {
      accountNumber: '****1234',
      ifscCode: 'ICIC0001111',
      accountHolderName: 'Global Electronics Hub',
      bankName: 'ICICI Bank',
    },
    isVerified: true,
    verificationStatus: 'VERIFIED',
    rating: 4.5,
    reviewCount: 132,
    createdAt: new Date('2023-03-20').toISOString(),
  },
];

export const generateMockProducts = (): Product[] => [
  {
    id: 'PROD001',
    supplierId: 'SUP001',
    name: 'Premium Cotton Fabric',
    description: 'High-quality 100% cotton fabric, ideal for garment manufacturing. Soft texture, durable.',
    category: 'Textiles',
    sku: 'RAJ-COT-001',
    unitType: 'Meter',
    moq: 500,
    wholesalePrice: 120,
    bulkTier1: { minQuantity: 2500, price: 110 },
    bulkTier2: { minQuantity: 5000, price: 100 },
    currentStock: 15000,
    reorderLevel: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400',
    isActive: true,
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'PROD002',
    supplierId: 'SUP001',
    name: 'Silk Blend Fabric',
    description: '60% silk, 40% polyester blend. Premium quality for high-end apparel.',
    category: 'Textiles',
    sku: 'RAJ-SLK-002',
    unitType: 'Meter',
    moq: 300,
    wholesalePrice: 350,
    bulkTier1: { minQuantity: 1500, price: 330 },
    bulkTier2: { minQuantity: 3000, price: 310 },
    currentStock: 5000,
    reorderLevel: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1507497322274-c5c8c99881e4?w=400',
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'PROD003',
    supplierId: 'SUP002',
    name: 'LED Light Bulbs - 9W',
    description: 'Energy-efficient LED bulbs, 9W, 900 lumens, warm white, B22 base.',
    category: 'Electronics',
    sku: 'GEH-LED-9W',
    unitType: 'Pieces',
    moq: 1000,
    wholesalePrice: 45,
    bulkTier1: { minQuantity: 5000, price: 42 },
    bulkTier2: { minQuantity: 10000, price: 40 },
    currentStock: 25000,
    reorderLevel: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400',
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'PROD004',
    supplierId: 'SUP002',
    name: 'Power Extension Cord - 5 Meters',
    description: '3-socket power extension cord with surge protection, 5m cable length.',
    category: 'Electronics',
    sku: 'GEH-EXT-5M',
    unitType: 'Pieces',
    moq: 500,
    wholesalePrice: 180,
    bulkTier1: { minQuantity: 2500, price: 170 },
    currentStock: 8000,
    reorderLevel: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1558089687-61b21c0a9b30?w=400',
    isActive: true,
    createdAt: new Date('2024-02-05').toISOString(),
  },
];

export const calculatePrice = (product: Product, quantity: number): number => {
  if (product.bulkTier2 && quantity >= product.bulkTier2.minQuantity) {
    return product.bulkTier2.price;
  }
  if (product.bulkTier1 && quantity >= product.bulkTier1.minQuantity) {
    return product.bulkTier1.price;
  }
  return product.wholesalePrice;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const generatePONumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PO-${dateStr}-${random}`;
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${dateStr}-${random}`;
};

export const calculateDueDate = (paymentTerms: number): string => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + paymentTerms);
  return dueDate.toISOString();
};

export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateCreditScore = (params: {
  onTimePaymentRate: number;
  annualTurnover: Business['annualTurnover'];
  transactionHistoryMonths: number;
  businessAgeYears: number;
}): number => {
  const onTimeScore = Math.min(100, Math.max(0, params.onTimePaymentRate));

  const turnoverPoints: Record<Business['annualTurnover'], number> = {
    '<25L': 20,
    '25L-1Cr': 40,
    '1-5Cr': 60,
    '5-20Cr': 80,
    '>20Cr': 100,
  };

  const historyPoints = params.transactionHistoryMonths >= 12 ? 100
    : params.transactionHistoryMonths >= 6 ? 50
    : params.transactionHistoryMonths >= 3 ? 25
    : 0;

  const businessAgePoints = params.businessAgeYears >= 10 ? 100
    : params.businessAgeYears >= 5 ? 50
    : params.businessAgeYears >= 1 ? 20
    : 0;

  const score =
    (onTimeScore * 0.4) +
    (turnoverPoints[params.annualTurnover] * 0.3) +
    (historyPoints * 0.2) +
    (businessAgePoints * 0.1);

  return Math.round(score);
};

export const calculateDefaultCreditLine = (annualTurnover: Business['annualTurnover'], creditScore: number): number => {
  const turnoverToAmount: Record<Business['annualTurnover'], number> = {
    '<25L': 2500000,
    '25L-1Cr': 10000000,
    '1-5Cr': 50000000,
    '5-20Cr': 200000000,
    '>20Cr': 300000000,
  };

  const turnoverAmount = turnoverToAmount[annualTurnover];
  const creditLine = (turnoverAmount / 3) * (creditScore / 100);
  return Math.round(creditLine);
};
