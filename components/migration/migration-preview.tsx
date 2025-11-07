import Image from 'next/image'
import { Fragment } from 'react'

const STEPS = [
  { id: '1', label: 'File' },
  { id: '2', label: 'Mappatura' },
  { id: '3', label: 'Revisione' },
  { id: '4', label: 'Completato' },
]

export function MigrationPreview() {
  const activeStep = 0

  return (
    <div className="relative w-[320px] md:w-[360px]">
      <div className="absolute -inset-10 rounded-[44px] bg-gradient-to-br from-[#0A1C2A] via-[#0D2D40] to-[#04111F] opacity-60 blur-[95px]" />

      <div className="relative rounded-[34px] border border-white/15 bg-white/10 p-6 shadow-[0_30px_90px_rgba(6,18,33,0.55)] backdrop-blur-xl">
        <div className="rounded-[28px] border border-white/20 bg-white/80 px-7 pt-7 pb-12 shadow-[0_26px_70px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF8A7A]" />
            <span className="h-3 w-3 rounded-full bg-[#FACC15]" />
            <span className="h-3 w-3 rounded-full bg-[#34D399]" />
          </div>

          <h3 className="text-[24px] font-semibold tracking-tight text-slate-900">Importa i dati</h3>

          <div className="mt-6 px-1">
            <div className="flex items-start justify-between gap-2">
              {STEPS.map((step, index) => {
                const isActive = index === activeStep
                const isCompleted = index < activeStep

                return (
                  <Fragment key={step.id}>
                    <div className="flex min-w-[64px] flex-col items-center">
                      <span
                        className={[
                          'flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                          isActive || isCompleted
                            ? 'border-emerald-400 bg-emerald-400 text-white shadow-[0_12px_25px_rgba(16,185,129,0.35)]'
                            : 'border-slate-200 bg-white text-slate-400',
                        ].join(' ')}
                      >
                        {step.id}
                      </span>
                      <span
                        className={[
                          'mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-center',
                          isActive || isCompleted ? 'text-emerald-600' : 'text-slate-400',
                        ].join(' ')}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="flex-1 px-1">
                        <div
                          className={[
                            'mt-[22px] h-[2px] rounded-full transition-colors',
                            index < activeStep ? 'bg-emerald-400' : 'bg-slate-200',
                          ].join(' ')}
                        />
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-dashed border-emerald-100/80 bg-gradient-to-b from-white/90 via-white/70 to-emerald-50/50 px-9 py-12 text-center backdrop-blur">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#E2F8F1" />
                <path d="M16 22V10" stroke="#0EA489" strokeWidth="2.2" strokeLinecap="round" />
                <path
                  d="M11.5 14.5L16 10L20.5 14.5"
                  stroke="#0EA489"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-900">Carica il file</p>
            <p className="text-sm text-slate-400">Excel o CSV fino a 50MB</p>
          </div>
        </div>

        <div className="absolute -left-6 bottom-[6rem] w-[184px] -rotate-[12deg] rounded-[26px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(12,116,144,0.28)] backdrop-blur-md">
          <div className="rounded-t-[26px] bg-gradient-to-r from-[#00B894] to-[#1ECDAC] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
            <div className="flex justify-between">
              <span>Nome</span>
              <span>Email</span>
              <span>Unità</span>
            </div>
          </div>
          <div className="space-y-3 px-4 py-5 text-[11px] text-slate-900">
            {[
              { name: 'Mario Rossi', unit: 'A12' },
              { name: 'Luisa Bianchi', unit: 'B07' },
              { name: 'Paolo Verdi', unit: 'C03' },
            ].map(row => (
              <div
                key={row.name}
                className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-3 shadow-[0_12px_26px_rgba(15,118,110,0.12)]"
              >
                <p className="text-[12px] font-semibold text-slate-900">{row.name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-emerald-600">{row.unit}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-b-[26px] bg-slate-900 px-4 py-3 text-[10px] text-white">
            <span className="font-semibold tracking-normal">File Excel</span>
            <span className="tracking-[0.4em] text-emerald-300">.XLSX</span>
          </div>
        </div>

        <div className="absolute left-6 bottom-10 flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/30 bg-gradient-to-br from-[#12B67E] to-[#0B8A58] text-white shadow-[0_18px_48px_rgba(5,150,105,0.45)] backdrop-blur">
          <span className="text-[17px] font-semibold tracking-wider">XLS</span>
        </div>

        <div className="absolute right-6 bottom-8 flex items-center gap-3 rounded-[24px] border border-white/15 bg-[#041F2E]/80 px-6 py-4 shadow-[0_20px_60px_rgba(12,74,110,0.45)] backdrop-blur">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#39D5C8]/30 bg-[#0C394B]/80 backdrop-blur">
            <Image src="/images/condochiaro-logo.png" alt="CondoChiaro" width={24} height={24} className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">CondoChiaro</p>
            <p className="mt-1 text-[11px] text-[#8FE2DB]">Dashboard pronta in 2 minuti</p>
          </div>
        </div>
      </div>
    </div>
  )
}
