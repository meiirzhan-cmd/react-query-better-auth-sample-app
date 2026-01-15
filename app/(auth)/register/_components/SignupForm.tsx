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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(register, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state?.success, router]);

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <p className="text-sm text-red-500">{state?.errors.name[0]}</p>
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
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
              {state?.errors?.email && (
                <p className="text-sm text-red-500">{state?.errors.email[0]}</p>
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
              <FieldDescription>Please confirm your password.</FieldDescription>
              {state?.errors?.password && (
                <p className="text-sm text-red-500">
                  {state?.errors.password[0]}
                </p>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
