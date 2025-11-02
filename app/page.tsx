'use client'

import Image from "next/image"
import Link from "next/link"
import { motion } from 'framer-motion'
import { Building2, Home as HomeIcon, Wrench, FileText, Wallet, MessageSquare, Users, Shield, Check, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Home() {
  const handleScrollToDemo = () => {
    const demoElement = document.getElementById('hero-video')
    demoElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main className="relative min-h-screen bg-[#0E141B] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-[#0E141B]/70 to-transparent backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/condochiaro-logo.png"
              alt="CondoChiaro Logo"
              width={120}
              height={35}
              className="object-contain h-auto"
              priority
            />
          </Link>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-200 hover:text-white font-medium">
              Accedi
            </Link>
            <Link
              href="/register"
              className="bg-[#1FA9A0] text-white font-semibold px-5 py-2.5 rounded-full hover:bg-[#17978E] transition"
            >
              Inizia Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center text-center min-h-screen z-0">
        {/* Background video */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-building.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ display: 'none' }}
            id="hero-fallback"
          />
          <video
            id="hero-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center top' }}
            onError={(e) => {
              const fallback = document.getElementById('hero-fallback')
              const video = e.currentTarget
              if (fallback) {
                fallback.style.display = 'block'
                video.style.display = 'none'
              }
            }}
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
            <source src="/videos/hero-video.mov" type="video/quicktime" />
            Il tuo browser non supporta il tag video.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20"></div>
          <div className="absolute top-0 right-0 w-[35%] h-[30%] bg-[#0E141B]/50 blur-lg"></div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl px-6">
          {/* Dark gradient overlay behind text only - fades from rgba(0,0,0,0.7) to transparent */}
          <div className="absolute inset-0 -z-10 pointer-events-none rounded-2xl" style={{ 
            top: '-2rem', 
            bottom: '-2rem', 
            left: '-1.5rem', 
            right: '-1.5rem',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)'
          }}></div>
          
          <h1 className="relative text-6xl font-extrabold drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-transparent bg-clip-text bg-gradient-to-r from-[#27C5B9] via-[#1FA9A0] to-[#FF8080]" style={{ filter: 'brightness(1.12)' }}>
            Tutto chiaro, finalmente.
          </h1>
          <p className="relative mt-6 text-xl text-gray-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Software gestionale condominiale tutto-in-uno che semplifica la vita di amministratori, condòmini e fornitori.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            <Link href="/register">
              <button className="bg-[#1FA9A0] text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-[#17978E] transition">
                Inizia Subito Gratis
              </button>
            </Link>
            <Link href="/demo">
              <button className="bg-white/10 text-white font-semibold px-8 py-3 rounded-full backdrop-blur-md border border-white/20 hover:bg-[#1FA9A0] hover:border-[#1FA9A0] transition">
                Guarda la Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Cards - Horizontal with Icons */}
      <section className="container mx-auto px-6 py-12 relative z-20 bg-[#0E141B]">
        <div className="grid md:grid-cols-3 gap-8 mt-16 px-8 max-w-6xl mx-auto">
          {/* Amministratore */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-full"
          >
            <Link href="/admin/dashboard" className="block h-full relative z-10">
              <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 hover:border-white/30 group role-card">
                <div className="flex items-center gap-4 mb-4 relative">
                  {/* Breathing glow effect */}
                  <motion.div
                    className="absolute -inset-2 rounded-xl bg-[#1FA9A0]/20 pointer-events-none"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {/* Icon container */}
                  <motion.div
                    className="bg-[#1FA9A0]/10 p-3 rounded-xl relative z-10 role-icon-container"
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <Building2 className="w-8 h-8 text-[#1FA9A0]" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-[#1FA9A0] relative z-10 group-hover:text-[#27C5B9] transition-colors duration-300">
                    Amministratore
                  </h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Dashboard personalizzata per amministratore
                </p>
                <div className="text-gray-300 group-hover:text-white flex items-center gap-2 font-medium transition-colors duration-300">
                  Anteprima dashboard →
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Condòmino */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-full"
          >
            <Link href="/tenant/dashboard" className="block h-full relative z-10">
              <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 hover:border-white/30 group role-card">
                <div className="flex items-center gap-4 mb-4 relative">
                  {/* Breathing glow effect */}
                  <motion.div
                    className="absolute -inset-2 rounded-xl bg-[#1FA9A0]/20 pointer-events-none"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {/* Icon container */}
                  <motion.div
                    className="bg-[#1FA9A0]/10 p-3 rounded-xl relative z-10 role-icon-container"
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <HomeIcon className="w-8 h-8 text-[#1FA9A0]" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-[#1FA9A0] relative z-10 group-hover:text-[#27C5B9] transition-colors duration-300">
                    Condòmino
                  </h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Dashboard personalizzata per condòmino
                </p>
                <div className="text-gray-300 group-hover:text-white flex items-center gap-2 font-medium transition-colors duration-300">
                  Anteprima dashboard →
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Fornitore */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-full"
          >
            <Link href="/supplier/dashboard" className="block h-full relative z-10">
              <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 hover:border-white/30 group role-card">
                <div className="flex items-center gap-4 mb-4 relative">
                  {/* Breathing glow effect */}
                  <motion.div
                    className="absolute -inset-2 rounded-xl bg-[#1FA9A0]/20 pointer-events-none"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {/* Icon container */}
                  <motion.div
                    className="bg-[#1FA9A0]/10 p-3 rounded-xl relative z-10 role-icon-container"
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <Wrench className="w-8 h-8 text-[#1FA9A0]" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-[#1FA9A0] relative z-10 group-hover:text-[#27C5B9] transition-colors duration-300">
                    Fornitore
                  </h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Dashboard personalizzata per fornitore
                </p>
                <div className="text-gray-300 group-hover:text-white flex items-center gap-2 font-medium transition-colors duration-300">
                  Anteprima dashboard →
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Visual Break */}
      <section id="about" className="relative my-20">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop"
          alt="Condominio moderno"
          className="w-full h-96 object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h3 className="text-3xl font-semibold text-foreground max-w-3xl px-6 drop-shadow-lg">
            Gestisci il tuo condominio in un'unica piattaforma
          </h3>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
            <h2 className="text-4xl font-bold mb-4 text-white">Funzionalità Complete</h2>
          <p className="text-gray-300 text-lg">
            Tutto ciò che serve per gestire il tuo condominio in un'unica piattaforma
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: 'Documenti', desc: 'Gestione e riepilogo automatico di tutti i documenti', href: '/admin/documents' },
            { icon: Wallet, title: 'Pagamenti', desc: 'Monitoraggio quote, rate e stato pagamenti in tempo reale', href: '/admin/payments' },
            { icon: Wrench, title: 'Manutenzioni', desc: 'Ticket e ordini di lavoro tra amministratori e fornitori', href: '/admin/maintenance' },
            { icon: MessageSquare, title: 'Comunicazioni', desc: 'Sistema ticketizzato bidirezionale per tutte le comunicazioni', href: '/admin/communications' },
            { icon: Users, title: 'Assemblee', desc: 'Gestione e organizzazione delle assemblee condominiali', href: '/admin/assemblies' },
            { icon: Shield, title: 'Assicurazione', desc: 'Monitoraggio polizze e promemoria di rinnovo automatici', href: '/admin/insurance' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={feature.href} className="block h-full group">
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 hover:border-[#1FA9A0]/60 h-full">
                  <feature.icon className="h-10 w-10 text-[#1FA9A0] mb-4" />
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#27C5B9] transition-colors">{feature.title}</h3>
                  <p className="text-gray-300">{feature.desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm text-[#1FA9A0] mt-6 group-hover:text-[#27C5B9]">
                    Vai alla sezione →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Migration Hook */}
      <section className="container mx-auto px-6 pt-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-3"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#1FA9A0]">
            Hai già un gestionale? Nessun problema.
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Con CondoChiaro trasferisci tutto in pochi clic — senza perdere alcun dato.
          </h2>
        </motion.div>
      </section>

      {/* Migration Section */}
      <section id="migration" className="bg-gradient-to-b from-[#0E141B] to-[#111827] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex justify-center"
          >
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <Image
                src="/images/migration-visual.png"
                alt="Migrazione Dati - Carica File Excel o CSV"
                width={600}
                height={600}
                className="max-w-full h-auto"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full md:w-1/2 text-center md:text-left space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1FA9A0]/10 border border-[#1FA9A0]/30 text-[#1FA9A0] text-xs font-semibold uppercase tracking-[0.25em]">
              Migrazione Facile dei Dati
            </span>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-300 via-teal-200 to-rose-300 bg-clip-text text-transparent">
              Passare a CondoChiaro è semplicissimo.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Carica il tuo file Excel o esporta i dati dal tuo vecchio gestionale: CondoChiaro importa automaticamente inquilini, fornitori, documenti e spese in meno di 2 minuti.
            </p>
            <ul className="space-y-3 text-gray-200 text-sm">
              {[
                'Supporta file Excel e CSV',
                'Riconoscimento automatico delle colonne',
                'Importazione completa di inquilini e appartamenti',
                'Anteprima e conferma dei dati prima del salvataggio',
                'Inviti automatici ai condòmini',
              ].map((item) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-3 md:items-center"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#1FA9A0] flex-shrink-0 mt-1 md:mt-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
            <div className="pt-4">
              <button
                onClick={handleScrollToDemo}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#1FA9A0] hover:bg-[#17978E] text-white font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1FA9A0]/60 focus-visible:ring-offset-[#0E141B]"
              >
                Guarda come funziona
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles with Background Images */}
      <section id="roles" className="bg-[#0E141B] py-20 relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Per Ogni Ruolo</h2>
            <p className="text-gray-300 text-lg">
              Dashboard personalizzate per ogni figura del condominio
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Amministratore',
                features: ['Gestione documenti', 'Monitoraggio pagamenti', 'Approvazione ticket', 'Report e analisi'],
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
                href: '/admin/dashboard',
                cta: 'Vai alla dashboard'
              },
              {
                title: 'Condòmino',
                features: ['Visualizza documenti', 'Consulta saldo', 'Segnala manutenzioni', 'Notifiche automatiche'],
                image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop',
                href: '/tenant/dashboard',
                cta: 'Area condòmini'
              },
              {
                title: 'Fornitore',
                features: ['Ticket assegnati', 'Ordini di lavoro', 'Invia fatture', 'Comunicazioni'],
                image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2076&auto=format&fit=crop',
                href: '/supplier/dashboard',
                cta: 'Area fornitori'
              },
            ].map((role, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 hover:border-white/30">
                  <img
                    src={role.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
                  />
                  <div className="relative">
                    <h3 className="text-2xl font-semibold mb-6">{role.title}</h3>
                    <ul className="space-y-3">
                      {role.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-[#1FA9A0]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={role.href}
                      className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-[#1FA9A0] hover:text-[#27C5B9]"
                    >
                      {role.cta} →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Automation */}
      <section id="automation" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Automazione Intelligente</h2>
            <p className="text-muted-foreground mb-4 text-lg">
              Riduci il tempo speso in burocrazia con strumenti intelligenti di automazione.
            </p>
            <ul className="space-y-3">
              {['Riepilogo automatico documenti PDF', 'Promemoria pagamenti', 'Notifiche assemblee', 'Countdown rinnovo assicurazioni'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#1FA9A0]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1FA9A0]/10 via-[#1FA9A0]/5 to-[#27C5B9]/10 rounded-2xl p-8 border border-[#1FA9A0]/20 relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#1FA9A0] rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#27C5B9] rounded-full blur-3xl"></div>
            </div>
            
            {/* Automation Cards */}
            <div className="relative space-y-4">
              {/* Document Auto-Summary Card */}
              <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1FA9A0]/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#1FA9A0]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Riepilogo Automatico</p>
                    <p className="text-xs text-muted-foreground">Verbale Assemblea analizzato</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Payment Reminder Card */}
              <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1FA9A0]/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#1FA9A0]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Promemoria Pagamenti</p>
                    <p className="text-xs text-muted-foreground">3 condòmini da notificare</p>
                  </div>
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">3</span>
                </div>
              </div>

              {/* Insurance Countdown Card */}
              <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1FA9A0]/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#1FA9A0]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Rinnovo Assicurazione</p>
                    <p className="text-xs text-muted-foreground">Scade tra 15 giorni</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1FA9A0] rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-[#0E141B] py-20 relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Cosa Dicono i Nostri Clienti</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Chiaro ha rivoluzionato la gestione del nostro condominio. Tutto è finalmente organizzato e accessibile.',
                author: 'Mario Rossi',
                role: 'Amministratore',
              },
              {
                quote: 'Come condòmino, posso consultare tutto in un attimo. Il saldo, i documenti, le assemblee. Perfetto!',
                author: 'Luisa Bianchi',
                role: 'Condòmino',
              },
              {
                quote: 'Come fornitore, la comunicazione con gli amministratori è diventata immediata e chiara.',
                author: 'Giuseppe Verdi',
                role: 'Fornitore',
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 text-white shadow-xl transition hover:bg-white/20 hover:border-white/30">
                  <p className="text-gray-300 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Prezzi Trasparenti</h2>
          <p className="text-gray-300 text-lg">
            Scegli il piano più adatto al tuo condominio
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: 'Free', price: '0', features: ['Fino a 10 unità', 'Documenti base', 'Comunicazioni'] },
            { name: 'Pro', price: '99', features: ['Unità illimitate', 'Tutte le funzionalità', 'Supporto prioritario', 'Report avanzati'] },
            { name: 'Enterprise', price: 'Custom', features: ['Personalizzazione', 'API access', 'Account manager', 'SLA garantito'] },
          ].map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className={`rounded-2xl border bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 ${idx === 1 ? 'border-[#1FA9A0] border-2' : 'border-white/20'} hover:border-white/30`}>
                <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price === 'Custom' ? 'Su misura' : `€${plan.price}`}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/mese</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-[#1FA9A0]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full">
                  <button className={`w-full py-2.5 rounded-full font-semibold transition ${idx === 1 ? 'bg-[#1FA9A0] text-white hover:bg-[#17978E]' : 'bg-white/10 text-white border border-white/20 hover:bg-[#1FA9A0] hover:border-[#1FA9A0]'}`}>
                    Inizia Ora
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-border py-20 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2096&auto=format&fit=crop"
          alt="Skyline residenziale"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-primary/5 to-background" />
        <div className="container mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Porta il tuo condominio nel futuro digitale
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Inizia oggi stesso a semplificare la gestione del tuo condominio
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <button className="bg-[#1FA9A0] text-white font-semibold px-8 py-3 rounded-full text-lg hover:bg-[#17978E] transition">
                  Inizia Subito
                </button>
              </Link>
              <Link href="/demo">
                <button className="bg-white/10 text-white font-semibold px-8 py-3 rounded-full backdrop-blur-md border border-white/20 text-lg hover:bg-[#1FA9A0] hover:border-[#1FA9A0] transition">
                  Prenota una Demo
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/condochiaro-logo.png"
                  alt="CondoChiaro Logo"
                  width={30}
                  height={30}
                  className="object-contain"
                />
                <span className="text-sm font-semibold text-white">CONDOCHIARO</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                Gestione condominiale, finalmente chiara.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Funzionalità
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Prezzi
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-white transition-colors">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Azienda</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#about" className="hover:text-white transition-colors">
                    Chi siamo
                  </Link>
                </li>
                <li>
                  <a href="mailto:ciao@condochiaro.com" className="hover:text-white transition-colors">
                    Contatti
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Supporto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/support#docs" className="hover:text-white transition-colors">
                    Documentazione
                  </Link>
                </li>
                <li>
                  <Link href="/support#faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support#contact" className="hover:text-white transition-colors">
                    Supporto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Chiaro. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
