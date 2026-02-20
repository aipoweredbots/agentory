export const RoleEnum = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER"
} as const;

export const PlanEnum = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
  PREMIUM_PLUS: "PREMIUM_PLUS"
} as const;

export const SubscriptionStatusEnum = {
  ACTIVE: "ACTIVE",
  TRIALING: "TRIALING",
  CANCELED: "CANCELED",
  PAST_DUE: "PAST_DUE",
  INCOMPLETE: "INCOMPLETE",
  INCOMPLETE_EXPIRED: "INCOMPLETE_EXPIRED",
  UNPAID: "UNPAID"
} as const;

export type Role = (typeof RoleEnum)[keyof typeof RoleEnum];
export type Plan = (typeof PlanEnum)[keyof typeof PlanEnum];
export type SubscriptionStatus = (typeof SubscriptionStatusEnum)[keyof typeof SubscriptionStatusEnum];

export type AppUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Membership = {
  id: string;
  userId: string;
  orgId: string;
  role: Role;
  createdAt: Date;
  org?: Organization;
};

export type Agent = {
  id: string;
  orgId: string;
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
};

export type Subscription = {
  id: string;
  orgId: string;
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UsageMonth = {
  id: string;
  orgId: string;
  yearMonth: string;
  actionsUsed: number;
  creditsUsed: number;
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type UsageLedger = {
  id: string;
  orgId: string;
  userId: string;
  agentId: string | null;
  actionCount: number;
  creditCount: number;
  createdAt: Date;
};

export type Run = {
  id: string;
  orgId: string;
  userId: string;
  agentId: string;
  input: string;
  output: string;
  creditsConsumed: number;
  actionsConsumed: number;
  createdAt: Date;
};
