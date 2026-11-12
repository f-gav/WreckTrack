const CACHE_NAME='{{CACHE_NAME}}';
const APP_SHELL=[
  './',
  './index.html',
  './rooms/',
  './bestiary/',
  './library/',
  './tokenator/',
  './settings/',
  '{{APP_CSS}}',
  '{{APP_JS}}',
  './manifest.webmanifest',
  './icon16x16.png',
  './icon32x32.png',
  './icon48x48.png',
  './icon64x64.png',
  './icon180x180.png',
  './icon192x192.png',
  './icon512x512.png',
  './assets/fonts/belarus-regular.ttf',
  './assets/fonts/ebbe-regular.ttf',
  './assets/fonts/neuzeit-antiqua.ttf',
  './assets/fonts/old-town-regular.ttf',
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
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('wrecktrack-static-')||key.startsWith('wreckage-static-'))&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  // Archive is a separate child site. Never serve a stale Archive document or
  // assets from WreckTrack's service-worker cache; the browser handles it online.
  if(url.pathname.includes('/archive/')){
    if(request.mode==='navigate'){
      event.respondWith(fetch(new Request(request,{cache:'no-store'})));
    }
    return;
  }
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok)caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone()));
      return response;
    }).catch(()=>caches.match(request).then(cached=>cached||caches.match('./index.html'))));
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
