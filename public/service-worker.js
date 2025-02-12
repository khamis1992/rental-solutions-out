
const CACHE_NAME = 'rental-solution-v1';
const DB_NAME = 'LocationDB';
const DB_VERSION = 1;
const LOCATIONS_STORE = 'locations';
const AUTH_STORE = 'auth';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// IndexedDB setup
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create locations store with index on timestamp
      if (!db.objectStoreNames.contains(LOCATIONS_STORE)) {
        const locationStore = db.createObjectStore(LOCATIONS_STORE, { keyPath: 'id', autoIncrement: true });
        locationStore.createIndex('timestamp', 'timestamp');
      }

      // Create auth store for token
      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE);
      }
    };
  });
}

// Store location data
async function storeLocation(location) {
  const db = await openDB();
  const tx = db.transaction(LOCATIONS_STORE, 'readwrite');
  const store = tx.objectStore(LOCATIONS_STORE);
  
  await store.add({
    ...location,
    timestamp: new Date().toISOString(),
    synced: false
  });
  
  // Request sync after storing
  if ('sync' in registration) {
    try {
      await registration.sync.register('sync-locations');
    } catch (err) {
      console.error('Background sync registration failed:', err);
    }
  }
}

// Get stored locations
async function getStoredLocations() {
  const db = await openDB();
  const tx = db.transaction(LOCATIONS_STORE, 'readonly');
  const store = tx.objectStore(LOCATIONS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.index('timestamp').getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Store auth token
async function storeAuthToken(token) {
  const db = await openDB();
  const tx = db.transaction(AUTH_STORE, 'readwrite');
  const store = tx.objectStore(AUTH_STORE);
  await store.put(token, 'current');
}

// Get stored auth token
async function getStoredAuthToken() {
  const db = await openDB();
  const tx = db.transaction(AUTH_STORE, 'readonly');
  const store = tx.objectStore(AUTH_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.get('current');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Remove synced location
async function removeStoredLocation(id) {
  const db = await openDB();
  const tx = db.transaction(LOCATIONS_STORE, 'readwrite');
  const store = tx.objectStore(LOCATIONS_STORE);
  await store.delete(id);
}

// Install event handler
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Background sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-locations') {
    event.waitUntil(syncLocations());
  }
});

// Location sync function
async function syncLocations() {
  try {
    const locations = await getStoredLocations();
    if (locations.length === 0) return;

    const token = await getStoredAuthToken();
    if (!token) return;

    // Process locations in batches
    for (const location of locations) {
      try {
        const response = await fetch('/functions/v1/track-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(location)
        });

        if (response.ok) {
          await removeStoredLocation(location.id);
        }
      } catch (error) {
        console.error('Error syncing location:', error);
        // Failed locations will be retried on next sync
      }
    }
  } catch (error) {
    console.error('Error in sync process:', error);
  }
}

// Periodic background sync (where supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'location-sync') {
    event.waitUntil(syncLocations());
  }
});

// Export functions for use in main thread
self.storeLocation = storeLocation;
self.storeAuthToken = storeAuthToken;
