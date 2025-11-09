import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

/**
 * Custom hook for translation functionality using backend API
 * Automatically translates text and adds to Anki
 * 
 * @param {string} text - Text to translate
 * @param {Object} options - Translation options
 * @param {boolean} options.enabled - Whether to enable automatic translation
 * @returns {Object} Translation state and methods
 */
export function useTranslation(text, { enabled = true } = {}) {
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ankiStatus, setAnkiStatus] = useState(null);

  // Reset state when text changes
  useEffect(() => {
    setTranslation('');
    setError(null);
    setAnkiStatus(null);
  }, [text]);

  // Translate function using backend API
  const translate = useCallback(async () => {
    if (!text || text.trim().length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnkiStatus(null);

    try {
      const response = await fetch(`${API_URL}/api/processTranslation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setTranslation(data.translation);
      
      // Set Anki status (non-blocking)
      if (data.ankiStatus === 'added') {
        setAnkiStatus({ success: true, noteId: data.ankiNoteId });
      } else if (data.ankiError) {
        setAnkiStatus({ success: false, error: data.ankiError });
      }
    } catch (err) {
      console.error('Translation error:', err);
      
      // Format error message
      let errorMessage = 'Translation failed';
      if (err.message) {
        if (err.message.includes('fetch') || err.message.includes('network')) {
          errorMessage = 'Cannot connect to translation service';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  // Auto-translate when enabled and text changes
  useEffect(() => {
    if (enabled && text) {
      translate();
    }
  }, [enabled, text, translate]);

  // Manual retry function
  const retry = useCallback(() => {
    translate();
  }, [translate]);

  // Reset function
  const reset = useCallback(() => {
    setTranslation('');
    setError(null);
    setIsLoading(false);
    setAnkiStatus(null);
  }, []);

  return {
    translation,
    isLoading,
    error,
    ankiStatus,
    translate,
    retry,
    reset,
  };
}

