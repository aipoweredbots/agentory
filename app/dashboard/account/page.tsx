import Link from "next/link";
import { requirePageAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteAccountForm } from "@/components/forms/delete-account-form";

export default async function AccountPage() {
  const session = await requirePageAuth("/dashboard/account");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">Manage login preferences and account lifecycle settings.</p>
      </div>

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
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Email magic links and Google OAuth are enabled. Password updates are hidden for this auth configuration.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
