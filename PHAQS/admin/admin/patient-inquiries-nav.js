/* cache handling */
(function(){
  if(window.__hcAdminShellLoaded||document.querySelector('script[data-hc-admin-shell-loader]'))return;
  const script=document.createElement('script');
  script.src='admin-shell.js?v=20260727-auto-confirm-v2';
  script.dataset.hcAdminShellLoader='true';
  document.head.appendChild(script);
})();
