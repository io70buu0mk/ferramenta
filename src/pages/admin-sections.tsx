// Definizione delle sezioni e delle route per la dashboard admin
export const adminSections = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Panoramica generale',
    icon: 'activity',
    path: '/admin/dashboard',
  },
  {
    key: 'prodotti',
    label: 'Prodotti',
    description: 'Gestione catalogo',
    icon: 'package',
    path: '/admin/prodotti',
  },
  {
    key: 'promozioni',
    label: 'Promozioni',
    description: 'Gestione sconti e offerte',
    icon: 'percent',
    path: '/admin/promozioni',
  },
  {
    key: 'utenti',
    label: 'Utenti',
    description: 'Gestione utenti',
    icon: 'users',
    path: '/admin/utenti',
  },
  {
    key: 'comunicazioni',
    label: 'Comunicazioni',
    description: 'Messaggi e notifiche',
    icon: 'message-square',
    path: '/admin/comunicazioni',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Statistiche avanzate',
    icon: 'bar-chart-3',
    path: '/admin/analytics',
  },
  {
    key: 'impostazioni',
    label: 'Impostazioni',
    description: 'Configurazione sistema',
    icon: 'settings',
    path: '/admin/impostazioni',
  },
];
