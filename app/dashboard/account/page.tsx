import Link from "next/link";
import { Laptop, ShieldCheck, Trash2 } from "lucide-react";
import { requirePageAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteAccountForm } from "@/components/forms/delete-account-form";
import { PageHeader } from "@/components/ui/section";

export default async function AccountPage() {
  const session = await requirePageAuth("/dashboard/account");

  return (
    <div className="space-y-6">
      <PageHeader title="Account" subtitle="Manage profile, session controls, and security preferences." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Name: {session.user.name || "-"}</p>
            <p>Email: {session.user.email}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">Manage plan</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Active sessions panel is coming soon. Sign out from the sidebar if needed.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Password
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Email magic links and Google OAuth are enabled. Password updates are hidden for this auth configuration.
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
