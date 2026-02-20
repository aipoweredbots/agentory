import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type FilterBarProps = {
  action: string;
  categories: string[];
  defaultQuery?: string;
  defaultCategory?: string;
  defaultSort?: string;
  defaultView?: "grid" | "table";
  featuredOnly?: boolean;
};

export function FilterBar({
  action,
  categories,
  defaultQuery,
  defaultCategory,
  defaultSort = "popular",
  defaultView = "grid",
  featuredOnly = false
}: FilterBarProps) {
  return (
    <div className="surface space-y-4 p-4">
      <form
        className="grid gap-3 md:grid-cols-[1.2fr_190px_170px_130px_auto]"
        action={action}
        method="GET"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={defaultQuery} placeholder="Search agents, categories, tags..." className="pl-9" />
        </div>
        <Select name="category" defaultValue={defaultCategory || "all"}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Select name="sort" defaultValue={defaultSort}>
          <option value="popular">Most popular</option>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
        </Select>
        <Select name="view" defaultValue={defaultView}>
          <option value="grid">Grid view</option>
          <option value="table">Table view</option>
        </Select>
        <Button type="submit" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Apply
        </Button>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground md:col-span-5">
          <input type="checkbox" name="featured" defaultChecked={featuredOnly} value="true" className="h-4 w-4 rounded border-input" />
          Featured only
        </label>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Quick categories</Badge>
        {categories.slice(0, 8).map((category) => (
          <Badge key={category} variant="secondary">
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
}
