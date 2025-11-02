import Link from 'next/link'

export const metadata = {
  title: 'Supporto | CondoChiaro',
  description: 'Trova documentazione, domande frequenti e contatti di supporto per CondoChiaro.',
}

const faqs = [
  {
    question: 'Come posso invitare nuovi condòmini?',
    answer:
      'Accedi alla dashboard Amministratore, vai nella sezione Condomini e utilizza il pulsante "Invita nuovo condòmino". Verrà inviato un invito email automatizzato.',
  },
  {
    question: 'Posso esportare i report contabili?',
    answer:
      'Sì. Nella sezione Report puoi generare esportazioni PDF e CSV per entrate, uscite e bilanci trimestrali.',
  },
  {
    question: 'Come funziona la migrazione dei dati?',
    answer:
      'Utilizza il wizard di migrazione nella sezione Migrazione Dati per caricare file CSV o Excel e mappare le colonne verso le tabelle di CondoChiaro.',
  },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0E141B] text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1FA9A0]">Supporto CondoChiaro</p>
          <h1 className="text-4xl font-bold">Hai bisogno di aiuto?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Consulta la documentazione rapida, leggi le domande frequenti oppure contattaci direttamente: siamo qui per aiutarti a gestire il
            condominio senza stress.
          </p>
        </header>

        <section id="docs" className="bg-[#1A1F26] border border-white/10 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold">Documentazione rapida</h2>
          <p className="text-sm text-muted-foreground">
            Le guide rapide sono disponibili all&apos;interno dell&apos;app. Se sei già cliente, accedi con le tue credenziali e visita la sezione
            &quot;Documenti&quot; per trovare manuali, video e checklist operative.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#1FA9A0] hover:text-[#27C5B9]">
            Accedi alla documentazione →
          </Link>
        </section>

        <section id="faq" className="space-y-6">
          <h2 className="text-2xl font-semibold">Domande frequenti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-[#1A1F26] border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="bg-[#1A1F26] border border-white/10 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold">Contatta il team</h2>
          <p className="text-sm text-muted-foreground">
            Preferisci parlare con qualcuno? Scrivici o prenota una videochiamata con un membro del team CondoChiaro.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <a href="mailto:support@condochiaro.com" className="bg-white/5 hover:bg-white/10 transition rounded-xl px-5 py-4">
              <p className="font-semibold text-white">Email</p>
              <p className="text-muted-foreground">support@condochiaro.com</p>
            </a>
            <a href="https://cal.com" className="bg-white/5 hover:bg-white/10 transition rounded-xl px-5 py-4" target="_blank" rel="noreferrer">
              <p className="font-semibold text-white">Prenota una call</p>
              <p className="text-muted-foreground">Scegli lo slot che preferisci</p>
            </a>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#1FA9A0] hover:text-[#27C5B9]">
            ← Torna alla homepage
          </Link>
        </section>
      </div>
    </main>
  )
}
