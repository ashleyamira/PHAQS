(function(){'use strict';
 const onLogin=/admin-login\.html$/i.test(location.pathname);
 document.querySelectorAll('input[type="password"]').forEach(x=>{x.autocomplete=onLogin?'new-password':'current-password';x.setAttribute('autocapitalize','none');x.setAttribute('spellcheck','false')});
 document.querySelectorAll('input[type="email"]').forEach(x=>{x.autocomplete='off';x.setAttribute('autocapitalize','none');x.setAttribute('spellcheck','false')});
 if(onLogin){window.addEventListener('pageshow',()=>document.querySelectorAll('input[type="password"]').forEach(x=>x.value=''));return}
 const LIMIT=15*60*1000,WARN=13*60*1000;let last=Date.now(),warned=false;
 function touch(){last=Date.now();warned=false;sessionStorage.setItem('hc-admin-last-activity',String(last))}
 ['click','keydown','pointerdown','touchstart'].forEach(ev=>addEventListener(ev,touch,{passive:true}));
 setInterval(async()=>{const idle=Date.now()-last;if(idle>=LIMIT){try{await fetch('../backend/api.php?action=admin_logout',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'})}catch(_){}location.replace('admin-login.html?reason=idle');return}if(idle>=WARN&&!warned){warned=true;if(window.showPlainAlert)showPlainAlert('For your protection, this admin session will expire soon because of inactivity.',{title:'Session protection'});else console.warn('Admin session will expire soon.')}try{const r=await fetch('../backend/api.php?action=admin_me',{credentials:'include',cache:'no-store'});if(r.status===401)location.replace('admin-login.html?reason=session')}catch(_){}},60000);
})();