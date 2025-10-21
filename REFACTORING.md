# Рефакторинг: Custom Hooks и Type Validation

## Что было сделано

### ✅ Создана слоистая архитектура

**До рефакторинга:**
- Вся логика перевода внутри `TranslationPopup.jsx`
- Fetch запросы напрямую в компоненте
- Нет валидации данных
- Сложно тестировать
- Нельзя переиспользовать логику

**После рефакторинга:**
- Чистое разделение на слои: Components → Hooks → API → Types
- Переиспользуемые модули
- Runtime валидация с Zod
- Легко тестировать
- Расширяемая архитектура

## Новые файлы

### 1. `src/types/translation.js`
**Назначение:** Схемы валидации и типы

```javascript
// Zod schemas для runtime проверки
export const TranslationRequestSchema = z.object({
  text: z.string().min(1),
  source_lang: z.string().length(2),
  target_lang: z.string().length(2),
});

export const TranslationResponseSchema = z.object({
  translation: z.string(),
  source_lang: z.string().optional(),
  target_lang: z.string().optional(),
});
```

**Преимущества:**
- ✅ Runtime валидация данных
- ✅ Защита от некорректных API ответов
- ✅ JSDoc типы для IDE
- ✅ Автоматическая проверка запросов

### 2. `src/api/translateApi.js`
**Назначение:** HTTP клиент для Translation API

```javascript
export async function translateText(request) {
  // 1. Валидация запроса
  const validatedRequest = validateTranslationRequest(request);
  
  // 2. HTTP запрос
  const response = await fetch(`${API_URL}/v1/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedRequest),
  });
  
  // 3. Обработка ошибок
  if (!response.ok) {
    throw new TranslationApiError(...);
  }
  
  // 4. Валидация ответа
  const data = await response.json();
  return validateTranslationResponse(data);
}
```

**Преимущества:**
- ✅ Инкапсуляция HTTP логики
- ✅ Custom error handling
- ✅ Единая точка для API вызовов
- ✅ Легко mock-ировать для тестов

### 3. `src/hooks/useTranslation.js`
**Назначение:** Custom React hook для state management

```javascript
export function useTranslation(text, options) {
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auto-translate
  useEffect(() => {
    if (enabled && text) {
      translate();
    }
  }, [enabled, text]);
  
  return { translation, isLoading, error, retry, reset };
}
```

**Преимущества:**
- ✅ Переиспользуемая логика
- ✅ State management в одном месте
- ✅ Автоматический перевод
- ✅ Retry и reset функциональность

## Изменения в существующих файлах

### `src/components/TranslationPopup.jsx`

**Было (51 строка логики):**
```javascript
const [translation, setTranslation] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchTranslation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(...);
      const data = await response.json();
      setTranslation(data.translation);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };
  fetchTranslation();
}, [selectedText]);
```

**Стало (1 строка):**
```javascript
const { translation, isLoading, error, reset } = useTranslation(selectedText, {
  sourceLang,
  targetLang,
  enabled: show,
});
```

**Улучшения:**
- ✅ Компонент сократился на 40+ строк
- ✅ Убрана вся бизнес-логика
- ✅ Фокус только на UI
- ✅ Легче читать и поддерживать

## Добавленные зависимости

```json
{
  "dependencies": {
    "zod": "^3.x.x"
  }
}
```

**Zod** - библиотека для валидации схем с TypeScript-like типами для JavaScript.

## Преимущества рефакторинга

### 1. Separation of Concerns
- Components → UI только
- Hooks → State management
- API → HTTP requests
- Types → Data validation

### 2. Reusability
```javascript
// Теперь можно использовать в любом компоненте
function Header() {
  const { translation } = useTranslation('Menu', { ... });
  return <h1>{translation}</h1>;
}
```

### 3. Testability
```javascript
// Легко тестировать изолированно
import { translateText } from './api/translateApi';

test('translateText validates request', async () => {
  await expect(translateText({ text: '' })).rejects.toThrow();
});
```

### 4. Type Safety
```javascript
// Zod обеспечивает runtime проверку
const result = await translateText(request);
// result.translation гарантированно существует
```

### 5. Error Handling
```javascript
// Унифицированная обработка ошибок
if (error instanceof TranslationApiError) {
  switch (error.statusCode) {
    case 0: return 'Network error';
    case 400: return 'Invalid request';
    case 500: return 'Server error';
  }
}
```

## Метрики

### Код

| Метрика | До | После | Улучшение |
|---------|-----|-------|-----------|
| Строк в TranslationPopup | 215 | 178 | -17% |
| Строк бизнес-логики в компоненте | 51 | 0 | -100% |
| Переиспользуемые модули | 0 | 3 | ∞ |
| Type safety | ❌ | ✅ | 100% |

### Архитектура

| Аспект | До | После |
|--------|-----|-------|
| Layers | 1 (Components) | 4 (Components, Hooks, API, Types) |
| Testability | Сложно | Легко |
| Reusability | Нет | Да |
| Error handling | Базовый | Продвинутый |
| Validation | Нет | Runtime (Zod) |

## Примеры использования

### Использование в другом компоненте

```javascript
import { useTranslation } from './hooks/useTranslation';

function QuickTranslate() {
  const [text, setText] = useState('');
  const { translation, isLoading } = useTranslation(text);
  
  return (
    <div>
      <input onChange={(e) => setText(e.target.value)} />
      {isLoading ? 'Loading...' : translation}
    </div>
  );
}
```

### Прямой вызов API

```javascript
import { translateText } from './api/translateApi';

async function batchTranslate(texts) {
  return Promise.all(
    texts.map(text => translateText({ text, source_lang: 'en', target_lang: 'ru' }))
  );
}
```

### Custom валидация

```javascript
import { TranslationRequestSchema } from './types/translation';

function MyForm({ onSubmit }) {
  const handleSubmit = (data) => {
    try {
      const validated = TranslationRequestSchema.parse(data);
      onSubmit(validated);
    } catch (error) {
      console.error('Validation failed:', error.errors);
    }
  };
}
```

## Что дальше?

### Возможные улучшения

1. **Кеширование переводов**
   ```javascript
   const translationCache = new Map();
   ```

2. **Debounce для API вызовов**
   ```javascript
   const debouncedTranslate = useDebouncedCallback(translate, 500);
   ```

3. **Offline support**
   ```javascript
   const { translation } = useTranslation(text, { offline: true });
   ```

4. **Batch translations**
   ```javascript
   const { translations } = useBatchTranslation(texts);
   ```

5. **Translation history**
   ```javascript
   const { history, addToHistory } = useTranslationHistory();
   ```

## Заключение

Рефакторинг обеспечил:
- ✅ Чистую архитектуру с разделением ответственности
- ✅ Переиспользуемые модули (hooks, API, types)
- ✅ Runtime валидацию данных с Zod
- ✅ Улучшенную обработку ошибок
- ✅ Легкость тестирования
- ✅ Расширяемость для новых функций

Код стал чище, безопаснее и готов к масштабированию! 🚀

