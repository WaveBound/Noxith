(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProfileRenderer=api;})(globalThis,function(){
'use strict';
function create(root,{themeTarget,document:doc=globalThis.document,social=globalThis.SocialLinks,fetcher=globalThis.fetch}={}){
 const get=id=>root.querySelector('#'+id),emptyAvatar=get('profileAvatar').cloneNode(true),theme=themeTarget||doc.documentElement;
 function render(data){
  get('profileName').textContent=data.displayName||'Player';get('profileBio').textContent=data.bio||'';
  const total=get('totalPlaytime'),count=get('totalGames');if(total)total.textContent=Math.floor((data.totalSeconds||0)/3600)+'h '+Math.floor((data.totalSeconds||0)/60)%60+'m';if(count)count.textContent=data.gameCount||0;
  theme.style.setProperty('--background','#090909');theme.style.setProperty('--card-background','#141414');
  let avatar=emptyAvatar.cloneNode(true);
  if(typeof data.avatarUrl==='string'&&/^https:\/\//.test(data.avatarUrl)){avatar=doc.createElement('img');avatar.id='profileAvatar';avatar.className='avatar';avatar.alt='Profile picture';avatar.referrerPolicy='no-referrer';avatar.src=data.avatarUrl;avatar.onerror=()=>avatar.replaceWith(emptyAvatar.cloneNode(true));}
  get('profileAvatar').replaceWith(avatar);
  const links=get('profileLinks');links.replaceChildren();
  for(const [platform,handle] of Object.entries(data.links||{})){
   const href=social.href(platform,handle);if(!href)continue;
   const a=doc.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',social.platforms[platform].label);a.title=social.platforms[platform].label;
   const symbol=root.querySelector('#i-'+platform),svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('icon');svg.setAttribute('aria-hidden','true');
   if(symbol){svg.setAttribute('viewBox',symbol.getAttribute('viewBox'));svg.innerHTML=symbol.innerHTML;}a.append(svg);links.append(a);
  }
 }
 let imageGeneration=0;
 function loadGames(data={}){
  const generation=++imageGeneration,list=get('favoriteGames');list.replaceChildren();
  const base=globalThis.location&&(globalThis.location.hostname==='noxith.com'||globalThis.location.hostname.endsWith('.noxith.com'))?'https://noxith-game-images.wavebound.workers.dev':'';
  function metadata(game,link,name,isCurrent=false){
   fetcher(base+'/api/game/'+game.placeId).then(r=>{if(!r.ok)throw Error();return r.json();}).then(result=>{
    if(generation!==imageGeneration)return;if(result.name)name.textContent=result.name;
    if(typeof result.imageUrl==='string'&&/^https:\/\//.test(result.imageUrl)){const img=doc.createElement('img');img.alt='';img.onload=()=>{if(generation===imageGeneration)link.prepend(img);};img.src=result.imageUrl;}
   }).catch(()=>{});
  }
  for(const game of (data.games||[]).slice(0,3)){
   const a=doc.createElement('a');a.className='favorite-game';a.href='https://www.roblox.com/games/'+game.placeId;a.target='_blank';a.rel='noopener noreferrer';
   const copy=doc.createElement('span'),name=doc.createElement('strong'),time=doc.createElement('small');name.textContent='Roblox experience';time.textContent=Math.floor(game.totalSeconds/3600)+'h '+Math.floor(game.totalSeconds/60)%60+'m played';copy.append(name,time);a.append(copy);list.append(a);metadata(game,a,name);
  }
  const current=data.currentActivity,presence=get('nowPlaying');if(!presence)return;
  presence.hidden=!current;if(!current)return;
  presence.querySelector('img')?.remove();presence.href='https://www.roblox.com/games/'+current.placeId;get('playingName').textContent='Roblox experience';
  tickActivity(current);
  metadata(current,presence,get('playingName'),true);
 }
 function tickActivity(current){
  const presence=get('nowPlaying');if(!presence||!current)return;
  if(current.expiresAt&&Date.parse(current.expiresAt)<=Date.now()){presence.hidden=true;return;}
  const elapsed=presence.querySelector('.presence-copy > span'),age=current.seenAt?Math.max(0,(Date.now()-Date.parse(current.seenAt))/1000):0;
  if(elapsed)elapsed.textContent=Math.floor((current.sessionElapsedSeconds+age)/60)+'m elapsed';
 }
 return {render,loadGames,tickActivity};
}
return {create};
});
