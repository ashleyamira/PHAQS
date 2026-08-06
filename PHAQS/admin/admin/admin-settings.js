(function(){
  const field=id=>document.getElementById(id);
  const value=id=>field(id)?.value?.trim()||'';
  let noticeTimer=null;

  function showNotice(message,error=false){
    const notice=field('settingsNotice');if(!notice)return;
    clearTimeout(noticeTimer);notice.classList.toggle('error',error);notice.innerHTML=`<i class="fa-solid ${error?'fa-circle-exclamation':'fa-circle-check'}"></i><span>${String(message||'')}</span>`;notice.hidden=false;
    noticeTimer=setTimeout(()=>{notice.hidden=true},5000);
  }

  function busy(button,state,label){
    if(!button)return;button.disabled=state;
    if(state){button.dataset.label=button.innerHTML;button.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Saving…'}else if(button.dataset.label){button.innerHTML=button.dataset.label}
  }

  async function loadSettings(){
    try{
      const response=await hcApi('admin_settings_get'),settings=response.settings||{};
      for(const id of ['facilityName','municipality','supportEmail','supportContact','inquiryNotifications','inquiryPollingSeconds'])if(settings[id]!==undefined&&field(id))field(id).value=String(settings[id]);
      if(!value('inquiryNotifications'))field('inquiryNotifications').value='Enabled';
      if(!value('inquiryPollingSeconds'))field('inquiryPollingSeconds').value='12';
    }catch(error){showNotice(error.message||'Unable to load system settings.',true)}
  }

  field('facilitySettingsForm')?.addEventListener('submit',async event=>{
    event.preventDefault();const button=field('saveFacilityBtn');busy(button,true);
    try{
      const response=await hcApi('admin_settings_save',{facilityName:value('facilityName'),municipality:value('municipality'),supportEmail:value('supportEmail'),supportContact:value('supportContact')});
      showNotice(response.message||'Health center information saved.');
    }catch(error){showNotice(error.message||'Unable to save health center information.',true)}finally{busy(button,false)}
  });

  field('notificationSettingsForm')?.addEventListener('submit',async event=>{
    event.preventDefault();const button=field('saveNotificationBtn');busy(button,true);
    try{
      const response=await hcApi('admin_settings_save',{inquiryNotifications:value('inquiryNotifications'),inquiryPollingSeconds:Number(value('inquiryPollingSeconds'))});
      showNotice(response.message||'Patient inquiry alert rules saved.');window.dispatchEvent(new CustomEvent('hc:settings-changed'));
    }catch(error){showNotice(error.message||'Unable to save patient inquiry alert rules.',true)}finally{busy(button,false)}
  });

  window.doLogout=async function(){try{sessionStorage.removeItem('phc-admin-shell-role')}catch(_){}try{await hcApi('admin_logout',{})}catch(error){}location.href='admin-login.html'};
  loadSettings();
})();
