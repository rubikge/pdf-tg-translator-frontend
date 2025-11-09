import { useState, useEffect } from 'react';
import { getTelegramApp, isTelegramEnvironment } from '../telegram/telegramApp';

/**
 * Hook to sync app theme with Telegram theme
 * @returns {object} { colorScheme, themeParams, isDark }
 */
export function useTelegramTheme() {
  const [colorScheme, setColorScheme] = useState('light');
  const [themeParams, setThemeParams] = useState(null);
  
  useEffect(() => {
    if (!isTelegramEnvironment()) {
      // Check browser theme preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setColorScheme('dark');
      }
      return;
    }
    
    const tg = getTelegramApp();
    if (!tg) return;
    
    // Set initial theme
    setColorScheme(tg.colorScheme);
    setThemeParams(tg.themeParams);
    
    // Listen for theme changes
    const handleThemeChange = () => {
      setColorScheme(tg.colorScheme);
      setThemeParams(tg.themeParams);
    };
    
    // Telegram sends theme_changed event
    tg.onEvent('themeChanged', handleThemeChange);
    
    return () => {
      tg.offEvent('themeChanged', handleThemeChange);
    };
  }, []);
  
  return { 
    colorScheme, 
    themeParams,
    isDark: colorScheme === 'dark'
  };
}

