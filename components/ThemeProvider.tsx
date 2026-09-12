"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "dark",
    toggle: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

/** Read the initial theme from localStorage / system preference (client-only) */
function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // useState lazy initializer runs only on the client; avoids setState-in-effect lint error
    const [theme, setTheme] = useState<Theme>(() => {
        // During SSR this returns the default "dark"; the anti-FOUC script handles the real value
        if (typeof window === "undefined") return "dark";
        return getInitialTheme();
    });

    // Sync the <html> class whenever theme changes (also fires once on mount)
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((prev) => {
            const next: Theme = prev === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

/** Inline script to prevent FOUC – injected into <head> before any CSS */
export const themeScript = `
(function(){
  try{
    var t=localStorage.getItem('theme');
    if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){
      document.documentElement.classList.add('dark');
    }
  }catch(e){}
})();
`;
