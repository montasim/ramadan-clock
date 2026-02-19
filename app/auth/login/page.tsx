"use client";

import { loginAction } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

interface State {
  success: boolean;
  error: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full mt-4 btn-gradient rounded-full h-11 text-base font-semibold"
      disabled={pending}
    >
      {pending ? "Signing in…" : "Sign In"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, setState] = useState<State>({ success: false, error: "" });
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await loginAction(formData);

    if (result && result.success && "email" in result) {
      const signInResult = await signIn("credentials", {
        email: result.email,
        password: result.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setState({ success: false, error: "Invalid email or password" });
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } else if (result && !result.success) {
      setState(result as State);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Full-page gradient backdrop */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.52 0.22 290 / 0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 100%, oklch(0.45 0.18 200 / 0.15) 0%, transparent 70%)",
        }}
      />
      {/* Decorative blobs */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: "var(--grad-primary)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "var(--grad-iftar)" }}
      />

      {/* Login card */}
      <div className="w-full max-w-md">
        <div className="gradient-border rounded-2xl bg-card shadow-2xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full" style={{ background: "var(--grad-primary)" }} />

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div
                className="mx-auto mb-4 inline-flex p-4 rounded-2xl"
                style={{ background: "var(--grad-hero)" }}
              >
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Admin Login</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your credentials to access the dashboard
              </p>
            </div>

            <form action={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="h-11 rounded-xl border-border/60 bg-background/70 focus:border-primary/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-border/60 bg-background/70 focus:border-primary/60"
                />
              </div>
              {state.error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  {state.error}
                </div>
              )}
              <SubmitButton />
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              <Link href="/" className="hover:text-foreground transition-colors hover:underline">
                ← Back to Ramadan Clock
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
