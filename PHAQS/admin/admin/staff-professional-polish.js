
(function(){
  async function getSession(){
    try{
      const response=await fetch('../backend/api.php?action=admin_me',{credentials:'include',cache:'no-store'});
      const data=await response.json();
      return data.ok ? (data.admin||{}) : null;
    }catch(_){ return null; }
  }
  function isAdmin(a){
    const role=String(a?.role||'').toLowerCase();
    const branch=String(a?.branch||'').toLowerCase();
    return role.includes('system administrator') || (role.includes('admin') && branch.includes('all'));
  }
  function addWorkspaceBanner(a){
    const main=document.querySelector('.main-content');
    const header=main?.querySelector('.page-header');
    if(!main||!header||main.querySelector('.staff-workspace-banner'))return;
    const page=(location.pathname.split('/').pop()||'').replace('admin-','').replace('.html','');
    const titles={
      'dashboard':'RHU Daily Workspace',
      'appointments':'Appointment Desk',
      'queue':'Queue Station',
      'patients':'Patient Records',
      'staff-messages':'Patient Support Desk',
      'announcements':'RHU Bulletin',
      'heatmap':'Disease Cases & Local Trends',
      'disease-cases':'Record Disease Case'
    };
    const descriptions={
      'dashboard':'Today’s operational overview for your assigned health center.',
      'appointments':'Review schedules, arrivals, and appointment status for your RHU.',
      'queue':'Serve arrived patients and monitor today’s queue.',
      'patients':'View patient records connected to your assigned RHU.',
      'staff-messages':'Read and reply to inquiries from patients connected to your RHU.',
      'announcements':'Official notices for all branches and your assigned RHU.',
      'heatmap':'Monitor verified disease cases and barangay trends for your assigned RHU.',
      'disease-cases':'Record a verified disease case for your assigned RHU.'
    };
    const banner=document.createElement('div');
    banner.className='staff-workspace-banner';
    banner.innerHTML=`<div><h3>${titles[page]||'RHU Staff Workspace'}</h3><p>${descriptions[page]||'Assigned RHU operations and patient services.'}</p></div><div class="staff-branch-pill"><i class="fas fa-location-dot"></i><span>${String(a.branch||'Assigned RHU')}</span></div>`;
    header.insertAdjacentElement('afterend',banner);
  }
  function polishDashboard(a){
    if(!location.pathname.endsWith('admin-dashboard.html'))return;
    const badge=document.getElementById('branchBadge');
    if(badge)badge.textContent=a.branch||'Assigned RHU';
    document.querySelectorAll('.stat-sub').forEach(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      if(text.includes('across all rhu'))el.textContent=(a.branch||'Assigned RHU')+' only';
      if(text.includes('registered in pulilan'))el.textContent='Patients connected to this RHU';
    });
    const quickWrap=document.querySelector('.quick-actions');
    if(quickWrap&&!quickWrap.querySelector('[data-staff-disease-shortcut]')){
      const disease=document.createElement('a');
      disease.className='qa-card';
      disease.href='admin-heatmap.html';
      disease.setAttribute('data-staff-disease-shortcut','');
      disease.innerHTML='<div class="qa-icon"><i class="fas fa-chart-area"></i></div><span class="qa-label"><strong>Disease Trends</strong><small style="display:block;margin-top:2px;color:#7b8798;font-weight:500;font-size:10.5px">View local cases and alerts</small></span>';
      quickWrap.appendChild(disease);
      quickWrap.style.gridTemplateColumns='repeat(5,minmax(0,1fr))';
    }
    const quick=[...document.querySelectorAll('.qa-card')];
    const labels=[
      ['View Appointments','Today’s schedules'],
      ['Manage Queue','Serve arrived patients'],
      ['Patient Records','View RHU patient files'],
      ['Patient Inquiries','Reply to patient messages']
    ];
    quick.forEach((card,i)=>{
      if(i===3){
        card.href='inquiries-router.html';
        const icon=card.querySelector('i'); if(icon)icon.className='fas fa-comments';
      }
      const label=card.querySelector('.qa-label');
      if(label&&labels[i]){
        label.innerHTML=`<strong>${labels[i][0]}</strong><small style="display:block;margin-top:2px;color:#7b8798;font-weight:500;font-size:10.5px">${labels[i][1]}</small>`;
      }
    });
    const ops=[...document.querySelectorAll('.ops-section-title')];
    ops.forEach(el=>{ if((el.textContent||'').includes('Branch Queue Health')) el.innerHTML='<i class="fas fa-heart-pulse"></i> My RHU Queue Health <span class="live-dot"></span>'; });
    document.querySelectorAll('.section-head h6').forEach(h=>{
      if(h.textContent.trim()==='RHU Branch Status')h.textContent='My RHU Queue Summary';
      if(h.textContent.trim()==='Recently Registered Patients')h.textContent='Recent Patients in My RHU';
    });
    document.querySelectorAll('.analytics-card-head h3').forEach(h=>{
      if(h.textContent.includes('Appointments per RHU'))h.innerHTML='<i class="fa-solid fa-chart-column"></i> Appointments by Service';
    });
    document.querySelectorAll('.analytics-card-head p').forEach(p=>{
      if((p.textContent||'').includes('distribution by branch'))p.textContent='Current appointment activity in your assigned RHU.';
    });
  }
  function polishQueue(a){
    if(!location.pathname.endsWith('admin-queue.html'))return;
    const desc=document.getElementById('pageDesc');
    if(desc)desc.textContent='Manage today’s queue for '+(a.branch||'your assigned RHU');
    const chip=document.getElementById('staffBranchChipText');
    if(chip)chip.textContent=a.branch||'Assigned RHU';
  }

  function polishDiseaseWorkspace(a){
    const page=(location.pathname.split('/').pop()||'').toLowerCase();
    if(!['admin-heatmap.html','admin-disease-cases.html'].includes(page))return;
    if(page==='admin-heatmap.html'){
      const heading=document.querySelector('.page-header h2');
      const description=document.querySelector('.page-header p');
      if(heading)heading.innerHTML='<i class="fas fa-chart-area" style="color:#1e40af;font-size:22px;margin-right:8px"></i>Disease Cases & Local Trends';
      if(description)description.textContent='Verified disease cases, barangay trends, and early warnings for '+(a.branch||'your assigned RHU')+' only.';
      const rhuLabel=document.getElementById('rhuFilter')?.closest('label');
      if(rhuLabel){const first=rhuLabel.firstChild;if(first&&first.nodeType===3)first.nodeValue='Assigned RHU';}
      const rhuCard=document.getElementById('rhuChartCard');
      if(rhuCard)rhuCard.style.display='none';
      const ageCard=document.getElementById('ageChartCard');
      if(ageCard)ageCard.style.gridColumn='1 / -1';
      const exportButton=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').includes('Export CSV'));
      if(exportButton)exportButton.title='Exports only records from your assigned RHU';
    }
  }

  async function init(){
    const a=await getSession();
    if(!a||isAdmin(a))return;
    document.body.classList.add('rhu-staff-session');
    addWorkspaceBanner(a);
    polishDashboard(a);
    polishQueue(a);
    polishDiseaseWorkspace(a);
    const role=document.getElementById('adminRole');
    if(role)role.textContent='RHU Staff';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
