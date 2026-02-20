export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-muted-foreground md:px-6">
        <p className="font-medium text-foreground">Agentory</p>
        <p>Production-ready AI agent marketplace starter built with Next.js, Prisma, Auth.js, and Stripe.</p>
        <p>© {new Date().getFullYear()} Agentory. All rights reserved.</p>
      </div>
    </footer>
  );
}
