/* DaVincit Pro — service worker (PWA) */
const CACHE='davincit-v1';
const SHELL=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  // só gerencia o app shell (mesma origem). Firebase, fontes e CDNs passam direto pela rede.
  const isShell = url.origin===location.origin && (req.mode==='navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html') || url.pathname.endsWith('manifest.webmanifest'));
  if(!isShell)return;
  e.respondWith(
    fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;})
    .catch(()=>caches.match(req).then(m=>m||caches.match('./index.html')))
  );
});