// 앱 화면과 지도 타일을 저장해 신호가 약한 산에서도 열리게 함
const APP='approach-app-v5', TILES='approach-tiles-v1', MAX_TILES=3000;
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png',
 'lib/leaflet.js','lib/leaflet.css','lib/PretendardVariable.woff2','lib/images/marker-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==APP&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const isTile=u=>/tile\.openstreetmap\.org|opentopomap\.org|arcgisonline\.com/.test(u);
async function trim(){const c=await caches.open(TILES);const ks=await c.keys();if(ks.length>MAX_TILES)for(const k of ks.slice(0,ks.length-MAX_TILES))await c.delete(k)}
self.addEventListener('fetch',e=>{const u=e.request.url;if(e.request.method!=='GET')return;
  if(isTile(u)){e.respondWith(caches.open(TILES).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;
    try{const r=await fetch(e.request);if(r.ok||r.type==='opaque'){c.put(e.request,r.clone());if(Math.random()<.05)trim()}return r}catch(err){return new Response('',{status:504})}}));return}
  // 앱 파일: 네트워크 우선, 안 되면 저장본
  e.respondWith(fetch(e.request).then(r=>{if(r.ok&&u.startsWith(self.location.origin)){const cl=r.clone();caches.open(APP).then(c=>c.put(e.request,cl))}return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
