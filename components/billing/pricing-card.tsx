import type { Plan } from "@/lib/db-types";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingCard({
  plan,
  label,
  description,
  price,
  credits,
  actions,
  isCurrent,
  pending,
  onChoose
}: {
  plan: Plan;
  label: string;
  description: string;
  price: string;
  credits: number;
  actions: number;
  isCurrent: boolean;
  pending: boolean;
  onChoose: (plan: Plan) => void;
}) {
  return (
    <Card className={isCurrent ? "brand-aura border-primary/40" : ""}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-[var(--font-heading)] text-4xl font-black tracking-tight">
          {price}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            {credits.toLocaleString()} credits / month
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            {actions.toLocaleString()} actions / month
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? "secondary" : "premium"}
          onClick={() => onChoose(plan)}
          disabled={isCurrent || plan === "FREE" || pending}
        >
          {isCurrent ? "Current plan" : pending ? "Redirecting..." : "Choose plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
