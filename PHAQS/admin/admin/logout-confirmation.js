(function(){
  'use strict';
  if(window.__hcLogoutConfirmationLoaded)return;
  window.__hcLogoutConfirmationLoaded=true;
  let busy=false;

  function ensureModal(){
    let modal=document.getElementById('hcLogoutBackdrop');
    if(modal)return modal;
    document.body.insertAdjacentHTML('beforeend',`<div class="hc-logout-backdrop" id="hcLogoutBackdrop" role="dialog" aria-modal="true" aria-labelledby="hcLogoutTitle"><div class="hc-logout-dialog"><div class="hc-logout-dialog-head"><div class="hc-logout-dialog-icon"><i class="fas fa-right-from-bracket"></i></div><h3 id="hcLogoutTitle">Confirm Logout</h3></div><div class="hc-logout-dialog-body">Are you sure you want to log out of the Pulilan Health Center management system?</div><div class="hc-logout-dialog-actions"><button type="button" class="hc-logout-cancel" id="hcLogoutCancel">Cancel</button><button type="button" class="hc-logout-confirm" id="hcLogoutConfirm">Logout</button></div></div></div>`);
    modal=document.getElementById('hcLogoutBackdrop');
    document.getElementById('hcLogoutCancel').onclick=close;
    document.getElementById('hcLogoutConfirm').onclick=perform;
    modal.addEventListener('click',event=>{if(event.target===modal)close();});
    return modal;
  }
  function close(){if(busy)return;ensureModal().classList.remove('show');}
  async function perform(){
    if(busy)return;busy=true;
    const btn=document.getElementById('hcLogoutConfirm');if(btn){btn.disabled=true;btn.textContent='Logging out...';}
    try{
      if(typeof window.hcApi==='function') await window.hcApi('admin_logout',{});
      else await fetch('../backend/api.php?action=admin_logout',{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:'{}'});
    }catch(_){}
    try{sessionStorage.removeItem('phc-admin-shell-role');}catch(_){}
    location.href='admin-login.html';
  }
  window.hcRequestLogout=function(){if(busy)return;ensureModal().classList.add('show');setTimeout(()=>document.getElementById('hcLogoutCancel')?.focus(),0);};
  window.confirmAdminLogout=window.hcRequestLogout;
  window.doLogout=window.hcRequestLogout;
  document.addEventListener('click',function(event){
    const target=event.target.closest('[data-hc-logout],.btn-logout,[onclick*="doLogout"],[onclick*="confirmAdminLogout"]');
    if(!target)return;
    const text=(target.textContent||'').trim().toLowerCase();
    if(!target.hasAttribute('data-hc-logout')&&!target.classList.contains('btn-logout')&&!text.includes('logout'))return;
    event.preventDefault();event.stopImmediatePropagation();window.hcRequestLogout();
  },true);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
})();
