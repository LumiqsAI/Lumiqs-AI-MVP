"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      title={`Switch to ${isLight ? "dark" : "light"} theme`}
      className="theme-toggle"
    >
      <span className="toggle-icon">
        {isLight ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
      </span>
      {!compact && (
        <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
      )}
    </button>
  );
}
