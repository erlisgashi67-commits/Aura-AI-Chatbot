import { NextRequest } from "next/server";
import ZAI, { ChatMessage } from "z-ai-web-dev-sdk";
import { AURA_SYSTEM_PROMPT } from "@/lib/aura-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMessage = { role: "user" | "assistant"; content: string };

/**
 * Parses the raw SSE byte stream returned by z-ai-web-dev-sdk when stream:true.
 * Yields { content?, reasoning? } deltas.
 */
async function* parseSseStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<{ content?: string; reasoning?: string }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by a blank line
      let sepIndex: number;
      while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);

        const lines = rawEvent.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta ?? {};
            if (typeof delta.content === "string" && delta.content.length > 0) {
              yield { content: delta.content };
            }
            if (
              typeof delta.reasoning_content === "string" &&
              delta.reasoning_content.length > 0
            ) {
              yield { reasoning: delta.reasoning_content };
            }
          } catch {
            // Ignore malformed chunks — streaming is resilient to partial JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function encode(obj: Record<string, unknown>): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: {
    messages: IncomingMessage[];
    thinking?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(
      encode({ error: "Invalid JSON body." }) + "data: [DONE]\n\n",
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  const userMessages = Array.isArray(body?.messages) ? body.messages : [];
  if (userMessages.length === 0) {
    return new Response(
      encode({ error: "No messages provided." }) + "data: [DONE]\n\n",
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  // Cap history to the most recent 20 turns to stay within token limits.
  const trimmed = userMessages.slice(-20);

  const messages: ChatMessage[] = [
    { role: "assistant", content: AURA_SYSTEM_PROMPT },
    ...trimmed.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const thinkingEnabled = body.thinking === true;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(encode(obj)));

      try {
        const zai = await ZAI.create();
        const result = await zai.chat.completions.create({
          messages,
          stream: true,
          thinking: { type: thinkingEnabled ? "enabled" : "disabled" },
        });

        // The SDK returns a ReadableStream (SSE) when stream:true.
        if (result instanceof ReadableStream) {
          for await (const delta of parseSseStream(result)) {
            send(delta);
          }
        } else {
          // Non-streaming fallback (shouldn't normally happen).
          const content = result?.choices?.[0]?.message?.content ?? "";
          send({ content });
        }

        send({ done: true });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown upstream error.";
        send({
          error: `AURA encountered an error while reasoning: ${message}`,
        });
        send({ done: true });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
