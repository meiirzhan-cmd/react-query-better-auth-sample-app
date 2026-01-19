// =============================================================================
// Gmail OAuth Connect Route
// =============================================================================
// GET: Initiate Gmail OAuth flow
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSession } from "@/lib/session";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/connections/gmail/callback`,
    );

    // Get redirect parameter (where to redirect after successful connection)
    const searchParams = request.nextUrl.searchParams;
    const redirectPath = searchParams.get("redirect") || "/inbox";

    // Generate auth URL with state parameter
    const state = Buffer.from(
      JSON.stringify({
        userId: session.user.id,
        redirectPath,
      }),
    ).toString("base64");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      state,
      prompt: "consent", // Force consent screen to get refresh token
    });

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Gmail connect error:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate Gmail connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
