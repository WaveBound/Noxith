(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProfileRenderer=api;})(globalThis,function(){
'use strict';
function formatDuration(seconds){const minutes=Math.floor(Math.max(0,Number(seconds)||0)/60),days=Math.floor(minutes/1440),hours=Math.floor(minutes/60)%24;return (days?days+'d ':'')+(days?hours:Math.floor(minutes/60))+'h '+minutes%60+'m';}
function create(root,{themeTarget,document:doc=globalThis.document,social=globalThis.SocialLinks,fetcher=globalThis.fetch}={}){
 const get=id=>root.querySelector('#'+id),emptyAvatar=get('profileAvatar').cloneNode(true),theme=themeTarget||doc.documentElement;
 function render(data){
  get('profileName').textContent=data.displayName||'Player';get('profileBio').textContent=data.bio||'';
  const total=get('totalPlaytime'),count=get('totalGames');if(total)total.textContent=formatDuration(data.totalSeconds);if(count)count.textContent=data.gameCount||0;
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
 const metadataCache=new Map(), pendingMetadata=new Map();
 function loadGames(data={}){
  const generation=++imageGeneration,list=get('favoriteGames');list.replaceChildren();
  const base=globalThis.location&&(globalThis.location.hostname==='noxith.com'||globalThis.location.hostname.endsWith('.noxith.com'))?'https://noxith-game-images.wavebound.workers.dev':'';
  const targets=[];
  function queueMetadata(game,link,name,isCurrent=false){if(/^[1-9]\d{0,15}$/.test(String(game.universeId||''))&&Number.isSafeInteger(Number(game.universeId)))targets.push({game,link,name,isCurrent});}
  function loadMetadata(){
   const ids=[...new Set(targets.map(({game})=>String(game.universeId)))].sort();if(!ids.length)return;
   function apply(){
    if(generation!==imageGeneration)return;
    for(const {game,link,name,isCurrent} of targets){
     if(isCurrent&&game.expiresAt&&Date.parse(game.expiresAt)<=Date.now())continue;
     const info=metadataCache.get(String(game.universeId))?.info;if(!info)continue;if(info.name)name.textContent=info.name;
     if(typeof info.imageUrl==='string'&&/^https:\/\//.test(info.imageUrl)&&!link.querySelector('img')){const img=doc.createElement('img');img.alt='';img.onload=()=>{if(generation===imageGeneration&&link.isConnected&&!link.querySelector('img')&&(!isCurrent||!game.expiresAt||Date.parse(game.expiresAt)>Date.now()))link.prepend(img);};img.src=info.imageUrl;}
    }
   }
   apply();
   const stale=ids.filter(id=>(metadataCache.get(id)?.expires||0)<=Date.now()&&!pendingMetadata.has(id));
   if(stale.length){
    const task=fetcher(base+'/api/games?ids='+stale.join(',')).then(r=>{if(!r.ok)throw Error();return r.json();}).then(result=>{
     for(const id of stale){const previous=metadataCache.get(id)?.info||{},fresh=result.games?.[id]||{};const info={name:fresh.name||previous.name||'',imageUrl:fresh.imageUrl||previous.imageUrl||''};metadataCache.set(id,{info,expires:Date.now()+(fresh.name&&fresh.imageUrl?3600000:60000)});}
    }).catch(()=>{for(const id of stale){const previous=metadataCache.get(id)?.info||{};metadataCache.set(id,{info:previous,expires:Date.now()+60000});}}).finally(()=>{for(const id of stale)pendingMetadata.delete(id);});
    for(const id of stale)pendingMetadata.set(id,task);
   }
   Promise.allSettled([...new Set(ids.map(id=>pendingMetadata.get(id)).filter(Boolean))]).then(apply);
  }
  const games=(data.games||[]).slice(0,3);
  for(const game of games){
   const a=doc.createElement('a');a.className='favorite-game';a.href='https://www.roblox.com/games/'+game.placeId;a.target='_blank';a.rel='noopener noreferrer';
   const copy=doc.createElement('span'),name=doc.createElement('strong'),time=doc.createElement('small');name.textContent='Roblox experience';time.textContent=formatDuration(game.totalSeconds)+' played';copy.append(name,time);a.append(copy);list.append(a);queueMetadata(game,a,name);
  }
  for(let i=games.length;i<3;i++){
   const slot=doc.createElement('div'),icon=doc.createElement('span'),copy=doc.createElement('span'),name=doc.createElement('strong'),time=doc.createElement('small');
   slot.className='favorite-game empty-game';icon.className='game-placeholder';icon.textContent='???';name.textContent='???';time.textContent='No game yet';copy.append(name,time);slot.append(icon,copy);list.append(slot);
  }
  const current=data.currentActivity,presence=get('nowPlaying'),status=get('avatarStatus');if(status)status.hidden=!current||Boolean(current.expiresAt&&Date.parse(current.expiresAt)<=Date.now());if(!presence){loadMetadata();return;}
  if(!current||(current.expiresAt&&Date.parse(current.expiresAt)<=Date.now())){showInactive();loadMetadata();return;}
  presence.hidden=false;presence.classList.remove('is-empty');presence.querySelector('.live-dot')?.removeAttribute('hidden');presence.querySelector('.equalizer')?.removeAttribute('hidden');const label=get('playingLabel');if(label)label.textContent='Playing';
  presence.querySelector('img')?.remove();presence.href='https://www.roblox.com/games/'+current.placeId;get('playingName').textContent='Roblox experience';
  tickActivity(current);
  queueMetadata(current,presence,get('playingName'),true);loadMetadata();
 }
 function showInactive(){
  const presence=get('nowPlaying');if(!presence)return;presence.hidden=false;presence.classList.add('is-empty');presence.removeAttribute('href');presence.querySelector('img')?.remove();
  presence.querySelector('.live-dot')?.setAttribute('hidden','');presence.querySelector('.equalizer')?.setAttribute('hidden','');const status=get('avatarStatus');if(status)status.hidden=true;
  const label=get('playingLabel'),name=get('playingName'),elapsed=presence.querySelector('.presence-copy > span');if(label)label.textContent='Not playing';if(name)name.textContent='???';if(elapsed)elapsed.textContent='No active game';
 }
 function tickActivity(current){
  const presence=get('nowPlaying');if(!presence||!current)return;
  if(current.expiresAt&&Date.parse(current.expiresAt)<=Date.now()){showInactive();return;}
  const elapsed=presence.querySelector('.presence-copy > span'),age=current.seenAt?Math.max(0,(Date.now()-Date.parse(current.seenAt))/1000):0;
  if(elapsed){const seconds=(current.sessionElapsedSeconds||0)+age;elapsed.textContent=seconds>=86400?formatDuration(seconds)+' elapsed':Math.floor(seconds/60)+'m elapsed';}
 }
 return {render,loadGames,tickActivity};
}
return {create,formatDuration};
});
