# CondoChiaro - Software Gestione Condominiale

CondoChiaro è una piattaforma SaaS tutto-in-uno per la gestione condominiale in Italia, progettata per semplificare la comunicazione, la gestione documentale, i pagamenti e la manutenzione per amministratori, condòmini e fornitori.

## 🚀 Funzionalità Principali

### Per Amministratori di Condominio
- ✅ Gestione multi-condominio con dashboard centralizzata
- ✅ Upload e organizzazione documenti (verbali, polizze, fatture)
- ✅ Gestione condòmini e unità immobiliari
- ✅ Sistema pagamenti con tracking scadenze
- ✅ Gestione fornitori e interventi
- ✅ Migration wizard per importazione da Excel/CSV
- ✅ Riepiloghi AI automatici per documenti PDF
- ✅ Sistema di abbonamento con fatturazione italiana

### Per Condòmini
- ✅ Accesso personale a documenti condominiali
- ✅ Visualizzazione stato pagamenti e scadenze
- ✅ Invio richieste manutenzione
- ✅ Download polizze e verbali assemblea

### Per Fornitori
- ✅ Gestione interventi assegnati
- ✅ Caricamento fatture e reminder pagamenti
- ✅ Aggiornamento stato lavori

## 🛠️ Stack Tecnologico

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, ShadCN, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Pagamenti**: Stripe con fatturazione forfettaria italiana
- **AI**: OpenAI GPT-4 per riassunti documenti
- **Email**: Resend per notifiche
- **Hosting**: Vercel

## 📋 Prerequisiti

- Node.js 18+
- Account Supabase
- Account Stripe (opzionale per pagamenti)
- Account OpenAI (opzionale per funzionalità AI)

## 🚀 Setup Rapido

### 1. Installa le Dipendenze

```bash
npm install
```

### 2. Configura le Variabili d'Ambiente

Copia il file di esempio:

```bash
cp .env.local.example .env.local
```

Configura le variabili necessarie:

```env
# Supabase (necessario)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (opzionale)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (opzionale)
OPENAI_API_KEY=sk-...

# Email (opzionale)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@condochiaro.it

# Feature Flags
NEXT_PUBLIC_AI_FEATURES_ENABLED=false
NEXT_PUBLIC_STRIPE_ENABLED=false
```

### 3. Setup Database Supabase

1. Crea un nuovo progetto Supabase
2. Esegui lo schema SQL:

```bash
node scripts/deploy-db.js
```

### 4. Avvia l'Applicazione

```bash
npm run dev
```

Visita `http://localhost:3000`

## 🔐 Autenticazione e Ruoli

Il sistema supporta 3 ruoli:

- **Admin**: Accesso completo a tutti i condomini gestiti
- **Tenant**: Accesso limitato ai propri dati e documenti
- **Supplier**: Accesso a interventi e fatture assegnate

## 💳 Sistema Pagamenti

- **Piano Base**: €19.99/mese per amministratore
- **Condomini Aggiuntivi**: €6/mese per condominio
- **Trial**: 30 giorni gratuiti
- **Fatturazione**: Automatica con formato forfettario italiano

## 🤖 Funzionalità AI

- **Riepiloghi Documenti**: Analisi automatica PDF per generare riassunti concisi
- **Lingua**: Supporto completo italiano
- **Limitazione**: 20 riassunti/mese per utenti free, illimitati per abbonati

## 📊 Monitoraggio

Sistema di monitoraggio inclusivo:
- Health check endpoint: `/api/health`
- Error tracking e logging
- Performance monitoring

## 🔒 Sicurezza

- Row Level Security (RLS) su Supabase
- Autenticazione con Supabase Auth
- Validazione input completa
- CORS configurato
- Security headers implementati
- GDPR compliant

## 🇮🇹 Conformità Italiana

- Fatturazione forfettaria italiana
- Validazione codice fiscale
- Privacy policy italiana
- Terminologia e UI in italiano

## 🚀 Deployment

### Vercel (Consigliato)

1. Connetti repository a Vercel
2. Configura variabili d'ambiente
3. Deploy automatico su `main` branch

## 📝 Sviluppo

```bash
# Sviluppo
npm run dev

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

---

**CondoChiaro** © 2024 - Gestione condominiale semplice, moderna e trasparente.