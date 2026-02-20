import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  const redirectUrl = new URL(safeNext, requestUrl.origin);
  const errorRedirect = new URL(`/auth/sign-in?error=oauth_callback_failed`, requestUrl.origin);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tazvvmufjtdlfguulcob.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenZ2bXVmanRkbGZndXVsY29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTQxNTUsImV4cCI6MjA4NzA3MDE1NX0.qoka7yGXYSvUDJvu4gZ4y54cMLvIbiefME2xkucz5dk";

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(errorRedirect);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.headers
          .get("cookie")
          ?.split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith(`${name}=`))
          ?.split("=")
          .slice(1)
          .join("=");
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      }
    }
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(errorRedirect);
    }
  }

  return response;
}
