(function(){
  'use strict';
  if (window.__phcRoleConnectionLoaded) return;
  window.__phcRoleConnectionLoaded = true;

  const adminOnly = new Set([
    'admin-reports.html','admin-operations.html','admin-users.html',
    'admin-logs.html','admin-archive.html','admin-backup.html','admin-settings.html',
    'admin-messages.html'
  ]);
  const staffAllowed = new Set([
    'admin-dashboard.html','admin-appointments.html','admin-queue.html','admin-qr-scanner.html',
    'admin-patients.html','staff-messages.html','inquiries-router.html','admin-announcements.html',
    'admin-disease-cases.html','admin-heatmap.html'
  ]);

  function fullAdmin(account){
    const role=String(account?.role||'').toLowerCase();
    const branch=String(account?.branch||'').toLowerCase();
    return role.includes('system administrator') || role.includes('super administrator') ||
      (role.includes('admin') && (branch.includes('all branch') || branch.includes('all rhu')));
  }

  async function connectRole(){
    const current=location.pathname.split('/').pop()||'admin-dashboard.html';
    if(current==='admin-login.html') return;
    try{
      const response=await fetch('../backend/api.php?action=admin_me',{credentials:'include',cache:'no-store'});
      const data=await response.json();
      if(!response.ok || !data.ok){ location.replace('admin-login.html?reason=session'); return; }
      const account=data.admin||{};
      const isAdmin=fullAdmin(account);
      window.PHC_ADMIN_SESSION=account;
      window.PHC_IS_SYSTEM_ADMIN=isAdmin;
      window.PHC_USER_BRANCH=account.branch||'';
      document.body.classList.toggle('system-admin-session',isAdmin);
      document.body.classList.toggle('rhu-staff-session',!isAdmin);

      if(!isAdmin && (adminOnly.has(current) || !staffAllowed.has(current))){
        location.replace('admin-dashboard.html?notice=restricted');
        return;
      }

      document.querySelectorAll('#adminName,.a-name').forEach(el=>el.textContent=account.name||'Administrator');
      document.querySelectorAll('#adminRole,.a-role').forEach(el=>el.textContent=isAdmin?'System Administrator':'RHU Staff');
      document.querySelectorAll('#adminAvatar,.admin-avatar').forEach(el=>el.textContent=(account.name||'A').trim().charAt(0).toUpperCase());
      document.dispatchEvent(new CustomEvent('phc:role-connected',{detail:{account,isAdmin,branch:account.branch||''}}));
    }catch(error){
      console.error('Role connection failed.',error);
      const notice=document.getElementById('noticeBox')||document.getElementById('staffNotice');
      if(notice){notice.style.display='flex';const text=notice.querySelector('[id$="Text"]')||notice;text.innerHTML='<strong>Backend connection error.</strong> Please verify Apache, MySQL, and the database configuration.';}
    }
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',connectRole):connectRole();
})();