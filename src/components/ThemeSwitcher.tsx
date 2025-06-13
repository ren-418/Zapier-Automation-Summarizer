'use client';

import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, AdjustmentsHorizontalIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

type Theme = 'light' | 'dark' | 'contrast' | 'fun';

const themes: { name: Theme; icon: JSX.Element; label: string }[] = [
  { name: 'light', icon: <SunIcon className="h-5 w-5" />, label: 'Light' },
  { name: 'dark', icon: <MoonIcon className="h-5 w-5" />, label: 'Dark' },
  { name: 'contrast', icon: <AdjustmentsHorizontalIcon className="h-5 w-5" />, label: 'Contrast' },
  { name: 'fun', icon: <SparklesIcon className="h-5 w-5" />, label: 'Fun' },
];

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'contrast' || storedTheme === 'fun')) {
      setCurrentTheme(storedTheme);
    } else {
      setCurrentTheme('light');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.className = currentTheme;
      localStorage.setItem('theme', currentTheme);
    }
  }, [currentTheme, mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 700, damping: 50 }}
      className="flex space-x-1 p-1 bg-secondary rounded-full border border-border"
    >
      {themes.map((theme) => (
        <button
          key={theme.name}
          onClick={() => handleThemeChange(theme.name)}
          className={`p-2 rounded-full transition-colors duration-200
                      ${currentTheme === theme.name
                        ? 'bg-accent text-primary shadow-md'
                        : 'text-text hover:bg-tertiary'}
                    `}
          aria-label={`Switch to ${theme.label} theme`}
        >
          {theme.icon}
        </button>
      ))}
    </motion.div>
  );
};

export default ThemeSwitcher;