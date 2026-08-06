

(function(){
  'use strict';
  if(window.__managementShellLockLoaded) return;
  window.__managementShellLockLoaded=true;

  function loadFinalAssets(){
    if(!document.querySelector('link[data-hc-responsive-final]')){
      const css=document.createElement('link');css.rel='stylesheet';css.href='management-responsive-final.css?v=20260727';css.dataset.hcResponsiveFinal='';document.head.appendChild(css);
    }
    if(!document.querySelector('script[data-hc-feedback]')){
      const script=document.createElement('script');script.src='management-feedback.js?v=20260727';script.dataset.hcFeedback='';document.head.appendChild(script);
    }
  }
  loadFinalAssets();

  const current=(location.pathname.split('/').pop()||'admin-dashboard.html').toLowerCase();
  const roleKey='phc-admin-shell-role';
  let lastAdmin={role:'RHU Staff',branch:'Assigned RHU'};
  let renderGuard=false;
  const staffMenu=[
    ['admin-dashboard.html','fa-house','Dashboard'],
    ['admin-appointments.html','fa-calendar-check','Appointments'],
    ['admin-queue.html','fa-list-ol','Queue Management'],
    ['admin-patients.html','fa-users','Patients'],
    ['staff-messages.html','fa-comments','Patient Inquiries','badge'],
    ['admin-announcements.html','fa-bullhorn','Announcements'],
    ['admin-heatmap.html','fa-chart-area','Disease Cases & Local Trends']
  ];
  const adminGroups=[
    ['Main',[
      ['admin-dashboard.html','fa-house','Dashboard'],
      ['admin-appointments.html','fa-calendar-check','Appointments'],
      ['admin-queue.html','fa-list-ol','Queue Management'],
      ['admin-patients.html','fa-users','Patients'],
      ['admin-messages.html','fa-comments','Patient Inquiries','badge'],
      ['admin-announcements.html','fa-bullhorn','Announcements']
    ]],
    ['Monitoring',[
      ['admin-reports.html','fa-chart-column','Reports'],
      ['admin-heatmap.html','fa-map-location-dot','Heatmap & Analytics']
    ]],
    ['System',[
      ['admin-operations.html','fa-sliders','Operations & Compliance'],
      ['admin-users.html','fa-user-shield','Users & Staff'],
      ['admin-logs.html','fa-clipboard-list','Audit Trail'],
      ['admin-archive.html','fa-box-archive','Archive'],
      ['admin-backup.html','fa-database','Backup & Restore'],
      ['admin-settings.html','fa-gear','System Settings']
    ]]
  ];

  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function isFullAdmin(admin){
    const role=String(admin?.role||'').trim().toLowerCase();
    const branch=String(admin?.branch||'').trim().toLowerCase();
    return ['system administrator','super administrator','super admin'].includes(role)||['all branches','all rhu branches','all branch','all rhu'].includes(branch);
  }
  function activeFor(href){
    const h=href.toLowerCase();
    if(current===h) return true;
    if(h==='staff-messages.html'&&['staff-messages.html','inquiries-router.html'].includes(current)) return true;
    if(h==='admin-messages.html'&&['admin-messages.html','inquiries-router.html'].includes(current)) return true;
    if(h==='admin-heatmap.html'&&['admin-heatmap.html','admin-disease-cases.html'].includes(current)) return true;
    return h==='admin-queue.html'&&current==='admin-qr-scanner.html';
  }
  function desktopLink(item){
    const active=activeFor(item[0])?' active':'';
    return `<a class="sidebar-item${active}" href="${item[0]}"><div class="s-icon"><i class="fas ${item[1]}"></i></div><span>${esc(item[2])}</span>${item[3]?'<b class="hc-menu-badge" data-inquiry-badge>0</b>':''}</a>`;
  }
  function mobileLink(item){
    const active=activeFor(item[0])?' active':'';
    return `<a class="mob-sidebar-item${active}" href="${item[0]}"><div class="mob-s-icon"><i class="fas ${item[1]}"></i></div><span>${esc(item[2])}</span>${item[3]?'<b class="hc-menu-badge" data-inquiry-badge>0</b>':''}</a>`;
  }
  function desktopMenu(full){
    const groups=full?adminGroups:[['Main',staffMenu]];
    return '<i hidden data-management-exact></i>'+groups.map(group=>`<div class="sidebar-section-label">${group[0]}</div>${group[1].map(desktopLink).join('')}`).join('')+
      '<div class="sidebar-section-label account-label">Account</div><a class="sidebar-item" href="#" data-hc-logout><div class="s-icon"><i class="fas fa-right-from-bracket"></i></div><span>Logout</span></a>';
  }
  function mobileMenu(full){
    const groups=full?adminGroups:[['Main',staffMenu]];
    return '<i hidden data-management-exact></i>'+groups.map(group=>`<div class="mob-section-label">${group[0]}</div>${group[1].map(mobileLink).join('')}`).join('')+
      '<div class="mob-section-label">Account</div><button class="mob-sidebar-item" type="button" data-hc-logout><div class="mob-s-icon"><i class="fas fa-right-from-bracket"></i></div><span>Logout</span></button>';
  }
  function normalizeTopbar(admin,full){
    const name=String(admin?.name|| (full?'Administrator':'RHU Staff')).trim();
    const branch=String(admin?.branch||'').trim();
    document.querySelectorAll('.logo-area strong').forEach(el=>el.textContent='Pulilan Health Center');
    document.querySelectorAll('.logo-area small').forEach(el=>el.textContent=full?'System Administrator Panel':'RHU Staff Panel');
    document.querySelectorAll('#adminName,.a-name').forEach(el=>el.textContent=name);
    document.querySelectorAll('#adminRole,.a-role').forEach(el=>el.textContent=full?'System Administrator':(branch?`${branch.replace(/\s*-\s*.*/, '')} Staff`:'RHU Staff'));
    document.querySelectorAll('#adminAvatar,.admin-avatar').forEach(el=>el.textContent=(name.charAt(0)||'A').toUpperCase());
    document.querySelectorAll('.btn-logout').forEach(btn=>{btn.setAttribute('type','button');btn.setAttribute('data-hc-logout','');btn.innerHTML='<i class="fas fa-right-from-bracket"></i><span>Logout</span>';});
  }
  function bindLogout(){
    document.querySelectorAll('[data-hc-logout]').forEach(el=>{
      el.onclick=function(event){event.preventDefault();event.stopPropagation();window.hcRequestLogout();};
    });
  }
  function render(admin){
    if(renderGuard)return;renderGuard=true;lastAdmin=admin||lastAdmin;
    const full=isFullAdmin(lastAdmin);
    try{sessionStorage.setItem(roleKey,full?'full':'staff');}catch(_){}
    document.body.classList.add('management-shell-locked');
    document.body.classList.toggle('rhu-staff-session',!full);
    document.body.classList.toggle('system-admin-session',full);
    document.querySelectorAll('.sidebar').forEach(el=>el.innerHTML=desktopMenu(full));
    document.querySelectorAll('.mobile-sidebar').forEach(el=>el.innerHTML=mobileMenu(full));
    normalizeTopbar(lastAdmin,full);
    bindLogout();
    renderGuard=false;
  }
  function renderCached(){
    let cached='';try{cached=sessionStorage.getItem(roleKey)||'';}catch(_){}
    const adminOnlyPages=new Set(['admin-reports.html','admin-operations.html','admin-users.html','admin-logs.html','admin-archive.html','admin-backup.html','admin-settings.html','admin-messages.html']);
    const full=cached==='full'||(!cached&&adminOnlyPages.has(current));
    render(full?{role:'System Administrator',branch:'All Branches'}:{role:'RHU Staff',branch:'Assigned RHU'});
  }
  async function verifyRole(){
    try{
      const response=await fetch('../backend/api.php?action=admin_me',{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
      const raw=await response.text();
      let result=null;try{result=JSON.parse(raw);}catch(_){return;}
      if(response.ok&&result?.ok&&result.admin) render(result.admin);
    }catch(_){}
  }

  window.toggleAdminMenu=function(){
    const menu=document.getElementById('mobileSidebar');if(!menu)return;
    const open=!menu.classList.contains('show');menu.classList.toggle('show',open);
    const icon=document.querySelector('.hamburger-btn i');if(icon){icon.classList.toggle('fa-bars',!open);icon.classList.toggle('fa-xmark',open);}
  };

  function installMenuGuard(){
    const observer=new MutationObserver(function(){
      if(renderGuard)return;
      const broken=[...document.querySelectorAll('.sidebar,.mobile-sidebar')].some(el=>!el.querySelector('[data-management-exact]'));
      if(broken)setTimeout(()=>render(lastAdmin),0);
    });
    document.querySelectorAll('.sidebar,.mobile-sidebar').forEach(el=>observer.observe(el,{childList:true}));
  }
  function start(){renderCached();installMenuGuard();verifyRole();setTimeout(verifyRole,700);setTimeout(()=>render(lastAdmin),1400);}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
