"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { FormStateLogin, LoginFormSchema } from "@/lib/zod/definitions-login";
import z from "zod";

export default async function login(
  _prevState: FormStateLogin,
  formData: FormData,
): Promise<FormStateLogin> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    const flattened = z.flattenError(validatedFields.error);

    return {
      errors: flattened.fieldErrors,
      formErrors: flattened.formErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // 2. Call Better Auth's server-side API
    // The nextCookies plugin automatically sets session cookies
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    // 3. Return success with user data
    return {
      success: true,
      user: {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      },
    };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        errors: {},
        formErrors: [error.message || "Invalid email or password"],
      };
    }

    console.error("Login error:", error);
    return {
      errors: {},
      formErrors: ["An unexpected error occurred. Please try again."],
    };
  }
}
