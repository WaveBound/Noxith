'use strict';
const card=ProfileRenderer.create(document);let profile=null;
const pathMatch=location.pathname.match(/^\/u\/([a-z0-9_]{3,24})\/?$/i);
const username=pathMatch?.[1]||new URLSearchParams(location.search).get('user');
function showMessage(text){document.getElementById('publicProfile').hidden=true;const message=document.getElementById('profileMessage');message.hidden=false;message.textContent=text;document.getElementById('copyLink').hidden=true;card.loadGames();}
async function refresh(){
 try{
  if(location.pathname.startsWith('/u/')&&!pathMatch){showMessage('Profile not found.');return;}
  profile=username?await ProfileApi.get(username):await ProfileApi.state();
  if(!profile){showMessage('Profile not found.');return;}
  if(!profile.trackingEnabled){showMessage('Profile sharing is disabled.');return;}
  document.getElementById('publicProfile').hidden=false;document.getElementById('profileMessage').hidden=true;document.getElementById('copyLink').hidden=false;
  card.render(profile);card.loadGames(profile);document.title=(profile.displayName||'Profile')+' · BloxMulti';
 }catch{showMessage(username?'Unable to load profile.':'Sign in and enable your profile in BloxMulti.');}
}
refresh();
setInterval(()=>card.tickActivity(profile?.currentActivity),1000);
setInterval(()=>{if(!document.hidden&&profile?.trackingEnabled)refresh();},60000);
document.getElementById('copyLink').addEventListener('click',async()=>{
 if(!profile?.username)return;
 const url=new URL('/u/'+encodeURIComponent(profile.username),location.origin);
 const status=document.getElementById('copyStatus');try{await navigator.clipboard.writeText(url.href);status.textContent='Link copied';}catch{status.textContent='Unable to copy link';}setTimeout(()=>status.textContent='',3000);
});
