// @ts-nocheck
/* eslint-disable */
'use client'

if (typeof window !== 'undefined') {
  // @ts-ignore
  Number.prototype.toLocaleString = function() {
    return this.toString()
  }
}

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Gift,
  Headphones,
  Home as HomeIcon,
  MessageSquare,
  PieChart,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Wallet,
  Wrench,
  Send,
} from 'lucide-react'

export default function Home() {
  const handleScrollToDemo = () => {
    const demoElement = document.getElementById('hero-video')
    demoElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Per favore compila tutti i campi obbligatori')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'invio del messaggio')
      }

      toast.success('Messaggio inviato con successo! Ti risponderemo al più presto.')
      setContactForm({ name: '', email: '', subject: '', message: '' })
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast.error(error.message || 'Si è verificato un errore. Riprova più tardi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const heroHighlights = [
    'Onboarding 1-to-1 incluso',
    'Migrazione dati curata dal nostro team',
    'Processo quando vuoi, zero pensieri',
  ]

  const roleCards = [
    {
      title: 'Amministratore',
      subtitle: 'Centralizza ufficio e collaboratori',
      features: [
        'Bilanci e cashflow aggiornati in tempo reale',
        'Ticket assegnati ai fornitori in automatico',
        'Report immediati per assemblee e revisori',
      ],
      image:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
      href: '/admin/dashboard',
      cta: 'Esplora area amministratori',
      icon: Building2,
      delay: 0.2,
    },
    {
      title: 'Condòmino',
      subtitle: 'Trasparenza totale h24',
      features: [
        'Estratti conto sempre aggiornati',
        'Storico comunicazioni e ticket',
        'Pagamenti online in un clic',
      ],
      image:
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop',
      href: '/tenant/dashboard',
      cta: 'Area condòmini',
      icon: HomeIcon,
      delay: 0.3,
    },
    {
      title: 'Fornitore',
      subtitle: 'Interventi organizzati e tracciati',
      features: [
        'Ordini di lavoro con SLA e foto',
        'Fatture e checklist collegati ai ticket',
        'Cronologia interventi per condominio',
      ],
      image:
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2076&auto=format&fit=crop',
      href: '/supplier/dashboard',
      cta: 'Area fornitori',
      icon: Wrench,
      delay: 0.4,
    },
  ]

  const valueProps = [
    {
      title: 'Trasparenza per ogni condòmino',
      description:
        "Area riservata con documenti, estratti conto e storico comunicazioni senza telefonate ripetitive.",
      metric: '−81% richieste via telefono',
    },
    {
      title: 'Incassi puntuali e verificabili',
      description:
        'Sincronizzazione con il conto corrente e promemoria automatici: sai sempre chi ha pagato e quando.',
      metric: '98% quote incassate entro la scadenza',
    },
    {
      title: 'Manutenzioni gestite senza stress',
      description:
        'Trova fornitori qualificati nella tua zona, assegna interventi e monitora lo stato in tempo reale. Tutto tracciato e documentato.',
      metric: '−65% tempo speso in coordinamento',
    },
  ]

  const featureCards = [
    {
      icon: FileText,
      title: 'Bilanci & documenti',
      desc: 'Genera pacchetti assembleari, riparti spese e condividi automaticamente con i consiglieri.',
      href: '/admin/documents',
    },
    {
      icon: Wallet,
      title: 'Pagamenti senza stress',
      desc: 'Quote, rate e incassi monitorati in tempo reale con promemoria multicanale automatici.',
      href: '/admin/payments',
    },
    {
      icon: MessageSquare,
      title: 'Comunicazioni chiare',
      desc: 'Ticket e broadcast multicanale per evitare chat disperse e garantire tracciabilità legale.',
      href: '/admin/communications',
    },
    {
      icon: Users,
      title: 'Assemblee ibride',
      desc: 'Convocazioni smart, gestione presenze e votazioni certificate anche a distanza.',
      href: '/admin/assemblies',
    },
    {
      icon: Shield,
      title: 'Conformità e sicurezza',
      desc: 'Log attività, ruoli granulari e backup crittografati su cloud europeo.',
      href: '/admin/insurance',
    },
    {
      icon: Wrench,
      title: 'Manutenzioni tracciate',
      desc: 'Dalla segnalazione all’intervento con SLA, checklist e collaudo fotografico.',
      href: '/admin/maintenance',
    },
  ]

  const processSteps = [
    {
      icon: Upload,
      title: 'Invia i dati esistenti',
      description:
        'Carica Excel/CSV o condividi l’accesso al vecchio gestionale: ricevi un template già precompilato.',
    },
    {
      icon: Sparkles,
      title: 'Noi li puliamo e importiamo',
      description:
        'Un consulente CondoChiaro normalizza le anagrafiche, associa unità e verifica duplicati entro 48 ore.',
    },
    {
      icon: PieChart,
      title: 'Vai live con tutti gli accessi',
      description:
        'Condòmini e fornitori ricevono inviti automatici, tu monitori tutto da un’unica dashboard.',
    },
  ]

  const offerHighlights = [
    {
      title: '14 giorni gratuiti',
      description: 'Provalo senza carta di credito. Se non ti convince, disdici in un clic.',
    },
    {
      title: 'Onboarding personale',
      description: 'Un esperto migra i tuoi primi condomini e configura modelli di comunicazione.',
    },
    {
      title: 'Garanzia soddisfatti o rimborsati',
      description: 'Se entro 60 giorni non riduci il lavoro manuale, ti rimborsiamo il primo mese Pro.',
    },
  ]

  const supportHighlights = [
    {
      title: 'Consulente dedicato',
      description: 'Setup guidato, pianificazione assemblee e formazione del team inclusi.',
      stat: 'Risposta media: 2h',
    },
    {
      title: 'Supporto WhatsApp & email',
      description: 'Canale diretto con specialisti CondoChiaro per gestire casi complessi in tempo reale.',
      stat: 'Copertura: 6/7 giorni',
    },
    {
      title: 'Template pronti',
      description: 'Kit di comunicazioni, verbali e piani di manutenzione sempre aggiornati.',
      stat: 'Aggiornamenti ogni settimana',
    },
  ]

  const faqItems = [
    {
      question: 'Quanto tempo serve per passare a CondoChiaro?',
      answer:
        'Dipende dal numero di condomini: in media 3 giorni lavorativi per studi fino a 20 stabili, grazie all’import assistito e alla pulizia dati fatta da noi.',
    },
    {
      question: 'I miei condòmini devono scaricare un’app?',
      answer:
        'No, colleghiamo tutti tramite area web responsive e inviamo notifiche via email, SMS e WhatsApp Business senza costi extra.',
    },
    {
      question: 'Posso integrare CondoChiaro con la contabilità esistente?',
      answer:
        'Sì, esportiamo movimenti in formati compatibili con i principali software contabili e offriamo API per studi strutturati.',
    },
    {
      question: 'Come funziona la garanzia di rimborso?',
      answer:
        'Se entro 60 giorni non riscontri una riduzione del lavoro manuale, basta scriverci: rimborsiamo il primo mese Pro, senza domande.',
    },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '0',
      period: '/mese',
      description: 'Per testare il flusso con un condominio pilota.',
      features: ['Fino a 10 unità', 'Documenti condivisi', 'Ticket e comunicazioni base'],
      badge: 'Prova gratuita',
      highlight: 'Perfetto per iniziare oggi',
    },
    {
      name: 'Pro',
      price: '29,99',
      pricePerUnit: '8',
      period: '/mese',
      description: 'Per studi fino a 50 condomini che vogliono digitalizzare ogni processo.',
      features: [
        'Unità illimitate',
        'Automazioni pagamenti e reminder',
        'Assemblee ibride con verbali automatici',
        'Supporto prioritario 6/7',
      ],
      badge: 'Più scelto',
      highlight: 'Promo lancio: −20% per i primi 12 mesi',
    },
    {
      name: 'Enterprise',
      price: 'Su misura',
      description: 'Per realtà strutturate con team multipli e processi complessi.',
      features: [
        'Account manager dedicato',
        'API e single sign-on',
        'Integrazione contabile avanzata',
        'SLA garantito & formazione on-site',
      ],
      badge: undefined,
      highlight: 'Richiedi un piano personalizzato',
    },
  ]

  return (
    <main className="relative min-h-screen bg-[#0E141B] text-white">
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-[#0E141B]/80 to-transparent backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/condochiaro-logo.png"
              alt="CondoChiaro Logo"
              width={120}
              height={120}
              className="object-contain h-auto"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-200">
            <Link href="#features" className="hover:text-white transition">
              Funzionalità
            </Link>
            <Link href="#offer" className="hover:text-white transition">
              Offerta
            </Link>
            <Link href="#faq" className="hover:text-white transition">
              FAQ
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-200 hover:text-white font-medium">
              Accedi
            </Link>
            <Link
              href="/register"
              className="bg-[#1FA9A0] text-white font-semibold px-5 py-2.5 rounded-full hover:bg-[#17978E] transition"
            >
              Iscriviti
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex flex-col justify-center items-center text-center" style={{ height: '100vh', background: 'linear-gradient(180deg, #101820 0%, #1b1f24 100%)' }}>
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1527030280862-64139fba04ca?q=80&w=2070&auto=format&fit=crop"
              alt="Skyline condominiale"
              fill
              className="object-cover"
              style={{ display: 'none', filter: 'brightness(0.85) contrast(1.1)' }}
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
              style={{ objectPosition: 'center top', filter: 'brightness(0.95) contrast(1.15)' }}
              onError={(e) => {
                const fallback = document.getElementById('hero-fallback')
                const video = e.currentTarget
                if (fallback) {
                  fallback.style.display = 'block'
                  video.style.display = 'none'
                }
              }}
            >
              <source src="/videos/CondoHeroSection.mp4" type="video/mp4" />
              Il tuo browser non supporta il tag video.
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-transparent opacity-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 70%, transparent 100%)' }}></div>
          <div className="absolute inset-0 bg-black/5 opacity-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.05) 70%, transparent 100%)' }}></div>
          <div className="absolute top-0 right-0 w-[35%] h-[30%] bg-[#0E141B]/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-[50%] h-[20%] bg-[#1FA9A0]/5 blur-3xl"></div>
          <div className="absolute inset-0 bg-[#0E141B]/5 opacity-100" style={{ background: 'linear-gradient(to bottom, rgba(14,20,27,0.05) 0%, rgba(14,20,27,0.05) 70%, transparent 100%)' }}></div>
          <div className="absolute bottom-0 inset-x-0 h-[600px] bg-gradient-to-b from-transparent via-[#101820]/20 via-[#101820]/50 via-[#101820]/80 to-[#101820]"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-6 w-full flex flex-col items-center justify-center">
          <div
            className="absolute inset-0 -z-10 pointer-events-none rounded-2xl"
            style={{
              top: '-2rem',
              bottom: '-2rem',
              left: '-1.5rem',
              right: '-1.5rem',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.3), transparent)',
            }}
          ></div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl lg:text-4xl font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-tight px-4"
            style={{ filter: 'brightness(1.12)' }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#27C5B9] via-[#1FA9A0] to-[#1FA9A0]">
              Il gestionale condominiale che elimina il lavoro manuale, non il tuo{' '}
            </span>
            <span className="text-[#FF8080]">tempo.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 md:mt-5 text-sm md:text-base text-gray-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] px-4"
          >
            CondoChiaro unisce incassi, documenti, assemblee e manutenzioni in un unico spazio digitale
            pensato per amministratori italiani. Setup completo in 48 ore.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 md:mt-6 flex flex-wrap justify-center gap-2 md:gap-3"
          >
            <Link href="/register">
              <button className="bg-[#1FA9A0] text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full shadow-lg hover:bg-[#17978E] transition text-sm md:text-base">
                Attiva la prova gratuita
              </button>
            </Link>
            <Link href="/demo/select">
              <button
                className="bg-white/10 text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full backdrop-blur-md border border-white/20 hover:bg-[#1FA9A0] hover:border-[#1FA9A0] transition text-sm md:text-base"
              >
                Guarda la demo guidata
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 md:mt-5 flex flex-wrap justify-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-100"
          >
            {heroHighlights.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1 md:gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 md:px-3 py-1 md:py-1.5 backdrop-blur"
              >
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-[#1FA9A0]" />
                {item}
              </span>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-4 md:mt-5 text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/50"
          >
            {!isMounted ? 'Loading...' : 'Già scelto da studi che gestiscono oltre ottomila unità residenziali in Italia'}
          </motion.p>
        </div>
      </section>

      <section id="about" className="relative h-[60vh] md:h-[70vh] pt-12 md:pt-16 pb-12 md:pb-16 flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #101820 0%, #1b1f24 100%)' }}>
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/images/condoimage.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#101820]/30 via-[#101820]/20 via-[#101820]/15 to-[#101820]/25"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl">
          <h3 className="text-3xl md:text-4xl font-semibold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] max-w-3xl leading-tight">
            Finalmente un gestionale che parla la lingua dei tuoi condòmini e ti lascia spazio per far
            crescere lo studio.
          </h3>
        </div>
      </section>

      <section id="roles" className="bg-[#0E141B] py-20 relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Ogni ruolo ha ciò che serve</h2>
            <p className="text-gray-300 text-lg">
              Dashboard dedicate per amministratori, condòmini e fornitori, con permessi e flussi su misura.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roleCards.map((role, idx) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: role.delay }}
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 hover:border-white/30">
                  <role.icon className="h-10 w-10 text-[#1FA9A0]" />
                  <p className="mt-3 text-sm uppercase tracking-[0.3em] text-[#1FA9A0]">{role.subtitle}</p>
                  <h3 className="text-2xl font-semibold mt-4">{role.title}</h3>
                  <ul className="space-y-3 mt-6">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
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
                  <Image
                    src={role.image}
                    alt=""
                    fill
                    className="absolute inset-0 object-cover opacity-10 blur-sm pointer-events-none"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1FA9A0]/10 border border-[#1FA9A0]/30 text-[#1FA9A0] text-xs font-semibold uppercase tracking-[0.25em]">
            Risultati concreti
          </span>
          <h2 className="text-4xl font-bold mt-4 text-white">Perché gli amministratori scelgono CondoChiaro</h2>
          <p className="text-gray-300 text-lg mt-3">
            Non solo un software: un metodo per dare risposte immediate e generare fiducia condominiale.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((value, idx) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="rounded-2xl border-2 border-[#1FA9A0]/40 bg-gradient-to-br from-white/10 via-white/5 to-white/5 backdrop-blur-md p-10 shadow-2xl hover:border-[#1FA9A0]/60 hover:shadow-[#1FA9A0]/20 transition-all duration-300"
            >
              <div className="mb-6">
                <p className="text-lg font-bold text-[#1FA9A0] uppercase tracking-[0.25em] mb-2">{value.metric}</p>
                <div className="h-1 w-16 bg-gradient-to-r from-[#1FA9A0] to-[#27C5B9] rounded-full"></div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-5 leading-tight">{value.title}</h3>
              <p className="text-lg text-gray-200 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Funzionalità con impatto immediato</h2>
          <p className="text-gray-300 text-lg">
            Tutto ciò che serve, dall’anagrafica alla rendicontazione, senza passare da dieci strumenti diversi.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={feature.href} className="block h-full group">
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 text-white shadow-xl transition hover:bg-white/20 hover:border-[#1FA9A0]/60 h-full">
                  <feature.icon className="h-10 w-10 text-[#1FA9A0] mb-4" />
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-[#27C5B9] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm text-[#1FA9A0] mt-6 group-hover:text-[#27C5B9]">
                    Scopri la sezione →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

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
            Passa a CondoChiaro senza stress: migriamo noi i dati, informiamo noi i condòmini.
          </h2>
        </motion.div>
      </section>

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
              Migrazione assistita
            </span>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-300 via-teal-200 to-rose-300 bg-clip-text text-transparent">
              Passare a CondoChiaro è semplicissimo.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Ti assegniamo subito un migration specialist che pulisce i file, abbina unità e genera gli accessi
              corretti. Niente copie manuali, niente ore perse a rincorrere dati mancanti.
            </p>
            <ul className="space-y-3 text-gray-200 text-sm">
              {[
                'Supporta file Excel, CSV e database legacy',
                'Riconoscimento automatico delle colonne e normalizzazione IBAN',
                'Importazione completa di inquilini, fornitori, documenti e fondi',
                'Anteprima e conferma condivisa prima del go-live',
                'Inviti automatici ai condòmini su email, SMS e WhatsApp',
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
            <div className="pt-4 flex flex-wrap gap-4">
              <Link href="/demo/select">
                <button
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#1FA9A0] hover:bg-[#17978E] text-white font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1FA9A0]/60 focus-visible:ring-offset-[#0E141B]"
                >
                  Guarda come funziona
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/admin/migration" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:border-[#1FA9A0] text-white font-semibold transition">
                Avvia migrazione guidata
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="setup" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white">Dall’account alla piena operatività in 3 step</h2>
          <p className="text-gray-300 text-lg mt-3">
            Ti affianchiamo in ogni fase: tu ti concentri sui condomini, noi sul setup.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {processSteps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6 shadow-lg"
            >
              <step.icon className="h-10 w-10 text-[#1FA9A0]" />
              <h3 className="text-xl font-semibold mt-4">{step.title}</h3>
              <p className="text-gray-300 mt-3">{step.description}</p>
              <div className="mt-4 text-sm text-white/60 uppercase tracking-[0.3em]">Step {idx + 1}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="automation" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-6">Automazioni intelligenti che fanno il lavoro sporco</h2>
            <p className="text-muted-foreground mb-4 text-lg">
              Riduci il tempo speso in burocrazia con processi automatici pensati per gli studi di
              amministrazione.
            </p>
            <ul className="space-y-3">
              {[
                'Riepilogo automatico dei documenti PDF con generazione del verbale sintetico',
                'Promemoria pagamenti multicanale con link di incasso',
                'Countdown rinnovo assicurazioni e scadenze fornitori',
                'Alert smart per rate condominiali e fondi cassa sotto soglia',
              ].map((item, idx) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#1FA9A0] mt-1" />
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
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#1FA9A0] rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#27C5B9] rounded-full blur-3xl"></div>
            </div>
            <div className="relative space-y-4">
              <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1FA9A0]/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#1FA9A0]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Riepilogo automatico</p>
                    <p className="text-xs text-muted-foreground">Verbale assemblea pronto per la firma</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1FA9A0]/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#1FA9A0]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Promemoria pagamenti</p>
                    <p className="text-xs text-muted-foreground">3 condòmini da notificare</p>
                  </div>
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">3</span>
                </div>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1FA9A0]/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#1FA9A0]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Rinnovo assicurazione</p>
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

      <section id="testimonials" className="bg-[#0E141B] py-20 relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Cosa dicono gli studi che ci hanno scelto</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'In 30 giorni abbiamo migrato 28 condomini e ridotto del 70% le chiamate ripetitive. I condòmini ci fanno i complimenti.',
                author: 'Elena M.',
                role: 'Amministratrice, Studio EMG',
              },
              {
                quote:
                  'Le assemblee ibride ci hanno permesso di approvare lavori per 280.000 € senza rinvii. Tutto tracciato, zero discussioni.',
                author: 'Giacomo R.',
                role: 'Partner, Studio Rinaldi & Co.',
              },
              {
                quote:
                  'CondoChiaro ha dati chiari anche per i fornitori. Interventi chiusi più velocemente e pagamenti puntuali.',
                author: 'Francesca L.',
                role: 'Responsabile Operativa, EdilService',
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={testimonial.author}
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

      <section id="offer" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <div className="rounded-3xl border border-[#1FA9A0]/30 bg-[#1FA9A0]/10 backdrop-blur p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-[0.25em]">
                Offerta lancio irresistibile
              </span>
              <h2 className="text-4xl font-bold mt-4">Blocca oggi il pacchetto Founder</h2>
              <p className="text-gray-200 text-lg mt-4">
                Attiva CondoChiaro ora e ricevi benefit pensati per far crescere il tuo studio senza rischi.
              </p>
              <ul className="mt-6 space-y-4">
                {offerHighlights.map((offer) => (
                  <li
                    key={offer.title}
                    className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4"
                  >
                    <ShieldCheck className="h-5 w-5 text-[#1FA9A0] mt-1" />
                    <div>
                      <p className="font-semibold text-white">{offer.title}</p>
                      <p className="text-sm text-gray-200 mt-1">{offer.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
                <span className="flex items-center gap-2 rounded-full border-2 border-[#1FA9A0] bg-[#1FA9A0]/20 px-4 py-2 font-semibold text-[#1FA9A0]">
                  <Gift className="h-5 w-5 text-[#1FA9A0]" />
                  ⚡ OFFERTA LIMITATA: Solo primi 100 condomìni attivati
                </span>
                <span className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2">
                  <Clock className="h-4 w-4 text-[#1FA9A0]" />
                  Prezzo garantito per 24 mesi
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-black/30 border border-white/10 p-8 shadow-2xl"
            >
              <p className="uppercase tracking-[0.3em] text-[#1FA9A0] text-sm">Cosa succede subito dopo</p>
              <h3 className="text-2xl font-semibold mt-4">Entro 48 ore dalla registrazione</h3>
              <ul className="space-y-3 mt-6 text-gray-200 text-sm">
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-[#1FA9A0] mt-1" />
                  Ricevi il welcome kit con checklist e modelli di comunicazione.
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-[#1FA9A0] mt-1" />
                  Pianifichiamo la call di onboarding e analizziamo il tuo caso.
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-[#1FA9A0] mt-1" />
                  Importiamo i primi due condomini e generiamo gli accessi ai condòmini.
                </li>
              </ul>
              <Link href="/register">
                <button className="mt-8 w-full py-3 rounded-full bg-[#1FA9A0] hover:bg-[#17978E] text-white font-semibold transition">
                  Blocca l&apos;offerta Founder
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="pricing" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Prezzi trasparenti, crescita senza vincoli</h2>
          <p className="text-gray-300 text-lg">
            Nessun costo di setup. Paghi solo quando hai la certezza che CondoChiaro stia lavorando al posto tuo.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={idx === 1 ? 'md:scale-110 md:-mt-8 relative z-10' : ''}
            >
              <div
                className={`rounded-2xl border bg-white/10 backdrop-blur-md text-white shadow-xl transition hover:bg-white/20 ${
                  idx === 1 
                    ? 'border-[#1FA9A0] border-[3px] bg-gradient-to-br from-[#1FA9A0]/20 via-white/10 to-white/10 shadow-2xl shadow-[#1FA9A0]/30 ring-4 ring-[#1FA9A0]/30 relative p-10' 
                    : 'border-white/20 p-8'
                } hover:border-white/30 h-full flex flex-col relative`}
              >
                {idx === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1FA9A0] to-[#27C5B9] text-white text-xs font-bold uppercase tracking-[0.25em] shadow-lg">
                      ⭐ {plan.badge}
                    </span>
                  </div>
                )}
                {plan.badge && idx !== 1 && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1FA9A0]/15 text-[#1FA9A0] text-xs font-semibold uppercase tracking-[0.25em]">
                    {plan.badge}
                  </span>
                )}
                {idx === 1 && <div className="h-6"></div>}
                <h3 className={`font-semibold mt-4 ${idx === 1 ? 'text-3xl' : 'text-2xl'}`}>{plan.name}</h3>
                <div className={`mb-4 mt-4 ${idx === 1 ? 'my-6' : ''}`}>
                  {plan.price === 'Su misura' ? (
                    <span className={`font-bold ${idx === 1 ? 'text-5xl' : 'text-4xl'}`}>Su misura</span>
                  ) : (
                    <div className="flex flex-col">
                      <span className={`font-bold ${idx === 1 ? 'text-5xl' : 'text-4xl'}`}>€{plan.price}</span>
                      {plan.pricePerUnit && (
                        <span className={`text-[#1FA9A0] ${idx === 1 ? 'text-xl mt-2' : 'text-lg mt-1'}`}>
                          + €{plan.pricePerUnit}/unità
                        </span>
                      )}
                      {plan.period && (
                        <span className={`text-gray-400 ${idx === 1 ? 'text-lg mt-1' : 'text-sm mt-1'}`}>{plan.period}</span>
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-gray-300 mb-4 ${idx === 1 ? 'text-base' : 'text-sm'}`}>{plan.description}</p>
                <p className={`text-[#1FA9A0] mb-6 ${idx === 1 ? 'text-base font-semibold' : 'text-sm'}`}>{plan.highlight}</p>
                <ul className="space-y-3 mb-6 text-sm text-gray-200 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-[#1FA9A0]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full mt-auto">
                  <button
                    className={`w-full py-2.5 rounded-full font-semibold transition ${
                      idx === 1
                        ? 'bg-[#1FA9A0] text-white hover:bg-[#17978E]'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-[#1FA9A0] hover:border-[#1FA9A0]'
                    }`}
                  >
                    {!idx ? 'Inizia gratis' : idx === 1 ? 'Sblocca il piano Pro' : 'Parla con noi'}
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="support" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white">Nei primi 14 giorni facciamo squadra con te</h2>
          <p className="text-gray-300 text-lg mt-3">
            Non ti lasciamo da solo: il nostro team diventa il tuo reparto operativo fino a quando sei indipendente.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportHighlights.map((support, idx) => (
            <motion.div
              key={support.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6 shadow-lg flex flex-col"
            >
              <Headphones className="h-10 w-10 text-[#1FA9A0]" />
              <h3 className="text-xl font-semibold mt-4">{support.title}</h3>
              <p className="text-gray-300 mt-4 flex-1">{support.description}</p>
              <p className="text-sm text-[#1FA9A0] mt-6 uppercase tracking-[0.3em]">{support.stat}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="faq" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white">Domande frequenti</h2>
          <p className="text-gray-300 text-lg mt-3">
            Se hai dubbi scrivici su <a href="mailto:ciao@condochiaro.com" className="text-[#1FA9A0] hover:text-[#27C5B9] underline">ciao@condochiaro.com</a> o prenota una demo.
          </p>
        </motion.div>
        <div className="max-w-4xl mx-auto space-y-6">
          {faqItems.map((faq, idx) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
              <p className="text-gray-300 mt-3">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" className="container mx-auto px-6 py-20 relative z-20 bg-[#0E141B]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Hai domande?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Siamo qui per aiutarti. Compila il form qui sotto e ti risponderemo il prima possibile.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleContactSubmit} className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                  Nome <span className="text-[#FF8080]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA9A0] focus:border-transparent"
                  placeholder="Il tuo nome"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email <span className="text-[#FF8080]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA9A0] focus:border-transparent"
                  placeholder="tua@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-200 mb-2">
                Oggetto
              </label>
              <input
                type="text"
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA9A0] focus:border-transparent"
                placeholder="Argomento del messaggio (opzionale)"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
                Messaggio <span className="text-[#FF8080]">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA9A0] focus:border-transparent resize-none"
                placeholder="Scrivi il tuo messaggio qui..."
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1FA9A0] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#17978E] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Invia messaggio
                </>
              )}
            </button>
          </form>
        </motion.div>
      </section>

      <section className="relative border-t border-border py-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2096&auto=format&fit=crop"
          alt="Skyline residenziale"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-primary/5 to-background" />
        <div className="container mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4">Porta il tuo studio nel futuro della gestione condominiale</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Blocca oggi l&apos;offerta Founder e sorprendi condòmini e fornitori con risposte chiare, documenti
              aggiornati e processi digitali.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <button className="bg-[#1FA9A0] text-white font-semibold px-8 py-3 rounded-full text-lg hover:bg-[#17978E] transition">
                  Attiva CondoChiaro ora
                </button>
              </Link>
              <Link href="/demo/select">
                <button className="bg-white/10 text-white font-semibold px-8 py-3 rounded-full backdrop-blur-md border border-white/20 text-lg hover:bg-[#1FA9A0] hover:border-[#1FA9A0] transition">
                  Accedi alla demo gratuita
                </button>
              </Link>
            </div>
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#1FA9A0]/20 via-[#1FA9A0]/15 to-transparent border-2 border-[#1FA9A0]/40">
              <p className="text-base md:text-lg font-bold text-[#1FA9A0] text-center">
                ⚡ OFFERTA FONDATORE: Valida fino al 31 Maggio 2026 o fino al raggiungimento dei primi 100 condomìni attivati
              </p>
              <p className="mt-2 text-sm md:text-base text-white/90 text-center">
                Non perdere questa opportunità esclusiva - Posti limitati disponibili!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

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
              <p className="text-muted-foreground text-sm">Gestione condominiale, finalmente chiara.</p>
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
                  <Link href="#offer" className="hover:text-white transition-colors">
                    Offerta Founder
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
                  <Link href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support#contact" className="hover:text-white transition-colors">
                    Richiedi assistenza
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>© 2024 Chiaro. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
