# CondoChiaro Frontend/Backend Integration Plan

## Status: In Progress

This document tracks the integration of all new Supabase tables and functionalities into the CondoChiaro frontend and backend.

## ✅ Completed

1. **Database Migration** - `database/migration_v2_schema.sql` created
2. **AI Assembly Summary API** - Updated to use new schema (`summary_text`, `approved`)
3. **Supplier Rating API** - Updated to use `supplier_ratings` table
4. **UI Components Created**:
   - `components/ui/dialog.tsx` - Dialog component
   - `components/ui/textarea.tsx` - Textarea component
   - `components/assemblies/generate-summary-modal.tsx` - AI summary modal
   - `components/jobs/rate-supplier-modal.tsx` - Supplier rating modal
   - `app/admin/assemblies/[id]/page.tsx` - Assembly detail with summary tab

## 🚧 In Progress

5. **Assembly Summary Integration** - Adding button to assemblies page
6. **Supplier Rating Integration** - Adding modal trigger after job completion

## 📋 Remaining Integrations

### Phase 1: Core Features
- [ ] Update assemblies page to show "Genera Verbale Sintetico" button
- [ ] Add supplier rating modal trigger when job is completed
- [ ] Display supplier ratings in supplier dashboard
- [ ] Add rating column to supplier table in admin dashboard

### Phase 2: Ticket Escalation
- [ ] Add escalation badges to tickets/jobs
- [ ] Create escalation check function
- [ ] Add "Tickets in Escalation" KPI card to dashboard
- [ ] Integrate escalation notifications

### Phase 3: Digital Noticeboard
- [ ] Create `/bacheca` page per condominium
- [ ] Add notice CRUD operations
- [ ] Implement comments system
- [ ] Add sidebar shortcut
- [ ] Add pinned posts functionality

### Phase 4: Legal Registers
- [ ] Create `/legal` page with tabs
- [ ] Display register entries
- [ ] Add export functionality (PDF/CSV)
- [ ] Real-time updates via Supabase

### Phase 5: Document Expiration
- [ ] Add visual status badges to documents
- [ ] Create expiration alert on dashboard
- [ ] Add renewal modal
- [ ] Auto-update validity status

### Phase 6: Enhanced AI Assistant
- [ ] Add new query handlers for:
  - Assembly summaries
  - Document expiration
  - Supplier ratings
  - Ticket escalations

### Phase 7: Analytics Updates
- [ ] Add new KPI cards
- [ ] Create new charts
- [ ] Update dashboard with new metrics

### Phase 8: Security & Roles
- [ ] Implement role-based conditional rendering
- [ ] Add role checks to API endpoints
- [ ] Update RLS policies if needed

### Phase 9: Realtime Notifications
- [ ] Set up Supabase realtime subscriptions
- [ ] Create notification dropdown component
- [ ] Integrate with all new features

## Implementation Notes

- All new features use existing UI patterns (glassmorphism, gradients)
- Supabase queries use the new table schemas
- API endpoints updated to match new schema
- No breaking changes to existing features



