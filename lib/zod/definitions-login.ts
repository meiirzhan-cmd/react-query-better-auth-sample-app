import z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { message: "Please enter your password" }).trim(),
});

export type FormStateLogin =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      formErrors?: string[];
      success?: true;
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }
  | undefined;
