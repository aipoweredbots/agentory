import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type SearchFiltersProps = {
  categories: string[];
  defaultQuery?: string;
  defaultCategory?: string;
};

export function SearchFilters({ categories, defaultQuery, defaultCategory }: SearchFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_200px_auto]" action="/marketplace" method="GET">
      <Input name="q" defaultValue={defaultQuery} placeholder="Search agents, tags, categories..." />
      <Select name="category" defaultValue={defaultCategory || "all"}>
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <Button type="submit">Filter</Button>
    </form>
  );
}
