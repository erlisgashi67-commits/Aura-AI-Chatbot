"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Brain, Code2, Search, Sigma, Sparkles, ArrowRight } from "lucide-react";
import { AuraLogo } from "./aura-logo";
import { AURA_CAPABILITIES, AURA_SUGGESTED_PROMPTS } from "@/lib/aura-prompt";

const ICONS = {
  Brain,
  Code2,
  Search,
  Sigma,
} as const;

interface WelcomeScreenProps {
  onPickPrompt: (prompt: string) => void;
}

export function WelcomeScreen({ onPickPrompt }: WelcomeScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-6"
      >
        <AuraLogo size={84} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "var(--aura)" }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--aura)" }}
            />
          </span>
          Agent Mode · GLM-5.2
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="aura-gradient-text">AURA</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          Advanced Universal Reasoning Assistant — an elite, agentic AI for deep
          reasoning, software engineering, research, and rigorous problem solving.
        </p>
      </motion.div>

      {/* Reasoning framework ribbon */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-6 flex w-full max-w-xl flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-xs text-muted-foreground"
      >
        {["Analyze", "Plan", "Execute", "Reflect", "Deliver"].map((step, i) => (
          <React.Fragment key={step}>
            <span className="rounded-md border border-border bg-card/50 px-2.5 py-1 font-mono">
              {step}
            </span>
            {i < 4 && <ArrowRight className="h-3 w-3 text-aura/60" />}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Capability cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {AURA_CAPABILITIES.map((cap) => {
          const Icon = ICONS[cap.icon as keyof typeof ICONS];
          return (
            <div
              key={cap.title}
              className="group rounded-xl border border-border bg-card/50 p-4 backdrop-blur transition-colors hover:border-aura/40 hover:bg-card"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-aura/12 text-aura">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold">{cap.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {cap.description}
              </p>
            </div>
          );
        })}
      </motion.div>

      {/* Suggested prompts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mt-8 w-full"
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-aura" />
          Try a prompt
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {AURA_SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => onPickPrompt(p.prompt)}
              className="group flex flex-col items-start rounded-xl border border-border bg-card/40 p-3.5 text-left transition-all hover:border-aura/50 hover:bg-card hover:shadow-sm"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-aura">
                {p.title}
              </span>
              <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {p.subtitle}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
