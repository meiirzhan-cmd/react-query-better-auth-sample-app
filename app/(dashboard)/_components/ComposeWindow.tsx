"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useComposeStore } from "@/stores/compose-store";
import { useSendMessage } from "@/hooks/use-messages";
import { useDefaultConnection } from "@/hooks/use-connections";
import { X, Minimize2, Maximize2, Send, Paperclip, Sparkles } from "lucide-react";
import { useState } from "react";

export function ComposeWindow() {
  const {
    isComposeOpen,
    activeDraft,
    closeCompose,
    minimizeCompose,
    maximizeCompose,
    toggleFullscreen,
    isMinimized,
    isFullscreen,
    addRecipient,
    removeRecipient,
    setSubject,
    setBody,
    isGeneratingAi,
    aiSuggestion,
    requestAiSuggestion,
    applyAiSuggestion,
    clearAiSuggestion,
    selectedTone,
    setSelectedTone,
  } = useComposeStore();

  const { data: defaultConnection } = useDefaultConnection();
  const sendMessageMutation = useSendMessage();

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  if (!isComposeOpen || !activeDraft) {
    return null;
  }

  const handleAddRecipient = (field: "to" | "cc" | "bcc", value: string) => {
    const email = value.trim();
    if (!email) return;

    // Basic email validation
    if (!email.includes("@")) return;

    addRecipient(field, { email });

    // Clear input
    if (field === "to") setToInput("");
    if (field === "cc") setCcInput("");
    if (field === "bcc") setBccInput("");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "to" | "cc" | "bcc",
    value: string,
  ) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      handleAddRecipient(field, value);
    }
  };

  const handleSend = async () => {
    if (!activeDraft || !defaultConnection) return;

    // Validation
    if (activeDraft.to.length === 0) {
      setSendError("Please add at least one recipient");
      return;
    }

    if (!activeDraft.subject.trim()) {
      setSendError("Please add a subject");
      return;
    }

    setSendError(null);

    try {
      await sendMessageMutation.mutateAsync({
        connectionId: activeDraft.connectionId || defaultConnection.id,
        to: activeDraft.to,
        cc: activeDraft.cc.length > 0 ? activeDraft.cc : undefined,
        bcc: activeDraft.bcc.length > 0 ? activeDraft.bcc : undefined,
        subject: activeDraft.subject,
        body: activeDraft.body,
        bodyHtml: activeDraft.bodyHtml,
        threadId: activeDraft.replyToThreadId,
        inReplyTo: activeDraft.replyToMessageId,
      });

      // Close compose window on success
      closeCompose(false);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Failed to send email"
      );
    }
  };

  const handleRequestAi = () => {
    if (activeDraft.replyToMessageId) {
      requestAiSuggestion(activeDraft.replyToMessageId, selectedTone);
    }
  };

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 flex items-center gap-2 rounded-t-lg border border-b-0 border-zinc-200 bg-white px-4 py-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={maximizeCompose}
          className="flex flex-1 items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white"
        >
          <span className="truncate">
            {activeDraft.mode === "new" ? "New Message" : `Re: ${activeDraft.subject}`}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => closeCompose(true)}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900",
        isFullscreen
          ? "inset-0 rounded-none"
          : "bottom-0 right-6 h-[600px] w-[700px] rounded-t-lg",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          {activeDraft.mode === "new"
            ? "New Message"
            : activeDraft.mode === "reply"
              ? "Reply"
              : activeDraft.mode === "replyAll"
                ? "Reply All"
                : "Forward"}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={minimizeCompose}
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => closeCompose(true)}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Recipients */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        {/* To field */}
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800/50">
          <span className="shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            To:
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-1">
            {activeDraft.to.map((recipient) => (
              <span
                key={recipient.email}
                className="inline-flex items-center gap-1 rounded bg-violet-100 px-2 py-0.5 text-sm text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              >
                {recipient.name || recipient.email}
                <button
                  onClick={() => removeRecipient("to", recipient.email)}
                  className="hover:text-violet-900 dark:hover:text-violet-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="email"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "to", toInput)}
              onBlur={() => handleAddRecipient("to", toInput)}
              placeholder={activeDraft.to.length === 0 ? "Recipients" : ""}
              className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-600"
            />
          </div>
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setShowCc(!showCc)}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Cc
            </button>
            <button
              onClick={() => setShowBcc(!showBcc)}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Bcc
            </button>
          </div>
        </div>

        {/* Cc field */}
        {showCc && (
          <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800/50">
            <span className="shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Cc:
            </span>
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {activeDraft.cc.map((recipient) => (
                <span
                  key={recipient.email}
                  className="inline-flex items-center gap-1 rounded bg-violet-100 px-2 py-0.5 text-sm text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                  {recipient.name || recipient.email}
                  <button
                    onClick={() => removeRecipient("cc", recipient.email)}
                    className="hover:text-violet-900 dark:hover:text-violet-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="email"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "cc", ccInput)}
                onBlur={() => handleAddRecipient("cc", ccInput)}
                placeholder="Cc recipients"
                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
          </div>
        )}

        {/* Bcc field */}
        {showBcc && (
          <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800/50">
            <span className="shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Bcc:
            </span>
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {activeDraft.bcc.map((recipient) => (
                <span
                  key={recipient.email}
                  className="inline-flex items-center gap-1 rounded bg-violet-100 px-2 py-0.5 text-sm text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                  {recipient.name || recipient.email}
                  <button
                    onClick={() => removeRecipient("bcc", recipient.email)}
                    className="hover:text-violet-900 dark:hover:text-violet-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="email"
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "bcc", bccInput)}
                onBlur={() => handleAddRecipient("bcc", bccInput)}
                placeholder="Bcc recipients"
                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
          </div>
        )}

        {/* Subject field */}
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Subject:
          </span>
          <input
            type="text"
            value={activeDraft.subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* AI Suggestion */}
      {activeDraft.mode !== "new" && (
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              AI Reply
            </span>
            <select
              value={selectedTone}
              onChange={(e) =>
                setSelectedTone(
                  e.target.value as "professional" | "casual" | "formal" | "friendly",
                )
              }
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="friendly">Friendly</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestAi}
              disabled={isGeneratingAi}
              className="ml-auto"
            >
              {isGeneratingAi ? "Generating..." : "Generate Reply"}
            </Button>
          </div>

          {aiSuggestion && (
            <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800/50 dark:bg-violet-950/30">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  AI Suggestion
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={applyAiSuggestion}
                    className="h-6 text-xs"
                  >
                    Use this
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAiSuggestion}
                    className="h-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {aiSuggestion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <textarea
          value={activeDraft.body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          className="h-full w-full resize-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-600"
        />
      </div>

      {/* Error message */}
      {sendError && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {sendError}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSend}
            disabled={sendMessageMutation.isPending}
            className="bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30"
          >
            <Send className="mr-2 h-4 w-4" />
            {sendMessageMutation.isPending ? "Sending..." : "Send"}
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
