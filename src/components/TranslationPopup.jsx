import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { hapticFeedback, isTelegramEnvironment } from '../telegram/telegramApp';

export default function TranslationPopup({ selectedText, position, onClose, show }) {
  const popupRef = useRef(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ru');
  const isTelegram = isTelegramEnvironment();

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

  return (
    <div
      ref={popupRef}
      data-translation-popup
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 min-w-[300px] max-w-[400px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {/* Selected text display */}
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-800 mb-2 break-words">
          {selectedText}
        </div>
        
        {/* Placeholder for pronunciation and audio */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="italic">noun</span>
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Listen"
          >
            <svg
              className="w-4 h-4"
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
          <span className="ml-2">🇺🇸</span>
        </div>
      </div>

      {/* Translation area */}
      <div className="border-t border-gray-200 pt-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
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
            <div className="text-gray-800 text-sm leading-relaxed">
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
          <div className="text-gray-400 text-sm italic">
            Translation will appear here...
          </div>
        )}
      </div>
    </div>
  );
}

