
const CACHE_NAME = 'rental-solution-v1';

// Add files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Handle location updates in background
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

    // Get auth token from IndexedDB
    const token = await getStoredAuthToken();
    if (!token) return;

    // Send locations to server
    await fetch('/functions/v1/track-location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(locations[0]) // Send one location at a time
    });

    // Remove synced location
    await removeStoredLocation(locations[0].id);
  } catch (error) {
    console.error('Error syncing locations:', error);
  }
}

// IndexedDB functions for storing locations
async function getStoredLocations() {
  // Implementation would go here
  return [];
}

async function getStoredAuthToken() {
  // Implementation would go here
  return null;
}

async function removeStoredLocation(id) {
  // Implementation would go here
}
