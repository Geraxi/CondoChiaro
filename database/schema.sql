-- CondoChiaro Production Database Schema
-- Version: 1.0.0
-- Includes: Primary keys, Foreign keys, Unique constraints, RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

-- System settings table (for maintenance mode, feature flags, etc.)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Insert default maintenance mode setting
INSERT INTO system_settings (key, value, description) 
VALUES ('maintenance_mode', 'false', 'System maintenance mode flag')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

-- Admins table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, past_due, canceled
  subscription_id VARCHAR(255), -- Stripe subscription ID
  stripe_customer_id VARCHAR(255),
  stripe_connect_account_id VARCHAR(255),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_subscription_status ON admins(subscription_status);
CREATE INDEX IF NOT EXISTS idx_admins_stripe_customer ON admins(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_admins_connect_account ON admins(stripe_connect_account_id);

-- ============================================================================
-- CONDOMINIUM MANAGEMENT
-- ============================================================================

-- Condominiums table
CREATE TABLE IF NOT EXISTS condominiums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  units_count INTEGER DEFAULT 0,
  total_tenants INTEGER DEFAULT 0,
  monthly_revenue DECIMAL(10, 2) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_admin_condo_name UNIQUE (admin_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_condominiums_admin_id ON condominiums(admin_id);
CREATE INDEX IF NOT EXISTS idx_condominiums_created_at ON condominiums(created_at DESC);

-- ============================================================================
-- APARTMENTS
-- ============================================================================

-- Apartments table
CREATE TABLE IF NOT EXISTS apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  floor VARCHAR(10),
  unit_number VARCHAR(50) NOT NULL,
  internal_number VARCHAR(50),
  size_mq DECIMAL(8, 2),
  owner_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_condo_unit UNIQUE (condominium_id, unit_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_apartments_condominium_id ON apartments(condominium_id);
CREATE INDEX IF NOT EXISTS idx_apartments_unit_number ON apartments(unit_number);

-- ============================================================================
-- TENANTS
-- ============================================================================

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, exempt
  last_payment_date TIMESTAMPTZ,
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_condo_tenant_email UNIQUE (condominium_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_condominium_id ON tenants(condominium_id);
CREATE INDEX IF NOT EXISTS idx_tenants_apartment_id ON tenants(apartment_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_payment_status ON tenants(payment_status);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON tenants(stripe_customer_id);

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  service_type VARCHAR(100) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free', -- free, pro, business
  plan_status VARCHAR(20) DEFAULT 'inactive', -- inactive, active, past_due, canceled
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_connect_account_id VARCHAR(255),
  plan_renewal_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_condo_supplier UNIQUE (condominium_id, name, service_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_condominium_id ON suppliers(condominium_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_service_type ON suppliers(service_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_plan ON suppliers(plan);
CREATE INDEX IF NOT EXISTS idx_suppliers_stripe_customer ON suppliers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_connect_account ON suppliers(stripe_connect_account_id);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  base_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  per_unit_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  condo_count INTEGER NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (admin_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_admin_id ON subscriptions(admin_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT, -- in bytes
  file_type VARCHAR(100),
  category VARCHAR(100),
  ai_summary TEXT, -- AI-generated summary of document content
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_condominium_id ON documents(condominium_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_condominiums_updated_at BEFORE UPDATE ON condominiums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE condominiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- System settings: Only admins can read, super admins can modify
CREATE POLICY "System settings readable by authenticated users" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins: Users can only see their own admin record
CREATE POLICY "Admins can view own record" ON admins
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can update own record" ON admins
  FOR UPDATE USING (auth.uid() = id);

-- Condominiums: Admins can only see condominiums they own
CREATE POLICY "Admins can view own condominiums" ON condominiums
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can create own condominiums" ON condominiums
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update own condominiums" ON condominiums
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete own condominiums" ON condominiums
  FOR DELETE USING (admin_id = auth.uid());

-- Apartments: Accessible only through condominium ownership
CREATE POLICY "Admins can view apartments in own condos" ON apartments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = apartments.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage apartments in own condos" ON apartments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = apartments.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Tenants: Accessible only through condominium ownership
CREATE POLICY "Admins can view tenants in own condos" ON tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = tenants.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage tenants in own condos" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = tenants.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Suppliers: Accessible only through condominium ownership
CREATE POLICY "Admins can view suppliers in own condos" ON suppliers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = suppliers.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage suppliers in own condos" ON suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = suppliers.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Documents: Accessible only through condominium ownership
CREATE POLICY "Admins can view documents in own condos" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = documents.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage documents in own condos" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = documents.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Subscriptions: each admin can manage their own subscription row
CREATE POLICY "Admins can view own subscription" ON subscriptions
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can manage own subscription" ON subscriptions
  FOR ALL USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- ============================================================================
-- FUNCTIONS FOR DATA AGGREGATION
-- ============================================================================

-- Function to update condominium statistics
CREATE OR REPLACE FUNCTION update_condominium_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE condominiums
  SET 
    total_tenants = (
      SELECT COUNT(*) FROM tenants 
      WHERE tenants.condominium_id = NEW.condominium_id
    ),
    units_count = (
      SELECT COUNT(*) FROM apartments 
      WHERE apartments.condominium_id = NEW.condominium_id
    ),
    updated_at = NOW()
  WHERE id = NEW.condominium_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update stats
CREATE TRIGGER update_condo_stats_on_tenant_change
  AFTER INSERT OR UPDATE OR DELETE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_condominium_stats();

CREATE TRIGGER update_condo_stats_on_apartment_change
  AFTER INSERT OR UPDATE OR DELETE ON apartments
  FOR EACH ROW EXECUTE FUNCTION update_condominium_stats();

-- ============================================================================
-- PAYMENTS (PAGAMENTI)
-- ============================================================================

-- Payments table for tracking condo fee payments
CREATE TABLE IF NOT EXISTS pagamenti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(50), -- cash, bank_transfer, card, etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pagamenti_condominium_id ON pagamenti(condominium_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_tenant_id ON pagamenti(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_due_date ON pagamenti(due_date);
CREATE INDEX IF NOT EXISTS idx_pagamenti_paid ON pagamenti(paid);

-- Enable RLS
ALTER TABLE pagamenti ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can only see payments for their condominiums
CREATE POLICY "Admins can view payments in own condos" ON pagamenti
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = pagamenti.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage payments in own condos" ON pagamenti
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = pagamenti.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_pagamenti_updated_at BEFORE UPDATE ON pagamenti
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PLATFORM PAYMENT TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payer_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  payee_id UUID NOT NULL,
  payee_type VARCHAR(20) NOT NULL, -- admin or supplier
  condo_id UUID REFERENCES condominiums(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'eur',
  platform_fee_percent DECIMAL(5, 2) DEFAULT 1.0,
  platform_fee_amount DECIMAL(10, 2) DEFAULT 0,
  stripe_fee_percent DECIMAL(5, 2) DEFAULT 0.25,
  stripe_fee_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) DEFAULT 0,
  stripe_payment_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, succeeded, failed
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee ON payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_condo ON payments(condo_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payments analytics" ON payments
  FOR SELECT USING (
    payee_type = 'admin' AND payee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = payments.condo_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can record payments for own condos" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = payments.condo_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MAINTENANCE TASKS (INTERVENTI)
-- ============================================================================

-- Maintenance tasks/interventions table
CREATE TABLE IF NOT EXISTS interventi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  fornitore_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, canceled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  assigned_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  cost DECIMAL(10, 2),
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interventi_condominium_id ON interventi(condominium_id);
CREATE INDEX IF NOT EXISTS idx_interventi_fornitore_id ON interventi(fornitore_id);
CREATE INDEX IF NOT EXISTS idx_interventi_status ON interventi(status);
CREATE INDEX IF NOT EXISTS idx_interventi_priority ON interventi(priority);

-- Enable RLS
ALTER TABLE interventi ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can see interventions for their condos, suppliers can see assigned ones
CREATE POLICY "Admins can view interventions in own condos" ON interventi
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = interventi.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage interventions in own condos" ON interventi
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = interventi.condominium_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_interventi_updated_at BEFORE UPDATE ON interventi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- IMPORT LOGS
-- ============================================================================

-- Import logs table for tracking Excel/CSV imports
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(50), -- excel, csv
  import_type VARCHAR(50), -- condominiums, tenants, apartments, payments
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  records_imported INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_import_logs_admin_id ON import_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_imported_at ON import_logs(imported_at DESC);

-- Enable RLS
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can only see their own import logs
CREATE POLICY "Admins can view own import logs" ON import_logs
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can create own import logs" ON import_logs
  FOR INSERT WITH CHECK (admin_id = auth.uid());
