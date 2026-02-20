"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMembership } from "@/lib/auth";
import { RoleEnum } from "@/lib/db-types";
import { requireRole } from "@/lib/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { agentFormSchema, type AgentFormValues } from "@/lib/zodSchemas";
import { slugify } from "@/lib/utils";

async function uniqueAgentSlug(base: string, agentId?: string) {
  const supabase = getSupabaseServerClient();
  let slug = slugify(base) || `agent-${Date.now()}`;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data: conflict } = await supabase.from("subscribed_agents").select("id").eq("slug", slug).maybeSingle();
    if (!conflict || conflict.id === agentId) {
      return slug;
    }
    slug = `${slugify(base)}-${attempt + 2}`;
  }

  return `${slugify(base)}-${Date.now()}`;
}

export async function createAgentAction(values: AgentFormValues) {
  const payload = agentFormSchema.parse(values);
  const membership = await getCurrentMembership();
  requireRole(membership, [RoleEnum.ADMIN]);

  const slug = await uniqueAgentSlug(payload.name);
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("subscribed_agents").insert({
    org_id: membership.orgId,
    name: payload.name,
    slug,
    category: payload.category,
    tags: payload.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    short_description: payload.shortDescription,
    long_description: payload.longDescription,
    premium_only: payload.premiumOnly,
    free_try_enabled: payload.premiumOnly ? false : payload.freeTryEnabled,
    is_featured: payload.isFeatured,
    is_published: false
  });

  if (error) {
    throw new Error(`AGENT_CREATE_FAILED: ${error.message}`);
  }

  revalidatePath("/dashboard/agents");
  revalidatePath("/marketplace");
  return { success: true };
}

export async function updateAgentAction(agentId: string, values: AgentFormValues) {
  const payload = agentFormSchema.parse(values);
  const membership = await getCurrentMembership();
  requireRole(membership, [RoleEnum.ADMIN]);
  const supabase = getSupabaseServerClient();

  const { data: current, error: findError } = await supabase
    .from("subscribed_agents")
    .select("id,name,slug")
    .eq("id", agentId)
    .eq("org_id", membership.orgId)
    .maybeSingle();

  if (findError) {
    throw new Error(`AGENT_QUERY_FAILED: ${findError.message}`);
  }

  if (!current) {
    throw new Error("AGENT_NOT_FOUND");
  }

  const slug = payload.name !== current.name ? await uniqueAgentSlug(payload.name, current.id) : current.slug;

  const { error: updateError } = await supabase
    .from("subscribed_agents")
    .update({
      name: payload.name,
      slug,
      category: payload.category,
      tags: payload.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      short_description: payload.shortDescription,
      long_description: payload.longDescription,
      premium_only: payload.premiumOnly,
      free_try_enabled: payload.premiumOnly ? false : payload.freeTryEnabled,
      is_featured: payload.isFeatured
    })
    .eq("id", agentId)
    .eq("org_id", membership.orgId);

  if (updateError) {
    throw new Error(`AGENT_UPDATE_FAILED: ${updateError.message}`);
  }

  revalidatePath("/dashboard/agents");
  revalidatePath(`/dashboard/agents/${agentId}/edit`);
  revalidatePath("/marketplace");
  revalidatePath(`/agent/${current.slug}`);
  return { success: true };
}

export async function togglePublishAgentAction(agentId: string, publish: boolean) {
  const membership = await getCurrentMembership();
  requireRole(membership, [RoleEnum.ADMIN]);
  const supabase = getSupabaseServerClient();

  const { data: agent, error: findError } = await supabase
    .from("subscribed_agents")
    .select("id,slug")
    .eq("id", agentId)
    .eq("org_id", membership.orgId)
    .maybeSingle();

  if (findError) {
    throw new Error(`AGENT_QUERY_FAILED: ${findError.message}`);
  }

  if (!agent) {
    throw new Error("AGENT_NOT_FOUND");
  }

  const { error: updateError } = await supabase
    .from("subscribed_agents")
    .update({ is_published: publish })
    .eq("id", agentId)
    .eq("org_id", membership.orgId);

  if (updateError) {
    throw new Error(`AGENT_PUBLISH_UPDATE_FAILED: ${updateError.message}`);
  }

  revalidatePath("/dashboard/agents");
  revalidatePath("/marketplace");
  revalidatePath(`/agent/${agent.slug}`);
  return { success: true };
}

export async function deleteAgentAction(agentId: string) {
  const membership = await getCurrentMembership();
  requireRole(membership, [RoleEnum.ADMIN]);
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("subscribed_agents").delete().eq("id", agentId).eq("org_id", membership.orgId);

  if (error) {
    throw new Error(`AGENT_DELETE_FAILED: ${error.message}`);
  }

  revalidatePath("/dashboard/agents");
  revalidatePath("/marketplace");
  return { success: true };
}
