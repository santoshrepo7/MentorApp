import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

export interface Theme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    placeholder: string;
    subtitle: string;
    error: string;
    success: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#0c4a6e',
    background: '#f0f9ff',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    notification: '#ef4444',
    placeholder: '#94a3b8',
    subtitle: '#64748b',
    error: '#ef4444',
    success: '#059669',
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#38bdf8',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    border: '#334155',
    notification: '#ef4444',
    placeholder: '#64748b',
    subtitle: '#94a3b8',
    error: '#ef4444',
    success: '#059669',
  },
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};