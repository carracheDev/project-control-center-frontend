const CACHE_NAME = "pcc-shell-v1";
const SHELL = ["/", "/login", "/manifest.webmanifest", "/icon-192.svg", "/icon-512.svg"];
const firebaseConfig = Object.fromEntries(new URL(self.location.href).searchParams.entries());
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js", "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
  firebase.initializeApp(firebaseConfig);
  firebase.messaging().onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Project Control Center";
    self.registration.showNotification(title, { body: payload.notification?.body || "Nouvelle notification PCC", data: payload.data });
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/offline"))));
});
