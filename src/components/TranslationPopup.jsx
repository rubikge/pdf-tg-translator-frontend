import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { hapticFeedback, isTelegramEnvironment, getThemeParams } from '../telegram/telegramApp';

export default function TranslationPopup({ selectedText, position, onClose, show }) {
  const popupRef = useRef(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ru');
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const isTelegram = isTelegramEnvironment();
  const themeParams = getThemeParams();

  // Use translation hook (now includes automatic Anki integration)
  const { translation, isLoading, error, ankiStatus, reset } = useTranslation(selectedText, {
    sourceLang,
    targetLang,
    enabled: show,
  });
  
  // Haptic feedback on show
  useEffect(() => {
    if (show && isTelegram) {
      hapticFeedback('impact', 'light');
    }
  }, [show, isTelegram]);

  // Adjust popup position to keep it on screen (especially on mobile)
  useEffect(() => {
    if (!show || !popupRef.current) return;

    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let newX = position.x;
    let newY = position.y;
    
    // Horizontal adjustment
    if (rect.right > viewportWidth - 10) {
      newX = viewportWidth - rect.width / 2 - 10;
    }
    if (rect.left < 10) {
      newX = rect.width / 2 + 10;
    }
    
    // Vertical adjustment - if popup goes off top, show below selection
    if (rect.top < 10) {
      newY = position.y + 60; // Show below instead of above
    }
    
    // If goes off bottom, show above
    if (rect.bottom > viewportHeight - 10) {
      newY = position.y;
    }
    
    setAdjustedPosition({ x: newX, y: newY });
  }, [show, position]);

  // Handle click outside to close popup
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        const selection = window.getSelection();
        if (selection && !selection.toString().trim()) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  // Reset translation when popup closes
  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show, reset]);

  if (!show || !selectedText) {
    return null;
  }

  // Theme-aware colors
  const bgColor = themeParams?.bg_color || '#ffffff';
  const textColor = themeParams?.text_color || '#000000';
  const secondaryBg = themeParams?.secondary_bg_color || '#f4f4f5';
  const hintColor = themeParams?.hint_color || '#666666';
  const linkColor = themeParams?.link_color || '#3b82f6';
  const isDark = themeParams?.bg_color ? 
    parseInt(themeParams.bg_color.slice(1), 16) < 0x808080 : false;

  // Popup styling
  const popupStyle = {
    left: `${adjustedPosition.x}px`,
    top: `${adjustedPosition.y}px`,
    transform: 'translate(-50%, -100%)',
    backgroundColor: bgColor,
    color: textColor,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <div
      ref={popupRef}
      data-translation-popup
      className="fixed rounded-xl shadow-2xl border p-3 z-50 w-[90vw] max-w-[380px] sm:w-auto sm:min-w-[320px]"
      style={popupStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button for better mobile UX */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
        style={{ color: hintColor }}
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Selected text display */}
      <div className="mb-3 pr-6">
        <div className="text-base font-semibold mb-1.5 break-words leading-snug">
          {selectedText}
        </div>
        
        {/* Placeholder for pronunciation and audio */}
        <div className="flex items-center gap-2 text-xs" style={{ color: hintColor }}>
          <span className="italic">noun</span>
          <button
            className="p-1 rounded transition-colors hover:opacity-70"
            style={{ color: linkColor }}
            title="Listen"
            aria-label="Listen pronunciation"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414A2 2 0 0013 14V6a2 2 0 10-4 0v8a2 2 0 001.414.586z"
              />
            </svg>
          </button>
          <span className="ml-1">🇺🇸</span>
        </div>
      </div>

      {/* Translation area */}
      <div className="border-t pt-3" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: hintColor }}>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Translating...</span>
          </div>
        )}
        
        {!isLoading && error && (
          <div className="text-red-500 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {!isLoading && !error && translation && (
          <div>
            <div className="text-sm leading-relaxed" style={{ color: textColor }}>
              {translation}
            </div>
            
            {/* Anki status indicator */}
            {ankiStatus && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {ankiStatus.success ? (
                  <>
                    <svg
                      className="w-3 h-3 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-green-600">Added to Anki</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 text-yellow-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-yellow-600" title={ankiStatus.error}>
                      Translation saved (Anki unavailable)
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {!isLoading && !error && !translation && (
          <div className="text-sm italic" style={{ color: hintColor }}>
            Translation will appear here...
          </div>
        )}
      </div>
    </div>
  );
}

