import { notFound } from "next/navigation";
import { requirePageAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { AcceptInviteCard } from "@/components/org/accept-invite-card";

export default async function InvitePage({ params }: { params: { token: string } }) {
  const { token } = params;
  await requirePageAuth(`/invite/${token}`);

  const supabase = getSupabaseServerClient();
  const { data: invite, error } = await supabase
    .from("invite_tokens")
    .select("token,expires_at,organizations!invite_tokens_org_id_fkey ( name )")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    throw new Error(`INVITE_QUERY_FAILED: ${error.message}`);
  }

  if (!invite) {
    notFound();
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">This invite has expired.</div>
      </div>
    );
  }

  const org = Array.isArray(invite.organizations) ? invite.organizations[0] : invite.organizations;

  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <AcceptInviteCard token={token} orgName={org?.name || "Organization"} />
    </div>
  );
}
