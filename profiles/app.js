'use strict';
const card=ProfileRenderer.create(document);let profile=null;
const pathMatch=location.pathname.match(/^\/u\/([a-z0-9_]{3,24})\/?$/i);
const username=pathMatch?.[1]||new URLSearchParams(location.search).get('user');
function showMessage(title,detail){document.getElementById('publicProfile').hidden=true;const message=document.getElementById('profileMessage');message.hidden=false;message.dataset.state='message';document.getElementById('profileMessageTitle').textContent=title;document.getElementById('profileMessageDetail').textContent=detail;document.getElementById('copyLink').hidden=true;card.loadGames();}
async function refresh(){
 try{
  if(location.pathname.startsWith('/u/')&&!pathMatch){showMessage('Profile not found','Check the link and try again.');return;}
  profile=username?await ProfileApi.get(username):await ProfileApi.state();
  if(!profile){showMessage('Profile not found','Check the link and try again.');return;}
  if(!profile.trackingEnabled){showMessage('Profile sharing is off','This profile is not currently being shared.');return;}
  document.getElementById('publicProfile').hidden=false;document.getElementById('profileMessage').hidden=true;document.getElementById('copyLink').hidden=false;
  card.render(profile);card.loadGames(profile);document.title=(profile.displayName||'Profile')+' · BloxMulti';
 }catch{showMessage('Unable to load profile',username?'Please try again in a moment.':'Sign in and enable your profile in BloxMulti.');}
}
refresh();
setInterval(()=>card.tickActivity(profile?.currentActivity),1000);
setInterval(()=>{if(!document.hidden&&profile?.trackingEnabled)refresh();},60000);
document.getElementById('copyLink').addEventListener('click',async()=>{
 if(!profile?.username)return;
 const url=new URL('/u/'+encodeURIComponent(profile.username),location.origin);
 const status=document.getElementById('copyStatus');try{await navigator.clipboard.writeText(url.href);status.textContent='Link copied';}catch{status.textContent='Unable to copy link';}setTimeout(()=>status.textContent='',3000);
});
const linkDialog=document.getElementById('externalLinkDialog'),linkUrlBox=document.getElementById('externalLinkUrl'),linkProceed=document.getElementById('externalLinkProceed');
function openExternalConfirm(href){
 let parsed;try{parsed=new URL(href);}catch{return false;}
 if(parsed.protocol!=='https:')return false;
 if(parsed.hostname==='noxith.com'||parsed.hostname.endsWith('.noxith.com'))return false;
 const proto=document.createElement('span');proto.className='url-muted';proto.textContent=parsed.protocol+'//';
 const host=document.createElement('strong');host.className='url-host';host.textContent=parsed.host;
 const rest=document.createElement('span');rest.className='url-muted';rest.textContent=parsed.pathname+parsed.search+parsed.hash;
 linkUrlBox.replaceChildren(proto,host,rest);
 linkProceed.href=parsed.href;
 if(typeof linkDialog.showModal==='function'){linkDialog.showModal();return true;}
 return false;
}
document.getElementById('publicProfile').addEventListener('click',e=>{
 if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const anchor=e.target.closest('a[href]');
 if(!anchor||anchor.classList.contains('credit-brand'))return;
 if(openExternalConfirm(anchor.href))e.preventDefault();
});
document.getElementById('externalLinkClose').addEventListener('click',()=>linkDialog.close());
document.getElementById('externalLinkCancel').addEventListener('click',()=>linkDialog.close());
linkProceed.addEventListener('click',()=>linkDialog.close());
let backdropDown=false;
function isOutsideDialog(e){const r=linkDialog.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;}
linkDialog.addEventListener('pointerdown',e=>{backdropDown=e.target===linkDialog&&isOutsideDialog(e);});
linkDialog.addEventListener('click',e=>{
 if(backdropDown&&e.target===linkDialog&&isOutsideDialog(e))linkDialog.close();
 backdropDown=false;
});
