const CACHE_NAME = 'celticgameapp-v20'; // Incrementato a v2 per forzare il refresh

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // Aggiungi qui eventuali altri file locali reali (es. './style.css', './script.js')
];

// 1. Installazione: forza il salvataggio dei file e l'attivazione immediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Salvataggio file in cache...');
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Attivazione: cancella vecchie cache rimaste bloccate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Rimoziome vecchia cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: Gestione offline robusta con fallback su index.html
self.addEventListener('fetch', (event) => {
  // Ignora chiamate a servizi esterni come Firebase se presenti
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // Se la rete fallisce ed è una navigazione di pagina, forza index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});
