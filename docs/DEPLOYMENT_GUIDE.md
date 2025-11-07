# CondoChiaro Deployment Guide

**Version:** 1.0.0  
**Last Updated:** 2025-11-02

---

## 🎯 Overview

This guide covers deploying CondoChiaro to staging and production environments with zero-downtime deployments.

---

## 📋 Prerequisites

- Supabase account (2 projects: staging + production)
- Vercel account
- Stripe account (test + live modes)
- Domain names configured
- Environment variables documented

---

## 🧩 Staging Environment Setup

### 1. Create Staging Supabase Project

1. Go to Supabase Dashboard
2. Create new project: `condochiaro-staging`
3. Run database schema:
   ```bash
   # Copy database/schema.sql content
   # Paste into Supabase SQL Editor
   # Execute
   ```
4. Configure Storage buckets:
   - `migration-files` (public: false)
   - `condominium-images` (public: false)
   - `documents` (public: false)

### 2. Configure Staging Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://condochiaro-staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
STRIPE_BASE_PRICE_ID=price_base_test_...
STRIPE_CONDOMINIUM_PRICE_ID=price_condo_test_...
STRIPE_SUPPLIER_PRO_PRICE_ID=price_supplier_pro_test_...

BASE_FEE=29.99
PER_CONDO_FEE=8
PLATFORM_FEE_PERCENT=1.0
STRIPE_CONNECT_ENABLED=true
STRIPE_SUPPLIER_PRO_PRICE=9.99
STRIPE_CARD_FEE_PERCENT=0.25
STRIPE_DEFAULT_CURRENCY=eur

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.condochiaro.it

CRON_SECRET=your-secure-random-token
DELETE_CONFIRMATION_TOKEN=another-secure-token
```

### 3. Configure Staging Domain

1. In Vercel → Project Settings → Domains
2. Add: `staging.condochiaro.it`
3. Configure DNS:
   - Add CNAME: `staging` → `cname.vercel-dns.com`

### 4. Set Up Staging Branch Deployment

1. In Vercel → Project Settings → Git
2. Configure:
   - Production Branch: `main`
   - Preview Branches: `develop`
   - Auto-deploy: Enabled for `main` → staging

---

## 🚀 Production Environment Setup

### 1. Create Production Supabase Project

1. Create project: `condochiaro-production`
2. Run identical schema from `database/schema.sql`
3. Set up Storage buckets (same as staging)
4. **Important:** Configure automatic daily backups

### 2. Configure Production Environment Variables

**Critical:** Use production keys, not test keys!

```
NEXT_PUBLIC_SUPABASE_URL=https://condochiaro-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key

STRIPE_SECRET_KEY=sk_live_...  # ⚠️ LIVE KEY
STRIPE_PUBLISHABLE_KEY=pk_live_...  # ⚠️ LIVE KEY
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_BASE_PRICE_ID=price_base_live_...
STRIPE_CONDOMINIUM_PRICE_ID=price_condo_live_...
STRIPE_SUPPLIER_PRO_PRICE_ID=price_supplier_pro_live_...

BASE_FEE=29.99
PER_CONDO_FEE=8
PLATFORM_FEE_PERCENT=1.0
STRIPE_CONNECT_ENABLED=true
STRIPE_SUPPLIER_PRO_PRICE=9.99
STRIPE_CARD_FEE_PERCENT=0.25
STRIPE_DEFAULT_CURRENCY=eur

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://condochiaro.it

CRON_SECRET=different-secure-random-token
DELETE_CONFIRMATION_TOKEN=different-secure-token
```

### 3. Configure Production Domain

1. Add domain: `condochiaro.it`
2. Configure DNS:
   - A record or CNAME pointing to Vercel
3. SSL certificates auto-provisioned by Vercel

### 4. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint:
   - **Staging:** `https://staging.condochiaro.it/api/webhooks/stripe`
   - **Production:** `https://condochiaro.it/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to environment variables

---

## 🔄 Deployment Workflow

### Staging Deployment (Automatic)

```bash
# 1. Push to main branch
git push origin main

# 2. Vercel auto-deploys to staging
# 3. Verify deployment:
curl https://staging.condochiaro.it/api/health

# 4. Run tests:
npm run test:e2e -- --baseURL=https://staging.condochiaro.it

# 5. Manual QA pass
```

### Production Deployment (Manual Promotion)

1. **Verify staging is healthy:**
   ```bash
   curl https://staging.condochiaro.it/api/health
   ```

2. **Promote in Vercel:**
   - Go to Vercel Dashboard
   - Find latest staging deployment
   - Click "Promote to Production"

3. **Verify production:**
   ```bash
   curl https://condochiaro.it/api/health
   ```

4. **Monitor:**
   - Check Sentry for errors
   - Monitor Stripe webhooks
   - Verify database connections

---

## 🔒 Zero-Downtime Deployment

Vercel provides zero-downtime deployments by default:

1. **Preview Deployments:** Test on preview URLs before promoting
2. **Production Promotions:** Instant switch to new version
3. **Rollback:** Previous deployments retained for instant rollback

### Rollback Procedure

```bash
# Via Vercel Dashboard:
1. Go to Deployments
2. Find previous stable deployment
3. Click "Promote to Production"
```

Or via CLI:
```bash
vercel rollback [deployment-url]
```

---

## 📊 Post-Deployment Verification

### Health Checks

```bash
# API Health
curl https://condochiaro.it/api/health

# Expected response:
{
  "success": true,
  "message": "All systems operational",
  "data": {
    "database": true,
    "stripe": true,
    "timestamp": "2025-11-02T..."
  }
}
```

### Functional Checks

- [ ] Admin can login
- [ ] Can create condominium
- [ ] Can upload document
- [ ] Can invite tenant
- [ ] Stripe webhooks working
- [ ] Cron jobs executing (check logs)

### Performance Checks

- [ ] Dashboard loads < 1.5s
- [ ] API responses < 500ms (p95)
- [ ] No console errors
- [ ] Images load correctly

---

## 🔐 Security Checklist

- [ ] Environment variables secured (never commit)
- [ ] API routes have proper auth
- [ ] CORS configured correctly
- [ ] RLS policies active
- [ ] Signed URLs expiring properly
- [ ] Webhook signatures verified
- [ ] HTTPS enforced (Vercel default)

---

## 📝 Versioning

### Semantic Versioning

Update version in `package.json`:
```json
{
  "version": "1.0.0"
}
```

### Changelog

Maintain `CHANGELOG.md` in dashboard footer or `/changelog` page.

---

## 🚨 Emergency Procedures

See `docs/INCIDENT_RESPONSE.md` for:
- Maintenance mode activation
- Rollback procedures
- Database restore
- Communication protocols

---

## ✅ Pre-Launch Checklist

Before going live:

- [ ] Staging environment fully tested
- [ ] Production database schema deployed
- [ ] All environment variables set
- [ ] Stripe webhooks configured
- [ ] Domain DNS configured
- [ ] SSL certificates active
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Incident response plan ready
- [ ] Team trained on procedures

---

## 📞 Support

- **Vercel Issues:** support@vercel.com
- **Supabase Issues:** support@supabase.io
- **Stripe Issues:** support@stripe.com





