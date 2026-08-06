
(function(){
if(window.__hcAdminShellLoaded)return;
window.__hcAdminShellLoaded=true;
const menuGroups=[
 {label:'Main',items:[
  ['admin-dashboard.html','fa-house','Dashboard'],
  ['admin-appointments.html','fa-calendar-check','Appointments'],
  ['admin-queue.html','fa-list-ol','Queue Management'],
  ['admin-patients.html','fa-users','Patients'],
  ['staff-messages.html','fa-comments','Patient Inquiries','inquiry'],
  ['admin-announcements.html','fa-bullhorn','Announcements'],
  ['admin-heatmap.html','fa-chart-area','Disease Cases & Local Trends']
 ]},
 {label:'Monitoring',adminOnly:true,items:[
  ['admin-reports.html','fa-chart-bar','Reports']
 ]},
 {label:'System',adminOnly:true,items:[
  ['admin-operations.html','fa-sliders','Operations & Compliance'],
  ['admin-users.html','fa-user-shield','Users & Staff'],
  ['admin-logs.html','fa-clipboard-list','Audit Trail'],
  ['admin-archive.html','fa-box-archive','Archive'],
  ['admin-backup.html','fa-database','Backup & Restore'],
  ['admin-settings.html','fa-gear','System Settings']
 ]}
];
const current=location.pathname.split('/').pop()||'admin-dashboard.html';
const systemAdminPages=new Set([
 'admin-reports.html','admin-operations.html','admin-users.html',
 'admin-logs.html','admin-archive.html','admin-backup.html','admin-settings.html'
]);
const shellRoleKey='phc-admin-shell-role';
function cachedRole(){try{return sessionStorage.getItem(shellRoleKey)||''}catch(_){return ''}}
function cacheRole(value){try{if(value)sessionStorage.setItem(shellRoleKey,value);else sessionStorage.removeItem(shellRoleKey)}catch(_){}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function link(x,mobile,isFull){const href=x[3]?(isFull?'admin-messages.html':'staff-messages.html'):x[0];const active=current===href||(x[3]&&['admin-messages.html','staff-messages.html','inquiries-router.html'].includes(current))||(href==='admin-queue.html'&&current==='admin-qr-scanner.html');const c=(mobile?'mob-sidebar-item':'sidebar-item')+(active?' active':'');const ic=mobile?'mob-s-icon':'s-icon';return `<a class="${c}" href="${href}"><div class="${ic}"><i class="fas ${x[1]}"></i></div><span>${x[2]}</span>${x[3]?'<b class="hc-menu-badge" data-inquiry-badge>0</b>':''}</a>`}
function installNavigationStyles(){
 const styles=[['admin-shell.css?v=20260727-system-activity-v1','hcAdminShellStyles'],['admin-nav-consistency.css?v=20260722-unified-staff','hcAdminNavigation'],['staff-unified-shell.css?v=20260722-unified-staff','hcStaffUnifiedShell']];
 for(const [href,dataKey] of styles){
  const file=href.split('?')[0];if(document.querySelector(`link[href*="${file}"]`))continue;
  const css=document.createElement('link');css.rel='stylesheet';css.href=href;css.dataset[dataKey]='';document.head.appendChild(css);
 }
}
function visibleGroups(isFull){return menuGroups.filter(group=>isFull||!group.adminOnly)}
function renderMenu(isFull){
 const groups=visibleGroups(isFull);
 document.querySelectorAll('.sidebar').forEach(sidebar=>{sidebar.innerHTML=groups.map(group=>`<div class="sidebar-section-label">${group.label}</div>${group.items.map(item=>link(item,false,isFull)).join('')}`).join('')+'<div class="sidebar-section-label">Account</div><a class="sidebar-item" href="#" data-hc-logout><div class="s-icon"><i class="fas fa-right-from-bracket"></i></div><span>Logout</span></a>'});
 document.querySelectorAll('.mobile-sidebar').forEach(sidebar=>{sidebar.innerHTML=groups.map(group=>`<div class="mob-section-label">${group.label}</div>${group.items.map(item=>link(item,true,isFull)).join('')}`).join('')+'<div class="mob-divider"></div><button class="mob-sidebar-item" data-hc-logout><div class="mob-s-icon"><i class="fas fa-right-from-bracket"></i></div><span>Logout</span></button>'});
 document.querySelectorAll('[data-hc-logout]').forEach(button=>button.onclick=event=>{event.preventDefault();cacheRole('');if(typeof window.doLogout==='function')window.doLogout();else location.href='admin-login.html'});
 document.querySelectorAll('.mobile-sidebar a').forEach(link=>link.addEventListener('click',closeAdminMenu));
}
function closeAdminMenu(){const menu=document.getElementById('mobileSidebar');menu?.classList.remove('show');document.body.classList.remove('admin-menu-open');const icon=document.querySelector('.hamburger-btn i');icon?.classList.add('fa-bars');icon?.classList.remove('fa-xmark')}
window.toggleAdminMenu=function(){const menu=document.getElementById('mobileSidebar');if(!menu)return;const open=!menu.classList.contains('show');menu.classList.toggle('show',open);document.body.classList.toggle('admin-menu-open',open);const icon=document.querySelector('.hamburger-btn i');icon?.classList.toggle('fa-bars',!open);icon?.classList.toggle('fa-xmark',open)};
installNavigationStyles();
// role check

const initialRole=cachedRole();
if(initialRole==='staff'){document.body.classList.add('rhu-staff-session');document.body.classList.remove('system-admin-session')}
else if(initialRole==='full'){document.body.classList.add('system-admin-session');document.body.classList.remove('rhu-staff-session')}
renderMenu(initialRole==='full'||(!initialRole&&systemAdminPages.has(current)));
let inboxPage='inquiries-router.html';
let notificationScope='Your RHU branch';
async function shellApi(action,payload){
 if(typeof window.hcApi==='function')return window.hcApi(action,payload);
 const request={credentials:'include',cache:'no-store',headers:{Accept:'application/json'}};
 let url='../backend/api.php?action='+encodeURIComponent(action);
 if(payload!==undefined){
  request.method='POST';
  request.headers['Content-Type']='application/json';
  request.body=JSON.stringify(payload??{});
 }
 const response=await fetch(url,request);
 const raw=await response.text();
 let result;
 try{result=raw?JSON.parse(raw):{ok:false,message:'The session service returned an empty response.'}}catch(error){throw Object.assign(new Error('The session service returned invalid data: '+String(raw||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,240)),{status:response.status});}
 if(!response.ok||result?.ok===false)throw Object.assign(new Error(result?.message||'Unable to load the admin session.'),{status:response.status});
 return result;
}
function installBell(){
 const right=document.querySelector('.nav-right');if(!right||document.getElementById('hcAdminBell'))return;
 right.insertAdjacentHTML('afterbegin','<button id="hcAdminBell" class="hc-admin-bell" type="button" aria-label="Notifications" aria-expanded="false"><i class="fa-regular fa-bell"></i><b class="hc-admin-badge" id="hcAdminBellBadge">0</b></button>');
 document.body.insertAdjacentHTML('beforeend',`<aside class="hc-notification-panel" id="hcNotificationPanel" aria-label="System activity notifications"><header class="hc-notification-head"><div class="hc-notification-head-copy"><strong>Notifications</strong><span id="hcAdminUnreadText">Checking recent updates...</span><small id="hcNotificationScope">${esc(notificationScope)}</small></div><a class="hc-notification-head-action" href="${inboxPage}">Open inbox</a></header><div class="hc-notification-body" id="hcNotificationBody"><div class="hc-notification-empty">Loading notifications...</div></div><a class="hc-notification-footer" href="${inboxPage}"><i class="fa-regular fa-comments"></i> View patient inquiries</a></aside>`);
 const bell=document.getElementById('hcAdminBell'),panel=document.getElementById('hcNotificationPanel');
 const setOpen=open=>{
  panel.classList.toggle('show',open);bell.setAttribute('aria-expanded',open?'true':'false');
  if(open&&unreadActivityCount>0){
   unreadActivityCount=0;
   shellApi('admin_notifications_read',{}).then(summary).catch(error=>console.warn('Unable to mark activity notifications read',error));
  }
 };
 bell.onclick=event=>{event.stopPropagation();setOpen(!panel.classList.contains('show'))};
 document.addEventListener('click',event=>{if(!panel.contains(event.target)&&!bell.contains(event.target))setOpen(false)});
}
function adminNotificationTime(value){const date=new Date(String(value||'').replace(' ','T'));return Number.isNaN(date.getTime())?String(value||''):date.toLocaleString('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function adminNotificationIcon(value){const allowed=new Set(['fa-calendar-check','fa-list-ol','fa-comment-medical','fa-user','fa-bullhorn','fa-map-location-dot','fa-bell']);return allowed.has(value)?value:'fa-bell'}
function adminNotificationMessage(value){return String(value||'A system record was updated.').replace(/;\s*awaiting RHU approval\.?/gi,'; automatically confirmed and added to the RHU schedule.')}
let summaryPollingSeconds=12;
let summaryTimer=null;
let unreadActivityCount=0;
async function summary(){
 try{
  const r=await shellApi('admin_notification_summary');
  summaryPollingSeconds=[5,10,12,30,60].includes(Number(r.polling_seconds))?Number(r.polling_seconds):12;
  const enabled=r.alerts_enabled!==false,n=enabled?Number(r.unread_inquiries||0):0,total=Number(r.unread_total??n);
  unreadActivityCount=Number(r.unread_activity||0);
  document.querySelectorAll('[data-inquiry-badge]').forEach(b=>{b.textContent=n>99?'99+':String(n);b.classList.toggle('show',n>0);const link=b.closest('a');if(link)link.setAttribute('aria-label',n>0?`Patient Inquiries, ${n} unread`:'Patient Inquiries')});
  const bell=document.getElementById('hcAdminBell'),badge=document.getElementById('hcAdminBellBadge');
  if(bell&&badge){badge.textContent=total>99?'99+':String(total);badge.classList.toggle('show',total>0);bell.classList.toggle('has-unread',total>0);bell.setAttribute('aria-label',total>0?`${total} unread system updates`:'Notifications')}
  const unreadText=document.getElementById('hcAdminUnreadText');if(unreadText)unreadText.textContent=total>0?`${total} unread ${total===1?'update':'updates'}`:'No unread updates';
  const body=document.getElementById('hcNotificationBody');
  const items=r.recent_notifications||[];
  if(body)body.innerHTML=items.length?items.map(item=>`<a class="hc-notification-item${item.unread?' unread':''}" href="${esc(item.link||'admin-dashboard.html')}"><div class="hc-notification-icon"><i class="fa-solid ${adminNotificationIcon(item.icon)}"></i></div><div class="hc-notification-content"><h4>${esc(item.title||'System Update')}</h4><p>${esc(adminNotificationMessage(item.message))}</p><div class="hc-notification-meta"><span>${esc([item.actor,item.branch].filter(Boolean).join(' • '))}</span><time>${esc(adminNotificationTime(item.created_at))}</time></div></div></a>`).join(''):'<div class="hc-notification-empty"><i class="fa-regular fa-circle-check"></i><strong>You are all caught up</strong><span>New bookings and queue activity will appear here.</span></div>';
  const stat=document.getElementById('statInquiries');if(stat)stat.textContent=n;
 }catch(error){console.warn('Admin notification summary unavailable',error)}
}
async function pollSummary(){await summary();clearTimeout(summaryTimer);summaryTimer=setTimeout(pollSummary,summaryPollingSeconds*1000)}
window.addEventListener('hc:settings-changed',()=>{clearTimeout(summaryTimer);pollSummary()});
function dashboardInquiry(){if(current!=='admin-dashboard.html')return;const grid=document.querySelector('.stats-grid');if(!grid||document.getElementById('statInquiries'))return;grid.insertAdjacentHTML('beforeend',`<div class="stat-card hc-inquiry-dashboard-card" onclick="location.href='${inboxPage}'"><div class="stat-icon"><i class="fas fa-comments"></i></div><div><p class="stat-label">Unread Patient Inquiries</p><p class="stat-value" id="statInquiries">0</p><p class="stat-sub">Click to read and reply</p></div></div>`);grid.classList.add('hc-dashboard-stats-five')}
async function init(){let me=null;try{me=await shellApi('admin_me')}catch(e){console.warn('Admin shell session unavailable',e)}const a=me&&me.admin?me.admin:me;const role=String(a?.role||'').toLowerCase(),branch=String(a?.branch||'').toLowerCase();const full=!!(a&&(a.is_system_admin||role.includes('system administrator')||(role.includes('admin')&&(branch.includes('all')||branch===''))));if(a){cacheRole(full?'full':'staff');document.body.classList.toggle('rhu-staff-session',!full);document.body.classList.toggle('system-admin-session',full);if(!full&&systemAdminPages.has(current)){location.replace('admin-dashboard.html?notice=restricted');return}renderMenu(full);const name=a.name||'Administrator';inboxPage=full?'admin-messages.html':'staff-messages.html';notificationScope=full?'All RHU branches':(a.branch||'Assigned RHU branch');document.querySelectorAll('#adminName,.a-name').forEach(el=>el.textContent=name);document.querySelectorAll('#adminRole,.a-role').forEach(el=>el.textContent=a.role||'Administrator');document.querySelectorAll('#adminAvatar,.admin-avatar').forEach(el=>el.textContent=name.trim().charAt(0).toUpperCase()||'A')}else{cacheRole('');renderMenu(systemAdminPages.has(current))}installBell();dashboardInquiry();await pollSummary()}
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeAdminMenu()});
window.addEventListener('resize',()=>{if(innerWidth>900)closeAdminMenu()});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
