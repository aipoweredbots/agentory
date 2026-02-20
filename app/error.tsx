"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-3 rounded-lg border bg-card p-6 text-center">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{error.message || "Unexpected error"}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
