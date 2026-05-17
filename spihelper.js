// {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=refs/heads/build/stable|path=spihelper.js}}
// v3.2.3
// <nowiki>
'use strict';
(()=>{var w=/{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i,c1=/^closed?$/i,q0=/{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu-?)?endorse|inprogress|(?:cu\s?)?decline(?:-ip)?|(?:cu)?moreinfo|relisted|onhold)}}/i,l2=/====\s*Suspected sockpuppets\s*====\n*/i,Y1=/\n*\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i,P1=/{{(checkuserblock(-account|-wide)?|checkuser block)}}/i,V1=/{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i,T1=/{{spipriorcases}}/i,t=/^(?:===[^=]*===|=====[^=]*=====)\s*$/m,H2=/\u200E/g,b0=/(?<!~)~~~~(?!~)/;class y{type;content;isHtml;_index;constructor(h){this.type=h.type,this.content=h.content,this.isHtml=h.isHtml}show(){let h=N.length;return N.push(this),this._index=h,this}update(h){if(Object.assign(this,h),this._index===void 0)this.show();else N[this._index]=this;return this}}var N=[];mw.loader.using(["vue"],(h)=>{N=h("vue").reactive(N)});class R{username;crosswiki;deny;notalk;moot;constructor(h){this.username=h?.username??f.caseName,this.crosswiki=h?.crosswiki??!1,this.deny=h?.deny??!1,this.notalk=h?.notalk??!1,this.moot=h?.moot??!1}generateWikitext(){let h="{{SPI archive notice|1="+this.username;if(this.crosswiki)h+="|crosswiki=yes";if(this.deny)h+="|deny=yes";if(this.notalk)h+="|notalk=yes";if(this.moot)h+="|moot=yes";return h+="}}",h}}class u{master;status;locked;evidence;altmaster;altmasterStatus;constructor(h){this.master=h.master,this.status=h.status,this.locked=h.locked??!1,this.evidence=h.evidence??"",this.altmaster=h.altmaster??"",this.altmasterStatus=h.altmasterStatus}generateWikitext(h){let v="{{sockpuppet";if(v+=`
| 1 = ${this.master}`,v+=`
| 2 = ${this.status}`,this.locked)v+=`
| locked = yes`;if(h===!1)v+=`
| notblocked = yes`;if(this.evidence)v+=`
| evidence = ${this.evidence}`;if(this.altmaster)v+=`
| altmaster = ${this.altmaster}`,v+=`
| altmaster-status = ${this.altmasterStatus??"suspected"}`;return v+=`
}}`,v}clone(){return new u({master:this.master,status:this.status,evidence:this.evidence,altmaster:this.altmaster,altmasterStatus:this.altmasterStatus})}equals(h){if(!(h instanceof u))return!1;return this.master===h.master&&this.status===h.status&&this.locked===h.locked&&this.evidence===h.evidence&&this.altmaster===h.altmaster&&this.altmasterStatus===h.altmasterStatus}}class g{status;checked;locked;ltapage;spipage;evidence;constructor(h){this.status=h.status,this.checked=h.checked??!1,this.locked=h.locked??!1,this.ltapage=h.ltapage??"",this.spipage=h.spipage??"",this.evidence=h.evidence??""}generateWikitext(){let h="{{sockpuppeteer",v=this.status==="banned"?"banned":"blocked",d=this.checked||this.status!=="blocked";if(h+=`
| 1 = ${v}`,d)h+=`
| checked = yes`;if(this.locked)h+=`
| locked = yes`;if(this.ltapage)h+=`
| ltapage = ${this.ltapage}`;if(this.spipage)h+=`
| spipage = ${this.spipage}`;if(this.evidence)h+=`
| evidence = ${this.evidence}`;return h+=`
}}`,h}clone(){return new g({status:this.status,checked:this.checked,ltapage:this.ltapage,spipage:this.spipage,evidence:this.evidence})}equals(h){if(!(h instanceof g))return!1;return this.status===h.status&&this.checked===h.checked&&this.locked===h.locked&&this.ltapage===h.ltapage&&this.spipage===h.spipage&&this.evidence===h.evidence}}var a2=["sections","management","block","status","link","comment","move","archive"];function l1(h){let v=[],d=h.trim().matchAll(/\{\{([\s\S]+?)}}/g);for(let z of d){if(!z[1])continue;v.push(Z5(z[1]))}return v}function Z5(h){let v=h.split("|").map((c)=>c.trim()),d=v.shift()?.toLowerCase()??"unknown",z={},M=[];for(let c of v){let V=c.indexOf("=");if(V!==-1){let l=c.slice(0,V).trim().toLowerCase(),H=c.slice(V+1).trim();if(H===""){z[l]=H;continue}let a=Number(H);if(!Number.isNaN(a)){z[l]=a;continue}let F=W5(H);if(F===null){z[l]=H;continue}z[l]=F}else if(c)M.push(c)}return{name:d,params:z,positional:M}}function W5(h){if(["y","yes","true","on"].includes(h.toLowerCase()))return!0;if(["n","no","false","off"].includes(h.toLowerCase()))return!1;return null}function L2(h){let v=[];for(let d of h.positional)v.push(d);for(let[d,z]of Object.entries(h.params))if(!Number.isNaN(Number(d)))v.push(z.toString());return v}function J1(h){if(h.startsWith("m:")||h.startsWith("meta:"))return h.slice(h.indexOf(":")+1);else return h}function f2(){return mw.config.get("wgPageParseReport").limitreport.postexpandincludesize.limit}function _1(){let h=mw.config.get("wgServer").replace(/^(https?)?:?\/\//,"").split("."),v=h[0],d=h[1];if(v===void 0||d===void 0)return"";let z;switch(d){case"wikimedia":switch(v){case"commons":case"meta":case"species":case"incubator":case"outreach":z=v;break;default:break}break;case"mediawiki":z="mw";break;case"wikidata":switch(v){case"test":z="testwikidata";break;case"www":z="d";break;default:break}break;case"wikipedia":switch(v){case"test":z="testwiki";break;case"test2":z="test2wiki";break;default:z="w:"+v;break}break;case"wiktionary":z="wikt:"+v;break;case"wikiquote":z="q:"+v;break;case"wikibooks":z="b:"+v;break;case"wikinews":z="n:"+v;break;case"wikisource":z="s:"+v;break;case"wikiversity":z="v:"+v;break;case"wikivoyage":z="voy:"+v;break;default:return""}return`:${z}:`}function P(h){if(h=h.replace(H2,""),h=h.trim(),mw.util.isIPAddress(h,!0))h=h.toUpperCase();else if(h)h=new mw.Title(h).getMainText();return h}function H1(h){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(h)}function Z0(h){return mw.util.isInfinity(h)}var $5=["second","seconds","minute","minutes","hour","hours","day","days","week","weeks","month","months","year","years"],j5=new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${$5.join("|")})$`,"i");function Q5(h){return j5.test(h)}function S1(h){if(Z0(h))return h;if(H1(h))return h;if(Q5(h))return h;return null}function O(h){return mw.util.isIPAddress(h,!0)||mw.util.isTemporaryUser(h)}function k1(h){return b0.test(h)?h:h.trimEnd()+" ~~~~"}function C(h,v){return v??=h,$("<a>").attr("href",mw.util.getUrl(h)).attr("title",h).text(v).prop("outerHTML")}function W0(h,v,d){return d??=h,$("<a>").attr("href",h).attr("title",d).text(v).prop("outerHTML")}function w1(h){let{blockedUsers:v,taggedUsers:d,lockedUsers:z}=h,M="",c=v.filter(Boolean);if(c.length>0)M+=`
** blocked `+c.join(", ");let V=d.filter(Boolean);if(V.length>0)M+=`
** tagged `+V.join(", ");if(z.length>0)M+=`
** requested locks for `+z.map((l)=>`{{noping|1=${l}}}`).join(", ");return M}function F2(h){let v=h.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(`^(={3}|={5})\\s*(<big>)?${v}(</big>)?\\s*(={3}|={5})\\s*$`,"m")}function Y5(h,v=0,d){let z=h.length;if(d){let M=F2(d),c=h.slice(v+1).match(M);if(c?.index!==void 0)z=v+c.index}return h.slice(v,z).trim()}function X1(h,v){return v.sort((z,M)=>z.header.getTime()-M.header.getTime()),h.slice(0,A2(h))+`
`+v.map((z)=>z.fullText).join(`

`)}function A2(h){return t.exec(h)?.index??h.length}function B1(h,v){let d=[];if(v.length===0)return d;let z=A2(h),M=h.slice(z);for(let c=0;c<v.length;c++){let V=v[c];if(!V)continue;let l=V.name,H=F2(l),a=M.match(H);if(!a)continue;let F=a.index;if(F===void 0)continue;let A=Y5(M,F,v[c+1]?.name);if(A){let Z=n1(l);if(Z===null)return new y({type:"error",content:`Failed to parse date from section header "${l}" in archive`}).show(),null;d.push({header:Z,fullText:A})}M=M.slice(A.length)}return d}function n1(h){let v=new Date(h);if(!isNaN(v.getTime()))return v;return null}function y2(){return{block:!1,duration:"",acb:!0,abao:!0,ntp:!1,nem:!1,tags:[],lock:!1}}function r1(h=""){return{options:{noBlock:!1,override:!1,tagUnattached:!0,cuBlock:!1,cuBlockOnly:!1,addMasterNotice:!0,addSockNotice:!0,blankTalk:!1,lockHideNames:!1},userLocks:new Map,userBlocks:new Map,userTags:new Map,master:h,lockcomment:"",skipCUVerifyUsers:new Set}}function g1(h){let v=[],d=l1(h);for(let z of d)if(["sockpuppeteer","sockmaster"].includes(z.name)){let M=(z.params["1"]??z.positional[0])?.toString(),c=M==="cu"||(M?.includes("confirmed")??!1),V=z.params.checked===!0||c,l;if(c)l="confirmed";else if(M==="banned")l="banned";else if(M?.includes("blocked"))l=V?"confirmed":"blocked";else{console.warn("Unrecognised master status",M);continue}let H=new g({status:l,checked:V});if(z.params.locked===!0)H.locked=!0;if(z.params.ltapage)H.ltapage=z.params.ltapage;if(z.params.spipage)H.spipage=z.params.spipage;if(z.params.evidence)H.evidence=z.params.evidence;v.push(H)}else if(["sockpuppet","sock"].includes(z.name)){let M=z.params["1"]??z.positional[0];if(!M){console.warn("Master parameter not found");continue}let c=z.params["2"]??z.positional[1],V;switch(c){case"blocked":V="blocked";break;case"proven":V="proven";break;case"confirmed":case"nbconfirmed":case"cuconfirmed":V="confirmed";break;default:console.warn("Unrecognised sock status",c);continue}let l=new u({master:M,status:V}),H=z.params.altmaster;if(H){let a=z.params["altmaster-status"],F;switch(a){case"suspect":case"suspected":F="suspected";break;case"proven":F="proven";break;default:console.warn("Unrecognised altmaster status",a);break}if(F)l.altmaster=H,l.altmasterStatus=F}if(z.params.evidence)l.evidence=z.params.evidence;if(z.params.locked)l.locked=!0;v.push(l)}return v}function n(h){return h instanceof u}function a1(h){return h instanceof g}var I1=new Map;function U(h){I1.set(h,"running")}function _(h,v){I1.set(h,v)}function q2(){for(let h of I1.values())if(h==="running")return!0;return!1}function L1(h){return I1.get(h)==="running"}function o1(h){return I1.get(h)}var $0=" (using [[:w:en:WP:SPIH-D|SPIH-D]])",b2={title:new mw.Title("User talk:DatGuy/spihelper"),bugsLink:"//github.com/DatGuy1/spihelper/issues/new",showUseragentCheckbox:!0,useragentCheckboxMessage:"I want to share my user agent publicly alongside my feedback. This is optional."},T="3.2.3",G="production",K1={watch:{case:"preferences",archive:"nochange",tagged:"preferences",categories:"nochange",blocked:!0},expiry:{case:"indefinite",archive:"indefinite",tagged:"indefinite",categories:"indefinite",blocked:"indefinite"},log:{enabled:!1,reversed:!1,page:"spihelper_log"},clerk:!0,tickArchiveWhenCaseClosed:!1,useCheckuserblockAccount:mw.config.get("wgUserGroups")?.includes("checkuser")??!1,useLookup:!0,defaultActions:["comment"],interface:{defaultBlockDuration:"indefinite",displayIPv6As64:!0,fullPreview:!1,pinned:!0,buttonLayout:!1},highlightSection:!0,custom:{commentTemplates:[]},debug:{enabled:!1,forceCheckuser:!1,forceAdmin:!1},lastSeenVersion:"3.2.3"};async function Z2(h){let v=Q(),d={action:"query",list:"blocks",bklimit:1,bkusers:h,bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let z=await v.get(d),[M]=z.query.blocks;if(!M)return null;return{username:h,duration:M.expiry,acb:M.nocreate,abao:M.autoblock||M.anononly,ntp:!M.allowusertalk,nem:M.noemail,reason:M.reason}}catch{return null}}async function D1(h){if(h.length===0)return new Map;let v=Q(),d=new Map,z={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:h,formatversion:"2"};try{let M=await v.get(z);for(let c of M.query.pages){if(c.missing)continue;let V=c.revisions?.[0];if(!V)continue;let l=c.title.split(":",2)[1];if(!l){console.error("spiHelperGetBulkPageText: could not find name for",c.title);continue}d.set(l,V.slots.main.content)}}catch(M){console.error("spiHelperGetBulkPageText fetch error:",M)}return d}async function i1(h){if(h.size===0)return new Map;let v=Q(),d=new Map,z={action:"query",list:"blocks",bklimit:"max",bkusers:[...h],bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let M=await v.get(z);for(let c of M.query.blocks)d.set(c.user,{username:c.user,duration:c.expiry,acb:c.nocreate,abao:c.autoblock||c.anononly,ntp:!c.allowusertalk,nem:c.noemail,reason:c.reason})}catch(M){console.error("spiHelperGetBulkUserBlockSettings fetch error:",M)}return d}async function f1(h){let v=Q(),d={action:"query",list:"globalallusers",agulimit:1,agufrom:h,aguto:h,aguprop:["lockinfo","existslocally"]};try{let z=await v.get(d),[M]=z.query.globalallusers;if(!M)return null;return{name:M.name,existsLocally:"existslocally"in M,locked:"locked"in M}}catch{return null}}async function J0(h,v){let d=Q(),z={action:"query",list:"allusers",aulimit:v,auprefix:h,auprop:["blockinfo"],formatversion:"2"};try{return(await d.get(z)).query.allusers}catch{return[]}}async function _0(h,v,d){let z=Q(),M={action:"query",list:"allpages",aplimit:d,apprefix:h,apnamespace:v,formatversion:"2"};try{return(await z.get(M)).query.allpages}catch{return[]}}async function s1(h,v){let d="delete_"+h;U(d);let z=C(h),M=new y({type:"notice",content:`Deleting ${z}`,isHtml:!0}).show(),c=Q(h),V={action:"delete",title:h,reason:v};try{await c.postWithToken("csrf",V),M.update({type:"success",content:`Deleted ${z}`}),_(d,"success")}catch(l){M.update({type:"error",content:`Failed to delete ${z}: ${mw.html.escape(JSON.stringify(l))}`}),_(d,"failed")}}async function W2(h,v){let d="undelete_"+h;U(d);let z=C(h),M=new y({type:"notice",content:`Undeleting ${z}`,isHtml:!0}).show(),c=Q(h),V={action:"undelete",title:h,reason:v};try{await c.postWithToken("csrf",V),M.update({type:"success",content:`Undeleted ${z}`}),_(d,"success")}catch(l){M.update({type:"error",content:`Failed to undelete ${z}: ${mw.html.escape(JSON.stringify(l))}`}),_(d,"failed")}}async function X0(h,v){let d={action:"parse",prop:"text",pst:!0,text:v,title:h};try{return(await Q(h).post(d)).parse?.text["*"]??""}catch(z){return console.error("Error rendering text:",z),""}}async function e(h){let{pageName:v,content:d}=h,z={action:"parse",prop:"tocdata",formatversion:"2"};if(v!==void 0)z.page=v;else if(d!==void 0)z.text=d,z.contentmodel="wikitext";else return console.error("spiHelperGetInvestigationSections: No page name or content provided"),[];let M=Q();try{let c=await M.post(z);if(!c.parse)return console.error("spiHelperGetInvestigationSections: Could not parse sections"),[];let V=[];for(let l of c.parse.tocdata.sections)if(l.tocLevel===2||l.hLevel===3)V.push(new U0(parseInt(l.index),l.line));return V}catch(c){return console.warn("spiHelperGetInvestigationSections API error:",c),[]}}async function $2(h){let v=Q(),d={action:"query",format:"json",list:"backlinks",bltitle:h,blnamespace:4,bldir:"ascending",blfilterredir:"nonredirects"};try{return(await v.get(d)).query.backlinks.filter((M)=>{return M.title.startsWith("Wikipedia:Sockpuppet investigations/")&&!M.title.startsWith("Wikipedia:Sockpuppet investigations/SPI/")&&!/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(M.title)})}catch{return[]}}async function B0(h){let v=Q(),d={action:"query",format:"json",prop:"info",titles:h,inprop:"protection",formatversion:"2"};try{let z=await v.get(d),[M]=z.query.pages;return M?.protection??[]}catch{return[]}}async function I0(h){let v=Q(),d={action:"query",format:"json",prop:"flagged",titles:h,formatversion:"2"};try{let z=await v.get(d),[M]=z.query.pages;return M?.flagged??null}catch{return null}}async function K0(h,v){let d="protect_"+h;U(d);let z=C(h),M=new y({type:"notice",content:`Protecting ${z}`,isHtml:!0}),c=Q();try{let V="",l="";v.forEach((a)=>{if(V!=="")V=V+"|",l=l+"|";V=V+a.type+"="+a.level,l=l+a.expiry});let H={action:"protect",format:"json",title:h,protections:V,expiry:l,reason:"Restoring protection after history merge"};await c.postWithToken("csrf",H),M.update({type:"success",content:`Protected ${z}`}),_(d,"success")}catch(V){M.update({type:"error",content:`Failed to protect ${z}: ${mw.html.escape(JSON.stringify(V))}`}),_(d,"failed")}}async function D0(h,v){if(v.level==="")return;let d="stabilize_"+h;U(d);let z=Q(),M={action:"stabilize",format:"json",titles:h,protectlevel:v.level,expiry:v.expiry,reason:"Restoring pending changes protection after history merge"};try{await z.postWithToken("csrf",M),_(d,"success")}catch{_(d,"failed")}}async function j2(){let h=Q(),v={action:"query",format:"json",meta:"siteinfo",siprop:"restrictions"};try{return(await h.get(v)).query.restrictions}catch{return{types:[],levels:[],cascadinglevels:[],semiprotectedlevels:[]}}}async function Q2(h){let{user:v,duration:d,reason:z,reblock:M,anononly:c,accountcreation:V,autoblock:l,notalkpage:H,noemail:a,watchBlockedUser:F,watchExpiry:A="indefinite"}=h,Z="block_"+v;U(Z);let X="User:"+v,q=C(X),j=new y({type:"notice",content:`Blocking ${q}`,isHtml:!0}).show(),B=Q(),E={action:"block",expiry:d,reason:z,reblock:M,anononly:c,nocreate:V,autoblock:l,allowusertalk:!H,noemail:a,watchuser:F,watchlistexpiry:A,user:v,formatversion:"2"};try{let r=await B.postWithToken("csrf",E),J=W0(mw.util.getUrl("Special:BlockList",{wpTarget:`#${r.block.id}`}),"Blocked","Special:BlockList");return j.update({type:"success",content:`${J} user ${q}`}),_(Z,"success"),!0}catch(r){return j.update({type:"error",content:`Failed to block ${q}: ${mw.html.escape(JSON.stringify(r))}`}),_(Z,"failed"),!1}}async function m1(h){let{sourcePage:v,destPage:d,summary:z,ignoreWarnings:M,suppressRedirect:c=!1,moveSubpages:V=!0}=h,l="move_"+v+"_"+d;U(l);let H=Q(),a=C(v),F=C(d),A=new y({type:"notice",content:`Moving ${a} to ${F}`,isHtml:!0}).show(),Z={action:"move",from:v,to:d,reason:z+$0,noredirect:c,movesubpages:V,ignoreWarnings:M};try{await H.postWithToken("csrf",Z),A.update({type:"success",content:`Moved ${a} to ${F}`}),_(l,"success")}catch(X){A.update({type:"error",content:`Failed to move ${a} to ${F}: ${mw.html.escape(JSON.stringify(X))}`}),_(l,"failed")}}async function I(h){let{title:v,newText:d,summary:z,createonly:M=!1,watch:c,watchExpiry:V,baseRevId:l,sectionId:H}=h,a=`edit_${v}`;if(H)a+=`_${H}`;U(a);let F=C(v),A=new y({type:"notice",content:"Editing "+F,isHtml:!0}).show(),Z=Q(v),X=J1(v),q={action:"edit",watchlist:c,summary:z+$0,text:d,title:X,createonly:M,formatversion:"2"};if(H)q.section=H.toString();if(V)q.watchlistexpiry=V;if(l)q.baserevid=l;try{let j=await Z.postWithToken("csrf",q),B=j.edit.newrevid;if(!B)return A.update({type:"error",content:`Edit failed on ${F}: ${mw.html.escape(JSON.stringify(j))}`}),console.error(j),_(a,"failed"),null;let E=W0(mw.util.getUrl("",{diff:B}),"Saved",`View diff ${B}`);return A.update({type:"success",content:`${E} page ${F}`,isHtml:!0}),_(a,"success"),j.edit.newrevid}catch(j){return A.update({type:"error",content:`Edit failed on ${F}: ${mw.html.escape(JSON.stringify(j))}`,isHtml:!0}),console.error(j),_(a,"failed"),null}}async function Y(h,v,d){let z=C(h),M=new y({type:"notice",content:"Getting page "+z,isHtml:!0});if(v)M.show();let V={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:J1(h),formatversion:"2"};if(d)V.rvsection=d.toString();try{let H=(await Q(h).get(V)).query.pages[0];if(!H||"missing"in H){if(v)M.update({type:"warning",content:`Page ${z} does not exist`,isHtml:!0});return""}let a=H.revisions?.[0];if(!a)return"";if(v)M.update({type:"success",content:`Got ${z}`,isHtml:!0});return a.slots.main.content}catch(l){if(v)M.update({type:"error",content:`Failed to get ${z}: ${mw.html.escape(JSON.stringify(l))}`,isHtml:!0});return""}}async function t1(h){let d={action:"query",prop:"revisions",rvslots:"main",rvprop:"ids",titles:J1(h),formatversion:"2"};try{let M=(await Q(h).get(d)).query.pages[0];if(!M||"missing"in M)return 0;let c=M.revisions?.[0];if(!c)return 0;return c.revid}catch{return 0}}async function m0(h,v){let z={action:"parse",prop:"limitreportdata",page:J1(h)};if(v)z.section=v.toString();let M=Q(h);try{let c=await M.get(z);return Number(c.parse?.limitreportdata.find((V)=>V.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function Y2(h){let v=Q(),d={action:"parse",prop:"text",text:h,wrapoutputclass:"",disablelimitreport:!0,disableeditsection:!0,contentmodel:"wikitext"};try{return(await v.post(d)).parse?.text["*"]??""}catch{return""}}async function p0(h){let v=Q(),d={action:"query",list:"categorymembers",cmtitle:h,cmlimit:"max",cmnamespace:2,formatversion:"2"};try{return(await v.get(d)).query.categorymembers.map((M)=>M.title)}catch{return[]}}var j0=`MediaWiki-JS/${mw.config.get("wgVersion")} spihelper/${T}`,Q0={meta:new mw.ForeignApi("https://meta.wikimedia.org/w/api.php",{userAgent:j0}),local:new mw.Api({userAgent:j0})};function Q(h){if(h&&(h.startsWith("m:")||h.startsWith("meta:")))return Q0.meta;else return Q0.local}function J2(){if(mw.config.get("wgWikiID")==="enwiki")return Q0.local;return new mw.ForeignApi("https://en.wikipedia.org/w/api.php",{userAgent:j0})}class p1{pageName;prefixedName;caseName;userName;archiveName;casePageName;isArchive;valid;startingRevId;constructor(h,v=!1){if(this.pageName=h,this.prefixedName=_1()+h,this.isArchive=/Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(h),this.caseName=J5(h,this.isArchive),this.userName=P(this.caseName),this.casePageName="Wikipedia:Sockpuppet investigations/"+this.caseName,this.archiveName=h+"/Archive",this.valid=!!this.caseName.trim(),v)this.startingRevId=mw.config.get("wgCurRevisionId");else this.startingRevId=0}async refreshRevId(){this.startingRevId=await t1(this.pageName)}async edit(h){return I({title:this.pageName,newText:h.newText,summary:h.summary,createonly:h.createonly??!1,watch:h.watch,watchExpiry:h.watchExpiry,baseRevId:h.baseRevId,sectionId:h.sectionId})}}function J5(h,v){let d=h.replace(/^Wikipedia:Sockpuppet investigations\//,"");return v?d.replace(/\/Archive.*/,""):d}function _5(h){return h.replaceAll(/_/g," ")}var f;function e1(h){f=new p1(_5(h),h===mw.config.get("wgPageName"))}function U1(h){return f.valid?h+` per [[${f.prefixedName}]]`:h}class G0{sections;selectedSection;archiveNotice;_text=null;_loadingPromise=null;constructor(h=[],v=null,d=null){if(this.sections=h,v)this.selectedSection={type:"specific",section:v};else this.selectedSection=null;this.archiveNotice=d}}class U0{id;name;_text=null;_loadingPromise=null;constructor(h,v){this.id=h,this.name=v}}async function S(h,v={}){let{purge:d=!1,show:z=!1}=v;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!d)return h._text;return h._loadingPromise=Y(f.pageName,z),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}async function F1(h){h.sections=await e({pageName:f.pageName})}async function K(h,v={}){let{purge:d=!1,show:z=!1}=v;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!d)return h._text;return h._loadingPromise=Y(f.pageName,z,h.id),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}var b=(h)=>h;var _2=[{label:"Follow preferences",value:"preferences"},{label:"No change",value:"nochange"},{label:"Watch",value:"watch"},{label:"Unwatch",value:"unwatch"}],X2=["preferences","watch","nochange","unwatch"],B2={analyser:!1,timeline:!1,timecard:!1,pages:!1,summary:!1,cuwiki:!1};var E0=b({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,watchOptions:_2,messages:{error:"Watch option is invalid"}}},computed:{status(){return X2.includes(this.internalValue)?"default":"error"}},watch:{resetTrigger(){this.internalValue=this.modelValue},internalValue(h){this.$emit("update:modelValue",h)}},template:`
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ this.label }}</template>
      <cdx-select
          :menu-items="watchOptions"
          v-model:selected="internalValue"
      />
    </cdx-field>
  `});var O0=b({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,touched:!1,isResetting:!1}},watch:{resetTrigger(){this.isResetting=!0,this.internalValue=this.modelValue,this.touched=!1,this.$nextTick(()=>{this.isResetting=!1})},internalValue(h){if(!this.isResetting)this.touched=!0;if(h===""||S1(h)!==null)this.$emit("update:modelValue",h)}},template:`
    <expiry-input :label="label" :touched="touched" v-model="internalValue" />
  `});var C0=b({props:{modelValue:{type:String,required:!0},prefix:{type:String,required:!0}},data(){return{inputValue:this.modelValue,messages:{error:"Page name is invalid"},resetValue:"spihelper_log"}},computed:{valid(){return this.inputValue.length>0&&mw.Title.newFromText(this.prefix+this.inputValue)!==null},status(){return this.valid?"default":"error"}},watch:{inputValue(h){if(this.valid)this.$emit("update:modelValue",h)}},methods:{resetInput(){this.inputValue=this.resetValue}},template:`
    <cdx-field :status="status" :messages="messages">
      <template #label>Page</template>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-family: monospace; color: #666">{{ this.prefix }}</span>
        <cdx-text-input v-model="inputValue" style="flex-grow: 1;"/>
      </div>
      <cdx-button @click="resetInput">
        Reset
      </cdx-button>
      <template #description>Page in your userspace to log to</template>
    </cdx-field>
  `});async function I2(h){return!(await Y2("{{#time:r|"+h+"}}")).includes("Error: Invalid time.")}function h0(h){return`User:${mw.config.get("wgUserName")}/${h}`}var X5=[{oldPath:"watchCase",newPath:["watch","case"],type:"WatchOption"},{oldPath:"watchArchive",newPath:["watch","archive"],type:"WatchOption"},{oldPath:"watchTaggedUser",newPath:["watch","tagged"],type:"WatchOption"},{oldPath:"watchNewCats",newPath:["watch","categories"],type:"WatchOption"},{oldPath:"watchBlockedUser",newPath:["watch","blocked"],type:"boolean"},{oldPath:"watchCaseExpiry",newPath:["expiry","case"],type:"expiry"},{oldPath:"watchArchiveExpiry",newPath:["expiry","archive"],type:"expiry"},{oldPath:"watchTaggedUserExpiry",newPath:["expiry","tagged"],type:"expiry"},{oldPath:"watchNewCatsExpiry",newPath:["expiry","categories"],type:"expiry"},{oldPath:"watchBlockedUserExpiry",newPath:["expiry","blocked"],type:"expiry"},{oldPath:"clerk",newPath:["clerk"],type:"boolean"},{oldPath:"log",newPath:["log","enabled"],type:"boolean"},{oldPath:"reversed_log",newPath:["log","reversed"],type:"boolean"},{oldPath:"tickArchiveWhenCaseClosed",newPath:["tickArchiveWhenCaseClosed"],type:"boolean"},{oldPath:"useCheckuserblockAccount",newPath:["useCheckuserblockAccount"],type:"boolean"},{oldPath:"displayIPv6As64",newPath:["interface","displayIPv6As64"],type:"boolean"},{oldPath:"debugForceCheckuserState",newPath:["debug","forceCheckuser"],type:"boolean"},{oldPath:"debugForceAdminState",newPath:["debug","forceAdmin"],type:"boolean"}];function B5(h,v,d){let z=h;for(let c=0;c<v.length-1;c++){if(!v[c])throw Error(`Path segment "${v.join(".")}" is invalid`);let V=v[c],l=z[V];if(l===null||typeof l!=="object")throw Error(`Path segment "${v[c]}" is not an object`);z=l}let M=v[v.length-1];z[M]=d}async function K2(h){let v=X5.map(async({oldPath:d,newPath:z,type:M})=>{let c=h[d];if(c===void 0)return;if(await I5(c,M))B5(L,z,c)});await Promise.all(v)}async function I5(h,v){switch(v){case"boolean":return typeof h==="boolean";case"WatchOption":return typeof h==="string"&&["preferences","watch","nochange","unwatch"].includes(h);case"expiry":return typeof h==="string"&&I2(h)}}var L=structuredClone(K1);function D2(h){L=structuredClone(h)}var m2="userjs-spihelper";function o(){return Q().saveOption(m2,JSON.stringify(L))}function x0(){let h=String(mw.user.options.get(m2));try{return h?JSON.parse(h):null}catch(v){return console.warn("Failed to parse saved options",v),null}}async function N0(){mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"migrate"});try{if(await mw.loader.getScript("/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript"),spiHelperCustomOpts!==void 0)await K2(spiHelperCustomOpts)}catch(h){mw.notify("Error retrieving your spihelper-options.js",{type:"error"}),console.error("Error getting local spihelper-options.js: ",h)}}function D(h=!0){if(h&&L.debug.enabled)return L.debug.forceCheckuser;return mw.config.get("wgUserGroups")?.includes("checkuser")??!1}function m(){return L.clerk||D()}function p(){if(L.debug.enabled)return L.debug.forceAdmin;return mw.config.get("wgUserGroups")?.includes("sysop")??!1}function G1(){return p()||(mw.config.get("wgUserGroups")?.includes("extendedmover")??!1)}var A1='<path d="M11 9V4H9v5H4v2h5v5h2v-5h5V9z"/>';var p2='<path d="m2 10 1.42-1.41L9 14.17V2h2v12.17l5.59-5.58L18 10l-8 8z"/>';var U2='<path d="M10 0a10 10 0 1010 10A10 10 0 0010 0m2.5 14.5L9 11V4h2v6l3 3z"/>',G2='<path d="m4.34 2.93 12.73 12.73-1.41 1.41L2.93 4.35z"/><path d="M17.07 4.34 4.34 17.07l-1.41-1.41L15.66 2.93z"/>',E2='<path id="cdx-icon-code-a" d="M1 10.08V8.92h1.15c1.15 0 1.15 0 1.15-1.15V5a7.4 7.4 0 01.09-1.3 2 2 0 01.3-.7 1.84 1.84 0 01.93-.68A6.4 6.4 0 016.74 2h1.18v1.15h-.86A1.32 1.32 0 006 3.62a1.7 1.7 0 00-.36 1.23V7a3.2 3.2 0 01-.28 1.72 2 2 0 01-1.26.77 2.15 2.15 0 011.26.79A3.26 3.26 0 015.62 12v3.15A1.67 1.67 0 006 16.37a1.31 1.31 0 001.08.47h.87V18H6.74a6.3 6.3 0 01-2.12-.29 1.82 1.82 0 01-.93-.71 1.9 1.9 0 01-.3-.72A7.5 7.5 0 013.31 15v-3.77c0-1.15 0-1.15-1.15-1.15zm18 0V8.92h-1.15c-1.15 0-1.15 0-1.15-1.15V5a7.4 7.4 0 00-.08-1.32 2 2 0 00-.3-.73 1.84 1.84 0 00-.93-.68A6.4 6.4 0 0013.26 2h-1.18v1.15h.87a1.32 1.32 0 011.05.47 1.7 1.7 0 01.36 1.23V7a3.2 3.2 0 00.28 1.72 2 2 0 001.26.77 2.15 2.15 0 00-1.26.79 3.26 3.26 0 00-.26 1.72v3.15a1.67 1.67 0 01-.38 1.22 1.31 1.31 0 01-1.08.47h-.87V18h1.19a6.3 6.3 0 002.12-.29 1.82 1.82 0 00.93-.68 1.9 1.9 0 00.3-.72 7.5 7.5 0 00.1-1.31v-3.77c0-1.15 0-1.15 1.15-1.15z"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cdx-icon-code-a" transform="matrix(-1 0 0 1 20 0)"/>',O2='<path d="m2.5 15.25 7.5-7.5 7.5 7.5 1.5-1.5-9-9-9 9z"/>';var v0={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3z"/><path d="M9 9h8v8H9zm0-2c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2z"/>',shouldFlip:!0};var C2='<path d="M17 12v5H3v-5H1v5a2 2 0 002 2h14a2 2 0 002-2v-5z"/><path d="M15 9h-4V1H9v8H5l5 6z"/>';var x2='<path d="m17.5 4.75-7.5 7.5-7.5-7.5L1 6.25l9 9 9-9z"/>';var y1={ltr:'<path d="M19 16 2 12a3.83 3.83 0 01-1-2.5A3.83 3.83 0 012 7l17-4z"/><rect width="4" height="8" x="4" y="9" rx="2"/>',shouldFlip:!0};var N2={ltr:'<path d="M2 18.5A1.5 1.5 0 003.5 20H5V0H3.5A1.5 1.5 0 002 1.5zM6 0v20h10a2 2 0 002-2V2a2 2 0 00-2-2zm7 8H8V7h5zm3-2H8V5h8z"/>',shouldFlip:!0};var u2={ltr:'<path d="M8 12V1H1v18h18v-7z"/><path d="M11 1v8h8V1zm6 6h-4V3h4z"/>',shouldFlip:!0};var R2={ltr:'<path d="M13 15v2a3 3 0 01-3 3 10 10 0 1110-10 5 5 0 01-5 5ZM3 8.5a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3-4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3 4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0"/>',shouldFlip:!0},P2={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3zm4 12v2c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2h-2v2h2v8H9v-2z"/><path d="M10 5H8v3H5v2h3v3h2v-3h3V8h-3z"/>',shouldFlip:!0};var z0='<path d="M13 8V2a2 2 0 002-2H5a2 2 0 002 2v6H6a2 2 0 00-2 2v1h5v5l1 4 1-4v-5h5v-1a2 2 0 00-2-2z"/>';var d0='<path d="M15.65 4.35A8 8 0 1017.4 13h-2.22a6 6 0 11-1-7.22L11 9h7V2z"/>';var i='<path d="M17 2h-3.5l-1-1h-5l-1 1H3v2h14zM4 17a2 2 0 002 2h8a2 2 0 002-2V5H4z"/>';var T2={ltr:'<path d="m6.4 17-1.26-1.25 2.32-2.25H1v-1.75h6.46L5.14 9.5 6.4 8.25l4.5 4.38zm7.2-5.25L9.1 7.37 13.6 3l1.26 1.25-2.32 2.25H19v1.75h-6.46l2.32 2.25z"/>',shouldFlip:!0};var M0='<path d="M10 11c-5.92 0-8 3-8 5v3h16v-3c0-2-2.08-5-8-5"/><circle cx="10" cy="5.5" r="4.5"/>',c0='<path d="M10 8c1.7 0 3.06-1.35 3.06-3S11.7 2 10 2 6.94 3.35 6.94 5 8.3 8 10 8m0 2c-2.8 0-5.06-2.24-5.06-5S7.2 0 10 0s5.06 2.24 5.06 5-2.26 5-5.06 5m-7 8h14v-1.33c0-1.75-2.31-3.56-7-3.56s-7 1.81-7 3.56zm7-6.89c6.66 0 9 3.33 9 5.56V20H1v-3.33c0-2.23 2.34-5.56 9-5.56"/>';var S2={ltr:'<path d="M1 3h16v2H1Zm0 6h6v2H1Zm0 6h8v2H1Zm8-4.24h3.85L14.5 7l1.65 3.76H20l-3 3.17.9 4.05-3.4-2.14L11.1 18l.9-4.05Z"/>',shouldFlip:!0};function E1(h){let{text:v,fullSearch:d,state:z}=h,M=d?[h1(f.caseName,z)]:[],c=[],V=d?new Set([f.caseName]):new Set;if(d){let a=$(document);if(z.selectedSection?.type==="specific")a=$(`a[href$="section=${z.selectedSection.section.id}"]`).parentsUntil(":has(hr)").last().nextUntil("hr");let F=a.find(".cuEntry").find("a:first");for(let A of F){let Z=P($(A).text());if(V.has(Z))continue;M.push(h1(Z,z)),V.add(Z)}}let l=(a)=>{return/sock ?list/.exec(a)!==null||["ip","vandal","user","noping"].some((F)=>a.includes(F))},H=l1(v);for(let a of H)if(l(a.name)){let F=L2(a);for(let A of F){let Z=P(A);if(!V.has(Z))c.push(h1(Z,z)),V.add(Z)}}return[M,c,V]}function h1(h,v){if(mw.util.isIPAddress(h,!0))if(L.interface.displayIPv6As64&&mw.util.isIPv6Address(h,!1))return{...v1(v.archiveNotice),username:K5(h)};else return{...v1(v.archiveNotice),username:h};else return{...v1(v.archiveNotice),username:h}}function K5(h){if(!mw.util.isIPv6Address(h,!1))return h;return h.split(":").slice(0,4).concat("0","0","0","0").join(":")+"/64"}function v1(h){let v={id:crypto.randomUUID(),username:"",block:y2(),link:{...B2}};if(h){if(h.crosswiki)v.block.lock=!0;if(h.notalk)v.block.nem=!0,v.block.ntp=!0}return v.block.duration=L.interface.defaultBlockDuration,v}function O1(h){let{userRow:v,currentBlock:d,userPage:z,defaultBlock:M}=h;if(d)v.block.block=!0,v.block.acb=d.acb,v.block.abao=d.abao,v.block.ntp=d.ntp,v.block.nem=d.nem,v.block.duration=d.duration;else if(v.block.block=M,mw.util.isIPAddress(v.username,!0))v.block.duration="1 week";if(z)v.block.tags=g1(z);return v}var C1=(h)=>("items"in h);async function V0(h){let{block:v,userPage:d,defaultBlock:z,checkLock:M,state:c}=h,V=O1({userRow:h.userRow,defaultBlock:z,currentBlock:v,userPage:d}),l=null;if(M){let H=await f1(V.username);if(H)if(l=H.locked,H.locked||c.archiveNotice?.crosswiki)V.block.lock=!0;else V.block.lock=!1}return{userRow:V,isLocked:l}}function u0(h){return h.map((v)=>{if(C1(v)){let d=u0(v.items);if(d.length===0)return null;return{...v,items:d}}if(!v.value)return null;return v}).filter((v)=>v!==null)}var l0=null;function k2(h){l0=h}var w2=b({props:{feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},toaster:{type:Object,required:!0}},data:function(){let v=`User:${mw.config.get("wgUserName")??""}/`,d=a2.reduce((z,M)=>{if(M!=="sections")z.push({value:M,label:M.charAt(0).toUpperCase()+M.slice(1)});return z},[]);return{open:!1,openHandler:null,showExtra:L.debug.enabled,showExtraMessage:!1,showExtraHandler:null,logPrefix:v,caseActionMenuItems:d,selectedChipItems:L.defaultActions,icons:{cdxIconAdd:A1,cdxIconArrowDown:p2,cdxIconClock:U2,cdxIconClose:G2,cdxIconCode:E2,cdxIconFeedback:y1,cdxIconJournal:N2,cdxIconLayout:u2,cdxIconPalette:R2,cdxIconReload:d0,cdxIconTrash:i,cdxIconWatchlist:S2},instanceSettings:structuredClone(L),oldSettings:structuredClone(L),resetTrigger:0}},computed:{logPage(){return`${mw.config.get("wgServer")}/wiki/${h0(L.log.page)}`},isCheckUser(){let{debug:h}=this.instanceSettings;return(mw.config.get("wgUserGroups")?.includes("checkuser")??!1)||h.enabled&&h.forceCheckuser},inputChipItems:{get(){return this.instanceSettings.defaultActions.map((h)=>({value:h,label:h.charAt(0).toUpperCase()+h.slice(1)}))},set(h){this.instanceSettings.defaultActions=h.map((v)=>v.value)}}},watch:{open(h){if(h){if(!this.showExtra&&this.showExtraHandler)window.addEventListener("keydown",this.showExtraHandler)}else{let v=JSON.stringify(this.instanceSettings);if(JSON.stringify(this.oldSettings)!==v){if(l0)D2(l0(this.instanceSettings));else{this.toaster.error("Failed to save settings",{autoDismiss:!0});return}let z=this.toaster.info("Saving settings...",{autoDismiss:!1});o().then((M)=>{this.toaster.success("Settings saved! Reload to apply them",{autoDismiss:!0})}).catch((M)=>{let c=M instanceof Error?M.message:String(M);this.toaster.error(`Failed to save settings: ${c}`,{autoDismiss:!0})}).always(()=>{this.oldSettings=JSON.parse(v),setTimeout(()=>{this.toaster.dismiss(z)},3000)})}if(this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler)}}},mounted(){this.openHandler=()=>{this.open=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"options"})},this.openButton.addEventListener("click",this.openHandler);//! Use the Konami code to unlock debug menu
let h=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"],v=0;this.showExtraHandler=(d)=>{if(d.key===h[v]){if(v++,v===h.length){if(this.showExtra=!0,this.showExtraMessage=!0,this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler);v=0}}else v=0}},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler)},methods:{isMenuGroupData:C1,loadDefaults(){this.instanceSettings=JSON.parse(JSON.stringify(K1)),Object.assign(L,K1),this.resetTrigger++},launchFeedback(){this.open=!1,this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`Options form v${T}-${G}`})},removeTemplateEntry(h){this.instanceSettings.custom.commentTemplates.splice(h,1)},addTemplateEntry(h){if(h==="item")this.instanceSettings.custom.commentTemplates.push({label:"",value:""});else this.instanceSettings.custom.commentTemplates.push({label:"",items:[]})},moveDown(h,v){if(v<0||v>=h.length-1)return h;let d=h[v+1];h[v+1]=h[v],h[v]=d}},template:`
    <cdx-dialog v-model:open="open" title="spiHelper Options" id="spiHelper-opts-dialog" close-button-label="Close">
      <template #header>
        <div class="cdx-dialog__header__title-group">
          <h2 class="cdx-dialog__header__title">
            spiHelper Options
          </h2>
        </div>
        <div>
          <cdx-button weight="quiet" type="button" aria-label="Give feedback" @click="launchFeedback">
            <cdx-icon :icon="icons.cdxIconFeedback" />
          </cdx-button>
          <cdx-button
              class="cdx-dialog__header__close-button"
              weight="quiet"
              type="button"
              aria-label="Close"
              @click="open = false"
          >
            <cdx-icon :icon="icons.cdxIconClose" />
          </cdx-button>
        </div>
      </template>
      <p>Configure your spiHelper options</p>
      <cdx-message v-if="showExtraMessage" type="success" :fade-in="true" :auto-dismiss="true" :display-time="3000">
        Debug menu enabled
      </cdx-message>
      <cdx-accordion :action-icon="icons.cdxIconWatchlist" :action-always-visible="true">
        <template #title>Watch</template>
        <watch-setting label="Cases" v-model="instanceSettings.watch.case" :reset-trigger="resetTrigger" />
        <watch-setting label="Archives" v-model="instanceSettings.watch.archive" :reset-trigger="resetTrigger" />
        <watch-setting label="Tagged Users" v-model="instanceSettings.watch.tagged" :reset-trigger="resetTrigger" />
        <watch-setting label="Categories" v-model="instanceSettings.watch.categories" :reset-trigger="resetTrigger" />
        <cdx-field>
          <template #label>Blocked Users</template>
          <cdx-toggle-switch v-model="instanceSettings.watch.blocked" />
          <template #help-text>Due to API limitations, only a toggle is available</template>
        </cdx-field>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconClock" :action-always-visible="true">
        <template #title>Expiry</template>
        <p>
          Expiry values may be relative (e.g. 5 months or 2 weeks) or absolute (e.g. 2014-09-18T12:34:56Z). For no
          expiry, use infinite, indefinite, infinity or never.
        </p>
        <expiry-setting label="Cases" v-model="instanceSettings.expiry.case" :reset-trigger="resetTrigger" />
        <expiry-setting label="Archives" v-model="instanceSettings.expiry.archive" :reset-trigger="resetTrigger" />
        <expiry-setting label="Tagged Users" v-model="instanceSettings.expiry.tagged" :reset-trigger="resetTrigger" />
        <expiry-setting label="Categories" v-model="instanceSettings.expiry.categories"
                        :reset-trigger="resetTrigger" />
        <expiry-setting label="Blocked Users" v-model="instanceSettings.expiry.blocked"
                        :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconJournal" :action-always-visible="true">
        <template #title>Log</template>
        <cdx-toggle-switch v-model="instanceSettings.log.enabled">
          Enabled
          <template #description>Log all actions to your userspace</template>
        </cdx-toggle-switch>
        <div v-if="instanceSettings.log.enabled">
          <log-page-setting v-model="instanceSettings.log.page" :prefix="logPrefix" />
          <br>
          <cdx-toggle-switch v-model="instanceSettings.log.reversed">
            Reverse log
            <template #description>Reverse said log, so that the newest actions are at the top</template>
          </cdx-toggle-switch>
          <p style="word-wrap: anywhere">
            Logging to [[<a :href="logPage">{{ logPrefix + instanceSettings.log.page }}</a>]]
          </p>
        </div>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconLayout" :action-always-visible="true">
        <template #title>Interface</template>
        <cdx-toggle-switch v-model="instanceSettings.interface.displayIPv6As64" :align-switch="true">
          Display IPv6 as /64
          <template #description>Default IPv6 listings to /64 in the block/tag socks menu</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.interface.fullPreview" :align-switch="true">
          Full preview
          <template #description>Include the entire section's text when previewing comments</template>
        </cdx-toggle-switch>
        <expiry-setting label="Default block duration" v-model="instanceSettings.interface.defaultBlockDuration"
                        :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconPalette" :action-always-visible="true">
        <template #title>Customisation</template>
        <div>
          <h3 style="padding-top: 0;">Comment templates</h3>
          <div class="spiHelper-template-container">
            <div v-for="(entry, i) in instanceSettings.custom.commentTemplates" :key="i" class="spiHelper-template">
              <div v-if="isMenuGroupData(entry)">
                <div class="spiHelper-template-input">
                  <cdx-text-input v-model="entry.label" placeholder="Group label" />
                  <cdx-button @click="moveDown(instanceSettings.custom.commentTemplates, i)"
                              aria-label="Move group down"
                              :disabled="instanceSettings.custom.commentTemplates.length <= i + 1">
                    <cdx-icon :icon="icons.cdxIconArrowDown" />
                  </cdx-button>
                  <cdx-button @click="entry.items.push({ label: '', value: '' })" action="progressive"
                              aria-label="Add item to group">
                    <cdx-icon :icon="icons.cdxIconAdd" />
                  </cdx-button>
                  <cdx-button @click="removeTemplateEntry(i)" action="destructive" aria-label="Delete group">
                    <cdx-icon :icon="icons.cdxIconTrash" />
                  </cdx-button>
                </div>
                <div v-for="(item, j) in entry.items" :key="j"
                     class="spiHelper-template-group-item spiHelper-template-input">
                  <cdx-text-input v-model="item.label" placeholder="Label" />
                  <page-lookup v-model="item.value" placeholder="Template (no brackets)" :namespace="10"
                               :validate-message="false" />
                  <cdx-button @click="moveDown(entry.items, j)" aria-label="Move item down"
                              :disabled="entry.items.length <= j + 1">
                    <cdx-icon :icon="icons.cdxIconArrowDown" />
                  </cdx-button>
                  <cdx-button @click="entry.items.splice(j, 1)" action="destructive" aria-label="Delete item">
                    <cdx-icon :icon="icons.cdxIconTrash" />
                  </cdx-button>
                </div>
              </div>
              <div v-else class="spiHelper-template-input">
                <cdx-text-input v-model="entry.label" placeholder="Label" />
                <page-lookup v-model="entry.value" placeholder="Template (no brackets)" :namespace="10"
                             :validate-message="false" />
                <cdx-button @click="moveDown(instanceSettings.custom.commentTemplates, i)" aria-label="Move item down"
                            :disabled="instanceSettings.custom.commentTemplates.length <= i + 1">
                  <cdx-icon :icon="icons.cdxIconArrowDown" />
                </cdx-button>
                <cdx-button @click="removeTemplateEntry(i)" action="destructive" aria-label="Delete item">
                  <cdx-icon :icon="icons.cdxIconTrash" />
                </cdx-button>
              </div>
            </div>
          </div>
        </div>

        <cdx-button @click="addTemplateEntry('item')" action="progressive">
          <cdx-icon :icon="icons.cdxIconAdd" />
          Add item
        </cdx-button>
        <cdx-button @click="addTemplateEntry('group')" action="progressive">
          <cdx-icon :icon="icons.cdxIconAdd" />
          Add group
        </cdx-button>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconCode" :action-always-visible="true" v-if="showExtra">
        <template #title>Debug</template>
        <cdx-toggle-switch v-model="instanceSettings.debug.enabled" :align-switch="true">
          Enabled
        </cdx-toggle-switch>
        <cdx-field v-if="instanceSettings.debug.enabled">
          <template #description>These will override your roles. For example, if you are an administrator and force
            admin is unchecked, spiHelper will not consider you as an admninistrator.
          </template>
          <cdx-toggle-switch v-model="instanceSettings.debug.forceCheckuser" :align-switch="true">
            Force CheckUser state
          </cdx-toggle-switch>
          <cdx-toggle-switch v-model="instanceSettings.debug.forceAdmin" :align-switch="true">
            Force Admin state
          </cdx-toggle-switch>
        </cdx-field>
      </cdx-accordion>
      <div class="spiHelper-setting">
        <cdx-toggle-switch v-model="instanceSettings.clerk" :align-switch="true">Clerk</cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.tickArchiveWhenCaseClosed" :align-switch="true">
          Archive closed by default
          <template #description>If the case is closed, enable archival by default</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-if="isCheckUser" v-model="instanceSettings.useCheckuserblockAccount" :align-switch="true">
          Use &#123;&#123;<a href="//en.wikipedia.org/wiki/Template:Checkuserblock-account">checkuserblock-account</a>&#125;&#125;
          when CU blocking
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.useLookup" :align-switch="true">
          Use lookups
          <template #description>Use the API to suggest autocompletions</template>
        </cdx-toggle-switch>
        <cdx-field>
          <cdx-multiselect-lookup
              v-model:input-chips="inputChipItems" v-model:selected="selectedChipItems"
              :menu-items="caseActionMenuItems">
            <template #no-results>
              No actions found
            </template>
          </cdx-multiselect-lookup>
          <template #label>
            Default actions
          </template>
          <template #description>
            Actions to have enabled by default when opening the form
          </template>
        </cdx-field>
        <cdx-toggle-switch v-model="instanceSettings.highlightSection" :align-switch="true">
          Highlight section
          <template #description>
            Highlight the selected SPI section to prevent editing the wrong one
          </template>
        </cdx-toggle-switch>
        <br>
        <cdx-button @click="loadDefaults">
          Load defaults
          <cdx-icon :icon="icons.cdxIconReload" />
        </cdx-button>
      </div>
    </cdx-dialog>
  `});function R0(){return{sections:{label:"Sections",selectionType:"both"},comment:{label:"Comment",selectionType:"section"},status:{label:"Case Status",selectionType:"section"},block:{label:p()?"Block/Tag Socks":"Tag Socks",selectionType:"both"},link:{label:"Generate Links",selectionType:"both"},management:{label:"SPI Management",selectionType:"case"},move:{label:{case:"Move/Merge Full Case",section:"Move Section"},selectionType:"both"},archive:{label:{case:"Archive Closed",section:"Archive"},selectionType:"both"}}}function P0(){return{sections:{enabled:!0,data:{section:null}},comment:{enabled:!1,data:{text:"* "}},status:{enabled:!1,data:{old:"",new:"nochange"}},block:{enabled:!1,data:r1(f.caseName)},link:{enabled:!1},management:{enabled:!1,data:{flags:new Set}},move:{enabled:!1,data:{target:"",suppress:!1}},archive:{enabled:!1}}}var H0=new Set(["status","management","comment","move","archive"]),a0=new Set(["move","archive","management"]),T0=new Set(["sections","move","archive","block","link"]),n2=new Set(["status","comment"]),r2=new Set(["management"]);var S0=b({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},emits:["actionToggled"],data(){return{accordionModel:!0}},computed:{allSelected(){return this.selection==="all"},showAccordion(){if(f.isArchive)return!H0.has(this.name);if(!m()&&a0.has(this.name))return!1;if(this.name==="sections")return!0;if(this.selection===null)return!1;if(this.selectionType==="both")return!0;return this.selectionType==="case"===this.allSelected},text(){if(typeof this.label==="string")return this.label;if(this.selectionType==="both")return this.allSelected?this.label.case:this.label.section;return"Unexpected configuration"},showEnabledClass(){return this.name!=="sections"&&this.actionEnabled}},template:`
    <cdx-accordion
        v-if="showAccordion"
        :name="name"
        :model-value="displayedForms.has(name)"
        @click.prevent="$emit('actionToggled')"
        :class="{'action-enabled': showEnabledClass}"
    >
      <template #title>{{ text }}</template>
      <slot />
    </cdx-accordion>
  `});var k0=b({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},computed:{buttonEnabled(){return this.displayedForms.has(this.name)||this.actionEnabled},allSelected(){return this.selection==="all"},showButton(){if(f.isArchive)return!H0.has(this.name);if(!m()&&a0.has(this.name))return!1;if(this.name==="sections")return!0;if(this.selection===null)return!1;if(this.selectionType==="both")return!0;return this.selectionType==="case"===this.allSelected},buttonAction(){return this.buttonEnabled?"progressive":"normal"},buttonStyle(){return{opacity:this.buttonEnabled?1:0.7,color:this.displayedForms.has(this.name)?"var(--color-base)":""}},text(){if(typeof this.label==="string")return this.label;if(this.selectionType==="both")return this.allSelected?this.label.case:this.label.section;return"Unexpected configuration"}},template:`
    <cdx-button
        v-if="showButton"
        :name="name"
        :action="buttonAction"
        :style="buttonStyle"
    >
      {{ text }}
    </cdx-button>
  `});var w0=b({props:{enabled:{type:Boolean,required:!0},empty:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:enabled"],template:`
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="enabled && !empty">
      <slot />
    </div>
  `});var n0=b({props:{name:{type:String,required:!0},caseActions:{type:Object,required:!0},accounts:{type:Array,required:!0},state:{type:Object,required:!0}},emits:["update-section-selection","update-status","user-selected","remove-rows","add-row","fetch-rows","move-entire-case"],computed:{caseName(){return f.caseName}},methods:{handleUpdateSectionSelection(h){this.$emit("update-section-selection",h)},handleUpdateStatus(h){this.$emit("update-status",h)},handleUserSelected(h,v){this.$emit("user-selected",h,v)},handleRemoveRows(h){this.$emit("remove-rows",h)},handleAddRow(h){this.$emit("add-row",h)},handleFetchRows(){this.$emit("fetch-rows")},handleMoveEntireCase(){this.$emit("move-entire-case")}},template:`
    <!-- Sections special case -->
    <section-action v-if="name === 'sections'"
                    :selected-section="caseActions.sections.data.section" :all-sections="state.sections"
                    @update-section-selection="handleUpdateSectionSelection" />
    <!-- Other actions -->
    <comment-action v-else-if="name === 'comment'" v-model:enabled="caseActions.comment.enabled"
                    v-model:text="caseActions.comment.data.text" :selected-section="state.selectedSection" />
    <change-status-action v-else-if="name === 'status'" v-model:enabled="caseActions.status.enabled"
                          :old-status="caseActions.status.data.old" v-model:new-status="caseActions.status.data.new"
                          @update:new-status="handleUpdateStatus" />
    <block-action v-else-if="name === 'block'" v-model:enabled="caseActions.block.enabled" fetch-type="comment"
                  v-model:block-options="caseActions.block.data.options" :accounts="accounts"
                  :default-master="caseActions.block.data.master"
                  :user-locks="caseActions.block.data.userLocks" :user-blocks="caseActions.block.data.userBlocks"
                  @user-selected="handleUserSelected"
                  @remove-rows="handleRemoveRows" @add-row="handleAddRow"
                  @fetch-rows="handleFetchRows" />
    <link-action v-else-if="name === 'link'" v-model:enabled="caseActions.link.enabled"
                 :accounts="accounts" :case-name="caseName"
                 @user-selected="handleUserSelected"
                 @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
    <management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
                       v-model:flags="caseActions.management.data.flags" />
    <move-action v-else-if="name === 'move'" v-model:enabled="caseActions.move.enabled"
                 v-model:target="caseActions.move.data.target" v-model:suppress="caseActions.move.data.suppress"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled"
                 @move-entire-case="handleMoveEntireCase" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="caseActions.sections.data.section"
                    :status-data="caseActions.status.data" />
  `});var g2=10;function L0(h,v){if(h.blockid!==void 0)v.block.block=!0;if(h.blocknocreate!==void 0)v.block.acb=h.blocknocreate;if(h.blockemail!==void 0)v.block.nem=h.blockemail;if(mw.util.isIPAddress(h.name)){if(h.blockanononly!==void 0)v.block.abao=h.blockanononly}else if(h.blockautoblocking!==void 0)v.block.abao=h.blockautoblocking;if(h.blockowntalk!==void 0)v.block.ntp=h.blockowntalk;if(h.blockexpiry)v.block.duration=h.blockexpiry}var q1=b({props:{modelValue:{type:String,required:!0},label:{type:String,required:!1,default:""},allowEmpty:{type:Boolean,default:!0}},emits:["update:modelValue","user-selected"],data(){return{lookupStatus:"default",messages:{success:"Valid user",warning:"User not found",error:"Field must not be empty"},selection:null,userSuggestions:[],menuConfig:{visibleItemLimit:6,searchQuery:""},useLookup:L.useLookup}},computed:{username:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}}},methods:{onUpdateInputValue(h){let v=h.trim();if(this.menuConfig.searchQuery=v,!v){this.userSuggestions=[];return}J0(v,g2).then((d)=>{if(this.username!==h&&this.username!==v)return;if(d.length===0){this.userSuggestions=[];return}this.userSuggestions=d.map((z)=>({label:z.name,value:z.userid.toString(),customData:z}))}).catch(()=>{this.userSuggestions=[]})},onLoadMore(){if(!this.username)return;J0(this.username,this.userSuggestions.length+g2).then((h)=>{if(h.length===0)return;this.userSuggestions=h.map((v)=>({label:v.name,value:v.userid.toString(),customData:v}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.username.length===0){this.lookupStatus=this.allowEmpty?"default":"error";return}if(mw.util.isIPAddress(this.username)){this.lookupStatus="default";return}let h=this.userSuggestions.find((v)=>v.label===this.username||v.label?.trim()===this.username.trim())??null;if(h!==null)this.$emit("user-selected",h.customData),this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null){let v=this.userSuggestions.find((d)=>d.value===h)??null;if(v)this.$emit("user-selected",v.customData);this.lookupStatus="success"}}},template:`
    <cdx-field :status="lookupStatus" :messages="messages" :hide-label="!label">
      <cdx-lookup
          v-if="useLookup"
          v-model:selected="selection"
          v-model:input-value="username"
          :menu-items="userSuggestions"
          :menu-config="menuConfig"
          placeholder="Sock"
          @update:input-value="onUpdateInputValue"
          @load-more="onLoadMore"
          @focus="onLoadMore"
          @update:selected="onSelection"
          @blur="validateInstantly"
          @keydown.enter="validateInstantly"
          @clear="validateInstantly"
          clearable
          class="user-lookup"
      >
        <template #no-results>
          No users found
        </template>
      </cdx-lookup>
      <cdx-text-input v-else v-model="username" placeholder="Sock" clearable class="user-lookup" />
      <template v-if="label" #label>
        {{ label }}
      </template>
    </cdx-field>
  `});async function b1(h){let{page:v,state:d}=h,z;if(v===f.pageName&&d)z=await S(d);else z=await Y(v,!1);if(z==="")return null;let c=l1(z).find((H)=>/SPI\s*archive notice/i.exec(H.name));if(!c)return console.error("Missing archive notice"),null;let V=c.positional[0]??c.params["1"];if(!V)return console.error("Invalid archive notice: Username missing"),null;let l={deny:!1,crosswiki:!1,notalk:!1,moot:!1};for(let[H,a]of Object.entries(c.params)){if(H==="1")continue;if(a!==!0){console.warn("Malformed archivenotice parameter",H,"=",a);continue}if(H in l)l[H]=!0;else console.warn("Unrecognised archivenotice parameter",H,"=",a)}return new R({username:V,...l})}function r0(h){let v=new Set;if(h===null)return v;if(h.deny)v.add("deny");if(h.moot)v.add("moot");if(h.notalk)v.add("notalk");if(h.crosswiki)v.add("crosswiki");return v}async function Z1(h){let{likelySocks:v,possibleSocks:d,allUsernames:z,userBlocks:M,userLocks:c,userTags:V,state:l}=h,H=new Set(v.map((q)=>q.id)),a=[...z].filter((q)=>!O(q)).map((q)=>`User:${q}`),[F,A]=await Promise.all([i1(z),D1(a)]),Z=z.size<7,X=[...v,...d].map(async(q)=>{let j=F.get(q.username);if(j!==void 0)M.set(q.username,j);let B=A.get(q.username),E=H.has(q.id),{userRow:r,isLocked:J}=await V0({userRow:q,block:j,defaultBlock:E,userPage:B,checkLock:Z,state:l});if(J!==null)c.set(q.username,J);return V.set(q.username,q.block.tags),r});return await Promise.all(X)}function D5(h){switch(h){case"CUrequest":return"{{CURequest}}";case"admin":return"{{awaitingadmin}}";case"clerk":return"{{Clerk Request}}";case"selfendorse":return"{{Requestandendorse}}";case"inprogress":return"{{Inprogress}}";case"decline":return"{{Decline}}";case"cudecline":return"{{Cudecline}}";case"endorse":return"{{Endorse}}";case"cuendorse":return"{{cu-endorsed}}";case"moreinfo":case"cumoreinfo":return"{{moreinfo}}";case"relist":return"{{relisted}}";case"hold":case"cuhold":return"{{onhold}}";case"reopen":return"{{reopen}}";case"checked":case"closed":return null;default:return console.warn("New case status",h,"is unexpected"),null}}function g0(h,v){let d=D5(v);if(d===null)return h;if(q0.test(h)){let z=h.replace(q0,d);if(!d)z=z.replace(/^(\s*\*\s*)? [-–] /,"$1");return z}else if(d)return"* "+d+" – "+h.replace(/^\s*\*\s*/,"");return h}function o2(h){if(c1.test(h))return"closed";if(/^open$/i.test(h))return"open";if(/^(?:inprogress|checking)$/i.test(h))return"inprogress";if(/^relist(ed)?$/i.test(h))return"relist";if(/^checked|completed$/i.test(h))return"checked";if(/^declined?$/i.test(h))return"decline";if(/^cudeclin(ed)?$/i.test(h))return"cudecline";if(/^endorsed?$/i.test(h))return"endorse";if(/^(?:CU|checkuser|CUrequest|request)$/i.test(h))return"CUrequest";if(/^cumoreinfo$/i.test(h))return"cumoreinfo";if(/^hold$/i.test(h))return"hold";if(/^cuhold$/i.test(h))return"cuhold";if(/^clerk$/i.test(h))return"clerk";if(/^admin$/i.test(h))return"admin";return"new"}async function x1(h){let v=new Date,d=v.toLocaleString("en",{month:"long"})+" "+v.toLocaleString("en",{year:"numeric"}),z="==\\s*"+d+"\\s*==",M=new RegExp(z,"i"),c=/==.*?==/i,V=h0(L.log.page),l=await Y(V,!1);if(!l.match(M))if(L.log.reversed){let H=c.exec(l);if(H?.index)l=l.slice(0,H.index)+"== "+d+` ==
`+l.slice(H.index)}else l+=`
== `+d+" ==";if(L.log.reversed){let H=c.exec(l);if(H?.index)l=l.slice(0,H.index+H[0].length)+`
`+h+l.slice(H.index+H[0].length)}else l+=`
`+h;await I({title:V,newText:l,summary:"Logging spihelper edits",createonly:!1,watch:"nochange"})}async function m5(h,v,d){let z=await B0(h),M=await B0(v),c=[];return d.types.forEach((V)=>{let l=z.find((a)=>a.type===V),H=M.find((a)=>a.type===V);if(l&&H){let a=H.expiry;if(H1(H.expiry)||H1(l.expiry))a="infinite";else if(H.expiry<l.expiry)a=l.expiry;let F=d.levels.indexOf(l.level),A=d.levels.indexOf(H.level),Z;if(F===-1||A===-1){console.error("Invalid protection information provided from API");return}else if(F>A)Z=l.level;else if(F<=A)Z=H.level;else return;c.push({type:l.type,expiry:a,level:Z})}else if(l)c.push(l);else if(H)c.push(H)}),c}async function p5(h,v,d){let z=await I0(h),M=await I0(v),c={level:""};if(z&&M){if(H1(z.protection_expiry)||H1(M.protection_expiry))c.expiry="infinite";else if(M.protection_expiry<z.protection_expiry)c.expiry=z.protection_expiry;else c.expiry=M.protection_expiry;let V=d.levels.indexOf(z.protection_level),l=d.levels.indexOf(M.protection_level);if(V===-1||l===-1)return console.error("Invalid protection information provided from API"),c;else if(V>l)c.level=z.protection_level;else if(V<=l)c.level=M.protection_level}else if(z)c={level:z.protection_level,expiry:z.protection_expiry};else if(M)c={level:M.protection_level,expiry:M.protection_expiry};return c}async function i2(h){let{target:v,suppress:d,archiveNotice:z}=h,M=f,c=new p1(f.pageName.replace(f.caseName,v)),V=await Y(c.pageName,!1);if(V)if(p()){if(!confirm("Target page exists, do you want to histmerge the cases?")){new y({type:"warning",content:"Aborted merge"}).show();return}}else{new y({type:"warning",content:"Target page exists and you are unable to histmerge, aborting merge"}).show();return}if(c.pageName===M.pageName){new y({type:"error",content:"Target page is the current page, aborting merge"}).show();return}let l=!1;if(V){let H=await Y(M.archiveName,!1),a=await Y(c.archiveName,!1);if(H&&a){new y({type:"notice",content:"Archives detected on both source and target cases, copying it manually."}).show(),H=H.replace(/^\s*__TOC__\s*$\n/gm,""),H=H.replace(V1,""),H=H.replace(T1,""),H=H.replace(/^\n*/,""),a+=`
`+H;let X=await e({content:a}),q=B1(a,X);if(q)a=X1(a,q),await I({title:c.archiveName,newText:a,summary:`Merging archives from [[${M.prefixedName}]], see page history for attribution`,createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive}),await s1(M.archiveName,"Deleting copied archive"),l=!0;else new y({type:"error",content:"Could not parse the archive. Please merge the archives manually"}).show()}let F=await j2(),A=await m5(M.pageName,c.pageName,F),Z=await p5(M.pageName,c.pageName,F);if(await s1(c.pageName,"Deleting as part of case merge"),await m1({sourcePage:M.pageName,destPage:c.pageName,summary:`Merging case to [[${c.prefixedName}]]`,ignoreWarnings:!0,suppressRedirect:d}),await W2(c.pageName,"Restoring page history after merge"),l)if(d)await s1(M.archiveName,`Archives moved to [[${c.archiveName}]]`);else await I({title:M.archiveName,newText:`#REDIRECT [[${c.archiveName}]]`,summary:"Redirecting old archive to new archive",createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive});if(A.length!==0){if(await K0(c.pageName,A),!d)await K0(M.pageName,A)}if(Z.level!==""){if(await D0(c.pageName,Z),!d)await D0(M.pageName,Z)}}else await m1({sourcePage:M.pageName,destPage:c.pageName,summary:`Moving case to [[${c.prefixedName}]]`,suppressRedirect:d&&G1(),ignoreWarnings:!1});await U5({oldContext:M,newContext:c,oldNotice:z,deleteOld:d,preMergeText:V})}async function s2(h,v){let d=new p1(f.pageName.replace(f.caseName,h)),z=await Y(d.pageName,!1),M=await K(v);if(M=M.replace(/\n*----(?!([\n.])*----)/,`
* {{clerknote}} originally filed under [[${f.pageName}]]. ~~~~
----`),z==="")z=`<noinclude>__TOC__</noinclude>
{{SPI archive notice|`+h+`}}
{{SPIpriorcases}}`;z+=`
`+M,d.edit({newText:z,summary:`Moving case section from [[${f.prefixedName}]], see page history for attribution`,createonly:!1,watch:L.watch.case,watchExpiry:L.expiry.case}),await f.edit({newText:"",summary:`Moving case section to [[${d.prefixedName}]]`,createonly:!1,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:f.startingRevId,sectionId:v.id})}async function U5(h){let{oldContext:v,newContext:d,oldNotice:z,deleteOld:M,preMergeText:c}=h,V=new R({username:d.caseName}),l=V.generateWikitext();V.crosswiki=z.crosswiki,V.deny=z.deny,V.notalk=z.notalk,V.moot=z.moot;let H=[],a=[v.pageName],F=null;while(a.length!==0){if(F=a.pop(),!F||F===d.pageName||F===v.pageName)continue;H.push(F);let q=await $2(F);for(let j of q){let B=await b1({page:j.title});if(!B)continue;if(B.username===F.replace(/Wikipedia:Sockpuppet investigations\//g,"")){if(I({title:j.title,newText:l,summary:"Updating backlink following page move",watch:L.watch.case,watchExpiry:L.expiry.case}),H.includes(j.title))a.push(j.title)}}}if(M){if(!G1())await v.edit({newText:`{{db-g6|rationale=Case moved to [[${d.pageName}]], requesting deletion as non-admin SPI clerk}}`,summary:"Requesting [[WP:G6|G6]] deletion after case move",createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive})}else await v.edit({newText:l,summary:"Updating old case following page move",watch:L.watch.case,watchExpiry:L.expiry.case});let A=await Y(d.pageName,!0);if(c){let q=c.replace(/\n*<noinclude>__TOC__.*\n/ig,"");q=q.replace(V1,""),q=q.replace(T1,""),A=A+`
`+q}A=A.replace(V1,V.generateWikitext()),A=A.replace(l2,`====Suspected sockpuppets====
* {{checkuser|1=`+v.caseName+`}} ({{clerknote}} original case name)
`);let Z="(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?"+d.caseName+"(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)",X=new RegExp(Z,"sm");A=A.replace(X,`$1
$2`),await d.edit({newText:A,summary:"Updating new case following page move",watch:L.watch.case,watchExpiry:L.expiry.case})}function t2(h){return I({title:h,newText:"{{sockpuppet category}}",summary:U1("Creating sockpuppet category"),createonly:!0,watch:L.watch.categories,watchExpiry:L.expiry.categories})}function G5(h,v){if(h.length!==v.length)return!1;let d=Array(v.length).fill(!1);for(let z of h){let M=!1;for(let c=0;c<v.length;c++){let V=v[c];if(!V)continue;if(!d[c]&&z.equals(V)){d[c]=!0,M=!0;break}}if(!M)return!1}return!0}function E5(h,v){let d=/\n?\{\{\s*sock\w*\b[\s\S]*?}}/gi,z=[...h.matchAll(d)];if(z.length===0)return v;let M=z[0];if(!M)return v;let c=M[0];return h=h.replace(c,v),z.slice(1).forEach((V)=>{let l=V[0];h=h.replace(l,"")}),h}async function e2(h){let{sock:v,pageText:d,blocked:z,tagNonLocalAccounts:M}=h;if(O(v.username))return!1;let c=await f1(v.username);if(!c)return new y({type:"warning",content:`The account ${v.username} does not exist and so has not been tagged`}).show(),!1;if(!M&&!c.existsLocally)return new y({type:"warning",content:`The account ${v.username} does not exist locally and so has not been tagged`}).show(),!1;v.block.tags.forEach((A)=>{A.locked=c.locked});let V=g1(d),l=v.block.tags.reduce((A,Z)=>{let X=n(Z)&&!Z.master,q=A.some((j)=>j.equals(Z));if(!X&&!q)A.push(Z);return A},[]);if(G5(V,l)){let A=C(`User:${v.username}`);return new y({type:"notice",content:`Tags are unmodified, skipping ${A}`,isHtml:!0}).show(),!1}let H=l.map((A)=>A.generateWikitext(z)).join(`
`),a=E5(d,H),F=V.length<l.length?"Adding":"Updating";return I({title:`User:${v.username}`,newText:a,summary:U1(`${F} sockpuppetry tag`),createonly:!1,watch:L.watch.tagged,watchExpiry:L.expiry.tagged}).then((A)=>A!==null)}function O5(h){let v=new Map;function d(z){if(!v.has(z))v.set(z,{confirmed:!1,suspected:!1});return v.get(z)??{confirmed:!1,suspected:!1}}for(let z of h)for(let M of z.block.tags){if(a1(M))continue;let c=d(M.master);if(M.status==="proven"||M.status==="confirmed")c.confirmed=!0;if(M.status==="blocked")c.suspected=!0;if(M.altmaster){let V=d(M.altmaster);if(M.altmasterStatus==="proven")V.confirmed=!0;if(M.altmasterStatus==="suspected")V.suspected=!0}}return v}async function h5(h){let v=new Map,d=O5(h);for(let[z,{confirmed:M,suspected:c}]of d){if(!z)continue;let V=!1;if(M){let l=`Category:Wikipedia sockpuppets of ${z}`;if(!await Y(l,!1))await t2(l),V=!0}if(c){let l=`Category:Suspected Wikipedia sockpuppets of ${z}`;if(!await Y(l,!1))await t2(l),V=!0}v.set(z,V)}return v}function C5(h){let{sock:v,noticeType:d,sockmaster:z,cuBlock:M}=h,c,V=d==="sock";if(V&&z&&v.username===P(z))V=!1;if(V)c=`== Blocked as a sockpuppet ==
`;else c=`== Blocked for sockpuppetry ==
`;if(M)c+="{{checkuserblock-account|sig=~~~~";else c+="{{subst:uw-sockblock|sig=yes";if(f.valid)c+="|spi="+f.caseName;if(Z0(v.block.duration))c+="|indef=yes";else if(c+="|time="+v.block.duration,M)c+="|indef=no";if(v.block.ntp)c+="|notalk=yes";if(V&&z)c+="|master="+z;return c+="}}",c}function x5(h,v,d,z){let M="Abusing [[WP:SOCK|multiple accounts]]";if(f.valid)M+=`: Please see: [[${f.prefixedName}]]`;if(D()&&h.cuBlock){let c=v?"{{checkuserblock}}":"{{checkuserblock-account}}";if(h.cuBlockOnly)M=c;else M=c+": "+M}else if(d){if(M=`{{rangeblock|1=${M}`,!z)M+="|create=yes";M+="}}"}return M}async function v5(h){let{sock:v,blockOptions:d}=h,z=mw.util.isIPAddress(v.username,!0),M=z&&!mw.util.isIPAddress(v.username,!1),c=x5(d,z,M,v.block.acb);return await Q2({user:v.username,duration:v.block.duration,reason:c,reblock:d.override,anononly:z?v.block.abao:!1,accountcreation:v.block.acb,autoblock:z?!1:v.block.abao,notalkpage:v.block.ntp,noemail:v.block.nem,watchBlockedUser:L.watch.blocked,watchExpiry:L.expiry.blocked})}async function z5(h){let{sock:v,blockOptions:d,userTalkContent:z,talkNotices:M,defaultMaster:c}=h;if(M.length===0)return;let V=v.block.tags.find((F)=>n(F))?.master??c,l=d.cuBlock&&D()&&L.useCheckuserblockAccount,H=`User talk:${v.username}`,a=d.blankTalk?"":z??"";for(let F of M)a+=`
`+C5({sock:v,noticeType:F,sockmaster:V,cuBlock:l});await I({title:H,newText:a,summary:U1("Adding sockpuppetry block notice"),createonly:!1,watch:"nochange"})}async function o0(h){let v=new y({type:"notice",content:"Loading all sections"}).show(),d=S(h),z=(await Promise.all(h.sections.map(async(q)=>{let j=await K(q),B=w.exec(j);if(!B?.[1])return null;return c1.test(B[1])?q:null}))).filter((q)=>q!==null),M=await d;if(v.update({type:"success",content:"All sections loaded"}),z.length===0){new y({type:"warning",content:"Nothing to archive"}).show();return}let c=await Y(f.archiveName,!0);if((await m0(f.pageName)+await m0(f.archiveName))/f2()>=1){let q=0;while(c!=="")c=await Y(`${f.archiveName}/${++q}`,!0);let j=`${f.archiveName}/${q}`;await m1({sourcePage:f.archiveName,destPage:j,summary:"Moving archive to avoid exceeding post expand size limit",ignoreWarnings:!1,moveSubpages:!1})}let l=c!=="";if(l)c=c.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);else c=`__TOC__
{{SPI archive notice|1=${f.caseName}}}
{{SPIpriorcases}}
`;let H=l?await e({pageName:f.archiveName}):[],a=B1(c,H);if(!a){new y({type:"notice",content:"Failed to parse existing archive sections, aborting archival"}).show();return}let F=0;for(let q of z){let j=await K(q);M=M.replace(j+`
`,"").replace(j,"");let B=j.slice(j.search(t)).replace(w,"");if(c.includes(B)){new y({type:"warning",content:`Section ${q.name} already exists in the archive`}).show();continue}let E=n1(q.name);if(!E){new y({type:"error",content:`Failed to parse date from section header "${q.name}", aborting archival`}).show();return}a.push({header:E,fullText:B}),F++}if(F===0){new y({type:"warning",content:"Nothing to archive"}).show();return}c=X1(c,a);let A=F>1,Z=`Archiving ${F} section${A?"s":""}`;if(await I({title:f.archiveName,newText:c,summary:`${Z} from [[${f.prefixedName}]]`,watch:L.watch.archive,watchExpiry:L.expiry.archive})===null){new y({type:"error",content:"Failed to update archive, not removing sections from case page"}).show();return}await f.edit({newText:M,summary:`${Z} to [[${_1()}${f.archiveName}]]`,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:f.startingRevId})}async function d5(h){let v=await K(h);v=v.replace(w,"");let d=await Y(f.archiveName,!0),z=new y({type:"error",content:""});if(d.includes(v)){z.type="warning",z.content="Looks like the page has been archived already",z.show();return}if(d==="")d=`__TOC__
{{SPI archive notice|1=`+f.caseName+`}}
{{SPIpriorcases}}
`;else d=d.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);let M=new y({type:"notice",content:"Loading archive sections"}).show(),c=await e({pageName:f.archiveName}),V=B1(d,c);if(V){M.update({type:"success",content:"Archive sections loaded"});let H=n1(h.name);if(!H){new y({type:"error",content:`Failed to parse date from section header '${h.name}'`}).show();return}V.push({header:H,fullText:v})}else{M.update({type:"error",content:"Failed to parse existing archive sections, aborting archival"});return}if(d=X1(d,V),await I({title:f.archiveName,newText:d,summary:`Archiving case section from [[${f.prefixedName}]]`,createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive})===null){z.content="Failed to update archive, not removing section from case page",z.show();return}await f.edit({newText:"",summary:`Archiving case section to [[${_1()}${f.archiveName}]]`,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:f.startingRevId,sectionId:h.id})}async function N5(h){return(await Promise.all(h.map(async(d)=>(await f1(d))?.locked?null:d))).filter((d)=>d!==null)}var u5=6;async function M5(h){let{master:v,hideNames:d}=h,z=h.lockTargets.length<u5?await N5(h.lockTargets):h.lockTargets;if(z.length===0)return[];let M,c=z.length>1;if(!c&&z[0])M=`* {{LockHide|1=${z[0]}}}`;else{if(M="{{MultiLock",z.forEach((Z,X)=>{M+=`|${X+1}=${Z}`}),d)M+="|hidename=1";M+="}}"}let V,l="Global lock for ";if(d||!v)V=c?`${z.length} sockpuppets`:"a sockpuppet",l+=V;else V=`${z.length} [[Special:CentralAuth/${v}|${v}]] ${c?"socks":"sock"}`,l+=`${z.length} ${v} ${c?"socks":"sock"}`;let H=h.lockComment.trim().replace(/\.+$/,""),a=`=== Global lock for ${V} ===`;if(a+=`
{{status}}`,a+=`
${M}`,a+=`
${c?"Sockpuppets":"Sockpuppet"} found in enwiki sockpuppet investigation`,f.valid)a+=`, see [[${f.prefixedName}]].`;else a+=".";if(H!=="")a+=` ${H}.`;a+=" ~~~~";let F=await Y("meta:Steward requests/Global",!1);F=F.replace(/\n+(== See also == *\n)/,`

`+a+`

$1`),new y({type:"notice",content:"Filing global lock request"}).show();let A=await I({title:"meta:Steward requests/Global",newText:F,summary:`Global lock request for ${V}`,createonly:!1,watch:"nochange"});if(A){let Z=C(`meta:Special:Diff/${A}#${l}`,"filed");new y({type:"success",content:`Global lock request ${Z} successfully!`,isHtml:!0}).show()}else new y({type:"warning",content:"Global lock request failed."}).show();return z}async function c5(h){U("oneClickArchive"),new y({type:"notice",content:"Starting OCA"}).show();let v=await S(h,{show:!0,purge:!0});if(!t.test(v)){new y({type:"notice",content:"Looks like the page has been archived already"}).show(),_("oneClickArchive","success");return}await F1(h),await o0(h);let d=`* [[${f.pageName}]]: used one-click archiver ~~~~~`;if(L.log.enabled)await x1(d);new y({type:"notice",content:"Refreshing data"}).show(),await f.refreshRevId(),await F1(h),new y({type:"success",content:"Done!"}).show(),_("oneClickArchive","success")}async function V5(h){let{actions:v,accounts:d,state:z}=h;if(Object.values(v).every((J)=>!J.enabled)){new y({type:"warning",content:"No actions are enabled"}).show();return}if(!z.selectedSection){console.error("spiHelperPerformActions: Expected a selected section, got null"),new y({type:"error",content:"Expected a selected section, got null"}).show();return}if(!z.archiveNotice){console.error("spiHelperPerformActions: Could not find archive notice"),new y({type:"error",content:"Could not find archive notice"}).show();return}if(!v.block.data.master){console.error("spiHelperPerformActions: Could not get master"),new y({type:"error",content:"Could not get master"}).show();return}let M=z.selectedSection.type;new y({type:"notice",content:"Running actions"}).show();let c=[],V=`* [[${f.pageName}]]`;if(z.selectedSection.type==="specific")V+=` (section ${z.selectedSection.section.name})`;else V+=" (full case)";V+=" ~~~~~";let l=await(M==="specific"?K(z.selectedSection.section):S(z));if(!l){new y({type:"error",content:"Could not fetch text for the page"}).show();return}let H=l,a=[],F=[],A=[],Z=Promise.resolve([]);if(v.block.enabled)({blockPromises:a,tagPromises:F,talkNoticePromises:A,lockPromise:Z}=await i0({accounts:d,blockData:v.block.data}));let X=Promise.all([Promise.all(a),Promise.all(F),Z]),q=Promise.all(A);if(!f.isArchive){if(M==="specific"){if(w.exec(l)===null)l=l.replace(/^(\s*===.*===[^\S\r\n]*)/,`$1
{{SPI case status|}}`),v.status.data.old="new";if(v.status.data.new==="nochange")v.status.data.new=v.status.data.old;if(v.status.enabled&&v.status.data.new!==v.status.data.old){let x=P5(v.status.data.new,l);if(l=x.targetText,x.newStatus!=="nochange")c.push(x.summaryItem),V+=`
** changed case status from ${v.status.data.old} to ${x.newStatus}`}if(v.comment.enabled&&v.comment.data.text.trim()!=="*")l=R5(l,v.comment.data.text),c.push("comment"),V+=`
** commented`}else if(v.management.enabled){let J=v.management.data.flags;z.archiveNotice=new R({username:z.archiveNotice.username||f.caseName,deny:J.has("deny"),crosswiki:J.has("crosswiki"),notalk:J.has("notalk"),moot:J.has("moot")});let x=z.archiveNotice.generateWikitext();l=l.replace(V1,x),c.push("update archivenotice"),V+=`
** Updated archivenotice`}}if(c.length===0)c.push("Saving page");let j=v.move.enabled||v.archive.enabled;if(!f.isArchive&&l!==H){let J=z.selectedSection.type==="all"?null:z.selectedSection.section.id,x=T5(c),W=await f.edit({newText:l,summary:x,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:f.startingRevId,sectionId:J});if(W===null){if(new y({type:"error",content:"Failed to save edit"}).show(),!j)await f.refreshRevId()}else{if(z.selectedSection.type==="specific"){if(z.selectedSection.section._text=l,z._text)z._text=z._text.replace(H,l)}else z._text=l;f.startingRevId=W}}if(v.archive.enabled)switch(z.selectedSection.type){case"all":{V+=`
** Archived case`,await o0(z);break}case"specific":{V+=`
** Archived section`,await d5(z.selectedSection.section);break}}else if(v.move.enabled){let J=P(v.move.data.target);if(J)switch(z.selectedSection.type){case"all":{V+=`
** moved/merged case to `+J,await i2({target:J,suppress:v.move.data.suppress,archiveNotice:z.archiveNotice});break}case"specific":{V+=`
** moved section to `+J,await s2(J,z.selectedSection.section);break}}}let[B,E,r]=await X;if(await q,L.log.enabled)V+=w1({blockedUsers:B,taggedUsers:E,lockedUsers:r}),await x1(V);if(j){if(v.move.enabled&&z.selectedSection.type==="all")await F1(z);if(z.selectedSection.type==="specific")z.selectedSection=null;await f.refreshRevId()}new y({type:"success",content:"Done!"}).show()}function R5(h,v){if(!h.includes(`
----`))h.replace(/<!-+ All comments go ABOVE this line, please. -+>/,""),h+=`
----<!-- All comments go ABOVE this line, please. -->`;if(v=k1(v.trimEnd()),m()||p())return h.replace(/\n*----(?!.*----)/s,`
${v}
----`);else return h.replace(Y1,`
`+v+`

====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====
`)}function P5(h,v){let d="";switch(h){case"reopen":h="open",d="Reopening";break;case"open":d="Marking request as open";break;case"CUrequest":d="Adding checkuser request";break;case"admin":d="Requesting admin action";break;case"clerk":d="Requesting clerk action";break;case"selfendorse":h="endorse",d="Adding checkuser request (self-endorsed for checkuser attention)";break;case"checked":d="Marking request as checked";break;case"inprogress":d="Marking request in progress";break;case"decline":d="Declining checkuser";break;case"cudecline":d="CU declining checkuser";break;case"endorse":d="Endorsing for checkuser attention";break;case"cuendorse":d="CU endorsing for checkuser attention";break;case"moreinfo":case"cumoreinfo":d="Requesting additional information";break;case"relist":d="Relisting case for another check";break;case"hold":d="Putting case on hold";break;case"cuhold":d="Placing checkuser request on hold";break;case"closed":d="Closing case";break;case"nochange":break;default:console.error("Unexpected case status value",h)}let z=w.exec(v);if(z?.[0])v=v.replace(z[0],`{{SPI case status|${h}}}`);return{newStatus:h,summaryItem:d,targetText:v}}async function i0(h){let v=[],d=[],z=[],M=Promise.resolve([]),{userLocks:c,options:V,lockcomment:l,master:H,skipCUVerifyUsers:a}=h.blockData,F=h.accounts.filter((W)=>W.username!==""),A=[];await h5(F);let Z=p()&&!V.noBlock,{allUsernames:X,allUserPages:q,allUserTalkPages:j}=F.reduce((W,k)=>{return W.allUsernames.add(k.username),W.allUserPages.push(`User:${k.username}`),W.allUserTalkPages.push(`User talk:${k.username}`),W},{allUsernames:new Set,allUserPages:[],allUserTalkPages:[]}),B=new y({type:"notice",content:"Fetching user blocks and tags"}).show(),[E,r,J]=await Promise.all([i1(X),D1(q),D1(j)]);B.update({type:"success",content:"Got previous blocks and tags"});let x=async(W,k)=>{return await e2({sock:W,pageText:r.get(W.username)??"",blocked:k,tagNonLocalAccounts:V.tagUnattached})?W.username:null};for(let W of F){if(W.block.lock&&!O(W.username)){if(c.get(W.username)!==!0)A.push(W.username)}if(Z&&W.block.block){let k=[];if(V.addMasterNotice&&(W.block.tags.some((R1)=>a1(R1))||W.username===H))k.push("master");else if(V.addSockNotice)k.push("sock");let V2=Math.max(500,F.length*100);v.push((async()=>{let R1=E.get(W.username);if(R1!==void 0&&!V.override){let s=new y({type:"warning",content:`Block target ${W.username} is already blocked. `});if(W.block.tags.length>0)s.content+="Proceeding with tagging",d.push(x(W,!0));else s.content+='Check the "override existing blocks" box to re-block them';return s.show(),null}let y0=R1?.reason;if(!D()&&!a.has(W.username)&&V.override&&y0&&P1.exec(y0)){let s="User "+W.username+` is CheckUser-blocked, are you SURE you want to re-block them?
Current block message:
`+y0;if(!confirm(s))return null}if(!W.block.duration)return new y({type:"error",content:`Block target ${W.username} does not have an intended duration`}).show(),null;if(await new Promise((s)=>setTimeout(s,Math.random()*V2)),!await v5({sock:W,blockOptions:V}))return null;if(k.length>0)z.push(z5({sock:W,userTalkContent:J.get(W.username),blockOptions:V,talkNotices:k,defaultMaster:H}));if(W.block.tags.length>0)d.push(x(W,!0));return W.username})())}else if(W.block.tags.length>0)d.push(x(W,E.has(W.username)))}if(A.length>0){let W=V.lockHideNames;M=M5({lockTargets:A,hideNames:W,master:H,lockComment:l})}return{blockPromises:v,tagPromises:d,talkNoticePromises:z,lockPromise:M}}function T5(h){let[v,...d]=h;if(!v)return"";let z=v.charAt(0).toUpperCase()+v.slice(1),M=d.length?`, ${d.join(", ")}`:"";return z+M}function S5(h){let v=$(`a[href$="section=${h}"]`).first();if(v.length===0)return null;let d=v.parentsUntil(":has(hr)").last().nextUntil("hr");return d.length>0?d:null}function l5(h){let v=$(`a[href$="section=${h}"]`).first();if(v.length===0)return null;let d=v.closest(".mw-heading");return d.length>0?d.get(0)??null:null}function H5(h){let v=l5(h);if(v)v.scrollIntoView({behavior:"smooth",block:"center"})}function a5(){return document.querySelector("#mw-content-text .mw-parser-output")}function k5(h){let v=a5(),d=l5(h);if(!v||!d)return null;let M=S5(h)?.last().get(0)??d,c=v.getBoundingClientRect(),V=d.getBoundingClientRect(),l=M.getBoundingClientRect(),H=Math.min(V.top,l.top)-c.top+v.scrollTop,a=Math.max(V.bottom,l.bottom)-c.top+v.scrollTop;return{top:H,height:Math.max(1,a-H)}}function w5(){let h=a5();if(!h)return null;let v=document.createElement("div");return v.style.display="none",v.className="spiHelper-section-overlay",h.appendChild(v),v}function n5(h,v,d){let z=k5(v);if(!h||!z)return;h.style.top=`${Math.max(0,z.top)}px`,h.style.height=`${z.height+8}px`,h.style.display="block",h.classList.toggle("spiHelper-section-overlay--preview",d==="preview"),h.classList.toggle("spiHelper-section-overlay--selected",d==="selected")}function L5(h,v){let d=/v-\d+-(\d+)/.exec(h.id);if(d===null||d.length<2)return null;let z=Number(d[1]),M=v[z-1];if(!M||M.value==="all")return null;return typeof M.value==="number"?M.value:null}var f0=null;function r5(){return f0??=w5(),f0}function F0(h,v){let d=r5();n5(d,h,v)}function N1(){if(f0)f0.style.display="none"}var s0=b({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0}},data(){let h=R0(),v=Object.keys(h);return{open:!1,handlers:{openHandler:null,beforeUnloadHandler:null},actionsRunning:!1,displayedForms:new Set(["sections"]),unpinned:!L.interface.pinned,buttonLayout:L.interface.buttonLayout,actionButtons:h,actionButtonKeys:v,sectionAccountNames:new Set,caseActions:P0(),accounts:[],messages:N,icons:{cdxIconPushPin:z0,cdxIconCollapse:O2,cdxIconExpand:x2,cdxIconFeedback:y1}}},computed:{allDisabled(){for(let[h,v]of Object.entries(this.caseActions)){if(h==="sections"||h==="link")continue;if(v.enabled)return!1}return!0},selectedSection(){return this.state.selectedSection},archiveNotice(){return this.state.archiveNotice},stateSections(){return this.state.sections},mountPoint(){return this.$el.parentElement}},watch:{unpinned(h){if(!this.mountPoint){console.error("TopViewComponent unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");L.interface.pinned=!h},async open(h){if(h)await this.ensureArchiveNotice(),this.syncSelectedSectionOverlay();else this.syncSelectedSectionOverlay(),o()},async stateSections(h){if(this.caseActions.sections.data.section===null){let v=h[0];if(v)this.caseActions.sections.data.section=v.id,await this.ensureArchiveNotice(),await this.loadNewSection(v),this.syncSelectedSectionOverlay();else await this.onUpdateSectionSelection("all")}},archiveNotice(h){this.caseActions.management.data.flags=r0(h)},"caseActions.sections.data.section"(h,v){if(h===v)return;for(let[d,z]of Object.entries(this.caseActions)){let M=d;if(M==="sections")continue;let c=L.defaultActions.includes(M);if(z.enabled=c,c&&(T0.has(M)||h==="all"&&r2.has(M)||typeof h==="number"&&n2.has(M)))this.displayedForms.add(M)}}},mounted(){if(!this.mountPoint){console.error("TopViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.handlers.beforeUnloadHandler=(h)=>{let v=o1("mainActions");if(!this.allDisabled&&v!=="success")h.preventDefault()},this.handlers.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"top"}),this.handlers.beforeUnloadHandler)window.addEventListener("beforeunload",this.handlers.beforeUnloadHandler)}else if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler)},this.openButton.addEventListener("click",this.handlers.openHandler)},beforeUnmount(){if(this.handlers.openHandler)this.openButton.removeEventListener("click",this.handlers.openHandler);if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler)},methods:{syncSelectedSectionOverlay(){if(!L.highlightSection||!this.open){N1();return}let h=this.state.selectedSection;if(h?.type!=="specific"){N1();return}F0(h.section.id,"selected")},toggleButtonLayout(){this.buttonLayout=!this.buttonLayout,L.interface.buttonLayout=this.buttonLayout},onActionClick(h,v){let d=v;if(h.ctrlKey||h.metaKey)if(this.displayedForms.has(d))this.displayedForms.delete(d);else this.displayedForms.add(d);else this.displayedForms=new Set([d])},onAccordionToggle(h){let v=h;if(this.displayedForms.has(v))this.displayedForms.delete(v);else this.displayedForms.add(v)},isVisible(h){return this.displayedForms.has(h)},async onUpdateSectionSelection(h){if(h===null)return;if(this.caseActions.sections.data.section=h,(this.state.selectedSection?.type??null)!==(h==="all"?"all":"specific"))this.displayedForms=new Set(Array.from(this.displayedForms).filter((M)=>T0.has(M)));if(h==="all"){this.state.selectedSection={type:"all"},this.loadSectionAccounts(this.state.selectedSection);return}let z=this.state.sections.find((M)=>M.id===h);if(z===void 0){console.error("onUpdateSectionSelection: Could not find target section with ID",h);return}await this.loadNewSection(z)},async loadNewSection(h){this.state.selectedSection={type:"specific",section:h};let v=await K(h),d=w.exec(v),z=o2(d?.[1]??"");if(this.caseActions.status.data.old=z,this.caseActions.status.data.new=z,z==="closed"&&L.tickArchiveWhenCaseClosed)this.caseActions.archive.enabled=!0;this.loadSectionAccounts(this.state.selectedSection)},async loadSectionAccounts(h){this.accounts=this.accounts.filter((V)=>!this.sectionAccountNames.has(V.username));let v=await(h.type==="all"?S(this.state):K(h.section)),[d,z,M]=E1({text:v,fullSearch:!0,state:this.state}),c=await Z1({likelySocks:d,possibleSocks:z,allUsernames:M,userBlocks:this.caseActions.block.data.userBlocks,userLocks:this.caseActions.block.data.userLocks,userTags:this.caseActions.block.data.userTags,state:this.state});this.sectionAccountNames=new Set(this.massAddUserRows(c).map((V)=>V.username))},onUpdateNewStatus(h){this.caseActions.comment.data.text=g0(this.caseActions.comment.data.text,h)},async onSubmitActions(){if(L1("mainActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"top"}),U("mainActions"),this.actionsRunning=!0,await V5({actions:this.caseActions,accounts:this.accounts,state:this.state}),_("mainActions","success"),this.actionsRunning=!1},handleFetchRows(){let[h,v]=E1({text:this.caseActions.comment.data.text,fullSearch:!1,state:this.state}),d=new Set(h),z=[...h,...v].map((M)=>O1({userRow:M,defaultBlock:d.has(M)}));this.massAddUserRows(z)},handleUserSelected(h,v){let d=this.accounts.find((z)=>z.id===v);if(!d)return;if(h.blockid!==void 0&&!this.caseActions.block.data.userBlocks.has(d.username)){let z=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.caseActions.block.data.userBlocks.set(d.username,{username:d.username,duration:h.blockexpiry??"",abao:z??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}L0(h,d)},handleAddRow(h){h??=v1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((v)=>!h.includes(v.id))},massAddUserRows(h){let v=this.accounts.at(-1)?.username==="",d=new Set(this.accounts.map((M)=>M.username)),z=h.filter((M)=>!d.has(M.username));if(v)z.forEach((M)=>{this.accounts.splice(this.accounts.length-1,0,M)});else this.accounts=this.accounts.concat(z);return z},async ensureArchiveNotice(){if(this.state.archiveNotice)return;let h=await b1({page:f.casePageName,state:this.state});if(h===null)this.state.archiveNotice=new R({username:f.caseName}),new y({type:"warning",content:"Can't find archivenotice template! Automatically adding the archive notice to the page."}).show(),mw.notify("Can't find archivenotice template! If this is incorrect, please contact DatGuy",{type:"warn"}),console.warn("archivenoticeResult is null");else this.state.archiveNotice=h},launchFeedback(){this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`SPI form v${T}-${G}`})},async handleMoveEntireCase(){await this.onUpdateSectionSelection("all"),this.caseActions.move.enabled=!0}},template:`
    <div id="spiHelper-topView" class="spiHelper-mainCard" v-if="open" @keydown.ctrl.enter.capture.prevent="$refs.submitForm?.onSubmit?.()">
      <div id="spiHelper-topView-Header" class="spiHelper-mainCard-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="launchFeedback">
            <cdx-icon :icon="icons.cdxIconFeedback" />
          </cdx-button>
          <cdx-button aria-label="Toggle layout" weight="quiet" @click="toggleButtonLayout">
            <cdx-icon :icon="buttonLayout ? icons.cdxIconExpand : icons.cdxIconCollapse" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="icons.cdxIconPushPin" />
          </cdx-button>
        </div>
      </div>
      <div id="spiHelper-topView-Action" v-if="buttonLayout">
        <div id="buttonRow">
          <action-button
              v-for="[name, button] of Object.entries(actionButtons)"
              :key="name"
              :name="name"
              :label="button.label"
              :selection-type="button.selectionType"
              :selection="caseActions.sections.data.section"
              :displayedForms="displayedForms"
              :actionEnabled="caseActions[name].enabled"
              @click="onActionClick($event, name)"
          />
        </div>
        <div id="contentRow">
          <div v-for="name of actionButtonKeys"
               :key="name"
               :class="{ 'is-visible': isVisible(name) }">
            <action-content
                :name="name"
                :case-actions="caseActions"
                :accounts="accounts"
                :state="state"
                @update-section-selection="onUpdateSectionSelection"
                @update-status="onUpdateNewStatus"
                @user-selected="handleUserSelected"
                @remove-rows="handleRemoveRows"
                @add-row="handleAddRow"
                @fetch-rows="handleFetchRows"
                @move-entire-case="handleMoveEntireCase"
            />
          </div>
        </div>
      </div>
      <div id="spiHelper-topView-Accordion" v-else>
        <action-accordion
            v-for="[name, button] of Object.entries(actionButtons)"
            :key="name"
            :name="name"
            :label="button.label"
            :selection-type="button.selectionType"
            :selection="caseActions.sections.data.section"
            :displayedForms="displayedForms"
            :actionEnabled="caseActions[name].enabled"
            @action-toggled="onAccordionToggle(name)"
        >
          <action-content
              :name="name"
              :case-actions="caseActions"
              :accounts="accounts"
              :state="state"
              @update-section-selection="onUpdateSectionSelection"
              @update-status="onUpdateNewStatus"
              @user-selected="handleUserSelected"
              @remove-rows="handleRemoveRows"
              @add-row="handleAddRow"
              @fetch-rows="handleFetchRows"
              @move-entire-case="handleMoveEntireCase"
          />
        </action-accordion>
      </div>
      <submit-form v-if="caseActions.sections.data.section !== null" :accounts="accounts"
                   v-model:lock-comment="caseActions.block.data.lockcomment"
                   v-model:skipCUVerifyUsers="caseActions.block.data.skipCUVerifyUsers"
                   :case-actions="caseActions" :state="state"
                   :all-disabled="allDisabled" :action-name="'mainActions'" :check-conflict="true"
                   @on-submit="onSubmitActions" ref="submitForm" />
      <cdx-progress-bar v-if="actionsRunning" aria-label="Actions in progress" style="margin-top: 20px;" />
      <div id="messageRow">
        <cdx-message v-for="(message, index) in messages" :key="index" :type="message.type" :fade-in="true"
                     :allow-user-dismiss="true">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </div>
  `});var t0=b({props:{enabled:{type:Boolean,required:!0},selection:{type:Object,required:!0},statusData:{type:Object,required:!0}},emits:["update:enabled"],computed:{badStatus(){return this.selection!=="all"&&this.status!=="closed"},status(){switch(this.statusData.new){case"nochange":return this.statusData.old;case"selfendorse":return"endorse";default:return this.statusData.new}}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus" type="warning" :inline="true">
      The selected section status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
  `});var W1=b({props:{accounts:{type:Array,required:!0},blockOptions:{type:Object,required:!0},userLocks:{type:Map,required:!0},userBlocks:{type:Map,required:!0},defaultMaster:{type:String,required:!0},fetchType:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","update:blockOptions","removeRows","addRow","userSelected","usernameChanged","fetchRows"],data(){let h=[{id:"username",label:"Username"},{id:"tag",label:"Tag"},{id:"lock",label:"Request Lock"}],v=p(),d=D(),z=m();if(v)h.splice(1,0,...[{id:"block",label:"Block"},{id:"duration",label:"Duration"},{id:"acb",label:"ACB"},{id:"abao",label:"AB/AO"},{id:"ntp",label:"NTP"},{id:"nem",label:"NEM"}]);return{columns:h,selectedRows:[],topButtonActions:{copied:!1,fetched:!1},isAdmin:v,isCheckuser:d,isClerk:z,popovers:{all:{open:!1,tag:null},row:{anchor:null,open:!1,tag:null,tagIndex:0,rowId:null},clipboardTag:null},cdxIconCopy:v0,cdxIconDownload:C2,cdxIconTrash:i,cdxIconUserAvatar:M0,cdxIconUserAvatarOutline:c0}},computed:{selectAll(){return this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)},allowLockOption(){return this.accounts.some((h)=>h.block.lock&&!O(h.username)&&!this.userLocks.get(h.username))}},methods:{isNonRegisteredAccount:O,isSockmasterTag:a1,async copySocks(){if(this.selectedRows.length===0)return;let h="{{sock list",v=0;this.selectedRows.forEach((d)=>{let z=this.accounts[d];if(!z)return;h+=`|${++v}=${z.username}`}),h+="}}",await navigator.clipboard.writeText(h),this.topButtonActions.copied=!0},onMessageDismissed(h){setTimeout(()=>{this.topButtonActions[h]=!1},200)},removeSocks(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},addDefaultRow(){this.$emit("addRow")},handleSelectAll(h){if(this.selectAllIndeterminate=!1,h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,v){this.$emit("userSelected",h,v.id)},setAllBlockFields(h,v){for(let d of this.getTargetRows()){if(h==="lock"&&this.userLocks.get(d.username)===!0)continue;else if(h==="block"&&(!d.block.block||this.userBlocks.get(d.username)!==void 0))continue;else if(h==="acb"&&(!d.block.block||this.userBlocks.get(d.username)?.acb))continue;else if(h==="abao"&&(!d.block.block||this.userBlocks.get(d.username)?.abao))continue;else if(h==="ntp"&&(!d.block.block||this.userBlocks.get(d.username)?.ntp))continue;else if(h==="nem"&&(!d.block.block||this.userBlocks.get(d.username)?.nem))continue;d.block[h]=v}},setAllTags(h){for(let v of this.getTargetRows()){if(O(v.username))continue;v.block.tags=[h.clone()]}},getTargetRows(){if(this.selectedRows.length===0)return this.accounts;let h=new Set(this.selectedRows);return this.accounts.filter((v,d)=>h.has(d))},fetchSocks(){this.topButtonActions.fetched=!0,this.$emit("fetchRows")},showTagPopover(h,v,d,z){this.popovers.row.tag=h,this.popovers.row.tagIndex=v,this.popovers.row.rowId=d,this.popovers.row.anchor=z.currentTarget,this.popovers.row.open=!0},handleTagUpdate(h){let v=this.accounts.find((d)=>d.id===this.popovers.row.rowId);if(!v){console.error("Could not find target row for tag update",this.popovers.row.rowId);return}v.block.tags.splice(this.popovers.row.tagIndex,1,h)},handleTagDelete(){let h=this.accounts.find((v)=>v.id===this.popovers.row.rowId);if(!h){console.error("Could not find target row for tag delete",this.popovers.row.rowId);return}h.block.tags.splice(this.popovers.row.tagIndex,1)},handleTagAdd(h){let v=this.accounts.find((z)=>z.id===h);if(!v)return console.error("Could not find target row for tag add",h),null;let d=new u({master:this.defaultMaster,status:"blocked"});return v.block.tags.push(d),d},getRowTagsWithDefault(h){if(h.length===0)return[null];else return h},handleTagAddAll(){for(let h of this.getTargetRows()){if(O(h.username))continue;h.block.tags.push(new u({master:this.defaultMaster,status:"blocked"}))}},handleTagDeleteAll(){for(let h of this.getTargetRows())h.block.tags.length=0},validateTag(h){return!(n(h)&&!h.master)}},template:`
    <!--suppress VueUnrecognizedDirective, VueUnrecognizedSlot -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <div role="group" aria-labelledby="spiHelper-blockoptions-group-label" class="spiHelper-blockoptions-group">
        <cdx-label id="spiHelper-blockoptions-group-label">
          {{ isAdmin ? 'Block Options' : 'Tag Options' }}
        </cdx-label>

        <cdx-checkbox v-model="blockOptions.noBlock" v-if="isAdmin">
          Do not make any blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.override" v-if="isAdmin" :disabled="blockOptions.noBlock">
          Override any existing blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.tagUnattached" v-if="isClerk">
          Tag accounts without an attached local account
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.cuBlock" v-if="isCheckuser" :disabled="blockOptions.noBlock">
          Mark blocks as Checkuser blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.cuBlockOnly" v-if="isCheckuser" :disabled="!blockOptions.cuBlock">
          <span v-pre>
            Suppress the usual block summary and only use {{checkuserblock-account}} and {{checkuserblock}}
          </span>
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.addMasterNotice" v-if="isAdmin" :disabled="blockOptions.noBlock">
          Add talk page notice when (re)blocking the sockmaster
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.addSockNotice" v-if="isAdmin" :disabled="blockOptions.noBlock">
          Add talk page notice when blocking socks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.blankTalk" v-if="isAdmin"
                      :disabled="blockOptions.noBlock || (!blockOptions.addMasterNotice && !blockOptions.addSockNotice)">
          Blank the talk page when adding talk notices
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.lockHideNames" :disabled="!allowLockOption">
          Hide usernames when requesting global locks
        </cdx-checkbox>
      </div>
      <cdx-table caption="Socks" :show-vertical-borders="true" :use-row-selection="true"
                 :columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
                 class="spiHelper-sockTable">
        <template #header>
          <div class="header-content">
            <span>
              {{ selectedRows.length }} sock{{ selectedRows.length === 1 ? '' : 's' }} selected
            </span>
            <span class="header-content-buttons">
              <cdx-button @click="copySocks" aria-label="Copy socks">
                <cdx-icon :icon="cdxIconCopy" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.copied" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('copied')" @auto-dismissed="onMessageDismissed('copied')"
                           :inline="true">Copied!</cdx-message>
              <cdx-button @click="fetchSocks" :aria-label="'Fetch socks from ' + fetchType">
                <cdx-icon :icon="cdxIconDownload" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.fetched" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('fetched')"
                           @auto-dismissed="onMessageDismissed('fetched')"
                           :inline="true">Fetched from {{ fetchType }}!</cdx-message>
              <cdx-button @click="removeSocks" action="destructive" aria-label="Remove selected rows">
                <cdx-icon :icon="cdxIconTrash" />
              </cdx-button>
            </span>
          </div>
        </template>
        <template #thead>
          <thead>
          <tr>
            <th class="cdx-table__table__select-rows" :rowspan="isAdmin ? 2 : 1">
              <cdx-checkbox
                  v-model="selectAll"
                  :hide-label="true"
                  :indeterminate="selectAllIndeterminate"
                  @update:model-value="handleSelectAll"
              >
                Select all
              </cdx-checkbox>
            </th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1">Username</th>
            <th scope="col" rowspan="2" v-if="isAdmin" class="checkboxHeader">Block</th>
            <th scope="col" rowspan="2" v-if="isAdmin" style="width: 300px;">Duration</th>
            <th scope="colgroup" colspan="4" v-if="isAdmin">Block Settings</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="tagHeader">Tag</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="checkboxHeader">Lock</th>
          </tr>
          <tr v-if="isAdmin" class="blockSettingsRow">
            <th scope="col" v-tooltip="'Account Creation Blocked'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              ACB
            </th>
            <th scope="col" class="spihelper-hovertext cdx-table__table__cell--align-center">
              <span v-tooltip="'Autoblock (for logged-in users)'">AB</span>
              /
              <span v-tooltip="'Anonymous-only (for IPs)'">AO</span>
            </th>
            <th scope="col" v-tooltip="'Disable talkpage access'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              NTP
            </th>
            <th scope="col" v-tooltip="'Disable email'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              NEM
            </th>
          </tr>
          <tr class="setAllRow">
            <th scope="col" style="border-right: none;" />
            <!-- Do this instead of rowspan="2" to align it properly -->
            <th scope="col" style="min-width: 150px;">(all users)</th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('block', $event)"
                            :disabled="blockOptions.noBlock">
                Set all block
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <expiry-input placeholder="Duration" @update:model-value="setAllBlockFields('duration', $event)"
                            :disabled="blockOptions.noBlock" />
            </th>

            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('acb', $event)"
                            :disabled="blockOptions.noBlock">
                Set all account creation blocked
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('abao', $event)"
                            :disabled="blockOptions.noBlock">
                Set all autoblock/anon-only
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('ntp', $event)"
                            :disabled="blockOptions.noBlock">
                Set all no talk page
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('nem', $event)"
                            :disabled="blockOptions.noBlock">
                Set all no email
              </cdx-checkbox>
            </th>

            <th scope="col" class="selectTagOptions">
              <cdx-button ref="selectAllTagButton" @click="popovers.all.open = true">
                Set all tags
              </cdx-button>
              <tag-popover :anchor="$refs.selectAllTagButton" :default-master="defaultMaster"
                           v-model:open="popovers.all.open" :tag="popovers.all.tag"
                           :clipboard-tag="popovers.clipboardTag" @update:tag="setAllTags"
                           @deleteTag="handleTagDeleteAll" @addTag="handleTagAddAll"
                           @copyTag="popovers.clipboardTag = $event" />
            </th>

            <th scope="col">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('lock', $event)">
                Set all request locks
              </cdx-checkbox>
            </th>
          </tr>
          </thead>
        </template>
        <template #item-username="{ item, row }">
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)" />
        </template>

        <template #item-block="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.block"
                        :disabled="blockOptions.noBlock 
                        || (!blockOptions.override && userBlocks.get(row.username) !== undefined)">
            Block
          </cdx-checkbox>
        </template>

        <template #item-duration="{ item, row }">
          <expiry-input v-model="row.block.duration" :shortened="true" :auto-dismiss="true" :touched="true"
                        :disabled="!row.block.block || blockOptions.noBlock || !blockOptions.override && userBlocks.get(row.username) !== undefined"
                        placeholder="Duration" />
        </template>

        <template #item-acb="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.acb"
                        :disabled="!row.block.block || (!blockOptions.override && userBlocks.get(row.username)?.acb)">
            Account creation blocked
          </cdx-checkbox>
        </template>
        <template #item-abao="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.abao"
                        :disabled="!row.block.block || (!blockOptions.override && userBlocks.get(row.username)?.abao)">
            Autoblock/Anon-only
          </cdx-checkbox>
        </template>
        <template #item-ntp="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.ntp"
                        :disabled="!row.block.block || (!blockOptions.override && userBlocks.get(row.username)?.ntp)">
            No talk page
          </cdx-checkbox>
        </template>
        <template #item-nem="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.nem"
                        :disabled="!row.block.block || (!blockOptions.override && userBlocks.get(row.username)?.nem)">
            No email
          </cdx-checkbox>
        </template>

        <template #item-tag="{ item, row }">
          <cdx-button v-for="(tag, index) in getRowTagsWithDefault(row.block.tags)" class="userTag"
                      @click="showTagPopover(tag, index, row.id, $event)"
                      :action="validateTag(tag) ? 'default' : 'destructive'"
                      :disabled="isNonRegisteredAccount(row.username)">
            <cdx-icon v-if="tag !== null"
                      :icon="isSockmasterTag(tag) ? cdxIconUserAvatar : cdxIconUserAvatarOutline"
                      :title="isSockmasterTag(tag) ? 'Master' : 'Sockpuppet'" />
            {{ tag === null ? 'None' : isSockmasterTag(tag) ? tag.status.charAt(0).toUpperCase() + tag.status.slice(1) : tag.master }}
          </cdx-button>
        </template>

        <template #item-lock="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.lock"
                        :disabled="isNonRegisteredAccount(row.username) || userLocks.get(row.username) === true">
            Request lock
          </cdx-checkbox>
        </template>

        <template #footer>
          <cdx-button @click="addDefaultRow">Add Row</cdx-button>
        </template>
      </cdx-table>
      <tag-popover :anchor="popovers.row.anchor" v-model:open="popovers.row.open" :default-master="defaultMaster"
                   :tag="popovers.row.tag" :clipboard-tag="popovers.clipboardTag" @update:tag="handleTagUpdate"
                   @deleteTag="handleTagDelete" @addTag="handleTagAdd(popovers.row.rowId)"
                   @copyTag="popovers.clipboardTag = $event" />
    </action-container>
  `});var f5=[{label:"Results",items:[{value:"{{confirmed}}",label:"Confirmed"},{value:"{{confirmed-nc}}",label:"Confirmed, no comment for IPs"},{value:"{{tallyho}}",label:"Indistinguishable"},{value:"{{highly likely}}",label:"Highly likely"},{value:"{{likely}}",label:"Likely"},{value:"{{possilikely}}",label:"Possilikely"},{value:"{{possible}}",label:"Possible"},{value:"{{unlikely}}",label:"Unlikely"},{value:"{{unrelated}}",label:"Unrelated"},{value:"{{inconclusive}}",label:"Inconclusive"},{value:"{{IPstale}}",label:"Stale"}]},{label:"Addendums",items:[{value:"{{behav}}",label:"Needs behavioral evaluation"},{value:"{{nosleepers}}",label:"No sleepers"},{value:"{{ncip}}",label:"No comment for IPs"}]},{label:"Novelties",items:[{value:"{{8ball}} ",label:"Magic 8-Ball"},{value:"{{crystalball",label:"Not a crystal ball"},{value:"{{fishing}}",label:"Not fishing"},{value:"{{pixiedust}}",label:"Not pixie dust"}]}],F5=[{label:"Ducks",items:[{value:"{{duck}}",label:"Duck"},{value:"{{megaphone duck}}",label:"Megaphone duck"},{value:"{{megaphone duck|ultimate}}",label:"Ultimate duck"}]},{label:"Results",items:[{value:"{{IPblock}}",label:"IP blocked"},{value:"{{bnt}}",label:"Blocked and tagged"},{value:"{{bwt}}",label:"Blocked without tags"},{value:"{{sblock}}",label:"Blocked, awaiting tags"},{value:"{{btc}}",label:"Blocked, tagged, closed"},{value:"{{Action and close}}",label:"Requested actions completed, closing"},{value:"{{Closing without action}}",label:"Closing without action"}]},{label:"Other",items:[{value:"{{subst:DiffsNeeded|moreinfo}}",label:"Diffs needed"},{value:"{{GlobalLocksRequested}}",label:"Locks requested"},{value:"{{Decline-IP}}",label:"IP check declined"}]}];var e0=b({props:{enabled:{type:Boolean,required:!0},text:{type:String,required:!0},selectedSection:{type:Object,required:!0}},emits:["update:enabled","update:text"],data(){let h=[{value:"takenote",label:"Note"}],v=[...F5],d=[...f5];if(D())h.unshift({value:"cunote",label:"CheckUser note"});if(p())h.unshift({value:"adminnote",label:"Administrator note"});if(m())h.unshift({value:"clerknote",label:"Clerk note"});let z=u0(L.custom.commentTemplates);return{noteTemplates:h,clerkTemplates:v,cuTemplates:d,customTemplates:z,loadingPreview:!1,htmlPreview:"",fullPreview:L.interface.fullPreview,cdxIconReload:d0}},computed:{commentBox(){return this.$refs.commentBox}},methods:{onEnable(h){if(this.$emit("update:enabled",h),h)this.$nextTick(()=>{this.commentBox.focus()})},onTextUpdate(h){this.$emit("update:text",h)},async updatePreview(){this.loadingPreview=!0;let h=k1(this.text);try{if(this.fullPreview&&this.selectedSection?.type==="specific"){let v=await K(this.selectedSection.section),d,z;if(m()||p())d=Y1.exec(v)?.index,z=/\n*----(?!.*----)/s.exec(v)?.index;else d=/\s*====\s*<big>Comments by other users<\/big>\s*====\s*/i.exec(v)?.index,z=Y1.exec(v)?.index;let M=v.slice(d??0,z??0).trim()+`
`+h;this.htmlPreview=await X0(f.pageName,M)}else this.htmlPreview=await X0(f.pageName,h)}finally{this.loadingPreview=!1}},insertNote(h){let v=this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i,"* {{"+h+"}} ");this.$emit("update:text",v),this.commentBox.focus()},insertText(h){h=`{{${h.replace(/^{+|}+$/g,"")}}}`;let v=this.commentBox.$el.querySelector("textarea");if(!v){console.error("commentAction: Unable to find textarea");return}let{selectionStart:d,selectionEnd:z}=v,M=this.text;if(d||d===0)M=M.slice(0,d)+h+M.slice(z,M.length),v.selectionStart=d+h.length,v.selectionEnd=z+h.length;else M+=h;this.$emit("update:text",M),this.commentBox.focus()}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="onEnable">
      <div id="spiHelper-templateRow">
        <cdx-select :menu-items="noteTemplates" default-label="Comment templates" @update:selected="insertNote" />
        <cdx-select :menu-items="clerkTemplates" default-label="Admin/clerk templates" @update:selected="insertText" />
        <cdx-select :menu-items="cuTemplates" default-label="CheckUser templates" @update:selected="insertText" />
        <cdx-select v-if="customTemplates.length > 0" :menu-items="customTemplates" default-label="Custom templates"
                    @update:selected="insertText" />
      </div>
      <cdx-text-area ref="commentBox" :autosize="true" placeholder="Write your comment" :model-value="text"
                     @update:model-value="onTextUpdate" />
      <div id="spiHelper-PreviewBox" class="cdx-card" style="min-height:26px">
        <cdx-button aria-label="Load preview" @click="updatePreview" weight="primary" action="progressive"
                    :disabled="loadingPreview">
          <cdx-progress-indicator v-if="loadingPreview">Loading preview</cdx-progress-indicator>
          <cdx-icon v-else :icon="cdxIconReload" />
        </cdx-button>
        <div v-html="htmlPreview" id="htmlPreview" />
      </div>
    </action-container>
  `});var h2=b({props:{enabled:{type:Boolean,required:!0},oldStatus:{type:String,required:!0},newStatus:{type:String,required:!0}},emits:["update:enabled","update:newStatus"],computed:{selected:{get(){let h=this.caseStatusItems.flatMap((d)=>C1(d)?d.items:[d]);if(this.newStatus==="nochange")return h.some((z)=>z.value===this.oldStatus)?this.oldStatus:"nochange";return h.some((d)=>d.value===this.newStatus)?this.newStatus:"nochange"},set(h){if(h===null)return;this.$emit("update:newStatus",String(h))}},caseStatusItems(){let h=[],v=[],d=[],z=[],M=D(),c=m(),V=/^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.oldStatus),l=/^endorsed?$/i.test(this.oldStatus),H=/^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclin(ed)?)$/i.test(this.oldStatus),a=`No change (${this.oldStatus})`;if(h.push({label:a,value:"nochange"}),c1.test(this.oldStatus))h.push({label:"Reopen",value:"reopen"});else h.push({label:"Open",value:"open"});if(h.push({label:"Close",value:"closed"}),d.push({label:"Request CheckUser",value:"CUrequest"}),M)d.push({label:"Check in progress",value:"inprogress"});if(c){if(d.push({label:"Request and self-endorse",value:"selfendorse"}),v.push({label:"Request more information",value:"moreinfo"}),M)d.push({label:"Mark as checked",value:"checked"});if(H)d.push({label:"Relist for another check",value:"relist"})}if(c){if(V){if(M)d.push({label:"Endorse CheckUser",value:"cuendorse"}),d.push({label:"Decline CheckUser",value:"cudecline"});else d.push({label:"Endorse for CheckUser attention",value:"endorse"}),d.push({label:"Decline CheckUser",value:"decline"});v.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}else if(l){if(D())d.push({label:"Decline CheckUser",value:"cudecline"});else d.push({label:"Decline CheckUser",value:"decline"});v.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}}if(v.push({label:"Place case on CU hold",value:"cuhold"}),v.push({label:"Place case on hold",value:"hold"}),z.push({label:"Request clerk action",value:"clerk"}),p()||c)z.push({label:"Request admin action",value:"admin"});let F=[v.length?{label:"Clerking",items:v}:null,d.length?{label:"CheckUser",items:d}:null,z.length?{label:"Deferral",items:z}:null].filter((A)=>A!==null);return[...h,...F]}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
    </action-container>
  `});var z1={editorInteractionAnalyser:{baseUrl:(h)=>new URL("https://sigma.toolforge.org/editorinteract.py"),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},interactionTimeline:{baseUrl:(h)=>new URL("https://interaction-timeline.toolforge.org"),startingParams:new URLSearchParams("wiki=enwiki"),userQueryStringKey:"user",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},SPITools:{timecard:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timecard/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},consolidatedTimeline:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timeline/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},pages:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/pages/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0}},sandals:{timecard:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timecard"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},consolidatedTimeline:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timeline"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},pages:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/pages"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},summaries:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/summaries"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1}},checkUserWikiSearch:{baseUrl:(h)=>new URL("https://checkuser.wikimedia.org/w/index.php"),startingParams:new URLSearchParams("ns0=1"),userQueryStringKey:"search",userQueryStringSeparator:" OR ",userQueryStringWrapper:'"',multipleUserQueryStringKeys:!1}};var $1=b({props:{accounts:{type:Array,required:!0},caseName:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","removeRows","addRow","userSelected","usernameChanged"],data(){let h=[{id:"username",label:"Username"},{id:"analyser",label:"Interaction Analyser"},{id:"timeline",label:"Timeline"},{id:"timecard",label:"Timecard"},{id:"pages",label:"Pages"},{id:"summary",label:"Summaries"},{id:"cuwiki",label:"CU wiki"}],v=h.slice(1);return{columns:h,optionColumns:v,selectedRows:[],cdxIconAdd:A1,cdxIconTrash:i}},computed:{columnState(){let h=this.accounts,v={};for(let d of this.optionColumns){if(h.length===0){v[d.id]={checked:!1,indeterminate:!1};continue}let z=h.map((V)=>V.link[d.id]),M=z.every(Boolean),c=z.every((V)=>!V);v[d.id]={checked:M,indeterminate:!M&&!c}}return v},allColumnsChecked(){return this.accounts.length>0&&this.optionColumns.every((h)=>this.columnState[h.id].checked)},allColumnsIndeterminate(){let h=this.optionColumns.filter((v)=>this.columnState[v.id].checked).length;return h>0&&h<this.optionColumns.length},linkItems(){let h={};for(let v of this.optionColumns){let d=this.getLinkFormat(v.id);if(d===null){console.error("Couldn't find link format for",v.id);continue}let z=d.baseUrl(this.caseName),M=this.accounts.reduce((c,V)=>{if(V.link[v.id])c.push(d.userQueryStringWrapper+V.username+d.userQueryStringWrapper);return c},[]);if(M.length===0)continue;if(d.multipleUserQueryStringKeys)for(let c of M)z.searchParams.append(d.userQueryStringKey,c);else z.searchParams.set(d.userQueryStringKey,M.join(d.userQueryStringSeparator));h[v.id]={url:z,label:v.label}}return h},selectAll(){return this.accounts.length>0&&this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)}},watch:{selectedRows(h,v){let d=new Set(v),z=new Set(h),M=(c,V)=>{let l=this.accounts[c];if(l)this.toggleRow(l,V)};for(let c of z)if(!d.has(c))M(c,!0);for(let c of d)if(!z.has(c))M(c,!1)}},methods:{handleSelectAll(h){if(h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,v){this.$emit("userSelected",h,v.id)},addDefaultRow(){this.$emit("addRow")},removeRows(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},toggleColumn(h,v){for(let d of this.accounts)d.link[h]=v},toggleAllColumns(h){for(let v of this.optionColumns)this.toggleColumn(v.id,h)},toggleRow(h,v){for(let d of this.optionColumns)h.link[d.id]=v},getLinkFormat(h){switch(h){case"analyser":return z1.editorInteractionAnalyser;case"cuwiki":return z1.checkUserWikiSearch;case"pages":return z1.sandals.pages;case"summary":return z1.sandals.summaries;case"timecard":return z1.sandals.timecard;case"timeline":return z1.sandals.consolidatedTimeline;default:return null}}},template:`
    <!--suppress VueUnrecognizedDirective -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-table :hide-caption="false" caption="Links" :use-row-selection="true"
                 :columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
                 class="spiHelper-sockTable linkTable">
        <template #header>
          <div class="header-content">
            <span>
              {{ selectedRows.length }} row{{ selectedRows.length === 1 ? '' : 's' }} selected
            </span>
            <span class="header-content-buttons">
              <cdx-button action="progressive" @click="addDefaultRow" aria-label="Add row">
                <cdx-icon :icon="cdxIconAdd" />
              </cdx-button>
              <cdx-button @click="removeRows" action="destructive" aria-label="Remove selected rows">
                <cdx-icon :icon="cdxIconTrash" />
              </cdx-button>
            </span>
          </div>
        </template>
        <template #thead>
          <thead>
          <tr>
            <th class="cdx-table__table__select-rows">
              <cdx-checkbox
                  v-model="selectAll"
                  :hide-label="true"
                  :indeterminate="selectAllIndeterminate"
                  @update:model-value="handleSelectAll"
              >
                Select all rows
              </cdx-checkbox>
            </th>
            <th scope="col">Username</th>
            <th v-for="column in optionColumns" :key="column.id">
              {{ column.label }}
            </th>
          </tr>
          <tr class="setAllRow">
            <th scope="col">
              <cdx-checkbox
                  :hide-label="true" :model-value="allColumnsChecked"
                  :indeterminate="allColumnsIndeterminate" @update:model-value="toggleAllColumns">
                Select all columns
              </cdx-checkbox>
            </th>
            <th scope="col" style="padding-left: 12px; min-width: 155px;">(all users)</th>
            <th v-for="column in optionColumns" :key="column.id">
              <cdx-checkbox
                  :hide-label="true" :model-value="columnState[column.id].checked"
                  :indeterminate="columnState[column.id].indeterminate"
                  @update:model-value="toggleColumn(column.id, $event)">
                Toggle all rows for {{ column.label }}
              </cdx-checkbox>
            </th>
          </tr>
          </thead>
        </template>
        <template #item-username="{ item, row }">
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)" />
        </template>

        <template #item-analyser="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.analyser">Editor interaction analyser</cdx-checkbox>
        </template>
        <template #item-timeline="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.timeline">Consolidated timeline</cdx-checkbox>
        </template>
        <template #item-timecard="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.timecard">Timecard</cdx-checkbox>
        </template>
        <template #item-pages="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.pages">Pages</cdx-checkbox>
        </template>
        <template #item-summary="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.summary">Summaries</cdx-checkbox>
        </template>
        <template #item-cuwiki="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.cuwiki">CheckUser wiki</cdx-checkbox>
        </template>
      </cdx-table>
      <ul>
        <li v-for="[columnId, linkItem] in Object.entries(linkItems)" :key="columnId">
          <a :href="linkItem.url.href">{{ linkItem.label }}</a>
        </li>
      </ul>
    </action-container>
  `});var v2=b({props:{enabled:{type:Boolean,required:!0},flags:{type:Set,required:!0}},emits:["update:enabled","update:flags"],data(){return{archiveNoticeFlags:[{value:"crosswiki",label:"Cross-wiki"},{value:"deny",label:"Deny"},{value:"notalk",label:"No talkpage access"},{value:"moot",label:"Moot"}]}},computed:{internalFlags:{get(){return Array.from(this.flags)},set(h){this.$emit("update:flags",new Set(h))}}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
    </action-container>
  `});var z2=b({props:{enabled:{type:Boolean,required:!0},target:{type:String,required:!0},suppress:{type:Boolean,required:!0},selection:{type:Object,required:!0},archiveEnabled:{type:Boolean,required:!0}},emits:["update:enabled","update:target","update:suppress","moveEntireCase"],data(){return{canSuppressRedirect:G1()}},computed:{isSectionMove(){return this.selectionType==="specific"},moveTitle(){if(!this.selection)return"ERROR";if(this.selection.type==="all")return"entire case";return"section "+this.selection.section.name},disabled(){return this.archiveEnabled},selectionType(){return this.selection?.type??null}},watch:{archiveEnabled:{handler(h){if(h)this.$emit("update:enabled",!1)},immediate:!0}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);"
                      :disabled="disabled">
      <h3>Moving {{ moveTitle }}</h3>
      <page-lookup :model-value="target" @update:model-value="$emit('update:target', $event)"
                   :namespace="4" prefix="Sockpuppet investigations/"
                   placeholder="Title" label="New Case Name" />
      <cdx-message v-if="isSectionMove" type="notice" :allow-user-dismiss="true" style="margin-top: 16px;">
        <p><strong>You are moving a section</strong></p>
        <p>
          Make sure you are expecting to move only the section and not the entire case.
          If you wish to move the entire case, <a @click="$emit('moveEntireCase')">click here</a>
        </p>
      </cdx-message>
      <cdx-checkbox style="margin-top: 16px;" v-if="!isSectionMove" :model-value="suppress"
                    @update:model-value="$emit('update:suppress', $event)">
        {{ canSuppressRedirect ? 'Suppress redirect' : 'Request redirect deletion' }}
        <template #description>
          <template v-if="canSuppressRedirect">
            Delete the old case page
          </template>
          <template v-else>
            Request <a href="//en.wikipedia.org/wiki/Wikipedia:Speedy_deletion#G6._Technical_deletions">G6</a> deletion
            of the old case page
          </template>
          (one you're on right now)
        </template>
      </cdx-checkbox>
    </action-container>
    <cdx-message v-if="archiveEnabled" type="warning" :inline="true">
      Archival is enabled, which overrides moving.
    </cdx-message>
  `});var d2=b({props:{allSections:{type:Array,required:!0},selectedSection:{type:Object,required:!0}},emits:["update-section-selection"],data(){return{menuPointerOverHandler:null,menuPointerLeaveHandler:null,menuFocusInHandler:null,activeSectionId:null,overlayType:null}},computed:{canJumpToSelectedSection(){return this.selectedSection!==null&&this.selectedSection!=="all"},sectionSelectElement(){return this.$refs.sectionSelect.$el},menuItems(){let h=this.allSections.map((v)=>({value:v.id,label:v.name}));return h.push({value:"all",label:"All Sections"}),h}},mounted(){if(!L.highlightSection)return;this.menuPointerOverHandler=(h)=>{this.handlePreviewEvent(h)},this.menuPointerLeaveHandler=()=>{if(this.overlayType==="preview")this.clearSectionHighlight()},this.menuFocusInHandler=(h)=>{this.handlePreviewEvent(h)},this.sectionSelectElement.addEventListener("pointerover",this.menuPointerOverHandler),this.sectionSelectElement.addEventListener("pointerleave",this.menuPointerLeaveHandler),this.sectionSelectElement.addEventListener("focusin",this.menuFocusInHandler)},beforeUnmount(){if(this.menuPointerOverHandler)this.sectionSelectElement.removeEventListener("pointerover",this.menuPointerOverHandler);if(this.menuPointerLeaveHandler)this.sectionSelectElement.removeEventListener("pointerleave",this.menuPointerLeaveHandler);if(this.menuFocusInHandler)this.sectionSelectElement.removeEventListener("focusin",this.menuFocusInHandler);this.clearSectionHighlight()},methods:{handleUpdateSectionSelection(h){if(L.highlightSection){if(h==="all")this.clearSectionHighlight();else if(typeof h==="number")this.renderSectionOverlay(h,"selected")}this.$emit("update-section-selection",h)},jumpToSelectedSection(){if(!this.canJumpToSelectedSection)return;if(this.selectedSection===null||this.selectedSection==="all")return;H5(this.selectedSection)},renderSectionOverlay(h,v){this.overlayType=v,F0(h,v)},clearSectionHighlight(){N1()},handlePreviewEvent(h){let v=h.target;if(!(v instanceof HTMLElement))return;let d=v.closest(".cdx-menu-item");if(!d)return;let z=L5(d,this.menuItems);if(z===null){this.activeSectionId=null,this.clearSectionHighlight();return}if(z!==this.activeSectionId)this.renderSectionOverlay(z,"preview")}},template:`
    <!-- Sections special case -->
    <div class="spiHelper-section-selector">
      <cdx-select :menu-items="menuItems" :selected="selectedSection"
                  @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
      <cdx-button weight="normal" :disabled="!canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
    </div>
  `});var d1=b({inheritAttrs:!1,props:{modelValue:{type:String,required:!1,default:""},label:{type:String,required:!1,default:""},touched:{type:Boolean,default:!1},shortened:{type:Boolean,default:!1},autoDismiss:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:touched"],data(){return{messages:{warning:this.shortened?"Invalid":"Expiry option is invalid",success:this.shortened?"Valid":"Valid expiry option"},showSuccess:!this.autoDismiss,internalTouched:this.touched,successTimeout:null}},computed:{valid(){return S1(this.modelValue)!==null},status(){if(this.disabled||!this.internalTouched)return"default";if(this.valid)return this.showSuccess?"success":"default";else return"warning"}},watch:{modelValue(){if(this.internalTouched=!0,!this.autoDismiss)return;if(this.successTimeout)clearTimeout(this.successTimeout);if(this.valid)this.showSuccess=!0,this.successTimeout=window.setTimeout(()=>{this.showSuccess=!1},3000)},internalTouched(h){this.$emit("update:touched",h)}},beforeUnmount(){if(this.successTimeout)clearTimeout(this.successTimeout)},template:`
    <cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="modelValue" :disabled="disabled" v-bind="$attrs" />
    </cdx-field>
  `});var A5=10,M1=b({props:{modelValue:{type:String,required:!0},placeholder:{type:String,default:"Page"},label:{type:String,default:null},description:{type:String,default:null},namespace:{type:Number,required:!0},prefix:{type:String,default:""},validateMessage:{type:Boolean,default:!0}},emits:["update:modelValue"],data(){let h={visibleItemLimit:6,searchQuery:""};return{lookupStatus:"default",messages:{success:"Page exists",warning:"Page not found"},pageSuggestions:[],useLookup:L.useLookup,selection:null,menuConfig:h}},computed:{pagename:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}},fullPagename(){return`${this.prefix}${this.pagename}`}},methods:{async onUpdateInputValue(h){if(this.menuConfig.searchQuery=h,!h){this.pageSuggestions=[];return}await this.$nextTick(),_0(this.fullPagename,this.namespace,A5).then((v)=>{if(this.pagename!==h)return;if(v.length===0){this.pageSuggestions=[];return}this.pageSuggestions=v.filter((d)=>!d.title.includes("/Archive")).map((d)=>({label:this.stripTitle(d.title),value:d.pageid.toString()}))}).catch(()=>{this.pageSuggestions=[]})},onLoadMore(){if(!this.pagename)return;_0(this.fullPagename,this.namespace,this.pageSuggestions.length+A5).then((h)=>{if(h.length===0)return;this.pageSuggestions=h.filter((v)=>!v.title.includes("/Archive")).map((v)=>({label:this.stripTitle(v.title),value:v.pageid.toString()}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.pagename.length===0){this.lookupStatus="default";return}let h=this.pageSuggestions.find((v)=>v.label===this.pagename)??null;if(h!==null)this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null)this.lookupStatus="success"},stripTitle(h){if(this.prefix)return h.split(this.prefix)[1]??h;if(this.namespace===0)return h;return h.split(":")[1]??h}},template:`
    <cdx-field :status="lookupStatus" :messages="validateMessage ? messages : {}" :hide-label="!label">
      <template v-if="label" #label>
        {{ label }}
      </template>
      <template v-if="description" #description>
        {{ description }}
      </template>
      <cdx-lookup
          v-if="useLookup"
          v-model:selected="selection"
          v-model:input-value="pagename"
          :menu-items="pageSuggestions"
          :menu-config="menuConfig"
          :placeholder="placeholder"
          @update:input-value="onUpdateInputValue"
          @load-more="onLoadMore"
          @focus="onLoadMore"
          @update:selected="onSelection"
          @blur="validateInstantly"
          @keydown.enter="validateInstantly"
          @clear="validateInstantly"
          clearable
      >
        <template #no-results>
          No pages found
        </template>
      </cdx-lookup>
      <cdx-text-input v-else v-model="pagename" :placeholder="placeholder" clearable />
    </cdx-field>
  `});var j1=b({props:{lockComment:{type:String,required:!0},skipCUVerifyUsers:{type:Set,required:!0},actionName:{type:String,required:!0},checkConflict:{type:Boolean,required:!0},state:{type:Object,required:!0},accounts:{type:Array,required:!0},caseActions:{type:Object,required:!0},allDisabled:{type:Boolean,required:!0}},emits:["update:lockComment","update:skipCUVerifyUsers","onSubmit"],data(){return{popover:{show:!1,revId:0,cancelAction:{label:"Cancel"},continueAction:{label:"Continue",actionType:"progressive"}},submitElement:null,cdxIconUpdate:T2}},computed:{needsLockComment(){let h=this.caseActions.block;if(!h.enabled)return!1;return this.accounts.some((v)=>v.block.lock&&!O(v.username)&&h.data.userLocks.get(v.username)!==!0)},hasInvalidTag(){if(!this.caseActions.block.enabled)return!1;return this.accounts.some((v)=>v.block.tags.some((d)=>n(d)&&!d.master))},hasInvalidMove(){let h=this.caseActions.move;return h.enabled&&!h.data.target},cuBlockConfirmationsNeeded(){let h=this.caseActions.block.data,v=new Set;if(D()||!this.caseActions.block.enabled||!h.options.override||!h.options.noBlock)return v;for(let d of this.accounts){if(!d.block.block)continue;let z=h.userBlocks.get(d.username)?.reason;if(z&&P1.exec(z))v.add(d.username)}return v},cuBlockOverrideChecked:{get(){return this.skipCUVerifyUsers.size===this.cuBlockConfirmationsNeeded.size},set(h){this.$emit("update:skipCUVerifyUsers",h?this.cuBlockConfirmationsNeeded:new Set)}},cuBlockOverrideIndeterminate(){let h=this.skipCUVerifyUsers.size;return h>0&&h<this.cuBlockConfirmationsNeeded.size},disableButton(){return L1(this.actionName)||this.allDisabled||this.hasInvalidTag||this.hasInvalidMove},lockCommentValue:{get(){return this.lockComment},set(h){this.$emit("update:lockComment",h)}}},mounted(){this.submitElement=this.$refs.submitElement},methods:{async onSubmit(){if(this.disableButton)return;if(this.checkConflict)if(this.popover.revId=await t1(f.pageName),this.popover.revId===f.startingRevId)this.$emit("onSubmit");else this.popover.show=!0;else this.$emit("onSubmit")},confirmSubmit(){this.popover.show=!1,f.startingRevId=this.popover.revId,this.state.selectedSection?.type==="specific"?K(this.state.selectedSection.section,{purge:!0}):S(this.state,{purge:!0}),this.$emit("onSubmit")}},template:`
    <div class="spiHelper-submitForm">
      <cdx-field v-if="needsLockComment">
        <template #label>Lock Comment</template>
        <template #description>Optional comment to include in the global lock request</template>
        <cdx-text-area v-model="lockCommentValue" placeholder="Comment" :autosize="true" />
      </cdx-field>
      <cdx-checkbox v-if="cuBlockConfirmationsNeeded.size > 0"
                    v-model="cuBlockOverrideChecked" :indeterminate="cuBlockOverrideIndeterminate">
        Confirm CU-block overriding
        <template #description>You are currently set to override the following CU blocks:
          {{ [...cuBlockConfirmationsNeeded].join(', ') }}
        </template>
      </cdx-checkbox>
      <div>
        <cdx-message v-if="hasInvalidTag" type="error" :inline="true">A user has an invalid tag</cdx-message>
        <cdx-message v-if="hasInvalidMove" type="error" :inline="true"><b>Move</b> is enabled but has no target</cdx-message>
        <cdx-button ref="submitElement" action="progressive" weight="primary" @click="onSubmit"
                    :disabled="disableButton">
          Submit
        </cdx-button>
        <cdx-popover :anchor="submitElement"
                     v-model:open="popover.show" :icon="cdxIconUpdate" title="Edit Conflict"
                     close-button-label="Cancel"
                     :primary-action="popover.continueAction" @primary="confirmSubmit"
                     :default-action="popover.cancelAction" @default="popover.show = false">
          The page has been edited after you loaded it. Do you want to continue?
        </cdx-popover>
      </div>
    </div>
  `});var Q1=b({props:{tag:{type:Object,required:!0},open:{type:Boolean,required:!0},anchor:{type:Object,required:!0},clipboardTag:{type:Object,required:!0},defaultMaster:{type:String,required:!0}},emits:{"update:open":(h)=>!0,"update:tag":(h)=>!0,addTag:()=>!0,copyTag:(h)=>!0,deleteTag:()=>!0},data(){let h=[{value:"blocked",label:"Suspected"},{value:"proven",label:"Proven"},{value:"confirmed",label:"Confirmed"}],v=[{value:"blocked",label:"Blocked"},{value:"confirmed",label:"Confirmed"},{value:"banned",label:"3X Banned"}],d=[{value:"suspected",label:"Suspected"},{value:"proven",label:"Proven"}],z={tag:"none",altmaster:"none"},M=[{value:"sock",label:"Sockpuppet",icon:c0},{value:"master",label:"Sockmaster",icon:M0}],c=null;return{sockTags:h,masterTags:v,altmasterTags:d,allTagSelections:z,tagCategoryButtons:M,temporaryTag:null,icons:{cdxIconAdd:A1,cdxIconCopy:v0,cdxIconPaste:P2,cdxIconTrash:i}}},computed:{openValue:{get(){return this.open},set(h){this.$emit("update:open",h)}},tagCategory:{get(){if(this.temporaryTag===null)return null;return n(this.temporaryTag)?"sock":"master"},set(h){if(h==="sock")this.temporaryTag=new u({status:"blocked",master:this.defaultMaster,evidence:this.temporaryTag?.evidence});else this.temporaryTag=new g({status:"blocked",evidence:this.temporaryTag?.evidence})}}},watch:{tag(h){if(h)this.temporaryTag=h.clone()}},methods:{handleSave(){if(this.temporaryTag===null){console.error("No tag to save");return}this.$emit("update:tag",this.temporaryTag),this.openValue=!1},handleCancel(){this.openValue=!1},handleDeleteTag(){this.$emit("deleteTag"),this.openValue=!1},handleCopyTag(){if(!this.temporaryTag)return;this.$emit("copyTag",this.temporaryTag)},handlePasteTag(){if(!this.clipboardTag)return;this.temporaryTag=this.clipboardTag.clone()},handleAddTag(){this.$emit("addTag"),this.openValue=!1}},template:`
    <cdx-popover :anchor="anchor" v-model:open="openValue"
                 title="Edit Tag" class="edit-tag-popover">
      <cdx-toggle-button-group :buttons="tagCategoryButtons" v-model="tagCategory" class="tag-category" />
      <div v-if="tagCategory === 'sock'" class="edit-body">
        <cdx-toggle-button-group :buttons="sockTags" v-model="temporaryTag.status" />
        <user-lookup label="Master" v-model="temporaryTag.master" :allow-empty="false" />
        <user-lookup label="Alternate Master" v-model="temporaryTag.altmaster" />
        <cdx-toggle-button-group v-show="temporaryTag.altmaster" :buttons="altmasterTags"
                                 v-model="temporaryTag.altmasterStatus" />
        <cdx-accordion separation="minimal">
          <template #title>
            Extras
          </template>
          <cdx-field>
            <template #label>Evidence</template>
            <cdx-text-input v-model="temporaryTag.evidence" />
          </cdx-field>
        </cdx-accordion>
      </div>
      <div v-else-if="tagCategory === 'master'" class="edit-body">
        <cdx-toggle-button-group :buttons="masterTags" v-model="temporaryTag.status" />
        <cdx-accordion separation="minimal">
          <template #title>
            Extras
          </template>
          <cdx-field>
            <template #label>Evidence</template>
            <cdx-text-input v-model="temporaryTag.evidence" />
          </cdx-field>
          <page-lookup v-model="temporaryTag.spipage" :namespace="4" prefix="Sockpuppet investigations/"
                       label="SPI Page" />
          <page-lookup v-model="temporaryTag.ltapage" :namespace="4" prefix="Long-term abuse/" label="LTA Page" />
        </cdx-accordion>
      </div>
      <template #footer>
        <div class="footer-sideactions">
            <cdx-button action="destructive" @click="handleDeleteTag" aria-label="Delete tag" title="Delete tag">
              <cdx-icon :icon="icons.cdxIconTrash" />
            </cdx-button>
            <cdx-button @click="handleAddTag" aria-label="Add tag" title="Add tag">
              <cdx-icon :icon="icons.cdxIconAdd" />
            </cdx-button>
            <cdx-button @click="handleCopyTag" aria-label="Copy tag" title="Copy tag">
              <cdx-icon :icon="icons.cdxIconCopy" />
            </cdx-button>
            <cdx-button @click="handlePasteTag" aria-label="Paste tag" title="Paste tag">
              <cdx-icon :icon="icons.cdxIconPaste" />
            </cdx-button>
        </div>
        <div class="cdx-popover__footer__actions">
          <cdx-button
              class="cdx-popover__footer__primary-action"
              weight="primary"
              action="progressive"
              @click="handleSave"
          >
            Save
          </cdx-button>
          <cdx-button
              class="cdx-popover__footer__default-action"
              @click="handleCancel"
          >
            Cancel
          </cdx-button>
        </div>
      </template>
    </cdx-popover>
  `});var M2=b({props:{state:{type:Object,required:!0},activateButton:{type:Object,required:!0}},data(){return{activateHandler:null,open:!1,archiving:!1,messages:N}},mounted(){this.activateHandler=()=>{N.length=0,this.open=!0,this.archiving=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"oca"}),c5(this.state).then(()=>{this.archiving=!1},()=>{})},this.activateButton.addEventListener("click",this.activateHandler)},beforeUnmount(){if(this.activateHandler)this.activateButton.removeEventListener("click",this.activateHandler)},template:`
    <cdx-dialog v-model:open="open" title="One Click Archival">
      <cdx-progress-bar v-if="archiving" aria-label="Archival in progress" />
      <div style="margin-top: 12px;">
        <cdx-message v-for="(message, index) in messages" :key="index" :type="message.type">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </cdx-dialog>
  `});var g5=/\[\[(?:Wikipedia|WP):(?:Sockpuppet investigations|SPI)\/([^\]]+)/i,u1=b({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},defaultCase:{type:String,required:!1,default:""},view:{type:String,required:!0}},data(){return{open:!1,openHandler:null,beforeUnloadHandler:null,caseLoaded:!1,caseLoading:!1,targetCase:this.defaultCase,blockData:r1(),accounts:[],actionsRunning:!1,unpinned:!L.interface.pinned,messages:N,cdxIconFeedback:y1,cdxIconPushPin:z0}},computed:{mountPoint(){return this.$el.parentElement},pageName(){return`Wikipedia:Sockpuppet investigations/${this.targetCase}`},caseActions(){return{block:{enabled:!0,data:this.blockData},move:{enabled:!1}}}},watch:{unpinned(h){if(!this.mountPoint){console.error("AlternateView unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");L.interface.pinned=!h}},mounted(){if(!this.mountPoint){console.error("AlternateViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.beforeUnloadHandler=(h)=>{if(o1("alternateActions")!=="success")h.preventDefault()},this.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"alternate"}),!this.caseLoaded)switch(this.view){case"category":this.initialiseCategoryView();break;case"checkuser":this.initialiseCheckUserView();break;case"si":this.initialiseSIView();break}}if(this.beforeUnloadHandler)if(this.open)window.addEventListener("beforeunload",this.beforeUnloadHandler);else window.removeEventListener("beforeunload",this.beforeUnloadHandler)},this.openButton.addEventListener("click",this.openHandler)},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler);if(this.beforeUnloadHandler)window.removeEventListener("beforeunload",this.beforeUnloadHandler)},methods:{handleUserSelected(h,v){let d=this.accounts.find((z)=>z.id===v);if(!d)return;if(h.blockid!==void 0&&!this.blockData.userBlocks.has(d.username)){let z=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.blockData.userBlocks.set(d.username,{username:d.username,duration:h.blockexpiry??"",abao:z??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}L0(h,d)},handleAddRow(h){h??=v1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((v)=>!h.includes(v.id))},async handleFetchRows(){let h;try{h=await navigator.clipboard.readText()}catch(c){if(console.error("handleFetchRows failed to read clipboard:",c),c instanceof DOMException&&c.name==="NotAllowedError")new y({type:"warning",content:"Failed to read clipboard. You may need to press 'paste' in the confirmation popup"}).show();return}let[v,d]=E1({text:h,fullSearch:!1,state:this.state}),z=new Set(v),M=[...v,...d].map((c)=>O1({userRow:c,defaultBlock:z.has(c)}));this.massAddUserRows(M)},massAddUserRows(h){let v=new Set(this.accounts.map((d)=>d.username));h.forEach((d)=>{if(!v.has(d.username))this.handleAddRow(d)})},async loadCase(h){if(this.caseLoading=!0,e1(this.pageName),this.targetCase){let v=await b1({page:this.pageName,state:this.state});if(f.valid=v!==null,v===null)this.state.archiveNotice=new R({username:this.targetCase});else this.state.archiveNotice=v;if(h){let d=await Z2(this.targetCase);if(d!==null)this.blockData.userBlocks.set(this.targetCase,d);let z=await Y(`User:${this.targetCase}`,!1),{userRow:M,isLocked:c}=await V0({userRow:h1(this.targetCase,this.state),block:d,userPage:z,defaultBlock:!0,checkLock:!1,state:this.state});if(c!==null)this.blockData.userLocks.set(this.targetCase,c);let V=this.accounts.findIndex((l)=>l.username===M.username);if(V===-1)this.accounts.splice(0,0,M);else this.accounts.splice(V,1,M)}}else f.valid=!1;this.blockData.master=this.targetCase,this.caseLoading=!1,this.caseLoaded=!0},async onSubmitActions(){if(L1("alternateActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"alternate"}),U("alternateActions"),this.actionsRunning=!0;let h=[],v=[],d=Promise.resolve([]);({blockPromises:h,tagPromises:v,lockPromise:d}=await i0({accounts:this.accounts,blockData:this.blockData}));let z=Promise.all([Promise.all(h),Promise.all(v),d]),[M,c,V]=await z;if(L.log.enabled){let l=`* [[:User:${f.userName}]]`+w1({blockedUsers:M,taggedUsers:c,lockedUsers:V});await x1(l)}new y({type:"success",content:"Done!"}).show(),_("alternateActions","success"),this.actionsRunning=!1},async initialiseCategoryView(){if(this.defaultCase===""||this.caseLoading||this.caseLoaded)return;let[,h,v]=await Promise.all([this.loadCase(!1),p0(`Category:Suspected Wikipedia sockpuppets of ${this.targetCase}`),p0(`Category:Wikipedia sockpuppets of ${this.targetCase}`)]),d=(l,H)=>{let a={...h1(l.replace("User:",""),this.state)};return a.block.block=H,a},z=[...v,`User:${this.targetCase}`].map((l)=>d(l,!0)),M=h.map((l)=>d(l,!1)),c=new Set([...z,...M].map((l)=>l.username)),V=await Z1({likelySocks:z,possibleSocks:M,allUsernames:c,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(V)},initialiseCheckUserView(){let h=$("form#checkuserform",document),v=$("#checkreason input",h).val();if(typeof v==="string"){let z=g5.exec(v)?.[1];if(z){this.targetCase=z;return}}let d=$("#checktarget input",h).val();if(typeof d==="string"){if(!mw.util.isIPAddress(d,!0))this.targetCase=d}},async initialiseSIView(){let h=[],v=new Set,z=$("ul.mw-checkuser-suggestedinvestigations-users",document).find("li > a.mw-userlink > bdi");for(let c of z){let V=P($(c).text());if(v.has(V))continue;h.push(h1(V,this.state)),v.add(V)}if(h.length>0&&h[0])this.targetCase=h[0].username;let M=await Z1({likelySocks:h,possibleSocks:[],allUsernames:v,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(M)},launchFeedback(){let h=this.view.charAt(0).toUpperCase()+this.view.slice(1);this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`${h} form v${T}-${G}`})}},template:`
    <div id="spiHelper-alternateView" class="spiHelper-mainCard" v-if="open" @keydown.ctrl.enter.capture.prevent="$refs.submitForm?.onSubmit?.()">
      <div id="spiHelper-alternateView-Header" class="spiHelper-mainCard-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="launchFeedback">
            <cdx-icon :icon="cdxIconFeedback" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="cdxIconPushPin" />
          </cdx-button>
        </div>
      </div>
      <div id="spiHelper-CaseLoader">
        <page-lookup v-model="targetCase"
                     :namespace="4" prefix="Sockpuppet investigations/"
                     placeholder="Case" label="Case title" description="Optional but recommended" />
        <div style="display: flex; gap: 10px;">
          <cdx-button weight="primary" action="progressive" @click="loadCase(true)">Load</cdx-button>
          <cdx-progress-indicator v-show="caseLoading">Loading case</cdx-progress-indicator>
        </div>
      </div>
      <div id="spiHelper-alternateView-Content" v-if="caseLoaded">
        <div>
          <h4>Link</h4>
          <link-action :enabled="true" :case-name="targetCase"
                       :accounts="accounts"
                       @user-selected="handleUserSelected"
                       @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
        <div>
          <h4>Block</h4>
          <block-action :enabled="true" fetch-type="clipboard"
                        :accounts="accounts" v-model:block-options="blockData.options"
                        :user-locks="blockData.userLocks" :user-blocks="blockData.userBlocks"
                        :default-master="blockData.master"
                        @user-selected="handleUserSelected" @fetch-rows="handleFetchRows"
                        @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
      </div>
      <div v-if="caseLoaded">
        <submit-form :accounts="accounts"
                     v-model:lock-comment="blockData.lockcomment" v-model:skipCUVerifyUsers="blockData.skipCUVerifyUsers"
                     :case-actions="caseActions" :state="state"
                     :all-disabled="false" :action-name="'alternateActions'" :check-conflict="false"
                     @on-submit="onSubmitActions" ref="submitForm" />
      </div>
      <cdx-progress-bar v-if="actionsRunning" aria-label="Actions in progress" style="margin-top: 20px;" />
      <div id="messageRow">
        <cdx-message v-for="(message, index) in messages" :key="index" :type="message.type" :fade-in="true"
                     :allow-user-dismiss="true">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </div>
  `});var c2=b({props:{unseenChanges:{type:Array,required:!0},openState:{type:Object,required:!0}},data(){return{beta:G!=="production"}},methods:{onClose(){this.openState.isOpen=!1,this.$emit("dismissed")}},template:`
    <cdx-dialog
        v-model:open="openState.isOpen"
        title="What's new"
        @update:open="onClose"
    >
      <div v-for="[version, entry] in unseenChanges" :key="version">
        <h3 style="display: inline;">{{ version }}</h3> · {{ entry.date }}
        <ul>
          <li v-for="change in entry.changes" :key="change">{{ change }}</li>
        </ul>
      </div>

      <p style="margin-top: 12px;"><a href="//en.wikipedia.org/wiki/User:DatGuy/spihelper/changelog.json">See all change history</a></p>
      
      <cdx-message v-if="beta" style="padding: 12px; margin-top: 24px">
        <p><strong>Beta Reminder</strong></p>
        <p>You are running a beta version.</p>
        <p>It is recommended to double-check your edits, especially ones that are impacted by a recent change.</p>
      </cdx-message>

      <template #footer>
        <cdx-button action="progressive" @click="onClose">Got it</cdx-button>
      </template>
    </cdx-dialog>`});async function o5(){let h=J2(),v={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",pageids:82598459,formatversion:"2"};try{let z=(await h.get(v)).query.pages[0]?.revisions?.[0]?.slots.main.content;if(z)return JSON.parse(z)}catch(d){console.error("getChangelog fetch error:",d)}return{}}async function q5(h){let v=await o5();return Object.entries(v).filter(([d])=>y5(d,h)).sort(([d],[z])=>y5(d,z)?-1:1)}function y5(h,v){let d=h.split(".").map(Number),z=v.split(".").map(Number);for(let M=0;M<3;M++){if((d[M]??0)>(z[M]??0))return!0;if((d[M]??0)<(z[M]??0))return!1}return!1}var b5=b({template:`
    <cdx-toast-container />
    `});if(mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/")&&!mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/SPI/"))A0("spi");else if(mw.config.get("wgCanonicalSpecialPageName")==="CheckUser")A0("checkuser");else if(mw.config.get("wgCanonicalSpecialPageName")==="SuggestedInvestigations"&&mw.config.get("wgPageName").includes("/detail/"))A0("si");else if(mw.config.get("wgNamespaceNumber")===14&&["Suspected Wikipedia sockpuppets","Wikipedia sockpuppets"].some((h)=>mw.config.get("wgCategories").includes(h)))A0("category");function A0(h){mw.loader.using(["vue","@wikimedia/codex","mediawiki.api","mediawiki.util","mediawiki.user","mediawiki.feedback"],(v)=>{let d=v("vue"),z=v("@wikimedia/codex");k2(d.toRaw);let M=new mw.Feedback(b2);if(G==="live")mw.loader.load("http://localhost:8080/spihelper.css","text/css");else if(G==="dev")importStylesheet("User:DatGuy/spihelper.dev.css");else importStylesheet("User:DatGuy/spihelper.css");let c,V=d.reactive(new G0);if(h==="spi"){let F=mw.config.get("wgPageName");e1(F),F1(V)}else if(h==="category"){if(c=/Category:(?:Suspected )?Wikipedia sockpuppets of (.*)/.exec(mw.config.get("wgPageName").replaceAll("_"," ")),!c?.[1])return}let l=x0();if(l)Object.assign(L,l);else(async()=>{await N0(),o()})();t5(d,z);let H=d.reactive({isOpen:!1});if(L.lastSeenVersion!==T)q5(L.lastSeenVersion).then((F)=>{let A=document.createElement("div");A.style.position="absolute",mw.util.$content.prepend(A);let Z=d.createMwApp(c2,{unseenChanges:F,openState:H,onDismissed:async()=>{L.lastSeenVersion=T,await o(),Z.unmount(),A.remove()}}).component("cdx-button",z.CdxButton).component("cdx-dialog",z.CdxDialog).component("cdx-message",z.CdxMessage);Z.mount(A)},()=>{});let a=mw.util.addPortletLink("p-cactions","#",G==="production"?"SPI":"SPI-Beta","ca-spiHelper","Run spiHelper");if(a){let F=document.createElement("div");switch(F.setAttribute("id","spiHelper-vue-mount-point"),mw.util.$content.prepend(F),a.addEventListener("click",()=>{H.isOpen=!0}),h){case"spi":{d.createMwApp(s0,{state:V,feedbackDialog:M,openButton:a}).component("cdx-tabs",z.CdxTabs).component("cdx-tab",z.CdxTab).component("cdx-select",z.CdxSelect).component("cdx-card",z.CdxCard).component("cdx-toggle-switch",z.CdxToggleSwitch).component("cdx-text-area",z.CdxTextArea).component("cdx-toggle-button",z.CdxToggleButton).component("cdx-toggle-button-group",z.CdxToggleButtonGroup).component("cdx-button",z.CdxButton).component("cdx-button-group",z.CdxButtonGroup).component("cdx-icon",z.CdxIcon).component("cdx-table",z.CdxTable).component("cdx-text-input",z.CdxTextInput).component("cdx-checkbox",z.CdxCheckbox).component("cdx-lookup",z.CdxLookup).component("cdx-field",z.CdxField).component("cdx-message",z.CdxMessage).component("cdx-progress-bar",z.CdxProgressBar).component("cdx-progress-indicator",z.CdxProgressIndicator).component("cdx-accordion",z.CdxAccordion).component("cdx-label",z.CdxLabel).component("cdx-popover",z.CdxPopover).component("action-accordion",S0).component("action-button",k0).component("action-container",w0).component("action-content",n0).component("submit-form",j1).component("comment-action",e0).component("change-status-action",h2).component("block-action",W1).component("link-action",$1).component("management-action",v2).component("archive-action",t0).component("move-action",z2).component("section-action",d2).component("user-lookup",q1).component("page-lookup",M1).component("expiry-input",d1).component("tag-popover",Q1).directive("tooltip",z.CdxTooltip).mount(F);break}case"checkuser":{d.createMwApp(u1,{state:V,feedbackDialog:M,openButton:a,view:"checkuser"}).component("cdx-button",z.CdxButton).component("cdx-checkbox",z.CdxCheckbox).component("cdx-field",z.CdxField).component("cdx-icon",z.CdxIcon).component("cdx-label",z.CdxLabel).component("cdx-lookup",z.CdxLookup).component("cdx-message",z.CdxMessage).component("cdx-popover",z.CdxPopover).component("cdx-progress-indicator",z.CdxProgressIndicator).component("cdx-select",z.CdxSelect).component("cdx-table",z.CdxTable).component("cdx-text-input",z.CdxTextInput).component("cdx-toggle-button-group",z.CdxToggleButtonGroup).component("submit-form",j1).component("block-action",W1).component("link-action",$1).component("user-lookup",q1).component("page-lookup",M1).component("expiry-input",d1).component("tag-popover",Q1).directive("tooltip",z.CdxTooltip).mount(F);break}case"category":{if(!c?.[1]){console.error("spiHelper bootstrap: expected targetSock");return}d.createMwApp(u1,{state:V,feedbackDialog:M,openButton:a,view:"category",defaultCase:c[1]}).component("cdx-button",z.CdxButton).component("cdx-checkbox",z.CdxCheckbox).component("cdx-field",z.CdxField).component("cdx-icon",z.CdxIcon).component("cdx-label",z.CdxLabel).component("cdx-lookup",z.CdxLookup).component("cdx-message",z.CdxMessage).component("cdx-popover",z.CdxPopover).component("cdx-progress-indicator",z.CdxProgressIndicator).component("cdx-select",z.CdxSelect).component("cdx-table",z.CdxTable).component("cdx-text-input",z.CdxTextInput).component("cdx-toggle-button-group",z.CdxToggleButtonGroup).component("submit-form",j1).component("block-action",W1).component("link-action",$1).component("user-lookup",q1).component("page-lookup",M1).component("expiry-input",d1).component("tag-popover",Q1).directive("tooltip",z.CdxTooltip).mount(F);break}case"si":{d.createMwApp(u1,{state:V,feedbackDialog:M,openButton:a,view:"si"}).component("cdx-button",z.CdxButton).component("cdx-checkbox",z.CdxCheckbox).component("cdx-field",z.CdxField).component("cdx-icon",z.CdxIcon).component("cdx-label",z.CdxLabel).component("cdx-lookup",z.CdxLookup).component("cdx-message",z.CdxMessage).component("cdx-popover",z.CdxPopover).component("cdx-progress-indicator",z.CdxProgressIndicator).component("cdx-select",z.CdxSelect).component("cdx-table",z.CdxTable).component("cdx-text-input",z.CdxTextInput).component("cdx-toggle-button-group",z.CdxToggleButtonGroup).component("submit-form",j1).component("block-action",W1).component("link-action",$1).component("user-lookup",q1).component("page-lookup",M1).component("expiry-input",d1).component("tag-popover",Q1).directive("tooltip",z.CdxTooltip).mount(F);break}}}if(i5(d,z,M),mw.config.get("wgCategories").includes("SPI cases awaiting archive")&&m())s5(d,z,V);window.addEventListener("beforeunload",(F)=>{if(q2())F.preventDefault()})})}function i5(h,v,d){let z=mw.util.addPortletLink("p-cactions","#",G==="production"?"SPI-Options":"SPI-Beta-Options","ca-spiHelperOpts","Modify spiHelper settings");if(z){let M=document.body.appendChild(document.createElement("div"));h.createMwApp(w2,{feedbackDialog:d,openButton:z,toaster:v.useToast()}).component("cdx-button",v.CdxButton).component("cdx-dialog",v.CdxDialog).component("cdx-field",v.CdxField).component("cdx-lookup",v.CdxLookup).component("cdx-select",v.CdxSelect).component("cdx-toggle-switch",v.CdxToggleSwitch).component("cdx-accordion",v.CdxAccordion).component("cdx-text-input",v.CdxTextInput).component("cdx-icon",v.CdxIcon).component("cdx-message",v.CdxMessage).component("cdx-multiselect-lookup",v.CdxMultiselectLookup).component("watch-setting",E0).component("expiry-setting",O0).component("expiry-input",d1).component("log-page-setting",C0).component("page-lookup",M1).mount(M)}}function s5(h,v,d){let z=mw.util.addPortletLink("p-cactions","#",G==="production"?"SPI-Archive":"SPI-Beta-Archive","ca-spiHelperArchive","Run one click archival");if(z){let M=document.body.appendChild(document.createElement("div"));h.createMwApp(M2,{state:d,activateButton:z}).component("cdx-dialog",v.CdxDialog).component("cdx-message",v.CdxMessage).component("cdx-progress-bar",v.CdxProgressBar).mount(M)}}function t5(h,v){let d=h.createMwApp(b5).component("cdx-toast-container",v.CdxToastContainer),z=document.body.appendChild(document.createElement("div"));d.mount(z)}})();

// </nowiki>
