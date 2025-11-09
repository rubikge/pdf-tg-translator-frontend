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
  
  // Dynamic background color based on theme
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const subtextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  
  return (
    <div className={`min-h-screen ${bgColor}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${textColor} mb-2`}>
            PDF Translator
          </h1>
          <p className={subtextColor}>
            {isTelegram ? (
              <>
                📱 Telegram Mini App Mode
                {telegramUser && (
                  <span className="ml-2 text-sm">
                    • {telegramUser.first_name}
                  </span>
                )}
              </>
            ) : (
              <>
                🌐 Browser Mode
                {isTelegramSDKLoaded() && (
                  <span className="ml-2 text-xs opacity-70">
                    (SDK loaded, but no Telegram data)
                  </span>
                )}
              </>
            )}
          </p>
        </header>
        
        <main>
          <PdfViewer />
        </main>
      </div>
    </div>
  )
}

export default App

