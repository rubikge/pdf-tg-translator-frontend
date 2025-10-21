import { z } from 'zod';

/**
 * Schema for translation request
 */
export const TranslationRequestSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  source_lang: z.string().length(2, 'Source language must be 2 characters'),
  target_lang: z.string().length(2, 'Target language must be 2 characters'),
});

/**
 * Schema for translation response
 */
export const TranslationResponseSchema = z.object({
  translation: z.string(),
  source_lang: z.string().optional(),
  target_lang: z.string().optional(),
});

/**
 * Type definitions for TypeScript compatibility and JSDoc
 */

/**
 * @typedef {Object} TranslationRequest
 * @property {string} text - Text to translate
 * @property {string} source_lang - Source language code (e.g., 'en')
 * @property {string} target_lang - Target language code (e.g., 'ru')
 */

/**
 * @typedef {Object} TranslationResponse
 * @property {string} translation - Translated text
 * @property {string} [source_lang] - Source language code
 * @property {string} [target_lang] - Target language code
 */

/**
 * @typedef {Object} TranslationError
 * @property {string} message - Error message
 * @property {string} [code] - Error code
 */

export const validateTranslationRequest = (data) => {
  return TranslationRequestSchema.parse(data);
};

export const validateTranslationResponse = (data) => {
  return TranslationResponseSchema.parse(data);
};

