// =============================================================================
// Email Service Facade
// =============================================================================
// Provides a unified interface for email operations across providers
// =============================================================================

import { EmailConnection } from "@/schemas/connections";
import {
  createGmailClient,
  GmailSyncService,
  GmailActions,
  refreshAccessToken,
  parseGmailMessage,
  getMessage,
  listMessages,
  sendMessage,
} from "./gmail";
import {
  ParsedEmail,
  SyncResult,
  ListMessagesOptions,
  ListMessagesResult,
  SendOptions,
  ProviderLabel,
  EmailProvider as IEmailProvider,
} from "./types";
import { db } from "@/lib/libsql";
import { emailConnection } from "@/schemas";
import { eq } from "drizzle-orm";

// -----------------------------------------------------------------------------
// Email Service Factory
// -----------------------------------------------------------------------------
export async function createEmailService(
  connection: EmailConnection,
): Promise<EmailService> {
  // Ensure we have valid tokens
  let accessToken = connection.accessToken;

  if (
    connection.tokenExpiresAt &&
    new Date(connection.tokenExpiresAt) <= new Date()
  ) {
    if (!connection.refreshToken) {
      throw new Error("No refresh token available, re-authentication required");
    }

    // Refresh the token
    const refreshed = await refreshAccessToken(connection.refreshToken);
    accessToken = refreshed.accessToken;

    // Update in database
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

  switch (connection.provider) {
    case "gmail":
      return new GmailEmailService(connection, accessToken);
    case "outlook":
      throw new Error("Outlook provider not yet implemented");
    case "mock":
      return new MockEmailService(connection);
    default:
      throw new Error(`Unknown provider: ${connection.provider}`);
  }
}

// -----------------------------------------------------------------------------
// Email Service Interface
// -----------------------------------------------------------------------------
export interface EmailService {
  connection: EmailConnection;

  // Messages
  listMessages(options?: ListMessagesOptions): Promise<ListMessagesResult>;
  getMessage(messageId: string): Promise<ParsedEmail>;
  getMessages(messageIds: string[]): Promise<ParsedEmail[]>;

  // Message Actions
  markAsRead(messageId: string): Promise<void>;
  markAsUnread(messageId: string): Promise<void>;
  star(messageId: string): Promise<void>;
  unstar(messageId: string): Promise<void>;
  archive(messageId: string): Promise<void>;
  trash(messageId: string): Promise<void>;
  delete(messageId: string): Promise<void>;

  // Bulk Actions
  batchMarkAsRead(messageIds: string[]): Promise<void>;
  batchArchive(messageIds: string[]): Promise<void>;
  batchTrash(messageIds: string[]): Promise<void>;

  // Send
  send(options: SendOptions): Promise<ParsedEmail>;

  // Sync
  fullSync(options?: { maxMessages?: number }): Promise<SyncResult>;
  incrementalSync(historyId: string): Promise<SyncResult>;

  // Labels
  listLabels(): Promise<ProviderLabel[]>;
}

// -----------------------------------------------------------------------------
// Gmail Email Service
// -----------------------------------------------------------------------------
class GmailEmailService implements EmailService {
  connection: EmailConnection;
  private gmail: ReturnType<typeof createGmailClient>;
  private syncService: GmailSyncService;

  constructor(connection: EmailConnection, accessToken: string) {
    this.connection = connection;
    this.gmail = createGmailClient(
      accessToken,
      connection.refreshToken || undefined,
    );
    this.syncService = new GmailSyncService(this.gmail, connection);
  }

  async listMessages(
    options: ListMessagesOptions = {},
  ): Promise<ListMessagesResult> {
    const result = await listMessages(this.gmail, {
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
      query: options.query,
      labelIds: options.labelIds,
    });

    // Fetch full message details
    const messages: ParsedEmail[] = [];
    for (const msg of result.messages) {
      const fullMessage = await getMessage(this.gmail, msg.id);
      messages.push(parseGmailMessage(fullMessage));
    }

    return {
      messages,
      nextPageToken: result.nextPageToken,
      totalEstimate: result.resultSizeEstimate,
    };
  }

  async getMessage(messageId: string): Promise<ParsedEmail> {
    const gmailMessage = await getMessage(this.gmail, messageId);
    return parseGmailMessage(gmailMessage);
  }

  async getMessages(messageIds: string[]): Promise<ParsedEmail[]> {
    const messages: ParsedEmail[] = [];
    for (const id of messageIds) {
      const msg = await this.getMessage(id);
      messages.push(msg);
    }
    return messages;
  }

  async markAsRead(messageId: string): Promise<void> {
    await GmailActions.markAsRead(this.gmail, messageId);
  }

  async markAsUnread(messageId: string): Promise<void> {
    await GmailActions.markAsUnread(this.gmail, messageId);
  }

  async star(messageId: string): Promise<void> {
    await GmailActions.star(this.gmail, messageId);
  }

  async unstar(messageId: string): Promise<void> {
    await GmailActions.unstar(this.gmail, messageId);
  }

  async archive(messageId: string): Promise<void> {
    await GmailActions.archive(this.gmail, messageId);
  }

  async trash(messageId: string): Promise<void> {
    await GmailActions.trash(this.gmail, messageId);
  }

  async delete(messageId: string): Promise<void> {
    await GmailActions.delete(this.gmail, messageId);
  }

  async batchMarkAsRead(messageIds: string[]): Promise<void> {
    await GmailActions.batchMarkAsRead(this.gmail, messageIds);
  }

  async batchArchive(messageIds: string[]): Promise<void> {
    await GmailActions.batchArchive(this.gmail, messageIds);
  }

  async batchTrash(messageIds: string[]): Promise<void> {
    for (const id of messageIds) {
      await GmailActions.trash(this.gmail, id);
    }
  }

  async send(options: SendOptions): Promise<ParsedEmail> {
    const gmailMessage = await sendMessage(this.gmail, {
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      body: options.body,
      bodyHtml: options.bodyHtml,
    });
    return parseGmailMessage(gmailMessage);
  }

  async fullSync(options: { maxMessages?: number } = {}): Promise<SyncResult> {
    return this.syncService.fullSync(options);
  }

  async incrementalSync(historyId: string): Promise<SyncResult> {
    return this.syncService.incrementalSync({ startHistoryId: historyId });
  }

  async listLabels(): Promise<ProviderLabel[]> {
    const { listLabels } = await import("./gmail");
    const labels = await listLabels(this.gmail);

    return labels.map((label) => ({
      id: label.id || "",
      name: label.name || "",
      type: label.type === "system" ? "system" : "user",
      messageListVisibility: label.messageListVisibility as
        | "show"
        | "hide"
        | undefined,
      labelListVisibility: label.labelListVisibility as
        | "labelShow"
        | "labelHide"
        | undefined,
      color: label.color
        ? {
            textColor: label.color.textColor || undefined,
            backgroundColor: label.color.backgroundColor || undefined,
          }
        : undefined,
    }));
  }
}

// -----------------------------------------------------------------------------
// Mock Email Service (for development)
// -----------------------------------------------------------------------------
class MockEmailService implements EmailService {
  connection: EmailConnection;

  constructor(connection: EmailConnection) {
    this.connection = connection;
  }

  async listMessages(): Promise<ListMessagesResult> {
    // Return mock data
    return {
      messages: [],
      nextPageToken: undefined,
      totalEstimate: 0,
    };
  }

  async getMessage(messageId: string): Promise<ParsedEmail> {
    throw new Error("Mock: Message not found");
  }

  async getMessages(messageIds: string[]): Promise<ParsedEmail[]> {
    return [];
  }

  async markAsRead(): Promise<void> {}
  async markAsUnread(): Promise<void> {}
  async star(): Promise<void> {}
  async unstar(): Promise<void> {}
  async archive(): Promise<void> {}
  async trash(): Promise<void> {}
  async delete(): Promise<void> {}
  async batchMarkAsRead(): Promise<void> {}
  async batchArchive(): Promise<void> {}
  async batchTrash(): Promise<void> {}

  async send(options: SendOptions): Promise<ParsedEmail> {
    throw new Error("Mock: Cannot send");
  }

  async fullSync(): Promise<SyncResult> {
    return {
      success: true,
      messages: [],
      newMessages: 0,
      updatedMessages: 0,
      deletedMessages: 0,
      syncType: "full",
      durationMs: 0,
    };
  }

  async incrementalSync(): Promise<SyncResult> {
    return {
      success: true,
      messages: [],
      newMessages: 0,
      updatedMessages: 0,
      deletedMessages: 0,
      syncType: "incremental",
      durationMs: 0,
    };
  }

  async listLabels(): Promise<ProviderLabel[]> {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Export Types
// -----------------------------------------------------------------------------
export type { ParsedEmail, SyncResult, ListMessagesOptions, SendOptions };
