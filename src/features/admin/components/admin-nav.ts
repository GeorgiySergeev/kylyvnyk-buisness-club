export const ADMIN_NAV_ITEMS = [
  { key: 'navDashboard' as const, href: '/admin' },
  { key: 'navUsers' as const, href: '/admin/users' },
  { key: 'navBusinesses' as const, href: '/admin/businesses' },
  { key: 'navIntroductions' as const, href: '/admin/introductions' },
  { key: 'navCards' as const, href: '/admin/cards' },
  { key: 'navAudit' as const, href: '/admin/audit' },
];

export type AdminNavKey = (typeof ADMIN_NAV_ITEMS)[number]['key'];
export type AdminNavLabels = Record<AdminNavKey, string>;
