-- CondoChiaro Enhancements Schema
-- Version: 2.0.0
-- Adds: AI Assembly Summary, Supplier Ratings, Ticket Escalation, Noticeboard, Legal Registers, Audit Logs, Document Expiration

-- ============================================================================
-- ENHANCED SUPPLIER REVIEWS (Detailed Ratings)
-- ============================================================================

-- Add detailed rating columns to supplier_reviews if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'supplier_reviews' AND column_name = 'rating_qualita') THEN
    ALTER TABLE supplier_reviews 
    ADD COLUMN rating_qualita INTEGER CHECK (rating_qualita >= 1 AND rating_qualita <= 5),
    ADD COLUMN rating_puntualita INTEGER CHECK (rating_puntualita >= 1 AND rating_puntualita <= 5),
    ADD COLUMN rating_comunicazione INTEGER CHECK (rating_comunicazione >= 1 AND rating_comunicazione <= 5);
  END IF;
END $$;

-- Update trigger to calculate average from detailed ratings
CREATE OR REPLACE FUNCTION update_supplier_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,2);
BEGIN
  -- Calculate average from detailed ratings if available, otherwise use overall rating
  SELECT COALESCE(
    (AVG((COALESCE(rating_qualita, rating) + COALESCE(rating_puntualita, rating) + COALESCE(rating_comunicazione, rating)) / 3.0)),
    AVG(rating::NUMERIC)
  ) INTO avg_rating
  FROM supplier_reviews
  WHERE supplier_id = NEW.supplier_id;
  
  UPDATE suppliers
  SET 
    rating = COALESCE(avg_rating, 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM supplier_reviews
      WHERE supplier_id = NEW.supplier_id
    )
  WHERE id = NEW.supplier_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ASSEMBLY SUMMARIES (Verbali Sintetici)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assembly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembly_id UUID NOT NULL, -- References assemblies table (if exists) or can be standalone
  condo_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- AI-generated summary
  key_topics JSONB DEFAULT '[]', -- Array of topics discussed
  votes JSONB DEFAULT '[]', -- Array of votes: [{topic, result, votes_for, votes_against}]
  decisions JSONB DEFAULT '[]', -- Array of decisions made
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published')),
  approved_by UUID REFERENCES admins(id),
  approved_at TIMESTAMPTZ,
  document_url TEXT, -- Link to full verbale PDF
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assembly_summaries_condo_id ON assembly_summaries(condo_id);
CREATE INDEX IF NOT EXISTS idx_assembly_summaries_admin_id ON assembly_summaries(admin_id);
CREATE INDEX IF NOT EXISTS idx_assembly_summaries_status ON assembly_summaries(status);
CREATE INDEX IF NOT EXISTS idx_assembly_summaries_created_at ON assembly_summaries(created_at DESC);

-- ============================================================================
-- NOTICEBOARD (Bacheca Digitale)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]', -- Array of {url, type, filename}
  pinned BOOLEAN DEFAULT FALSE,
  allow_comments BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notice_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_condo_id ON notices(condo_id);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices(pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notice_comments_notice_id ON notice_comments(notice_id);

-- ============================================================================
-- TICKET ESCALATION
-- ============================================================================

-- Add escalation fields to jobs/interventi table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'jobs' AND column_name = 'escalated_at') THEN
    ALTER TABLE jobs 
    ADD COLUMN escalated_at TIMESTAMPTZ,
    ADD COLUMN escalation_status TEXT DEFAULT 'none' CHECK (escalation_status IN ('none', 'pending_review', 'resolved'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'interventi' AND column_name = 'escalated_at') THEN
    ALTER TABLE interventi 
    ADD COLUMN escalated_at TIMESTAMPTZ,
    ADD COLUMN escalation_status TEXT DEFAULT 'none' CHECK (escalation_status IN ('none', 'pending_review', 'resolved'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_escalation_status ON jobs(escalation_status) WHERE escalation_status != 'none';
CREATE INDEX IF NOT EXISTS idx_interventi_escalation_status ON interventi(escalation_status) WHERE escalation_status != 'none';

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  entity TEXT NOT NULL, -- 'document', 'payment', 'tenant', 'condominium', etc.
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- LEGAL REGISTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS legal_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  register_type TEXT NOT NULL CHECK (register_type IN ('anagrafe', 'contabilita', 'verbali', 'nomina_revoca')),
  entry_data JSONB NOT NULL, -- Flexible structure for different register types
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_registers_condo_id ON legal_registers(condo_id);
CREATE INDEX IF NOT EXISTS idx_legal_registers_type ON legal_registers(register_type);
CREATE INDEX IF NOT EXISTS idx_legal_registers_entry_date ON legal_registers(entry_date DESC);

-- ============================================================================
-- DOCUMENT EXPIRATION MANAGEMENT
-- ============================================================================

-- Add expiration fields to documents table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'documents' AND column_name = 'expiry_date') THEN
    ALTER TABLE documents 
    ADD COLUMN expiry_date DATE,
    ADD COLUMN auto_renewal BOOLEAN DEFAULT FALSE,
    ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN document_type TEXT DEFAULT 'general' CHECK (document_type IN ('general', 'insurance', 'contract', 'license', 'certificate'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'ticket_escalation', 'document_expiry', 'supplier_rating_request', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to related resource
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- USER ROLES & PERMISSIONS
-- ============================================================================

-- Add role field to admins if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'admins' AND column_name = 'role') THEN
    ALTER TABLE admins 
    ADD COLUMN role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'assistant'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'admins' AND column_name = 'two_factor_enabled') THEN
    ALTER TABLE admins 
    ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN two_factor_secret TEXT;
  END IF;
END $$;

-- ============================================================================
-- PRIVACY & GDPR
-- ============================================================================

CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE UNIQUE,
  privacy_policy_url TEXT, -- URL to uploaded privacy policy PDF
  data_processing_agreement_accepted BOOLEAN DEFAULT FALSE,
  data_processing_agreement_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE assembly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- Assembly Summaries: Admins can manage their own
CREATE POLICY "Admins can manage their assembly summaries"
  ON assembly_summaries FOR ALL
  USING (admin_id = auth.uid());

-- Notices: Admins can manage, tenants can view
CREATE POLICY "Admins can manage notices"
  ON notices FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Tenants can view notices for their condo"
  ON notices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.condo_id = notices.condo_id 
      AND tenants.user_id = auth.uid()
    )
  );

-- Notice Comments: Users can comment on notices they can view
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

-- Audit Logs: Admins can view their own logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Legal Registers: Admins can manage for their condos
CREATE POLICY "Admins can manage legal registers"
  ON legal_registers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM condominiums 
      WHERE condominiums.id = legal_registers.condo_id 
      AND condominiums.admin_id = auth.uid()
    )
  );

-- Notifications: Users can only see their own
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid());

-- Privacy Settings: Admins can manage their own
CREATE POLICY "Admins can manage their privacy settings"
  ON privacy_settings FOR ALL
  USING (admin_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update legal registers when relevant data changes
CREATE OR REPLACE FUNCTION auto_update_legal_registers()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called by specific triggers for each register type
  -- Implementation depends on what data changes trigger register updates
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps
CREATE TRIGGER update_assembly_summaries_updated_at 
  BEFORE UPDATE ON assembly_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at 
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notice_comments_updated_at 
  BEFORE UPDATE ON notice_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_registers_updated_at 
  BEFORE UPDATE ON legal_registers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at 
  BEFORE UPDATE ON privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



