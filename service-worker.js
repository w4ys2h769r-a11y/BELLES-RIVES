const CACHE_NAME = "belles-rives-cs-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./assets/hero.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

// Installation : on met en cache le "coquille" de l'application (HTML/CSS/JS/images)
// pour permettre l'ouverture de l'appli même sans connexion internet.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciens caches d'une version précédente de l'appli.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Stratégie "network first, fallback cache" pour rester à jour quand la connexion est là,
// tout en fonctionnant hors ligne grâce au cache installé.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
