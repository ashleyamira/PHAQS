(function(){
  let patientId=0,timer=null,threadNames={},threadFingerprint='',messageFingerprint='';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function threads(force=false){
    const r=await hcApi('chat_threads');
    threadNames=Object.fromEntries(r.threads.map(t=>[t.patient_id,t.patient_name]));
    const fingerprint=r.threads.map(t=>`${t.patient_id}:${t.last_at}:${t.unread}:${t.status}:${t.rhu_branch}`).join('|');
    if(!force&&fingerprint===threadFingerprint)return;
    threadFingerprint=fingerprint;
    const box=document.getElementById('adminChatThreads');
    box.innerHTML=r.threads.length?r.threads.map(t=>`<button type="button" class="admin-chat-thread ${t.patient_id===patientId?'active':''}" onclick="openAdminThread(${t.patient_id})"><strong>${esc(t.patient_name)}</strong><span>${esc(t.last_message||'No message')}</span><small style="display:block;margin-top:4px;color:#475569">${esc(t.rhu_branch||'Assigned RHU')}</small>${t.unread?`<b>${t.unread}</b>`:''}</button>`).join(''):'<div class="help-chat-empty">No patient messages routed to this RHU.</div>';
  }

  async function messages(force=false){
    if(!patientId)return;
    const r=await hcApi('chat_messages',{patient_id:patientId});
    const box=document.getElementById('adminChatMessages');
    const fingerprint=r.messages.map(m=>`${m.id}:${m.sender_type}:${m.created_at}`).join('|');
    if(!force&&fingerprint===messageFingerprint)return;
    const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<90;
    messageFingerprint=fingerprint;
    box.innerHTML=r.messages.map(m=>`<div class="help-msg ${m.sender_type==='admin'?'patient':'admin'}">${esc(m.message)}<small>${esc(m.name)} · ${esc(m.created_at)}</small></div>`).join('');
    if(force||nearBottom)box.scrollTop=box.scrollHeight;
  }

  async function pollChat(){
    clearTimeout(timer);
    const panel=document.getElementById('adminChatPanel');
    if(!document.hidden&&panel?.classList.contains('show')){await threads();await messages()}
    timer=setTimeout(pollChat,15000);
  }

  window.toggleAdminChat=async function(){
    const panel=document.getElementById('adminChatPanel');
    panel.classList.toggle('show');
    clearTimeout(timer);
    if(panel.classList.contains('show')){await threads(true);await messages(true);timer=setTimeout(pollChat,15000)}
  };
  window.openAdminThread=async function(id){patientId=id;messageFingerprint='';document.getElementById('adminChatPatient').textContent=threadNames[id]||'Patient';document.getElementById('adminChatInput').disabled=false;await threads(true);await messages(true)};
  window.sendAdminMessage=async function(e){e.preventDefault();if(!patientId)return;const input=document.getElementById('adminChatInput'),text=input.value.trim();if(!text)return;input.disabled=true;try{await hcApi('chat_send',{patient_id:patientId,message:text});input.value='';await messages(true);await threads(true)}catch(error){if(window.showPlainAlert)showPlainAlert(error.message||'Message not sent.',{title:'Patient inquiry',tone:'danger'})}finally{input.disabled=false;input.focus()}};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)pollChat().catch(()=>{})});
})();
