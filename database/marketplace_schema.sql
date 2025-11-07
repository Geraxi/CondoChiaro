-- Supplier Marketplace Schema
-- Version: 1.0.0
-- Adds marketplace functionality to CondoChiaro

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- SUPPLIERS (Marketplace)
-- ============================================================================

-- Drop existing suppliers table if it exists (legacy condo-specific)
DROP TABLE IF EXISTS suppliers CASCADE;

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NULL REFERENCES admins(id) ON DELETE SET NULL, -- optional: studio collegato
  name TEXT NOT NULL,
  vat TEXT, -- P.IVA
  vat_verified BOOLEAN DEFAULT FALSE,
  pec TEXT,
  sdi TEXT,
  iban TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  coords GEOGRAPHY(POINT, 4326), -- PostGIS geography(Point,4326)
  categories TEXT[] DEFAULT '{}', -- ['idraulico','elettricista',...]
  coverage_km INTEGER DEFAULT 10,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  logo_url TEXT,
  docs JSONB DEFAULT '{}', -- {durc:..., rc:..., fgas:..., dm37:...}
  stripe_connect_account_id TEXT,
  stripe_connect_account_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_coords ON suppliers USING GIST (coords);
CREATE INDEX IF NOT EXISTS idx_suppliers_categories ON suppliers USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON suppliers(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_plan ON suppliers(plan);
CREATE INDEX IF NOT EXISTS idx_suppliers_org_id ON suppliers(org_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at DESC);

-- ============================================================================
-- SUPPLIER_USERS (Multi-user companies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'dispatcher', 'technician')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_users_supplier_id ON supplier_users(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_users_user_id ON supplier_users(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_users_role ON supplier_users(role);

-- ============================================================================
-- JOBS (Interventi)
-- ============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  condo_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('bassa', 'media', 'alta')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'closed', 'cancelled')),
  scheduled_at TIMESTAMPTZ NULL,
  amount_est NUMERIC(10,2) NULL,
  amount_final NUMERIC(10,2) NULL,
  attachments JSONB DEFAULT '[]', -- [{url, filename, type}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_admin_id ON jobs(admin_id);
CREATE INDEX IF NOT EXISTS idx_jobs_supplier_id ON jobs(supplier_id);
CREATE INDEX IF NOT EXISTS idx_jobs_supplier_status ON jobs(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_condo_id ON jobs(condo_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- ============================================================================
-- QUOTES (Preventivi)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]', -- [{desc, qty, unit, price}]
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  notes TEXT,
  valid_until TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_job_id ON quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- ============================================================================
-- INVOICES (Fatture a consuntivo)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  quote_id UUID NULL REFERENCES quotes(id) ON DELETE SET NULL,
  pdf_url TEXT,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ NULL,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  platform_fee_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_paid ON invoices(paid);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_intent ON invoices(stripe_payment_intent_id);

-- ============================================================================
-- JOB_MESSAGES (Chat)
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- [{url, filename, type}]
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_messages_job_id ON job_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_job_messages_sender ON job_messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_job_messages_created_at ON job_messages(job_id, created_at DESC);

-- ============================================================================
-- SUPPLIER_REVIEWS (Recensioni)
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id) -- One review per job
);

CREATE INDEX IF NOT EXISTS idx_supplier_reviews_supplier_id ON supplier_reviews(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_reviews_job_id ON supplier_reviews(job_id);

-- Trigger to update supplier rating when review is added/updated
CREATE OR REPLACE FUNCTION update_supplier_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE suppliers
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM supplier_reviews
      WHERE supplier_id = NEW.supplier_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM supplier_reviews
      WHERE supplier_id = NEW.supplier_id
    )
  WHERE id = NEW.supplier_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_supplier_rating
AFTER INSERT OR UPDATE OR DELETE ON supplier_reviews
FOR EACH ROW EXECUTE FUNCTION update_supplier_rating();

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: SUPPLIERS
-- ============================================================================

-- All admins can read suppliers (for marketplace browsing)
CREATE POLICY "Suppliers are readable by all admins"
  ON suppliers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Suppliers can read their own record
CREATE POLICY "Suppliers can read own record"
  ON suppliers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM supplier_users
      WHERE supplier_users.supplier_id = suppliers.id
      AND supplier_users.user_id = auth.uid()
    )
  );

-- Supplier owners can insert/update their own supplier
CREATE POLICY "Supplier owners can manage their supplier"
  ON suppliers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM supplier_users
      WHERE supplier_users.supplier_id = suppliers.id
      AND supplier_users.user_id = auth.uid()
      AND supplier_users.role = 'owner'
    )
  );

-- Only platform staff can update verified flag (skip for now, implement later)
-- CREATE POLICY "Only platform staff can verify suppliers"
--   ON suppliers FOR UPDATE
--   USING (...);

-- ============================================================================
-- RLS POLICIES: SUPPLIER_USERS
-- ============================================================================

CREATE POLICY "Users can read their own supplier_users records"
  ON supplier_users FOR SELECT
  USING (user_id = auth.uid() OR supplier_id IN (
    SELECT supplier_id FROM supplier_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Supplier owners can manage users"
  ON supplier_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM supplier_users su
      WHERE su.supplier_id = supplier_users.supplier_id
      AND su.user_id = auth.uid()
      AND su.role = 'owner'
    )
  );

-- ============================================================================
-- RLS POLICIES: JOBS
-- ============================================================================

-- Job participants (admin creator + assigned supplier) can read
CREATE POLICY "Job participants can read jobs"
  ON jobs FOR SELECT
  USING (
    admin_id = (SELECT id FROM admins WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM supplier_users
      WHERE supplier_users.supplier_id = jobs.supplier_id
      AND supplier_users.user_id = auth.uid()
    )
  );

-- Admins can create jobs
CREATE POLICY "Admins can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    admin_id = (SELECT id FROM admins WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM condominiums
      WHERE condominiums.id = jobs.condo_id
      AND condominiums.admin_id = (SELECT id FROM admins WHERE id = auth.uid())
    )
  );

-- Admins can update their jobs
CREATE POLICY "Admins can update their jobs"
  ON jobs FOR UPDATE
  USING (admin_id = (SELECT id FROM admins WHERE id = auth.uid()));

-- Suppliers can update jobs they're assigned to
CREATE POLICY "Suppliers can update assigned jobs"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM supplier_users
      WHERE supplier_users.supplier_id = jobs.supplier_id
      AND supplier_users.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: QUOTES
-- ============================================================================

CREATE POLICY "Job participants can read quotes"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = quotes.job_id
      AND (
        jobs.admin_id = (SELECT id FROM admins WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM supplier_users
          WHERE supplier_users.supplier_id = jobs.supplier_id
          AND supplier_users.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Suppliers can create quotes for their jobs"
  ON quotes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN supplier_users ON supplier_users.supplier_id = jobs.supplier_id
      WHERE jobs.id = quotes.job_id
      AND supplier_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update their quotes"
  ON quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN supplier_users ON supplier_users.supplier_id = jobs.supplier_id
      WHERE jobs.id = quotes.job_id
      AND supplier_users.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: INVOICES
-- ============================================================================

CREATE POLICY "Job participants can read invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = invoices.job_id
      AND (
        jobs.admin_id = (SELECT id FROM admins WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM supplier_users
          WHERE supplier_users.supplier_id = jobs.supplier_id
          AND supplier_users.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Suppliers can create invoices for their jobs"
  ON invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN supplier_users ON supplier_users.supplier_id = jobs.supplier_id
      WHERE jobs.id = invoices.job_id
      AND supplier_users.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: JOB_MESSAGES
-- ============================================================================

CREATE POLICY "Job participants can read messages"
  ON job_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_messages.job_id
      AND (
        jobs.admin_id = (SELECT id FROM admins WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM supplier_users
          WHERE supplier_users.supplier_id = jobs.supplier_id
          AND supplier_users.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Job participants can send messages"
  ON job_messages FOR INSERT
  WITH CHECK (
    sender_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_messages.job_id
      AND (
        jobs.admin_id = (SELECT id FROM admins WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM supplier_users
          WHERE supplier_users.supplier_id = jobs.supplier_id
          AND supplier_users.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: SUPPLIER_REVIEWS
-- ============================================================================

CREATE POLICY "Admins can create reviews for their jobs"
  ON supplier_reviews FOR INSERT
  WITH CHECK (
    admin_id = (SELECT id FROM admins WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = supplier_reviews.job_id
      AND jobs.admin_id = (SELECT id FROM admins WHERE id = auth.uid())
    )
  );

CREATE POLICY "Job participants can read reviews"
  ON supplier_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = supplier_reviews.job_id
      AND (
        jobs.admin_id = (SELECT id FROM admins WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM supplier_users
          WHERE supplier_users.supplier_id = jobs.supplier_id
          AND supplier_users.user_id = auth.uid()
        )
      )
    )
  );

