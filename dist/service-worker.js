const CACHE_NAME='wreckage-static-efa5a7b40686';
const APP_SHELL=[
  './',
  './index.html',
  './assets/app.ee4e8b9d703c.css',
  './assets/app.e54245c4ace7.js',
  './manifest.webmanifest',
  './icon16x16.png',
  './icon32x32.png',
  './icon48x48.png',
  './icon64x64.png',
  './icon180x180.png',
  './icon192x192.png',
  './icon512x512.png',
  './fonts/belarus-regular.ttf',
  './fonts/ebbe-regular.ttf',
  './fonts/neuzeit-antiqua.ttf',
  './fonts/old-town-regular.ttf',
  './token-frame-black.png',
  './token-frame-blue.png',
  './token-frame-green.png',
  './token-frame-grey.png',
  './token-frame-purple.png',
  './token-frame-red.png',
  './tokenator-mask.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('wreckage-static-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok)caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',response.clone()));
      return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>{
    const fresh=fetch(request).then(response=>{
      if(response.ok)caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone()));
      return response;
    });
    if(cached){event.waitUntil(fresh.catch(()=>{}));return cached}
    return fresh;
  }));
});
