import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { decodeDevPhoneAuthCookie, DEV_PHONE_AUTH_COOKIE } from './features/auth/lib/dev-auth';

const PROTECTED_ROUTE_PATTERN = /^\/(en|ru|uk)\/(?:m|admin)(?:\/|$)/;
const LOCALE_PATTERN = /^\/(en|ru|uk)(?:\/|$)/;

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PATTERN.test(pathname);
}

function getRequestLocale(pathname: string) {
  return LOCALE_PATTERN.exec(pathname)?.[1] ?? 'en';
}

function isDevBypassRequest(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  if (process.env.AUTH_DEV_PHONE_BYPASS_ENABLED !== '1') {
    return false;
  }

  return Boolean(decodeDevPhoneAuthCookie(request.cookies.get(DEV_PHONE_AUTH_COOKIE)?.value));
}

function redirectToSignIn(request: NextRequest, locale: string, returnBackUrl: string) {
  const signInUrl = request.nextUrl.clone();
  signInUrl.pathname = `/${locale}/sign-in`;
  signInUrl.searchParams.set('returnBackUrl', returnBackUrl);

  const redirectResponse = NextResponse.redirect(signInUrl);
  redirectResponse.headers.set('x-locale', locale);
  return redirectResponse;
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = getRequestLocale(pathname);
  const devBypass = isDevBypassRequest(request);

  let response = NextResponse.next({
    request,
  });
  response.headers.set('x-locale', locale);

  // Public routes must not wait on Supabase — that blocked client-side navigation.
  if (!isProtectedRoute(pathname)) {
    return response;
  }

  if (devBypass) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return redirectToSignIn(request, locale, pathname);
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

  if (!user) {
    return redirectToSignIn(request, locale, pathname);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
