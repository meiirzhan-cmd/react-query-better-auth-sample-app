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
import { cn } from "@/lib/utils";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import login from "../action";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(login, {
    errors: {},
    formErrors: [],
  });
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state?.success, router]);

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
                <Input id="password" type="password" name="password" required />
                {state?.errors?.password && (
                  <p className="text-sm text-red-500">
                    {state?.errors.password[0]}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/register">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
