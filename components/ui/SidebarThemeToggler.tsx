"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidebarThemeToggler() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <button 
          className="relative inline-flex h-6 w-12 items-center rounded-full border border-gray-400 bg-card"
          aria-hidden="true"
        >
          <span className="inline-flex h-4 w-4 translate-x-1 items-center justify-center rounded-full bg-gray-300" />
        </button>
        <span className="text-sm font-medium text-foreground/80">Light</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative inline-flex h-6 w-12 items-center rounded-full border border-gray-400 bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted"
        type="button"
      >
        <span
          className={`${
            theme === "dark" ? "translate-x-6 bg-gray-800" : "translate-x-1 bg-gray-500"
          } inline-flex h-4 w-4 transform items-center justify-center rounded-full transition-transform`}
        >
          {theme === "dark" ? (
            <Sun className="h-3 w-3 text-yellow-400" />
          ) : (
            <Moon className="h-3 w-3 text-gray-300" />
          )}
        </span>
      </button>
      <span className="text-sm font-medium text-foreground/80">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </div>
  );
}