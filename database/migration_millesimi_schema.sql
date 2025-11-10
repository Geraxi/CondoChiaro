-- CondoChiaro Millesimi & Ownership Migration
-- Adds millesimi (ownership percentage) support for expense allocation
-- This is CRITICAL for Italian condominium financial management

-- ============================================================================
-- 1️⃣ ENHANCE APARTMENTS TABLE
-- ============================================================================

-- Add millesimi column to apartments
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'apartments') THEN
    -- Add millesimi column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'apartments' AND column_name = 'millesimi') THEN
      ALTER TABLE apartments 
      ADD COLUMN millesimi NUMERIC(10,4) DEFAULT 0 
      CHECK (millesimi >= 0 AND millesimi <= 10000);
    END IF;
    
    -- Add unit type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'apartments' AND column_name = 'unit_type') THEN
      ALTER TABLE apartments 
      ADD COLUMN unit_type VARCHAR(50) DEFAULT 'apartment' 
      CHECK (unit_type IN ('apartment', 'box', 'garage', 'shop', 'cellar', 'attic', 'other'));
    END IF;
    
    -- Add payment_responsibility if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'apartments' AND column_name = 'payment_responsibility') THEN
      ALTER TABLE apartments 
      ADD COLUMN payment_responsibility VARCHAR(50) DEFAULT 'owner' 
      CHECK (payment_responsibility IN ('owner', 'tenant', 'both'));
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2️⃣ ENHANCE TENANTS TABLE
-- ============================================================================

-- Add codice fiscale and ownership fields
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
    -- Add codice fiscale
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'codice_fiscale') THEN
      ALTER TABLE tenants 
      ADD COLUMN codice_fiscale VARCHAR(16);
    END IF;
    
    -- Add is_owner flag
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'is_owner') THEN
      ALTER TABLE tenants 
      ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add ownership_percentage (for co-ownership)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'ownership_percentage') THEN
      ALTER TABLE tenants 
      ADD COLUMN ownership_percentage NUMERIC(5,2) DEFAULT 100 
      CHECK (ownership_percentage > 0 AND ownership_percentage <= 100);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3️⃣ CO-OWNERSHIP SUPPORT
-- ============================================================================

-- Create apartment_owners junction table for co-ownership
CREATE TABLE IF NOT EXISTS apartment_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  ownership_percentage NUMERIC(5,2) NOT NULL DEFAULT 100 
    CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  is_primary_owner BOOLEAN DEFAULT TRUE,
  ownership_start_date DATE DEFAULT CURRENT_DATE,
  ownership_end_date DATE, -- NULL if current owner
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_apartment_owners_apartment 
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
  CONSTRAINT fk_apartment_owners_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT unique_apartment_tenant_active 
    UNIQUE (apartment_id, tenant_id) 
    WHERE ownership_end_date IS NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_apartment_owners_apartment_id ON apartment_owners(apartment_id);
CREATE INDEX IF NOT EXISTS idx_apartment_owners_tenant_id ON apartment_owners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apartment_owners_active ON apartment_owners(apartment_id) WHERE ownership_end_date IS NULL;

-- ============================================================================
-- 4️⃣ OWNERSHIP TRANSFERS
-- ============================================================================

-- Create ownership_transfers table to track sales
CREATE TABLE IF NOT EXISTS ownership_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL,
  from_tenant_id UUID, -- NULL if new purchase
  to_tenant_id UUID NOT NULL,
  transfer_date DATE NOT NULL,
  transfer_type VARCHAR(50) NOT NULL 
    CHECK (transfer_type IN ('sale', 'inheritance', 'donation', 'other')),
  sale_price NUMERIC(12,2), -- If sale
  notary_name VARCHAR(255),
  notary_protocol_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_transfer_apartment 
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfer_from_tenant 
    FOREIGN KEY (from_tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  CONSTRAINT fk_transfer_to_tenant 
    FOREIGN KEY (to_tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ownership_transfers_apartment_id ON ownership_transfers(apartment_id);
CREATE INDEX IF NOT EXISTS idx_ownership_transfers_date ON ownership_transfers(transfer_date DESC);

-- ============================================================================
-- 5️⃣ RENTAL AGREEMENTS
-- ============================================================================

-- Create rental_agreements table
CREATE TABLE IF NOT EXISTS rental_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  owner_id UUID NOT NULL, -- The owner renting out
  contract_number VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for indefinite
  monthly_rent NUMERIC(10,2),
  deposit_amount NUMERIC(10,2),
  contract_document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_rental_apartment 
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
  CONSTRAINT fk_rental_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_rental_owner 
    FOREIGN KEY (owner_id) REFERENCES tenants(id) ON DELETE RESTRICT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rental_agreements_apartment_id ON rental_agreements(apartment_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_tenant_id ON rental_agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_active ON rental_agreements(apartment_id) 
  WHERE end_date IS NULL OR end_date >= CURRENT_DATE;

-- ============================================================================
-- 6️⃣ ENHANCE CONDOMINIUMS TABLE
-- ============================================================================

-- Add missing condominium fields
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condominiums') THEN
    -- Add codice fiscale
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'condominiums' AND column_name = 'codice_fiscale') THEN
      ALTER TABLE condominiums 
      ADD COLUMN codice_fiscale VARCHAR(16);
    END IF;
    
    -- Add total_millesimi (should always equal 10000)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'condominiums' AND column_name = 'total_millesimi') THEN
      ALTER TABLE condominiums 
      ADD COLUMN total_millesimi NUMERIC(10,4) DEFAULT 10000;
    END IF;
    
    -- Add insurance info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'condominiums' AND column_name = 'insurance_company') THEN
      ALTER TABLE condominiums 
      ADD COLUMN insurance_company VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'condominiums' AND column_name = 'insurance_policy_number') THEN
      ALTER TABLE condominiums 
      ADD COLUMN insurance_policy_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'condominiums' AND column_name = 'insurance_expiry_date') THEN
      ALTER TABLE condominiums 
      ADD COLUMN insurance_expiry_date DATE;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 7️⃣ MILLESIMI VALIDATION FUNCTION
-- ============================================================================

-- Function to validate that total millesimi = 10000 for a condominium
CREATE OR REPLACE FUNCTION validate_condominium_millesimi()
RETURNS TRIGGER AS $$
DECLARE
  total_mill NUMERIC(10,4);
  condo_mill NUMERIC(10,4);
BEGIN
  -- Get condominium's expected total
  SELECT total_millesimi INTO condo_mill
  FROM condominiums
  WHERE id = COALESCE(NEW.condominium_id, OLD.condominium_id);
  
  -- Calculate actual total
  SELECT COALESCE(SUM(millesimi), 0) INTO total_mill
  FROM apartments
  WHERE condominium_id = COALESCE(NEW.condominium_id, OLD.condominium_id);
  
  -- Update condominium total (for reference, but allow slight variance for rounding)
  UPDATE condominiums
  SET total_millesimi = total_mill
  WHERE id = COALESCE(NEW.condominium_id, OLD.condominium_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update total_millesimi
DROP TRIGGER IF EXISTS trigger_validate_millesimi ON apartments;
CREATE TRIGGER trigger_validate_millesimi
AFTER INSERT OR UPDATE OR DELETE ON apartments
FOR EACH ROW EXECUTE FUNCTION validate_condominium_millesimi();

-- ============================================================================
-- 8️⃣ RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE apartment_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

-- Apartment owners: Admins can manage for their condos
CREATE POLICY "Admins can manage apartment owners"
  ON apartment_owners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM apartments
      JOIN condominiums ON condominiums.id = apartments.condominium_id
      WHERE apartments.id = apartment_owners.apartment_id
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Ownership transfers: Admins can manage for their condos
CREATE POLICY "Admins can manage ownership transfers"
  ON ownership_transfers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM apartments
      JOIN condominiums ON condominiums.id = apartments.condominium_id
      WHERE apartments.id = ownership_transfers.apartment_id
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Rental agreements: Admins can manage for their condos
CREATE POLICY "Admins can manage rental agreements"
  ON rental_agreements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM apartments
      JOIN condominiums ON condominiums.id = apartments.condominium_id
      WHERE apartments.id = rental_agreements.apartment_id
      AND condominiums.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- 9️⃣ UPDATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_apartment_owners_updated_at 
  BEFORE UPDATE ON apartment_owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_agreements_updated_at 
  BEFORE UPDATE ON rental_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 🔟 COMMENTS
-- ============================================================================

COMMENT ON COLUMN apartments.millesimi IS 'Ownership percentage in millesimi (out of 10000)';
COMMENT ON COLUMN apartments.unit_type IS 'Type of unit: apartment, box, garage, shop, etc.';
COMMENT ON COLUMN apartments.payment_responsibility IS 'Who is responsible for payments: owner, tenant, or both';
COMMENT ON TABLE apartment_owners IS 'Junction table for co-ownership (multiple owners per unit)';
COMMENT ON TABLE ownership_transfers IS 'Tracks sales and ownership transfers';
COMMENT ON TABLE rental_agreements IS 'Stores rental contracts between owners and tenants';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration adds:
-- 1. Millesimi support to apartments
-- 2. Co-ownership support via apartment_owners table
-- 3. Ownership transfer tracking
-- 4. Rental agreement storage
-- 5. Enhanced condominium fields (codice fiscale, insurance)
-- 6. Automatic millesimi validation



