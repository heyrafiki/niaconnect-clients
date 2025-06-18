"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // On mount, check localStorage or system preference
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="p-2 rounded-full border border-border bg-card shadow hover:bg-muted transition-colors z-50"
      type="button"
    >
      {isDark ? (
        // Sun icon
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-yellow-400">
          <circle cx="12" cy="12" r="5" strokeWidth="2" />
          <path strokeWidth="2" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M5.46 5.46L4.05 4.05m14.14 0l-1.41 1.41M5.46 18.54l-1.41 1.41" />
        </svg>
      ) : (
        // Moon icon
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
          <path strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3c.09 0 .18 0 .27.01A7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
