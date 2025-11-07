-- Reversible Database Migrations - Down Scripts
-- Use these to rollback schema changes if needed
-- Version: 1.0.0

-- ============================================================================
-- ROLLBACK SCRIPT - Use with caution
-- ============================================================================

-- Disable RLS
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE apartments DISABLE ROW LEVEL SECURITY;
ALTER TABLE condominiums DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Drop triggers
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
DROP TRIGGER IF EXISTS update_apartments_updated_at ON apartments;
DROP TRIGGER IF EXISTS update_condominiums_updated_at ON condominiums;
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
DROP TRIGGER IF EXISTS update_condo_stats_on_tenant_change ON tenants;
DROP TRIGGER IF EXISTS update_condo_stats_on_apartment_change ON apartments;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_condominium_stats();

-- Drop policies (if needed to drop tables)
-- Note: Policies are automatically dropped when tables are dropped

-- Drop indexes
DROP INDEX IF EXISTS idx_documents_created_at;
DROP INDEX IF EXISTS idx_documents_category;
DROP INDEX IF EXISTS idx_documents_condominium_id;
DROP INDEX IF EXISTS idx_suppliers_service_type;
DROP INDEX IF EXISTS idx_suppliers_plan;
DROP INDEX IF EXISTS idx_suppliers_stripe_customer;
DROP INDEX IF EXISTS idx_suppliers_connect_account;
DROP INDEX IF EXISTS idx_suppliers_condominium_id;
DROP INDEX IF EXISTS idx_tenants_payment_status;
DROP INDEX IF EXISTS idx_tenants_stripe_customer;
DROP INDEX IF EXISTS idx_tenants_email;
DROP INDEX IF EXISTS idx_tenants_apartment_id;
DROP INDEX IF EXISTS idx_tenants_condominium_id;
DROP INDEX IF EXISTS idx_apartments_unit_number;
DROP INDEX IF EXISTS idx_apartments_condominium_id;
DROP INDEX IF EXISTS idx_condominiums_created_at;
DROP INDEX IF EXISTS idx_condominiums_admin_id;
DROP INDEX IF EXISTS idx_admins_subscription_status;
DROP INDEX IF EXISTS idx_admins_email;
DROP INDEX IF EXISTS idx_admins_stripe_customer;
DROP INDEX IF EXISTS idx_admins_connect_account;
DROP INDEX IF EXISTS idx_subscriptions_admin_id;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_payments_payer;
DROP INDEX IF EXISTS idx_payments_payee;
DROP INDEX IF EXISTS idx_payments_condo;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_created_at;
DROP INDEX IF EXISTS idx_system_settings_key;

-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS apartments CASCADE;
DROP TABLE IF EXISTS condominiums CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Drop extensions (only if not used elsewhere)
-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS "pgcrypto";

-- ============================================================================
-- WARNING
-- ============================================================================
-- This script will DELETE ALL DATA and TABLES
-- Only use for complete rollback during development/testing
-- For production rollbacks, use point-in-time recovery instead
-- ============================================================================



