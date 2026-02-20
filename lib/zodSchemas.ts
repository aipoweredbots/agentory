import { z } from "zod";
import { PlanEnum, RoleEnum } from "@/lib/db-types";

export const agentFormSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.string().min(2).max(40),
  tags: z.string().min(1),
  shortDescription: z.string().min(10).max(180),
  longDescription: z.string().min(30).max(3000),
  freeTryEnabled: z.boolean(),
  premiumOnly: z.boolean(),
  isFeatured: z.boolean().optional().default(false)
});

export const orgProfileSchema = z.object({
  name: z.string().min(2).max(120),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal(""))
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(RoleEnum)
});

export const updateRoleSchema = z.object({
  membershipId: z.string().uuid(),
  role: z.nativeEnum(RoleEnum)
});

export const removeMemberSchema = z.object({
  membershipId: z.string().uuid()
});

export const acceptInviteSchema = z.object({
  token: z.string().min(8)
});

export const runAgentSchema = z.object({
  agentId: z.string().uuid(),
  input: z.string().min(2).max(2000)
});

export const checkoutSchema = z.object({
  plan: z.nativeEnum(PlanEnum)
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE")
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;
export type OrgProfileValues = z.infer<typeof orgProfileSchema>;
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
export type RunAgentValues = z.infer<typeof runAgentSchema>;
