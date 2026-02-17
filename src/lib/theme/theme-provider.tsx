"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({
  children,
  initialTheme = "dark",
}: {
  children: React.ReactNode;
  initialTheme?: string;
}) {
  const [theme, setTheme] = useState<Theme>((initialTheme as Theme) || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [theme]);

  async function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ theme: newTheme }).eq("id", user.id);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
