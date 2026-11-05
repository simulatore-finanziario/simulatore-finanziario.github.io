// Service worker del Simulatore: rende l'app installabile e utilizzabile anche senza rete.
// Strategia "prima la rete": se c'è connessione si vede sempre l'ultima versione pubblicata,
// altrimenti si usa la copia salvata. Cambiare VERSIONE per svuotare la cache vecchia.
const VERSIONE = 'simulatore-v2';
const FILE_APP = ['./', 'Simulatore.html', 'manifest.webmanifest', 'icona-192.png', 'icona-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE_APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(nomi => Promise.all(nomi.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(risposta => {
                if (risposta && (risposta.ok || risposta.type === 'opaque')) {
                    const copia = risposta.clone();
                    caches.open(VERSIONE).then(c => c.put(e.request, copia));
                }
                return risposta;
            })
            .catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
});
