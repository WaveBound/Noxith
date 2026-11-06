(()=>{
'use strict';
let profile={username:'',displayName:'Player',bio:'',links:{}},links={},selectedService='discord',editingService='',loadGeneration=0,loadedIdentity='',pendingIdentity=null,dirty=false;
const get=id=>document.getElementById(id),form=get('profileForm'),fields=get('linkFields'),message=get('message'),previewHost=get('profilePreview');
const previewRoot=previewHost.attachShadow({mode:'open'});previewRoot.append(get('profilePreviewTemplate').content.cloneNode(true));
const previewCard=ProfileRenderer.create(previewRoot,{themeTarget:previewHost});
function currentProfile(){return {username:form.elements.username.value.trim().toLowerCase(),displayName:form.elements.displayName.value.trim(),bio:form.elements.bio.value.trim(),links:{...links},avatarUrl:profile.avatarUrl||''};}
function updatePreview(){const data=currentProfile();previewCard.render(data);previewCard.loadGames(profile);}
function edited(){dirty=true;message.textContent='';previewCard.render(currentProfile());}
function notice(state,title,detail){const box=get('profileDisabled');box.hidden=false;box.dataset.state=state;get('profileDisabledTitle').textContent=title;get('profileDisabledDetail').textContent=detail;}
function load(data){profile=data||profile;dirty=false;links={...profile.links};for(const key of ['username','displayName','bio'])form.elements[key].value=profile[key]||'';const enabled=profile.trackingEnabled===true;document.querySelector('.profile-toolbar').hidden=!enabled;document.querySelector('.profile-workspace').hidden=!enabled;get('profileDisabled').hidden=enabled;if(!enabled)notice('message',ProfileApi.identity()?'Profile sharing is off':'Sign in to your account',ProfileApi.identity()?'Enable “Share game activity on my profile” in BloxMulti to create and edit your profile.':'Sign in to manage your profile.');const view=document.querySelector('.profile-view');if(view)view.href=profile.username?'/u/'+encodeURIComponent(profile.username):'/profiles/';drawLinks();if(enabled)updatePreview();}
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),source=document.getElementById('i-'+name);svg.setAttribute('aria-hidden','true');svg.setAttribute('viewBox',source?.getAttribute('viewBox')||'0 0 24 24');if(source)svg.innerHTML=source.innerHTML;return svg;}
form.addEventListener('input',edited);
const dialog=get('linkDialog'),linkForm=get('linkForm'),urlInput=get('linkUrl'),services=get('linkServices'),linkError=get('linkError'),removeLink=get('removeLink');
function drawServices(){services.replaceChildren();for(const [key,info] of Object.entries(SocialLinks.platforms)){const button=document.createElement('button');button.type='button';button.className='service-choice';button.dataset.key=key;button.setAttribute('aria-pressed',String(selectedService===key));button.setAttribute('aria-label',info.label);button.title=info.label;button.append(icon(key));button.addEventListener('click',()=>{selectedService=key;linkError.textContent='';for(const choice of services.children)choice.setAttribute('aria-pressed',String(choice.dataset.key===key));});services.append(button);}}
function openLink(platform=''){editingService=platform;selectedService=platform||'discord';urlInput.value=links[platform]||'';linkError.textContent='';get('linkEntryTitle').textContent=platform?'Edit link':'Add a link';get('confirmLink').textContent=platform?'Save link':'+ Add link';removeLink.hidden=!platform;get('cancelLink').hidden=!platform;drawServices();if(!dialog.open)dialog.showModal();}
function drawLinks(){fields.replaceChildren();get('linkEmpty').hidden=Object.keys(links).length>0;for(const platform of Object.keys(links)){const info=SocialLinks.platforms[platform],button=document.createElement('button');button.type='button';button.className='profile-link-chip';button.setAttribute('aria-label','Edit '+info.label+' link');button.title='Edit '+info.label;button.append(icon(platform));const label=document.createElement('span');label.textContent=info.label;button.append(label);button.addEventListener('click',()=>openLink(platform));fields.append(button);}}
get('addLink').addEventListener('click',()=>openLink());
for(const id of ['closeLinkDialog','doneLinkDialog'])get(id).addEventListener('click',()=>dialog.close());get('cancelLink').addEventListener('click',()=>openLink());
linkForm.addEventListener('submit',e=>{e.preventDefault();const handle=SocialLinks.parse(selectedService,urlInput.value);if(!handle){linkError.textContent='Enter a valid '+SocialLinks.platforms[selectedService].label+' handle, ID, or profile link.';return;}if(editingService&&editingService!==selectedService)delete links[editingService];links[selectedService]=handle;drawLinks();edited();openLink();});
removeLink.addEventListener('click',()=>{delete links[editingService];drawLinks();edited();openLink();});
form.addEventListener('submit',async e=>{e.preventDefault();if(loadedIdentity!==ProfileApi.identity()){reload();return;}const generation=++loadGeneration,data=currentProfile();pendingIdentity=null;delete data.avatarUrl;message.textContent='Saving…';dialog.close();form.inert=true;document.querySelector('[form=profileForm]').disabled=true;try{const saved=await ProfileApi.save(data);if(generation!==loadGeneration)return;load(saved);message.textContent='Profile saved.';}catch(error){if(generation===loadGeneration)message.textContent=error.message||'Unable to save profile.';}finally{form.inert=false;document.querySelector('[form=profileForm]').disabled=false;}});
async function reload(){
 const identity=ProfileApi.identity();if(identity&&pendingIdentity===identity)return;
 const generation=++loadGeneration,same=Boolean(identity&&loadedIdentity===identity);pendingIdentity=null;
 if(!same){loadedIdentity='';load({username:'',displayName:'Player',bio:'',links:{}});dialog.close();}
 if(!identity)return;
 if(!same)notice('loading','Loading profile','Just a moment while we get things ready.');
 pendingIdentity=identity;
 try{const data=await ProfileApi.state();if(generation!==loadGeneration||identity!==ProfileApi.identity())return;loadedIdentity=identity;if(!same||!dirty||data.trackingEnabled!==profile.trackingEnabled)load(data);message.textContent='';}
 catch{if(generation===loadGeneration){if(same)message.textContent='Unable to refresh your profile.';else notice('message','Unable to load profile','Please try again in a moment.');}}
 finally{if(generation===loadGeneration)pendingIdentity=null;}
}
window.addEventListener('bloxmulti-profile-auth',reload);
window.addEventListener('storage',event=>{if(['sb_access_token','bm_web_token','sb_refresh_token','bm_web_refresh'].includes(event.key))reload();});
reload();
})();
