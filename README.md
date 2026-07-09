# WeSync

Совместный просмотр YouTube в реальном времени. Аналог Rave.

## Возможности

- Совместный просмотр YouTube видео
- Синхронизация play/pause/seek в реальном времени
- Текстовый чат
- Голосовой чат (WebRTC)
- Никакой регистрации — просто создай комнату и делись ссылкой

## Быстрый старт

### Локальная разработка

```bash
# Сервер
cd server
npm install
npm run dev

# Клиент (отдельный терминал)
cd client
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

Фронтенд: http://localhost:5173  
Бэкенд: http://localhost:3001

## HTTPS (для WebRTC)

WebRTC требует HTTPS в production. Используйте Nginx как обратный прокси:

```bash
# Скопируйте и отредактируйте конфиг
cp nginx.example.conf nginx.conf
# Отредактируйте server_name на ваш домен

# Запустите
nginx -c /path/to/nginx.conf
```

## Деплой

- **Frontend**: Cloudflare Pages (собирается из `client/`)
- **Backend**: Render (Docker или Node.js)
- Установите `VITE_SERVER_URL` на URL вашего бэкенда

## Структура

```
WeSync/
├── client/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── Dockerfile
├── server/          # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── rooms/
│   │   ├── socket/
│   │   ├── types/
│   │   └── utils/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Лицензия

MIT
