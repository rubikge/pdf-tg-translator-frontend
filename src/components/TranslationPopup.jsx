import { useEffect, useRef } from 'react';

export default function TranslationPopup({ selectedText, position, onClose, show }) {
  const popupRef = useRef(null);

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
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Close"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Language selector */}
      <div className="flex items-center justify-end gap-2 mb-3 text-sm text-gray-600">
        <span>En</span>
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
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span>Ru</span>
      </div>

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

      {/* Translation placeholder */}
      <div className="border-t border-gray-200 pt-3">
        <div className="text-gray-600 text-sm">
          Translation will appear here...
        </div>
      </div>
    </div>
  );
}

