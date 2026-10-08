# WreckTrack

WreckTrack — статическая local-first платформа мастера с Бестиарием, Библиотекой, комнатами, боем, Журналом и Токенатором. GitHub Pages публикует собранный каталог `dist`, а авторизация и синхронизация данных работают через Supabase.

## Разработка

Исходный код приложения находится в `src`. `dist/index.html` и `dist/assets/app.*` генерируются сборкой и не являются местом для ручного редактирования.

```bash
npm ci
npm run check
```

`npm run check` запускает regression-тесты, собирает hashed CSS/JS assets и проверяет итоговый `dist`.

Подробности и порядок дальнейшего модульного разделения описаны в `ARCHITECTURE.md`.

## Публикация

Каждый push в `main` запускает workflow `Deploy GitHub Pages`. Перед публикацией workflow выполняет тесты, пересобирает `dist` и проверяет deploy output.

## Supabase

SQL-схема пользовательского архива находится в `supabase/user_archives.sql`.

После изменения домена добавьте новый адрес GitHub Pages в список разрешённых Redirect URLs проекта Supabase.
