# PDF Translator App

Минимальное React приложение для просмотра PDF файлов с возможностью дальнейшего расширения функционала выделения текста и отправки на бэкенд.

## Технологии

- **React 18** - UI библиотека
- **Vite** - сборщик и dev сервер
- **Tailwind CSS** - стилизация
- **react-pdf** - просмотр PDF документов
- **Zod** - валидация схем и runtime type checking

## Архитектура

Приложение работает в связке с backend-сервером:
- **Frontend** - React SPA для просмотра PDF и отображения переводов
- **Backend** - Node.js/Express сервер для перевода (Gemini API) и интеграции с Anki

Все операции перевода и добавления в Anki выполняются автоматически на backend.

## Установка

```bash
npm install
```

## Конфигурация

Создайте файл `.env` в корневой директории проекта:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3003
```

Если файл не создан, по умолчанию используется `http://localhost:3003`.

**Важно:** Убедитесь, что backend-сервер запущен! См. [backend/README.md](../backend/README.md)

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
6. **Выделите текст** в PDF - появится всплывающее окно с переводом
7. **Слова автоматически добавляются в Anki** (если Anki запущен)

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
    │   └── useTranslation.js    # Custom hook для перевода (через backend API)
    ├── api/
    │   └── translateApi.js      # API клиент для перевода (устаревший, не используется)
    └── types/
        └── translation.js       # Схемы валидации (Zod)
```

## Функционал

- ✅ Открытие PDF файлов через диалог выбора
- ✅ Навигация по страницам (Previous/Next)
- ✅ Масштабирование страниц (50% - 300%)
- ✅ Выделение текста в PDF с автоматическим появлением окна перевода
- ✅ Перевод текста через backend API (Gemini: английский → русский)
- ✅ **Автоматическое добавление переведенных слов в Anki**
- ✅ Визуальная индикация статуса добавления в Anki
- ✅ Индикация загрузки и обработка ошибок
- ✅ Адаптивный дизайн с Tailwind CSS

## Архитектура

### Слои приложения

1. **Components** (`src/components/`)
   - React компоненты UI
   - Отвечают только за отображение
   - `PdfViewer` - просмотр PDF с навигацией
   - `TranslationPopup` - всплывающее окно с переводом и статусом Anki

2. **Hooks** (`src/hooks/`)
   - Custom hooks для бизнес-логики
   - `useTranslation` - управление состоянием перевода (интеграция с backend API)

3. **API** (`src/api/`)
   - Клиенты для взаимодействия с backend
   - `translateApi` - устаревший, не используется (логика перенесена в useTranslation)

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

## Backend API Integration

Приложение использует backend REST API для перевода и добавления в Anki.

### Эндпойнт

**POST** `{VITE_API_URL}/api/processTranslation`

**Request:**
```json
{
  "text": "community"
}
```

**Response:**
```json
{
  "text": "community",
  "translation": "сообщество",
  "sourceLang": "en",
  "targetLang": "ru",
  "ankiNoteId": 1234567890,
  "ankiError": null,
  "ankiStatus": "added"
}
```

### Обработка ошибок

- При ошибке сети или сервера отображается сообщение об ошибке
- Индикатор загрузки показывается во время запроса
- Ошибки перевода блокируют процесс
- Ошибки Anki не блокируют перевод (non-blocking)
- Статус Anki отображается визуально: зеленая галочка (успех) или желтое предупреждение (ошибка)

### Использование хука `useTranslation`

```javascript
import { useTranslation } from './hooks/useTranslation';

function MyComponent() {
  const { translation, isLoading, error, ankiStatus, retry, reset } = useTranslation(
    'Hello world',
    {
      enabled: true, // Auto-translate when enabled
    }
  );

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {translation && <p>{translation}</p>}
      {ankiStatus?.success && <p>✅ Added to Anki</p>}
      {ankiStatus?.error && <p>⚠️ {ankiStatus.error}</p>}
      <button onClick={retry}>Retry</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## Интеграция с Anki

Приложение автоматически добавляет переведенные слова в Anki через backend-сервер.

### Настройка

См. [backend/README.md](../backend/README.md) для настройки backend-сервера с интеграцией Anki.

**Требования:**
1. Backend-сервер запущен
2. Anki Desktop запущен с плагином AnkiConnect
3. AnkiConnect настроен (CORS не требуется, так как запросы идут с backend)

### Как это работает

1. Пользователь выделяет текст в PDF
2. Frontend отправляет запрос на backend `/api/processTranslation`
3. Backend переводит текст через Gemini API
4. Backend автоматически добавляет карточку в Anki
5. Frontend показывает перевод и статус добавления в Anki

**Формат карточки:**
- **Front**: Оригинальное слово (English)
- **Back**: Перевод (Russian)
- **Deck**: "PDF Translator"
- **Tags**: `pdf-translator`, `auto-imported`

### Визуальная индикация

- ✅ **Зеленая галочка** - карточка успешно добавлена в Anki
- ⚠️ **Желтое предупреждение** - перевод выполнен, но Anki недоступен

## Запуск проекта

### 1. Запустите backend

```bash
cd backend
npm install
# Настройте .env файл с GEMINI_API_KEY
npm run dev
```

### 2. Запустите frontend

```bash
cd frontend_cursor
npm install
npm run dev
```

### 3. Запустите Anki (опционально)

Для автоматического добавления карточек запустите Anki Desktop с установленным плагином AnkiConnect.

## Возможности для расширения

- **Выбор языков** - добавить UI для выбора языков перевода
- **История переводов** - сохранение ранее переведенных слов в базу данных
- **Аннотации** - работа с комментариями в PDF
- **Поиск по тексту** - использовать API поиска в PDF
- **Озвучивание** - добавить API для произношения слов (Text-to-Speech)
- **Настройка Anki карточек** - UI для выбора колоды, типа карточки, тегов
- **Батч-перевод** - перевод нескольких выделенных фрагментов одновременно

## Команды

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр prod сборки

