export interface BusinessesListFilters {
  q?: string;
  status?: string;
}

export interface FilterableAdminBusiness {
  name: string;
  slug: string;
  status: string;
}

export function filterAdminBusinesses<T extends FilterableAdminBusiness>(
  allBusinesses: T[],
  filters: BusinessesListFilters,
): T[] {
  const searchTerm = filters.q?.trim() ?? '';
  const statusFilter = filters.status?.trim() ?? '';

  let filtered = allBusinesses;

  if (statusFilter) {
    filtered = filtered.filter((business) => business.status === statusFilter);
  }

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (business) =>
        business.name.toLowerCase().includes(lower) || business.slug.toLowerCase().includes(lower),
    );
  }

  return filtered;
}
