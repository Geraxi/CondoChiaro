# Supplier-to-Admin Interaction Implementation

## Overview
This document outlines the implementation of supplier interaction capabilities with admins. Previously, only admin-to-supplier functionality existed (admins could search and assign jobs to suppliers). Now suppliers can fully interact with admins through the platform.

## ✅ What Has Been Implemented

### 1. API Endpoints

#### Get Supplier's Jobs
- **Endpoint**: `GET /api/jobs/my-jobs`
- **Description**: Allows suppliers to fetch all jobs assigned to them
- **Query Parameters**:
  - `status` (optional): Filter by job status (pending, accepted, in_progress, completed, etc.)
- **Returns**: List of jobs with condominium and admin information
- **Location**: `app/api/jobs/my-jobs/route.ts`

#### Reject Job
- **Endpoint**: `POST /api/jobs/[id]/reject`
- **Description**: Allows suppliers to reject a pending job assignment
- **Returns**: Updated job object
- **Location**: `app/api/jobs/[id]/reject/route.ts`

#### Accept Job (Already Existed)
- **Endpoint**: `POST /api/jobs/[id]/accept`
- **Description**: Allows suppliers to accept a pending job assignment
- **Location**: `app/api/jobs/[id]/accept/route.ts`

#### Complete Job (Already Existed)
- **Endpoint**: `POST /api/jobs/[id]/complete`
- **Description**: Allows suppliers to mark a job as completed
- **Location**: `app/api/jobs/[id]/complete/route.ts`

#### Job Messaging
- **Endpoint**: `GET /api/jobs/[id]/messages` - Get all messages for a job
- **Endpoint**: `POST /api/jobs/[id]/messages` - Send a message about a job
- **Description**: Enables real-time communication between suppliers and admins about specific jobs
- **Location**: `app/api/jobs/[id]/messages/route.ts`

### 2. UI Components

#### Supplier Work Orders Page
- **Location**: `app/supplier/workorders/page.tsx`
- **Features**:
  - ✅ Fetches and displays all jobs assigned to the supplier
  - ✅ Status filtering (all, pending, accepted, in_progress, completed)
  - ✅ Accept/Reject buttons for pending jobs
  - ✅ Job details display (title, description, priority, scheduled date, amounts)
  - ✅ Condominium and admin information
  - ✅ Status badges with color coding
  - ✅ Priority badges
  - ✅ Link to job detail page for accepted/in_progress jobs
  - ✅ "Send Quote" button for accepted jobs

#### Supplier Communications Page
- **Location**: `app/supplier/communications/page.tsx`
- **Status**: UI exists but needs integration with messaging API
- **Note**: Can be enhanced to use the job messaging endpoints

### 3. Database Schema (Already Existed)
- `jobs` table - Stores job assignments
- `job_messages` table - Stores messages between admins and suppliers
- `quotes` table - Stores quotes sent by suppliers
- `supplier_users` table - Links users to supplier companies

## 🔄 Interaction Flow

### 1. Admin Assigns Job to Supplier
1. Admin searches for suppliers (`/admin/suppliers`)
2. Admin clicks "Assegna intervento" on a supplier
3. Admin fills out job details (title, description, priority, scheduled date, estimated amount)
4. Job is created with status `pending`
5. Supplier receives the job assignment

### 2. Supplier Views and Responds to Job
1. Supplier navigates to `/supplier/workorders`
2. Supplier sees all jobs assigned to them
3. Supplier can filter by status
4. For pending jobs:
   - Supplier can **Accept** → Status changes to `accepted`
   - Supplier can **Reject** → Status changes to `cancelled`
5. For accepted jobs:
   - Supplier can send a quote
   - Supplier can view job details
   - Supplier can communicate with admin

### 3. Supplier Sends Quote (API Exists, UI Needs Enhancement)
1. Supplier accepts a job
2. Supplier creates a quote with line items
3. Quote is sent to admin for approval
4. Admin can accept/reject the quote

### 4. Supplier Completes Job
1. Supplier marks job as `in_progress`
2. Supplier completes work
3. Supplier marks job as `completed`
4. Invoice is automatically created
5. Admin can pay the invoice

### 5. Communication Between Supplier and Admin
1. Either party can send messages via `/api/jobs/[id]/messages`
2. Messages are linked to specific jobs
3. Both parties can see the conversation history
4. Messages support attachments

## 🚀 Next Steps / Enhancements Needed

### High Priority
1. **Quote Creation UI** - Create a dialog/modal for suppliers to create and send quotes
2. **Job Detail Page** - Create `/supplier/workorders/[id]` page with:
   - Full job details
   - Message thread
   - Quote creation interface
   - Status update controls
   - Photo upload for completed work

### Medium Priority
3. **Status Update API** - Allow suppliers to update job status (e.g., `in_progress`)
4. **Real-time Notifications** - Notify suppliers when new jobs are assigned
5. **Enhanced Communications Page** - Integrate with job messaging API
6. **Dashboard Updates** - Show real job data instead of mock data

### Low Priority
7. **Job History** - Show completed/cancelled jobs
8. **Analytics** - Show supplier performance metrics
9. **Bulk Actions** - Allow suppliers to accept/reject multiple jobs

## 📝 Usage Examples

### Supplier Accepts a Job
```typescript
const response = await fetch(`/api/jobs/${jobId}/accept`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
})
```

### Supplier Gets Their Jobs
```typescript
const response = await fetch(`/api/jobs/my-jobs?status=pending`, {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
})
```

### Supplier Sends a Message
```typescript
const response = await fetch(`/api/jobs/${jobId}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    body: 'Ho completato l\'intervento. Allego le foto.',
    attachments: [
      { url: 'https://...', filename: 'photo1.jpg', type: 'image/jpeg' }
    ]
  }),
})
```

## 🔒 Security & Permissions

- All endpoints verify that the user is a supplier (via `supplier_users` table)
- Suppliers can only see/modify jobs assigned to their supplier company
- RLS policies in the database enforce access control
- Messages can only be sent by job participants (admin or supplier)

## 📊 Current Status

- ✅ **Core Functionality**: Complete
- ✅ **Job Viewing**: Complete
- ✅ **Job Accept/Reject**: Complete
- ✅ **Messaging API**: Complete
- ⏳ **Quote UI**: Needs implementation
- ⏳ **Job Detail Page**: Needs implementation
- ⏳ **Status Updates**: Needs API endpoint
- ⏳ **Real-time Features**: Needs implementation

