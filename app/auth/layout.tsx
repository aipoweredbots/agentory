import type { ReactNode } from "react";
import { PublicNav } from "@/components/layout/public-nav";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}
