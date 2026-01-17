import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({});
export const { signIn, signUp, signOut, useSession } = authClient;

export const signInWithGoogle = async () => {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: "/inbox",
  });
};

// Helper to request additional Gmail scopes after initial sign-up
// Use this if you want to add more permissions later
export const requestGmailAccess = async () => {
  return authClient.linkSocial({
    provider: "google",
    scopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.labels",
    ],
  });
};
