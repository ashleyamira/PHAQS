(function(){
  window.HC_API_BASE = '../backend/api.php?action=';
  window.hcApi = async function(action, payload){
    const opt = payload === undefined ? {credentials:'include',cache:'no-store'} : {method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)};
    const res = await fetch(window.HC_API_BASE + encodeURIComponent(action), opt);
    let json; try { json = await res.json(); } catch(e){ json = {ok:false,message:'Invalid server response'}; }
    if (!res.ok || json.ok === false) throw new Error(json.message || ('HTTP '+res.status));
    return json;
  };
  window.hcFormatDate = function(iso){
    if(!iso) return '-';
    const d = new Date(String(iso)+'T00:00:00');
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});
  };
  window.hcAge = function(birthdate){
    if(!birthdate) return '-';
    const b = new Date(birthdate); if(Number.isNaN(b.getTime())) return '-';
    const t = new Date(); let age = t.getFullYear()-b.getFullYear();
    const m = t.getMonth()-b.getMonth(); if(m<0 || (m===0 && t.getDate()<b.getDate())) age--;
    return age;
  };
})();
