// =============================================================================
// Email Sync API Route
// =============================================================================
// POST: Trigger email synchronization
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/libsql";
import { emailConnection, message, syncHistory } from "@/schemas";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import {
  createGmailClient,
  GmailSyncService,
  refreshAccessToken,
} from "@/lib/services/email/gmail";
import { mapGmailLabelsToStatus } from "@/lib/services/email/types";

// -----------------------------------------------------------------------------
// Request Schema
// -----------------------------------------------------------------------------
const syncRequestSchema = z.object({
  connectionId: z.string().optional(),
  fullSync: z.boolean().optional().default(false),
  maxMessages: z.number().optional().default(100),
});

function getSyncResultMessage(results: { success: boolean }[]): string {
  const allSucceeded = results.every((r) => r.success);
  const someSucceeded = results.some((r) => r.success);

  if (allSucceeded) return "All connections synced successfully";
  if (someSucceeded) return "Some connections synced successfully";
  return "All syncs failed";
}

// -----------------------------------------------------------------------------
// POST: Trigger Sync
// -----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, fullSync, maxMessages } =
      syncRequestSchema.parse(body);

    // Get connections to sync
    let connections;
    if (connectionId) {
      connections = await db
        .select()
        .from(emailConnection)
        .where(
          and(
            eq(emailConnection.id, connectionId),
            eq(emailConnection.userId, session.user.id),
          ),
        );
    } else {
      connections = await db
        .select()
        .from(emailConnection)
        .where(
          and(
            eq(emailConnection.userId, session.user.id),
            eq(emailConnection.syncEnabled, true),
          ),
        );
    }

    if (connections.length === 0) {
      return NextResponse.json(
        { error: "No email connections found" },
        { status: 404 },
      );
    }

    const results = [];

    for (const connection of connections) {
      const syncStartTime = Date.now();
      let syncResult;

      try {
        // Check if token needs refresh
        let accessToken = connection.accessToken;
        if (
          connection.tokenExpiresAt &&
          new Date(connection.tokenExpiresAt) <= new Date()
        ) {
          if (!connection.refreshToken) {
            throw new Error("No refresh token available");
          }

          const refreshed = await refreshAccessToken(connection.refreshToken);
          accessToken = refreshed.accessToken;

          // Update tokens in database
          await db
            .update(emailConnection)
            .set({
              accessToken: refreshed.accessToken,
              tokenExpiresAt: refreshed.expiresAt,
              updatedAt: new Date(),
            })
            .where(eq(emailConnection.id, connection.id));
        }

        if (!accessToken) {
          throw new Error("No access token available");
        }

        // Create Gmail client and sync service
        const gmail = createGmailClient(
          accessToken,
          connection.refreshToken || undefined,
        );
        const syncService = new GmailSyncService(gmail, connection);

        // Determine sync type
        const shouldFullSync = fullSync || !connection.syncCursor;

        if (shouldFullSync) {
          // Full sync
          syncResult = await syncService.fullSync({
            maxMessages,
            query: "in:inbox OR in:sent",
          });
        } else {
          // Incremental sync
          syncResult = await syncService.incrementalSync({
            startHistoryId: connection.syncCursor!,
          });

          // If incremental sync requires full sync, do it
          if (syncResult.requiresFullSync) {
            syncResult = await syncService.fullSync({
              maxMessages,
              query: "in:inbox OR in:sent",
            });
          }
        }

        // Store messages in database
        if (syncResult.success && syncResult.messages.length > 0) {
          const messagesToInsert = syncResult.messages.map((msg) => ({
            userId: session.user.id,
            connectionId: connection.id,
            externalId: msg.externalId,
            threadId: msg.threadId,
            subject: msg.subject || null,
            from: msg.from,
            to: msg.to,
            cc: msg.cc,
            bcc: msg.bcc,
            snippet: msg.snippet || null,
            bodyText: msg.bodyText || null,
            bodyHtml: msg.bodyHtml || null,
            status: mapGmailLabelsToStatus(msg.labelIds),
            isStarred: msg.isStarred,
            isDraft: msg.isDraft,
            isSent: msg.isSent,
            hasAttachments: msg.hasAttachments,
            attachments: msg.attachments,
            receivedAt: msg.internalDate,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));

          // Upsert messages (update if exists, insert if not)
          for (const msgData of messagesToInsert) {
            // Check if message exists
            const [existing] = await db
              .select({ id: message.id })
              .from(message)
              .where(
                and(
                  eq(message.externalId, msgData.externalId),
                  eq(message.userId, session.user.id),
                ),
              )
              .limit(1);

            if (existing) {
              // Update existing message
              await db
                .update(message)
                .set({
                  ...msgData,
                  updatedAt: new Date(),
                })
                .where(eq(message.id, existing.id));
            } else {
              // Insert new message
              await db.insert(message).values(msgData);
            }
          }
        }

        // Handle deleted messages
        if (
          syncResult.deletedMessageIds &&
          syncResult.deletedMessageIds.length > 0
        ) {
          for (const externalId of syncResult.deletedMessageIds) {
            await db
              .update(message)
              .set({ status: "trashed", updatedAt: new Date() })
              .where(
                and(
                  eq(message.externalId, externalId),
                  eq(message.userId, session.user.id),
                ),
              );
          }
        }

        // Update connection sync cursor
        if (syncResult.historyId) {
          await db
            .update(emailConnection)
            .set({
              syncCursor: syncResult.historyId,
              lastSyncAt: new Date(),
              lastSyncError: null,
              syncErrorCount: "0",
              status: "active",
              updatedAt: new Date(),
            })
            .where(eq(emailConnection.id, connection.id));
        }

        // Record sync history
        await db.insert(syncHistory).values({
          connectionId: connection.id,
          syncType: shouldFullSync ? "full" : "incremental",
          status: "completed",
          messagesProcessed: String(syncResult.messages.length),
          newMessages: String(syncResult.newMessages),
          startedAt: new Date(syncStartTime),
          completedAt: new Date(),
          durationMs: String(Date.now() - syncStartTime),
        });

        results.push({
          connectionId: connection.id,
          email: connection.email,
          success: true,
          syncType: shouldFullSync ? "full" : "incremental",
          newMessages: syncResult.newMessages,
          updatedMessages: syncResult.updatedMessages,
          deletedMessages: syncResult.deletedMessages,
          durationMs: syncResult.durationMs,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Update connection with error
        await db
          .update(emailConnection)
          .set({
            lastSyncError: errorMessage,
            syncErrorCount: String(Number(connection.syncErrorCount || 0) + 1),
            status: errorMessage.includes("token") ? "expired" : "error",
            updatedAt: new Date(),
          })
          .where(eq(emailConnection.id, connection.id));

        // Record failed sync
        await db.insert(syncHistory).values({
          connectionId: connection.id,
          syncType: fullSync ? "full" : "incremental",
          status: "failed",
          messagesProcessed: "0",
          newMessages: "0",
          errorMessage,
          startedAt: new Date(syncStartTime),
          completedAt: new Date(),
          durationMs: String(Date.now() - syncStartTime),
        });

        results.push({
          connectionId: connection.id,
          email: connection.email,
          success: false,
          error: errorMessage,
        });
      }
    }

    // Determine overall success
    const someSucceeded = results.some((r) => r.success);

    return NextResponse.json({
      success: someSucceeded,
      message: getSyncResultMessage(results),
      results,
    });
  } catch (error) {
    console.error("Sync error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to sync emails" },
      { status: 500 },
    );
  }
}
