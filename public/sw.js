
const CACHE_NAME = 'v2'
self.addEventListener('install', e => {
  console.log("Instalando o Service Worker")

  e.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll([
      '/',
      'css/style.css',
      'js/main.js',
      'manifest.json',
      'assets/logo192.png',
      'assets/logo512.png',
      'assets/favicon.ico'
    ])))
})
function update(request) {
  return fetch(request.url)
    .then(response => {
      if (!response.ok) throw new Error("Network Error :(")

      return caches.open(CACHE_NAME)
        .then(cache => cache.put(request, response.clone()))
        .then(() => response)
    }).catch(console.error)
}
function reflesh(response) {
  return response.json()
    .then(responseJson => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage(JSON.stringify({
            type: response.url,
            data: responseJson
          }))
        });

      })
      return responseJson
    })
}

self.addEventListener('fetch', event => {
  // Cache-First Strategy
 // console.log(self)
  //console.log(event.request.url)

  if (event.request.url.includes('/api/')) {
    //aplica a estrategia de cache, update and Reflesh 
    console.log("Aplica a estrategia de cache, update and Reflesh ")
    event.respondWith(
      caches.match(event.request) // check if the request has already been cached
        .then(cached => cached || fetch(event.request)) // otherwise request network
    );
    event.waitUntil(update(event.request).then(reflesh))
  } else {
    //aplica a estrategia de cache-first 
    console.log("Aplica a estrategia de cache-first ")
    event.respondWith(
      caches.match(event.request) // check if the request has already been cached
        .then(cached => cached || fetch(event.request)) // otherwise request network
    );
  }
});
self.addEventListener('activate', e => {
  console.log("Activando o Service Worker");

  caches.keys()
    .then(keys => keys.filter(key => key !== CACHE_NAME))
    .then(keys => Promise.all(keys.map(key => {
      console.log("Deletando cache: ", key)
      return caches.delete(key)
    })))
})

function asyncAttendees() {
  return update({ url: "/api/usuarios" })
    .then(reflesh)
    .then(data => self.registration.showNotification(`${data.length} usuarios cadastrado no sistema!`))
}
self.onsync = (event) => {
  console.log("sync event", event);
  if (event.tag === "asyncAttendees")
    event.waitUntil(asyncAttendees());
}

self.addEventListener('periodicSync', (event) => {
  console.log("sync event", event);
  if (event.tag === "asyncAttendees")
    event.waitUntil(asyncAttendees());
})
