// =============================================================================
// Gmail OAuth Callback Route
// =============================================================================
// GET: Handle OAuth callback from Google
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { db } from "@/lib/libsql";
import { emailConnection } from "@/schemas";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Gmail OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/inbox?error=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/inbox?error=missing_params`,
      );
    }

    // Decode state
    let stateData: { userId: string; redirectPath: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/inbox?error=invalid_state`,
      );
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/connections/gmail/callback`,
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    if (!userInfo.data.email) {
      throw new Error("No email found in user info");
    }

    // Calculate token expiration
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Check if connection already exists
    const existingConnections = await db
      .select()
      .from(emailConnection)
      .where(
        and(
          eq(emailConnection.userId, stateData.userId),
          eq(emailConnection.provider, "gmail"),
          eq(emailConnection.email, userInfo.data.email),
        ),
      );

    if (existingConnections.length > 0) {
      // Update existing connection
      await db
        .update(emailConnection)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingConnections[0].refreshToken,
          tokenExpiresAt: expiresAt,
          status: "active",
          lastSyncError: null,
          syncErrorCount: "0",
          updatedAt: new Date(),
        })
        .where(eq(emailConnection.id, existingConnections[0].id));
    } else {
      // Check if user has any connections
      const userConnections = await db
        .select()
        .from(emailConnection)
        .where(eq(emailConnection.userId, stateData.userId));

      const isFirstConnection = userConnections.length === 0;

      // Create new connection
      await db.insert(emailConnection).values({
        userId: stateData.userId,
        provider: "gmail",
        email: userInfo.data.email,
        displayName: userInfo.data.name || userInfo.data.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiresAt: expiresAt,
        status: "active",
        isDefault: isFirstConnection, // First connection is default
        syncEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Redirect back to the app
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${stateData.redirectPath}?connected=true`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Gmail callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/inbox?error=connection_failed`,
    );
  }
}
