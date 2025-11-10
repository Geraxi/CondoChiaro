# CondoChiaro Implementation Roadmap

## Current Status: Foundation Complete ✅

### ✅ Completed Core Features
1. **Database Schema** - Complete with all new tables
2. **AI Assembly Summary** - Fully implemented
3. **Supplier Rating System** - Fully implemented
4. **Ticket Escalation** - Fully implemented
5. **Digital Noticeboard** - Fully implemented
6. **Document Expiration** - Schema + basic UI
7. **Legal Registers** - Schema created, frontend pending

### 🚧 Critical Missing Features

## Phase 1: Financial Foundation (WEEK 1-2) 🔴 CRITICAL

### 1.1 Millesimi System ✅ (Migration Created)
- [x] Database migration for millesimi
- [ ] Frontend UI to set/edit millesimi per apartment
- [ ] Validation: Total must equal 10000
- [ ] Co-ownership support UI

### 1.2 Expense Allocation Engine (Riparto Spese)
**Priority**: 🔴 CRITICAL - Required for legal operation

**Tasks**:
- [ ] Create `expenses` table
- [ ] Create `expense_allocations` table (links expenses to apartments by millesimi)
- [ ] Build calculation engine:
  - Calculate each unit's share based on millesimi
  - Handle exceptions (specific units excluded)
  - Support different allocation types (ordinary, extraordinary)
- [ ] Create API endpoint: `/api/condominiums/[id]/allocate-expenses`
- [ ] Frontend: Expense allocation wizard
- [ ] Export: PDF/Excel breakdown per unit

**Estimated Time**: 3-4 days

### 1.3 Payment Schedules
**Priority**: 🔴 CRITICAL

**Tasks**:
- [ ] Create `payment_schedules` table
- [ ] Support 1st, 2nd, 3rd installment (rata)
- [ ] Auto-generate payment due dates
- [ ] Frontend: Payment schedule view per unit
- [ ] Integration with expense allocations

**Estimated Time**: 2 days

## Phase 2: Accounting System (WEEK 3-4) 🔴 CRITICAL

### 2.1 Budgeting (Bilancio Preventivo/Consuntivo)
**Priority**: 🔴 CRITICAL - Legal requirement

**Tasks**:
- [ ] Create `budgets` table (preventivo)
- [ ] Create `budget_items` table
- [ ] Create `actual_expenses` table (consuntivo)
- [ ] Build budget creation wizard
- [ ] Build actual expense tracking
- [ ] Comparison view (preventivo vs consuntivo)
- [ ] Export: PDF rendiconto annuale

**Estimated Time**: 5-6 days

### 2.2 Invoicing System
**Priority**: 🔴 CRITICAL

**Tasks**:
- [ ] Enhance `invoices` table
- [ ] Auto-generate invoices from expense allocations
- [ ] PDF invoice generation
- [ ] XML export for Fatturazione Elettronica
- [ ] Invoice numbering system
- [ ] Frontend: Invoice list and detail view

**Estimated Time**: 4-5 days

### 2.3 Payment Tracking & Reconciliation
**Priority**: 🟡 HIGH

**Tasks**:
- [ ] Enhance payment tracking
- [ ] Bank statement import (CSV)
- [ ] Automatic payment matching
- [ ] Manual reconciliation UI
- [ ] Overdue tracking and alerts

**Estimated Time**: 3 days

## Phase 3: Assembly Management (WEEK 5) 🟡 HIGH

### 3.1 Voting System
**Priority**: 🟡 HIGH - Legal requirement

**Tasks**:
- [ ] Create `assembly_votes` table
- [ ] Millesimi-weighted voting
- [ ] Quorum calculation (50%+1 of millesimi)
- [ ] Majority calculation (simple, qualified, unanimous)
- [ ] Frontend: Voting interface
- [ ] Real-time vote counting

**Estimated Time**: 4 days

### 3.2 Assembly Documents
**Priority**: 🟡 HIGH

**Tasks**:
- [ ] Generate convocazione letter (PDF template)
- [ ] Generate verbale PDF (template)
- [ ] Attendance tracking
- [ ] Proxy management
- [ ] Document attachments

**Estimated Time**: 3 days

## Phase 4: Enhanced Features (WEEK 6-7) 🟢 MEDIUM

### 4.1 Legal Registers Frontend
**Priority**: 🟡 HIGH

**Tasks**:
- [ ] Create `/legal` page
- [ ] Tabs for each register
- [ ] Filter and search
- [ ] Export PDF/CSV
- [ ] Print functionality

**Estimated Time**: 2 days

### 4.2 Document Templates
**Priority**: 🟡 HIGH

**Tasks**:
- [ ] Template system
- [ ] Convocazione template
- [ ] Verbale template
- [ ] Delega template
- [ ] Nomina/revoca template
- [ ] PDF generation with data merge

**Estimated Time**: 3 days

### 4.3 Enhanced AI Assistant
**Priority**: 🟢 MEDIUM

**Tasks**:
- [ ] Payment queries ("Chi non ha pagato?")
- [ ] Document expiry queries
- [ ] Supplier rating queries
- [ ] Ticket escalation queries
- [ ] Expense queries

**Estimated Time**: 2 days

### 4.4 Analytics & Reports
**Priority**: 🟢 MEDIUM

**Tasks**:
- [ ] Expense category pie chart
- [ ] Unpaid units bar chart
- [ ] Monthly spending line graph
- [ ] Supplier costs table
- [ ] Financial summaries

**Estimated Time**: 3 days

## Phase 5: Communication & Automation (WEEK 8) 🟢 MEDIUM

### 5.1 Communication Hub
**Priority**: 🟢 MEDIUM

**Tasks**:
- [ ] Email integration (SendGrid/Resend)
- [ ] SMS integration (Twilio)
- [ ] WhatsApp integration (optional)
- [ ] Message templates
- [ ] Read receipts
- [ ] Delivery tracking

**Estimated Time**: 4 days

### 5.2 Automated Reminders
**Priority**: 🟡 HIGH

**Tasks**:
- [ ] Payment reminder system
- [ ] Document expiry reminders
- [ ] Assembly reminders
- [ ] Email templates
- [ ] Scheduling system

**Estimated Time**: 2 days

## Phase 6: Tenant Portal Enhancements (WEEK 9) 🟢 MEDIUM

### 6.1 Tenant Features
**Priority**: 🟢 MEDIUM

**Tasks**:
- [ ] Submit maintenance requests
- [ ] Digital voting in assemblies
- [ ] Communication with admin
- [ ] Ask Chiaro integration
- [ ] Payment history view
- [ ] Document downloads

**Estimated Time**: 3 days

## Phase 7: Advanced Features (WEEK 10+) ⚪ LOW

### 7.1 AI Expense Auditor
**Priority**: ⚪ LOW

**Tasks**:
- [ ] Duplicate detection
- [ ] Anomaly detection
- [ ] ML-based fraud detection
- [ ] Alert system

**Estimated Time**: 5 days

### 7.2 Calendar Integration
**Priority**: ⚪ LOW

**Tasks**:
- [ ] Google Calendar sync
- [ ] Outlook sync
- [ ] Deadline reminders
- [ ] Event creation

**Estimated Time**: 3 days

### 7.3 Task Lists & To-Do
**Priority**: ⚪ LOW

**Tasks**:
- [ ] Task management system
- [ ] Per-condominium task lists
- [ ] Priority and due dates
- [ ] Completion tracking

**Estimated Time**: 2 days

---

## Implementation Order (Recommended)

### Sprint 1 (Week 1-2): Financial Foundation
1. Millesimi UI
2. Expense Allocation Engine
3. Payment Schedules

### Sprint 2 (Week 3-4): Accounting
1. Budgeting System
2. Invoicing System
3. Payment Reconciliation

### Sprint 3 (Week 5): Assemblies
1. Voting System
2. Assembly Documents
3. Quorum Calculation

### Sprint 4 (Week 6-7): Compliance & Enhancement
1. Legal Registers Frontend
2. Document Templates
3. Enhanced AI Assistant
4. Analytics

### Sprint 5 (Week 8+): Communication & Polish
1. Communication Hub
2. Automated Reminders
3. Tenant Portal Enhancements
4. Advanced Features

---

## Success Metrics

- ✅ All legal requirements met (budgeting, invoicing, assemblies)
- ✅ Expense allocation working correctly
- ✅ Millesimi system validated
- ✅ Payment tracking accurate
- ✅ Document management complete
- ✅ User satisfaction high

---

## Notes

- All features must maintain existing UI/UX patterns
- No breaking changes to existing functionality
- All database changes via migrations
- Comprehensive testing required for financial features
- Legal compliance verification needed



