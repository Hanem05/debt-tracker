import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase env vars are not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  try {
    let response = NextResponse.next({ request });

    const cookieMethods: CookieMethodsServer = {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    };

    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: cookieMethods });

    const { data } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');

    if (!data.user && !isAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (data.user && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch {
    const path = request.nextUrl.pathname;
    const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
