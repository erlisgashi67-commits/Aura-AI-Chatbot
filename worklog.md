# AURA — Work Log

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Build AURA (Advanced Universal Reasoning Assistant) — a premium AI reasoning chat application in Next.js 16, embodying the AURA persona with streaming responses, markdown rendering, and agentic UX.

Work Log:
- Loaded the LLM skill and inspected `z-ai-web-dev-sdk` types + implementation to confirm streaming behavior (SDK returns a raw SSE `ReadableStream` when `stream: true`).
- Authored `src/lib/aura-prompt.ts` — encodes the full AURA persona (identity, agentic reasoning framework, capabilities, guardrails, init) as the system prompt, plus suggested prompts and capability metadata.
- Built streaming chat API at `src/app/api/chat/route.ts`:
  - Parses the SDK's raw SSE byte stream (`data: {...}` lines) into `{ content, reasoning }` deltas.
  - Re-emits a custom SSE stream to the client with `{ content?, reasoning?, error?, done }` events.
  - Uses `runtime = "nodejs"` (the SDK needs Node's `os` module; edge runtime fails).
  - Caps conversation history to 20 turns; supports an optional `thinking` flag for deep reasoning.
  - Defensive error handling with graceful error events.
- Wired `ThemeProvider` (next-themes, default dark) into `src/app/layout.tsx` with AURA metadata.
- Restyled `src/app/globals.css` with an emerald/teal AURA palette (no indigo/blue), custom scrollbar, aura glow/rotate/pulse/blink/fade-up animations, `.aura-gradient-text`, `.aura-glow`, `.aura-grid-bg`, and full markdown `.aura-prose` styles.
- Built AURA component suite under `src/components/aura/`:
  - `aura-logo.tsx` — animated concentric orb with rotating aura ring + glow halo (pure CSS/SVG).
  - `markdown.tsx` — react-markdown renderer with lazy-loaded Prism syntax highlighting and per-block copy buttons; unwraps `<pre>` to avoid nesting.
  - `theme-toggle.tsx` — dark/light switch.
  - `welcome-screen.tsx` — animated AURA hero, Agent Mode badge, Analyze→Plan→Execute→Reflect→Deliver ribbon, 4 capability cards, 4 clickable suggested prompts.
  - `reasoning-trace.tsx` — animated 5-step framework indicator shown while AURA composes its first tokens.
  - `message-bubble.tsx` — user/assistant bubbles, AURA avatar, markdown body, streaming cursor, copy + retry actions.
  - `chat-input.tsx` — auto-resizing composer, send/stop buttons, Deep Reasoning switch, clear button, Enter-to-send / Shift+Enter newline.
  - `aura-chat.tsx` — orchestrator: SSE stream parsing on the client, message state, abort/stop, regenerate, clear, auto-scroll, sticky header + scrollable main + pinned footer.
- Set `src/app/page.tsx` to render `<AuraChat />`.
- Fixed two lint issues: converted `streamingIdRef` to state (no ref reads during render) and replaced `any` typing in the markdown renderer with `satisfies Components`.
- Started dev server (already running) and ran ESLint → clean.

Self-Verification (Agent Browser):
- Welcome screen renders fully: AURA hero, Agent Mode·GLM-5.2 badge, 4 capability cards, reasoning ribbon, 4 suggested prompts, input, Deep Reasoning switch, theme toggle. No console/runtime errors.
- Typed-message send → streamed AURA intro: "I'm AURA, operating in Agent Mode as an advanced reasoning assistant. How can I assist you today?"
- Coding prompt → correct markdown: h1 heading, syntax-highlighted TypeScript code block with working "Copy code" button, bullet list, inline code, bold.
- Suggested-prompt auto-submit → comprehensive structured response (multiple heading levels, lists, JSX code block).
- Theme toggle verified dark↔light via `document.documentElement.className`.
- Clear button → conversation resets, welcome screen returns.
- Deep Reasoning toggle ON → math reasoning response streamed correctly, no errors.
- Sticky footer: `footerBottom === viewportHeight` on desktop (577=577) and mobile (844=844); `footerAtBottom: true`; message area scrolls (3073 > 395).
- Mobile (390px): `noHorizontalScroll: true`, footer pinned, content scrolls.
- All `POST /api/chat` returned 200; zero page errors.

Stage Summary:
- AURA is fully functional and browser-verified end-to-end.
- Architecture: client `aura-chat.tsx` ↔ SSE `/api/chat` (nodejs runtime) ↔ `z-ai-web-dev-sdk` streaming.
- Design: emerald/teal premium aesthetic, dark default, fully responsive, sticky composer footer.
- Files produced: `src/lib/aura-prompt.ts`, `src/app/api/chat/route.ts`, `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`, `src/components/aura/{aura-logo,markdown,welcome-screen,reasoning-trace,message-bubble,chat-input,aura-chat}.tsx`, updated `src/app/{layout,page,globals.css}.tsx/css`.
