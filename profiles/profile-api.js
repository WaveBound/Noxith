(function(root){
'use strict';
const host='https://vsgyclwnbrlticquvcjs.supabase.co',key='sb_publishable_-IfvzZudr3vpqkVaaMN6uQ_ycOcDOHn';
async function request(name,body,auth=false){
 if(auth&&typeof supabaseRequest==='function')return supabaseRequest('POST','/rest/v1/rpc/'+name,body,true);
 let token=localStorage.getItem('sb_access_token')||localStorage.getItem('bm_web_token');
 if(auth){
  if(!token)throw Error('Sign in to edit your profile.');
  let expires=0;try{expires=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp*1000;}catch{}
  if(expires<Date.now()+60000){
   const originalToken=token,refresh=localStorage.getItem('sb_refresh_token')||localStorage.getItem('bm_web_refresh');
   const response=await fetch(host+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})});
   if(!response.ok)throw Error('Please sign in again.');
   const session=await response.json();
   if(originalToken!==(localStorage.getItem('sb_access_token')||localStorage.getItem('bm_web_token'))||refresh!==(localStorage.getItem('sb_refresh_token')||localStorage.getItem('bm_web_refresh')))throw Error('Account changed. Please try again.');
   token=session.access_token;localStorage.setItem('sb_access_token',token);localStorage.setItem('sb_refresh_token',session.refresh_token);
  }
 }
 const response=await fetch(host+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
 if(!response.ok){const error=await response.json().catch(()=>({}));throw Error(error.code==='23505'?'That username is already taken.':error.message||'Unable to load profile.');}
 return response.json();
}
function identity(){try{const token=localStorage.getItem('sb_access_token')||localStorage.getItem('bm_web_token');return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub||'';}catch{return '';}}
root.ProfileApi={identity,get:username=>request('bloxmulti_profile_get',{p_username:username}),state:()=>request('bloxmulti_profile_state',{},true),save:profile=>request('bloxmulti_profile_save',{p_profile:profile},true)};
})(globalThis);
