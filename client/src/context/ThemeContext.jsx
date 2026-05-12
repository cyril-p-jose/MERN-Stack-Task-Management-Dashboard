import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      root.classList.add("dark");
      return undefined;
    }
    if (theme === "light") {
      root.classList.remove("dark");
      return undefined;
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => root.classList.toggle("dark", mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggle: () =>
        setTheme((t) => {
          if (t === "light") return "dark";
          if (t === "dark") return "light";
          return document.documentElement.classList.contains("dark") ? "light" : "dark";
        }),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
