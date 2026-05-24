import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { decodeDevPhoneAuthCookie,DEV_PHONE_AUTH_COOKIE } from '@/features/auth/lib/dev-auth';

const PROTECTED_ROUTE_PATTERN = /^\/en\/(?:m|admin)(?:\/|$)/;

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PATTERN.test(pathname);
}

function isDevBypassRequest(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.AUTH_DEV_PHONE_BYPASS_ENABLED !== '1') {
    return false;
  }

  return Boolean(decodeDevPhoneAuthCookie(request.cookies.get(DEV_PHONE_AUTH_COOKIE)?.value));
}

export default async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute(request.nextUrl.pathname) && !user && !isDevBypassRequest(request)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/en/sign-in';
    signInUrl.searchParams.set('returnBackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
