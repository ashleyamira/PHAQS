(function(){
  const STAFF_ALLOWED = new Set([
    'admin-dashboard.html',
    'admin-appointments.html',
    'admin-queue.html',
    'admin-qr-scanner.html',
    'admin-patients.html',
    'inquiries-router.html',
    'staff-messages.html',
    'admin-announcements.html',
    'admin-heatmap.html','admin-disease-cases.html',
  ]);

  const ADMIN_ONLY = new Set([
    'admin-reports.html','admin-users.html',
    'admin-logs.html','admin-archive.html','admin-backup.html'
  ]);

  function itemLabel(anchor){
    return String(anchor?.textContent||'').replace(/\s+/g,' ').trim();
  }

  function makeDesktopItem(href,label,icon){
    const a=document.createElement('a');
    a.className='sidebar-item';
    a.href=href;
    a.innerHTML=`<div class="s-icon"><i class="${icon}"></i></div> ${label}`;
    return a;
  }

  function makeMobileItem(href,label,icon){
    const a=document.createElement('a');
    a.className='mob-sidebar-item';
    a.href=href;
    a.innerHTML=`<div class="mob-s-icon"><i class="${icon}"></i></div> ${label}`;
    return a;
  }

  function ensureMenu(container,mobile){
    if(!container)return;
    const anchors=[...container.querySelectorAll('a')];
    const labels=anchors.map(itemLabel);

    const add=(href,label,icon)=>{
      if(labels.some(x=>x.toLowerCase()===label.toLowerCase()))return;
      const logout=anchors.find(a=>itemLabel(a).toLowerCase()==='logout');
      const item=mobile?makeMobileItem(href,label,icon):makeDesktopItem(href,label,icon);
      if(logout)container.insertBefore(item,logout);
      else container.appendChild(item);
    };

    add('staff-messages.html','Patient Inquiries','fas fa-comments');
    add('admin-announcements.html','Announcements','fas fa-bullhorn');
    add('admin-heatmap.html','Disease Cases & Local Trends','fas fa-chart-area');
  }

  function applyStaffMenu(container){
    if(!container)return;
    [...container.querySelectorAll('a')].forEach(a=>{
      const label=itemLabel(a).toLowerCase();
      const allowed=[
        'dashboard','appointments','queue management','patients',
        'patient inquiries','announcements','disease cases & local trends','logout'
      ].includes(label);
      if(!allowed)a.remove();
    });
    [...container.querySelectorAll('.sidebar-section-label,.mob-section-label')].forEach(label=>{
      const next=[];
      let node=label.nextElementSibling;
      while(node && !node.classList.contains('sidebar-section-label') && !node.classList.contains('mob-section-label')){
        if(node.matches('a'))next.push(node);
        node=node.nextElementSibling;
      }
      if(next.length===0)label.remove();
    });
  }

  async function initRoleMenu(){
    try{
      const response=await fetch('../backend/api.php?action=admin_me',{credentials:'include',cache:'no-store'});
      const result=await response.json();
      if(!result.ok)return;
      const session=result.admin||{};
      const role=String(session.role||'').toLowerCase();
      const branch=String(session.branch||'').toLowerCase();
      const isAdmin=role.includes('system administrator')||
        (role.includes('admin')&&(branch.includes('all branch')||branch.includes('all rhu')));

      const desktop=document.querySelector('.sidebar');
      const mobile=document.getElementById('mobileSidebar');
      ensureMenu(desktop,false);
      ensureMenu(mobile,true);

      const current=location.pathname.split('/').pop()||'admin-dashboard.html';
      if(!isAdmin){
        applyStaffMenu(desktop);
        applyStaffMenu(mobile);
        if(ADMIN_ONLY.has(current)){
          location.replace('admin-dashboard.html');
          return;
        }
      }

      document.querySelectorAll('a.sidebar-item,a.mob-sidebar-item').forEach(a=>{
        const href=(a.getAttribute('href')||'').split('?')[0];
        if(href===current)a.classList.add('active');
      });
    }catch(error){
      console.error('Unable to initialize role menu.',error);
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initRoleMenu);
  }else{
    initRoleMenu();
  }
})();
