import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertAuthenticated } from "@/lib/auth-guards";
import { RoleEnum, SubscriptionStatusEnum, type Membership, type Role } from "@/lib/db-types";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { slugify } from "@/lib/utils";

type SupabaseAuthUser = {
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type LocalUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type AppSession = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    activeOrgId?: string;
    role?: Role;
  };
};

function getAuthClientForServerSession() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(_name: string, _value: string, _options: CookieOptions) {
        // Server components cannot set cookies directly.
      },
      remove(_name: string, _options: CookieOptions) {
        // Server components cannot remove cookies directly.
      }
    }
  });
}

async function createDefaultOrganizationForUser(userId: string, userName: string | null | undefined) {
  const supabase = getSupabaseServerClient();

  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    return;
  }

  const base = slugify(userName || "my-organization") || "my-organization";
  let slug = `${base}-${Math.floor(Math.random() * 10000)}`;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data: conflict } = await supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
    if (!conflict) {
      break;
    }

    slug = `${base}-${Math.floor(Math.random() * 10000)}`;
  }

  const { data: org, error: orgInsertError } = await supabase
    .from("organizations")
    .insert({
      name: `${userName || "My"} Org`,
      slug
    })
    .select("id")
    .single();

  if (orgInsertError || !org) {
    throw new Error(`ORG_CREATE_FAILED: ${orgInsertError?.message || "unknown"}`);
  }

  const { error: membershipInsertError } = await supabase.from("memberships").insert({
    org_id: org.id,
    user_id: userId,
    role: RoleEnum.OWNER
  });

  if (membershipInsertError) {
    throw new Error(`MEMBERSHIP_CREATE_FAILED: ${membershipInsertError.message}`);
  }

  await supabase.from("subscriptions").upsert(
    {
      org_id: org.id,
      plan: "FREE",
      status: SubscriptionStatusEnum.ACTIVE
    },
    { onConflict: "org_id" }
  );
}

async function upsertLocalUserFromSupabase(supabaseUser: SupabaseAuthUser): Promise<LocalUser> {
  if (!supabaseUser.email) {
    throw new Error("UNAUTHORIZED");
  }

  const metadata = supabaseUser.user_metadata || {};
  const fallbackName = (metadata.full_name as string | undefined) || (metadata.name as string | undefined) || null;
  const fallbackImage = (metadata.avatar_url as string | undefined) || null;

  const supabase = getSupabaseServerClient();

  const { data: user, error } = await supabase
    .from("users")
    .upsert(
      {
        email: supabaseUser.email,
        name: fallbackName,
        image: fallbackImage,
        updated_at: new Date().toISOString()
      },
      { onConflict: "email" }
    )
    .select("id,email,name,image")
    .single();

  if (error || !user) {
    throw new Error(`USER_UPSERT_FAILED: ${error?.message || "unknown"}`);
  }

  await createDefaultOrganizationForUser(user.id, user.name);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image
  };
}

export async function getServerAuthSession(): Promise<AppSession | null> {
  const authClient = getAuthClientForServerSession();
  if (!authClient) {
    return null;
  }

  const {
    data: { user },
    error
  } = await authClient.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const localUser = await upsertLocalUserFromSupabase({
    email: user.email,
    user_metadata: user.user_metadata
  });

  const supabase = getSupabaseServerClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id,role")
    .eq("user_id", localUser.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    user: {
      id: localUser.id,
      email: localUser.email,
      name: localUser.name,
      image: localUser.image,
      activeOrgId: membership?.org_id,
      role: membership?.role as Role | undefined
    }
  };
}

export async function requireAuth() {
  const session = await getServerAuthSession();
  assertAuthenticated(session?.user);

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requirePageAuth(redirectTo?: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent(redirectTo || "/dashboard");
    redirect(`/auth/sign-in?callbackUrl=${callbackUrl}`);
  }
  return session;
}

export async function getCurrentMembership(): Promise<Membership> {
  const session = await requireAuth();
  const supabase = getSupabaseServerClient();

  type MembershipRow = {
    id: string;
    user_id: string;
    org_id: string;
    role: Role;
    created_at: string;
    organizations:
      | {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        }
      | null;
  };

  const fetchMembership = async (userId: string, orgId?: string) => {
    let query = supabase
      .from("memberships")
      .select(
        "id,user_id,org_id,role,created_at,organizations!memberships_org_id_fkey ( id,name,slug,logo_url,website,created_at,updated_at )"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1);

    if (orgId) {
      query = query.eq("org_id", orgId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`MEMBERSHIP_QUERY_FAILED: ${error.message}`);
    }

    return (data as MembershipRow | null) ?? null;
  };

  const membershipRow =
    (await fetchMembership(session.user.id, session.user.activeOrgId)) ||
    (await fetchMembership(session.user.id));

  if (!membershipRow) {
    throw new Error("NO_ORG_MEMBERSHIP");
  }

  if (!membershipRow.organizations) {
    throw new Error("ORG_NOT_FOUND");
  }

  return {
    id: membershipRow.id,
    userId: membershipRow.user_id,
    orgId: membershipRow.org_id,
    role: membershipRow.role,
    createdAt: new Date(membershipRow.created_at),
    org: {
      id: membershipRow.organizations.id,
      name: membershipRow.organizations.name,
      slug: membershipRow.organizations.slug,
      logoUrl: membershipRow.organizations.logo_url,
      website: membershipRow.organizations.website,
      createdAt: new Date(membershipRow.organizations.created_at),
      updatedAt: new Date(membershipRow.organizations.updated_at)
    }
  };
}
