// =============================================================================
// Gmail OAuth Callback API Route
// =============================================================================
// GET: Handle OAuth callback and store tokens
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/libsql";
import { emailConnection } from "@/schemas";
import { google } from "googleapis";
import { eq, and } from "drizzle-orm";

// -----------------------------------------------------------------------------
// GET: OAuth Callback
// -----------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle errors from Google
    if (error) {
      console.error("Gmail OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.BETTER_AUTH_URL}/settings/connections?error=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.BETTER_AUTH_URL}/settings/connections?error=missing_params`,
      );
    }

    // Decode state
    let stateData: { userId: string; redirect: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    } catch {
      return NextResponse.redirect(
        `${process.env.BETTER_AUTH_URL}/settings/connections?error=invalid_state`,
      );
    }

    // Verify session
    const session = await getSession();
    if (!session?.user || session.user.id !== stateData.userId) {
      return NextResponse.redirect(
        `${process.env.BETTER_AUTH_URL}/login?redirect=${encodeURIComponent(stateData.redirect)}`,
      );
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BETTER_AUTH_URL}/api/connections/gmail/callback`,
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.BETTER_AUTH_URL}/settings/connections?error=no_token`,
      );
    }

    // Get user's email info
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    if (!userInfo.data.email) {
      return NextResponse.redirect(
        `${process.env.BETTER_AUTH_URL}/settings/connections?error=no_email`,
      );
    }

    // Check if connection already exists
    const [existingConnection] = await db
      .select()
      .from(emailConnection)
      .where(
        and(
          eq(emailConnection.userId, session.user.id),
          eq(emailConnection.email, userInfo.data.email),
          eq(emailConnection.provider, "gmail"),
        ),
      )
      .limit(1);

    const tokenExpiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    if (existingConnection) {
      // Update existing connection
      await db
        .update(emailConnection)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingConnection.refreshToken,
          tokenExpiresAt,
          scope: tokens.scope || undefined,
          status: "active",
          lastSyncError: null,
          syncErrorCount: "0",
          updatedAt: new Date(),
        })
        .where(eq(emailConnection.id, existingConnection.id));
    } else {
      // Check if this is the first connection (make it default)
      const existingConnections = await db
        .select({ id: emailConnection.id })
        .from(emailConnection)
        .where(eq(emailConnection.userId, session.user.id));

      const isFirst = existingConnections.length === 0;

      // Create new connection
      await db.insert(emailConnection).values({
        userId: session.user.id,
        provider: "gmail",
        email: userInfo.data.email,
        displayName: userInfo.data.name || undefined,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiresAt,
        scope: tokens.scope || undefined,
        status: "active",
        isDefault: isFirst,
        syncEnabled: true,
      });
    }

    // Redirect to success page or trigger initial sync
    const successUrl = `${process.env.BETTER_AUTH_URL}${stateData.redirect}?success=gmail_connected&email=${encodeURIComponent(userInfo.data.email)}`;
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Gmail callback error:", error);
    return NextResponse.redirect(
      `${process.env.BETTER_AUTH_URL}/settings/connections?error=callback_failed`,
    );
  }
}
