import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const agents = [
  {
    name: "Code Copilot Auditor",
    slug: "code-copilot-auditor",
    category: "Dev",
    tags: ["code", "review", "security"],
    short_description: "Reviews pull requests for risk and correctness.",
    long_description:
      "Upload code snippets and get architecture, correctness, and security observations tuned for engineering teams.",
    is_featured: true,
    premium_only: false,
    free_try_enabled: true
  },
  {
    name: "Landing Page Copy Crafter",
    slug: "landing-page-copy-crafter",
    category: "Marketing",
    tags: ["copywriting", "seo", "conversion"],
    short_description: "Generates high-converting website copy.",
    long_description:
      "Create headline variants, CTA copy, and audience-specific sections using proven persuasion frameworks.",
    is_featured: true,
    premium_only: false,
    free_try_enabled: true
  },
  {
    name: "Sales Discovery Assistant",
    slug: "sales-discovery-assistant",
    category: "Sales",
    tags: ["sales", "discovery", "crm"],
    short_description: "Builds discovery call notes and follow-up plans.",
    long_description:
      "Turn rough call inputs into structured opportunity summaries, objection maps, and next-step playbooks.",
    is_featured: false,
    premium_only: false,
    free_try_enabled: true
  },
  {
    name: "Interview Question Builder",
    slug: "interview-question-builder",
    category: "HR",
    tags: ["hiring", "interview", "talent"],
    short_description: "Creates role-specific interview question banks.",
    long_description:
      "Generate competency-based question sets with scoring rubrics for structured and fair hiring processes.",
    is_featured: false,
    premium_only: false,
    free_try_enabled: true
  },
  {
    name: "Financial Scenario Planner",
    slug: "financial-scenario-planner",
    category: "Finance",
    tags: ["forecast", "finance", "planning"],
    short_description: "Build quick planning scenarios for budget decisions.",
    long_description:
      "Run what-if analyses on revenue, margin, and hiring assumptions with concise executive summaries.",
    is_featured: true,
    premium_only: true,
    free_try_enabled: false
  },
  {
    name: "Outbound Sequence Composer",
    slug: "outbound-sequence-composer",
    category: "Sales",
    tags: ["email", "prospecting", "outbound"],
    short_description: "Designs personalized outbound sequences.",
    long_description: "Generate multi-touch outbound plans with message variants and channel-specific sequencing.",
    is_featured: false,
    premium_only: true,
    free_try_enabled: true
  },
  {
    name: "Policy Drafter",
    slug: "policy-drafter",
    category: "HR",
    tags: ["policy", "compliance", "onboarding"],
    short_description: "Drafts internal HR and operational policies.",
    long_description: "Create clean policy documents and rollout guidance tailored to org size and geography.",
    is_featured: false,
    premium_only: false,
    free_try_enabled: true
  },
  {
    name: "Churn Rescue Strategist",
    slug: "churn-rescue-strategist",
    category: "Marketing",
    tags: ["retention", "customer-success", "analytics"],
    short_description: "Builds churn rescue campaigns from risk signals.",
    long_description:
      "Use customer behavior summaries to produce proactive save plays and lifecycle communications.",
    is_featured: false,
    premium_only: true,
    free_try_enabled: true
  },
  {
    name: "API Documentation Refiner",
    slug: "api-documentation-refiner",
    category: "Dev",
    tags: ["docs", "api", "developer-experience"],
    short_description: "Improves API docs for faster onboarding.",
    long_description:
      "Convert rough endpoint notes into complete docs with examples, error cases, and implementation tips.",
    is_featured: false,
    premium_only: false,
    free_try_enabled: true
  },
  {
    name: "Board Update Summarizer",
    slug: "board-update-summarizer",
    category: "Finance",
    tags: ["board", "reporting", "kpi"],
    short_description: "Condenses operating metrics for board updates.",
    long_description:
      "Generate concise, decision-ready summaries from KPI snapshots and milestone updates.",
    is_featured: false,
    premium_only: true,
    free_try_enabled: false
  }
];

async function main() {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .upsert(
      {
        name: "Demo Labs",
        slug: "demo-labs",
        website: "https://example.com"
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (orgError || !org) {
    throw new Error(`Org seed failed: ${orgError?.message || "unknown"}`);
  }

  const { error: subscriptionError } = await supabase.from("subscriptions").upsert(
    {
      org_id: org.id,
      plan: "FREE",
      status: "ACTIVE"
    },
    { onConflict: "org_id" }
  );

  if (subscriptionError) {
    throw new Error(`Subscription seed failed: ${subscriptionError.message}`);
  }

  for (const agent of agents) {
    const { error: agentError } = await supabase.from("agents").upsert(
      {
        ...agent,
        is_published: true,
        org_id: org.id
      },
      { onConflict: "slug" }
    );

    if (agentError) {
      throw new Error(`Agent seed failed for ${agent.slug}: ${agentError.message}`);
    }
  }

  const demoUserEmail = process.env.SEED_DEMO_USER_EMAIL;
  if (demoUserEmail) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          email: demoUserEmail,
          name: "Demo Owner"
        },
        { onConflict: "email" }
      )
      .select("id")
      .single();

    if (userError || !user) {
      throw new Error(`Demo user seed failed: ${userError?.message || "unknown"}`);
    }

    const { error: membershipError } = await supabase.from("memberships").upsert(
      {
        user_id: user.id,
        org_id: org.id,
        role: "OWNER"
      },
      { onConflict: "user_id,org_id" }
    );

    if (membershipError) {
      throw new Error(`Demo membership seed failed: ${membershipError.message}`);
    }
  }

  console.log(`Seeded org demo-labs with ${agents.length} agents`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
