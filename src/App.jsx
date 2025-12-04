import { useEffect, useState } from 'react';
import PdfViewer from './components/PdfViewer'
import { 
  initTelegramApp, 
  isTelegramEnvironment,
  isTelegramSDKLoaded,
  getTelegramUser,
  setHeaderColor,
  setBackgroundColor,
  getViewportHeight,
  getViewportStableHeight
} from './telegram/telegramApp';
import { useTelegramTheme } from './hooks/useTelegramTheme';

function App() {
  const { colorScheme, isDark, themeParams } = useTelegramTheme();
  const [isTelegram, setIsTelegram] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  useEffect(() => {
    // Check if we're in real Telegram environment
    const isRealTelegram = isTelegramEnvironment();
    setIsTelegram(isRealTelegram);
    
    // Initialize Telegram WebApp if available
    if (isTelegramSDKLoaded()) {
      const initialized = initTelegramApp();
      
      if (initialized && isRealTelegram) {
        const user = getTelegramUser();
        setTelegramUser(user);
        console.log('Telegram user:', user);
        
        // Set colors based on Telegram theme
        if (themeParams) {
          setHeaderColor(themeParams.header_bg_color || '#1f2937');
          setBackgroundColor(themeParams.bg_color || '#ffffff');
        }
        
        // Handle viewport changes in Telegram
        const updateViewportHeight = () => {
          const height = getViewportStableHeight() || getViewportHeight() || window.innerHeight;
          setViewportHeight(height);
          // Set CSS variable for components to use
          document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
        };
        
        updateViewportHeight();
        
        // Listen for viewport changes (keyboard open/close, etc.)
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.onEvent('viewportChanged', updateViewportHeight);
        }
        
        return () => {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.offEvent('viewportChanged', updateViewportHeight);
          }
        };
      }
    }
    
    // Fallback for non-Telegram environment
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      document.documentElement.style.setProperty('--tg-viewport-height', `${window.innerHeight}px`);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [themeParams]);
  
  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  // Dynamic styles based on Telegram theme or default
  const bgColor = themeParams?.bg_color || (isDark ? '#1a1a1a' : '#ffffff');
  const textColor = themeParams?.text_color || (isDark ? '#ffffff' : '#000000');
  const secondaryBgColor = themeParams?.secondary_bg_color || (isDark ? '#2a2a2a' : '#f4f4f5');
  
  // Use CSS variable for height if available, otherwise use state
  const appHeight = isTelegram 
    ? 'var(--tg-viewport-height, 100vh)' 
    : '100vh';
  
  return (
    <div 
      className="flex flex-col"
      style={{ 
        backgroundColor: bgColor,
        color: textColor,
        height: appHeight,
        maxHeight: appHeight,
        overflow: 'hidden'
      }}
    >
      {/* Compact header - only show in browser mode */}
      {!isTelegram && (
        <div className="flex-shrink-0 py-3 px-4 border-b" style={{ borderColor: secondaryBgColor }}>
          <h1 className="text-xl font-semibold text-center">
            PDF Translator
          </h1>
          <p className="text-xs text-center opacity-60 mt-1">
            🌐 Browser Mode
            {isTelegramSDKLoaded() && (
              <span className="ml-1">(SDK loaded)</span>
            )}
          </p>
        </div>
      )}
      
      {/* Telegram mode - minimal or no header */}
      {isTelegram && telegramUser && (
        <div className="flex-shrink-0 py-2 px-4 text-xs text-center opacity-60">
          Welcome, {telegramUser.first_name}! 👋
        </div>
      )}
      
      <main className="flex-1 overflow-hidden">
        <PdfViewer isTelegram={isTelegram} themeParams={themeParams} isDark={isDark} />
      </main>
    </div>
  )
}

export default App

