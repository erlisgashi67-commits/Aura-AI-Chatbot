"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Moon, Palette, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "pink", label: "Pink", icon: Sparkles },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change theme"
          className="h-9 w-9 rounded-full"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = mounted && theme === value;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="cursor-pointer justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              {active && <Check className="h-4 w-4 text-aura" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
