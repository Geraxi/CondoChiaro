import Link from 'next/link'

export const metadata = {
  title: 'Informativa Privacy | CondoChiaro',
  description: 'Scopri come CondoChiaro gestisce e tutela i dati personali.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0E141B] text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-4xl font-bold mb-4">Informativa sulla Privacy</h1>
          <p className="text-muted-foreground">
            La tua privacy è importante per noi. In questa pagina trovi un riepilogo di come raccogliamo, utilizziamo e proteggiamo i dati personali
            all&apos;interno della piattaforma CondoChiaro.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Dati raccolti</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Raccogliamo solo i dati necessari a fornire i servizi di gestione condominiale, come informazioni di contatto, documenti caricati e
            preferenze di comunicazione. I dati vengono trattati nel rispetto del Regolamento Europeo 2016/679 (GDPR).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Come utilizziamo i dati</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Utilizziamo i dati per offrire funzionalità di comunicazione, archiviazione documentale, pagamenti e automazioni. Non vendiamo né
            condividiamo i dati con terze parti non autorizzate.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">I tuoi diritti</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Puoi richiedere in qualsiasi momento l&apos;accesso, la modifica o la cancellazione dei tuoi dati contattandoci all&apos;indirizzo{' '}
            <a href="mailto:privacy@condochiaro.com" className="text-[#1FA9A0] hover:text-[#27C5B9]">
              privacy@condochiaro.com
            </a>
            .
          </p>
        </section>

        <div className="pt-6 border-t border-white/10">
          <Link href="/" className="text-sm text-[#1FA9A0] hover:text-[#27C5B9]">
            ← Torna alla homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
