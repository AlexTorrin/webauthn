// Service Worker for offline support
const CACHE_VERSION = 'v1';
const CACHE_NAME = `webauthn-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and external requests
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    // Cache first strategy for static assets
    if (isStaticAsset(url.pathname)) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(request).then(response => {
                    // Cache successful responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Network first for HTML
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then(response => {
                    return response || createOfflinePage();
                });
            })
    );
});

function isStaticAsset(pathname) {
    const extensions = ['.js', '.css', '.json', '.svg', '.png', '.jpg', '.gif'];
    return extensions.some(ext => pathname.endsWith(ext));
}

function createOfflinePage() {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    background-color: #0a0a0a;
                    color: #00ff00;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .offline-message {
                    text-align: center;
                    padding: 40px;
                    border: 2px solid #00ff00;
                    border-radius: 4px;
                }
                h1 { font-size: 2rem; margin-bottom: 20px; }
                p { font-size: 1rem; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="offline-message">
                <h1>🔌 Offline</h1>
                <p>You are currently offline.</p>
                <p>The app is cached and ready to use!</p>
                <p>Refresh the page to continue.</p>
            </div>
        </body>
        </html>
    `;
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}
