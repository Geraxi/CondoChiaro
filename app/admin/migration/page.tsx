'use client'

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues with browser-only APIs
const MigrationWizard = dynamic(
  () => import('@/components/migration/migration-wizard').then(mod => ({ default: mod.MigrationWizard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-[#10171F]/60 text-gray-400 backdrop-blur">
        Caricamento guidata in corso...
      </div>
    ),
  }
)

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <MigrationWizard />
      </div>
    </div>
  )
}
