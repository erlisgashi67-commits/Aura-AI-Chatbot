"use client";

import { cn } from "@/lib/utils";

interface AuraLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * AURA signature mark — a glowing concentric orb with a rotating aura ring.
 * Pure CSS/SVG, no external assets.
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
            "conic-gradient(from 0deg, oklch(0.72 0.16 162 / 0), oklch(0.72 0.16 162 / 0.9), oklch(0.78 0.14 70 / 0.7), oklch(0.68 0.14 200 / 0.9), oklch(0.72 0.16 162 / 0))",
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
            "radial-gradient(circle at 35% 35%, oklch(0.8 0.16 162 / 0.9), oklch(0.62 0.14 185 / 0.5) 55%, transparent 75%)",
        }}
      />
      {/* Core orb */}
      <span
        className="relative rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background:
            "radial-gradient(circle at 32% 28%, oklch(0.95 0.05 160) 0%, oklch(0.72 0.16 162) 45%, oklch(0.5 0.14 180) 100%)",
          boxShadow:
            "inset 0 1px 2px oklch(1 0 0 / 0.5), 0 0 12px oklch(0.72 0.16 162 / 0.6)",
        }}
      />
    </span>
  );
}
