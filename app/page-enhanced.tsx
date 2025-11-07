'use client'

import Image from "next/image"
import Link from "next/link"
import { motion } from 'framer-motion'
import { Building2, Home as HomeIcon, Wrench, FileText, Wallet, MessageSquare, Users, Shield, Check, CheckCircle2, ArrowRight, Sparkles, Zap, Lock, Clock, TrendingUp, BarChart3, Globe, Award, Star } from 'lucide-react'

const BASE_SUBSCRIPTION_PRICE = 29.99
const PER_CONDO_PRICE = 8
const formatCurrency = (value: number) => `€${value.toFixed(2).replace('.', ',')}`
const pricingExamples = [1, 3, 5, 10].map((condos) => {
  const extra = PER_CONDO_PRICE * condos
  const label = condos === 1 ? 'condominio' : 'condomini'
  return {
    condos,
    total: formatCurrency(BASE_SUBSCRIPTION_PRICE + extra),
    desc: `${condos} ${label} (${formatCurrency(BASE_SUBSCRIPTION_PRICE)} + ${formatCurrency(extra)})`,
  }
})

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
              Prova Gratis per 30 Giorni
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center text-center min-h-screen z-0">
        {/* Background video */}
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            <Image
              src="/images/hero-building.jpg"
              alt=""
              fill
              className="object-cover"
              style={{ display: 'none' }}
              id="hero-fallback"
              priority
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
            <div className="absolute bottom-0 left-0 w-[45%] h-[20%] bg-[#1FA9A0]/20 blur-3xl"></div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl px-6">
          {/* Dark gradient overlay behind text only */}
          <div className="absolute inset-0 -z-10 pointer-events-none rounded-2xl" style={{ 
            top: '-2rem', 
            bottom: '-2rem', 
            left: '-1.5rem', 
            right: '-1.5rem',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)'
          }}></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="relative text-6xl font-extrabold drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-transparent bg-clip-text bg-gradient-to-r from-[#27C5B9] via-[#1FA9A0] to-[#FF8080]" style={{ filter: 'brightness(1.12)' }}>
              Tutto chiaro, finalmente.
            </h1>
            <p className="relative mt-6 text-xl text-gray-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Software gestionale condominiale tutto-in-uno che semplifica la vita di amministratori, condòmini e fornitori.
            </p>
            
            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#1FA9A0]" />
                <span>30 giorni gratis, senza carta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#1FA9A0]" />
                <span>Setup in 5 minuti</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#1FA9A0]" />
                <span>Supporto in italiano</span>
              </div>
            </div>

            <div className="mt-10 flex justify-center gap-6 flex-wrap">
              <Link href="/register">
                <button className="bg-[#1FA9A0] text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-[#17978E] transition text-lg">
                  Prova Gratis per 30 Giorni →
                </button>
              </Link>
              <Link href="/demo">
                <button className="bg-white/10 text-white font-semibold px-8 py-3 rounded-full backdrop-blur-md border border-white/20 hover:bg-[#1FA9A0] hover:border-[#1FA9A0] transition text-lg">
                  Guarda la Demo
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition - Clear Benefits */}
      <section className="relative z-20 bg-[#0E141B] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Perché Scegliere CondoChiaro?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              L'unica piattaforma che mette insieme tutto ciò che serve per gestire un condominio moderno
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: 'Risparmia 10+ Ore/Settimana',
                desc: 'Automazione intelligente elimina le attività ripetitive'
              },
              {
                icon: Zap,
                title: 'Setup in 5 Minuti',
                desc: 'Importa i dati dal tuo gestionale attuale senza perdere informazioni'
              },
              {
                icon: Sparkles,
                title: 'AI Integrata',
                desc: 'Riepilogo automatico documenti e assistente virtuale per risposte immediate'
              },
              {
                icon: Shield,
                title: 'Sicurezza GDPR',
                desc: 'Dati protetti con crittografia end-to-end e backup automatici'
              }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#1A1F26]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#1FA9A0]/50 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1FA9A0]/20 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-[#1FA9A0]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Clear and Compelling */}
      <section id="pricing" className="relative z-20 bg-gradient-to-b from-[#0E141B] to-[#111827] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Prezzi Semplici e Trasparenti
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Paghi solo per ciò che usi. Nessun costo nascosto, nessun impegno a lungo termine.
            </p>
          </motion.div>

          <div className="bg-[#1A1F26]/80 backdrop-blur-md rounded-3xl border-2 border-[#1FA9A0]/30 p-8 md:p-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1FA9A0]/10 border border-[#1FA9A0]/30 text-[#1FA9A0] text-sm font-semibold mb-4">
                <Sparkles className="h-4 w-4" />
                PIANO UNICO
              </div>
              <h3 className="text-3xl font-bold mb-2 text-white">Semplice e Conveniente</h3>
              <p className="text-gray-400">Adatto a condomini di ogni dimensione</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{formatCurrency(BASE_SUBSCRIPTION_PRICE)}</div>
                <div className="text-gray-400 mb-4">canone base mensile</div>
                <p className="text-sm text-gray-300">Comprende piattaforma, assistenza e attivazione</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{formatCurrency(PER_CONDO_PRICE)}</div>
                <div className="text-gray-400 mb-4">per ogni condominio gestito</div>
                <p className="text-sm text-gray-300">Addebito flessibile sulle strutture attive</p>
              </div>
            </div>

            <div className="bg-[#0E141B] rounded-xl p-6 mb-8">
              <h4 className="font-semibold mb-4 text-white">Esempi di Costo Mensile:</h4>
              <div className="space-y-3 text-sm">
                {pricingExamples.map((ex, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-300">{ex.desc}</span>
                    <span className="text-[#1FA9A0] font-semibold">{ex.total}/mese</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="font-semibold text-white mb-4">Incluso nel Piano:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Gestione illimitata di condomini, inquilini e fornitori',
                  'Documenti e archivio senza limiti',
                  'Sistema di pagamenti completo',
                  'AI: Riepilogo automatico PDF e assistente virtuale',
                  'Importazione dati da Excel/CSV',
                  'Report e analisi avanzate',
                  'Notifiche email automatiche',
                  'Supporto tecnico prioritario',
                  'Backup automatici giornalieri',
                  'Sicurezza GDPR compliant',
                  'Dashboard mobile responsive',
                  'API per integrazioni',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1FA9A0] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1FA9A0]/10 to-[#27C5B9]/10 rounded-xl p-6 border border-[#1FA9A0]/30 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Award className="h-6 w-6 text-[#1FA9A0]" />
                <h4 className="font-semibold text-white">30 Giorni di Prova Gratuita</h4>
              </div>
              <p className="text-sm text-gray-300">
                Prova tutte le funzionalità senza impegno. Nessuna carta di credito richiesta. Cancella quando vuoi.
              </p>
            </div>

            <div className="text-center">
              <Link href="/register">
                <button className="bg-[#1FA9A0] text-white font-semibold px-10 py-4 rounded-full text-lg hover:bg-[#17978E] transition shadow-lg">
                  Inizia la Prova Gratuita di 30 Giorni →
                </button>
              </Link>
              <p className="text-xs text-gray-400 mt-4">Nessuna carta di credito richiesta • Cancella quando vuoi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative z-20 bg-[#0E141B] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              Confronta con i Competitor
            </h2>
            <p className="text-gray-300 text-lg">
              Perché CondoChiaro è la scelta migliore per gestire il tuo condominio
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full bg-[#1A1F26]/80 backdrop-blur-md rounded-xl border border-white/10">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white font-semibold">Caratteristica</th>
                  <th className="text-center p-4 text-white font-semibold">CondoChiaro</th>
                  <th className="text-center p-4 text-gray-400">Danea Domustudio</th>
                  <th className="text-center p-4 text-gray-400">CondominioClick</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'AI - Riepilogo automatico documenti', condochiaro: true, others: false },
                  { feature: 'AI - Assistente virtuale integrato', condochiaro: true, others: false },
                  { feature: 'Interfaccia moderna e intuitiva', condochiaro: true, others: false },
                  { feature: 'Importazione automatica Excel/CSV', condochiaro: true, others: 'Parziale' },
                  { feature: 'Dashboard mobile responsive', condochiaro: true, others: true },
                  { feature: 'Notifiche email automatiche', condochiaro: true, others: true },
                  { feature: 'Gestione multi-condominio', condochiaro: true, others: 'Limitata' },
                  { feature: 'Supporto in italiano 24/7', condochiaro: true, others: 'Orari limitati' },
                  { feature: 'Prezzo trasparente (no costi nascosti)', condochiaro: true, others: false },
                  { feature: 'Prova gratuita 30 giorni', condochiaro: true, others: false },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4 text-gray-300">{row.feature}</td>
                    <td className="p-4 text-center">
                      <CheckCircle2 className="h-5 w-5 text-[#1FA9A0] mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-500">
                      {row.others === true ? <CheckCircle2 className="h-5 w-5 text-gray-600 mx-auto" /> : row.others === false ? <span className="text-red-400">✗</span> : <span className="text-yellow-400">{row.others}</span>}
                    </td>
                    <td className="p-4 text-center text-gray-500">
                      {row.others === true ? <CheckCircle2 className="h-5 w-5 text-gray-600 mx-auto" /> : row.others === false ? <span className="text-red-400">✗</span> : <span className="text-yellow-400">{row.others}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="relative z-20 bg-gradient-to-b from-[#111827] to-[#0E141B] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1FA9A0]/10 border border-[#1FA9A0]/30 text-[#1FA9A0] text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              INNOVAZIONE AI
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Potenziato dall'Intelligenza Artificiale
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Unici nel settore: CondoChiaro usa l'AI per semplificare la gestione condominiale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1A1F26]/80 backdrop-blur-md rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1FA9A0]/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-[#1FA9A0]" />
                </div>
                <h3 className="text-xl font-semibold text-white">Riepilogo Automatico Documenti</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Carichi un verbale di assemblea o un documento lungo? L'AI genera automaticamente un riepilogo conciso e chiaro, evidenziando punti chiave, decisioni prese e scadenze importanti.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1FA9A0]" />
                  Supporto PDF, Word, documenti di testo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1FA9A0]" />
                  Riepilogo in italiano, chiaro e professionale
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1FA9A0]" />
                  Evidenzia scadenze, decisioni e azioni richieste
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1A1F26]/80 backdrop-blur-md rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1FA9A0]/20 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-[#1FA9A0]" />
                </div>
                <h3 className="text-xl font-semibold text-white">Ask CondoChiaro - Assistente Virtuale</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Fai domande in linguaggio naturale e ricevi risposte immediate basate sui dati del tuo condominio. Come un assistente sempre disponibile.
              </p>
              <div className="bg-[#0E141B] rounded-lg p-4 mb-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-2">Esempi di domande:</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>"Chi non ha ancora pagato la quota di ottobre?"</li>
                  <li>"Quando scade la polizza assicurativa?"</li>
                  <li>"Quanti condomini gestisco attualmente?"</li>
                  <li>"Quali ticket di manutenzione sono aperti?"</li>
                </ul>
              </div>
              <p className="text-xs text-gray-400">
                ⚡ Risposte in tempo reale basate sui tuoi dati reali
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-20 bg-[#0E141B] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Domande Frequenti</h2>
            <p className="text-gray-300">Tutto ciò che vuoi sapere su CondoChiaro</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'Quanto tempo ci vuole per iniziare?',
                a: 'Solo 5 minuti! Puoi importare i dati dal tuo gestionale attuale (Excel, CSV) o inserirli manualmente. Il sistema è intuitivo e non richiede formazione.'
              },
              {
                q: 'Posso importare i dati dal mio gestionale attuale?',
                a: 'Sì! Supportiamo l\'importazione da file Excel e CSV. Basta esportare i dati dal tuo sistema attuale e CondoChiaro li importa automaticamente, riconoscendo colonne e formati.'
              },
              {
                q: 'Cosa succede ai miei dati se annullo?',
                a: 'Puoi esportare tutti i tuoi dati in qualsiasi momento in formato Excel o CSV. I tuoi dati ti appartengono e puoi portarli via quando vuoi.'
              },
              {
                q: 'I dati sono sicuri?',
                a: 'Assolutamente sì. Usiamo crittografia end-to-end, backup automatici giornalieri, e siamo completamente conformi al GDPR. I dati sono ospitati su server sicuri in Europa.'
              },
              {
                q: 'Funziona su mobile?',
                a: 'Sì, CondoChiaro è completamente responsive e funziona perfettamente su smartphone e tablet. Puoi gestire il condominio ovunque tu sia.'
              },
              {
                q: 'C\'è un limite al numero di documenti o inquilini?',
                a: 'No, nessun limite! Puoi caricare documenti illimitati e gestire quanti condomini, inquilini e fornitori vuoi. Il prezzo è basato solo sul numero di condomini gestiti.'
              },
              {
                q: 'Offrite supporto tecnico?',
                a: 'Sì, offriamo supporto prioritario in italiano via email e chat. Rispondiamo entro 24 ore lavorative (spesso molto prima).'
              },
              {
                q: 'Posso provare prima di pagare?',
                a: 'Assolutamente! Offriamo 30 giorni di prova gratuita completa, senza richiedere carta di credito. Prova tutte le funzionalità senza impegno.'
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#1A1F26]/80 backdrop-blur-md rounded-xl p-6 border border-white/10"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-300 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Multiple */}
      <section className="relative z-20 bg-gradient-to-b from-[#0E141B] via-[#111827] to-[#0E141B] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1FA9A0]/10 border border-[#1FA9A0]/30 text-[#1FA9A0] text-sm font-semibold mb-6">
              <Star className="h-4 w-4" />
              PIÙ DI 500 AMMINISTRATORI CI HANNO GIÀ SCELTO
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Pronto a Semplificare la Gestione del Tuo Condominio?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Unisciti agli amministratori che hanno già scelto CondoChiaro. Prova gratis per 30 giorni, senza carta di credito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/register">
                <button className="bg-[#1FA9A0] text-white font-semibold px-10 py-4 rounded-full text-lg hover:bg-[#17978E] transition shadow-lg w-full sm:w-auto">
                  Inizia Subito Gratis →
                </button>
              </Link>
              <Link href="/demo">
                <button className="bg-white/10 text-white font-semibold px-10 py-4 rounded-full backdrop-blur-md border border-white/20 text-lg hover:bg-[#1FA9A0] hover:border-[#1FA9A0] transition w-full sm:w-auto">
                  Guarda Demo Interattiva
                </button>
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              ✓ Nessuna carta di credito richiesta • ✓ Setup in 5 minuti • ✓ Cancella quando vuoi
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="border-t border-white/10 py-12 bg-[#0E141B]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/condochiaro-logo.png"
                  alt="CondoChiaro Logo"
                  width={120}
                  height={35}
                  className="object-contain"
                />
              </Link>
              <p className="text-gray-400 text-sm mb-4">
                La piattaforma di gestione condominiale più moderna e intuitiva d'Italia.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Lock className="h-4 w-4" />
                <span>GDPR Compliant • Backup Giornalieri</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Prodotto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-[#1FA9A0] transition-colors">Funzionalità</Link></li>
                <li><Link href="#pricing" className="hover:text-[#1FA9A0] transition-colors">Prezzi</Link></li>
                <li><Link href="/demo" className="hover:text-[#1FA9A0] transition-colors">Demo</Link></li>
                <li><Link href="#faq" className="hover:text-[#1FA9A0] transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Azienda</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/support" className="hover:text-[#1FA9A0] transition-colors">Supporto</Link></li>
                <li><Link href="/privacy" className="hover:text-[#1FA9A0] transition-colors">Privacy</Link></li>
                <li><a href="mailto:ciao@condochiaro.it" className="hover:text-[#1FA9A0] transition-colors">Contatti</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Risorse</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/support#docs" className="hover:text-[#1FA9A0] transition-colors">Documentazione</Link></li>
                <li><Link href="/support#faq" className="hover:text-[#1FA9A0] transition-colors">Centro Assistenza</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>© 2024 CondoChiaro. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
