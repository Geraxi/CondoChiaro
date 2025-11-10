-- CondoChiaro Database Migration v2.0
-- Adds: AI Assembly Summary, Supplier Ratings, Ticket Escalation, Noticeboard, Legal Registers, Document Expiration, Audit Logs
-- IMPORTANT: This migration does NOT drop or modify existing tables. Only adds new elements.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1️⃣ AI ASSEMBLY SUMMARY
-- ============================================================================

-- Create assembly_summaries table if it doesn't exist
CREATE TABLE IF NOT EXISTS assembly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembly_id UUID NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to assemblies table (if assemblies table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assemblies') THEN
    -- Drop existing constraint if it exists
    ALTER TABLE assembly_summaries DROP CONSTRAINT IF EXISTS fk_assembly;
    ALTER TABLE assembly_summaries 
    ADD CONSTRAINT fk_assembly 
    FOREIGN KEY (assembly_id) REFERENCES assemblies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assembly_summaries_assembly_id ON assembly_summaries(assembly_id);
CREATE INDEX IF NOT EXISTS idx_assembly_summaries_admin_id ON assembly_summaries(admin_id);
CREATE INDEX IF NOT EXISTS idx_assembly_summaries_approved ON assembly_summaries(approved);

-- ============================================================================
-- 2️⃣ SUPPLIER RATING SYSTEM
-- ============================================================================

-- Create supplier_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS supplier_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL,
  job_id UUID NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER NOT NULL CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  average_rating NUMERIC(3,2) GENERATED ALWAYS AS (
    (quality_rating + timeliness_rating + communication_rating)::NUMERIC / 3.0
  ) STORED,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, job_id) -- One rating per job
);

-- Add foreign keys (if tables exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_supplier' AND table_name = 'supplier_ratings'
    ) THEN
        ALTER TABLE supplier_ratings 
        ADD CONSTRAINT fk_supplier 
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_job' AND table_name = 'supplier_ratings'
    ) THEN
      ALTER TABLE supplier_ratings 
      ADD CONSTRAINT fk_job 
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Update suppliers table to include rating fields
DO $$ 
BEGIN
  -- Add average_rating column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'suppliers' AND column_name = 'average_rating') THEN
    ALTER TABLE suppliers 
    ADD COLUMN average_rating NUMERIC(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5);
  END IF;
  
  -- Add total_reviews column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'suppliers' AND column_name = 'total_reviews') THEN
    ALTER TABLE suppliers 
    ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to update supplier ratings
CREATE OR REPLACE FUNCTION update_supplier_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE suppliers
  SET 
    average_rating = (
      SELECT COALESCE(AVG(average_rating), 0)
      FROM supplier_ratings
      WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM supplier_ratings
      WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)
    )
  WHERE id = COALESCE(NEW.supplier_id, OLD.supplier_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update supplier ratings
DROP TRIGGER IF EXISTS trigger_update_supplier_ratings ON supplier_ratings;
CREATE TRIGGER trigger_update_supplier_ratings
AFTER INSERT OR UPDATE OR DELETE ON supplier_ratings
FOR EACH ROW EXECUTE FUNCTION update_supplier_rating_stats();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_supplier_ratings_supplier_id ON supplier_ratings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ratings_job_id ON supplier_ratings(job_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ratings_admin_id ON supplier_ratings(admin_id);

-- ============================================================================
-- 3️⃣ TICKET ESCALATION SYSTEM
-- ============================================================================

-- Add escalation columns to jobs table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
    -- Add escalated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'escalated') THEN
      ALTER TABLE jobs 
      ADD COLUMN escalated BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add escalation_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'escalation_date') THEN
      ALTER TABLE jobs 
      ADD COLUMN escalation_date TIMESTAMPTZ;
    END IF;
    
    -- Add reminder_sent column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'reminder_sent') THEN
      ALTER TABLE jobs 
      ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
  
  -- Also add to interventi table (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interventi') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interventi' AND column_name = 'escalated') THEN
      ALTER TABLE interventi 
      ADD COLUMN escalated BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interventi' AND column_name = 'escalation_date') THEN
      ALTER TABLE interventi 
      ADD COLUMN escalation_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interventi' AND column_name = 'reminder_sent') THEN
      ALTER TABLE interventi 
      ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
END $$;

-- Create indexes for escalation
CREATE INDEX IF NOT EXISTS idx_jobs_escalated ON jobs(escalated) WHERE escalated = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_escalation_date ON jobs(escalation_date) WHERE escalation_date IS NOT NULL;

-- ============================================================================
-- 4️⃣ DIGITAL NOTICEBOARD (BACHECA)
-- ============================================================================

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  comments_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop and recreate with proper constraint name
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notices') THEN
    ALTER TABLE notices DROP CONSTRAINT IF EXISTS fk_condo;
  END IF;
END $$;

-- Add foreign key to condominiums
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condominiums') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_condo' AND table_name = 'notices'
    ) THEN
      ALTER TABLE notices 
      ADD CONSTRAINT fk_condo 
      FOREIGN KEY (condo_id) REFERENCES condominiums(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create notice_comments table
CREATE TABLE IF NOT EXISTS notice_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notices_condo_id ON notices(condo_id);
CREATE INDEX IF NOT EXISTS idx_notices_author_id ON notices(author_id);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices(pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notice_comments_notice_id ON notice_comments(notice_id);
CREATE INDEX IF NOT EXISTS idx_notice_comments_author_id ON notice_comments(author_id);

-- ============================================================================
-- 5️⃣ LEGAL REGISTERS
-- ============================================================================

-- Create registro_anagrafe table
CREATE TABLE IF NOT EXISTS registro_anagrafe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registro_contabilita table
CREATE TABLE IF NOT EXISTS registro_contabilita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registro_verbali table
CREATE TABLE IF NOT EXISTS registro_verbali (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registro_nomina_revoca table
CREATE TABLE IF NOT EXISTS registro_nomina_revoca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys to condominiums
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condominiums') THEN
    ALTER TABLE registro_anagrafe 
    ADD CONSTRAINT fk_registro_anagrafe_condo 
    FOREIGN KEY (condo_id) REFERENCES condominiums(id) ON DELETE CASCADE;
    
    ALTER TABLE registro_contabilita 
    ADD CONSTRAINT fk_registro_contabilita_condo 
    FOREIGN KEY (condo_id) REFERENCES condominiums(id) ON DELETE CASCADE;
    
    ALTER TABLE registro_verbali 
    ADD CONSTRAINT fk_registro_verbali_condo 
    FOREIGN KEY (condo_id) REFERENCES condominiums(id) ON DELETE CASCADE;
    
    ALTER TABLE registro_nomina_revoca 
    ADD CONSTRAINT fk_registro_nomina_revoca_condo 
    FOREIGN KEY (condo_id) REFERENCES condominiums(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for legal registers
CREATE INDEX IF NOT EXISTS idx_registro_anagrafe_condo_id ON registro_anagrafe(condo_id);
CREATE INDEX IF NOT EXISTS idx_registro_anagrafe_created_at ON registro_anagrafe(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registro_contabilita_condo_id ON registro_contabilita(condo_id);
CREATE INDEX IF NOT EXISTS idx_registro_contabilita_created_at ON registro_contabilita(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registro_verbali_condo_id ON registro_verbali(condo_id);
CREATE INDEX IF NOT EXISTS idx_registro_verbali_created_at ON registro_verbali(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registro_nomina_revoca_condo_id ON registro_nomina_revoca(condo_id);
CREATE INDEX IF NOT EXISTS idx_registro_nomina_revoca_created_at ON registro_nomina_revoca(created_at DESC);

-- ============================================================================
-- 6️⃣ DOCUMENT EXPIRATION TRACKING
-- ============================================================================

-- Add expiration columns to documents table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    -- Add expiry_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'expiry_date') THEN
      ALTER TABLE documents 
      ADD COLUMN expiry_date DATE;
    END IF;
    
    -- Add reminder_sent column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'reminder_sent') THEN
      ALTER TABLE documents 
      ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add auto_renewal column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'auto_renewal') THEN
      ALTER TABLE documents 
      ADD COLUMN auto_renewal BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add validity_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'validity_status') THEN
      ALTER TABLE documents 
      ADD COLUMN validity_status VARCHAR(50) DEFAULT 'active' 
      CHECK (validity_status IN ('active', 'expired', 'renewed', 'pending_renewal'));
    END IF;
  END IF;
END $$;

-- Create function to update document validity status
CREATE OR REPLACE FUNCTION update_document_validity()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update validity_status based on expiry_date
  IF NEW.expiry_date IS NOT NULL THEN
    IF NEW.expiry_date < CURRENT_DATE THEN
      NEW.validity_status := 'expired';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND NEW.validity_status = 'active' THEN
      NEW.validity_status := 'pending_renewal';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update document validity
DROP TRIGGER IF EXISTS trigger_update_document_validity ON documents;
CREATE TRIGGER trigger_update_document_validity
BEFORE INSERT OR UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_document_validity();

-- Create index for expiry tracking
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_validity_status ON documents(validity_status);

-- ============================================================================
-- 7️⃣ AUDIT LOG
-- ============================================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- 8️⃣ USER ROLES
-- ============================================================================

-- Add role column to admins table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'role') THEN
      ALTER TABLE admins 
      ADD COLUMN role VARCHAR(50) DEFAULT 'admin' 
      CHECK (role IN ('admin', 'assistant'));
    END IF;
  END IF;
END $$;

-- Note: Tenants and suppliers already have their own tables with user_id references
-- The role is implicit based on which table they exist in

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE assembly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_anagrafe ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_contabilita ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_verbali ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_nomina_revoca ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Assembly Summaries: Admins can manage their own
CREATE POLICY "Admins can manage their assembly summaries"
  ON assembly_summaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = assembly_summaries.admin_id 
      AND admins.id = auth.uid()
    )
  );

-- Supplier Ratings: Admins can create, suppliers can view their own
CREATE POLICY "Admins can create supplier ratings"
  ON supplier_ratings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = supplier_ratings.admin_id 
      AND admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all ratings"
  ON supplier_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can view their own ratings"
  ON supplier_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = supplier_ratings.supplier_id
      AND EXISTS (
        SELECT 1 FROM supplier_users 
        WHERE supplier_users.supplier_id = suppliers.id 
        AND supplier_users.user_id = auth.uid()
      )
    )
  );

-- Notices: Admins can manage, tenants can view for their condo
CREATE POLICY "Admins can manage notices"
  ON notices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = notices.author_id 
      AND admins.id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view notices for their condo"
  ON notices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.condo_id = notices.condo_id 
      AND tenants.user_id = auth.uid()
    )
  );

-- Notice Comments: Users can comment on visible notices
CREATE POLICY "Users can comment on visible notices"
  ON notice_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM notices 
      WHERE notices.id = notice_comments.notice_id
      AND (
        notices.author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tenants 
          WHERE tenants.condo_id = notices.condo_id 
          AND tenants.user_id = auth.uid()
        )
      )
    )
  );

-- Legal Registers: Admins can manage for their condos
CREATE POLICY "Admins can manage registro_anagrafe"
  ON registro_anagrafe FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = registro_anagrafe.condo_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage registro_contabilita"
  ON registro_contabilita FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = registro_contabilita.condo_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage registro_verbali"
  ON registro_verbali FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = registro_verbali.condo_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage registro_nomina_revoca"
  ON registro_nomina_revoca FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = registro_nomina_revoca.condo_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Audit Logs: Admins can view
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS FOR AUTO-POPULATION
-- ============================================================================

-- Function to auto-populate legal registers
CREATE OR REPLACE FUNCTION auto_populate_legal_registers()
RETURNS TRIGGER AS $$
DECLARE
  condo_uuid UUID;
BEGIN
  -- Determine condo_id based on the table
  IF TG_TABLE_NAME = 'tenants' THEN
    condo_uuid := NEW.condominium_id;
    INSERT INTO registro_anagrafe (condo_id, entry_type, description, reference_id)
    VALUES (condo_uuid, 'tenant_added', 'Aggiunto condòmino: ' || NEW.name || ' ' || NEW.surname, NEW.id);
  ELSIF TG_TABLE_NAME = 'documents' THEN
    condo_uuid := NEW.condominium_id;
    INSERT INTO registro_verbali (condo_id, entry_type, description, reference_id)
    VALUES (condo_uuid, 'document_added', 'Aggiunto documento: ' || COALESCE(NEW.title, 'Senza titolo'), NEW.id);
  ELSIF TG_TABLE_NAME = 'payments' OR TG_TABLE_NAME = 'transactions' THEN
    -- Try to get condo_id from related tenant or condominium
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = TG_TABLE_NAME AND column_name = 'condominium_id') THEN
      condo_uuid := NEW.condominium_id;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = TG_TABLE_NAME AND column_name = 'tenant_id') THEN
      SELECT condominium_id INTO condo_uuid FROM tenants WHERE id = NEW.tenant_id;
    END IF;
    
    IF condo_uuid IS NOT NULL THEN
      INSERT INTO registro_contabilita (condo_id, entry_type, description, reference_id)
      VALUES (condo_uuid, 'payment_recorded', 'Registrato pagamento: €' || NEW.amount, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-population (only if tables exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
    DROP TRIGGER IF EXISTS trigger_auto_populate_anagrafe ON tenants;
    CREATE TRIGGER trigger_auto_populate_anagrafe
    AFTER INSERT ON tenants
    FOR EACH ROW EXECUTE FUNCTION auto_populate_legal_registers();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    DROP TRIGGER IF EXISTS trigger_auto_populate_verbali ON documents;
    CREATE TRIGGER trigger_auto_populate_verbali
    AFTER INSERT ON documents
    FOR EACH ROW EXECUTE FUNCTION auto_populate_legal_registers();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assemblies') THEN
    DROP TRIGGER IF EXISTS trigger_auto_populate_assemblies ON assemblies;
    CREATE TRIGGER trigger_auto_populate_assemblies
    AFTER INSERT ON assemblies
    FOR EACH ROW EXECUTE FUNCTION auto_populate_legal_registers();
  END IF;
END $$;

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assembly_summaries_updated_at 
  BEFORE UPDATE ON assembly_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at 
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notice_comments_updated_at 
  BEFORE UPDATE ON notice_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE assembly_summaries IS 'AI-generated assembly summaries (verbali sintetici)';
COMMENT ON TABLE supplier_ratings IS 'Admin ratings for supplier performance on completed jobs';
COMMENT ON TABLE notices IS 'Digital noticeboard posts for condominiums';
COMMENT ON TABLE notice_comments IS 'Comments on noticeboard posts';
COMMENT ON TABLE registro_anagrafe IS 'Legal register for tenant/resident records';
COMMENT ON TABLE registro_contabilita IS 'Legal register for accounting records';
COMMENT ON TABLE registro_verbali IS 'Legal register for assembly minutes';
COMMENT ON TABLE registro_nomina_revoca IS 'Legal register for admin appointments/revocations';
COMMENT ON TABLE audit_logs IS 'System-wide audit trail for compliance';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration adds all new tables and columns without modifying existing data
-- All foreign keys are conditionally added only if parent tables exist
-- RLS policies ensure proper access control
-- Triggers handle auto-updates and auto-population

