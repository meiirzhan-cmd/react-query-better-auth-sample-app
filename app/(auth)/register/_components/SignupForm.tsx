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
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import register from "../action";
import { authClient } from "@/lib/auth-client";
import GoogleIcon from "@/components/svg/GoogleIcon";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(register, undefined);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/inbox");
    }
  }, [state?.success, router]);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/inbox",
      });
    } catch (error) {
      console.error("Google sign-up error:", error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Google Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={handleGoogleSignUp}
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
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="John Doe"
                  required
                />
                {state?.errors?.name && (
                  <p className="text-sm text-red-500">
                    {state?.errors.name[0]}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
                {state?.errors?.email && (
                  <p className="text-sm text-red-500">
                    {state?.errors.email[0]}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" required />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                />
                <FieldDescription>
                  Please confirm your password.
                </FieldDescription>
                {state?.errors?.password && (
                  <p className="text-sm text-red-500">
                    {state?.errors.password[0]}
                  </p>
                )}
              </Field>
              <FieldGroup>
                <Field>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Creating account..." : "Create Account"}
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account? <a href="/login">Sign in</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
