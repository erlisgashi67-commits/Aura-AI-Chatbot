"use client";

import { cn } from "@/lib/utils";

interface AuraLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * AURA signature mark — a glowing concentric orb with a rotating aura ring.
 * Colors are driven by the --aura / --aura-2 / --aura-3 CSS variables so the
 * logo adapts to the active theme (emerald dark/light, pink).
 */
export function AuraLogo({ size = 40, className, animated = true }: AuraLogoProps) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Outer rotating aura ring */}
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          animated && "animate-aura-rotate"
        )}
        style={{
          background:
            "conic-gradient(from 0deg, transparent, var(--aura), var(--aura-3), var(--aura-2), transparent)",
          maskImage: "radial-gradient(transparent 60%, #000 62%, #000 70%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(transparent 60%, #000 62%, #000 70%, transparent 72%)",
        }}
      />
      {/* Glow halo */}
      <span
        className={cn(
          "absolute inset-[18%] rounded-full blur-md",
          animated && "animate-aura-pulse"
        )}
        style={{
          background:
            "radial-gradient(circle at 35% 35%, color-mix(in oklch, var(--aura) 90%, white), color-mix(in oklch, var(--aura-2) 50%, transparent) 55%, transparent 75%)",
        }}
      />
      {/* Core orb */}
      <span
        className="relative rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background:
            "radial-gradient(circle at 32% 28%, color-mix(in oklch, var(--aura) 30%, white) 0%, var(--aura) 45%, var(--aura-2) 100%)",
          boxShadow:
            "inset 0 1px 2px oklch(1 0 0 / 0.5), 0 0 12px color-mix(in oklch, var(--aura) 60%, transparent)",
        }}
      />
    </span>
  );
}
