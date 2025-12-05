import { useEffect, useState } from 'react';
import PdfViewer from './components/PdfViewer'
import { 
  initTelegramApp, 
  isTelegramEnvironment,
  isTelegramSDKLoaded,
  getTelegramUser,
  setHeaderColor,
  setBackgroundColor
} from './telegram/telegramApp';
import { useTelegramTheme } from './hooks/useTelegramTheme';

function App() {
  const { colorScheme, isDark, themeParams } = useTelegramTheme();
  const [isTelegram, setIsTelegram] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);
  
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
      }
    }
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
  
  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {/* Compact header - only show in browser mode */}
      {!isTelegram && (
        <div className="py-3 px-4 border-b" style={{ borderColor: secondaryBgColor }}>
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
        <div className="py-2 px-4 text-xs text-center opacity-60">
          Welcome, {telegramUser.first_name}! 👋
        </div>
      )}
      
      <main className={isTelegram ? 'pt-0' : 'pt-2'}>
        <PdfViewer isTelegram={isTelegram} themeParams={themeParams} isDark={isDark} />
      </main>
    </div>
  )
}

export default App

