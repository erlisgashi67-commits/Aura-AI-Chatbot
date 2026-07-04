"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Analyze", "Plan", "Execute", "Reflect", "Deliver"] as const;

/**
 * Shown while AURA is composing its first tokens — visualizes the
 * Analyze → Plan → Execute → Reflect → Deliver reasoning framework.
 */
export function ReasoningTrace() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 650);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-aura/20 bg-aura/5 px-3 py-2">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aura opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-aura" />
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        Reasoning
      </span>
      <span className="text-xs text-muted-foreground/50">·</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="font-mono text-xs font-medium text-aura"
        >
          {STEPS[active]}
        </motion.span>
      </AnimatePresence>
      <div className="ml-auto flex items-center gap-1">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= active ? "w-4 bg-aura" : "w-1.5 bg-aura/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
