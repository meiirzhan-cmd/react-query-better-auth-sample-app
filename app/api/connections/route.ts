// =============================================================================
// Email Connections API Route
// =============================================================================
// GET: List all email connections for the user
// =============================================================================

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/libsql";
import { emailConnection } from "@/schemas";
import { eq } from "drizzle-orm";

// -----------------------------------------------------------------------------
// GET: List Connections
// -----------------------------------------------------------------------------
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await db
      .select({
        id: emailConnection.id,
        provider: emailConnection.provider,
        email: emailConnection.email,
        displayName: emailConnection.displayName,
        status: emailConnection.status,
        isDefault: emailConnection.isDefault,
        syncEnabled: emailConnection.syncEnabled,
        lastSyncAt: emailConnection.lastSyncAt,
        lastSyncError: emailConnection.lastSyncError,
        createdAt: emailConnection.createdAt,
      })
      .from(emailConnection)
      .where(eq(emailConnection.userId, session.user.id));

    return NextResponse.json({
      success: true,
      data: connections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 },
    );
  }
}
