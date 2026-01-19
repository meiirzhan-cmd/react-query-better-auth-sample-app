// =============================================================================
// Gmail Connect API Route
// =============================================================================
// GET: Initiate Gmail OAuth flow for connecting email
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { google } from "googleapis";

// -----------------------------------------------------------------------------
// GET: Initiate OAuth
// -----------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get("redirect") || "/settings/connections";

    // Create OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BETTER_AUTH_URL}/api/connections/gmail/callback`,
    );

    // Generate state with user ID and redirect URL
    const state = Buffer.from(
      JSON.stringify({
        userId: session.user.id,
        redirect: redirectUrl,
      }),
    ).toString("base64");

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.labels",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      state,
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Gmail connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Gmail connection" },
      { status: 500 },
    );
  }
}
