-- User Profiles Table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  business JSONB NOT NULL,
  overdue_amount DECIMAL DEFAULT 0,
  credit_limit DECIMAL,
  credit_used DECIMAL,
  available_credit DECIMAL,
  on_time_payment_rate DECIMAL,
  credit_score INTEGER,
  total_transactions INTEGER,
  transaction_history_months INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products Table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL NOT NULL,
  unit TEXT,
  min_order_qty INTEGER,
  stock_qty INTEGER,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Purchase Orders Table
CREATE TABLE public.purchase_orders (
  id TEXT PRIMARY KEY,
  po_number TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL NOT NULL,
  status TEXT NOT NULL,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices Table
CREATE TABLE public.invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  po_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  amount_paid DECIMAL DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  interest_accrued DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments Table
CREATE TABLE public.payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  from_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  method TEXT NOT NULL,
  reference TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
