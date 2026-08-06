(function(){
  'use strict';
  const current=(location.pathname.split('/').pop()||'admin-dashboard.html').toLowerCase();
  const links=[
    ['admin-dashboard.html','fa-house','Dashboard'],
    ['admin-appointments.html','fa-calendar-check','Appointments'],
    ['admin-queue.html','fa-list-ol','Queue Management'],
    ['admin-patients.html','fa-users','Patients'],
    ['staff-messages.html','fa-comments','Patient Inquiries'],
    ['admin-announcements.html','fa-bullhorn','Announcements']
  ];
  function active(h){return current===h || (h==='admin-queue.html'&&current==='admin-qr-scanner.html');}
  function apply(){
    let role=''; try{role=sessionStorage.getItem('phc-admin-shell-role')||'';}catch(e){}
    if(role==='full') return;
    document.body.classList.add('rhu-staff-session');
    document.body.classList.remove('system-admin-session');
    const html='<div class="sidebar-section-label">Main</div>'+links.map(x=>`<a class="sidebar-item${active(x[0])?' active':''}" href="${x[0]}"><div class="s-icon"><i class="fas ${x[1]}"></i></div><span>${x[2]}</span></a>`).join('')+'<div class="sidebar-section-label account-label">Account</div><a class="sidebar-item" href="#" data-hc-logout><div class="s-icon"><i class="fas fa-right-from-bracket"></i></div><span>Logout</span></a>';
    document.querySelectorAll('.sidebar').forEach(s=>s.innerHTML=html);
    document.querySelectorAll('.logo-area strong').forEach(e=>e.textContent='Pulilan Health Center');
    document.querySelectorAll('.logo-area small').forEach(e=>e.textContent='RHU Staff Panel');
    document.querySelectorAll('[data-hc-logout]').forEach(el=>el.onclick=function(ev){ev.preventDefault(); if(window.hcRequestLogout) window.hcRequestLogout();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  setTimeout(apply,100);setTimeout(apply,900);
})();
