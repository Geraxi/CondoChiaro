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
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_subscription_status ON admins(subscription_status);

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_condo_tenant_email UNIQUE (condominium_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_condominium_id ON tenants(condominium_id);
CREATE INDEX IF NOT EXISTS idx_tenants_apartment_id ON tenants(apartment_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_payment_status ON tenants(payment_status);

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_condo_supplier UNIQUE (condominium_id, name, service_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_condominium_id ON suppliers(condominium_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_service_type ON suppliers(service_type);

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

