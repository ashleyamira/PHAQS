const CACHE='pulilan-patient-v20260721-deployment-final-v13';
const SHELL=['./offline.html','./dashboard.html','./appointments.html','./queue.html','./qr.html','./book.html','./family.html','./privacy.html','./messages.html','./manifest.webmanifest','./images/mhc-logo.png','./css/patient_navbar_final.css','./css/innovation-pages-consistency.css','./js/patient_nav_shell.js','./js/patient_common.js','./js/patient_privacy.js','../assets/vendor/qrcode-generator.js'];
/* password handling */
const NO_CACHE_PATTERN=/\/(login|forgot-password|register|reset-password)\.html$/;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);
  if(url.pathname.includes('/backend/')||url.searchParams.has('action'))return;
  if(NO_CACHE_PATTERN.test(url.pathname)||(request.referrer&&NO_CACHE_PATTERN.test(new URL(request.referrer).pathname))){
    event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>caches.match(request)));return;
  }
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));return response}).catch(()=>caches.match(request).then(found=>found||caches.match('./offline.html'))));return;
  }
  if(url.origin===location.origin)event.respondWith(caches.match(request).then(found=>found||fetch(request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));return response})));
});
