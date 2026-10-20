export const DASHBOARD_LABELS = {
  pageTitle: 'Dashboard',
  documentTitle: 'Dashboard | PLN EMI Admin',
} as const

export const DASHBOARD_QUICK_LINKS = [
  { key: 'article', to: '/articles/create' },
  { key: 'document', to: '/document_commitments' },
  { key: 'home', to: '/home' },
  { key: 'inbox', to: '/inbox' },
] as const
