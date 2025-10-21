# Архитектура приложения

## Обзор

Приложение построено на основе современных паттернов React с четким разделением ответственности между слоями.

## Слои приложения

### 1. Components Layer (`src/components/`)

**Ответственность:** Отображение UI

```
components/
├── PdfViewer.jsx         # Основной компонент для отображения PDF
└── TranslationPopup.jsx  # Всплывающее окно с переводом
```

**Принципы:**
- Компоненты не содержат бизнес-логику
- Получают данные через props
- Используют hooks для state management
- Сфокусированы на UI/UX

### 2. Hooks Layer (`src/hooks/`)

**Ответственность:** Бизнес-логика и state management

```
hooks/
└── useTranslation.js     # Hook для управления переводом
```

**Возможности `useTranslation`:**
- Автоматический перевод при изменении текста
- Управление состояниями: loading, error, success
- Retry и reset функциональность
- Оптимизация через useCallback

**Пример использования:**

```javascript
const { translation, isLoading, error, retry, reset } = useTranslation(
  text,
  {
    sourceLang: 'en',
    targetLang: 'ru',
    enabled: true, // Auto-translate
  }
);
```

### 3. API Layer (`src/api/`)

**Ответственность:** Взаимодействие с backend

```
api/
└── translateApi.js       # Клиент для Translation API
```

**Особенности:**
- Инкапсуляция HTTP запросов
- Custom error handling (`TranslationApiError`)
- Интеграция с валидацией (Zod)
- Централизованная конфигурация API URL

**Пример использования:**

```javascript
import { translateText } from '../api/translateApi';

try {
  const result = await translateText({
    text: 'Hello',
    source_lang: 'en',
    target_lang: 'ru',
  });
  console.log(result.translation); // "Привет"
} catch (error) {
  if (error instanceof TranslationApiError) {
    console.error(`API Error [${error.statusCode}]:`, error.message);
  }
}
```

### 4. Types Layer (`src/types/`)

**Ответственность:** Валидация данных и type safety

```
types/
└── translation.js        # Zod schemas и JSDoc types
```

**Схемы валидации:**

```javascript
// Request Schema
{
  text: string (min: 1),
  source_lang: string (length: 2),
  target_lang: string (length: 2)
}

// Response Schema
{
  translation: string (required),
  source_lang?: string,
  target_lang?: string
}
```

**Преимущества:**
- Runtime type checking с Zod
- Защита от невалидных данных
- Автоматическая валидация запросов/ответов
- JSDoc для IDE autocomplete

## Поток данных

```
User Action (Text Selection)
        ↓
PdfViewer (Component)
        ↓
TranslationPopup (Component)
        ↓
useTranslation (Hook)
        ↓
translateApi (API Client)
        ↓
Zod Validation (Types)
        ↓
Backend API
        ↓
Zod Validation (Types)
        ↓
State Update (Hook)
        ↓
UI Update (Component)
```

## Error Handling

### 1. Validation Errors
```javascript
// Zod автоматически бросает ошибку при невалидных данных
try {
  validateTranslationRequest({ text: '' }); // Error: Text cannot be empty
} catch (error) {
  // TranslationApiError с кодом 400
}
```

### 2. Network Errors
```javascript
// Обрабатываются в translateApi
fetch(...) // Network error
  ↓
TranslationApiError('Network error: Unable to reach translation service', 0)
  ↓
Hook обрабатывает и устанавливает error state
```

### 3. HTTP Errors
```javascript
// 4xx, 5xx ошибки
response.status = 500
  ↓
TranslationApiError('Translation failed: Internal Server Error', 500)
  ↓
Hook форматирует сообщение для пользователя
```

## Best Practices

### Separation of Concerns
- ✅ Components: только UI
- ✅ Hooks: state и логика
- ✅ API: HTTP запросы
- ✅ Types: валидация данных

### Reusability
```javascript
// Hook можно использовать в любом компоненте
function AnotherComponent() {
  const { translation } = useTranslation('text', { ... });
  return <div>{translation}</div>;
}
```

### Type Safety
```javascript
// Zod обеспечивает runtime проверку
const result = await translateText(request);
// result.translation гарантированно существует
```

### Error Handling
```javascript
// Все ошибки имеют единый формат
catch (error) {
  if (error instanceof TranslationApiError) {
    // Обработка специфичных ошибок API
  }
}
```

## Расширение функциональности

### Добавление нового API endpoint

1. Создать схемы в `src/types/`
```javascript
export const NewRequestSchema = z.object({ ... });
export const NewResponseSchema = z.object({ ... });
```

2. Создать API клиент в `src/api/`
```javascript
export async function newApiCall(request) {
  // Validation + fetch + error handling
}
```

3. Создать hook в `src/hooks/`
```javascript
export function useNewFeature() {
  // State management + API calls
}
```

4. Использовать в компонентах
```javascript
function MyComponent() {
  const { data } = useNewFeature();
  return <div>{data}</div>;
}
```

## Тестирование

### Unit Tests

```javascript
// Test hook
import { renderHook } from '@testing-library/react-hooks';
import { useTranslation } from './useTranslation';

test('should translate text', async () => {
  const { result } = renderHook(() => useTranslation('Hello', { ... }));
  await waitFor(() => expect(result.current.translation).toBe('Привет'));
});
```

### Integration Tests

```javascript
// Test API client
import { translateText } from './translateApi';

test('should call API and validate response', async () => {
  const result = await translateText({ ... });
  expect(result).toHaveProperty('translation');
});
```

## Производительность

### Оптимизации

1. **useCallback** в hooks - предотвращение лишних ре-рендеров
2. **Debounce** в text selection - уменьшение API вызовов
3. **Zod** validation - быстрая проверка типов
4. **Lazy loading** компонентов (future improvement)

## Заключение

Архитектура обеспечивает:
- ✅ Чистый и поддерживаемый код
- ✅ Легкое тестирование
- ✅ Простое расширение
- ✅ Type safety
- ✅ Переиспользование кода

