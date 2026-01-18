"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/utils";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import login from "../action";
import { authClient } from "@/lib/auth-client";
import GoogleIcon from "@/components/svg/GoogleIcon";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(login, {
    errors: {},
    formErrors: [],
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/inbox");
    }
  }, [state?.success, router]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/inbox",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Connecting..."
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form action={formAction}>
              <FieldGroup>
                {/* Display form-level errors */}
                {state?.formErrors && state?.formErrors.length > 0 && (
                  <div className="text-sm text-red-500">
                    {state?.formErrors.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                  {state?.errors?.email && (
                    <p className="text-sm text-red-500">
                      {state?.errors.email[0]}
                    </p>
                  )}
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                  {state?.errors?.password && (
                    <p className="text-sm text-red-500">
                      {state?.errors.password[0]}
                    </p>
                  )}
                </Field>
                <Field>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Logging in..." : "Login"}
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="/register">Sign up</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
