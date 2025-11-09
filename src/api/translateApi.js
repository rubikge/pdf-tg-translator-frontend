import { validateTranslationRequest, validateTranslationResponse } from '../types/translation';
import { getTelegramInitData } from '../telegram/telegramApp';

/**
 * API client for translation service
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Custom error class for translation API errors
 */
export class TranslationApiError extends Error {
  constructor(message, statusCode, originalError) {
    super(message);
    this.name = 'TranslationApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Translate text from source language to target language
 * 
 * @param {import('../types/translation').TranslationRequest} request - Translation request
 * @returns {Promise<import('../types/translation').TranslationResponse>} Translation response
 * @throws {TranslationApiError} If the request fails
 */
export async function translateText(request) {
  try {
    // Validate request data
    const validatedRequest = validateTranslationRequest(request);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add Telegram init data if available
    const initData = getTelegramInitData();
    if (initData) {
      headers['X-Telegram-Init-Data'] = initData;
    }

    // Make API request
    const response = await fetch(`${API_URL}/v1/translate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(validatedRequest),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new TranslationApiError(
        `Translation failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    // Parse and validate response
    const data = await response.json();
    const validatedResponse = validateTranslationResponse(data);

    return validatedResponse;
  } catch (error) {
    // Re-throw TranslationApiError as-is
    if (error instanceof TranslationApiError) {
      throw error;
    }

    // Handle validation errors
    if (error.name === 'ZodError') {
      throw new TranslationApiError(
        `Validation error: ${error.message}`,
        400,
        error
      );
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new TranslationApiError(
        'Network error: Unable to reach translation service',
        0,
        error
      );
    }

    // Handle other errors
    throw new TranslationApiError(
      error.message || 'Unknown translation error',
      500,
      error
    );
  }
}

