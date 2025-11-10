# CondoChiaro Database Migration v2.0

## Overview

This migration adds all new tables, columns, and relationships for the enhanced CondoChiaro features without modifying or removing existing data.

## ✅ What This Migration Adds

### 1. AI Assembly Summary
- **Table**: `assembly_summaries`
- Links to `assemblies` table (if exists)
- Stores AI-generated verbali sintetici
- Approval workflow with `approved` boolean

### 2. Supplier Rating System
- **Table**: `supplier_ratings`
- Three rating categories: quality, timeliness, communication
- Auto-calculated `average_rating`
- Updates `suppliers.average_rating` and `suppliers.total_reviews` automatically via trigger

### 3. Ticket Escalation System
- Adds columns to `tickets`, `jobs`, and `interventi` tables:
  - `escalated` (boolean)
  - `escalation_date` (timestamptz)
  - `reminder_sent` (boolean)

### 4. Digital Noticeboard (Bacheca)
- **Table**: `notices`
- **Table**: `notice_comments`
- Per-condominium posts with media support
- Pinned posts and comment system

### 5. Legal Registers
- **Tables**: 
  - `registro_anagrafe` (tenant/resident records)
  - `registro_contabilita` (accounting records)
  - `registro_verbali` (assembly minutes)
  - `registro_nomina_revoca` (admin appointments)
- Auto-populated via triggers when data changes

### 6. Document Expiration Tracking
- Adds to `documents` table:
  - `expiry_date` (date)
  - `reminder_sent` (boolean)
  - `auto_renewal` (boolean)
  - `validity_status` (varchar: 'active', 'expired', 'renewed', 'pending_renewal')
- Auto-updates validity status based on expiry date

### 7. Audit Log
- **Table**: `audit_logs`
- Tracks all create/update/delete actions
- Stores old/new values as JSONB
- Includes user, entity, action, timestamp

### 8. User Roles
- Adds `role` column to `admins` table
- Values: 'admin', 'assistant'
- RLS policies enforce role-based access

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all new tables
- **Policies** ensure:
  - Admins can manage their own data
  - Tenants can only view their condominium data
  - Suppliers can view their own ratings
  - Audit logs are admin-only

## ⚙️ Automation

### Auto-Updates
- **Supplier Ratings**: Automatically updates `suppliers.average_rating` and `total_reviews`
- **Document Validity**: Auto-updates `validity_status` based on `expiry_date`
- **Legal Registers**: Auto-populates when tenants, documents, or payments are added

### Triggers
- `trigger_update_supplier_ratings` - Updates supplier stats
- `trigger_update_document_validity` - Updates document status
- `trigger_auto_populate_anagrafe` - Logs tenant additions
- `trigger_auto_populate_verbali` - Logs document additions

## 📋 How to Apply

1. **Backup your database** (recommended)
2. **Run the migration** in Supabase SQL Editor:
   ```sql
   -- Copy and paste the entire migration_v2_schema.sql file
   ```
3. **Verify tables** were created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'assembly_summaries',
     'supplier_ratings',
     'notices',
     'notice_comments',
     'registro_anagrafe',
     'registro_contabilita',
     'registro_verbali',
     'registro_nomina_revoca',
     'audit_logs'
   );
   ```

## 🔍 Verification Queries

### Check new columns were added:
```sql
-- Check supplier rating columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
AND column_name IN ('average_rating', 'total_reviews');

-- Check document expiration columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name IN ('expiry_date', 'reminder_sent', 'auto_renewal', 'validity_status');

-- Check escalation columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name IN ('escalated', 'escalation_date', 'reminder_sent');
```

### Check RLS policies:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'assembly_summaries',
  'supplier_ratings',
  'notices',
  'audit_logs'
);
```

## ⚠️ Important Notes

1. **No Data Loss**: This migration only ADDS new tables and columns. It does NOT modify or delete existing data.

2. **Conditional Foreign Keys**: Foreign keys are only added if parent tables exist. The migration checks for table existence before adding constraints.

3. **Idempotent**: The migration can be run multiple times safely. It uses `IF NOT EXISTS` checks throughout.

4. **RLS Policies**: All new tables have RLS enabled with appropriate policies. Review and adjust as needed for your use case.

5. **Triggers**: Auto-update triggers are created. Monitor performance if you have large datasets.

## 🐛 Troubleshooting

### If foreign key errors occur:
- Check that parent tables exist
- Verify the referenced columns exist
- Run the migration in sections if needed

### If RLS blocks access:
- Check your user role
- Verify RLS policies match your access requirements
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### If triggers don't fire:
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname LIKE '%supplier%';`
- Verify function exists: `SELECT * FROM pg_proc WHERE proname LIKE '%supplier%';`

## 📚 Next Steps

After running this migration:

1. Update your application code to use the new tables
2. Test the new features with sample data
3. Set up cron jobs for:
   - Ticket escalation checks (7 days)
   - Document expiration reminders (30 days)
4. Configure email notifications for escalations and expirations
5. Review and adjust RLS policies as needed

## Support

If you encounter issues, check:
- Supabase logs for SQL errors
- Table existence: `\dt` in psql
- Column existence: `\d table_name` in psql
- Constraint existence: `SELECT * FROM information_schema.table_constraints WHERE table_name = 'table_name';`



