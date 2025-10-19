# PDF Translator App

Минимальное React приложение для просмотра PDF файлов с возможностью дальнейшего расширения функционала выделения текста и отправки на бэкенд.

## Технологии

- **React 18** - UI библиотека
- **Vite** - сборщик и dev сервер
- **Tailwind CSS** - стилизация
- **react-pdf** - просмотр PDF документов

## Установка

```bash
npm install
```

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
    └── components/
        └── PdfViewer.jsx # Компонент просмотра PDF
```

## Функционал

- ✅ Открытие PDF файлов через диалог выбора
- ✅ Навигация по страницам (Previous/Next)
- ✅ Масштабирование страниц (50% - 300%)
- ✅ Текстовый слой для будущего выделения текста
- ✅ Адаптивный дизайн с Tailwind CSS

## Возможности для расширения

Библиотека `react-pdf` поддерживает:
- **Текстовый слой** (`textLayer={true}`) - уже включен
- **Выделение текста** - можно добавить обработчики `onGetTextSuccess`
- **Аннотации** - можно работать с комментариями в PDF
- **Масштабирование** - уже реализовано
- **Поиск по тексту** - использовать API поиска

### Пример добавления функционала выделения текста

```jsx
const handleTextSelection = () => {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText) {
    // Отправить на бэкенд
    console.log('Selected text:', selectedText);
  }
};

// Добавить в компонент
<Page
  pageNumber={pageNumber}
  renderTextLayer={true}
  onMouseUp={handleTextSelection}
/>
```

## Команды

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр prod сборки

