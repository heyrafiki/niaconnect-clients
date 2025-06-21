"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches the size of the icons
    return (
      <button 
        className="p-2 rounded-full border border-border bg-card shadow w-[46px] h-[46px]" 
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full border border-border bg-card shadow hover:bg-muted transition-colors z-50"
      type="button"
    >
      {theme === 'dark' ? (
        <Sun className="w-[22px] h-[22px] text-yellow-400" />
      ) : (
        <Moon className="w-[22px] h-[22px] text-gray-500" />
      )}
    </button>
  );
}