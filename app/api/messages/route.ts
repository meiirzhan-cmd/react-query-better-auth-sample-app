// =============================================================================
// Messages API Route
// =============================================================================
// GET: List messages with filtering, sorting, pagination
// POST: Create new message (send email)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/libsql";
import {
  message,
  emailConnection,
  messageSummary,
  messageLabel,
  label,
} from "@/schemas";
import { eq, and, desc, asc, sql, or, like, inArray } from "drizzle-orm";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Query Params Schema
// -----------------------------------------------------------------------------
const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  status: z.enum(["unread", "read", "archived", "trashed", "spam"]).optional(),
  priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
  category: z
    .enum([
      "needs_reply",
      "fyi",
      "newsletter",
      "promotional",
      "transactional",
      "social",
      "automated",
      "personal",
      "work",
      "uncategorized",
    ])
    .optional(),
  labelIds: z.string().optional(),
  connectionId: z.string().optional(),
  search: z.string().optional(),
  hasAttachments: z.coerce.boolean().optional(),
  isStarred: z.coerce.boolean().optional(),
  folder: z.string().optional(),
  sortField: z.enum(["receivedAt", "from", "subject"]).default("receivedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// -----------------------------------------------------------------------------
// GET: List Messages
// -----------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = queryParamsSchema.parse(Object.fromEntries(searchParams));

    // Build query conditions
    const conditions = [eq(message.userId, session.user.id)];

    // Status filter
    if (params.status) {
      conditions.push(eq(message.status, params.status));
    }

    // Priority filter
    if (params.priority) {
      conditions.push(eq(message.priority, params.priority));
    }

    // Category filter
    if (params.category) {
      conditions.push(eq(message.category, params.category));
    }

    // Connection filter
    if (params.connectionId) {
      conditions.push(eq(message.connectionId, params.connectionId));
    }

    // Starred filter
    if (params.isStarred !== undefined) {
      conditions.push(eq(message.isStarred, params.isStarred));
    }

    // Has attachments filter
    if (params.hasAttachments !== undefined) {
      conditions.push(eq(message.hasAttachments, params.hasAttachments));
    }

    // Folder-based filtering
    if (params.folder) {
      switch (params.folder) {
        case "inbox":
          // Show unread and read messages (not archived, trashed, or spam)
          conditions.push(
            or(eq(message.status, "unread"), eq(message.status, "read"))!,
          );
          conditions.push(eq(message.isSent, false));
          conditions.push(eq(message.isDraft, false));
          break;
        case "sent":
          conditions.push(eq(message.isSent, true));
          break;
        case "drafts":
          conditions.push(eq(message.isDraft, true));
          break;
        case "starred":
          conditions.push(eq(message.isStarred, true));
          break;
        case "archive":
          conditions.push(eq(message.status, "archived"));
          break;
        case "trash":
          conditions.push(eq(message.status, "trashed"));
          break;
        case "spam":
          conditions.push(eq(message.status, "spam"));
          break;
        // Smart folders
        case "urgent":
          conditions.push(eq(message.priority, "urgent"));
          break;
        case "needs-reply":
          conditions.push(eq(message.category, "needs_reply"));
          break;
        case "fyi":
          conditions.push(eq(message.category, "fyi"));
          break;
        case "newsletter":
          conditions.push(eq(message.category, "newsletter"));
          break;
        case "promotional":
          conditions.push(eq(message.category, "promotional"));
          break;
      }
    }

    // Search filter (basic - searches subject and snippet)
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          like(message.subject, searchTerm),
          like(message.snippet, searchTerm),
        )!,
      );
    }

    // Calculate offset
    const offset = (params.page - 1) * params.pageSize;

    // Determine sort order
    const orderBy =
      params.sortOrder === "desc"
        ? desc(message.receivedAt)
        : asc(message.receivedAt);

    // Execute query with count
    const [messages, countResult] = await Promise.all([
      db
        .select()
        .from(message)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(params.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(message)
        .where(and(...conditions)),
    ]);

    // Fetch summaries for these messages
    const messageIds = messages.map((m) => m.id);
    let summariesMap: Map<string, typeof messageSummary.$inferSelect> =
      new Map();
    const labelsMap: Map<
      string,
      Array<{
        labelId: string;
        labelName: string;
        labelColor: string;
        source: string;
        assignedAt: Date;
      }>
    > = new Map();

    if (messageIds.length > 0) {
      // Fetch summaries
      const summaries = await db
        .select()
        .from(messageSummary)
        .where(inArray(messageSummary.messageId, messageIds));

      summariesMap = new Map(summaries.map((s) => [s.messageId, s]));

      // Fetch labels with their details
      const messageLabelsWithDetails = await db
        .select({
          messageId: messageLabel.messageId,
          labelId: messageLabel.labelId,
          source: messageLabel.source,
          assignedAt: messageLabel.assignedAt,
          labelName: label.name,
          labelColor: label.color,
        })
        .from(messageLabel)
        .innerJoin(label, eq(messageLabel.labelId, label.id))
        .where(inArray(messageLabel.messageId, messageIds));

      // Group labels by message
      for (const ml of messageLabelsWithDetails) {
        const existing = labelsMap.get(ml.messageId) || [];
        existing.push({
          labelId: ml.labelId,
          labelName: ml.labelName,
          labelColor: ml.labelColor,
          source: ml.source,
          assignedAt: ml.assignedAt,
        });
        labelsMap.set(ml.messageId, existing);
      }
    }

    // Combine messages with summaries and labels
    const messagesWithSummaries = messages.map((msg) => ({
      ...msg,
      summary: summariesMap.get(msg.id) || null,
      labels:
        labelsMap.get(msg.id)?.map((l) => ({
          labelId: l.labelId,
          labelName: l.labelName,
          labelColor: l.labelColor,
          source: l.source as "user" | "ai" | "rule" | "sync",
          assignedAt: l.assignedAt.toISOString(),
        })) || [],
    }));

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / params.pageSize);

    return NextResponse.json({
      success: true,
      data: messagesWithSummaries,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems: totalCount,
        totalPages,
        hasMore: params.page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

// -----------------------------------------------------------------------------
// POST: Send New Message
// -----------------------------------------------------------------------------
const sendMessageSchema = z.object({
  connectionId: z.string(),
  to: z.array(
    z.object({ name: z.string().optional(), email: z.string().email() }),
  ),
  cc: z
    .array(z.object({ name: z.string().optional(), email: z.string().email() }))
    .optional(),
  bcc: z
    .array(z.object({ name: z.string().optional(), email: z.string().email() }))
    .optional(),
  subject: z.string(),
  body: z.string(),
  bodyHtml: z.string().optional(),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Get the connection
    const [connection] = await db
      .select()
      .from(emailConnection)
      .where(
        and(
          eq(emailConnection.id, data.connectionId),
          eq(emailConnection.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!connection) {
      return NextResponse.json(
        { error: "Email connection not found" },
        { status: 404 },
      );
    }

    if (!connection.accessToken) {
      return NextResponse.json(
        { error: "Email connection not authorized" },
        { status: 401 },
      );
    }

    // Import Gmail service dynamically to avoid bundling issues
    const { createGmailClient, sendMessage, parseGmailMessage } =
      await import("@/lib/services/email/gmail");

    const gmail = createGmailClient(
      connection.accessToken,
      connection.refreshToken || undefined,
    );

    // Send the email
    const sentMessage = await sendMessage(gmail, {
      to: data.to.map((r) => r.email),
      cc: data.cc?.map((r) => r.email),
      bcc: data.bcc?.map((r) => r.email),
      subject: data.subject,
      body: data.body,
      bodyHtml: data.bodyHtml,
      threadId: data.threadId,
      inReplyTo: data.inReplyTo,
    });

    // Parse the sent message
    const parsed = parseGmailMessage(sentMessage);

    // Store in database
    const [newMessage] = await db
      .insert(message)
      .values({
        userId: session.user.id,
        connectionId: connection.id,
        externalId: parsed.externalId,
        threadId: parsed.threadId,
        subject: parsed.subject,
        from: { email: session.user.email, name: session.user.name },
        to: data.to,
        cc: data.cc || [],
        bcc: data.bcc || [],
        snippet: parsed.snippet,
        bodyText: data.body,
        bodyHtml: data.bodyHtml,
        status: "read",
        isStarred: false,
        isDraft: false,
        isSent: true,
        hasAttachments: false,
        attachments: [],
        receivedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
