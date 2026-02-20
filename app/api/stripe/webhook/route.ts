import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { PlanEnum, SubscriptionStatusEnum, type Plan, type SubscriptionStatus } from "@/lib/db-types";
import { getSupabaseServerClient } from "@/lib/supabase-server";

function planFromPriceId(priceId: string | undefined | null): Plan {
  if (!priceId) {
    return PlanEnum.FREE;
  }

  if (priceId === process.env.STRIPE_PRICE_PREMIUM_PLUS) {
    return PlanEnum.PREMIUM_PLUS;
  }

  if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
    return PlanEnum.PREMIUM;
  }

  return PlanEnum.FREE;
}

function statusFromStripe(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatusEnum.ACTIVE;
    case "trialing":
      return SubscriptionStatusEnum.TRIALING;
    case "canceled":
      return SubscriptionStatusEnum.CANCELED;
    case "past_due":
      return SubscriptionStatusEnum.PAST_DUE;
    case "incomplete":
      return SubscriptionStatusEnum.INCOMPLETE;
    case "incomplete_expired":
      return SubscriptionStatusEnum.INCOMPLETE_EXPIRED;
    case "unpaid":
      return SubscriptionStatusEnum.UNPAID;
    default:
      return SubscriptionStatusEnum.ACTIVE;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: `Webhook verification failed: ${String(error)}` }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      const plan = (session.metadata?.plan as Plan | undefined) || PlanEnum.FREE;

      if (orgId) {
        const { error } = await supabase.from("subscriptions").upsert(
          {
            org_id: orgId,
            plan,
            status: SubscriptionStatusEnum.ACTIVE,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null
          },
          { onConflict: "org_id" }
        );

        if (error) {
          throw new Error(`WEBHOOK_SUBSCRIPTION_UPSERT_FAILED: ${error.message}`);
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price?.id;
      const plan = planFromPriceId(priceId);

      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan,
          status: statusFromStripe(subscription.status),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        throw new Error(`WEBHOOK_SUBSCRIPTION_UPDATE_FAILED: ${error.message}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
