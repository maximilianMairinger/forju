/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const cacheName = "forjuCache"


self.addEventListener("install", function (event) {
  console.log("[SW - Forju] Installing");
});



self.addEventListener("fetch", function (e: any) {
  e.respondWith(
    (async () => {

      if (e.request.method !== "GET") return await fetch(e.request)
      

      let cache = await caches.open(cacheName)
      
      let cacheRequest = new Promise(async (res) => {
        let cached = await cache.match(e.request)

        if (cached) {
          res(cached)
        }
      })

      let networkRequest = new Promise(async (res) => {
        try {
          let response = await fetch(e.request)
          cache.put(e.request, response.clone())
          res(response)
        }
        catch(e) {

        }
      })


      return await Promise.race([cacheRequest, networkRequest])
    })()
  )
});



self.addEventListener('activate', function(e: any) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

export{};