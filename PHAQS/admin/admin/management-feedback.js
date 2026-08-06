(function(){
  'use strict';
  if(window.__hcFeedbackReady)return;
  window.__hcFeedbackReady=true;

  function stack(){
    let node=document.querySelector('.hc-feedback-stack');
    if(!node){node=document.createElement('div');node.className='hc-feedback-stack';node.setAttribute('aria-live','polite');document.body.appendChild(node)}
    return node;
  }
  window.hcNotice=function(message,tone='info'){
    const text=String(message||'Action completed.');
    const inferred=tone==='info'&&/(failed|error|unable|invalid|required|cannot|could not)/i.test(text)?'danger':tone;
    const toast=document.createElement('div');toast.className=`hc-feedback-toast ${inferred}`;
    const icon=inferred==='success'?'fa-circle-check':inferred==='danger'?'fa-circle-exclamation':inferred==='warning'?'fa-triangle-exclamation':'fa-circle-info';
    toast.innerHTML=`<i class="fas ${icon}"></i><span></span><button type="button" aria-label="Dismiss">&times;</button>`;
    toast.querySelector('span').textContent=text;
    toast.querySelector('button').onclick=()=>toast.remove();
    stack().appendChild(toast);setTimeout(()=>toast.remove(),5500);return toast;
  };
  window.hcConfirm=function(message,options={}){
    return new Promise(resolve=>{
      const overlay=document.createElement('div');overlay.className='hc-confirm-overlay';
      overlay.innerHTML=`<div class="hc-confirm-card" role="dialog" aria-modal="true"><div class="hc-confirm-body"><h3></h3><p></p></div><div class="hc-confirm-actions"><button type="button" class="hc-confirm-cancel">Cancel</button><button type="button" class="hc-confirm-ok">Confirm</button></div></div>`;
      overlay.querySelector('h3').textContent=options.title||'Confirm action';
      overlay.querySelector('p').textContent=String(message||'Continue?');
      const cancel=overlay.querySelector('.hc-confirm-cancel'),ok=overlay.querySelector('.hc-confirm-ok');
      ok.textContent=options.confirmText||'Confirm';if(options.danger)ok.classList.add('danger');
      const finish=value=>{document.removeEventListener('keydown',onKey);overlay.remove();resolve(value)};
      const onKey=event=>{if(event.key==='Escape')finish(false)};
      cancel.onclick=()=>finish(false);ok.onclick=()=>finish(true);overlay.onclick=event=>{if(event.target===overlay)finish(false)};
      document.addEventListener('keydown',onKey);document.body.appendChild(overlay);cancel.focus();
    });
  };
  window.alert=function(message){window.hcNotice(message)};
})();
