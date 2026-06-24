const PRECACHE_NAME = 'dauoi-shell-v2'
const API_CACHE_NAME = 'dauoi-api-v1'
const API_TIMEOUT_MS = 5000
const precacheUrls = self.__WB_MANIFEST.map((entry) => (
  new URL(entry.url, self.registration.scope).href
))

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then((cache) => cache.addAll(precacheUrls))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith('dauoi-shell-') && name !== PRECACHE_NAME)
          .map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  )
})

const getApiCacheKey = (request) => {
  const userId = request.headers.get('X-Offline-User-Id')
  if (!userId) return null

  const url = new URL(request.url)
  url.searchParams.set('__offline_user', userId)
  return url.toString()
}

const fetchApiNetworkFirst = async (request) => {
  const cacheKey = getApiCacheKey(request)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(request, { signal: controller.signal })
    if (cacheKey && response.ok) {
      const cache = await caches.open(API_CACHE_NAME)
      await cache.put(cacheKey, response.clone())
    }
    return response
  } catch (error) {
    const cached = cacheKey ? await caches.match(cacheKey) : null
    if (cached) return cached
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const isApiRequest = url.origin === self.location.origin && url.pathname.startsWith('/api/')

  if (isApiRequest && !url.pathname.startsWith('/api/auth/')) {
    event.respondWith(fetchApiNetworkFirst(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => (
        caches.open(PRECACHE_NAME).then((cache) => (
          cache.match(new URL('index.html', self.registration.scope).href)
        ))
      )),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(PRECACHE_NAME)
        .then((cache) => cache.match(request.url, { ignoreSearch: true }))
        .then((cached) => cached || fetch(request)),
    )
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_API_CACHE') {
    event.waitUntil(caches.delete(API_CACHE_NAME))
  }
})
