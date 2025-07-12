import {  useEffect, useState } from 'react';

import { Moon } from 'lucide-react';
import { Snowflake } from 'lucide-react';
import { Sun } from 'lucide-react';

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('theme');
    const savedTheme = (saved === 'light' || saved === 'dark') ? saved : null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const finalTheme: ('light' | 'dark') = (savedTheme ?? (prefersDark ? 'dark' : 'light'));
    setTheme(finalTheme);
    document.documentElement.classList.toggle('dark', finalTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    window.dispatchEvent(new CustomEvent("theme-change", { detail: newTheme }));

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) return;
    if (theme === 'dark') {
      metaThemeColor.setAttribute('content', '#c0c2d1');
    } else {
      metaThemeColor.setAttribute('content', '#1c2339');
    }

  };

  if (!isMounted) return (
    <button
      onClick={toggleTheme}
      className="px-1 py-1  focus-visible:ring-2  ring-accent-600 outline-none rounded-full inline-block mx-1 hover:bg-accent-200/70 text-primary-700  "
    >
      < Snowflake />
    </button>
  )

  return (
    <button
      onClick={toggleTheme}
      className="px-1 py-1  focus-visible:ring-2  ring-accent-600 outline-none rounded-full inline-block mx-1 hover:bg-accent-200/70 text-primary-700 "
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}

export default ThemeToggle