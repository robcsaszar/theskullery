---
---
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

const CACHE = "pwabuilder-adv-cache";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const networkFirstPaths = [
  '/',
  '/index.html',
  '/favorites',
  {% for post in site.recipes %}{% for image in post.image %}'{{post.url}}/{{ image }}',
  {% endfor %}'{{ post.url | prepend: site.baseurl }}.html',
  {% endfor %}
];

const networkOnlyPaths = [
'/submit'
]

networkFirstPaths.forEach((path) => {
  workbox.routing.registerRoute(
    new RegExp(path),
    new workbox.strategies.NetworkFirst({
      cacheName: CACHE
    })
  );
});

networkOnlyPaths.forEach((path) => {
  workbox.routing.registerRoute(
    new RegExp(path),
    new workbox.strategies.NetworkOnly({
      cacheName: CACHE
    })
  );
});