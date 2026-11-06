(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SocialLinks=api;})(globalThis,function(){
'use strict';
const platforms={discord:{label:'Discord',base:'https://discord.com/',hosts:['discord.com','discord.gg','discordapp.com'],pattern:/^(users\/\d{1,20}|invite\/[A-Za-z0-9_-]{2,100})$/},reddit:{label:'Reddit',base:'https://www.reddit.com/user/',hosts:['reddit.com'],pattern:/^[A-Za-z0-9_-]{1,32}$/},x:{label:'X',base:'https://x.com/',hosts:['x.com','twitter.com'],pattern:/^[A-Za-z0-9_]{1,15}$/},youtube:{label:'YouTube',base:'https://www.youtube.com/',hosts:['youtube.com'],pattern:/^(@[\p{L}\p{N}_.-]{3,30}|channel\/UC[A-Za-z0-9_-]{22})$/u},twitch:{label:'Twitch',base:'https://www.twitch.tv/',hosts:['twitch.tv'],pattern:/^[A-Za-z0-9_]{1,25}$/},roblox:{label:'Roblox',base:'https://www.roblox.com/users/',hosts:['roblox.com'],pattern:/^[1-9]\d{0,19}$/},github:{label:'GitHub',base:'https://github.com/',hosts:['github.com'],pattern:/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/}};
function parse(platform,input){
 const info=platforms[platform];if(!info||typeof input!=='string')return '';let value=input.trim();
 if(/^https?:/i.test(value)){try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||!info.hosts.some(host=>url.hostname===host||url.hostname==='www.'+host))return '';value=decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g,'');if(platform==='discord'&&url.hostname.endsWith('discord.gg'))value='invite/'+value;if(platform==='reddit')value=value.replace(/^(user|u)\//,'');if(platform==='roblox')value=value.replace(/^users\//,'').replace(/\/profile$/,'');}catch{return '';}}
 if(['x','twitch','github','reddit'].includes(platform))value=value.replace(/^@/,'');
 return info.pattern.test(value)?value:'';
}
function href(platform,value){const info=platforms[platform];return info&&typeof value==='string'&&info.pattern.test(value)?info.base+value+(platform==='roblox'?'/profile':''):'';}
return {platforms,parse,href};
});
