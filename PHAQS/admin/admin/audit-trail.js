(function(){
  window.auditLog = async function(action, details, moduleName){
    try{
      await fetch('../backend/api.php?action=admin_audit_write',{
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          event_action:String(action||'Viewed Page'),
          details:String(details||''),
          module:String(moduleName||'System')
        })
      });
    }catch(_){}
  };
})();