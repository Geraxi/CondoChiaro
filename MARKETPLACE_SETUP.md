# Supplier Marketplace - Local Setup Guide

## Quick Start

### 1. Database Migration

Run the marketplace schema in Supabase SQL Editor:

```bash
# Copy entire contents of database/marketplace_schema.sql
# Paste into Supabase Dashboard → SQL Editor → Execute
```

Verify PostGIS is enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'postgis';
```

### 2. Environment Variables

Add to `.env.local`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_CONNECT_ENABLED=true
PLATFORM_FEE_PERCENT=1.0
STRIPE_SUPPLIER_PRO_PRICE_ID=price_... # Create in Stripe Dashboard

# Optional
SUPPORT_EMAIL=ciao@condochiaro.com
```

### 3. Stripe Setup

1. Create Stripe Connect application in Stripe Dashboard
2. Create Supplier Pro price (€9.99/month)
3. Set `STRIPE_SUPPLIER_PRO_PRICE_ID` in env
4. Enable Connect in test mode

### 4. Seed Test Data

```sql
-- Create a test supplier
INSERT INTO suppliers (
  name, email, phone, address, city, 
  categories, coverage_km, verified, rating,
  coords
) VALUES (
  'Idraulico Mario Rossi',
  'mario@example.com',
  '+39 123 456 7890',
  'Via Roma 1',
  'Milano',
  ARRAY['idraulico', 'riscaldamento'],
  15,
  true,
  4.5,
  ST_SetSRID(ST_MakePoint(9.19, 45.4642), 4326)::geography
);

-- Create supplier_user (link to your auth user)
INSERT INTO supplier_users (supplier_id, user_id, role)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'Idraulico Mario Rossi'),
  'your-user-uuid-here',
  'owner'
);
```

### 5. Test the Flow

1. **Admin searches suppliers:**
   - Navigate to `/admin/suppliers`
   - Should see suppliers in the area
   - Filter by category, distance, rating

2. **Admin assigns job:**
   - Click "Assegna intervento" on a supplier
   - Fill form and submit
   - Job should be created with status `pending`

3. **Supplier accepts job:**
   ```bash
   POST /api/jobs/{jobId}/accept
   Authorization: Bearer {supplier_token}
   ```

4. **Supplier creates quote:**
   ```bash
   POST /api/quotes/{jobId}
   {
     "items": [{"desc": "Intervento", "qty": 1, "unit": "pz", "price": 500}],
     "notes": "Valido 30 giorni"
   }
   ```

5. **Supplier completes job:**
   ```bash
   POST /api/jobs/{jobId}/complete
   {
     "amount_final": 500
   }
   ```

6. **Admin pays invoice:**
   ```bash
   POST /api/invoices/{jobId}/pay
   {
     "useCheckout": true,
     "successUrl": "http://localhost:3000/admin/jobs/{jobId}",
     "cancelUrl": "http://localhost:3000/admin/jobs/{jobId}"
   }
   ```

## Testing Checklist

- [ ] Suppliers table created with RLS
- [ ] Can search suppliers by location
- [ ] Can filter by category, verified, rating
- [ ] Can assign job to supplier
- [ ] Supplier can accept job
- [ ] Supplier can create quote
- [ ] Supplier can complete job (creates invoice)
- [ ] Payment creates Stripe Connect transfer
- [ ] Platform fee (1%) is deducted
- [ ] RLS prevents unauthorized access

## Common Issues

### "PostGIS extension not found"
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### "RLS policy violation"
- Check user is authenticated
- Verify user has access to the resource (admin owns condo, supplier owns supplier_user)

### "Stripe Connect not enabled"
- Set `STRIPE_CONNECT_ENABLED=true` in env
- Create Connect account for supplier first

### "Geospatial query fails"
- Verify coords are stored as GEOGRAPHY type
- Check PostGIS functions are available: `ST_DWithin`, `ST_MakePoint`

## Next Steps

See `SUPPLIER_MARKETPLACE_IMPLEMENTATION.md` for:
- Remaining features to implement
- UI components needed
- Testing requirements
- Acceptance criteria

