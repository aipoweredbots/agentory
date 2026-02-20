import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const protectedMatchers = [/^\/dashboard/, /^\/invite\//];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiresAuth = protectedMatchers.some((matcher) => matcher.test(pathname));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        }
      }
    });

    const authCode = request.nextUrl.searchParams.get("code");
    if (authCode) {
      await supabase.auth.exchangeCodeForSession(authCode);
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session) {
      return response;
    }
  }

  const callbackUrl = encodeURIComponent(`${pathname}${search}`);
  return NextResponse.redirect(new URL(`/auth/sign-in?callbackUrl=${callbackUrl}`, request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/invite/:path*"]
};
