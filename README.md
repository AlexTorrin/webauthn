# 🔐 WebAuthn Key Generator

PWA приложение для генерации и отображения криптографических ключей с использованием WebAuthn API.

**Работает offline, без фреймворков!**

## ✨ Особенности

- 🔑 **Генерация криптографических ключей** через WebAuthn API
- 📱 **Progressive Web App (PWA)** - установка как приложение
- 🔌 **Полная поддержка offline** - работает без интернета
- 🎨 **Современный UI** - тёмная тема с зелёным неоном
- 📦 **Без зависимостей** - чистый HTML/CSS/JavaScript
- 🌐 **Кроссбраузерная совместимость** - работает везде, где есть WebAuthn

## 🚀 Возможности

- Генерация публичных/приватных ключей
- Отображение открытого ключа в различных форматах:
  - COSE Key (CBOR)
  - Base64
  - JSON
- Информация об алгоритме и типе ключа
- Копирование открытого ключа в буфер обмена
- Локальное хранилище (в браузере)

## 📋 Технологии

- **WebAuthn API** - W3C стандарт для веб-аутентификации
- **COSE** - CBOR Object Signing and Encryption
- **Service Worker** - кеширование и offline поддержка
- **PWA Manifest** - установка приложения

## 🛠️ Использование

### Локальный запуск

```bash
# Простый HTTP сервер (Python 3)
python -m http.server 8000

# Или с Node.js
npx http-server
```

Откройте http://localhost:8000

### Установка как PWA

1. Откройте приложение в браузере
2. Нажмите "Установить" (появится уведомление браузера)
3. Приложение будет установлено как нативное

## 📐 API WebAuthn

```javascript
// Генерация ключей
const credential = await navigator.credentials.create({
    publicKey: {
        challenge: randomBytes,
        rp: { name: "App Name" },
        user: { id, name, displayName },
        pubKeyCredParams: [
            { alg: -7, type: "public-key" }  // ES256
        ],
        authenticatorSelection: {
            authenticatorAttachment: "platform"
        }
    }
});
```

## 📁 Структура проекта

```
webauthn/
├── index.html       # Основная страница
├── styles.css       # Стили и дизайн
├── app.js           # Логика приложения
├── sw.js            # Service Worker
├── manifest.json    # PWA конфигурация
└── README.md        # Этот файл
```

## 🔐 Безопасность

- Приватные ключи генерируются в браузере и **не покидают устройство**
- Приватные ключи хранятся в защищённом хранилище браузера
- Открытые ключи могут безопасно передаваться и делиться
- Все операции происходят локально (нет отправки на серверы)

## 🌐 Поддерживаемые браузеры

- Chrome/Chromium 65+
- Firefox 60+
- Safari 13+
- Edge 18+

## 📚 Дополнительно

### COSE Keys
COSE (CBOR Object Signing and Encryption) - это стандартный формат для представления криптографических ключей.

### WebAuthn
WebAuthn (Web Authentication API) - это открытый стандарт W3C для аутентификации в веб.

## 📝 Лицензия

MIT License

## 🔗 Ссылки

- [WebAuthn Spec](https://www.w3.org/TR/webauthn/)
- [MDN WebAuthn API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [COSE Spec](https://tools.ietf.org/html/rfc8152)
- [PWA Docs](https://web.dev/progressive-web-apps/)

---

**Создано:** AlexTorrin | **Язык:** Vanilla JavaScript | **Фреймворки:** Нет ✗
