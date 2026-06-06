import { NextResponse } from 'next/server';

export function buildAdminExportFilename(prefix: string, exportedAt: Date): string {
  return `${prefix}-export-${exportedAt.toISOString().slice(0, 10)}.csv`;
}

export function createAdminCsvDownloadResponse(
  csv: string,
  prefix: string,
  exportedAt: Date,
): NextResponse<string> {
  return new NextResponse(csv, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="${buildAdminExportFilename(prefix, exportedAt)}"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
