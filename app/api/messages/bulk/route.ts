// =============================================================================
// Bulk Message Actions API Route
// =============================================================================
// POST: Perform bulk actions on multiple messages
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/libsql";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  createGmailClient,
  batchModifyMessages,
  GmailActions,
} from "@/lib/services/email/gmail";
import { message, MessageStatus } from "@/schemas/messages";
import { emailConnection } from "@/schemas/connections";

// -----------------------------------------------------------------------------
// Request Schema
// -----------------------------------------------------------------------------
const bulkActionSchema = z.object({
  messageIds: z.array(z.string()).min(1).max(100),
  action: z.enum([
    "archive",
    "trash",
    "markRead",
    "markUnread",
    "star",
    "unstar",
    "markSpam",
    "unspam",
    "delete",
    "addLabel",
    "removeLabel",
  ]),
  labelId: z.string().optional(),
});

// -----------------------------------------------------------------------------
// POST: Bulk Actions
// -----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messageIds, action, labelId } = bulkActionSchema.parse(body);

    // Validate label is provided for label actions
    if ((action === "addLabel" || action === "removeLabel") && !labelId) {
      return NextResponse.json(
        { error: "labelId is required for label actions" },
        { status: 400 },
      );
    }

    // Get messages
    const messages = await db
      .select()
      .from(message)
      .where(
        and(
          inArray(message.id, messageIds),
          eq(message.userId, session.user.id),
        ),
      );

    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages found" }, { status: 404 });
    }

    // Group messages by connection for batch operations
    const messagesByConnection = new Map<string, typeof messages>();
    for (const msg of messages) {
      const existing = messagesByConnection.get(msg.connectionId) || [];
      existing.push(msg);
      messagesByConnection.set(msg.connectionId, existing);
    }

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as { messageId: string; error: string }[],
    };

    // Process each connection's messages
    for (const [connectionId, connectionMessages] of messagesByConnection) {
      // Get connection
      const [connection] = await db
        .select()
        .from(emailConnection)
        .where(eq(emailConnection.id, connectionId))
        .limit(1);

      if (!connection?.accessToken) {
        for (const msg of connectionMessages) {
          results.failed++;
          results.errors.push({
            messageId: msg.id,
            error: "Connection not authorized",
          });
        }
        continue;
      }

      const gmail = createGmailClient(
        connection.accessToken,
        connection.refreshToken || undefined,
      );

      const externalIds = connectionMessages
        .map((m) => m.externalId)
        .filter((id): id is string => Boolean(id));

      try {
        // Perform Gmail batch operation
        switch (action) {
          case "archive":
            await batchModifyMessages(gmail, externalIds, {
              removeLabelIds: ["INBOX"],
            });
            break;

          case "trash":
            // Trash needs individual calls
            for (const id of externalIds) {
              await GmailActions.trash(gmail, id);
            }
            break;

          case "markRead":
            await batchModifyMessages(gmail, externalIds, {
              removeLabelIds: ["UNREAD"],
            });
            break;

          case "markUnread":
            await batchModifyMessages(gmail, externalIds, {
              addLabelIds: ["UNREAD"],
            });
            break;

          case "star":
            await batchModifyMessages(gmail, externalIds, {
              addLabelIds: ["STARRED"],
            });
            break;

          case "unstar":
            await batchModifyMessages(gmail, externalIds, {
              removeLabelIds: ["STARRED"],
            });
            break;

          case "markSpam":
            await batchModifyMessages(gmail, externalIds, {
              addLabelIds: ["SPAM"],
              removeLabelIds: ["INBOX"],
            });
            break;

          case "unspam":
            await batchModifyMessages(gmail, externalIds, {
              removeLabelIds: ["SPAM"],
              addLabelIds: ["INBOX"],
            });
            break;

          case "delete":
            // Delete needs individual calls
            for (const id of externalIds) {
              await GmailActions.delete(gmail, id);
            }
            break;

          case "addLabel":
            if (labelId) {
              await batchModifyMessages(gmail, externalIds, {
                addLabelIds: [labelId],
              });
            }
            break;

          case "removeLabel":
            if (labelId) {
              await batchModifyMessages(gmail, externalIds, {
                removeLabelIds: [labelId],
              });
            }
            break;
        }

        interface MessageDbUpdate {
          updatedAt: Date;
          status?: MessageStatus;
          isStarred?: boolean;
        }

        // Update local database
        const dbUpdates: MessageDbUpdate = { updatedAt: new Date() };

        switch (action) {
          case "archive":
            dbUpdates.status = "archived";
            break;
          case "trash":
            dbUpdates.status = "trashed";
            break;
          case "markRead":
            dbUpdates.status = "read";
            break;
          case "markUnread":
            dbUpdates.status = "unread";
            break;
          case "star":
            dbUpdates.isStarred = true;
            break;
          case "unstar":
            dbUpdates.isStarred = false;
            break;
          case "markSpam":
            dbUpdates.status = "spam";
            break;
          case "unspam":
            dbUpdates.status = "read";
            break;
        }

        // Update messages in database
        const msgIds = connectionMessages.map((m) => m.id);

        if (action === "delete") {
          // Delete from database
          await db.delete(message).where(inArray(message.id, msgIds));
        } else if (Object.keys(dbUpdates).length > 1) {
          // Update in database (more than just updatedAt)
          await db
            .update(message)
            .set(dbUpdates)
            .where(inArray(message.id, msgIds));
        }

        results.processed += connectionMessages.length;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        for (const msg of connectionMessages) {
          results.failed++;
          results.errors.push({
            messageId: msg.id,
            error: errorMessage,
          });
        }
      }
    }

    return NextResponse.json({
      success: results.failed === 0,
      data: results,
    });
  } catch (error) {
    console.error("Bulk action error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 },
    );
  }
}
