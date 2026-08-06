(function(){
const style=document.createElement('style');
style.textContent='.chat-unread-badge{margin-left:auto!important;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#dc2626!important;color:#fff!important;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;box-shadow:0 0 0 2px rgba(255,255,255,.25)}.chat-unread-badge[hidden]{display:none!important}';
document.head.appendChild(style);
const adminOnly=['admin-reports.html','admin-operations.html','admin-users.html','admin-logs.html','admin-archive.html','admin-backup.html'];
const staffAllowed=['admin-dashboard.html','admin-appointments.html','admin-queue.html','admin-qr-scanner.html','admin-patients.html','inquiries-router.html','staff-messages.html','admin-announcements.html','admin-heatmap.html','admin-disease-cases.html'];

function hrefOf(a){return (a.getAttribute('href')||'').split('?')[0]}
function addLink(container,mobile,href,label,icon,active,beforeHref='admin-reports.html'){
  if(!container||container.querySelector(`a[href="${href}"]`))return;
  const a=document.createElement('a');
  a.href=href;
  a.className=(mobile?'mob-sidebar-item':'sidebar-item')+(active?' active':'');
  a.innerHTML=`<div class="${mobile?'mob-s-icon':'s-icon'}"><i class="${icon}"></i></div> ${label}${href==='staff-messages.html'?'<span class="chat-unread-badge" data-chat-badge hidden>0</span>':''}`;
  const before=container.querySelector(`a[href="${beforeHref}"]`);
  const logout=[...container.querySelectorAll('a,button')].find(x=>(x.textContent||'').trim().toLowerCase()==='logout');
  if(before)container.insertBefore(a,before);else if(logout)container.insertBefore(a,logout);else container.appendChild(a);
}
function removeAdminOnly(container){
  if(!container)return;
  [...container.querySelectorAll('a')].forEach(a=>{if(adminOnly.includes(hrefOf(a)))a.remove()});
  [...container.querySelectorAll('.sidebar-section-label,.mob-section-label,.mob-divider')].forEach(el=>{
    if(['analytics','system'].includes((el.textContent||'').trim().toLowerCase()))el.remove();
  });
}
async function refreshBadge(){
  try{
    const r=await fetch('../backend/api.php?action=chat_threads',{credentials:'include',cache:'no-store'}).then(x=>x.json());
    if(!r.ok)return;
    const count=(r.threads||[]).reduce((n,t)=>n+Number(t.unread||0),0);
    document.querySelectorAll('[data-chat-badge]').forEach(b=>{b.textContent=count;b.hidden=count<1});
  }catch(_){}
}
async function init(){
  try{
    const me=await fetch('../backend/api.php?action=admin_me',{credentials:'include',cache:'no-store'}).then(x=>x.json());
    if(!me.ok)return;
    const a=me.admin||{},role=String(a.role||'').toLowerCase(),branch=String(a.branch||'').toLowerCase();
    const full=role.includes('system administrator')||(role.includes('admin')&&branch.includes('all'));
    const current=location.pathname.split('/').pop();
    const desktop=document.querySelector('.sidebar'),mobile=document.getElementById('mobileSidebar');
    [desktop,mobile].filter(Boolean).forEach(container=>{
      [...container.querySelectorAll('a')].forEach(link=>{
        const text=(link.textContent||'').replace(/\d+$/,'').replace(/\s+/g,' ').trim().toLowerCase();
        if(text==='patient inquiries') link.setAttribute('href','staff-messages.html');
      });
    });
    [
      ['staff-messages.html','Patient Inquiries','fas fa-comments'],
      ['admin-announcements.html','Announcements','fas fa-bullhorn'],
      ['admin-heatmap.html','Disease Cases & Local Trends','fas fa-chart-area']
    ].forEach(x=>{addLink(desktop,false,x[0],x[1],x[2],(current===x[0]||(x[0]==='staff-messages.html'&&['admin-messages.html','staff-messages.html'].includes(current))));addLink(mobile,true,x[0],x[1],x[2],(current===x[0]||(x[0]==='staff-messages.html'&&['admin-messages.html','staff-messages.html'].includes(current))))});
    if(!full){
      removeAdminOnly(desktop);removeAdminOnly(mobile);
      if(adminOnly.includes(current)){location.replace('admin-dashboard.html');return}
    }
    await refreshBadge();
    setInterval(refreshBadge,5000);
  }catch(e){console.error(e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
