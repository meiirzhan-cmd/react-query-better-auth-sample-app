"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { FormState, SignupFormSchema } from "@/lib/zod/definitions-register";
import z from "zod";

export default async function register(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirm-password"),
  });

  if (!validatedFields.success) {
    const flattened = z.flattenError(validatedFields.error);

    return {
      errors: flattened.fieldErrors,
      formErrors: flattened.formErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // 2. Call Better Auth's server-side API
    // The nextCookies plugin automatically sets session cookies (if autoSignIn is true)
    const response = await auth.api.signUpEmail({
      body: {
        name,
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
      const errorMessage = error.message || "Registration failed";

      // Handle duplicate email error
      if (
        errorMessage.toLowerCase().includes("email") ||
        errorMessage.toLowerCase().includes("already exists")
      ) {
        return {
          errors: { email: ["This email is already registered"] },
          formErrors: [],
        };
      }

      return {
        errors: {},
        formErrors: [errorMessage],
      };
    }

    console.error("Registration error:", error);
    return {
      errors: {},
      formErrors: ["An unexpected error occurred. Please try again."],
    };
  }
}
