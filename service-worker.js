const CACHE_NAME = 'bengkel-promotor-v1';

// Aset-aset inti yang membentuk "App Shell"
const urlsToCache = [
  '.', // Ini merujuk ke file HTML utama Anda (misal: index.html)
  'manifest.json', // File manifest yang baru Anda buat
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js',
  // PENTING: Tambahkan file ikon Anda di sini
  'icon-192.png',
  'icon-512.png'
];

// 1. Install Service Worker dan simpan aset ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Strategi Fetch: Network First, Fallback to Cache (SUDAH DIPERBAIKI)
self.addEventListener('fetch', event => {
  
  // --- PERBAIKAN: Cek request method ---
  // Jika ini bukan request GET, jangan coba cache.
  // Langsung teruskan ke network dan jangan ganggu.
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  // --- AKHIR PERBAIKAN ---

  // Kode di bawah ini HANYA akan berjalan untuk request GET
  event.respondWith(
    fetch(event.request) // Coba ambil dari network dulu
      .then(response => {
        // Jika sukses, kloning dan simpan ke cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache); // Baris ini sekarang aman
        });
        return response;
      })
      .catch(() => {
        // Jika network gagal (offline), ambil dari cache
        return caches.match(event.request);
      })
  );
});

// 3. Activate: Membersihkan cache lama
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
