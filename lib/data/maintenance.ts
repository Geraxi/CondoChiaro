export type MaintenanceTicket = {
  id: string
  title: string
  from: string
  priority: 'alta' | 'media' | 'bassa'
  date: string
  status: 'in_attesa' | 'approvato' | 'rifiutato'
}

export type WorkOrder = {
  id: string
  title: string
  supplier: string
  status: 'in_lavoro' | 'completato'
  progress: number
  building: string
  scheduledAt: string
}

export const maintenanceTickets: MaintenanceTicket[] = [
  {
    id: 'T-001',
    title: 'Riparazione ascensore',
    from: 'Mario Rossi',
    priority: 'alta',
    date: '2 giorni fa',
    status: 'in_attesa',
  },
  {
    id: 'T-002',
    title: 'Sostituzione lampadine',
    from: 'Luisa Bianchi',
    priority: 'media',
    date: '5 giorni fa',
    status: 'in_attesa',
  },
]

export const workOrders: WorkOrder[] = [
  {
    id: 'WO-001',
    title: 'Pulizia scale',
    supplier: 'Pulizie SRL',
    status: 'in_lavoro',
    progress: 60,
    building: 'Via Roma 10',
    scheduledAt: '2024-01-18',
  },
  {
    id: 'WO-002',
    title: 'Manutenzione caldaia',
    supplier: 'Tecno Service',
    status: 'completato',
    progress: 100,
    building: 'Via Milano 3',
    scheduledAt: '2024-01-12',
  },
]

export const supplierInvoices = [
  { invoice: 'INV-001', amount: 1200, status: 'pagato', date: '2024-01-10' },
  { invoice: 'INV-002', amount: 850, status: 'in_attesa', date: '2024-01-15' },
  { invoice: 'INV-003', amount: 2100, status: 'pagato', date: '2024-01-20' },
]

export const supplierPerformance = [
  { month: 'Gen', completati: 8, in_lavoro: 3 },
  { month: 'Feb', completati: 12, in_lavoro: 2 },
  { month: 'Mar', completati: 10, in_lavoro: 4 },
]
