"use client";
import "./globals.css";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <html lang="en">
      <body className="max-w-4xl mx-auto p-6 transition-colors duration-300 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">HF Propagation Dashboard</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded border border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {children}
      </body>
    </html>
  );
}