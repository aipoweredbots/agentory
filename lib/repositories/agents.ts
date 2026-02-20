import { getSupabaseServerClient } from "@/lib/supabase-server";

export type AgentRecord = {
  id: string;
  orgId: string | null;
  name: string;
  slug: string;
  category: string;
  tags: string[];
  shortDescription: string;
  longDescription: string;
  isFeatured: boolean;
  isPublished: boolean;
  freeTryEnabled: boolean;
  premiumOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
  org?: {
    id: string;
    name: string;
    slug: string;
  };
};

type AgentRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tags: string[] | null;
  short_description: string;
  long_description: string;
  is_featured: boolean;
  is_published: boolean;
  free_trial_enabled: boolean;
  premiumOnly?: boolean;
  premiumonly?: boolean;
  created_at: string;
  updated_at: string;
};

function mapAgent(row: AgentRow): AgentRecord {
  return {
    id: row.id,
    orgId: null,
    name: row.name,
    slug: row.slug,
    category: row.category,
    tags: row.tags ?? [],
    shortDescription: row.short_description,
    longDescription: row.long_description,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    freeTryEnabled: row.free_trial_enabled,
    premiumOnly: row.premiumOnly ?? row.premiumonly ?? false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

export async function getFeaturedAgents(limit = 3): Promise<AgentRecord[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("available_agents")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch featured agents: ${error.message}`);
  }

  return (data as AgentRow[]).map(mapAgent);
}

export async function getPublishedAgents(params?: {
  query?: string;
  category?: string;
  limit?: number;
}) {
  const supabase = getSupabaseServerClient();
  const query = params?.query?.trim();
  const category = params?.category?.trim();

  let request = supabase
    .from("available_agents")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    request = request.eq("category", category);
  }

  if (query) {
    request = request.or(
      [
        `name.ilike.%${query}%`,
        `short_description.ilike.%${query}%`,
        `long_description.ilike.%${query}%`,
        `category.ilike.%${query}%`
      ].join(",")
    );
  }

  if (params?.limit) {
    request = request.limit(params.limit);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  return (data as AgentRow[]).map(mapAgent);
}

export async function getAgentCategories() {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.from("available_agents").select("category").eq("is_published", true);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categoryRows = (data || []) as Array<{ category: string }>;
  const values = Array.from(new Set(categoryRows.map((row) => row.category)));
  return values.sort((a: string, b: string) => a.localeCompare(b));
}

export async function getAgentBySlug(slug: string) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("available_agents")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch agent: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapAgent(data as AgentRow);
}

export async function getAvailableAgents(orgId: string) {
  const supabase = getSupabaseServerClient();
  const [{ data: subscriptions, error: subscriptionsError }, { data, error }] = await Promise.all([
    supabase.from("subscribed_agents").select("agent_id").eq("org_id", orgId),
    supabase.from("available_agents").select("*").eq("is_published", true).order("created_at", { ascending: false })
  ]);

  if (subscriptionsError) {
    throw new Error(`Failed to fetch subscriptions: ${subscriptionsError.message}`);
  }

  if (error) {
    throw new Error(`Failed to fetch available agents: ${error.message}`);
  }

  const subscribedIds = new Set((subscriptions || []).map((row) => row.agent_id as string));
  return (data as AgentRow[]).filter((agent) => !subscribedIds.has(agent.id)).map(mapAgent);
}

export async function getOrgAgents(orgId: string) {
  const supabase = getSupabaseServerClient();
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("subscribed_agents")
    .select("agent_id")
    .eq("org_id", orgId);

  if (subscriptionsError) {
    throw new Error(`Failed to fetch org subscriptions: ${subscriptionsError.message}`);
  }

  const agentIds = (subscriptions || []).map((row) => row.agent_id as string);
  if (!agentIds.length) {
    return [];
  }

  const { data: agents, error } = await supabase
    .from("available_agents")
    .select("*")
    .in("id", agentIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch org agents: ${error.message}`);
  }

  return (agents as AgentRow[]).map(mapAgent);
}

export async function getOrgAgentById(orgId: string, agentId: string) {
  const supabase = getSupabaseServerClient();
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscribed_agents")
    .select("agent_id")
    .eq("org_id", orgId)
    .eq("agent_id", agentId)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error(`Failed to fetch org agent subscription: ${subscriptionError.message}`);
  }

  if (!subscription) {
    return null;
  }

  const { data, error } = await supabase
    .from("available_agents")
    .select("*")
    .eq("id", agentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch org agent: ${error.message}`);
  }

  return data ? mapAgent(data as AgentRow) : null;
}

export async function isAgentSubscribed(orgId: string, agentId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscribed_agents")
    .select("agent_id")
    .eq("org_id", orgId)
    .eq("agent_id", agentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check subscribed agent: ${error.message}`);
  }

  return Boolean(data);
}
