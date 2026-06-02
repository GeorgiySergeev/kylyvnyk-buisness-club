export const ADMIN_NAV_ITEMS = [
  { key: 'navDashboard' as const, href: '/admin' },
  { key: 'navUsers' as const, href: '/admin/users' },
  { key: 'navAccess' as const, href: '/admin/access' },
  { key: 'navBusinesses' as const, href: '/admin/businesses' },
  { key: 'navIntroductions' as const, href: '/admin/introductions' },
  { key: 'navCards' as const, href: '/admin/cards' },
  { key: 'navCategories' as const, href: '/admin/categories' },
  { key: 'navCountries' as const, href: '/admin/countries' },
  { key: 'navStripeLinks' as const, href: '/admin/stripe-links' },
  { key: 'navSubscriptions' as const, href: '/admin/subscriptions' },
  { key: 'navMemberships' as const, href: '/admin/memberships' },
  { key: 'navCatalog' as const, href: '/admin/catalog' },
  { key: 'navAudit' as const, href: '/admin/audit' },
  { key: 'navRoles' as const, href: '/admin/roles' },
];

export type AdminNavKey = (typeof ADMIN_NAV_ITEMS)[number]['key'];
export type AdminNavLabels = Record<AdminNavKey, string>;
