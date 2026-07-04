"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Copy, RotateCcw, User } from "lucide-react";
import { AuraLogo } from "./aura-logo";
import { AuraMarkdown } from "./markdown";
import { ReasoningTrace } from "./reasoning-trace";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  error?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* noop */
        }
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Copy message"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> Copy
        </>
      )}
    </button>
  );
}

export function MessageBubble({
  message,
  isStreaming,
  onRegenerate,
  canRegenerate,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end gap-3"
      >
        <div className="flex max-w-[85%] flex-col items-end gap-1.5 sm:max-w-[75%]">
          <div className="rounded-2xl rounded-tr-md border border-aura/20 bg-aura/10 px-4 py-2.5">
            <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-foreground">
              {message.content}
            </p>
          </div>
        </div>
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <User className="h-4 w-4" />
        </div>
      </motion.div>
    );
  }

  const showReasoning = isStreaming && message.content.length === 0 && !message.error;
  const showCursor = isStreaming && message.content.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <div className="mt-0.5 shrink-0">
        <AuraLogo size={32} animated={isStreaming} />
      </div>
      <div className="flex min-w-0 max-w-[85%] flex-col gap-1.5 sm:max-w-[78%]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">AURA</span>
          {isStreaming && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-aura">
              {message.content ? "Responding" : "Thinking"}
            </span>
          )}
        </div>

        {showReasoning && <ReasoningTrace />}

        {message.error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {message.content}
          </div>
        ) : message.content ? (
          <div
            className={cn(
              "rounded-2xl rounded-tl-md border border-border bg-card/60 px-4 py-3 backdrop-blur",
              showCursor && "pb-2"
            )}
          >
            <AuraMarkdown content={message.content} />
            {showCursor && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-aura-blink bg-aura align-middle" />
            )}
          </div>
        ) : null}

        {!isStreaming && !message.error && message.content && (
          <div className="flex items-center gap-1 pl-1">
            <CopyButton text={message.content} />
            {canRegenerate && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Regenerate response"
              >
                <RotateCcw className="h-3 w-3" /> Retry
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
