import { Badge } from "@/components/ui/badge";

export function AgentHero({
  name,
  category,
  description,
  premiumOnly,
  tags
}: {
  name: string;
  category: string;
  description: string;
  premiumOnly: boolean;
  tags: string[];
}) {
  return (
    <div className="surface relative overflow-hidden p-6 md:p-8">
      <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-14 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="featured">{category}</Badge>
          {premiumOnly ? <Badge variant="premium">Premium</Badge> : <Badge variant="free">Free Try</Badge>}
          <Badge variant="outline">Rating 4.8</Badge>
        </div>
        <h1 className="font-[var(--font-heading)] text-4xl font-black tracking-tight md:text-5xl">{name}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
