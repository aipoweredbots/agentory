import { NextResponse } from "next/server";
import { getCurrentMembership, requireAuth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const membership = await getCurrentMembership();
    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;

    const supabase = getSupabaseServerClient();
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("org_id", membership.orgId)
      .maybeSingle();

    if (error) {
      return NextResponse.redirect(`${origin}/dashboard/billing?portal=error`);
    }

    if (!subscription?.stripe_customer_id) {
      return NextResponse.redirect(`${origin}/dashboard/billing?portal=missing_customer`);
    }

    if (process.env.STRIPE_CUSTOMER_PORTAL_URL) {
      return NextResponse.redirect(process.env.STRIPE_CUSTOMER_PORTAL_URL);
    }

    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/dashboard/billing`
    });

    return NextResponse.redirect(session.url);
  } catch {
    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/dashboard/billing?portal=error`);
  }
}
