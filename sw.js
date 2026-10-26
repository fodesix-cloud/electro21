/*
 * Electro 21 — service worker
 * -----------------------------------------------------------------------------
 * Deux caches :
 *   - la coquille (page, styles, scripts, icônes) : le site s'ouvre sans réseau ;
 *   - les photos de produits déposées dans assets/produits : gardées sur place.
 * Le catalogue lui-même vient de js/data.js, donc il est déjà dans la coquille :
 * hors connexion, l'application mobile reste entièrement utilisable, WhatsApp
 * compris dès que le réseau revient.
 *
 * Chaque fichier est servi depuis le réseau quand il répond, et depuis la copie
 * locale sinon : une correction de js/data.js est donc visible dès la recharge,
 * et le site reste ouvert sans réseau. NUMERO_VERSION n'est à changer que si la
 * liste COQUILLE change (nouveau fichier à precacher) ou pour vider les caches.
 */
const NUMERO_VERSION = 'electro21-v3';
const CACHETTE_COQUILLE = NUMERO_VERSION + '-coquille';
const CACHETTE_PHOTOS = NUMERO_VERSION + '-photos';
const MAX_PHOTOS = 80;

const COQUILLE = [
  './index.html',
  './hors-ligne.html',
  './etiquettes.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/data.js',
  './js/visuels.js',
  './js/qr.js',
  './js/chatbot.js',
  './js/app.js',
  './assets/icones/icon-192.png',
  './assets/icones/icon-512.png',
  './assets/icones/maskable-512.png',
  './assets/icones/apple-touch-icon.png',
  './assets/icones/favicon-32.png',
  './assets/icones/favicon-16.png',
  './assets/marque/logo.png',
  './assets/marque/couverture.jpg',
  './assets/marque/vitrine.jpg',
  './assets/marque/partage-1200x630.jpg',
  './assets/produits/hp-14s-full-hd-i3-rose.jpg',
  './assets/produits/hp-14s-devant-boite.jpg',
  './assets/produits/hp-14s-couvercle.jpg',
  './assets/produits/hp-14s-filee.jpg',
  './assets/produits/samsung-galaxy-watch-ultra-47-mm.jpg',
  './assets/produits/samsung-galaxy-watch-ultra-etanche.jpg',
  './assets/produits/iphone-18.jpg',
  './assets/produits/iphone-18-duo-bientot.jpg',
  './assets/produits/samsung-galaxy-z-fold-8.jpg',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches
      .open(CACHETTE_COQUILLE)
      .then((c) => c.addAll(COQUILLE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((k) => k.indexOf(NUMERO_VERSION) !== 0).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function limitePhotos(c) {
  const cles = (await c.keys()).map((r) => r.url).filter((u) => u.indexOf('/assets/produits/') !== -1);
  if (cles.length <= MAX_PHOTOS) return;
  const aSupprimer = cles.slice(0, cles.length - MAX_PHOTOS);
  await Promise.all(aSupprimer.map((u) => c.delete(u)));
}

self.addEventListener('fetch', (ev) => {
  const requete = ev.request;
  if (requete.method !== 'GET') return;
  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return; // WhatsApp, Maps, Facebook : on ne touche pas

  // Pages : réseau d'abord, puis copie locale, puis écran hors connexion.
  // Seule la page d'accueil est gardée en copie : étiquettes.html et admin.html
  // sont des outils locaux, ils ne doivent pas remplacer le site dans la cache.
  if (requete.mode === 'navigate') {
    const estAccueil = url.pathname === '/' || url.pathname.endsWith('/index.html') || !url.pathname.split('/').pop().includes('.');
    ev.respondWith(
      fetch(requete)
        .then((r) => {
          if (estAccueil) {
            const copie = r.clone();
            caches.open(CACHETTE_COQUILLE).then((c) => c.put('./index.html', copie));
          }
          return r;
        })
        .catch(async () => (await caches.match('./index.html')) || (await caches.match('./hors-ligne.html')))
    );
    return;
  }

  // Fichiers de la coquille : réseau d'abord, copie locale en secours.
  // Un prix ou une photo corrigée dans js/data.js est donc visible dès la
  // recharge suivante ; hors connexion, c'est la dernière copie qui sert.
  const estCoquille = COQUILLE.some((f) => url.pathname.endsWith(f.replace(/^\.\//, '/')));
  if (estCoquille) {
    ev.respondWith(
      fetch(requete)
        .then((r) => {
          if (r && r.ok) {
            const copie = r.clone();
            caches.open(CACHETTE_COQUILLE).then((c) => c.put(requete, copie));
          }
          return r;
        })
        .catch(() => caches.match(requete))
    );
    return;
  }

  // Photos de produits et reste des ressources : périmé pendant la revalidation.
  if (url.pathname.indexOf('/assets/produits/') !== -1) {
    ev.respondWith(
      caches.open(CACHETTE_PHOTOS).then(async (c) => {
        const trouvee = await c.match(requete);
        if (trouvee) {
          fetch(requete)
            .then((r) => {
              if (r && r.ok) c.put(requete, r.clone());
            })
            .catch(() => {});
          return trouvee;
        }
        return fetch(requete).then((r) => {
          if (r && r.ok) {
            c.put(requete, r.clone());
            limitePhotos(c);
          }
          return r;
        });
      })
    );
  }
});
