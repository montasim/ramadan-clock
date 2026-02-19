"use client";

import { loginAction } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface State {
  success: boolean;
  error: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, setState] = useState<State>({ success: false, error: "" });
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await loginAction(formData);
    
    if (result && result.success && "email" in result) {
      // Call next-auth signIn on client side
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            {state.error && (
              <div className="text-sm text-destructive">{state.error}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton />
            <p className="text-xs text-muted-foreground text-center">
              <Link href="/" className="hover:underline">
                Back to home
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
