import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/zodSchemas";
import { getCurrentMembership, requireAuth } from "@/lib/auth";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { PlanEnum, SubscriptionStatusEnum } from "@/lib/db-types";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const membership = await getCurrentMembership();
    const body = await request.json();
    const payload = checkoutSchema.parse(body);

    if (payload.plan === PlanEnum.FREE) {
      return NextResponse.json({ error: "Free plan does not require checkout" }, { status: 400 });
    }

    const priceId = getStripePriceId(payload.plan);
    if (!priceId) {
      return NextResponse.json({ error: "Missing Stripe price configuration" }, { status: 500 });
    }

    const stripe = getStripe();
    const supabase = getSupabaseServerClient();

    const { data: existingSubscription, error: existingSubError } = await supabase
      .from("subscriptions")
      .select("id,stripe_customer_id")
      .eq("org_id", membership.orgId)
      .maybeSingle();

    if (existingSubError) {
      return NextResponse.json({ error: `Subscription lookup failed: ${existingSubError.message}` }, { status: 500 });
    }

    let stripeCustomerId = existingSubscription?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: membership.org?.name || "Organization",
        metadata: {
          orgId: membership.orgId
        }
      });
      stripeCustomerId = customer.id;
    }

    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?checkout=success`,
      cancel_url: `${origin}/dashboard/billing?checkout=cancel`,
      metadata: {
        orgId: membership.orgId,
        plan: payload.plan
      },
      allow_promotion_codes: true
    });

    const { data: upsertedSubscription, error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          org_id: membership.orgId,
          plan: PlanEnum.FREE,
          stripe_customer_id: stripeCustomerId,
          status: SubscriptionStatusEnum.ACTIVE
        },
        { onConflict: "org_id" }
      )
      .select("id")
      .single();

    if (upsertError || !upsertedSubscription) {
      return NextResponse.json({ error: `Subscription upsert failed: ${upsertError?.message || "unknown"}` }, { status: 500 });
    }

    return NextResponse.json({ url: checkout.url, subscriptionId: upsertedSubscription.id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
