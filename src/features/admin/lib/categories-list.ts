export interface AdminCategoryRow {
  childCategories: number;
  icon: string | null;
  id: number;
  linkedBusinesses: number;
  name: string;
  parentId: number | null;
  slug: string;
}

export type AdminCategoryRowView = AdminCategoryRow & { depth: number };

export type CategoryScopeFilter = '' | 'IN_USE' | 'TOP_LEVEL';

export function sortCategoriesHierarchical(rows: AdminCategoryRow[]): AdminCategoryRowView[] {
  const byParent = new Map<number | null, AdminCategoryRow[]>();
  for (const row of rows) {
    const key = row.parentId;
    const bucket = byParent.get(key) ?? [];
    bucket.push(row);
    byParent.set(key, bucket);
  }

  const result: AdminCategoryRowView[] = [];
  function walk(parentId: number | null, depth: number) {
    const children = (byParent.get(parentId) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
    for (const child of children) {
      result.push({ ...child, depth });
      walk(child.id, depth + 1);
    }
  }
  walk(null, 0);

  const listed = new Set(result.map((row) => row.id));
  const orphans = rows
    .filter((row) => !listed.has(row.id))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    .map((row) => ({ ...row, depth: 0 }));
  return [...result, ...orphans];
}

export function filterAdminCategories(
  rows: AdminCategoryRow[],
  options: { q?: string; scope?: CategoryScopeFilter },
): AdminCategoryRow[] {
  const query = options.q?.trim().toLowerCase() ?? '';
  const scope = options.scope ?? '';

  let filtered = rows;

  if (scope === 'TOP_LEVEL') {
    filtered = filtered.filter((row) => row.parentId === null);
  } else if (scope === 'IN_USE') {
    filtered = filtered.filter((row) => row.linkedBusinesses > 0);
  }

  if (!query) return filtered;

  const namesById = new Map(filtered.map((row) => [row.id, row.name]));
  return filtered.filter(
    (row) =>
      row.name.toLowerCase().includes(query) ||
      row.slug.toLowerCase().includes(query) ||
      (row.parentId !== null &&
        (namesById.get(row.parentId) ?? '').toLowerCase().includes(query)),
  );
}

export function buildCategoryDisplayRows(
  rows: AdminCategoryRow[],
  options: { q?: string; scope?: CategoryScopeFilter },
): AdminCategoryRowView[] {
  return sortCategoriesHierarchical(filterAdminCategories(rows, options));
}
