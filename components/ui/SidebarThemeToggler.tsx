"use client";
import { useEffect, useState } from "react";

export default function SidebarThemeToggler() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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
    <div className="flex items-center gap-3">
      <button
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-12 items-center rounded-full border border-gray-400 bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted"
        type="button"
      >
        <span
          className={`${
            isDark ? "translate-x-6 bg-gray-800" : "translate-x-1 bg-gray-500"
          } inline-flex h-4 w-4 transform items-center justify-center rounded-full transition-transform`}
        >
          {isDark ? (
            <svg
              className="h-4 w-4 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="5" strokeWidth="2" />
              <path
                strokeWidth="2"
                d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M5.46 5.46L4.05 4.05m14.14 0l-1.41 1.41M5.46 18.54l-1.41 1.41"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                d="M21 12.79A9 9 0 1111.21 3c.09 0 .18 0 .27.01A7 7 0 0021 12.79z"
              />
            </svg>
          )}
        </span>
      </button>
      <span className="text-sm font-medium text-foreground/80">
        {isDark ? "Dark" : "Light"}
      </span>
    </div>
  );
}