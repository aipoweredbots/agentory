"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getHumanReadableError } from "@/lib/errorMessages";

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMagicLink = async () => {
    if (!email) {
      return;
    }

    setPending(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextPath = callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
        }
      });

      if (otpError) {
        toast.error(getHumanReadableError(otpError, "send magic link"));
        return;
      }

      toast.success("Magic link sent. Check your inbox.");
    } catch (sendError) {
      toast.error(getHumanReadableError(sendError, "send magic link"));
    } finally {
      setPending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const nextPath = callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent"
          }
        }
      });

      if (oauthError) {
        setError(getHumanReadableError(oauthError, "sign in with Google"));
        setIsLoading(false);
      }
    } catch (err) {
      setError(getHumanReadableError(err, "sign in with Google"));
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>{mode === "sign-in" ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>Continue with Google or request an email magic link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
          Continue with Google
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button className="w-full" variant="premium" disabled={!email || pending} onClick={sendMagicLink}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          Send magic link
        </Button>
        {error ? <p className="rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <span>
            New to Agentory?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/auth/sign-up">
              Create account
            </Link>
          </span>
        ) : (
          <span>
            Already have an account?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/auth/sign-in">
              Sign in
            </Link>
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
