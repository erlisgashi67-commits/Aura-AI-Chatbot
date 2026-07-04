"use client";

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Check, Copy } from "lucide-react";

/**
 * Markdown renderer tuned for AURA responses.
 * - Renders headings, lists, tables, blockquotes, inline code
 * - Fenced code blocks get syntax highlighting + a copy button
 */
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Lazy import to keep the initial bundle lean and avoid SSR issues.
  const [Prism, setPrism] = React.useState<any>(null);
  const [styles, setStyles] = React.useState<any>(null);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      import("react-syntax-highlighter").then((m) => m.Prism),
      import("react-syntax-highlighter/dist/esm/styles/prism/one-dark")
        .then((m) => m.default)
        .catch(() => null),
    ])
      .then(([p, s]) => {
        if (!active) return;
        setPrism(() => p);
        if (s) setStyles(() => s);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="group/code relative my-3 overflow-hidden rounded-xl border border-border bg-[oklch(0.16_0.012_175)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Copy code"
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
      </div>
      <div className="overflow-x-auto text-[13px] leading-relaxed">
        {Prism ? (
          <Prism
            language={language || "text"}
            style={styles ?? undefined}
            customStyle={{
              margin: 0,
              padding: "1rem 1.1rem",
              background: "transparent",
              fontSize: "13px",
            }}
            codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
          >
            {code}
          </Prism>
        ) : (
          <pre className="p-4 font-mono text-foreground/90 whitespace-pre-wrap break-words">
            {code}
          </pre>
        )}
      </div>
    </div>
  );
}

export function AuraMarkdown({ content }: { content: string }) {
  return (
    <div className="aura-prose">
      <ReactMarkdown
        components={{
          // Unwrap <pre> so CodeBlock's own container isn't nested inside one.
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const text = Array.isArray(children)
              ? children.join("")
              : String(children ?? "");
            const isBlock = Boolean(match) || text.includes("\n");
            if (!isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return <CodeBlock language={match?.[1] ?? ""} code={text.replace(/\n$/, "")} />;
          },
          a({ children, ...props }) {
            return (
              <a target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        } satisfies Components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
