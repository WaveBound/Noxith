'use strict';
const card=ProfileRenderer.create(document);let profile=null;
const pathMatch=location.pathname.match(/^\/u\/([a-z0-9_]{3,24})\/?$/i);
const username=pathMatch?.[1]||new URLSearchParams(location.search).get('user');
card.render({displayName:'Player',links:{}});card.loadGames();
async function refresh(){
 try{
  if(location.pathname.startsWith('/u/')&&!pathMatch){document.getElementById('profileName').textContent='Profile not found';return;}
  profile=username?await ProfileApi.get(username):await ProfileApi.state();
  if(!profile){document.getElementById('profileName').textContent='Profile not found';return;}
  card.render(profile);card.loadGames(profile);document.title=(profile.displayName||'Profile')+' · BloxMulti';
  const total=document.getElementById('totalPlaytime'),count=document.getElementById('totalGames');
  if(total)total.textContent=Math.floor((profile.totalSeconds||0)/3600)+'h '+Math.floor((profile.totalSeconds||0)/60)%60+'m';
  if(count)count.textContent=profile.gameCount||0;
 }catch{document.getElementById('profileBio').textContent=username?'Unable to load profile.':'Sign in and enable your profile in BloxMulti.';}
}
refresh();
setInterval(()=>card.tickActivity(profile?.currentActivity),1000);
setInterval(()=>{if(!document.hidden&&profile?.trackingEnabled)refresh();},60000);
document.getElementById('copyLink').addEventListener('click',async()=>{
 if(!profile?.username)return;
 const url=new URL('/u/'+encodeURIComponent(profile.username),location.origin);
 const status=document.getElementById('copyStatus');try{await navigator.clipboard.writeText(url.href);status.textContent='Link copied';}catch{status.textContent='Unable to copy link';}setTimeout(()=>status.textContent='',3000);
});
