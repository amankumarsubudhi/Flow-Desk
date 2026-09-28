import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themesList: { id: ThemeMode; name: string; primaryColor: string; bgAccent: string }[];
}

const THEMES_LIST: { id: ThemeMode; name: string; primaryColor: string; bgAccent: string }[] = [
  { id: 'orange', name: 'Black & Orange', primaryColor: '#FF7A00', bgAccent: 'bg-[#FF7A00]' },
  { id: 'white', name: 'Black & White', primaryColor: '#FFFFFF', bgAccent: 'bg-white' },
  { id: 'purple', name: 'Black & Purple', primaryColor: '#A855F7', bgAccent: 'bg-[#A855F7]' },
  { id: 'green', name: 'Black & Green', primaryColor: '#22C55E', bgAccent: 'bg-[#22C55E]' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('flowdesk_theme') as ThemeMode;
    return saved && ['orange', 'white', 'purple', 'green'].includes(saved) ? saved : 'orange';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('flowdesk_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themesList: THEMES_LIST }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
