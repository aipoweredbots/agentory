import Link from "next/link";

const sections = [
  {
    title: "Product",
    links: [
      { href: "/marketplace", label: "Marketplace" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/#pricing", label: "Pricing" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/auth/sign-in", label: "Sign in" },
      { href: "/auth/sign-up", label: "Sign up" }
    ]
  },
  {
    title: "Resources",
    links: [{ href: "/dashboard/billing", label: "Billing" }]
  }
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/60 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-6">
        <div>
          <h3 className="font-[var(--font-heading)] text-xl font-extrabold text-gradient">Agentory</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            A vibrant AI marketplace for discovering, subscribing, and running business-ready agents.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">© {new Date().getFullYear()} Agentory. All rights reserved.</p>
        </div>
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-sm font-semibold">{section.title}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link className="text-muted-foreground hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
