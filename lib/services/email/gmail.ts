// =============================================================================
// Gmail API Service
// =============================================================================
// Handles all Gmail API interactions including message sync, CRUD operations
// =============================================================================

import { gmail_v1, google } from "googleapis";
import { EmailConnection } from "@/schemas";
import {
  GmailMessage,
  GmailThread,
  ParsedEmail,
  EmailAddress,
  SyncResult,
  GmailLabel,
} from "./types";

export function createGmailClient(
  accessToken: string,
  refreshToken?: string,
): gmail_v1.Gmail {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

// -----------------------------------------------------------------------------
// Token Refresh
// -----------------------------------------------------------------------------
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Failed to refresh access token");
  }

  const expiresAt = credentials.expiry_date
    ? new Date(credentials.expiry_date)
    : new Date(Date.now() + 3600 * 1000); // Default 1 hour

  return {
    accessToken: credentials.access_token,
    expiresAt,
  };
}

export async function listMessages(
  gmail: gmail_v1.Gmail,
  options: {
    maxResults?: number;
    pageToken?: string;
    query?: string;
    labelIds?: string[];
  } = {},
): Promise<{
  messages: { id: string; threadId: string }[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}> {
  const { maxResults = 50, pageToken, query, labelIds } = options;

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    pageToken,
    q: query,
    labelIds,
  });

  return {
    messages: (response.data.messages || []).filter(
      (
        msg,
      ): msg is gmail_v1.Schema$Message & { id: string; threadId: string } =>
        Boolean(msg.id && msg.threadId),
    ),
    nextPageToken: response.data.nextPageToken || undefined,
    resultSizeEstimate: response.data.resultSizeEstimate || 0,
  };
}

export async function getMessage(
  gmail: gmail_v1.Gmail,
  messageId: string,
  format: "full" | "metadata" | "minimal" | "raw" = "full",
): Promise<GmailMessage> {
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format,
  });

  return response.data;
}

export async function getMessagesBatch(
  gmail: gmail_v1.Gmail,
  messageIds: string[],
  format: "full" | "metadata" | "minimal" = "full",
): Promise<GmailMessage[]> {
  // Process in batches of 100 (Gmail API limit)
  const batchSize = 100;
  const results: GmailMessage[] = [];

  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize);
    const promises = batch.map((id) => getMessage(gmail, id, format));

    const batchResults = await Promise.allSettled(promises);

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }

  return results;
}

// -----------------------------------------------------------------------------
// Thread Operations
// -----------------------------------------------------------------------------
export async function getThread(
  gmail: gmail_v1.Gmail,
  threadId: string,
  format: "full" | "metadata" | "minimal" = "full",
): Promise<GmailThread> {
  const response = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format,
  });

  return response.data;
}

// -----------------------------------------------------------------------------
// Message Modification
// -----------------------------------------------------------------------------
export async function modifyMessage(
  gmail: gmail_v1.Gmail,
  messageId: string,
  options: {
    addLabelIds?: string[];
    removeLabelIds?: string[];
  },
): Promise<GmailMessage> {
  const response = await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: options.addLabelIds,
      removeLabelIds: options.removeLabelIds,
    },
  });

  return response.data;
}

export async function trashMessage(
  gmail: gmail_v1.Gmail,
  messageId: string,
): Promise<GmailMessage> {
  const response = await gmail.users.messages.trash({
    userId: "me",
    id: messageId,
  });

  return response.data;
}

export async function untrashMessage(
  gmail: gmail_v1.Gmail,
  messageId: string,
): Promise<GmailMessage> {
  const response = await gmail.users.messages.untrash({
    userId: "me",
    id: messageId,
  });

  return response.data;
}

export async function deleteMessage(
  gmail: gmail_v1.Gmail,
  messageId: string,
): Promise<void> {
  await gmail.users.messages.delete({
    userId: "me",
    id: messageId,
  });
}

// -----------------------------------------------------------------------------
// Batch Modify
// -----------------------------------------------------------------------------
export async function batchModifyMessages(
  gmail: gmail_v1.Gmail,
  messageIds: string[],
  options: {
    addLabelIds?: string[];
    removeLabelIds?: string[];
  },
): Promise<void> {
  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: {
      ids: messageIds,
      addLabelIds: options.addLabelIds,
      removeLabelIds: options.removeLabelIds,
    },
  });
}

// -----------------------------------------------------------------------------
// Labels
// -----------------------------------------------------------------------------
export async function listLabels(gmail: gmail_v1.Gmail): Promise<GmailLabel[]> {
  const response = await gmail.users.labels.list({
    userId: "me",
  });

  return response.data.labels || [];
}

// -----------------------------------------------------------------------------
// History (Incremental Sync)
// -----------------------------------------------------------------------------
export async function getHistory(
  gmail: gmail_v1.Gmail,
  startHistoryId: string,
  options: {
    maxResults?: number;
    pageToken?: string;
    labelId?: string;
    historyTypes?: (
      | "messageAdded"
      | "messageDeleted"
      | "labelAdded"
      | "labelRemoved"
    )[];
  } = {},
): Promise<{
  history: gmail_v1.Schema$History[];
  nextPageToken?: string;
  historyId?: string;
}> {
  const response = await gmail.users.history.list({
    userId: "me",
    startHistoryId,
    maxResults: options.maxResults || 100,
    pageToken: options.pageToken,
    labelId: options.labelId,
    historyTypes: options.historyTypes,
  });

  return {
    history: response.data.history || [],
    nextPageToken: response.data.nextPageToken || undefined,
    historyId: response.data.historyId || undefined,
  };
}

// -----------------------------------------------------------------------------
// Send Email
// -----------------------------------------------------------------------------
export async function sendMessage(
  gmail: gmail_v1.Gmail,
  options: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyHtml?: string;
    threadId?: string;
    inReplyTo?: string;
    references?: string;
  },
): Promise<GmailMessage> {
  const boundary = "boundary_" + Date.now();

  // Build email headers
  const headers = [
    `To: ${options.to.join(", ")}`,
    options.cc?.length ? `Cc: ${options.cc.join(", ")}` : null,
    options.bcc?.length ? `Bcc: ${options.bcc.join(", ")}` : null,
    `Subject: ${options.subject}`,
    options.inReplyTo ? `In-Reply-To: ${options.inReplyTo}` : null,
    options.references ? `References: ${options.references}` : null,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ]
    .filter(Boolean)
    .join("\r\n");

  // Build email body
  let emailBody = `${headers}\r\n\r\n`;

  // Plain text part
  emailBody += `--${boundary}\r\n`;
  emailBody += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
  emailBody += `${options.body}\r\n\r\n`;

  // HTML part (if provided)
  if (options.bodyHtml) {
    emailBody += `--${boundary}\r\n`;
    emailBody += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
    emailBody += `${options.bodyHtml}\r\n\r\n`;
  }

  emailBody += `--${boundary}--`;

  // Base64 encode
  const encodedEmail = Buffer.from(emailBody)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedEmail,
      threadId: options.threadId,
    },
  });

  return response.data;
}

// -----------------------------------------------------------------------------
// Parse Gmail Message
// -----------------------------------------------------------------------------
export function parseGmailMessage(gmailMessage: GmailMessage): ParsedEmail {
  const headers = gmailMessage.payload?.headers || [];
  const getHeader = (name: string): string | undefined => {
    const header = headers.find(
      (h) => h.name?.toLowerCase() === name.toLowerCase(),
    );
    return header?.value || undefined;
  };

  // Parse email addresses
  const parseAddresses = (headerValue?: string): EmailAddress[] => {
    if (!headerValue) return [];

    // Simple regex for "Name <email>" or just "email"
    const regex = /(?:"?([^"<]*)"?\s*)?<?([^\s<>,]+@[^\s<>,]+)>?/g;
    const addresses: EmailAddress[] = [];
    let match;

    while ((match = regex.exec(headerValue)) !== null) {
      addresses.push({
        name: match[1]?.trim() || undefined,
        email: match[2].trim(),
      });
    }

    return addresses;
  };

  // Extract body content
  const extractBody = (
    payload: gmail_v1.Schema$MessagePart | undefined,
  ): { text?: string; html?: string } => {
    if (!payload) return {};

    const result: { text?: string; html?: string } = {};

    const processPartBody = (part: gmail_v1.Schema$MessagePart) => {
      if (part.body?.data) {
        const decoded = Buffer.from(part.body.data, "base64").toString("utf-8");

        if (part.mimeType === "text/plain") {
          result.text = decoded;
        } else if (part.mimeType === "text/html") {
          result.html = decoded;
        }
      }
    };

    // Check main payload
    processPartBody(payload);

    // Check parts recursively
    const processParts = (parts?: gmail_v1.Schema$MessagePart[]) => {
      if (!parts) return;

      for (const part of parts) {
        processPartBody(part);
        if (part.parts) {
          processParts(part.parts);
        }
      }
    };

    processParts(payload.parts);

    return result;
  };

  // Extract attachments
  const extractAttachments = (
    payload: gmail_v1.Schema$MessagePart | undefined,
  ): { id: string; filename: string; mimeType: string; size: number }[] => {
    const attachments: {
      id: string;
      filename: string;
      mimeType: string;
      size: number;
    }[] = [];

    const processPart = (part: gmail_v1.Schema$MessagePart) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType || "application/octet-stream",
          size: part.body.size || 0,
        });
      }

      if (part.parts) {
        part.parts.forEach(processPart);
      }
    };

    if (payload) {
      processPart(payload);
    }

    return attachments;
  };

  const body = extractBody(gmailMessage.payload);
  const attachments = extractAttachments(gmailMessage.payload);

  // Determine if read
  const labelIds = gmailMessage.labelIds || [];
  const isUnread = labelIds.includes("UNREAD");
  const isStarred = labelIds.includes("STARRED");
  const isTrash = labelIds.includes("TRASH");
  const isSpam = labelIds.includes("SPAM");
  const isDraft = labelIds.includes("DRAFT");
  const isSent = labelIds.includes("SENT");

  return {
    id: gmailMessage.id || "",
    threadId: gmailMessage.threadId || "",
    externalId: gmailMessage.id || "",
    historyId: gmailMessage.historyId || "",

    subject: getHeader("Subject") || "",
    from: parseAddresses(getHeader("From"))[0] || { email: "" },
    to: parseAddresses(getHeader("To")),
    cc: parseAddresses(getHeader("Cc")),
    bcc: parseAddresses(getHeader("Bcc")),
    replyTo: parseAddresses(getHeader("Reply-To")),

    snippet: gmailMessage.snippet || "",
    bodyText: body.text,
    bodyHtml: body.html,

    labelIds,
    isUnread,
    isStarred,
    isTrash,
    isSpam,
    isDraft,
    isSent,

    hasAttachments: attachments.length > 0,
    attachments,

    internalDate: gmailMessage.internalDate
      ? new Date(Number.parseInt(gmailMessage.internalDate, 10))
      : new Date(),

    internetMessageId: getHeader("Message-ID"),
    inReplyTo: getHeader("In-Reply-To"),
    references: getHeader("References"),

    sizeEstimate: gmailMessage.sizeEstimate || 0,
  };
}

// -----------------------------------------------------------------------------
// Sync Service
// -----------------------------------------------------------------------------
export class GmailSyncService {
  private readonly gmail: gmail_v1.Gmail;
  private readonly connection: EmailConnection;

  constructor(gmail: gmail_v1.Gmail, connection: EmailConnection) {
    this.gmail = gmail;
    this.connection = connection;
  }

  /**
   * Full sync - fetches all messages (with pagination)
   */
  async fullSync(
    options: {
      maxMessages?: number;
      query?: string;
      onProgress?: (progress: { fetched: number; total: number }) => void;
    } = {},
  ): Promise<SyncResult> {
    const { maxMessages = 500, query, onProgress } = options;
    const startTime = Date.now();
    const messages: ParsedEmail[] = [];
    let pageToken: string | undefined;
    let totalEstimate = 0;

    try {
      // First, get the list of message IDs
      const messageIds: string[] = [];

      do {
        const listResult = await listMessages(this.gmail, {
          maxResults: Math.min(100, maxMessages - messageIds.length),
          pageToken,
          query: query || "in:inbox OR in:sent",
        });

        if (listResult.resultSizeEstimate && !totalEstimate) {
          totalEstimate = listResult.resultSizeEstimate;
        }

        messageIds.push(...listResult.messages.map((m) => m.id));
        pageToken = listResult.nextPageToken;

        if (onProgress) {
          onProgress({ fetched: messageIds.length, total: totalEstimate });
        }
      } while (pageToken && messageIds.length < maxMessages);

      // Fetch full message details in batches
      const batchSize = 50;
      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize);
        const batchMessages = await getMessagesBatch(this.gmail, batch, "full");

        for (const gmailMsg of batchMessages) {
          messages.push(parseGmailMessage(gmailMsg));
        }

        if (onProgress) {
          onProgress({
            fetched: Math.min(i + batchSize, messageIds.length),
            total: messageIds.length,
          });
        }
      }

      // Get the latest historyId for incremental sync
      const profile = await this.gmail.users.getProfile({ userId: "me" });
      const historyId = profile.data.historyId || undefined;

      return {
        success: true,
        messages,
        newMessages: messages.length,
        updatedMessages: 0,
        deletedMessages: 0,
        historyId,
        syncType: "full",
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        messages: [],
        newMessages: 0,
        updatedMessages: 0,
        deletedMessages: 0,
        syncType: "full",
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Incremental sync - uses history API for changes since last sync
   */
  async incrementalSync(options: {
    startHistoryId: string;
    onProgress?: (progress: { processed: number }) => void;
  }): Promise<SyncResult> {
    const { startHistoryId, onProgress } = options;
    const startTime = Date.now();

    const addedMessageIds = new Set<string>();
    const deletedMessageIds = new Set<string>();
    const modifiedMessageIds = new Set<string>();

    try {
      let pageToken: string | undefined;
      let latestHistoryId = startHistoryId;
      let processed = 0;

      do {
        const historyResult = await getHistory(this.gmail, startHistoryId, {
          pageToken,
          historyTypes: [
            "messageAdded",
            "messageDeleted",
            "labelAdded",
            "labelRemoved",
          ],
        });

        for (const history of historyResult.history) {
          // Messages added
          if (history.messagesAdded) {
            for (const added of history.messagesAdded) {
              if (added.message?.id) {
                addedMessageIds.add(added.message.id);
              }
            }
          }

          // Messages deleted
          if (history.messagesDeleted) {
            for (const deleted of history.messagesDeleted) {
              if (deleted.message?.id) {
                deletedMessageIds.add(deleted.message.id);
                addedMessageIds.delete(deleted.message.id);
              }
            }
          }

          // Labels changed (treated as modifications)
          if (history.labelsAdded || history.labelsRemoved) {
            const labelChanges = [
              ...(history.labelsAdded || []),
              ...(history.labelsRemoved || []),
            ];
            for (const change of labelChanges) {
              if (
                change.message?.id &&
                !addedMessageIds.has(change.message.id)
              ) {
                modifiedMessageIds.add(change.message.id);
              }
            }
          }
        }

        if (historyResult.historyId) {
          latestHistoryId = historyResult.historyId;
        }

        pageToken = historyResult.nextPageToken;
        processed += historyResult.history.length;

        if (onProgress) {
          onProgress({ processed });
        }
      } while (pageToken);

      // Fetch new and modified messages
      const messageIdsToFetch = [
        ...Array.from(addedMessageIds),
        ...Array.from(modifiedMessageIds),
      ];

      const messages: ParsedEmail[] = [];

      if (messageIdsToFetch.length > 0) {
        const batchMessages = await getMessagesBatch(
          this.gmail,
          messageIdsToFetch,
          "full",
        );

        for (const gmailMsg of batchMessages) {
          messages.push(parseGmailMessage(gmailMsg));
        }
      }

      return {
        success: true,
        messages,
        newMessages: addedMessageIds.size,
        updatedMessages: modifiedMessageIds.size,
        deletedMessages: deletedMessageIds.size,
        deletedMessageIds: Array.from(deletedMessageIds),
        historyId: latestHistoryId,
        syncType: "incremental",
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      // If history is too old, need to do a full sync
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("historyId") || errorMessage.includes("404")) {
        return {
          success: false,
          messages: [],
          newMessages: 0,
          updatedMessages: 0,
          deletedMessages: 0,
          syncType: "incremental",
          durationMs: Date.now() - startTime,
          error: "History expired, full sync required",
          requiresFullSync: true,
        };
      }

      return {
        success: false,
        messages: [],
        newMessages: 0,
        updatedMessages: 0,
        deletedMessages: 0,
        syncType: "incremental",
        durationMs: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }
}

// -----------------------------------------------------------------------------
// Gmail Actions (CRUD helpers)
// -----------------------------------------------------------------------------
export const GmailActions = {
  /**
   * Mark message as read
   */
  markAsRead: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, { removeLabelIds: ["UNREAD"] }),

  /**
   * Mark message as unread
   */
  markAsUnread: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, { addLabelIds: ["UNREAD"] }),

  /**
   * Star message
   */
  star: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, { addLabelIds: ["STARRED"] }),

  /**
   * Unstar message
   */
  unstar: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, { removeLabelIds: ["STARRED"] }),

  /**
   * Archive message (remove from INBOX)
   */
  archive: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, { removeLabelIds: ["INBOX"] }),

  /**
   * Move to inbox (unarchive)
   */
  moveToInbox: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, { addLabelIds: ["INBOX"] }),

  /**
   * Move to trash
   */
  trash: trashMessage,

  /**
   * Remove from trash
   */
  untrash: untrashMessage,

  /**
   * Permanently delete
   */
  delete: deleteMessage,

  /**
   * Mark as spam
   */
  markAsSpam: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, {
      addLabelIds: ["SPAM"],
      removeLabelIds: ["INBOX"],
    }),

  /**
   * Mark as not spam
   */
  markAsNotSpam: (gmail: gmail_v1.Gmail, messageId: string) =>
    modifyMessage(gmail, messageId, {
      removeLabelIds: ["SPAM"],
      addLabelIds: ["INBOX"],
    }),

  /**
   * Batch mark as read
   */
  batchMarkAsRead: (gmail: gmail_v1.Gmail, messageIds: string[]) =>
    batchModifyMessages(gmail, messageIds, { removeLabelIds: ["UNREAD"] }),

  /**
   * Batch archive
   */
  batchArchive: (gmail: gmail_v1.Gmail, messageIds: string[]) =>
    batchModifyMessages(gmail, messageIds, { removeLabelIds: ["INBOX"] }),

  /**
   * Batch star
   */
  batchStar: (gmail: gmail_v1.Gmail, messageIds: string[]) =>
    batchModifyMessages(gmail, messageIds, { addLabelIds: ["STARRED"] }),
};
