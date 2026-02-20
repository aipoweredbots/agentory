import type { ReactNode } from "react";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="pb-6">{children}</main>
      <PublicFooter />
    </div>
  );
}
