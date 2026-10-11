// Service worker: guarda la herramienta para que funcione sin conexión.
const VERSION = 'dx-v0.2.0';
const ARCHIVOS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "casos/hidrotex.json",
  "content/areas.json",
  "content/ayudas.json",
  "content/base.json",
  "content/formulas.json",
  "content/kit/AGENTS.md",
  "content/kit/aceptacion.md",
  "content/kit/actual.md",
  "content/kit/cliente.md",
  "content/kit/commands/cerrar.md",
  "content/kit/commands/plan.md",
  "content/kit/commands/verificar.md",
  "content/kit/datos-LEEME.md",
  "content/kit/diagnostico.md",
  "content/kit/ejemplos.md",
  "content/kit/init.sh",
  "content/kit/lecciones.md",
  "content/kit/requisitos.md",
  "content/kit/tests-LEEME.md",
  "content/motivos.json",
  "content/patrones.json",
  "content/skills/asistente-documentos.md",
  "content/skills/automatizacion-proceso.md",
  "content/skills/extraccion-documentos.md",
  "content/skills/prevision-demanda.md",
  "content/skills/revision-datos.md",
  "content/skills/seguimiento-clientes.md",
  "css/app.css",
  "icons/icono-192.png",
  "icons/icono-512.png",
  "icons/icono.svg",
  "js/app.js",
  "js/formulario.js",
  "js/kit.js",
  "js/logic.js",
  "js/radar.js",
  "js/store.js",
  "js/zip.js",
  "js/xlsx.js",
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(ARCHIVOS.map((f) => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).then((resp) => {
    const copia = resp.clone();
    caches.open(VERSION).then((c) => c.put(e.request, copia)).catch(() => {});
    return resp;
  }).catch(() => caches.match('index.html'))));
});
