import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "Deprecated endpoint. Authentication is handled by Supabase Auth.",
      code: "AUTH_PROVIDER_MIGRATED"
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Deprecated endpoint. Authentication is handled by Supabase Auth.",
      code: "AUTH_PROVIDER_MIGRATED"
    },
    { status: 410 }
  );
}
