import { describe, expect, it } from 'vitest';

import {
  buildAdminExportFilename,
  createAdminCsvDownloadResponse,
} from '../../../src/features/admin/lib/export-response';

describe('admin export response contract', () => {
  it('builds stable dated filenames', () => {
    expect(buildAdminExportFilename('users', new Date('2026-06-05T12:00:00.000Z'))).toBe(
      'users-export-2026-06-05.csv',
    );
  });

  it('returns csv download headers without cache', async () => {
    const response = createAdminCsvDownloadResponse(
      'ID,Name\r\n1,Ada\r\n',
      'businesses',
      new Date('2026-06-05T12:00:00.000Z'),
    );

    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="businesses-export-2026-06-05.csv"',
    );
    expect(await response.text()).toBe('ID,Name\r\n1,Ada\r\n');
  });
});
