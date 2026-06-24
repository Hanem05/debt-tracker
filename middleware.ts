import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');

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

    // getSession reads from the cookie — no network call, much faster than getUser
    const { data: { session } } = await supabase.auth.getSession();

    if (!session && !isAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch {
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
