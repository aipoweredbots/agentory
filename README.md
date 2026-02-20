# Agentory

Agentory is a production-ready AI marketplace starter built with Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase Auth + database, and Stripe.

## Features

- Public marketplace with featured carousel and agent detail pages
- Supabase Auth (Google OAuth + email magic link)
- Organization model with RBAC (`OWNER`, `ADMIN`, `MEMBER`)
- Invite tokens with acceptance flow (`/invite/[token]`)
- Agent management CRUD with publish/unpublish controls
- Sandbox run engine (mocked output) with usage/credit consumption
- Monthly usage tracking (`usage_ledger`, `usage_month`) with plan limits
- Billing plans (`FREE`, `PREMIUM`, `PREMIUM_PLUS`) with Stripe checkout + webhook sync + portal
- Account management with delete-account flow
- Accessible responsive UI, dark mode, loading/error states, toasts
- Vitest tests for auth guard, RBAC, and one server action

## Tech Stack

- Next.js 14+ (App Router)
- React + TypeScript
- Tailwind CSS + Radix/shadcn-inspired reusable primitives
- Supabase (Auth + Postgres API)
- Stripe Subscriptions
- Zod + React Hook Form
- Server Actions + Route Handlers
- Zustand (upgrade modal state)
- Vitest

## Environment Variables

Copy `.env.example` to `.env` and fill values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (optional, only if you still need direct SQL tools)
- `DIRECT_URL` (optional)
- `NEXTAUTH_URL` (used as app origin fallback in some routes)
- `NEXTAUTH_SECRET` (optional legacy fallback)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional legacy)
- `EMAIL_SERVER` / `EMAIL_FROM` (optional legacy)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PREMIUM`
- `STRIPE_PRICE_PREMIUM_PLUS`
- `STRIPE_CUSTOMER_PORTAL_URL` (optional)
- `SEED_DEMO_USER_EMAIL` (optional)

## Setup

1. Install dependencies

```bash
npm install
```

2. Create schema in Supabase SQL editor

```sql
-- run this file
supabase/schema.sql
```

3. Seed demo data

```bash
npm run seed
```

4. Start development server

```bash
npm run dev
```

5. Run tests

```bash
npm run test
```

## Supabase Auth Redirects

In Supabase Auth settings, add:

- `http://localhost:3000/auth/callback`

## Stripe Notes

- Create Stripe products/prices for `PREMIUM` and `PREMIUM_PLUS`
- Add corresponding `price_...` IDs in `.env`
- Configure webhook endpoint: `POST /api/stripe/webhook`
- Enable events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint project
- `npm run typecheck` - TypeScript checks
- `npm run test` - run Vitest
- `npm run seed` - seed Supabase demo data
