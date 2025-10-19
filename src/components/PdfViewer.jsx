import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// LocalStorage keys
const STORAGE_KEYS = {
  SCALE: 'pdfViewer_scale',
  PAGE_NUMBER: 'pdfViewer_pageNumber',
  FILE_PATH: 'pdfViewer_filePath',
};

export default function PdfViewer() {
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
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* File input */}
      <div className="mb-6">
        <label
          htmlFor="pdf-upload"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block"
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
            <div className="mb-4 flex flex-col sm:flex-row items-center gap-3">
              {/* Page navigation */}
              <div className="flex items-center gap-4 bg-gray-100 p-3 rounded-lg">
                <button
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                <button
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                  title="Zoom out"
                >
                  −
                </button>
                <button
                  onClick={resetZoom}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                  title="Reset zoom"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  onClick={zoomIn}
                  disabled={scale >= 3.0}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-bold"
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
    </div>
  );
}

