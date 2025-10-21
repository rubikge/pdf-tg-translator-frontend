# Примеры использования

## Quick Start

### 1. Использование hook `useTranslation`

```javascript
import { useTranslation } from './hooks/useTranslation';

function MyComponent() {
  const { 
    translation,  // Переведённый текст
    isLoading,    // Флаг загрузки
    error,        // Сообщение об ошибке
    retry,        // Повторить запрос
    reset         // Сбросить состояние
  } = useTranslation('Hello', {
    sourceLang: 'en',
    targetLang: 'ru',
    enabled: true  // Автоматический перевод
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{translation}</div>;
}
```

### 2. Прямой вызов API

```javascript
import { translateText, TranslationApiError } from './api/translateApi';

async function translate() {
  try {
    const result = await translateText({
      text: 'Hello world',
      source_lang: 'en',
      target_lang: 'ru'
    });
    console.log(result.translation); // "Привет мир"
  } catch (error) {
    if (error instanceof TranslationApiError) {
      console.error(`Error [${error.statusCode}]:`, error.message);
    }
  }
}
```

### 3. Валидация данных

```javascript
import { 
  validateTranslationRequest,
  validateTranslationResponse 
} from './types/translation';

// Валидация запроса
try {
  const validRequest = validateTranslationRequest({
    text: 'Hello',
    source_lang: 'en',
    target_lang: 'ru'
  });
  // validRequest гарантированно корректен
} catch (error) {
  console.error('Invalid request:', error.errors);
}

// Валидация ответа
try {
  const validResponse = validateTranslationResponse(apiResponse);
  // validResponse.translation гарантированно существует
} catch (error) {
  console.error('Invalid response:', error.errors);
}
```

## Продвинутые примеры

### 4. Условный перевод

```javascript
function ConditionalTranslation({ text, shouldTranslate }) {
  const { translation } = useTranslation(text, {
    sourceLang: 'en',
    targetLang: 'ru',
    enabled: shouldTranslate  // Перевод только если enabled = true
  });

  return <div>{shouldTranslate ? translation : text}</div>;
}
```

### 5. Перевод с retry

```javascript
function TranslationWithRetry({ text }) {
  const { translation, error, isLoading, retry } = useTranslation(text);

  return (
    <div>
      {isLoading && <Spinner />}
      {error && (
        <div>
          <p>Error: {error}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
      {translation && <p>{translation}</p>}
    </div>
  );
}
```

### 6. Batch перевод

```javascript
async function translateMultiple(texts) {
  const promises = texts.map(text => 
    translateText({
      text,
      source_lang: 'en',
      target_lang: 'ru'
    })
  );
  
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => ({
    original: texts[index],
    translation: result.status === 'fulfilled' 
      ? result.value.translation 
      : null,
    error: result.status === 'rejected' 
      ? result.reason.message 
      : null
  }));
}
```

### 7. Смена языков

```javascript
function DynamicLanguageTranslation({ text }) {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ru');

  const { translation, isLoading } = useTranslation(text, {
    sourceLang,
    targetLang,
    enabled: true
  });

  return (
    <div>
      <select onChange={(e) => setSourceLang(e.target.value)}>
        <option value="en">English</option>
        <option value="ru">Russian</option>
      </select>
      
      <select onChange={(e) => setTargetLang(e.target.value)}>
        <option value="ru">Russian</option>
        <option value="en">English</option>
      </select>

      {isLoading ? 'Translating...' : translation}
    </div>
  );
}
```

### 8. Кастомная обработка ошибок

```javascript
function handleTranslationError(error) {
  if (error instanceof TranslationApiError) {
    switch (error.statusCode) {
      case 0:
        return 'No internet connection';
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required';
      case 429:
        return 'Too many requests. Please wait.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message;
    }
  }
  return 'Unknown error occurred';
}

function TranslationWithCustomErrors({ text }) {
  const { translation, error, retry } = useTranslation(text);

  return (
    <div>
      {error && (
        <div className="error">
          {handleTranslationError(error)}
          <button onClick={retry}>Try Again</button>
        </div>
      )}
      {translation}
    </div>
  );
}
```

### 9. Дебаунсинг ввода

```javascript
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function LiveTranslation() {
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 500);
  
  const { translation, isLoading } = useTranslation(debouncedInput, {
    enabled: debouncedInput.length > 0
  });

  return (
    <div>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type to translate..."
      />
      {isLoading && <span>Translating...</span>}
      {translation && <p>{translation}</p>}
    </div>
  );
}
```

### 10. Кеширование переводов

```javascript
const translationCache = new Map();

function useCachedTranslation(text, options) {
  const cacheKey = `${text}-${options.sourceLang}-${options.targetLang}`;
  
  // Проверяем кеш
  const cached = translationCache.get(cacheKey);
  const [initialTranslation] = useState(cached || '');
  
  const { translation, ...rest } = useTranslation(text, {
    ...options,
    enabled: !cached && options.enabled  // Не запрашиваем если есть в кеше
  });
  
  // Сохраняем в кеш
  useEffect(() => {
    if (translation) {
      translationCache.set(cacheKey, translation);
    }
  }, [translation, cacheKey]);
  
  return { 
    translation: translation || initialTranslation, 
    ...rest 
  };
}
```

## Типы ошибок

```javascript
// Network error
{
  name: 'TranslationApiError',
  message: 'Network error: Unable to reach translation service',
  statusCode: 0
}

// Validation error
{
  name: 'TranslationApiError',
  message: 'Validation error: Text cannot be empty',
  statusCode: 400
}

// HTTP error
{
  name: 'TranslationApiError',
  message: 'Translation failed: Internal Server Error',
  statusCode: 500
}
```

## Environment Variables

```bash
# .env файл
VITE_API_URL=http://localhost:8000

# В коде доступно как:
import.meta.env.VITE_API_URL
```

## Best Practices

### ✅ DO

```javascript
// Используйте hook для компонентов
const { translation } = useTranslation(text);

// Используйте enabled для условного перевода
const { translation } = useTranslation(text, { enabled: shouldTranslate });

// Обрабатывайте ошибки
if (error instanceof TranslationApiError) {
  // Handle specific error
}

// Используйте reset при размонтировании
useEffect(() => {
  return () => reset();
}, []);
```

### ❌ DON'T

```javascript
// Не делайте fetch напрямую в компонентах
const response = await fetch('/api/translate'); // ❌

// Не игнорируйте ошибки валидации
translateText({ text: '' }); // ❌ Text cannot be empty

// Не вызывайте hook условно
if (condition) {
  const { translation } = useTranslation(text); // ❌
}
```

## Тестирование

```javascript
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { useTranslation } from './hooks/useTranslation';

test('should translate text', async () => {
  const { result } = renderHook(() => 
    useTranslation('Hello', {
      sourceLang: 'en',
      targetLang: 'ru'
    })
  );

  await waitFor(() => 
    expect(result.current.translation).toBe('Привет')
  );
});
```

## Полезные ссылки

- [Zod Documentation](https://zod.dev/)
- [React Hooks](https://react.dev/reference/react)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

