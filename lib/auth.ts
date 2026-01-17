import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./libsql";
import * as schema from "../schemas/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // if you don't want automatic sign-in after registration
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Request offline access to get refresh token
      accessType: "offline",
      // Always prompt for consent to ensure refresh token
      prompt: "consent",
      // Gmail API scopes
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.labels",
      ],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - session expiration is updated daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - reduces database calls
    },
  },
  plugins: [
    nextCookies(), // handles cookies automatically in server actions
  ],
});
