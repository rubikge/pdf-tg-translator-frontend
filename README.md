# PDF Translator App

Минимальное React приложение для просмотра PDF файлов с возможностью дальнейшего расширения функционала выделения текста и отправки на бэкенд.

## Технологии

- **React 18** - UI библиотека
- **Vite** - сборщик и dev сервер
- **Tailwind CSS** - стилизация
- **react-pdf** - просмотр PDF документов
- **Zod** - валидация схем и runtime type checking

## Установка

```bash
npm install
```

## Конфигурация

Создайте файл `.env` в корневой директории проекта:

```bash
VITE_API_URL=http://localhost:8000
```

Если файл не создан, по умолчанию используется `http://localhost:8000`.

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

## Использование

1. Нажмите кнопку "Open PDF"
2. Выберите PDF файл на вашем компьютере
3. Используйте кнопки "Previous" и "Next" для навигации по страницам
4. Используйте кнопки "+" и "−" для масштабирования страниц (50% - 300%)
5. Нажмите на процент (например "100%") для сброса масштаба
6. **Выделите текст** в PDF - через 500ms появится всплывающее окно с переводом

## Структура проекта

```
frontend_cursor/
├── package.json          # Зависимости и скрипты
├── vite.config.js        # Конфигурация Vite
├── tailwind.config.js    # Конфигурация Tailwind
├── postcss.config.js     # Конфигурация PostCSS
├── index.html            # HTML точка входа
└── src/
    ├── main.jsx          # JavaScript точка входа
    ├── App.jsx           # Главный компонент приложения
    ├── index.css         # Глобальные стили
    ├── components/
    │   ├── PdfViewer.jsx        # Компонент просмотра PDF
    │   └── TranslationPopup.jsx # Всплывающее окно перевода
    ├── hooks/
    │   └── useTranslation.js    # Custom hook для перевода
    ├── api/
    │   └── translateApi.js      # API клиент для перевода
    └── types/
        └── translation.js       # Схемы валидации (Zod)
```

## Функционал

- ✅ Открытие PDF файлов через диалог выбора
- ✅ Навигация по страницам (Previous/Next)
- ✅ Масштабирование страниц (50% - 300%)
- ✅ Выделение текста в PDF с автоматическим появлением окна перевода
- ✅ Перевод текста через API (ограничение до 10 слов для отображения)
- ✅ Индикация загрузки и обработка ошибок
- ✅ Адаптивный дизайн с Tailwind CSS

## Архитектура

### Слои приложения

1. **Components** (`src/components/`)
   - React компоненты UI
   - Отвечают только за отображение

2. **Hooks** (`src/hooks/`)
   - Custom hooks для бизнес-логики
   - `useTranslation` - управление состоянием перевода

3. **API** (`src/api/`)
   - Клиенты для взаимодействия с backend
   - Обработка HTTP запросов
   - Custom error handling

4. **Types** (`src/types/`)
   - Zod схемы для валидации данных
   - JSDoc type definitions
   - Runtime type checking

### Преимущества архитектуры

- ✅ **Разделение ответственности** - каждый модуль отвечает за свою задачу
- ✅ **Переиспользование** - hooks и API клиенты можно использовать в разных компонентах
- ✅ **Типобезопасность** - Zod валидирует данные в runtime
- ✅ **Тестируемость** - легко тестировать изолированные модули
- ✅ **Расширяемость** - простое добавление новых функций

## API интеграция

Приложение использует REST API для перевода текста.

### Эндпойнт перевода

**POST** `{VITE_API_URL}/v1/translate`

**Request Body:**
```json
{
  "text": "community",
  "source_lang": "en",
  "target_lang": "ru"
}
```

**Response:**
```json
{
  "translation": "сообщество",
  "source_lang": "en",
  "target_lang": "ru"
}
```

### Обработка ошибок

- При ошибке сети или сервера отображается сообщение об ошибке
- Индикатор загрузки показывается во время запроса
- Ошибки логируются в консоль для отладки
- Custom error class `TranslationApiError` для типизированных ошибок

### Валидация данных

Используется **Zod** для валидации запросов и ответов:

```javascript
// Request validation
{
  text: string (min length: 1),
  source_lang: string (length: 2),
  target_lang: string (length: 2)
}

// Response validation
{
  translation: string (required),
  source_lang?: string,
  target_lang?: string
}
```

### Использование хука `useTranslation`

```javascript
import { useTranslation } from './hooks/useTranslation';

function MyComponent() {
  const { translation, isLoading, error, retry, reset } = useTranslation(
    'Hello world',
    {
      sourceLang: 'en',
      targetLang: 'ru',
      enabled: true, // Auto-translate when enabled
    }
  );

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {translation && <p>{translation}</p>}
      <button onClick={retry}>Retry</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## Возможности для расширения

- **Выбор языков** - добавить UI для выбора языков перевода
- **История переводов** - сохранение ранее переведенных слов
- **Аннотации** - работа с комментариями в PDF
- **Поиск по тексту** - использовать API поиска в PDF
- **Озвучивание** - добавить API для произношения слов

## Команды

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр prod сборки

