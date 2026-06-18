import 'server-only';

import { resolveCountryFlagSvg } from '@/lib/flags/resolve-country-flag-svg';

interface RouteContext {
  params: Promise<{ iso2: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { iso2 } = await context.params;
  const svg = await resolveCountryFlagSvg(iso2);

  if (!svg) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(svg, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/svg+xml',
    },
  });
}
