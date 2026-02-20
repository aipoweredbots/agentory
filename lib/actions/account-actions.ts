"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { deleteAccountSchema } from "@/lib/zodSchemas";

export async function deleteAccountAction(values: { confirmation: "DELETE" }) {
  const payload = deleteAccountSchema.parse(values);
  const session = await requireAuth();

  if (payload.confirmation !== "DELETE") {
    throw new Error("INVALID_CONFIRMATION");
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("users").delete().eq("id", session.user.id);

  if (error) {
    throw new Error(`ACCOUNT_DELETE_FAILED: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}
