import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import TranslationPopup from './TranslationPopup';
import { hapticFeedback } from '../telegram/telegramApp';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// LocalStorage keys
const STORAGE_KEYS = {
  SCALE: 'pdfViewer_scale',
  PAGE_NUMBER: 'pdfViewer_pageNumber',
  FILE_PATH: 'pdfViewer_filePath',
};

export default function PdfViewer({ isTelegram, themeParams, isDark }) {
  // Load saved settings from localStorage or use defaults
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAGE_NUMBER);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [scale, setScale] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCALE);
    return saved ? parseFloat(saved) : 1.0;
  });
  const [error, setError] = useState(null);
  
  // Translation popup states
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const selectionTimeoutRef = useRef(null);
  
  // Touch gesture support
  const touchStartRef = useRef(null);
  const pdfContainerRef = useRef(null);

  // Load default PDF on mount
  useEffect(() => {
    const savedFilePath = localStorage.getItem(STORAGE_KEYS.FILE_PATH);
    const defaultPdfPath = savedFilePath || '/C1_Lois_Lowry_The_Giver_Messenger.pdf';
    setFile(defaultPdfPath);
  }, []);

  // Save scale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCALE, scale.toString());
  }, [scale]);

  // Save pageNumber to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE_NUMBER, pageNumber.toString());
  }, [pageNumber]);

  // Handle text selection in PDF
  useEffect(() => {
    const handleTextSelection = () => {
      // Clear any existing timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      // Wait a moment to ensure selection is complete
      selectionTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 0) {
          // Limit to first 10 words
          const words = text.split(/\s+/);
          const limitedText = words.slice(0, 10).join(' ');

          // Get selection position
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setSelectedText(limitedText);
          setPopupPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          setShowPopup(true);
          
          // Haptic feedback on selection
          if (isTelegram) {
            hapticFeedback('selection');
          }
        } else {
          setShowPopup(false);
        }
      }, 300); // Reduced delay for better responsiveness
    };

    // Listen for both mouse and touch events
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);

    // Cleanup
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [isTelegram]);
  
  // Touch gesture support for page navigation (swipe left/right)
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container || !isTelegram) return;
    
    const handleTouchStart = (e) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    };
    
    const handleTouchEnd = (e) => {
      if (!touchStartRef.current) return;
      
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };
      
      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const deltaTime = touchEnd.time - touchStartRef.current.time;
      
      // Check if it's a horizontal swipe (not vertical scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 300) {
        if (deltaX > 0 && pageNumber > 1) {
          // Swipe right - previous page
          goToPrevPage();
        } else if (deltaX < 0 && pageNumber < numPages) {
          // Swipe left - next page
          goToNextPage();
        }
      }
      
      touchStartRef.current = null;
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTelegram, pageNumber, numPages]);

  const onFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setPageNumber(1);
      // Clear saved file path as user selected a local file
      localStorage.removeItem(STORAGE_KEYS.FILE_PATH);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Don't reset pageNumber, keep the current/saved page
    // But validate it's within bounds
    setPageNumber((prevPage) => {
      const validPage = Math.min(Math.max(prevPage, 1), numPages);
      return validPage;
    });
    
    // Save file path if it's a string (URL)
    if (typeof file === 'string') {
      localStorage.setItem(STORAGE_KEYS.FILE_PATH, file);
    }
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Error loading PDF file');
  };

  const goToPrevPage = () => {
    if (isTelegram) hapticFeedback('impact', 'light');
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    if (isTelegram) hapticFeedback('impact', 'light');
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    if (isTelegram) hapticFeedback('impact', 'light');
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    if (isTelegram) hapticFeedback('impact', 'light');
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    if (isTelegram) hapticFeedback('selection');
    setScale(1.0);
  };

  // Theme-aware colors
  const buttonBg = themeParams?.button_color || '#3b82f6';
  const buttonText = themeParams?.button_text_color || '#ffffff';
  const secondaryBg = themeParams?.secondary_bg_color || (isDark ? '#2a2a2a' : '#f4f4f5');
  const hintColor = themeParams?.hint_color || (isDark ? '#999999' : '#666666');

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Compact header with file input */}
      <div className={`w-full flex-shrink-0 ${isTelegram ? 'px-3 py-2' : 'px-4 py-4'}`}>
        <label
          htmlFor="pdf-upload"
          className={`px-5 py-2.5 rounded-lg cursor-pointer transition-all inline-block font-medium text-center active:scale-95 ${isTelegram ? 'w-full' : ''}`}
          style={{
            backgroundColor: buttonBg,
            color: buttonText
          }}
          onClick={() => isTelegram && hapticFeedback('impact', 'medium')}
        >
          📄 Open PDF
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className={`w-full ${isTelegram ? 'px-3 mb-2' : 'px-4 mb-4'}`}>
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* PDF Document */}
      {file && (
        <div className="flex flex-col items-center w-full flex-1 overflow-hidden">
          {/* Navigation controls - sticky at top */}
          {numPages && (
            <div className={`w-full flex-shrink-0 ${isTelegram ? 'px-2 pb-2' : 'px-4 pb-3'}`}>
              <div className="flex flex-col gap-2">
                {/* Page navigation */}
                <div 
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ backgroundColor: secondaryBg }}
                >
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    style={{
                      backgroundColor: buttonBg,
                      color: buttonText
                    }}
                  >
                    ‹
                  </button>
                  <span className="font-medium text-sm px-2 text-center" style={{ color: hintColor }}>
                    {pageNumber} / {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    style={{
                      backgroundColor: buttonBg,
                      color: buttonText
                    }}
                  >
                    ›
                  </button>
                </div>

                {/* Zoom controls */}
                <div 
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2"
                  style={{ backgroundColor: secondaryBg }}
                >
                  <button
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    className="px-3 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold active:scale-95"
                    style={{
                      backgroundColor: buttonBg,
                      color: buttonText
                    }}
                    title="Zoom out"
                  >
                    −
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-4 py-2 rounded-lg text-xs transition-all active:scale-95 min-w-[60px]"
                    style={{
                      backgroundColor: secondaryBg,
                      color: hintColor
                    }}
                    title="Reset zoom"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    onClick={zoomIn}
                    disabled={scale >= 3.0}
                    className="px-3 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold active:scale-95"
                    style={{
                      backgroundColor: buttonBg,
                      color: buttonText
                    }}
                    title="Zoom in"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PDF Document viewer - scrollable area */}
          <div 
            ref={pdfContainerRef}
            className="flex-1 overflow-auto w-full" 
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex justify-center p-2">
              <div className="shadow-lg" style={{ 
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}>
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="p-8" style={{ color: hintColor }}>Loading PDF...</div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={Math.min(window.innerWidth - (isTelegram ? 24 : 32), 800)}
                  />
                </Document>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions when no file is selected */}
      {!file && !error && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center" style={{ color: hintColor }}>
            <p className="text-base mb-2">📄 Click "Open PDF" to select a file</p>
            <p className="text-sm opacity-70">The document will be displayed here</p>
          </div>
        </div>
      )}

      {/* Translation Popup */}
      <TranslationPopup
        selectedText={selectedText}
        position={popupPosition}
        onClose={() => setShowPopup(false)}
        show={showPopup}
      />
    </div>
  );
}

