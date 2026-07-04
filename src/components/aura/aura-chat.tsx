"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuraLogo } from "./aura-logo";
import { WelcomeScreen } from "./welcome-screen";
import { MessageBubble, type ChatMessage } from "./message-bubble";
import { ChatInput } from "./chat-input";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface StreamOptions {
  thinking: boolean;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
  onReasoning: (chunk: string) => void;
  onError: (msg: string) => void;
  onDone: () => void;
}

async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  opts: StreamOptions
) {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, thinking: opts.thinking }),
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") {
      opts.onDone();
      return;
    }
    opts.onError(
      `Network request failed: ${(err as Error)?.message ?? "unknown error"}`
    );
    opts.onDone();
    return;
  }

  if (!res.ok || !res.body) {
    let detail = `HTTP ${res.status}`;
    try {
      detail = await res.text();
    } catch {
      /* noop */
    }
    opts.onError(`AURA is unavailable right now (${detail}).`);
    opts.onDone();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    opts.onDone();
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const line of rawEvent.split("\n")) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            if (typeof json.content === "string") opts.onDelta(json.content);
            if (typeof json.reasoning === "string")
              opts.onReasoning(json.reasoning);
            if (typeof json.error === "string") opts.onError(json.error);
            if (json.done === true) finish();
          } catch {
            /* skip malformed chunk */
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error)?.name !== "AbortError") {
      opts.onError(
        `Stream interrupted: ${(err as Error)?.message ?? "unknown error"}`
      );
    }
  } finally {
    finish();
  }
}

export function AuraChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [thinking, setThinking] = React.useState(false);
  const [streamingId, setStreamingId] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as content streams in.
  React.useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  const sendMessages = React.useCallback(
    async (
      history: { role: "user" | "assistant"; content: string }[],
      assistantId: string
    ) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      setStreamingId(assistantId);

      await streamChat(history, {
        thinking,
        signal: controller.signal,
        onDelta: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
        },
        onReasoning: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, reasoning: (m.reasoning ?? "") + chunk }
                : m
            )
          );
        },
        onError: (msg) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: msg, error: true }
                : m
            )
          );
        },
        onDone: () => {
          setIsStreaming(false);
          setStreamingId(null);
          abortRef.current = null;
        },
      });
    },
    [thinking]
  );

  const submitWith = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
      };
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
      };

      // Build the conversation history to send to the API (prior + new user).
      const history = [
        ...messages
          .filter((m) => !m.error)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: trimmed },
      ];

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      void sendMessages(history, assistantMsg.id);
    },
    [isStreaming, messages, sendMessages]
  );

  const handleSubmit = () => submitWith(input);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setStreamingId(null);
  };

  const handleClear = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setStreamingId(null);
    setMessages([]);
    setInput("");
  };

  const handleRegenerate = () => {
    if (isStreaming) return;
    // Drop the trailing assistant message, then re-send from the last user turn.
    const lastUserIdx = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const cutFrom = messages.length - 1 - lastUserIdx;
    const kept = messages.slice(0, cutFrom); // up to & including last user msg
    const newAssistant: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "",
    };
    setMessages([...kept, newAssistant]);
    const history = kept
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    void sendMessages(history, newAssistant.id);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <AuraLogo size={32} animated={isStreaming} />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                AURA
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Agent Mode · GLM-5.2
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Messages / Welcome */}
      <main
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {!hasMessages ? (
          <WelcomeScreen onPickPrompt={(p) => submitWith(p)} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                isStreaming={isStreaming && m.id === streamingId}
                onRegenerate={handleRegenerate}
                canRegenerate={
                  !isStreaming &&
                  m.id === messages[messages.length - 1]?.id &&
                  m.role === "assistant" &&
                  !m.error
                }
              />
            ))}
            <div ref={bottomRef} className="h-1 shrink-0" />
          </div>
        )}
      </main>

      {/* Footer / Composer */}
      <footer className="shrink-0">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onStop={handleStop}
          onClear={handleClear}
          isStreaming={isStreaming}
          thinking={thinking}
          onThinkingChange={setThinking}
          hasMessages={hasMessages}
        />
      </footer>
    </div>
  );
}
