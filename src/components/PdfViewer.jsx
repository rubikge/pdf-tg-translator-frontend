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

          // Remove selection to hide native browser menu
          selection.removeAllRanges();
        } else {
          setShowPopup(false);
        }
      }, 500); // Show popup after 500ms delay
    };

    // Listen for mouseup and touchend events (when user finishes selection)
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
  }, []);

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
    <div 
      className={`flex flex-col items-center w-full ${isTelegram ? 'px-2 py-2' : 'px-4 py-4'}`}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none' }}
    >
      {/* File input */}
      <div className={isTelegram ? 'mb-3' : 'mb-6'}>
        <label
          htmlFor="pdf-upload"
          className="px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block font-medium"
          style={{
            backgroundColor: buttonBg,
            color: buttonText
          }}
          onClick={() => isTelegram && hapticFeedback('impact', 'medium')}
        >
          Open PDF
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
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* PDF Document */}
      {file && (
        <div className="flex flex-col items-center">
          {/* Navigation controls */}
          {numPages && (
            <div className={`flex flex-col sm:flex-row items-center ${isTelegram ? 'gap-2 mb-3' : 'gap-3 mb-4'}`}>
              {/* Page navigation */}
              <div 
                className={`flex items-center rounded-lg ${isTelegram ? 'gap-2 p-2' : 'gap-4 p-3'}`}
                style={{ backgroundColor: secondaryBg }}
              >
                <button
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  className={`${isTelegram ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded font-medium transition-opacity disabled:opacity-30 disabled:cursor-not-allowed`}
                  style={{
                    backgroundColor: buttonBg,
                    color: buttonText
                  }}
                >
                  Previous
                </button>
                <span className={`font-medium ${isTelegram ? 'text-sm' : ''}`} style={{ color: hintColor }}>
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  className={`${isTelegram ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded font-medium transition-opacity disabled:opacity-30 disabled:cursor-not-allowed`}
                  style={{
                    backgroundColor: buttonBg,
                    color: buttonText
                  }}
                >
                  Next
                </button>
              </div>

              {/* Zoom controls */}
              <div 
                className={`flex items-center rounded-lg ${isTelegram ? 'gap-2 p-2' : 'gap-2 p-3'}`}
                style={{ backgroundColor: secondaryBg }}
              >
                <button
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  className={`${isTelegram ? 'px-2.5 py-1.5' : 'px-3 py-2'} rounded transition-opacity disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold`}
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
                  className={`${isTelegram ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'} rounded transition-opacity`}
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
                  className={`${isTelegram ? 'px-2.5 py-1.5' : 'px-3 py-2'} rounded transition-opacity disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold`}
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
          )}

          {/* PDF Document viewer */}
          <div className="border border-gray-300 shadow-lg overflow-auto max-w-full">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="p-8 text-gray-600">Loading PDF...</div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </div>
      )}

      {/* Instructions when no file is selected */}
      {!file && !error && (
        <div className="text-gray-500 text-center mt-8">
          <p className="text-lg">Click "Open PDF" to select a PDF file</p>
          <p className="text-sm mt-2">The document will be displayed here</p>
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

