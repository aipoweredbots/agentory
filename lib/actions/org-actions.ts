"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMembership, requireAuth } from "@/lib/auth";
import { RoleEnum, type Role } from "@/lib/db-types";
import { isOwner, requireRole } from "@/lib/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import {
  acceptInviteSchema,
  inviteMemberSchema,
  orgProfileSchema,
  removeMemberSchema,
  updateRoleSchema,
  type InviteMemberValues,
  type OrgProfileValues
} from "@/lib/zodSchemas";

function makeInviteToken() {
  return `${crypto.randomUUID()}${Math.random().toString(16).slice(2, 10)}`.replace(/-/g, "");
}

export async function updateOrgProfileAction(values: OrgProfileValues) {
  const payload = orgProfileSchema.parse(values);
  const membership = await getCurrentMembership();
  requireRole(membership, [RoleEnum.ADMIN]);
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("organizations")
    .update({
      name: payload.name,
      website: payload.website || null,
      logo_url: payload.logoUrl || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", membership.orgId);

  if (error) {
    throw new Error(`ORG_UPDATE_FAILED: ${error.message}`);
  }

  revalidatePath("/dashboard/org");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createInviteAction(values: InviteMemberValues) {
  const payload = inviteMemberSchema.parse(values);
  const membership = await getCurrentMembership();
  requireRole(membership, [RoleEnum.ADMIN]);
  const supabase = getSupabaseServerClient();

  const token = makeInviteToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const { data: invite, error } = await supabase
    .from("invite_tokens")
    .insert({
      org_id: membership.orgId,
      email: payload.email.toLowerCase(),
      role: payload.role,
      token,
      expires_at: expiresAt
    })
    .select("token")
    .single();

  if (error || !invite) {
    throw new Error(`INVITE_CREATE_FAILED: ${error?.message || "unknown"}`);
  }

  revalidatePath("/dashboard/org");
  return {
    success: true,
    inviteUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/${invite.token}`
  };
}

export async function acceptInviteAction(token: string) {
  const session = await requireAuth();
  const payload = acceptInviteSchema.parse({ token });
  const supabase = getSupabaseServerClient();

  const { data: invite, error: inviteError } = await supabase
    .from("invite_tokens")
    .select("id,org_id,email,role,token,expires_at,accepted_at")
    .eq("token", payload.token)
    .maybeSingle();

  if (inviteError) {
    throw new Error(`INVITE_QUERY_FAILED: ${inviteError.message}`);
  }

  if (!invite || invite.accepted_at || new Date(invite.expires_at) < new Date()) {
    throw new Error("INVITE_INVALID");
  }

  if (invite.email.toLowerCase() !== session.user.email?.toLowerCase()) {
    throw new Error("INVITE_EMAIL_MISMATCH");
  }

  const { error: upsertMembershipError } = await supabase.from("memberships").upsert(
    {
      user_id: session.user.id,
      org_id: invite.org_id,
      role: invite.role
    },
    { onConflict: "user_id,org_id" }
  );

  if (upsertMembershipError) {
    throw new Error(`INVITE_ACCEPT_MEMBERSHIP_FAILED: ${upsertMembershipError.message}`);
  }

  const { error: markAcceptedError } = await supabase
    .from("invite_tokens")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (markAcceptedError) {
    throw new Error(`INVITE_ACCEPT_UPDATE_FAILED: ${markAcceptedError.message}`);
  }

  const { data: orgRow } = await supabase.from("organizations").select("name").eq("id", invite.org_id).maybeSingle();

  revalidatePath("/dashboard/org");
  return { success: true, orgName: orgRow?.name || "Organization" };
}

export async function updateMemberRoleAction(values: { membershipId: string; role: Role }) {
  const payload = updateRoleSchema.parse(values);
  const membership = await getCurrentMembership();
  if (!isOwner(membership)) {
    throw new Error("FORBIDDEN");
  }

  const supabase = getSupabaseServerClient();
  const { data: target, error: targetError } = await supabase
    .from("memberships")
    .select("id,org_id")
    .eq("id", payload.membershipId)
    .maybeSingle();

  if (targetError) {
    throw new Error(`MEMBERSHIP_QUERY_FAILED: ${targetError.message}`);
  }

  if (!target || target.org_id !== membership.orgId) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  const { error: updateError } = await supabase
    .from("memberships")
    .update({ role: payload.role })
    .eq("id", payload.membershipId);

  if (updateError) {
    throw new Error(`MEMBERSHIP_ROLE_UPDATE_FAILED: ${updateError.message}`);
  }

  revalidatePath("/dashboard/org");
  return { success: true };
}

export async function removeMemberAction(values: { membershipId: string }) {
  const payload = removeMemberSchema.parse(values);
  const membership = await getCurrentMembership();

  if (!isOwner(membership)) {
    throw new Error("FORBIDDEN");
  }

  const supabase = getSupabaseServerClient();
  const { data: target, error: targetError } = await supabase
    .from("memberships")
    .select("id,org_id,user_id")
    .eq("id", payload.membershipId)
    .maybeSingle();

  if (targetError) {
    throw new Error(`MEMBERSHIP_QUERY_FAILED: ${targetError.message}`);
  }

  if (!target || target.org_id !== membership.orgId) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  if (target.user_id === membership.userId) {
    throw new Error("OWNER_REMOVE_SELF_NOT_ALLOWED");
  }

  const { error: deleteError } = await supabase.from("memberships").delete().eq("id", target.id);

  if (deleteError) {
    throw new Error(`MEMBERSHIP_DELETE_FAILED: ${deleteError.message}`);
  }

  revalidatePath("/dashboard/org");
  return { success: true };
}
