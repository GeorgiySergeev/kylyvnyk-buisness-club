export function isUndefinedTableError(error: unknown, tableName?: string): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeCode = (error as { code?: string }).code;
  const maybeMessage = String((error as { message?: string }).message ?? '');

  if (maybeCode === '42P01') {
    if (!tableName) return true;
    return maybeMessage.toLowerCase().includes(`"${tableName.toLowerCase()}"`);
  }

  return false;
}

export const MIGRATION_REQUIRED_MESSAGE =
  'Database migration is required for this admin module. Run `pnpm db:migrate`.';
