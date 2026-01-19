// =============================================================================
// Single Message API Route
// =============================================================================
// GET: Get message by ID
// PATCH: Update message (star, read status, labels)
// DELETE: Delete message
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/libsql";
import {
  message,
  emailConnection,
  messageSummary,
  messageCategoryEnum,
} from "@/schemas";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// -----------------------------------------------------------------------------
// GET: Get Single Message
// -----------------------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get message with summary
    const [messageData] = await db
      .select()
      .from(message)
      .where(and(eq(message.id, id), eq(message.userId, session.user.id)))
      .limit(1);

    if (!messageData) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Get summary if exists
    const [summary] = await db
      .select()
      .from(messageSummary)
      .where(eq(messageSummary.messageId, id))
      .limit(1);

    // Mark as read if unread
    if (messageData.status === "unread") {
      await db
        .update(message)
        .set({ status: "read", updatedAt: new Date() })
        .where(eq(message.id, id));

      // Also update in Gmail
      const [connection] = await db
        .select()
        .from(emailConnection)
        .where(eq(emailConnection.id, messageData.connectionId))
        .limit(1);

      if (connection?.accessToken && messageData.externalId) {
        try {
          const { createGmailClient, GmailActions } =
            await import("@/lib/services/email/gmail");
          const gmail = createGmailClient(
            connection.accessToken,
            connection.refreshToken || undefined,
          );
          await GmailActions.markAsRead(gmail, messageData.externalId);
        } catch (error) {
          console.error("Failed to mark as read in Gmail:", error);
          // Don't fail the request, local status is already updated
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...messageData,
        summary: summary || null,
      },
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 },
    );
  }
}

// -----------------------------------------------------------------------------
// PATCH: Update Message
// -----------------------------------------------------------------------------
const updateMessageSchema = z.object({
  status: z.enum(["unread", "read", "archived", "trashed", "spam"]).optional(),
  isStarred: z.boolean().optional(),
  priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
  category: z.enum(messageCategoryEnum.enumValues).optional(),
  labelIds: z.array(z.string()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateMessageSchema.parse(body);

    // Get existing message
    const [existingMessage] = await db
      .select()
      .from(message)
      .where(and(eq(message.id, id), eq(message.userId, session.user.id)))
      .limit(1);

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Get connection for Gmail sync
    const [connection] = await db
      .select()
      .from(emailConnection)
      .where(eq(emailConnection.id, existingMessage.connectionId))
      .limit(1);

    // Sync changes to Gmail
    if (connection?.accessToken && existingMessage.externalId) {
      try {
        const { createGmailClient, GmailActions, modifyMessage } =
          await import("@/lib/services/email/gmail");
        const gmail = createGmailClient(
          connection.accessToken,
          connection.refreshToken || undefined,
        );

        // Handle status changes
        if (data.status && data.status !== existingMessage.status) {
          switch (data.status) {
            case "read":
              await GmailActions.markAsRead(gmail, existingMessage.externalId);
              break;
            case "unread":
              await GmailActions.markAsUnread(
                gmail,
                existingMessage.externalId,
              );
              break;
            case "archived":
              await GmailActions.archive(gmail, existingMessage.externalId);
              break;
            case "trashed":
              await GmailActions.trash(gmail, existingMessage.externalId);
              break;
            case "spam":
              await GmailActions.markAsSpam(gmail, existingMessage.externalId);
              break;
          }
        }

        // Handle star changes
        if (
          data.isStarred !== undefined &&
          data.isStarred !== existingMessage.isStarred
        ) {
          if (data.isStarred) {
            await GmailActions.star(gmail, existingMessage.externalId);
          } else {
            await GmailActions.unstar(gmail, existingMessage.externalId);
          }
        }
      } catch (error) {
        console.error("Failed to sync to Gmail:", error);
        // Continue with local update
      }
    }

    // Update in database
    const [updatedMessage] = await db
      .update(message)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(message.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 },
    );
  }
}

// -----------------------------------------------------------------------------
// DELETE: Delete Message
// -----------------------------------------------------------------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    // Get existing message
    const [existingMessage] = await db
      .select()
      .from(message)
      .where(and(eq(message.id, id), eq(message.userId, session.user.id)))
      .limit(1);

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Get connection for Gmail sync
    const [connection] = await db
      .select()
      .from(emailConnection)
      .where(eq(emailConnection.id, existingMessage.connectionId))
      .limit(1);

    // Sync to Gmail
    if (connection?.accessToken && existingMessage.externalId) {
      try {
        const { createGmailClient, GmailActions } =
          await import("@/lib/services/email/gmail");
        const gmail = createGmailClient(
          connection.accessToken,
          connection.refreshToken || undefined,
        );

        if (permanent) {
          // Permanently delete
          await GmailActions.delete(gmail, existingMessage.externalId);
        } else {
          // Move to trash
          await GmailActions.trash(gmail, existingMessage.externalId);
        }
      } catch (error) {
        console.error("Failed to delete in Gmail:", error);
      }
    }

    if (permanent) {
      // Delete from database
      await db.delete(message).where(eq(message.id, id));

      return NextResponse.json({
        success: true,
        message: "Message permanently deleted",
      });
    } else {
      // Just mark as trashed
      const [trashedMessage] = await db
        .update(message)
        .set({ status: "trashed", updatedAt: new Date() })
        .where(eq(message.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        data: trashedMessage,
      });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
