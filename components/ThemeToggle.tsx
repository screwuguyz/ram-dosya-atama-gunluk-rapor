"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "site_theme"; // "light" | "dark"

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = (localStorage.getItem(THEME_KEY) as Theme | null) ?? null;
  if (saved === "light" || saved === "dark") return saved;
  // Prefer system if nothing saved
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    // Apply to <html data-theme="...">
    const el = document.documentElement;
    el.setAttribute("data-theme", theme);
    // Update color-scheme to help native UI (scrollbars, form controls)
    el.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <div className="fixed right-3 top-3 z-50">
      <Button variant="outline" size="sm" onClick={toggle} className="shadow">
        {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
      </Button>
    </div>
  );
}
