import { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Custom hook for translation functionality using Gemini API
 * Translates text from Russian to English
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

  // Reset state when text changes
  useEffect(() => {
    setTranslation('');
    setError(null);
  }, [text]);

  // Translate function using Gemini API
  const translate = useCallback(async () => {
    if (!text || text.trim().length === 0) {
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('GEMINI_API_KEY is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `Translate the following English text to Russian. Return only the translation without any explanations or additional text:\n\n${text.trim()}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();

      setTranslation(translatedText.trim());
    } catch (err) {
      console.error('Translation error:', err);
      
      // Format error message
      let errorMessage = 'Translation failed';
      if (err.message) {
        if (err.message.includes('API key')) {
          errorMessage = 'Invalid API key';
        } else if (err.message.includes('quota')) {
          errorMessage = 'API quota exceeded';
        } else if (err.message.includes('network')) {
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
  }, []);

  return {
    translation,
    isLoading,
    error,
    translate,
    retry,
    reset,
  };
}

