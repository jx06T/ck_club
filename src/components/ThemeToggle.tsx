import { useEffect, useState } from 'react';

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
    console.log("ssq")
    window.dispatchEvent(new CustomEvent("theme-change", { detail: newTheme }));
  };

  if (!isMounted) return (
    <button
      onClick={toggleTheme}
      className="px-2 py-2"
    >
      < Snowflake />
    </button>
  )

  return (
    <button
      onClick={toggleTheme}
      className="px-2 py-2"
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}

export default ThemeToggle