"use client";

import * as React from "react";
import { ArrowUp, Square, Brain, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onClear: () => void;
  isStreaming: boolean;
  thinking: boolean;
  onThinkingChange: (v: boolean) => void;
  hasMessages: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  onClear,
  isStreaming,
  thinking,
  onThinkingChange,
  hasMessages,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!isStreaming && value.trim()) onSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:py-4">
        <div
          className={cn(
            "relative rounded-2xl border bg-card/80 shadow-sm backdrop-blur transition-colors",
            "border-border focus-within:border-aura/50 focus-within:shadow-[0_0_0_3px_oklch(0.72_0.16_162/0.12)]"
          )}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message AURA…  (Enter to send, Shift+Enter for newline)"
            className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 pr-14 text-[0.95rem] leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isStreaming}
            aria-label="Message AURA"
          />

          <div className="absolute bottom-2.5 right-2.5">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
                aria-label="Stop generating"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSend}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  canSend
                    ? "bg-aura text-white hover:scale-105 active:scale-95"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
                aria-label="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label
              className="group inline-flex cursor-pointer items-center gap-2 select-none"
              title="Enable chain-of-thought reasoning for harder problems"
            >
              <Switch
                checked={thinking}
                onCheckedChange={onThinkingChange}
                className="data-[state=checked]:bg-aura"
              />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                <Brain className="h-3.5 w-3.5" />
                Deep Reasoning
              </span>
            </label>
          </div>

          {hasMessages && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
