"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export async function clientSignOut(callbackUrl = "/") {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
  window.location.href = callbackUrl;
}
