import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post(/plausible\.io\/api\/event/, () => HttpResponse.json({}, { status: 202 })),
  http.post(/ingest\.sentry\.io\/api\/\d+\/envelope/, () =>
    HttpResponse.json({}, { status: 200 }),
  ),
];
