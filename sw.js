// Service Worker for HORSES PWA
const CACHE_NAME = 'horses-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/res/styles.css',
  '/src/main.js',
  '/src/core/gameEngine.js',
  '/src/dungeon/dungeonMaster.js',
  '/src/dungeon/ChallengeManager.js',
  '/src/dungeon/challengeDefinitions.js',
  '/src/dungeon/marketGenerator.js',
  '/src/dungeon/dungeonLevel.js',
  '/src/ui/uiManager.js',
  '/src/ui/startScreen.js',
  '/src/ui/levelSelectScreen.js',
  '/src/ui/gameOverScreen.js',
  '/src/ui/rulesModal.js',
  '/src/actionCards.js',
  '/src/cards.js',
  '/src/constants.js',
  '/src/throneRoom.js',
  '/res/img/horses-logo.png',
  '/res/img/horse-head.svg',
  '/res/img/horses-logo.svg',
  '/res/img/pixel-meadow.png',
  '/res/img/play-area-bg.png',
  '/res/img/your-hand-bg.png',
  '/res/img/grass.png',
  '/res/img/hamburger.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for saving game progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-progress') {
    event.waitUntil(
      // Could implement background save functionality here
      console.log('Background sync triggered for game progress')
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New challenge available!',
    icon: '/res/img/horses-logo.png',
    badge: '/res/img/horse-head.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Play Now',
        icon: '/res/img/horses-logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/res/img/horses-logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('HORSES', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
