/* ══════════════════════════════════════════════════════════════
   CV Builder Pro — Service Worker
   Stratégie :
   · App Shell (index.html, icônes, manifest) précaché à l'installation
   · Navigation : réseau d'abord (contenu frais), repli sur le cache hors ligne
   · Ressources statiques : cache d'abord + revalidation en arrière-plan
   · /api/* (IA) : jamais mis en cache
   ══════════════════════════════════════════════════════════════ */

const VERSION = 'v1';
const CACHE_NAME = `cv-builder-pro-${VERSION}`;
const OFFLINE_URL = '/index.html';
const NETWORK_TIMEOUT = 6000;

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png',
];

/* ─── Installation : précache de la coquille applicative ─── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // allSettled : une ressource manquante ne doit pas bloquer l'installation
      await Promise.allSettled(
        APP_SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' })))
      );
      await self.skipWaiting();
    })()
  );
});

/* ─── Activation : nettoyage des anciennes versions ─── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith('cv-builder-pro-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.enable(); } catch { /* ignore */ }
      }
      await self.clients.claim();
    })()
  );
});

/* ─── Mise à jour demandée depuis l'application ─── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

/* Réseau d'abord, repli sur la coquille précachée. */
async function handleNavigation(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  try {
    const preloaded = await event.preloadResponse;
    if (preloaded) return preloaded;
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT);
    if (response && response.ok) cache.put(OFFLINE_URL, response.clone());
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(OFFLINE_URL)) || (await cache.match('/'));
    if (cached) return cached;
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Hors ligne</title><body style="font-family:system-ui;padding:2rem;text-align:center">'
      + '<h1>Vous êtes hors ligne</h1><p>Reconnectez-vous puis rechargez la page pour retrouver votre CV.</p>',
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/* Cache d'abord + mise à jour silencieuse en arrière-plan. */
async function handleAsset(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === 'basic') {
        event.waitUntil(cache.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }

  const response = await network;
  if (response) return response;
  return new Response('', { status: 504, statusText: 'Hors ligne' });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch { return; }

  // Ressources externes (CDN, API tierces) : laissées au réseau
  if (url.origin !== self.location.origin) return;
  // L'IA ne doit jamais être servie depuis le cache
  if (url.pathname.startsWith('/api/')) return;
  // Requêtes de développement (HMR Vite)
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/src/') || url.pathname.startsWith('/node_modules/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  event.respondWith(handleAsset(event));
});
