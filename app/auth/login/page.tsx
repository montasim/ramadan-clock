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
import { Lock, Sparkles } from "lucide-react";

interface State {
  success: boolean;
  error: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full btn-gradient rounded-full h-11 text-base font-bold tracking-wide"
      disabled={pending}
    >
      {pending ? "Signing in…" : "Sign In →"}
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
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden">
      {/* Large blobs unique to this page (in addition to layout blobs) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: "var(--grad-primary)" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="rounded-2xl border-primary/30 bg-primary/5 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="px-8 py-9">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="mx-auto mb-4 inline-flex p-4 rounded-2xl"
                style={{ background: "linear-gradient(135deg,rgba(59,130,246,.12),rgba(168,85,247,.12))" }}
              >
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold gradient-text tracking-tight">Admin Login</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Access the Ramadan Clock dashboard
              </p>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="h-11 rounded-xl border-border/60 bg-background/70 transition-all focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-border/60 bg-background/70 transition-all focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {state.error && (
                <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3.5 py-2.5 rounded-xl">
                  {state.error}
                </div>
              )}

              <SubmitButton />
            </form>

            <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-center">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary/60" />
                <Link href="/" className="hover:text-primary transition-colors font-medium">
                  Back to Ramadan Clock
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
