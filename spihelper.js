// {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=refs/heads/build/stable|path=spihelper.js}}
// v3.3.1
// <nowiki>
'use strict';
(()=>{var z1={editorInteractionAnalyser:{baseUrl:(h)=>new URL("https://sigma.toolforge.org/editorinteract.py"),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},interactionTimeline:{baseUrl:(h)=>new URL("https://interaction-timeline.toolforge.org"),startingParams:new URLSearchParams("wiki=enwiki"),userQueryStringKey:"user",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},SPITools:{timecard:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timecard/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},consolidatedTimeline:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timeline/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},pages:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/pages/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0}},sandals:{timecard:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timecard"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},consolidatedTimeline:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timeline"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},pages:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/pages"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},summaries:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/summaries"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1}},checkUserWikiSearch:{baseUrl:(h)=>new URL("https://checkuser.wikimedia.org/w/index.php"),startingParams:new URLSearchParams("ns0=1"),userQueryStringKey:"search",userQueryStringSeparator:" OR ",userQueryStringWrapper:'"',multipleUserQueryStringKeys:!1},interleaved:{baseUrl:(h)=>new URL("https://interleaved.toolforge.org/"),userQueryStringKey:"user",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1}};var a=/{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i,q1=/^closed?$/i,D0=/{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu-?)?endorse|inprogress|(?:cu\s?)?decline(?:-ip)?|(?:cu)?moreinfo|relisted|onhold)}}/i,G2=/====\s*Suspected sockpuppets\s*====\n*/i,D1=/\n*\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i,k1=/{{(checkuserblock(-account|-wide)?|checkuser block)}}/i,l1=/{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i,l0=/{{spipriorcases}}/i,F1=/^(?:===[^=]*===|=====[^=]*=====)\s*$/m,U2=/\u200E/g,B0=/(?<!~)~~~~(?!~)/;var G0=" (using [[:w:en:WP:SPIH-D|SPIH-D]])",I2={title:new mw.Title("User talk:DatGuy/spihelper"),bugsLink:"//github.com/DatGuy1/spihelper/issues/new",showUseragentCheckbox:!0,useragentCheckboxMessage:"I want to share my user agent publicly alongside my feedback. This is optional."},k="3.3.1",p="production",B1={watch:{case:"preferences",archive:"nochange",tagged:"preferences",categories:"nochange",blocked:!0},expiry:{case:"indefinite",archive:"indefinite",tagged:"indefinite",categories:"indefinite",blocked:"indefinite"},log:{enabled:!1,reversed:!1,page:"spihelper_log"},clerk:!0,tickArchiveWhenCaseClosed:!1,useCheckuserblockAccount:mw.config.get("wgUserGroups")?.includes("checkuser")??!1,useLookup:!0,defaultActions:["comment"],interface:{defaultBlockDuration:"indefinite",displayIPv6As64:!0,fullPreview:!1,pinned:!0,buttonLayout:!1},highlightSection:!0,custom:{commentTemplates:[]},debug:{enabled:!1,forceCheckuser:!1,forceAdmin:!1},lastSeenVersion:"3.3.1"};var c2=[{label:"Results",items:[{value:"{{confirmed}}",label:"Confirmed"},{value:"{{confirmed-nc}}",label:"Confirmed, no comment for IPs"},{value:"{{tallyho}}",label:"Indistinguishable"},{value:"{{highly likely}}",label:"Highly likely"},{value:"{{likely}}",label:"Likely"},{value:"{{possilikely}}",label:"Possilikely"},{value:"{{possible}}",label:"Possible"},{value:"{{unlikely}}",label:"Unlikely"},{value:"{{unrelated}}",label:"Unrelated"},{value:"{{inconclusive}}",label:"Inconclusive"},{value:"{{IPstale}}",label:"Stale"}]},{label:"Addendums",items:[{value:"{{behav}}",label:"Needs behavioral evaluation"},{value:"{{nosleepers}}",label:"No sleepers"},{value:"{{ncip}}",label:"No comment for IPs"}]},{label:"Novelties",items:[{value:"{{8ball}} ",label:"Magic 8-Ball"},{value:"{{crystalball",label:"Not a crystal ball"},{value:"{{fishing}}",label:"Not fishing"},{value:"{{pixiedust}}",label:"Not pixie dust"}]}],C2=[{label:"Ducks",items:[{value:"{{duck}}",label:"Duck"},{value:"{{megaphone duck}}",label:"Megaphone duck"},{value:"{{megaphone duck|ultimate}}",label:"Ultimate duck"}]},{label:"Results",items:[{value:"{{IPblock}}",label:"IP blocked"},{value:"{{bnt}}",label:"Blocked and tagged"},{value:"{{bwt}}",label:"Blocked without tags"},{value:"{{sblock}}",label:"Blocked, awaiting tags"},{value:"{{btc}}",label:"Blocked, tagged, closed"},{value:"{{Action and close}}",label:"Requested actions completed, closing"},{value:"{{Closing without action}}",label:"Closing without action"}]},{label:"Other",items:[{value:"{{subst:DiffsNeeded|moreinfo}}",label:"Diffs needed"},{value:"{{GlobalLocksRequested}}",label:"Locks requested"},{value:"{{Decline-IP}}",label:"IP check declined"}]}];class j{type;content;isHtml;_index;constructor(h){this.type=h.type,this.content=h.content,this.isHtml=h.isHtml}show(){let h=S.length;return S.push(this),this._index=h,this}update(h){if(this._index===void 0)return Object.assign(this,h),this.show(),this;let z=S[this._index];if(z)Object.assign(z,h);return Object.assign(this,h),this}}var S=[];mw.loader.using(["vue"],(h)=>{S=h("vue").reactive(S)});class g{username;crosswiki;deny;notalk;moot;constructor(h){this.username=h?.username??Z.caseName,this.crosswiki=h?.crosswiki??!1,this.deny=h?.deny??!1,this.notalk=h?.notalk??!1,this.moot=h?.moot??!1}generateWikitext(){let h="{{SPI archive notice|1="+this.username;if(this.crosswiki)h+="|crosswiki=yes";if(this.deny)h+="|deny=yes";if(this.notalk)h+="|notalk=yes";if(this.moot)h+="|moot=yes";return h+="}}",h}}class w{master;status;locked;evidence;altmaster;altmasterStatus;constructor(h){this.master=h.master,this.status=h.status,this.locked=h.locked??!1,this.evidence=h.evidence??"",this.altmaster=h.altmaster??"",this.altmasterStatus=h.altmasterStatus}generateWikitext(h){let z="{{sockpuppet";if(z+=`
| 1 = ${this.master}`,z+=`
| 2 = ${this.status}`,this.locked)z+=`
| locked = yes`;if(h===!1)z+=`
| notblocked = yes`;if(this.evidence)z+=`
| evidence = ${this.evidence}`;if(this.altmaster)z+=`
| altmaster = ${this.altmaster}`,z+=`
| altmaster-status = ${this.altmasterStatus??"suspected"}`;return z+=`
}}`,z}clone(){return new w({master:this.master,status:this.status,evidence:this.evidence,altmaster:this.altmaster,altmasterStatus:this.altmasterStatus})}equals(h){if(!(h instanceof w))return!1;return this.master===h.master&&this.status===h.status&&this.locked===h.locked&&this.evidence===h.evidence&&this.altmaster===h.altmaster&&this.altmasterStatus===h.altmasterStatus}}class v1{status;checked;locked;ltapage;spipage;evidence;constructor(h){this.status=h.status,this.checked=h.checked??!1,this.locked=h.locked??!1,this.ltapage=h.ltapage??"",this.spipage=h.spipage??"",this.evidence=h.evidence??""}generateWikitext(){let h="{{sockpuppeteer",z=this.status==="banned"?"banned":"blocked",v=this.checked||this.status!=="blocked";if(h+=`
| 1 = ${z}`,v)h+=`
| checked = yes`;if(this.locked)h+=`
| locked = yes`;if(this.ltapage)h+=`
| ltapage = ${this.ltapage}`;if(this.spipage)h+=`
| spipage = ${this.spipage}`;if(this.evidence)h+=`
| evidence = ${this.evidence}`;return h+=`
}}`,h}clone(){return new v1({status:this.status,checked:this.checked,ltapage:this.ltapage,spipage:this.spipage,evidence:this.evidence})}equals(h){if(!(h instanceof v1))return!1;return this.status===h.status&&this.checked===h.checked&&this.locked===h.locked&&this.ltapage===h.ltapage&&this.spipage===h.spipage&&this.evidence===h.evidence}}var E2=["sections","management","block","status","link","comment","move","archive"];var O2=[{label:"Follow preferences",value:"preferences"},{label:"No change",value:"nochange"},{label:"Watch",value:"watch"},{label:"Unwatch",value:"unwatch"}],x2=["preferences","watch","nochange","unwatch"],p2={analyser:!1,timeline:!1,timecard:!1,pages:!1,summary:!1,cuwiki:!1,interleaved:!1};function r(h){let z=[],v=h.trim().matchAll(/\{\{([\s\S]+?)}}/g);for(let M of v){if(!M[1])continue;z.push(U0(M[1]))}return z}function w5(h){let z=[],v=0,M="";for(let V=0;V<h.length;V++){let d=h.charAt(V),H=h.charAt(V+1);if(d==="["&&H==="["||d==="{"&&H==="{")v++,M+=d+H,V++;else if(d==="]"&&H==="]"||d==="}"&&H==="}")v--,M+=d+H,V++;else if(d==="|"&&v===0)z.push(M),M="";else M+=d}return z.push(M),z}function U0(h){let z=w5(h).map((d)=>d.trim()),v=z.shift()?.toLowerCase()??"unknown",M={},V=[];for(let d of z){let H=d.indexOf("=");if(H!==-1){let L=d.slice(0,H).trim().toLowerCase(),f=d.slice(H+1).trim();if(f===""){M[L]=f;continue}let F=Number(f);if(!Number.isNaN(F)){M[L]=F;continue}let W=g5(f);if(W===null){M[L]=f;continue}M[L]=W}else if(d)V.push(d)}return{name:v,params:M,positional:V}}function g5(h){if(["y","yes","true","on"].includes(h.toLowerCase()))return!0;if(["n","no","false","off"].includes(h.toLowerCase()))return!1;return null}function N2(h){let z=[];for(let v of h.positional)z.push(v);for(let[v,M]of Object.entries(h.params))if(!Number.isNaN(Number(v)))z.push(M.toString());return z}function G1(h){if(h.startsWith("m:")||h.startsWith("meta:"))return h.slice(h.indexOf(":")+1);else return h}function U1(){return mw.config.get("wgPageParseReport").limitreport.postexpandincludesize.limit}function I1(){let h=mw.config.get("wgServer").replace(/^(https?)?:?\/\//,"").split("."),z=h[0],v=h[1];if(z===void 0||v===void 0)return"";let M;switch(v){case"wikimedia":switch(z){case"commons":case"meta":case"species":case"incubator":case"outreach":M=z;break;default:break}break;case"mediawiki":M="mw";break;case"wikidata":switch(z){case"test":M="testwikidata";break;case"www":M="d";break;default:break}break;case"wikipedia":switch(z){case"test":M="testwiki";break;case"test2":M="test2wiki";break;default:M="w:"+z;break}break;case"wiktionary":M="wikt:"+z;break;case"wikiquote":M="q:"+z;break;case"wikibooks":M="b:"+z;break;case"wikinews":M="n:"+z;break;case"wikisource":M="s:"+z;break;case"wikiversity":M="v:"+z;break;case"wikivoyage":M="voy:"+z;break;default:return""}return`:${M}:`}function o(h){if(h=h.replace(U2,""),h=h.trim(),mw.util.isIPAddress(h,!0))h=h.toUpperCase();else if(h)try{h=new mw.Title(h).getMainText()}catch(z){console.error(`Failed to parse username: ${h}.`,z)}return h}function W1(h){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(h)}function I0(h){return mw.util.isInfinity(h)}var r5=["second","seconds","minute","minutes","hour","hours","day","days","week","weeks","month","months","year","years"],o5=new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${r5.join("|")})$`,"i");function n5(h){return o5.test(h)}function $1(h){if(I0(h))return h;if(W1(h))return h;if(n5(h))return h;return null}function E(h){return mw.util.isIPAddress(h,!0)||mw.util.isTemporaryUser(h)}function w1(h){return B0.test(h)?h:h.trimEnd()+" ~~~~"}function T(h,z){return z??=h,$("<a>").attr("href",mw.util.getUrl(h)).attr("title",h).text(z).prop("outerHTML")}function c0(h,z,v){return v??=h,$("<a>").attr("href",h).attr("title",v).text(z).prop("outerHTML")}function g1(h){let{blockedUsers:z,taggedUsers:v,lockedUsers:M}=h,V="",d=z.filter(Boolean);if(d.length>0)V+=`
** blocked `+d.join(", ");let H=v.filter(Boolean);if(H.length>0)V+=`
** tagged `+H.join(", ");if(M.length>0)V+=`
** requested locks for `+M.map((L)=>`{{noping|1=${L}}}`).join(", ");return V}function R2(h){let z=h.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(`^(={3}|={5})\\s*(<big>)?${z}(</big>)?\\s*(={3}|={5})\\s*$`,"m")}function i5(h,z=0,v){let M=h.length;if(v){let V=R2(v),d=h.slice(z+1).match(V);if(d?.index!==void 0)M=z+d.index}return h.slice(z,M).trim()}function M1(h,z){return z.sort((M,V)=>M.header.getTime()-V.header.getTime()),h.slice(0,m2(h))+`
`+z.map((M)=>M.fullText).join(`

`)}function m2(h){return F1.exec(h)?.index??h.length}function b1(h,z){let v=[];if(z.length===0)return v;let M=m2(h),V=h.slice(M);for(let d=0;d<z.length;d++){let H=z[d];if(!H)continue;let L=H.name,f=R2(L),F=V.match(f);if(!F)continue;let W=F.index;if(W===void 0)continue;let q=i5(V,W,z[d+1]?.name);if(q){let y=r1(L);if(y===null)return new j({type:"error",content:`Failed to parse date from section header "${L}" in archive`}).show(),null;v.push({header:y,fullText:q})}V=V.slice(W+q.length)}return v}function r1(h){let z=new Date(h);if(!isNaN(z.getTime()))return z;return null}function P2(){return{block:!1,duration:"",acb:!0,abao:!0,ntp:!1,nem:!1,tags:[],lock:!1}}function o1(h=""){return{options:{noBlock:!1,override:!1,tagUnattached:!0,cuBlock:!1,cuBlockOnly:!1,addMasterNotice:!0,addSockNotice:!0,blankTalk:!1,lockHideNames:!1},userLocks:new Map,userBlocks:new Map,userTags:new Map,master:h,lockcomment:"",skipCUVerifyUsers:new Set}}function n1(h){let z=[],v=r(h);for(let M of v)if(["sockpuppeteer","sockmaster"].includes(M.name)){let V=(M.params["1"]??M.positional[0])?.toString(),d=V==="cu"||(V?.includes("confirmed")??!1),H=M.params.checked===!0||d,L;if(d)L="confirmed";else if(V==="banned")L="banned";else if(V?.includes("blocked"))L=H?"confirmed":"blocked";else{console.warn("Unrecognised master status",V);continue}let f=new v1({status:L,checked:H});if(M.params.locked===!0)f.locked=!0;if(M.params.ltapage)f.ltapage=M.params.ltapage;if(M.params.spipage)f.spipage=M.params.spipage;if(M.params.evidence)f.evidence=M.params.evidence;z.push(f)}else if(["sockpuppet","sock"].includes(M.name)){let V=M.params["1"]??M.positional[0];if(!V){console.warn("Master parameter not found");continue}let d=M.params["2"]??M.positional[1],H;switch(d){case"blocked":H="blocked";break;case"proven":H="proven";break;case"confirmed":case"nbconfirmed":case"cuconfirmed":H="confirmed";break;default:console.warn("Unrecognised sock status",d);continue}let L=new w({master:V,status:H}),f=M.params.altmaster;if(f){let F=M.params["altmaster-status"],W;switch(F){case"suspect":case"suspected":W="suspected";break;case"proven":W="proven";break;default:console.warn("Unrecognised altmaster status",F);break}if(W)L.altmaster=f,L.altmasterStatus=W}if(M.params.evidence)L.evidence=M.params.evidence;if(M.params.locked)L.locked=!0;z.push(L)}return z}function i(h){return h instanceof w}function j1(h){return h instanceof v1}var c1=new Map;function N(h){c1.set(h,"running")}function U(h,z){c1.set(h,z)}function a2(){for(let h of c1.values())if(h==="running")return!0;return!1}function Q1(h){return c1.get(h)==="running"}function i1(h){return c1.get(h)}async function T2(h){let z=K(),v={action:"query",list:"blocks",bklimit:1,bkusers:h,bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let M=await z.get(v),[V]=M.query.blocks;if(!V)return null;return{username:h,duration:V.expiry,acb:V.nocreate,abao:V.autoblock||V.anononly,ntp:!V.allowusertalk,nem:V.noemail,reason:V.reason}}catch{return null}}async function C1(h){if(h.length===0)return new Map;let z=K(),v=new Map,M=await o2();return await Promise.all(r2(h,M).map(async(V)=>{let d={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:V,formatversion:"2"};try{let H=await z.post(d);for(let L of H.query.pages){if(L.missing)continue;let f=L.revisions?.[0];if(!f)continue;let F=L.title.split(":",2)[1];if(!F){console.error("spiHelperGetBulkPageText: could not find name for",L.title);continue}v.set(F,f.slots.main.content)}}catch(H){console.error("spiHelperGetBulkPageText fetch error:",H)}})),v}async function s1(h){if(h.size===0)return new Map;let z=K(),v=new Map,M=await o2();return await Promise.all(r2([...h],M).map(async(V)=>{let d={action:"query",list:"blocks",bklimit:"max",bkusers:V,bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let H=await z.post(d);for(let L of H.query.blocks)v.set(L.user,{username:L.user,duration:L.expiry,acb:L.nocreate,abao:L.autoblock||L.anononly,ntp:!L.allowusertalk,nem:L.noemail,reason:L.reason})}catch(H){console.error("spiHelperGetBulkUserBlockSettings fetch error:",H)}})),v}async function y1(h){let z=K(),v={action:"query",list:"globalallusers",agulimit:1,agufrom:h,aguto:h,aguprop:["lockinfo","existslocally"]};try{let M=await z.get(v),[V]=M.query.globalallusers;if(!V)return null;return{name:V.name,existsLocally:"existslocally"in V,locked:"locked"in V}}catch{return null}}async function x0(h,z){let v=K(),M={action:"query",list:"allusers",aulimit:z,auprefix:h,auprop:["blockinfo"],formatversion:"2"};try{return(await v.get(M)).query.allusers}catch{return[]}}async function p0(h,z,v){let M=K(),V={action:"query",list:"allpages",aplimit:v,apprefix:h,apnamespace:z,formatversion:"2"};try{return(await M.get(V)).query.allpages}catch{return[]}}async function N0(h,z){let v="delete_"+h;N(v);let M=T(h),V=new j({type:"notice",content:`Deleting ${M}`,isHtml:!0}).show(),d=K(h),H={action:"delete",title:h,reason:z};try{await d.postWithToken("csrf",H),V.update({type:"success",content:`Deleted ${M}`}),U(v,"success")}catch(L){V.update({type:"error",content:`Failed to delete ${M}: ${mw.html.escape(JSON.stringify(L))}`}),U(v,"failed")}}async function S2(h,z){let v="undelete_"+h;N(v);let M=T(h),V=new j({type:"notice",content:`Undeleting ${M}`,isHtml:!0}).show(),d=K(h),H={action:"undelete",title:h,reason:z};try{await d.postWithToken("csrf",H),V.update({type:"success",content:`Undeleted ${M}`}),U(v,"success")}catch(L){V.update({type:"error",content:`Failed to undelete ${M}: ${mw.html.escape(JSON.stringify(L))}`}),U(v,"failed")}}async function R0(h,z){let v={action:"parse",prop:"text",pst:!0,text:z,title:h};try{return(await K(h).post(v)).parse?.text["*"]??""}catch(M){return console.error("Error rendering text:",M),""}}async function V1(h){let{pageName:z,content:v}=h,M={action:"parse",prop:"tocdata",formatversion:"2"};if(z!==void 0)M.page=z;else if(v!==void 0)M.text=v,M.contentmodel="wikitext";else return console.error("spiHelperGetInvestigationSections: No page name or content provided"),[];let V=K();try{let d=await V.post(M);if(!d.parse)return console.error("spiHelperGetInvestigationSections: Could not parse sections"),[];let H=[];for(let L of d.parse.tocdata.sections)if(L.tocLevel===2||L.hLevel===3)H.push(new k0(parseInt(L.index),L.line));return H}catch(d){return console.warn("spiHelperGetInvestigationSections API error:",d),[]}}async function u2(h){let z=K(),v={action:"query",format:"json",list:"backlinks",bltitle:h,blnamespace:4,bldir:"ascending",blfilterredir:"nonredirects"};try{return(await z.get(v)).query.backlinks.filter((V)=>{return V.title.startsWith("Wikipedia:Sockpuppet investigations/")&&!V.title.startsWith("Wikipedia:Sockpuppet investigations/SPI/")&&!/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(V.title)})}catch{return[]}}async function m0(h){let z=K(),v={action:"query",format:"json",prop:"info",titles:h,inprop:"protection",formatversion:"2"};try{let M=await z.get(v),[V]=M.query.pages;return V?.protection??[]}catch{return[]}}async function P0(h){let z=K(),v={action:"query",format:"json",prop:"flagged",titles:h,formatversion:"2"};try{let M=await z.get(v),[V]=M.query.pages;return V?.flagged??null}catch{return null}}async function a0(h,z){let v="protect_"+h;N(v);let M=T(h),V=new j({type:"notice",content:`Protecting ${M}`,isHtml:!0}),d=K();try{let H="",L="";z.forEach((F)=>{if(H!=="")H=H+"|",L=L+"|";H=H+F.type+"="+F.level,L=L+F.expiry});let f={action:"protect",format:"json",title:h,protections:H,expiry:L,reason:"Restoring protection after history merge"};await d.postWithToken("csrf",f),V.update({type:"success",content:`Protected ${M}`}),U(v,"success")}catch(H){V.update({type:"error",content:`Failed to protect ${M}: ${mw.html.escape(JSON.stringify(H))}`}),U(v,"failed")}}async function T0(h,z){if(z.level==="")return;let v="stabilize_"+h;N(v);let M=K(),V={action:"stabilize",format:"json",titles:h,protectlevel:z.level,expiry:z.expiry,reason:"Restoring pending changes protection after history merge"};try{await M.postWithToken("csrf",V),U(v,"success")}catch{U(v,"failed")}}async function k2(){let h=K(),z={action:"query",format:"json",meta:"siteinfo",siprop:"restrictions"};try{return(await h.get(z)).query.restrictions}catch{return{types:[],levels:[],cascadinglevels:[],semiprotectedlevels:[]}}}async function w2(h){let{user:z,duration:v,reason:M,reblock:V,anononly:d,accountcreation:H,autoblock:L,notalkpage:f,noemail:F,watchBlockedUser:W,watchExpiry:q="indefinite"}=h,y="block_"+z;N(y);let J="User:"+z,Y=T(J),_=new j({type:"notice",content:`Blocking ${Y}`,isHtml:!0}).show(),X=K(),G={action:"block",expiry:v,reason:M,reblock:V,anononly:d,nocreate:H,autoblock:L,allowusertalk:!f,noemail:F,watchuser:W,watchlistexpiry:q,user:z,formatversion:"2"};try{let D=await X.postWithToken("csrf",G),m=c0(mw.util.getUrl("Special:BlockList",{wpTarget:`#${D.block.id}`}),"Blocked","Special:BlockList");return _.update({type:"success",content:`${m} user ${Y}`}),U(y,"success"),!0}catch(D){return _.update({type:"error",content:`Failed to block ${Y}: ${mw.html.escape(JSON.stringify(D))}`}),U(y,"failed"),!1}}async function E1(h){let{sourcePage:z,destPage:v,summary:M,ignoreWarnings:V,suppressRedirect:d=!1,moveSubpages:H=!0}=h,L="move_"+z+"_"+v;N(L);let f=K(),F=T(z),W=T(v),q=new j({type:"notice",content:`Moving ${F} to ${W}`,isHtml:!0}).show(),y={action:"move",from:z,to:v,reason:M+G0,noredirect:d,movesubpages:H,ignoreWarnings:V};try{await f.postWithToken("csrf",y),q.update({type:"success",content:`Moved ${F} to ${W}`}),U(L,"success")}catch(J){q.update({type:"error",content:`Failed to move ${F} to ${W}: ${mw.html.escape(JSON.stringify(J))}`}),U(L,"failed")}}async function I(h){let{title:z,newText:v,summary:M,createonly:V=!1,watch:d,watchExpiry:H,baseRevId:L,sectionId:f}=h,F=`edit_${z}`;if(f)F+=`_${f}`;N(F);let W=T(z),q=new j({type:"notice",content:"Editing "+W,isHtml:!0}).show(),y=K(z),J=G1(z),Y={action:"edit",watchlist:d,summary:M+G0,text:v,title:J,createonly:V,formatversion:"2"};if(f)Y.section=f.toString();if(H)Y.watchlistexpiry=H;if(L)Y.baserevid=L;try{let _=await y.postWithToken("csrf",Y),X=_.edit.newrevid;if(!X)return q.update({type:"error",content:`Edit failed on ${W}: ${mw.html.escape(JSON.stringify(_))}`}),console.error(_),U(F,"failed"),null;let G=c0(mw.util.getUrl("",{diff:X}),"Saved",`View diff ${X}`);return q.update({type:"success",content:`${G} page ${W}`,isHtml:!0}),U(F,"success"),_.edit.newrevid??null}catch(_){return q.update({type:"error",content:`Edit failed on ${W}: ${mw.html.escape(JSON.stringify(_))}`,isHtml:!0}),console.error(_),U(F,"failed"),null}}async function B(h,z,v){let M=T(h),V=new j({type:"notice",content:"Getting page "+M,isHtml:!0});if(z)V.show();let H={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:G1(h),formatversion:"2"};if(v)H.rvsection=v.toString();try{let f=(await K(h).get(H)).query.pages[0];if(!f||"missing"in f){if(z)V.update({type:"warning",content:`Page ${M} does not exist`,isHtml:!0});return""}let F=f.revisions?.[0];if(!F)return"";if(z)V.update({type:"success",content:`Got ${M}`,isHtml:!0});return F.slots.main.content}catch(L){if(z)V.update({type:"error",content:`Failed to get ${M}: ${mw.html.escape(JSON.stringify(L))}`,isHtml:!0});return""}}async function t1(h){let v={action:"query",prop:"revisions",rvslots:"main",rvprop:"ids",titles:G1(h),formatversion:"2"};try{let V=(await K(h).get(v)).query.pages[0];if(!V||"missing"in V)return 0;let d=V.revisions?.[0];if(!d)return 0;return d.revid}catch{return 0}}async function S0(h,z){let M={action:"parse",prop:"limitreportdata",page:G1(h)};if(z)M.section=z.toString();let V=K(h);try{let d=await V.get(M);return Number(d.parse?.limitreportdata.find((H)=>H.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function e1(h){let z=K(),v={action:"parse",prop:"limitreportdata",text:h,contentmodel:"wikitext"};try{let M=await z.post(v);return Number(M.parse?.limitreportdata.find((V)=>V.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function g2(h){let z=K(),v={action:"parse",prop:"text",text:h,wrapoutputclass:"",disablelimitreport:!0,disableeditsection:!0,contentmodel:"wikitext"};try{return(await z.post(v)).parse?.text["*"]??""}catch{return""}}async function u0(h){let z=K(),v={action:"query",list:"categorymembers",cmtitle:h,cmlimit:"max",cmnamespace:2,formatversion:"2"};try{return(await z.get(v)).query.categorymembers.map((V)=>V.title)}catch{return[]}}function r2(h,z){let v=[];for(let M=0;M<h.length;M+=z)v.push(h.slice(M,M+z));return v}async function o2(){return(await mw.user.getRights()).includes("apihighlimits")?500:50}var C0=`MediaWiki-JS/${mw.config.get("wgVersion")} spihelper/${k}`,E0={meta:new mw.ForeignApi("https://meta.wikimedia.org/w/api.php",{userAgent:C0}),local:new mw.Api({userAgent:C0})};function K(h){if(h&&(h.startsWith("m:")||h.startsWith("meta:")))return E0.meta;else return E0.local}function n2(){if(mw.config.get("wgWikiID")==="enwiki")return E0.local;return new mw.ForeignApi("https://en.wikipedia.org/w/api.php",{userAgent:C0})}class O1{pageName;prefixedName;caseName;userName;archiveName;casePageName;isArchive;valid;startingRevId;source;constructor(h,z=!1,v="spi"){if(this.pageName=h,this.prefixedName=I1()+h,this.source=v,this.isArchive=/Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(h),this.caseName=s5(h,this.isArchive),this.userName=o(this.caseName),this.casePageName="Wikipedia:Sockpuppet investigations/"+this.caseName,this.archiveName=h+"/Archive",this.valid=!!this.caseName.trim(),z)this.startingRevId=mw.config.get("wgCurRevisionId");else this.startingRevId=0}async refreshRevId(){this.startingRevId=await t1(this.pageName)}async edit(h){return I({title:this.pageName,newText:h.newText,summary:h.summary,createonly:h.createonly??!1,watch:h.watch,watchExpiry:h.watchExpiry,baseRevId:h.baseRevId,sectionId:h.sectionId})}}function s5(h,z){let v=h.replace(/^Wikipedia:Sockpuppet investigations\//,"");return z?v.replace(/\/Archive.*/,""):v}function t5(h){return h.replaceAll(/_/g," ")}var Z;function h0(h,z="spi"){Z=new O1(t5(h),h===mw.config.get("wgPageName"),z)}function x1(h){return Z.valid?h+` per [[${Z.prefixedName}]]`:h}function i2(h){if(h?.type==="single")return[h.section];if(h?.type==="multiple")return h.sections;return[]}class w0{sections;selectedSection;archiveNotice;_text=null;_loadingPromise=null;constructor(h=[],z=null,v=null){if(this.sections=h,z)this.selectedSection={type:"single",section:z};else this.selectedSection=null;this.archiveNotice=v}}class k0{id;name;_text=null;_loadingPromise=null;constructor(h,z){this.id=h,this.name=z}}async function n(h,z={}){let{purge:v=!1,show:M=!1}=z;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!v)return h._text;return h._loadingPromise=B(Z.pageName,M),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}async function Y1(h){h.sections=await V1({pageName:Z.pageName})}async function c(h,z={}){let{purge:v=!1,show:M=!1}=z;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!v)return h._text;return h._loadingPromise=B(Z.pageName,M,h.id),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}var Q=(h)=>h;var g0=Q({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,watchOptions:O2,messages:{error:"Watch option is invalid"}}},computed:{status(){return x2.includes(this.internalValue)?"default":"error"}},watch:{resetTrigger(){this.internalValue=this.modelValue},internalValue(h){this.$emit("update:modelValue",h)}},template:`
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ this.label }}</template>
      <cdx-select
          :menu-items="watchOptions"
          v-model:selected="internalValue"
      />
    </cdx-field>
  `});var r0=Q({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,touched:!1,isResetting:!1}},watch:{resetTrigger(){this.isResetting=!0,this.internalValue=this.modelValue,this.touched=!1,this.$nextTick(()=>{this.isResetting=!1})},internalValue(h){if(!this.isResetting)this.touched=!0;if(h===""||$1(h)!==null)this.$emit("update:modelValue",h)}},template:`
    <expiry-input :label="label" :touched="touched" v-model="internalValue" />
  `});var o0=Q({props:{modelValue:{type:String,required:!0},prefix:{type:String,required:!0}},data(){return{inputValue:this.modelValue,messages:{error:"Page name is invalid"},resetValue:"spihelper_log"}},computed:{valid(){return this.inputValue.length>0&&mw.Title.newFromText(this.prefix+this.inputValue)!==null},status(){return this.valid?"default":"error"}},watch:{inputValue(h){if(this.valid)this.$emit("update:modelValue",h)}},methods:{resetInput(){this.inputValue=this.resetValue}},template:`
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
  `});async function s2(h){return!(await g2("{{#time:r|"+h+"}}")).includes("Error: Invalid time.")}function z0(h){return`User:${mw.config.get("wgUserName")}/${h}`}var e5=[{oldPath:"watchCase",newPath:["watch","case"],type:"WatchOption"},{oldPath:"watchArchive",newPath:["watch","archive"],type:"WatchOption"},{oldPath:"watchTaggedUser",newPath:["watch","tagged"],type:"WatchOption"},{oldPath:"watchNewCats",newPath:["watch","categories"],type:"WatchOption"},{oldPath:"watchBlockedUser",newPath:["watch","blocked"],type:"boolean"},{oldPath:"watchCaseExpiry",newPath:["expiry","case"],type:"expiry"},{oldPath:"watchArchiveExpiry",newPath:["expiry","archive"],type:"expiry"},{oldPath:"watchTaggedUserExpiry",newPath:["expiry","tagged"],type:"expiry"},{oldPath:"watchNewCatsExpiry",newPath:["expiry","categories"],type:"expiry"},{oldPath:"watchBlockedUserExpiry",newPath:["expiry","blocked"],type:"expiry"},{oldPath:"clerk",newPath:["clerk"],type:"boolean"},{oldPath:"log",newPath:["log","enabled"],type:"boolean"},{oldPath:"reversed_log",newPath:["log","reversed"],type:"boolean"},{oldPath:"tickArchiveWhenCaseClosed",newPath:["tickArchiveWhenCaseClosed"],type:"boolean"},{oldPath:"useCheckuserblockAccount",newPath:["useCheckuserblockAccount"],type:"boolean"},{oldPath:"displayIPv6As64",newPath:["interface","displayIPv6As64"],type:"boolean"},{oldPath:"debugForceCheckuserState",newPath:["debug","forceCheckuser"],type:"boolean"},{oldPath:"debugForceAdminState",newPath:["debug","forceAdmin"],type:"boolean"}];function h3(h,z,v){let M=h;for(let d=0;d<z.length-1;d++){if(!z[d])throw Error(`Path segment "${z.join(".")}" is invalid`);let H=z[d],L=M[H];if(L===null||typeof L!=="object")throw Error(`Path segment "${z[d]}" is not an object`);M=L}let V=z[z.length-1];M[V]=v}async function t2(h){let z=e5.map(async({oldPath:v,newPath:M,type:V})=>{let d=h[v];if(d===void 0)return;if(await z3(d,V))h3(A,M,d)});await Promise.all(z)}async function z3(h,z){switch(z){case"boolean":return typeof h==="boolean";case"WatchOption":return typeof h==="string"&&["preferences","watch","nochange","unwatch"].includes(h);case"expiry":return typeof h==="string"&&s2(h)}}var A=structuredClone(B1);function e2(h){A=structuredClone(h)}var h5="userjs-spihelper";function d1(){return K().saveOption(h5,JSON.stringify(A))}function n0(){let h=String(mw.user.options.get(h5));try{return h?JSON.parse(h):null}catch(z){return console.warn("Failed to parse saved options",z),null}}async function i0(){mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"migrate"});try{if(await mw.loader.getScript("/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript"),spiHelperCustomOpts!==void 0)await t2(spiHelperCustomOpts)}catch(h){mw.notify("Error retrieving your spihelper-options.js",{type:"error"}),console.error("Error getting local spihelper-options.js: ",h)}}function O(h=!0){if(h&&A.debug.enabled)return A.debug.forceCheckuser;return mw.config.get("wgUserGroups")?.includes("checkuser")??!1}function u(){return A.clerk||O()}function R(){if(A.debug.enabled)return A.debug.forceAdmin;return mw.config.get("wgUserGroups")?.includes("sysop")??!1}function p1(){return R()||(mw.config.get("wgUserGroups")?.includes("extendedmover")??!1)}var J1='<path d="M11 9V4H9v5H4v2h5v5h2v-5h5V9z"/>';var z5='<path d="m2 10 1.42-1.41L9 14.17V2h2v12.17l5.59-5.58L18 10l-8 8z"/>';var v5='<path d="M10 0a10 10 0 1010 10A10 10 0 0010 0m2.5 14.5L9 11V4h2v6l3 3z"/>',M5='<path d="m4.34 2.93 12.73 12.73-1.41 1.41L2.93 4.35z"/><path d="M17.07 4.34 4.34 17.07l-1.41-1.41L15.66 2.93z"/>',V5='<path id="cdx-icon-code-a" d="M1 10.08V8.92h1.15c1.15 0 1.15 0 1.15-1.15V5a7.4 7.4 0 01.09-1.3 2 2 0 01.3-.7 1.84 1.84 0 01.93-.68A6.4 6.4 0 016.74 2h1.18v1.15h-.86A1.32 1.32 0 006 3.62a1.7 1.7 0 00-.36 1.23V7a3.2 3.2 0 01-.28 1.72 2 2 0 01-1.26.77 2.15 2.15 0 011.26.79A3.26 3.26 0 015.62 12v3.15A1.67 1.67 0 006 16.37a1.31 1.31 0 001.08.47h.87V18H6.74a6.3 6.3 0 01-2.12-.29 1.82 1.82 0 01-.93-.71 1.9 1.9 0 01-.3-.72A7.5 7.5 0 013.31 15v-3.77c0-1.15 0-1.15-1.15-1.15zm18 0V8.92h-1.15c-1.15 0-1.15 0-1.15-1.15V5a7.4 7.4 0 00-.08-1.32 2 2 0 00-.3-.73 1.84 1.84 0 00-.93-.68A6.4 6.4 0 0013.26 2h-1.18v1.15h.87a1.32 1.32 0 011.05.47 1.7 1.7 0 01.36 1.23V7a3.2 3.2 0 00.28 1.72 2 2 0 001.26.77 2.15 2.15 0 00-1.26.79 3.26 3.26 0 00-.26 1.72v3.15a1.67 1.67 0 01-.38 1.22 1.31 1.31 0 01-1.08.47h-.87V18h1.19a6.3 6.3 0 002.12-.29 1.82 1.82 0 00.93-.68 1.9 1.9 0 00.3-.72 7.5 7.5 0 00.1-1.31v-3.77c0-1.15 0-1.15 1.15-1.15z"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cdx-icon-code-a" transform="matrix(-1 0 0 1 20 0)"/>',d5='<path d="m2.5 15.25 7.5-7.5 7.5 7.5 1.5-1.5-9-9-9 9z"/>';var v0={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3z"/><path d="M9 9h8v8H9zm0-2c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2z"/>',shouldFlip:!0};var H5='<path d="M17 12v5H3v-5H1v5a2 2 0 002 2h14a2 2 0 002-2v-5z"/><path d="M15 9h-4V1H9v8H5l5 6z"/>';var L5='<path d="m17.5 4.75-7.5 7.5-7.5-7.5L1 6.25l9 9 9-9z"/>';var X1={ltr:'<path d="M19 16 2 12a3.83 3.83 0 01-1-2.5A3.83 3.83 0 012 7l17-4z"/><rect width="4" height="8" x="4" y="9" rx="2"/>',shouldFlip:!0};var f5={ltr:'<path d="M2 18.5A1.5 1.5 0 003.5 20H5V0H3.5A1.5 1.5 0 002 1.5zM6 0v20h10a2 2 0 002-2V2a2 2 0 00-2-2zm7 8H8V7h5zm3-2H8V5h8z"/>',shouldFlip:!0};var F5={ltr:'<path d="M8 12V1H1v18h18v-7z"/><path d="M11 1v8h8V1zm6 6h-4V3h4z"/>',shouldFlip:!0};var A5={ltr:'<path d="M13 15v2a3 3 0 01-3 3 10 10 0 1110-10 5 5 0 01-5 5ZM3 8.5a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3-4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3 4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0"/>',shouldFlip:!0},Z5={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3zm4 12v2c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2h-2v2h2v8H9v-2z"/><path d="M10 5H8v3H5v2h3v3h2v-3h3V8h-3z"/>',shouldFlip:!0};var M0='<path d="M13 8V2a2 2 0 002-2H5a2 2 0 002 2v6H6a2 2 0 00-2 2v1h5v5l1 4 1-4v-5h5v-1a2 2 0 00-2-2z"/>';var V0='<path d="M15.65 4.35A8 8 0 1017.4 13h-2.22a6 6 0 11-1-7.22L11 9h7V2z"/>';var H1='<path d="M17 2h-3.5l-1-1h-5l-1 1H3v2h14zM4 17a2 2 0 002 2h8a2 2 0 002-2V5H4z"/>';var q5={ltr:'<path d="m6.4 17-1.26-1.25 2.32-2.25H1v-1.75h6.46L5.14 9.5 6.4 8.25l4.5 4.38zm7.2-5.25L9.1 7.37 13.6 3l1.26 1.25-2.32 2.25H19v1.75h-6.46l2.32 2.25z"/>',shouldFlip:!0};var d0='<path d="M10 11c-5.92 0-8 3-8 5v3h16v-3c0-2-2.08-5-8-5"/><circle cx="10" cy="5.5" r="4.5"/>',H0='<path d="M10 8c1.7 0 3.06-1.35 3.06-3S11.7 2 10 2 6.94 3.35 6.94 5 8.3 8 10 8m0 2c-2.8 0-5.06-2.24-5.06-5S7.2 0 10 0s5.06 2.24 5.06 5-2.26 5-5.06 5m-7 8h14v-1.33c0-1.75-2.31-3.56-7-3.56s-7 1.81-7 3.56zm7-6.89c6.66 0 9 3.33 9 5.56V20H1v-3.33c0-2.23 2.34-5.56 9-5.56"/>';var W5={ltr:'<path d="M1 3h16v2H1Zm0 6h6v2H1Zm0 6h8v2H1Zm8-4.24h3.85L14.5 7l1.65 3.76H20l-3 3.17.9 4.05-3.4-2.14L11.1 18l.9-4.05Z"/>',shouldFlip:!0};function N1(h){let{text:z,fullSearch:v,state:M}=h,V=v?[A1(Z.caseName,M)]:[],d=[],H=v?new Set([Z.caseName]):new Set;if(v){let F=$(document);if(M.selectedSection?.type==="single")F=$(`a[href$="section=${M.selectedSection.section.id}"]`).parentsUntil(":has(hr)").last().nextUntil("hr");let W=F.find(".cuEntry").find("a:first");for(let q of W){let y=Array.from(q.childNodes).find((Y)=>Y.nodeType===Node.TEXT_NODE)?.textContent??"";if(!y)continue;let J=o(y);if(H.has(J))continue;V.push(A1(J,M)),H.add(J)}}let L=(F)=>{return/sock ?list/.exec(F)!==null||["ip","vandal","user","noping"].some((W)=>F.includes(W))},f=r(z);for(let F of f)if(L(F.name)){let W=N2(F);for(let q of W){let y=o(q);if(!H.has(y))d.push(A1(y,M)),H.add(y)}}return[V,d,H]}function A1(h,z){if(mw.util.isIPAddress(h,!0))if(A.interface.displayIPv6As64&&mw.util.isIPv6Address(h,!1))return{...Z1(z.archiveNotice),username:v3(h)};else return{...Z1(z.archiveNotice),username:h};else return{...Z1(z.archiveNotice),username:h}}function v3(h){if(!mw.util.isIPv6Address(h,!1))return h;return h.split(":").slice(0,4).concat("0","0","0","0").join(":")+"/64"}function Z1(h){let z={id:crypto.randomUUID(),username:"",block:P2(),link:{...p2}};if(h){if(h.crosswiki)z.block.lock=!0;if(h.notalk)z.block.nem=!0,z.block.ntp=!0}return z.block.duration=A.interface.defaultBlockDuration,z}function R1(h){let{userRow:z,currentBlock:v,userPage:M,defaultBlock:V}=h;if(v)z.block.block=!0,z.block.acb=v.acb,z.block.abao=v.abao,z.block.ntp=v.ntp,z.block.nem=v.nem,z.block.duration=v.duration;else if(z.block.block=V,mw.util.isIPAddress(z.username,!0))z.block.duration="1 week";if(M)z.block.tags=n1(M);return z}var m1=(h)=>("items"in h);async function L0(h){let{block:z,userPage:v,defaultBlock:M,checkLock:V,state:d}=h,H=R1({userRow:h.userRow,defaultBlock:M,currentBlock:z,userPage:v}),L=null;if(V){let f=await y1(H.username);if(f)if(L=f.locked,f.locked||d.archiveNotice?.crosswiki)H.block.lock=!0;else H.block.lock=!1}return{userRow:H,isLocked:L}}function s0(h){return h.map((z)=>{if(m1(z)){let v=s0(z.items);if(v.length===0)return null;return{...z,items:v}}if(!z.value)return null;return z}).filter((z)=>z!==null)}function f0(h,z,v,M,V,d){if(z==="lock"){if(h===null)return!1;return E(h.username)||V.get(h.username)===!0}if(z==="block"){if(h===null)return v.noBlock;return v.noBlock||!v.override&&M.get(h.username)!==void 0}if(v.noBlock)return!0;if(h===null)return!d.some((H)=>H.block.block);if(!h.block.block)return!0;return!v.override&&M.get(h.username)!==void 0}var F0=null;function $5(h){F0=h}var b5=Q({props:{feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},toaster:{type:Object,required:!0}},data:function(){let z=`User:${mw.config.get("wgUserName")??""}/`,v=E2.reduce((M,V)=>{if(V!=="sections")M.push({value:V,label:V.charAt(0).toUpperCase()+V.slice(1)});return M},[]);return{open:!1,openHandler:null,showExtra:A.debug.enabled,showExtraMessage:!1,showExtraHandler:null,logPrefix:z,caseActionMenuItems:v,selectedChipItems:A.defaultActions,icons:{cdxIconAdd:J1,cdxIconArrowDown:z5,cdxIconClock:v5,cdxIconClose:M5,cdxIconCode:V5,cdxIconFeedback:X1,cdxIconJournal:f5,cdxIconLayout:F5,cdxIconPalette:A5,cdxIconReload:V0,cdxIconTrash:H1,cdxIconWatchlist:W5},instanceSettings:structuredClone(A),oldSettings:structuredClone(A),resetTrigger:0}},computed:{logPage(){return`${mw.config.get("wgServer")}/wiki/${z0(A.log.page)}`},isCheckUser(){let{debug:h}=this.instanceSettings;return(mw.config.get("wgUserGroups")?.includes("checkuser")??!1)||h.enabled&&h.forceCheckuser},inputChipItems:{get(){return this.instanceSettings.defaultActions.map((h)=>({value:h,label:h.charAt(0).toUpperCase()+h.slice(1)}))},set(h){this.instanceSettings.defaultActions=h.map((z)=>z.value)}}},watch:{open(h){if(h){if(!this.showExtra&&this.showExtraHandler)window.addEventListener("keydown",this.showExtraHandler)}else{let z=JSON.stringify(this.instanceSettings);if(JSON.stringify(this.oldSettings)!==z){if(F0)e2(F0(this.instanceSettings));else{this.toaster.error("Failed to save settings",{autoDismiss:!0});return}let M=this.toaster.info("Saving settings...",{autoDismiss:!1});d1().then((V)=>{this.toaster.success("Settings saved! Reload to apply them",{autoDismiss:!0})}).catch((V)=>{let d=V instanceof Error?V.message:String(V);this.toaster.error(`Failed to save settings: ${d}`,{autoDismiss:!0})}).always(()=>{this.oldSettings=JSON.parse(z),setTimeout(()=>{this.toaster.dismiss(M)},3000)})}if(this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler)}}},mounted(){this.openHandler=()=>{this.open=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"options"})},this.openButton.addEventListener("click",this.openHandler);//! Use the Konami code to unlock debug menu
let h=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"],z=0;this.showExtraHandler=(v)=>{if(v.key===h[z]){if(z++,z===h.length){if(this.showExtra=!0,this.showExtraMessage=!0,this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler);z=0}}else z=0}},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler)},methods:{isMenuGroupData:m1,loadDefaults(){this.instanceSettings=JSON.parse(JSON.stringify(B1)),Object.assign(A,B1),this.resetTrigger++},launchFeedback(){this.open=!1,this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`Options form v${k}-${p}`})},removeTemplateEntry(h){this.instanceSettings.custom.commentTemplates.splice(h,1)},addTemplateEntry(h){if(h==="item")this.instanceSettings.custom.commentTemplates.push({label:"",value:""});else this.instanceSettings.custom.commentTemplates.push({label:"",items:[]})},moveDown(h,z){if(z<0||z>=h.length-1)return h;let v=h[z+1];h[z+1]=h[z],h[z]=v}},template:`
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
  `});function t0(){return{sections:{label:"Sections",selectionType:"both"},comment:{label:"Comment",selectionType:"section"},status:{label:"Case Status",selectionType:"section"},block:{label:R()?"Block/Tag Socks":"Tag Socks",selectionType:"both"},link:{label:"Generate Links",selectionType:"both"},move:{label:{case:"Move/Merge Full Case",section:"Move Section"},selectionType:"both"},archive:{label:{case:"Archive Closed",section:"Archive"},selectionType:"both"},management:{label:"SPI Management",selectionType:"case"}}}function e0(){return{sections:{enabled:!0,data:{section:null}},comment:{enabled:!1,data:{text:"* ",bySection:new Map}},status:{enabled:!1,data:{old:"",new:"nochange",bySection:new Map}},block:{enabled:!1,data:o1(Z.caseName)},link:{enabled:!1},management:{enabled:!1,data:{flags:new Set}},move:{enabled:!1,data:{target:"",suppress:!1,addNote:!1}},archive:{enabled:!1}}}var j5=new Set(["status","management","comment","move","archive"]),Q5=new Set(["move","archive","management"]),h2=new Set(["sections","move","archive","block","link"]),z2=new Set(["status","comment"]),v2=new Set(["management"]);function P1(h){let{name:z,selection:v,selectionType:M}=h;if(Z.isArchive)return!j5.has(z);if(!u()&&Q5.has(z))return!1;if(z==="sections")return!0;if(v===null)return!1;if(M==="both")return!0;if(Array.isArray(v))return!0;return M==="case"===(v==="all")}function a1(h){let{label:z,selectionType:v,allSelected:M}=h;if(typeof z==="string")return z;if(v==="both")return M?z.case:z.section;return"Unexpected configuration"}function M2(h){let z=new Set;if(h===null)return z;if(h.deny)z.add("deny");if(h.moot)z.add("moot");if(h.notalk)z.add("notalk");if(h.crosswiki)z.add("crosswiki");return z}async function _1(h){let{likelySocks:z,possibleSocks:v,allUsernames:M,userBlocks:V,userLocks:d,userTags:H,state:L}=h,f=new Set(z.map((Y)=>Y.id)),F=[...M].filter((Y)=>!E(Y)).map((Y)=>`User:${Y}`),[W,q]=await Promise.all([s1(M),C1(F)]),y=M.size<7,J=[...z,...v].map(async(Y)=>{let _=W.get(Y.username);if(_!==void 0)V.set(Y.username,_);let X=q.get(Y.username),G=f.has(Y.id),{userRow:D,isLocked:m}=await L0({userRow:Y,block:_,defaultBlock:G,userPage:X,checkLock:y,state:L});if(m!==null)d.set(Y.username,m);return H.set(Y.username,Y.block.tags),D});return await Promise.all(J)}function V2(h){switch(h){case"CUrequest":return"{{CURequest}}";case"admin":return"{{awaitingadmin}}";case"clerk":return"{{Clerk Request}}";case"selfendorse":return"{{Requestandendorse}}";case"inprogress":return"{{Inprogress}}";case"decline":return"{{Decline}}";case"cudecline":return"{{Cudecline}}";case"endorse":return"{{Endorse}}";case"cuendorse":return"{{cu-endorsed}}";case"moreinfo":case"cumoreinfo":return"{{moreinfo}}";case"relist":return"{{relisted}}";case"hold":case"cuhold":return"{{onhold}}";case"reopen":return"{{reopen}}";case"checked":case"closed":return null;default:return console.warn("New case status",h,"is unexpected"),null}}function A0(h,z){let v=V2(z);if(v===null)return h;if(D0.test(h)){let M=h.replace(D0,v);if(!v)M=M.replace(/^(\s*\*\s*)? [-–] /,"$1");return M}else if(v)return"* "+v+" – "+h.replace(/^\s*\*\s*/,"");return h}function d2(h){if(q1.test(h))return"closed";if(/^open$/i.test(h))return"open";if(/^(?:inprogress|checking)$/i.test(h))return"inprogress";if(/^relist(ed)?$/i.test(h))return"relist";if(/^checked|completed$/i.test(h))return"checked";if(/^declined?$/i.test(h))return"decline";if(/^cudeclin(ed)?$/i.test(h))return"cudecline";if(/^endorsed?$/i.test(h))return"endorse";if(/^(?:CU|checkuser|CUrequest|request)$/i.test(h))return"CUrequest";if(/^cumoreinfo$/i.test(h))return"cumoreinfo";if(/^hold$/i.test(h))return"hold";if(/^cuhold$/i.test(h))return"cuhold";if(/^clerk$/i.test(h))return"clerk";if(/^admin$/i.test(h))return"admin";return"new"}function H2(h){return r(h)[0]?.name??null}var M3=new Set(["{{btc}}","{{Action and close}}","{{Closing without action}}"].map(H2).filter((h)=>h!==null)),V3=["CUrequest","admin","clerk","selfendorse","inprogress","decline","cudecline","endorse","cuendorse","moreinfo","relist","hold","reopen"],d3=new Set(V3.map((h)=>V2(h)).filter((h)=>h!==null).map(H2));function L2(h,z){let v=new Set(r(h).map((d)=>d.name));if(z!=="closed"){let d=[...M3].find((H)=>v.has(H));if(d)return{kind:"template",match:d}}let M=V2(z),V=M?H2(M):null;for(let d of v)if(d3.has(d)&&d!==V)return{kind:"template",match:d};if(z!=="closed"&&/\bclosing\b/i.test(h))return{kind:"text",match:"closing"};return null}var f2=Q({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},emits:["actionToggled"],data(){return{accordionModel:!0}},computed:{allSelected(){return this.selection==="all"},showAccordion(){return P1({name:this.name,selection:this.selection,selectionType:this.selectionType})},text(){return a1({label:this.label,selectionType:this.selectionType,allSelected:this.allSelected})},showEnabledClass(){return this.name!=="sections"&&this.actionEnabled}},template:`
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
  `});var F2=Q({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},computed:{buttonEnabled(){return this.displayedForms.has(this.name)||this.actionEnabled},allSelected(){return this.selection==="all"},showButton(){return P1({name:this.name,selection:this.selection,selectionType:this.selectionType})},buttonAction(){return this.buttonEnabled?"progressive":"normal"},buttonStyle(){return{opacity:this.buttonEnabled?1:0.7,color:this.displayedForms.has(this.name)?"var(--color-base)":""}},text(){return a1({label:this.label,selectionType:this.selectionType,allSelected:this.allSelected})}},template:`
    <cdx-button
        v-if="showButton"
        :name="name"
        :action="buttonAction"
        :style="buttonStyle"
    >
      {{ text }}
    </cdx-button>
  `});var A2=Q({props:{enabled:{type:Boolean,required:!0},empty:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:enabled"],template:`
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="enabled && !empty">
      <slot />
    </div>
  `});var Z2=Q({props:{name:{type:String,required:!0},caseActions:{type:Object,required:!0},accounts:{type:Array,required:!0},state:{type:Object,required:!0},multiSelectMode:{type:Boolean,required:!0},selectedSections:{type:Array,required:!0}},emits:["update:multiSelectMode","update-multi-select-sections","update-section-selection","update-status","update-section-status","user-selected","remove-rows","add-row","fetch-rows","move-entire-case"],computed:{caseName(){return Z.caseName},isMultiSelect(){return this.state.selectedSection?.type==="multiple"}},methods:{handleUpdateSectionSelection(h){this.$emit("update-section-selection",h)},handleUpdateStatus(h){this.$emit("update-status",h)},handleUpdateSectionStatus(h,z){this.$emit("update-section-status",h,z)},handleUserSelected(h,z){this.$emit("user-selected",h,z)},handleRemoveRows(h){this.$emit("remove-rows",h)},handleAddRow(h){this.$emit("add-row",h)},handleFetchRows(){this.$emit("fetch-rows")},handleMoveEntireCase(){this.$emit("move-entire-case")}},template:`
    <!-- Sections special case -->
    <section-action v-if="name === 'sections'"
                    :selected-section="caseActions.sections.data.section" :all-sections="state.sections"
                    :multi-select-mode="multiSelectMode" :selected-sections="selectedSections"
                    @update-section-selection="handleUpdateSectionSelection"
                    @update:multi-select-mode="$emit('update:multiSelectMode', $event)"
                    @update-multi-select-sections="$emit('update-multi-select-sections', $event)" />
    <!-- Other actions -->
    <multi-section-comment-action v-else-if="name === 'comment' && isMultiSelect"
                                  :sections="selectedSections" :by-section="caseActions.comment.data.bySection" />
    <comment-action v-else-if="name === 'comment'" v-model:enabled="caseActions.comment.enabled"
                    v-model:text="caseActions.comment.data.text" :selected-section="state.selectedSection" />
    <multi-section-status-action v-else-if="name === 'status' && isMultiSelect"
                                 :sections="selectedSections" :by-section="caseActions.status.data.bySection"
                                 @update-section-status="handleUpdateSectionStatus" />
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
    <move-action v-else-if="name === 'move'" v-model:enabled="caseActions.move.enabled"
                 v-model:target="caseActions.move.data.target" v-model:suppress="caseActions.move.data.suppress"
                 v-model:addNote="caseActions.move.data.addNote"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled"
                 @move-entire-case="handleMoveEntireCase" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="state.selectedSection"
                    :status-data="caseActions.status.data" />
    <management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
                       v-model:flags="caseActions.management.data.flags" />
  `});var y5=10;function Z0(h,z){if(h.blockid!==void 0)z.block.block=!0;if(h.blocknocreate!==void 0)z.block.acb=h.blocknocreate;if(h.blockemail!==void 0)z.block.nem=h.blockemail;if(mw.util.isIPAddress(h.name)){if(h.blockanononly!==void 0)z.block.abao=h.blockanononly}else if(h.blockautoblocking!==void 0)z.block.abao=h.blockautoblocking;if(h.blockowntalk!==void 0)z.block.ntp=h.blockowntalk;if(h.blockexpiry)z.block.duration=h.blockexpiry}var q0=Q({props:{modelValue:{type:String,required:!0},label:{type:String,required:!1,default:""},allowEmpty:{type:Boolean,default:!0}},emits:["update:modelValue","user-selected"],data(){return{lookupStatus:"default",messages:{success:"Valid user",warning:"User not found",error:"Field must not be empty"},selection:null,userSuggestions:[],menuConfig:{visibleItemLimit:6,searchQuery:""},useLookup:A.useLookup}},computed:{username:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}}},methods:{onUpdateInputValue(h){let z=h.trim();if(this.menuConfig.searchQuery=z,!z){this.userSuggestions=[];return}x0(z,y5).then((v)=>{if(this.username!==h&&this.username!==z)return;if(v.length===0){this.userSuggestions=[];return}this.userSuggestions=v.map((M)=>({label:M.name,value:M.userid.toString(),customData:M}))}).catch(()=>{this.userSuggestions=[]})},onLoadMore(){if(!this.username)return;x0(this.username,this.userSuggestions.length+y5).then((h)=>{if(h.length===0)return;this.userSuggestions=h.map((z)=>({label:z.name,value:z.userid.toString(),customData:z}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.username.length===0){this.lookupStatus=this.allowEmpty?"default":"error";return}if(mw.util.isIPAddress(this.username)){this.lookupStatus="default";return}let h=this.userSuggestions.find((z)=>z.label===this.username||z.label?.trim()===this.username.trim())??null;if(h!==null)this.$emit("user-selected",h.customData),this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null){let z=this.userSuggestions.find((v)=>v.value===h)??null;if(z)this.$emit("user-selected",z.customData);this.lookupStatus="success"}}},template:`
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
  `});async function K1(h){let{page:z,state:v}=h,M;if(z===Z.pageName&&v)M=await n(v);else M=await B(z,!1);if(M==="")return null;let d=r(M).find((f)=>/SPI\s*archive notice/i.exec(f.name));if(!d)return console.error("Missing archive notice"),null;let H=d.positional[0]??d.params["1"];if(!H)return console.error("Invalid archive notice: Username missing"),null;let L={deny:!1,crosswiki:!1,notalk:!1,moot:!1};for(let[f,F]of Object.entries(d.params)){if(f==="1")continue;if(F!==!0){console.warn("Malformed archivenotice parameter",f,"=",F);continue}if(f in L)L[f]=!0;else console.warn("Unrecognised archivenotice parameter",f,"=",F)}return new g({username:H,...L})}async function W0(h,z){let v=new j({type:"notice",content:"Loading all sections"}).show(),M=n(h),V=z??h.sections,d=(await Promise.all(V.map(async(X)=>{let G=await c(X),D=a.exec(G);if(!D?.[1])return null;return q1.test(D[1])?X:null}))).filter((X)=>X!==null),H=await M;if(v.update({type:"success",content:"All sections loaded"}),d.length===0)return new j({type:"warning",content:"Nothing to archive"}).show(),[];let L=await B(Z.archiveName,!0),f=await H3(Z.pageName,Z.archiveName);if(f==="abort")return[];if(f==="moved")L="";let F=L!=="";if(F)L=L.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);else L=`__TOC__
{{SPI archive notice|1=${Z.caseName}}}
{{SPIpriorcases}}
`;let W=F?await V1({pageName:Z.archiveName}):[],q=F&&W.length===0?null:b1(L,W);if(!q)return new j({type:"notice",content:"Failed to parse existing archive sections, aborting archival"}).show(),[];let y=[];for(let X of d){let G=await c(X);H=H.replace(G+`
`,"").replace(G,"");let D=G.slice(G.search(F1)).replace(a,"");if(L.includes(D)){new j({type:"warning",content:`Section ${X.name} already exists in the archive`}).show();continue}let m=r1(X.name);if(!m)return new j({type:"error",content:`Failed to parse date from section header "${X.name}", aborting archival`}).show(),[];q.push({header:m,fullText:D}),y.push(X)}if(y.length===0)return new j({type:"warning",content:"Nothing to archive"}).show(),[];L=M1(L,q);let J=y.length>1,Y=`Archiving ${y.length} section${J?"s":""}`;if(await I({title:Z.archiveName,newText:L,summary:`${Y} from [[${Z.prefixedName}]]`,watch:A.watch.archive,watchExpiry:A.expiry.archive})===null)return new j({type:"error",content:"Failed to update archive, not removing sections from case page"}).show(),[];return await Z.edit({newText:H,summary:`${Y} to [[${I1()}${Z.archiveName}]]`,watch:A.watch.case,watchExpiry:A.expiry.case,baseRevId:Z.startingRevId}),y}async function Y5(h){let z=await c(h);z=z.replace(a,"");let v=await B(Z.archiveName,!0),M=new j({type:"error",content:""});if(v.includes(z)){M.type="warning",M.content="Looks like the page has been archived already",M.show();return}let V=v!=="";if(!V)v=`__TOC__
{{SPI archive notice|1=`+Z.caseName+`}}
{{SPIpriorcases}}
`;else v=v.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);let d=V?new j({type:"notice",content:"Loading archive sections"}).show():null,H=V?await V1({pageName:Z.archiveName}):[],L=V&&H.length===0?null:b1(v,H);if(L){d?.update({type:"success",content:"Archive sections loaded"});let F=r1(h.name);if(!F){new j({type:"error",content:`Failed to parse date from section header '${h.name}'`}).show();return}L.push({header:F,fullText:z})}else{d?.update({type:"error",content:"Failed to parse existing archive sections, aborting archival"});return}if(v=M1(v,L),await I({title:Z.archiveName,newText:v,summary:`Archiving case section from [[${Z.prefixedName}]]`,createonly:!1,watch:A.watch.archive,watchExpiry:A.expiry.archive})===null){M.content="Failed to update archive, not removing section from case page",M.show();return}await Z.edit({newText:"",summary:`Archiving case section to [[${I1()}${Z.archiveName}]]`,watch:A.watch.case,watchExpiry:A.expiry.case,baseRevId:Z.startingRevId,sectionId:h.id})}async function H3(h,z){if((await S0(h)+await S0(z))/U1()<1)return"ok";let M=await q2(z);if(M===null)return"abort";return await E1({sourcePage:z,destPage:`${z}/${M}`,summary:"Moving archive to avoid exceeding post expand size limit",ignoreWarnings:!1,moveSubpages:!1}),"moved"}async function q2(h){let z=0,v="sentinel";while(v!==""){if(z>30)return new j({type:"error",content:"Reached upper bound on possible archives, something probably went catastrophically wrong."}).show(),null;v=await B(`${h}/${++z}`,!1)}return z}async function J5(h,z){let v=U1(),M=0,V=h.length;while(M<V){let d=Math.floor((M+V)/2),H=M1(z,h.slice(d));if(await e1(H)<v)V=d;else M=d+1}return M}function L3(h){let{sock:z,noticeType:v,sockmaster:M,cuBlock:V}=h,d,H=v==="sock";if(H&&M&&z.username===o(M))H=!1;if(H)d=`== Blocked as a sockpuppet ==
`;else d=`== Blocked for sockpuppetry ==
`;if(V)d+="{{checkuserblock-account|sig=~~~~";else d+="{{subst:uw-sockblock|sig=yes";if(Z.valid)d+="|spi="+Z.caseName;if(I0(z.block.duration))d+="|indef=yes";else if(d+="|time="+z.block.duration,V)d+="|indef=no";if(z.block.ntp)d+="|notalk=yes";if(H&&M)d+="|master="+M;return d+="}}",d}function f3(h,z,v,M){let V="Abusing [[WP:SOCK|multiple accounts]]";if(Z.valid)V+=`: Please see: [[${Z.prefixedName}]]`;if(O()&&h.cuBlock){let d=z?"{{checkuserblock}}":"{{checkuserblock-account}}";if(h.cuBlockOnly)V=d;else V=d+": "+V}else if(v){if(V=`{{rangeblock|1=${V}`,!M)V+="|create=yes";V+="}}"}return V}async function X5(h){let{sock:z,blockOptions:v}=h,M=mw.util.isIPAddress(z.username,!0),V=M&&!mw.util.isIPAddress(z.username,!1),d=f3(v,M,V,z.block.acb);return await w2({user:z.username,duration:z.block.duration,reason:d,reblock:v.override,anononly:M?z.block.abao:!1,accountcreation:z.block.acb,autoblock:M?!1:z.block.abao,notalkpage:z.block.ntp,noemail:z.block.nem,watchBlockedUser:A.watch.blocked,watchExpiry:A.expiry.blocked})}async function _5(h){let{sock:z,blockOptions:v,userTalkContent:M,talkNotices:V}=h;if(V.length===0)return;let d=z.block.tags.find((F)=>i(F))?.master,H=v.cuBlock&&O()&&A.useCheckuserblockAccount,L=`User talk:${z.username}`,f=v.blankTalk?"":M??"";for(let F of V)f+=`
`+L3({sock:z,noticeType:F,sockmaster:d,cuBlock:H});await I({title:L,newText:f,summary:x1("Adding sockpuppetry block notice"),createonly:!1,watch:"nochange"})}async function F3(h){return(await Promise.all(h.map(async(v)=>(await y1(v))?.locked?null:v))).filter((v)=>v!==null)}var A3=6;async function K5(h){let{master:z,hideNames:v}=h,M=h.lockTargets.length<A3?await F3(h.lockTargets):h.lockTargets;if(M.length===0)return[];let V,d=M.length>1;if(!d&&M[0])V=`* {{LockHide|1=${M[0]}}}`;else{if(V="{{MultiLock",M.forEach((y,J)=>{V+=`|${J+1}=${y}`}),v)V+="|hidename=1";V+="}}"}let H,L="Global lock for ";if(v||!z)H=d?`${M.length} sockpuppets`:"a sockpuppet",L+=H;else H=`${M.length} [[Special:CentralAuth/${z}|${z}]] ${d?"socks":"sock"}`,L+=`${M.length} ${z} ${d?"socks":"sock"}`;let f=h.lockComment.trim().replace(/\.+$/,""),F=`=== Global lock for ${H} ===`;if(F+=`
{{status}}`,F+=`
${V}`,Z.source==="spi"&&Z.valid)F+=`
${d?"Sockpuppets":"Sockpuppet"} found in enwiki sockpuppet investigation, see [[${Z.prefixedName}]].`;else if(Z.source==="spi")F+=`
${d?"Sockpuppets":"Sockpuppet"} found in enwiki sockpuppet investigation.`;else F+=`
${d?"Sockpuppets":"Sockpuppet"} found in enwiki.`;if(f!=="")F+=` ${f}.`;F+=" ~~~~";let W=await B("meta:Steward requests/Global",!1);W=W.replace(/\n+(== See also == *\n)/,`

`+F+`

$1`),new j({type:"notice",content:"Filing global lock request"}).show();let q=await I({title:"meta:Steward requests/Global",newText:W,summary:`Global lock request for ${H}`,createonly:!1,watch:"nochange"});if(q){let y=T(`meta:Special:Diff/${q}#${L}`,"filed");new j({type:"success",content:`Global lock request ${y} successfully!`,isHtml:!0}).show()}else new j({type:"warning",content:"Global lock request failed."}).show();return M}async function T1(h){let z=new Date,v=z.toLocaleString("en",{month:"long"})+" "+z.toLocaleString("en",{year:"numeric"}),M="==\\s*"+v+"\\s*==",V=new RegExp(M,"i"),d=/==.*?==/i,H=z0(A.log.page),L=await B(H,!1);if(!L.match(V))if(A.log.reversed){let f=d.exec(L);if(f?.index)L=L.slice(0,f.index)+"== "+v+` ==
`+L.slice(f.index)}else L+=`
== `+v+" ==";if(A.log.reversed){let f=d.exec(L);if(f?.index)L=L.slice(0,f.index+f[0].length)+`
`+h+L.slice(f.index+f[0].length)}else L+=`
`+h;await I({title:H,newText:L,summary:"Logging spihelper edits",createonly:!1,watch:"nochange"})}async function Z3(h,z,v){let M=await m0(h),V=await m0(z),d=[];return v.types.forEach((H)=>{let L=M.find((F)=>F.type===H),f=V.find((F)=>F.type===H);if(L&&f){let F=f.expiry;if(W1(f.expiry)||W1(L.expiry))F="infinite";else if(f.expiry<L.expiry)F=L.expiry;let W=v.levels.indexOf(L.level),q=v.levels.indexOf(f.level),y;if(W===-1||q===-1){console.error("Invalid protection information provided from API");return}else if(W>q)y=L.level;else y=f.level;d.push({type:L.type,expiry:F,level:y})}else if(L)d.push(L);else if(f)d.push(f)}),d}async function q3(h,z,v){let M=await P0(h),V=await P0(z),d={level:""};if(M&&V){if(W1(M.protection_expiry)||W1(V.protection_expiry))d.expiry="infinite";else if(V.protection_expiry<M.protection_expiry)d.expiry=M.protection_expiry;else d.expiry=V.protection_expiry;let H=v.levels.indexOf(M.protection_level),L=v.levels.indexOf(V.protection_level);if(H===-1||L===-1)return console.error("Invalid protection information provided from API"),d;else if(H>L)d.level=M.protection_level;else if(H<=L)d.level=V.protection_level}else if(M)d={level:M.protection_level,expiry:M.protection_expiry};else if(V)d={level:V.protection_level,expiry:V.protection_expiry};return d}async function W3(h,z,v){let M=await B(h.archiveName,!1),V=await B(z.archiveName,!1);if(!M||!V)return"skipped";new j({type:"notice",content:"Archives detected on both source and target cases, copying it manually."}).show();let d=await V1({pageName:h.archiveName}),H=await V1({pageName:z.archiveName}),L=d.length?b1(M,d):null,f=H.length?b1(V,H):null;if(!L||!f)return new j({type:"error",content:"Could not parse the archive. Please merge the archives manually"}).show(),"skipped";if(v)for(let q of L)q.fullText=q.fullText.replace(/\n*----(?!([\n.])*----)/,`
* {{clerknote}} originally filed under [[${h.pageName}]]. ~~~~
----`);let F=[...f,...L];V=M1(V,F);let W=U1();if(await e1(V)>=W){new j({type:"notice",content:"Running binary search to find cutoff point for post-expand include size"}).show();let q=await J5(F,V);if(q>=F.length)return new j({type:"error",content:"Archives are too large to merge without hitting post-expand size limit. Please merge manually"}).show(),"abort";let y=await q2(z.archiveName);if(y===null)return"abort";let J=`__TOC__
{{SPI archive notice|1=${z.caseName}}}
{{SPIpriorcases}}
`;await I({title:`${z.archiveName}/${y}`,newText:M1(J,F.slice(0,q)),summary:"Splitting archive due to post-expand size limit",createonly:!1,watch:A.watch.archive,watchExpiry:A.expiry.archive}),V=M1(V,F.slice(q))}return await I({title:z.archiveName,newText:V,summary:`Merging archives from [[${h.prefixedName}]], see page history for attribution`,createonly:!1,watch:A.watch.archive,watchExpiry:A.expiry.archive}),"copied"}async function D5(h){let{target:z,suppress:v,addNote:M,archiveNotice:V}=h,d=Z,H=new O1(Z.pageName.replace(Z.caseName,z)),L=await B(H.pageName,!1);if(L)if(R()){if(!confirm("Target page exists, do you want to histmerge the cases?")){new j({type:"warning",content:"Aborted merge"}).show();return}}else{new j({type:"warning",content:"Target page exists and you are unable to histmerge, aborting merge"}).show();return}if(H.pageName===d.pageName){new j({type:"error",content:"Target page is the current page, aborting merge"}).show();return}if(L){let f=await W3(d,H,M);if(f==="abort")return;let F=await k2(),W=await Z3(d.pageName,H.pageName,F),q=await q3(d.pageName,H.pageName,F);if(await N0(H.pageName,"Deleting as part of case merge"),await E1({sourcePage:d.pageName,destPage:H.pageName,summary:`Merging case to [[${H.prefixedName}]]`,ignoreWarnings:!0,suppressRedirect:v}),await S2(H.pageName,"Restoring page history after merge"),f==="copied")if(v)await N0(d.archiveName,`Archives moved to [[${H.archiveName}]]`);else await I({title:d.archiveName,newText:`#REDIRECT [[${H.archiveName}]]`,summary:"Redirecting old archive to new archive",createonly:!1,watch:A.watch.archive,watchExpiry:A.expiry.archive});if(W.length!==0){if(await a0(H.pageName,W),!v)await a0(d.pageName,W)}if(q.level!==""){if(await T0(H.pageName,q),!v)await T0(d.pageName,q)}}else await E1({sourcePage:d.pageName,destPage:H.pageName,summary:`Moving case to [[${H.prefixedName}]]`,suppressRedirect:v&&p1(),ignoreWarnings:!1});await b3({oldContext:d,newContext:H,oldNotice:V,deleteOld:v,preMergeText:L})}async function l5(h,z){let v=new O1(Z.pageName.replace(Z.caseName,h)),M=await B(v.pageName,!1),V=await c(z);if(V=V.replace(/\n*----(?!([\n.])*----)/,`
* {{clerknote}} originally filed under [[${Z.pageName}]]. ~~~~
----`),M==="")M=`<noinclude>__TOC__</noinclude>
{{SPI archive notice|`+h+`}}
{{SPIpriorcases}}`;M+=`
`+V,v.edit({newText:M,summary:`Moving case section from [[${Z.prefixedName}]], see page history for attribution`,createonly:!1,watch:A.watch.case,watchExpiry:A.expiry.case}),await Z.edit({newText:"",summary:`Moving case section to [[${v.prefixedName}]]`,createonly:!1,watch:A.watch.case,watchExpiry:A.expiry.case,baseRevId:Z.startingRevId,sectionId:z.id})}function $3(h,z){let v=/\{\{sock\s+list[\s\S]*?\}\}/i.exec(h)?.[0];if(!v)return h.replace(G2,`====Suspected sockpuppets====
* {{checkuser|1=`+z+`}} ({{clerknote}} original case name)
`);let M=U0(v.slice(2,-2)),d=v.includes(`
`)?`
`:"",H=z.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),L=z.toLowerCase(),f=M.positional.findIndex((q)=>q.toLowerCase()===L),F=-1;for(let[q,y]of Object.entries(M.params))if(/^\d+$/.test(q)&&y.toString().toLowerCase()===L){F=parseInt(q);break}let W;if(f>=0||F>=0){let q=F>=0?F:f+1;if(`note${q}`in M.params)W=v;else{let J;if(F>=0){let Y=new RegExp(`\\|\\s*${F}\\s*=\\s*${H}`,"i").exec(v);J=Y?Y[0]:void 0}else{let Y=new RegExp(`\\|(?![^|}\\n]*=)\\s*${H}\\s*(?=[|}\\n])`,"i").exec(v);J=Y?Y[0]:void 0}W=J?v.replace(J,J+`|note${q}=({{clerknote}} original case name)`):v}}else{let q=Object.keys(M.params).filter((D)=>/^\d+$/.test(D)).map(Number),J=Math.max(0,...q,M.positional.length)+1,Y=`${d}|${J}=${z}|note${J}=({{clerknote}} original case name)`,_=Object.keys(M.params).filter((D)=>!/^\d+$/.test(D)&&!/^note\d+$/.test(D)),X=null;for(let D of _){let m=D.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),s=new RegExp(`(\\n?)\\|\\s*${m}\\s*=`).exec(v);if(s&&(X===null||s.index<X.index))X={index:s.index,match:s}}let G;if(X)G=X.match.index;else{let D=v.lastIndexOf("}}");G=D-(v[D-1]===`
`?1:0)}W=v.slice(0,G)+Y+v.slice(G)}return h.replace(v,W)}async function b3(h){let{oldContext:z,newContext:v,oldNotice:M,deleteOld:V,preMergeText:d}=h,H=new g({username:v.caseName}),L=H.generateWikitext();H.crosswiki=M.crosswiki,H.deny=M.deny,H.notalk=M.notalk,H.moot=M.moot;let f=[],F=[z.pageName],W=null;while(F.length!==0){if(W=F.pop(),!W||W===v.pageName)continue;f.push(W);let Y=await u2(W);for(let _ of Y){if(_.title===v.pageName)continue;let X=await K1({page:_.title});if(!X)continue;if(X.username===W.replace(/Wikipedia:Sockpuppet investigations\//g,"")){if(await I({title:_.title,newText:L,summary:"Updating backlink following page move",watch:A.watch.case,watchExpiry:A.expiry.case}),!f.includes(_.title))F.push(_.title)}}}if(V){if(!p1())await z.edit({newText:`{{db-g6|rationale=Case moved to [[${v.pageName}]], requesting deletion as non-admin SPI clerk}}`,summary:"Requesting [[WP:G6|G6]] deletion after case move",createonly:!1,watch:A.watch.archive,watchExpiry:A.expiry.archive})}else await z.edit({newText:L,summary:"Updating old case following page move",watch:A.watch.case,watchExpiry:A.expiry.case});let q=await B(v.pageName,!0);if(q=$3(q,z.caseName),d){let Y=d.replace(/\n*<noinclude>__TOC__.*\n/ig,"");Y=Y.replace(l1,""),Y=Y.replace(l0,""),q=q+`
`+Y}q=q.replace(l1,H.generateWikitext());let y="(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?"+v.caseName+"(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)",J=new RegExp(y,"sm");q=q.replace(J,`$1
$2`),await v.edit({newText:q,summary:"Updating new case following page move",watch:A.watch.case,watchExpiry:A.expiry.case})}function B5(h){return I({title:h,newText:"{{sockpuppet category}}",summary:x1("Creating sockpuppet category"),createonly:!0,watch:A.watch.categories,watchExpiry:A.expiry.categories})}function j3(h,z){if(h.length!==z.length)return!1;let v=Array(z.length).fill(!1);for(let M of h){let V=!1;for(let d=0;d<z.length;d++){let H=z[d];if(!H)continue;if(!v[d]&&M.equals(H)){v[d]=!0,V=!0;break}}if(!V)return!1}return!0}function Q3(h,z){let v=/\n?\{\{\s*sock\w*\b[\s\S]*?}}/gi,M=[...h.matchAll(v)];if(M.length===0)return z;let V=M[0];if(!V)return z;let d=V[0];return h=h.replace(d,z),M.slice(1).forEach((H)=>{let L=H[0];h=h.replace(L,"")}),h}async function G5(h){let{sock:z,pageText:v,blocked:M,tagNonLocalAccounts:V}=h;if(E(z.username))return!1;let d=await y1(z.username);if(!d)return new j({type:"warning",content:`The account ${z.username} does not exist and so has not been tagged`}).show(),!1;if(!V&&!d.existsLocally)return new j({type:"warning",content:`The account ${z.username} does not exist locally and so has not been tagged`}).show(),!1;z.block.tags.forEach((q)=>{q.locked=d.locked});let H=n1(v),L=z.block.tags.reduce((q,y)=>{let J=i(y)&&!y.master,Y=q.some((_)=>_.equals(y));if(!J&&!Y)q.push(y);return q},[]);if(j3(H,L)){let q=T(`User:${z.username}`);return new j({type:"notice",content:`Tags are unmodified, skipping ${q}`,isHtml:!0}).show(),!1}let f=L.map((q)=>q.generateWikitext(M)).join(`
`),F=Q3(v,f),W=H.length<L.length?"Adding":"Updating";return I({title:`User:${z.username}`,newText:F,summary:x1(`${W} sockpuppetry tag`),createonly:!1,watch:A.watch.tagged,watchExpiry:A.expiry.tagged}).then((q)=>q!==null)}function y3(h){let z=new Map;function v(M){if(!z.has(M))z.set(M,{confirmed:!1,suspected:!1});return z.get(M)??{confirmed:!1,suspected:!1}}for(let M of h)for(let V of M.block.tags){if(j1(V))continue;let d=v(V.master);if(V.status==="proven"||V.status==="confirmed")d.confirmed=!0;if(V.status==="blocked")d.suspected=!0;if(V.altmaster){let H=v(V.altmaster);if(V.altmasterStatus==="proven")H.confirmed=!0;if(V.altmasterStatus==="suspected")H.suspected=!0}}return z}async function U5(h){let z=new Map,v=y3(h);for(let[M,{confirmed:V,suspected:d}]of v){if(!M)continue;let H=!1;if(V){let L=`Category:Wikipedia sockpuppets of ${M}`;if(!await B(L,!1))await B5(L),H=!0}if(d){let L=`Category:Suspected Wikipedia sockpuppets of ${M}`;if(!await B(L,!1))await B5(L),H=!0}z.set(M,H)}return z}async function C5(h){N("oneClickArchive"),new j({type:"notice",content:"Starting OCA"}).show();let z=await n(h,{show:!0,purge:!0});if(!F1.test(z)){new j({type:"notice",content:"Looks like the page has been archived already"}).show(),U("oneClickArchive","success");return}await Y1(h),await W0(h);let v=`* [[${Z.pageName}]]: used one-click archiver ~~~~~`;if(A.log.enabled)await T1(v);new j({type:"notice",content:"Refreshing data"}).show(),await Z.refreshRevId(),await Y1(h),new j({type:"success",content:"Done!"}).show(),U("oneClickArchive","success")}async function E5(h){let{actions:z,accounts:v,state:M}=h,V=Object.values(z).some((b)=>b.enabled),d=[...z.comment.data.bySection.values(),...z.status.data.bySection.values()].some((b)=>b.enabled);if(!V&&!d){new j({type:"warning",content:"No actions are enabled"}).show();return}if(!M.selectedSection){console.error("spiHelperPerformActions: Expected a selected section, got null"),new j({type:"error",content:"Expected a selected section, got null"}).show();return}if(!M.archiveNotice){console.error("spiHelperPerformActions: Could not find archive notice"),new j({type:"error",content:"Could not find archive notice"}).show();return}if(!z.block.data.master){console.error("spiHelperPerformActions: Could not get master"),new j({type:"error",content:"Could not get master"}).show();return}let H=M.selectedSection.type;new j({type:"notice",content:"Running actions"}).show();let L=[],f=`* [[${Z.pageName}]]`;if(M.selectedSection.type==="single")f+=` (section ${M.selectedSection.section.name})`;else if(M.selectedSection.type==="multiple")f+=" (multiple sections)";else f+=" (full case)";f+=" ~~~~~";let F=await(H==="single"?c(M.selectedSection.section):n(M));if(!F){new j({type:"error",content:"Could not fetch text for the page"}).show();return}let W=F,q=[],y=[],J=[],Y=Promise.resolve([]);if(z.block.enabled)({blockPromises:q,tagPromises:y,talkNoticePromises:J,lockPromise:Y}=await W2({accounts:v,blockData:z.block.data}));let _=Promise.all([Promise.all(q),Promise.all(y),Y]),X=Promise.all(J);if(!Z.isArchive)if(H==="single"){if(a.exec(F)===null)F=F.replace(/^(\s*===.*===[^\S\r\n]*)/,`$1
{{SPI case status|}}`),z.status.data.old="new";if(z.status.data.new==="nochange")z.status.data.new=z.status.data.old;if(z.status.enabled&&z.status.data.new!==z.status.data.old){let l=c5(z.status.data.new,F);if(F=l.targetText,l.newStatus!=="nochange")L.push(l.summaryItem),f+=`
** changed case status from ${z.status.data.old} to ${l.newStatus}`}if(z.comment.enabled&&z.comment.data.text.trim()!=="*")F=I5(F,z.comment.data.text),L.push("comment"),f+=`
** commented`}else{if(H==="multiple"){let b=[],l=[],t=[];for(let x of M.selectedSection.sections){let C=await c(x),P=C,L1=[];if(a.exec(P)===null)P=P.replace(/^(\s*===.*===[^\S\r\n]*)/,`$1
{{SPI case status|}}`);let e=z.status.data.bySection.get(x.id);if(e?.enabled&&e.new!=="nochange"&&e.new!==e.old){let f1=c5(e.new,P);if(P=f1.targetText,f1.newStatus==="closed")l.push(x.name);else if(f1.newStatus!=="nochange")t.push(x.name);if(f1.newStatus!=="nochange")L1.push(`changed case status from ${e.old} to ${f1.newStatus}`)}let K0=z.comment.data.bySection.get(x.id);if(K0?.enabled&&K0.text.trim()!=="*")P=I5(P,K0.text),b.push(x.name),L1.push("commented");if(L1.length>0){f+=`
** ${x.name}`;for(let f1 of L1)f+=`
*** ${f1}`}if(P!==C)F=F.replace(C,P)}if(l.length>0)L.push(`closed ${l.length} section${l.length>1?"s":""}`);if(t.length>0)L.push(`changed status on ${t.length} section${t.length>1?"s":""}`);if(b.length>0)L.push(`commented on ${b.length} section${b.length>1?"s":""}`)}if(z.management.enabled){let b=z.management.data.flags;M.archiveNotice=new g({username:M.archiveNotice.username||Z.caseName,deny:b.has("deny"),crosswiki:b.has("crosswiki"),notalk:b.has("notalk"),moot:b.has("moot")});let l=M.archiveNotice.generateWikitext();F=F.replace(l1,l),L.push("update archivenotice"),f+=`
** Updated archivenotice`}}if(L.length===0)L.push("Saving page");let G=z.move.enabled||z.archive.enabled;if(!Z.isArchive&&F!==W){let b=M.selectedSection.type==="single"?M.selectedSection.section.id:null,l=M.selectedSection.type==="single"?M.selectedSection.section.name:null,t=Y3(L,l),x=await Z.edit({newText:F,summary:t,watch:A.watch.case,watchExpiry:A.expiry.case,baseRevId:Z.startingRevId,sectionId:b});if(x===null){if(new j({type:"error",content:"Failed to save edit"}).show(),!G)await Z.refreshRevId()}else{if(M.selectedSection.type==="single"){if(M.selectedSection.section._text=F,M._text)M._text=M._text.replace(W,F)}else if(M._text=F,M.selectedSection.type==="multiple")for(let C of M.selectedSection.sections)C._text=null;Z.startingRevId=x}}if(z.archive.enabled)switch(M.selectedSection.type){case"all":{f+=`
** Archived case`,await W0(M);break}case"single":{f+=`
** Archived section`,await Y5(M.selectedSection.section);break}case"multiple":{let b=await W0(M,M.selectedSection.sections);if(b.length>0)f+=`
** Archived ${b.length} section${b.length>1?"s":""}`;break}}else if(z.move.enabled){let b=o(z.move.data.target);if(b)switch(M.selectedSection.type){case"all":{f+=`
** moved/merged case to `+b,await D5({target:b,suppress:z.move.data.suppress,addNote:z.move.data.addNote,archiveNotice:M.archiveNotice});break}case"single":{f+=`
** moved section to `+b,await l5(b,M.selectedSection.section);break}}}let[D,m,s]=await _;if(await X,A.log.enabled)f+=g1({blockedUsers:D,taggedUsers:m,lockedUsers:s}),await T1(f);if(G){if(z.move.enabled&&M.selectedSection.type==="all")await Y1(M);if(M.selectedSection.type==="single"||M.selectedSection.type==="multiple")M.selectedSection=null;await Z.refreshRevId()}new j({type:"success",content:"Done!"}).show()}function I5(h,z){if(!h.includes(`
----`))h=h.replace(/<!-+ All comments go ABOVE this line, please. -+>/,""),h+=`
----<!-- All comments go ABOVE this line, please. -->`;if(z=w1(z.trimEnd()),u()||R())return h.replace(/\n*----(?!.*----)/s,`
${z}
----`);else return h.replace(D1,`
`+z+`

====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====
`)}function c5(h,z){let v="";switch(h){case"reopen":h="open",v="Reopening";break;case"open":v="Marking request as open";break;case"CUrequest":v="Adding checkuser request";break;case"admin":v="Requesting admin action";break;case"clerk":v="Requesting clerk action";break;case"selfendorse":h="endorse",v="Adding checkuser request (self-endorsed for checkuser attention)";break;case"checked":v="Marking request as checked";break;case"inprogress":v="Marking request in progress";break;case"decline":v="Declining checkuser";break;case"cudecline":v="CU declining checkuser";break;case"endorse":v="Endorsing for checkuser attention";break;case"cuendorse":v="CU endorsing for checkuser attention";break;case"moreinfo":case"cumoreinfo":v="Requesting additional information";break;case"relist":v="Relisting case for another check";break;case"hold":v="Putting case on hold";break;case"cuhold":v="Placing checkuser request on hold";break;case"closed":v="Closing case";break;case"nochange":break;default:console.error("Unexpected case status value",h)}let M=a.exec(z);if(M?.[0])z=z.replace(M[0],`{{SPI case status|${h}}}`);return{newStatus:h,summaryItem:v,targetText:z}}async function W2(h){let z=[],v=[],M=[],V=Promise.resolve([]),{userLocks:d,options:H,lockcomment:L,master:f,skipCUVerifyUsers:F}=h.blockData,W=h.accounts.filter((b)=>b.username!==""),q=[];await U5(W);let y=R()&&!H.noBlock,{allUsernames:J,allUserPages:Y,allUserTalkPages:_}=W.reduce((b,l)=>{return b.allUsernames.add(l.username),b.allUserPages.push(`User:${l.username}`),b.allUserTalkPages.push(`User talk:${l.username}`),b},{allUsernames:new Set,allUserPages:[],allUserTalkPages:[]}),X=new j({type:"notice",content:"Fetching user blocks and tags"}).show(),[G,D,m]=await Promise.all([s1(J),C1(Y),C1(_)]);X.update({type:"success",content:"Got previous blocks and tags"});let s=async(b,l)=>{return await G5({sock:b,pageText:D.get(b.username)??"",blocked:l,tagNonLocalAccounts:H.tagUnattached})?b.username:null};for(let b of W){if(b.block.lock&&!E(b.username)){if(d.get(b.username)!==!0)q.push(b.username)}if(y&&b.block.block){let l=[];if(H.addMasterNotice&&(b.block.tags.some((C)=>j1(C))||b.username===f))l.push("master");else if(H.addSockNotice)l.push("sock");let t=Math.max(500,W.length*100),x=(async()=>{let C=G.get(b.username);if(C!==void 0&&!H.override){let h1=new j({type:"warning",content:`Block target ${b.username} is already blocked. `}),e=b.block.tags.length>0;if(e)h1.content+="Proceeding with tagging";else h1.content+='Check the "override existing blocks" box to re-block them';return h1.show(),{blockedUsername:null,shouldTag:e}}let P=C?.reason;if(!O()&&!F.has(b.username)&&H.override&&P&&k1.exec(P)){let h1="User "+b.username+` is CheckUser-blocked, are you SURE you want to re-block them?
Current block message:
`+P;if(!confirm(h1))return{blockedUsername:null,shouldTag:!1}}if(!b.block.duration)return new j({type:"error",content:`Block target ${b.username} does not have an intended duration`}).show(),{blockedUsername:null,shouldTag:!1};await new Promise((h1)=>setTimeout(h1,Math.random()*t));let L1=await X5({sock:b,blockOptions:H});return{blockedUsername:L1?b.username:null,shouldTag:L1}})();if(z.push(x.then(({blockedUsername:C})=>C)),l.length>0)M.push((async()=>{let{blockedUsername:C}=await x;if(C===null)return;await _5({sock:b,userTalkContent:m.get(b.username),blockOptions:H,talkNotices:l})})());if(b.block.tags.length>0)v.push((async()=>{let{shouldTag:C}=await x;if(!C)return null;return s(b,!0)})())}else if(b.block.tags.length>0)v.push(s(b,G.has(b.username)))}if(q.length>0){let b=H.lockHideNames;V=K5({lockTargets:q,hideNames:b,master:f,lockComment:L})}return{blockPromises:z,tagPromises:v,talkNoticePromises:M,lockPromise:V}}function Y3(h,z){let[v,...M]=h;if(!v)return"";let V=v.charAt(0).toUpperCase()+v.slice(1),d=M.length?`, ${M.join(", ")}`:"";return(z?`/* ${z} */ `:"")+V+d}function J3(h){let z=$(`a[href$="section=${h}"]`).first();if(z.length===0)return null;let v=z.parentsUntil(":has(hr)").last().nextUntil("hr");return v.length>0?v:null}function $2(h){let z=$(`a[href$="section=${h}"]`).first();if(z.length===0)return null;let v=z.closest(".mw-heading");return v.length>0?v.get(0)??null:null}function x5(h){let z=$2(h);if(z)z.scrollIntoView({behavior:"smooth",block:"center"})}function p5(){return document.querySelector("#mw-content-text .mw-parser-output")}function X3(h){let z=p5(),v=$2(h);if(!z||!v)return null;let V=J3(h)?.last().get(0)??v,d=z.getBoundingClientRect(),H=v.getBoundingClientRect(),L=V.getBoundingClientRect(),f=Math.min(H.top,L.top)-d.top+z.scrollTop,F=Math.max(H.bottom,L.bottom)-d.top+z.scrollTop;return{top:f,height:Math.max(1,F-f)}}function N5(){let h=p5();if(!h)return null;let z=document.createElement("div");return z.style.display="none",z.className="spiHelper-section-overlay",h.appendChild(z),z}function _3(h,z,v){let M=X3(z);if(!h||!M)return;h.style.top=`${Math.max(0,M.top)}px`,h.style.height=`${M.height+8}px`,h.style.display="block",h.dataset.sectionId=String(z),h.classList.toggle("spiHelper-section-overlay--preview",v==="preview"),h.classList.toggle("spiHelper-section-overlay--selected",v==="selected")}function R5(h,z){let v=/v-\d+-(\d+)/.exec(h.id);if(v===null||v.length<2)return null;let M=Number(v[1]),V=z[M-1];if(!V||V.value==="all")return null;return typeof V.value==="number"?V.value:null}var $0=null,b0=new Map;function K3(){return $0??=N5(),$0}function D3(h){let z=b0.get(h);if(!z){let v=N5();if(!v)return null;z=v,b0.set(h,z)}return z}function b2(h,z){let v=z==="preview"?K3():D3(h);_3(v,h,z)}function m5(){if($0)$0.style.display="none"}function j2(h){let z=new Set(h);for(let[v,M]of b0)if(!z.has(v))M.remove(),b0.delete(v);for(let v of h)b2(v,"selected")}function P5(){j2([])}var O5="open in spiHelper";function a5(h,z){let v=[];for(let M of h){let V=$2(M);if(!V)continue;let d=V.querySelector(".mw-editsection");if(d){let H=d.querySelector(".mw-editsection-bracket:last-child"),L=document.createElement("span");L.className="mw-editsection-divider",L.textContent=" | ";let f=document.createElement("a");if(f.href="#",f.className="spiHelper-section-open",f.textContent=O5,f.addEventListener("click",(F)=>{F.preventDefault(),z(M)}),H)d.insertBefore(L,H),d.insertBefore(f,H);else d.append(L,f);v.push(L,f)}else{let H=document.createElement("span");H.className="mw-editsection-like spiHelper-section-open";let L=document.createElement("span");L.className="mw-editsection-bracket",L.textContent="[";let f=document.createElement("a");f.href="#",f.textContent=O5,f.addEventListener("click",(W)=>{W.preventDefault(),z(M)});let F=document.createElement("span");F.className="mw-editsection-bracket",F.textContent="]",H.append(L,f,F),V.appendChild(H),v.push(H)}}return()=>{for(let M of v)M.remove()}}var Q2=Q({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0}},data(){let h=t0(),z=Object.keys(h);return{open:!1,handlers:{openHandler:null,beforeUnloadHandler:null},actionsRunning:!1,displayedForms:new Set(["sections"]),unpinned:!A.interface.pinned,buttonLayout:A.interface.buttonLayout,actionButtons:h,actionButtonKeys:z,sectionAccountNames:new Set,caseActions:e0(),accounts:[],messages:S,sectionClickCleanup:null,multiSelectMode:!1,icons:{cdxIconPushPin:M0,cdxIconCollapse:d5,cdxIconExpand:L5,cdxIconFeedback:X1}}},computed:{allDisabled(){for(let[h,z]of Object.entries(this.caseActions)){if(h==="sections"||h==="link")continue;if(z.enabled)return!1}return[...this.caseActions.comment.data.bySection.values(),...this.caseActions.status.data.bySection.values()].every((h)=>!h.enabled)},selectedSection(){return this.state.selectedSection},selectedSections(){return i2(this.state.selectedSection)},archiveNotice(){return this.state.archiveNotice},stateSections(){return this.state.sections},mountPoint(){return this.$el.parentElement}},watch:{unpinned(h){if(!this.mountPoint){console.error("TopViewComponent unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");A.interface.pinned=!h},async open(h){if(h)await this.ensureArchiveNotice(),this.syncSelectedSectionOverlay();else this.syncSelectedSectionOverlay(),d1()},async stateSections(h){if(this.setupSectionButtons(),this.caseActions.sections.data.section===null){let z=h[0];if(z)this.caseActions.sections.data.section=z.id,await this.ensureArchiveNotice(),await this.loadNewSection(z);else await this.onUpdateSectionSelection("all")}},archiveNotice(h){this.caseActions.management.data.flags=M2(h)},"caseActions.sections.data.section"(h,z){if(h===z)return;for(let[v,M]of Object.entries(this.caseActions)){let V=v;if(V==="sections")continue;let d=A.defaultActions.includes(V);if(M.enabled=d,d&&(h2.has(V)||h==="all"&&v2.has(V)||typeof h==="number"&&z2.has(V)||Array.isArray(h)&&(z2.has(V)||v2.has(V))))this.displayedForms.add(V)}}},mounted(){if(!this.mountPoint){console.error("TopViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.handlers.beforeUnloadHandler=(h)=>{let z=i1("mainActions");if(!this.allDisabled&&z!=="success")h.preventDefault()},this.handlers.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"top"}),this.handlers.beforeUnloadHandler)window.addEventListener("beforeunload",this.handlers.beforeUnloadHandler)}else if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler)},this.openButton.addEventListener("click",this.handlers.openHandler)},beforeUnmount(){if(this.handlers.openHandler)this.openButton.removeEventListener("click",this.handlers.openHandler);if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler);this.sectionClickCleanup?.(),this.sectionClickCleanup=null},methods:{setupSectionButtons(){let h=this.state.sections.map((z)=>z.id);if(h.length===0)return;this.sectionClickCleanup=a5(h,(z)=>{if(this.multiSelectMode)this.toggleMultiSelectSection(z);else this.onUpdateSectionSelection(z);if(!this.open)this.open=!0})},syncSelectedSectionOverlay(){if(!A.highlightSection||!this.open){P5();return}j2(this.selectedSections.map((h)=>h.id))},toggleButtonLayout(){this.buttonLayout=!this.buttonLayout,A.interface.buttonLayout=this.buttonLayout},onActionClick(h,z){let v=z;if(h.ctrlKey||h.metaKey)if(this.displayedForms.has(v))this.displayedForms.delete(v);else this.displayedForms.add(v);else this.displayedForms=new Set([v])},onAccordionToggle(h){let z=h;if(this.displayedForms.has(z))this.displayedForms.delete(z);else this.displayedForms.add(z)},isVisible(h){return this.displayedForms.has(h)},async onUpdateSectionSelection(h){if(h===null)return;if(this.caseActions.sections.data.section=h,(this.state.selectedSection?.type??null)!==(h==="all"?"all":"single"))this.displayedForms=new Set(Array.from(this.displayedForms).filter((V)=>h2.has(V)));if(h==="all"){this.state.selectedSection={type:"all"},this.loadSectionAccounts(this.state.selectedSection),this.syncSelectedSectionOverlay();return}let M=this.state.sections.find((V)=>V.id===h);if(M===void 0){console.error("onUpdateSectionSelection: Could not find target section with ID",h);return}await this.loadNewSection(M)},async loadNewSection(h){this.state.selectedSection={type:"single",section:h};let z=await c(h),v=a.exec(z),M=d2(v?.[1]??"");if(this.caseActions.status.data.old=M,this.caseActions.status.data.new=M,M==="closed"&&A.tickArchiveWhenCaseClosed)this.caseActions.archive.enabled=!0;this.syncSelectedSectionOverlay(),this.loadSectionAccounts(this.state.selectedSection)},async toggleMultiSelectMode(h){if(this.multiSelectMode=h,!h){let z=this.selectedSections;if(z.length>1){let[v]=z;if(v)await this.applySectionSelection([v])}return}if(this.state.selectedSection?.type==="all")await this.applySectionSelection([])},async toggleMultiSelectSection(h){let z=this.selectedSections;if(z.some((V)=>V.id===h)){await this.applySectionSelection(z.filter((V)=>V.id!==h));return}let M=this.state.sections.find((V)=>V.id===h);if(!M){console.error("toggleMultiSelectSection: Could not find target section with ID",h);return}await this.applySectionSelection([...z,M])},async handleUpdateMultiSelectSections(h){let z=new Set(h),v=this.state.sections.filter((M)=>z.has(M.id));await this.applySectionSelection(v)},async applySectionSelection(h){if(this.pruneBySectionData(new Set(h.map((z)=>z.id))),h.length===0){this.caseActions.sections.data.section=null,this.state.selectedSection=null,this.syncSelectedSectionOverlay();return}if(h.length===1){let[z]=h;if(!z)return;this.caseActions.sections.data.section=z.id,await this.loadNewSection(z);return}this.caseActions.sections.data.section=h.map((z)=>z.id),this.state.selectedSection={type:"multiple",sections:h},await Promise.all(h.map((z)=>this.ensureBySectionEntry(z))),this.syncSelectedSectionOverlay(),this.loadSectionAccounts(this.state.selectedSection)},async ensureBySectionEntry(h){if(!this.caseActions.comment.data.bySection.has(h.id))this.caseActions.comment.data.bySection.set(h.id,{text:"* ",enabled:!1});if(!this.caseActions.status.data.bySection.has(h.id)){let z=await c(h),v=a.exec(z),M=d2(v?.[1]??"");this.caseActions.status.data.bySection.set(h.id,{old:M,new:M,enabled:!1})}},pruneBySectionData(h){for(let z of this.caseActions.comment.data.bySection.keys())if(!h.has(z))this.caseActions.comment.data.bySection.delete(z);for(let z of this.caseActions.status.data.bySection.keys())if(!h.has(z))this.caseActions.status.data.bySection.delete(z)},async loadSectionAccounts(h){this.accounts=this.accounts.filter((H)=>!this.sectionAccountNames.has(H.username));let z=await(async()=>{if(h.type==="all")return n(this.state);if(h.type==="multiple")return(await Promise.all(h.sections.map((L)=>c(L)))).join(`
`);return c(h.section)})(),[v,M,V]=N1({text:z,fullSearch:!0,state:this.state}),d=await _1({likelySocks:v,possibleSocks:M,allUsernames:V,userBlocks:this.caseActions.block.data.userBlocks,userLocks:this.caseActions.block.data.userLocks,userTags:this.caseActions.block.data.userTags,state:this.state});this.sectionAccountNames=new Set(this.massAddUserRows(d).map((H)=>H.username))},onUpdateNewStatus(h){this.caseActions.comment.data.text=A0(this.caseActions.comment.data.text,h)},onUpdateSectionStatus(h,z){let v=this.caseActions.comment.data.bySection.get(h),M=v?.text??"* ";this.caseActions.comment.data.bySection.set(h,{text:A0(M,z),enabled:v?.enabled??!1})},async onSubmitActions(){if(Q1("mainActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"top"}),N("mainActions"),this.actionsRunning=!0,await E5({actions:this.caseActions,accounts:this.accounts,state:this.state}),U("mainActions","success"),this.actionsRunning=!1},handleFetchRows(){let[h,z]=N1({text:this.caseActions.comment.data.text,fullSearch:!1,state:this.state}),v=new Set(h),M=[...h,...z].map((V)=>R1({userRow:V,defaultBlock:v.has(V)}));this.massAddUserRows(M)},handleUserSelected(h,z){let v=this.accounts.find((M)=>M.id===z);if(!v)return;if(h.blockid!==void 0&&!this.caseActions.block.data.userBlocks.has(v.username)){let M=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.caseActions.block.data.userBlocks.set(v.username,{username:v.username,duration:h.blockexpiry??"",abao:M??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}Z0(h,v)},handleAddRow(h){h??=Z1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((z)=>!h.includes(z.id))},massAddUserRows(h){let z=this.accounts.at(-1)?.username==="",v=new Set(this.accounts.map((V)=>V.username)),M=h.filter((V)=>!v.has(V.username));if(z)M.forEach((V)=>{this.accounts.splice(this.accounts.length-1,0,V)});else this.accounts=this.accounts.concat(M);return M},async ensureArchiveNotice(){if(this.state.archiveNotice)return;let h=await K1({page:Z.casePageName,state:this.state});if(h===null)this.state.archiveNotice=new g({username:Z.caseName}),new j({type:"warning",content:"Can't find archivenotice template! Automatically adding the archive notice to the page."}).show(),mw.notify("Can't find archivenotice template! If this is incorrect, please contact DatGuy",{type:"warn"}),console.warn("archivenoticeResult is null");else this.state.archiveNotice=h},launchFeedback(){this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`SPI form v${k}-${p}`})},async handleMoveEntireCase(){await this.onUpdateSectionSelection("all"),this.caseActions.move.enabled=!0}},template:`
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
                :multi-select-mode="multiSelectMode"
                :selected-sections="selectedSections"
                @update-section-selection="onUpdateSectionSelection"
                @update-status="onUpdateNewStatus"
                @update-section-status="onUpdateSectionStatus"
                @update:multi-select-mode="toggleMultiSelectMode"
                @update-multi-select-sections="handleUpdateMultiSelectSections"
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
              :multi-select-mode="multiSelectMode"
              :selected-sections="selectedSections"
              @update-section-selection="onUpdateSectionSelection"
              @update-status="onUpdateNewStatus"
              @update-section-status="onUpdateSectionStatus"
              @update:multi-select-mode="toggleMultiSelectMode"
              @update-multi-select-sections="handleUpdateMultiSelectSections"
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
  `});var y2=Q({props:{enabled:{type:Boolean,required:!0},selection:{type:Object,required:!0},statusData:{type:Object,required:!0}},emits:["update:enabled"],computed:{isMultiSelectMode(){return this.selection?.type==="multiple"},skippedSections(){if(this.selection?.type!=="multiple")return[];return this.selection.sections.map((h)=>({name:h.name,status:this.effectiveSectionStatus(h.id)})).filter((h)=>h.status!=="closed")},badStatus(){if(!this.selection||this.selection.type==="all")return!1;if(this.selection.type==="multiple")return this.skippedSections.length===this.selection.sections.length;return this.status!=="closed"},status(){return this.effectiveStatus(this.statusData.old,this.statusData.new)}},methods:{effectiveStatus(h,z){switch(z){case"nochange":return h;case"selfendorse":return"endorse";default:return z}},effectiveSectionStatus(h){let z=this.statusData.bySection.get(h);if(console.log(z),!z)return"";return this.effectiveStatus(z.old,z.new)}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus && !isMultiSelectMode" type="warning" :inline="true">
      The selected section's status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
    <cdx-message v-if="isMultiSelectMode && skippedSections.length > 0" type="warning">
      <p>These sections aren't set to 'closed' and will be skipped:</p>
      <ul>
        <li v-for="section in skippedSections" :key="section.name">
          {{ section.name }} is set to '{{ section.status }}'
        </li>
      </ul>
      <p>If you'd like to archive them, change their status to 'closed'.</p>
    </cdx-message>
  `});var j0=Q({props:{accounts:{type:Array,required:!0},blockOptions:{type:Object,required:!0},userLocks:{type:Map,required:!0},userBlocks:{type:Map,required:!0},defaultMaster:{type:String,required:!0},fetchType:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","update:blockOptions","removeRows","addRow","userSelected","usernameChanged","fetchRows"],data(){let h=[{id:"username",label:"Username"},{id:"tag",label:"Tag"},{id:"lock",label:"Request Lock"}],z=R(),v=O(),M=u();if(z)h.splice(1,0,...[{id:"block",label:"Block"},{id:"duration",label:"Duration"},{id:"acb",label:"ACB"},{id:"abao",label:"AB/AO"},{id:"ntp",label:"NTP"},{id:"nem",label:"NEM"}]);return{columns:h,selectedRows:[],topButtonActions:{copied:!1,fetched:!1},isAdmin:z,isCheckuser:v,isClerk:M,popovers:{all:{open:!1},row:{anchor:null,open:!1,tagIndex:0,rowId:null},clipboardTag:null},cdxIconCopy:v0,cdxIconDownload:H5,cdxIconTrash:H1,cdxIconUserAvatar:d0,cdxIconUserAvatarOutline:H0}},computed:{selectAll(){return this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)},allowLockOption(){return this.accounts.some((h)=>h.block.lock&&!E(h.username)&&!this.userLocks.get(h.username))}},methods:{isNonRegisteredAccount:E,isSockmasterTag:j1,setAllValue(h){let z=this.getTargetRows().filter((v)=>!this.isInputDisabled(v,h));return z.length>0&&z.every((v)=>v.block[h])},setAllIndeterminate(h){let z=this.getTargetRows().filter((M)=>!this.isInputDisabled(M,h)),v=z.filter((M)=>M.block[h]).length;return v>0&&v<z.length},isInputDisabled(h,z){return f0(h,z,this.blockOptions,this.userBlocks,this.userLocks,this.getTargetRows())},async copySocks(){if(this.selectedRows.length===0)return;let h="{{sock list",z=0;this.selectedRows.forEach((v)=>{let M=this.accounts[v];if(!M)return;h+=`|${++z}=${M.username}`}),h+="}}",await navigator.clipboard.writeText(h),this.topButtonActions.copied=!0},onMessageDismissed(h){setTimeout(()=>{this.topButtonActions[h]=!1},200)},removeSocks(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},addDefaultRow(){this.$emit("addRow")},handleSelectAll(h){if(this.selectAllIndeterminate=!1,h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,z){this.$emit("userSelected",h,z.id)},setAllBlockFields(h,z){for(let v of this.getTargetRows()){if(this.isInputDisabled(v,h))continue;v.block[h]=z}},setAllTags(h){for(let z of this.getTargetRows()){if(E(z.username))continue;z.block.tags=[h.clone()]}},getTargetRows(){if(this.selectedRows.length===0)return this.accounts;let h=new Set(this.selectedRows);return this.accounts.filter((z,v)=>h.has(v))},fetchSocks(){this.topButtonActions.fetched=!0,this.$emit("fetchRows")},showTagPopover(h,z,v,M){let V=v!==this.popovers.row.rowId||z!==this.popovers.row.tagIndex;if(this.popovers.row.tagIndex=z,this.popovers.row.rowId=v,this.popovers.row.anchor=M.currentTarget,V)this.popovers.row.open=!0,this.$refs.rowTagPopover.setTag(h);else this.popovers.row.open=!this.popovers.row.open},handleTagUpdate(h){let z=this.accounts.find((v)=>v.id===this.popovers.row.rowId);if(!z){console.error("Could not find target row for tag update",this.popovers.row.rowId);return}z.block.tags.splice(this.popovers.row.tagIndex,1,h)},handleTagDelete(){let h=this.accounts.find((z)=>z.id===this.popovers.row.rowId);if(!h){console.error("Could not find target row for tag delete",this.popovers.row.rowId);return}h.block.tags.splice(this.popovers.row.tagIndex,1)},handleTagAdd(h){let z=this.accounts.find((M)=>M.id===h);if(!z)return console.error("Could not find target row for tag add",h),null;let v=new w({master:this.defaultMaster,status:"blocked"});return z.block.tags.push(v),v},getRowTagsWithDefault(h){if(h.length===0)return[null];else return h},handleTagAddAll(){for(let h of this.getTargetRows()){if(E(h.username))continue;h.block.tags.push(new w({master:this.defaultMaster,status:"blocked"}))}},handleTagDeleteAll(){for(let h of this.getTargetRows())h.block.tags.length=0},validateTag(h){return!(i(h)&&!h.master)}},template:`
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
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('block')" :indeterminate="setAllIndeterminate('block')"
                            @update:model-value="setAllBlockFields('block', $event)"
                            :disabled="isInputDisabled(null, 'block')">
                Set all block
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <expiry-input placeholder="Duration" @update:model-value="setAllBlockFields('duration', $event)"
                            :disabled="isInputDisabled(null, 'duration')" />
            </th>

            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('acb')" :indeterminate="setAllIndeterminate('acb')"
                            @update:model-value="setAllBlockFields('acb', $event)"
                            :disabled="isInputDisabled(null, 'acb')">
                Set all account creation blocked
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('abao')" :indeterminate="setAllIndeterminate('abao')"
                            @update:model-value="setAllBlockFields('abao', $event)"
                            :disabled="isInputDisabled(null, 'abao')">
                Set all autoblock/anon-only
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('ntp')" :indeterminate="setAllIndeterminate('ntp')"
                            @update:model-value="setAllBlockFields('ntp', $event)"
                            :disabled="isInputDisabled(null, 'ntp')">
                Set all no talk page
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('nem')" :indeterminate="setAllIndeterminate('nem')"
                            @update:model-value="setAllBlockFields('nem', $event)"
                            :disabled="isInputDisabled(null, 'nem')">
                Set all no email
              </cdx-checkbox>
            </th>

            <th scope="col" class="selectTagOptions">
              <cdx-button ref="selectAllTagButton" @click="popovers.all.open = true">
                Set all tags
              </cdx-button>
              <tag-popover :anchor="$refs.selectAllTagButton" :default-master="defaultMaster"
                           v-model:open="popovers.all.open" :clipboard-tag="popovers.clipboardTag"
                           @saveTag="setAllTags" @deleteTag="handleTagDeleteAll"
                           @addTag="handleTagAddAll" @copyTag="popovers.clipboardTag = $event" />
            </th>

            <th scope="col">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('lock')" :indeterminate="setAllIndeterminate('lock')"
                            @update:model-value="setAllBlockFields('lock', $event)"
                            :disabled="isInputDisabled(null, 'lock')">
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
                        :disabled="isInputDisabled(row, 'block')">
            Block
          </cdx-checkbox>
        </template>

        <template #item-duration="{ item, row }">
          <expiry-input v-model="row.block.duration" :shortened="true" :auto-dismiss="true" :touched="true"
                        :disabled="isInputDisabled(row, 'duration')"
                        placeholder="Duration" />
        </template>

        <template #item-acb="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.acb"
                        :disabled="isInputDisabled(row, 'acb')">
            Account creation blocked
          </cdx-checkbox>
        </template>
        <template #item-abao="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.abao"
                        :disabled="isInputDisabled(row, 'abao')">
            Autoblock/Anon-only
          </cdx-checkbox>
        </template>
        <template #item-ntp="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.ntp"
                        :disabled="isInputDisabled(row, 'ntp')">
            No talk page
          </cdx-checkbox>
        </template>
        <template #item-nem="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.nem"
                        :disabled="isInputDisabled(row, 'nem')">
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
                        :disabled="isInputDisabled(row, 'lock')">
            Request lock
          </cdx-checkbox>
        </template>

        <template #footer>
          <cdx-button @click="addDefaultRow">Add Row</cdx-button>
        </template>
      </cdx-table>
      <tag-popover ref="rowTagPopover" :anchor="popovers.row.anchor" v-model:open="popovers.row.open"
                   :default-master="defaultMaster" :clipboard-tag="popovers.clipboardTag"
                   @saveTag="handleTagUpdate" @addTag="handleTagAdd(popovers.row.rowId)"
                   @deleteTag="handleTagDelete" @copyTag="popovers.clipboardTag = $event" />
    </action-container>
  `});var Y2=Q({props:{enabled:{type:Boolean,required:!0},text:{type:String,required:!0},selectedSection:{type:Object,required:!0}},emits:["update:enabled","update:text"],data(){let h=u(),z=R(),v=O(),M=[{value:"takenote",label:"Note"}],V=[...C2],d=[...c2];if(v)M.unshift({value:"cunote",label:"CheckUser note"});if(z)M.unshift({value:"adminnote",label:"Administrator note"});if(h)M.unshift({value:"clerknote",label:"Clerk note"});let H=s0(A.custom.commentTemplates);return{isClerk:h,isAdmin:z,isCheckuser:v,noteTemplates:M,clerkTemplates:V,cuTemplates:d,customTemplates:H,loadingPreview:!1,htmlPreview:"",fullPreview:A.interface.fullPreview,cdxIconReload:V0}},computed:{commentBox(){return this.$refs.commentBox}},methods:{onEnable(h){if(this.$emit("update:enabled",h),h)this.$nextTick(()=>{this.commentBox.focus()})},onTextUpdate(h){this.$emit("update:text",h)},async updatePreview(){this.loadingPreview=!0;let h=w1(this.text);try{if(this.fullPreview&&this.selectedSection?.type==="single"){let z=await c(this.selectedSection.section),v,M;if(this.isClerk||this.isAdmin)v=D1.exec(z)?.index,M=/\n*----(?!.*----)/s.exec(z)?.index;else v=/\s*====\s*<big>Comments by other users<\/big>\s*====\s*/i.exec(z)?.index,M=D1.exec(z)?.index;let V=z.slice(v??0,M??0).trim()+`
`+h;this.htmlPreview=await R0(Z.pageName,V)}else this.htmlPreview=await R0(Z.pageName,h)}finally{this.loadingPreview=!1}},insertNote(h){let z=this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i,"* {{"+h+"}} ");this.$emit("update:text",z),this.commentBox.focus()},insertText(h){h=`{{${h.replace(/^{+|}+$/g,"")}}}`;let z=this.commentBox.$el.querySelector("textarea");if(!z){console.error("commentAction: Unable to find textarea");return}let{selectionStart:v,selectionEnd:M}=z,V=this.text;if(v||v===0)V=V.slice(0,v)+h+V.slice(M,V.length),z.selectionStart=v+h.length,z.selectionEnd=M+h.length;else V+=h;this.$emit("update:text",V),this.commentBox.focus()}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="onEnable">
      <div id="spiHelper-templateRow">
        <cdx-select :menu-items="noteTemplates" default-label="Comment templates" @update:selected="insertNote" />
        <cdx-select v-if="isClerk || isAdmin" :menu-items="clerkTemplates" default-label="Admin/clerk templates" @update:selected="insertText" />
        <cdx-select v-if="isCheckuser" :menu-items="cuTemplates" default-label="CheckUser templates" @update:selected="insertText" />
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
  `});var J2=Q({props:{enabled:{type:Boolean,required:!0},oldStatus:{type:String,required:!0},newStatus:{type:String,required:!0}},emits:["update:enabled","update:newStatus"],computed:{selected:{get(){let h=this.caseStatusItems.flatMap((v)=>m1(v)?v.items:[v]);if(this.newStatus==="nochange")return h.some((M)=>M.value===this.oldStatus)?this.oldStatus:"nochange";return h.some((v)=>v.value===this.newStatus)?this.newStatus:"nochange"},set(h){if(h===null)return;this.$emit("update:newStatus",String(h))}},caseStatusItems(){let h=[],z=[],v=[],M=[],V=O(),d=u(),H=/^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.oldStatus),L=/^endorsed?$/i.test(this.oldStatus),f=/^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclin(ed)?)$/i.test(this.oldStatus),F=`No change (${this.oldStatus})`;if(h.push({label:F,value:"nochange"}),q1.test(this.oldStatus))h.push({label:"Reopen",value:"reopen"});else h.push({label:"Open",value:"open"});if(h.push({label:"Close",value:"closed"}),v.push({label:"Request CheckUser",value:"CUrequest"}),V)v.push({label:"Check in progress",value:"inprogress"});if(d){if(v.push({label:"Request and self-endorse",value:"selfendorse"}),z.push({label:"Request more information",value:"moreinfo"}),V)v.push({label:"Mark as checked",value:"checked"});if(f)v.push({label:"Relist for another check",value:"relist"})}if(d){if(H){if(V)v.push({label:"Endorse CheckUser",value:"cuendorse"}),v.push({label:"Decline CheckUser",value:"cudecline"});else v.push({label:"Endorse for CheckUser attention",value:"endorse"}),v.push({label:"Decline CheckUser",value:"decline"});z.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}else if(L){if(O())v.push({label:"Decline CheckUser",value:"cudecline"});else v.push({label:"Decline CheckUser",value:"decline"});z.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}}if(z.push({label:"Place case on CU hold",value:"cuhold"}),z.push({label:"Place case on hold",value:"hold"}),M.push({label:"Request clerk action",value:"clerk"}),R()||d)M.push({label:"Request admin action",value:"admin"});let W=[z.length?{label:"Clerking",items:z}:null,v.length?{label:"CheckUser",items:v}:null,M.length?{label:"Deferral",items:M}:null].filter((q)=>q!==null);return[...h,...W]}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
    </action-container>
  `});var Q0=Q({props:{accounts:{type:Array,required:!0},caseName:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","removeRows","addRow","userSelected","usernameChanged"],data(){let h=[{id:"username",label:"Username"},{id:"analyser",label:"Interaction Analyser"},{id:"timeline",label:"Timeline"},{id:"timecard",label:"Timecard"},{id:"pages",label:"Pages"},{id:"summary",label:"Summaries"},{id:"cuwiki",label:"CU wiki"},{id:"interleaved",label:"Interleaved"}],z=h.slice(1);return{columns:h,optionColumns:z,selectedRows:[],cdxIconAdd:J1,cdxIconTrash:H1}},computed:{columnState(){let h=this.accounts,z={};for(let v of this.optionColumns){if(h.length===0){z[v.id]={checked:!1,indeterminate:!1};continue}let M=h.map((H)=>H.link[v.id]),V=M.every(Boolean),d=M.every((H)=>!H);z[v.id]={checked:V,indeterminate:!V&&!d}}return z},allColumnsChecked(){return this.accounts.length>0&&this.optionColumns.every((h)=>this.columnState[h.id].checked)},allColumnsIndeterminate(){let h=this.optionColumns.filter((z)=>this.columnState[z.id].checked).length;return h>0&&h<this.optionColumns.length},linkItems(){let h={};for(let z of this.optionColumns){let v=this.getLinkFormat(z.id);if(v===null){console.error("Couldn't find link format for",z.id);continue}let M=v.baseUrl(this.caseName);if(v.startingParams)for(let[d,H]of v.startingParams)M.searchParams.set(d,H);let V=this.accounts.reduce((d,H)=>{if(H.link[z.id])d.push(v.userQueryStringWrapper+H.username+v.userQueryStringWrapper);return d},[]);if(V.length===0)continue;if(v.multipleUserQueryStringKeys)for(let d of V)M.searchParams.append(v.userQueryStringKey,d);else M.searchParams.set(v.userQueryStringKey,V.join(v.userQueryStringSeparator));h[z.id]={url:M,label:z.label}}return h},selectAll(){return this.accounts.length>0&&this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)}},watch:{selectedRows(h,z){let v=new Set(z),M=new Set(h),V=(d,H)=>{let L=this.accounts[d];if(L)this.toggleRow(L,H)};for(let d of M)if(!v.has(d))V(d,!0);for(let d of v)if(!M.has(d))V(d,!1)}},methods:{handleSelectAll(h){if(h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,z){this.$emit("userSelected",h,z.id)},addDefaultRow(){this.$emit("addRow")},removeRows(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},toggleColumn(h,z){for(let v of this.accounts)v.link[h]=z},toggleAllColumns(h){for(let z of this.optionColumns)this.toggleColumn(z.id,h)},toggleRow(h,z){for(let v of this.optionColumns)h.link[v.id]=z},getLinkFormat(h){switch(h){case"analyser":return z1.editorInteractionAnalyser;case"cuwiki":return z1.checkUserWikiSearch;case"interleaved":return z1.interleaved;case"pages":return z1.sandals.pages;case"summary":return z1.sandals.summaries;case"timecard":return z1.sandals.timecard;case"timeline":return z1.sandals.consolidatedTimeline;default:return null}}},template:`
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
        <template #item-interleaved="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.interleaved">Interleaved</cdx-checkbox>
        </template>
      </cdx-table>
      <ul>
        <li v-for="[columnId, linkItem] in Object.entries(linkItems)" :key="columnId">
          <a :href="linkItem.url.href">{{ linkItem.label }}</a>
        </li>
      </ul>
    </action-container>
  `});var X2=Q({props:{enabled:{type:Boolean,required:!0},flags:{type:Set,required:!0}},emits:["update:enabled","update:flags"],data(){return{archiveNoticeFlags:[{value:"crosswiki",label:"Cross-wiki"},{value:"deny",label:"Deny"},{value:"notalk",label:"No talkpage access"},{value:"moot",label:"Moot"}]}},computed:{internalFlags:{get(){return Array.from(this.flags)},set(h){this.$emit("update:flags",new Set(h))}}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
    </action-container>
  `});var _2=Q({props:{enabled:{type:Boolean,required:!0},target:{type:String,required:!0},suppress:{type:Boolean,required:!0},addNote:{type:Boolean,required:!0},selection:{type:Object,required:!0},archiveEnabled:{type:Boolean,required:!0}},emits:["update:enabled","update:target","update:suppress","update:addNote","moveEntireCase"],data(){return{canSuppressRedirect:p1()}},computed:{isSectionMove(){return this.selectionType==="single"},moveTitle(){if(!this.selection)return"ERROR";if(this.selection.type==="all")return"entire case";if(this.selection.type==="multiple")return`${this.selection.sections.length} sections`;return"section "+this.selection.section.name},disabled(){return this.archiveEnabled||this.selectionType==="multiple"},selectionType(){return this.selection?.type??null}},watch:{archiveEnabled:{handler(h){if(h)this.$emit("update:enabled",!1)},immediate:!0}},template:`
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
      <cdx-checkbox v-if="!isSectionMove" :model-value="addNote" @update:model-value="$emit('update:addNote', $event)">
        Add old case note in archives
        <template #description>
          Adds a note for the original case name in merged archives to help distinguish them
        </template>
      </cdx-checkbox>
    </action-container>
    <cdx-message v-if="archiveEnabled" type="warning" :inline="true">
      Archival is enabled, which overrides moving.
    </cdx-message>
    <cdx-message v-if="selectionType === 'multiple'" type="warning" :inline="true">
      Moving isn't currently supported while multiple sections are selected.
    </cdx-message>
  `});var l3={text:"* ",enabled:!1},y0=Q({props:{sections:{type:Array,required:!0},bySection:{type:Object,required:!0}},methods:{entry(h){return this.bySection.get(h)??l3},onUpdateEnabled(h,z){this.bySection.set(h,{...this.entry(h),enabled:z})},onUpdateText(h,z){this.bySection.set(h,{...this.entry(h),text:z})}},template:`
    <div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
      <h4>{{ section.name }}</h4>
      <comment-action :enabled="entry(section.id).enabled"
                      @update:enabled="onUpdateEnabled(section.id, $event)"
                      :text="entry(section.id).text"
                      @update:text="onUpdateText(section.id, $event)"
                      :selected-section="{ type: 'single', section }" />
    </div>
  `});var B3={old:"",new:"nochange",enabled:!1},Y0=Q({props:{sections:{type:Array,required:!0},bySection:{type:Object,required:!0}},emits:["update-section-status"],methods:{entry(h){return this.bySection.get(h)??B3},onUpdateEnabled(h,z){let v=this.bySection.get(h);if(v)v.enabled=z},onUpdateNewStatus(h,z){let v=this.bySection.get(h);if(v)v.new=z;this.$emit("update-section-status",h,z)}},template:`
    <div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
      <h4>{{ section.name }}</h4>
      <change-status-action :enabled="entry(section.id).enabled"
                            @update:enabled="onUpdateEnabled(section.id, $event)"
                            :old-status="entry(section.id).old" :new-status="entry(section.id).new"
                            @update:new-status="onUpdateNewStatus(section.id, $event)" />
    </div>
  `});var K2=Q({props:{allSections:{type:Array,required:!0},selectedSection:{type:Object,required:!0},multiSelectMode:{type:Boolean,required:!0},selectedSections:{type:Array,required:!0}},emits:["update-section-selection","update:multiSelectMode","update-multi-select-sections"],data(){return{menuPointerOverHandler:null,menuPointerLeaveHandler:null,menuFocusInHandler:null,activeSectionId:null,overlayType:null,hoverPreviewTarget:null,hoverPreviewMenuItems:[]}},computed:{canJumpToSelectedSection(){return!this.multiSelectMode&&typeof this.selectedSection==="number"},sectionSelectElement(){let h=this.$refs.sectionSelect;return h?h.$el:null},multiselectLookupElement(){let h=this.$refs.multiselectLookup;return h?h.$el:null},menuItems(){let h=this.allSections.map((z)=>({value:z.id,label:z.name}));return h.push({value:"all",label:"All Sections"}),h},multiSelectMenuItems(){return this.allSections.map((h)=>({value:h.id,label:h.name}))},multiSelectChips:{get(){return this.selectedSections.map((h)=>({value:h.id,label:h.name}))},set(h){this.emitMultiSelectIds(h.map((z)=>z.value))}},multiSelectSelected:{get(){return this.selectedSections.map((h)=>h.id)},set(h){this.emitMultiSelectIds(h)}}},watch:{async multiSelectMode(){this.detachHoverPreviewListeners(),await this.$nextTick(),this.attachHoverPreviewListeners()}},mounted(){this.attachHoverPreviewListeners()},beforeUnmount(){this.detachHoverPreviewListeners()},methods:{handleUpdateSectionSelection(h){this.$emit("update-section-selection",h)},emitMultiSelectIds(h){let z=h.filter((d)=>typeof d==="number"),v=this.selectedSections.map((d)=>d.id),M=new Set(v);if(z.length===v.length&&z.every((d)=>M.has(d)))return;this.$emit("update-multi-select-sections",z)},jumpToSelectedSection(){if(!this.canJumpToSelectedSection)return;if(this.selectedSection===null||this.selectedSection==="all"||Array.isArray(this.selectedSection))return;x5(this.selectedSection)},renderSectionOverlay(h,z){this.overlayType=z,b2(h,z)},clearSectionHighlight(){m5()},attachHoverPreviewListeners(){if(!A.highlightSection)return;let h=this.multiSelectMode?this.multiselectLookupElement:this.sectionSelectElement;if(!h)return;this.hoverPreviewTarget=h,this.hoverPreviewMenuItems=this.multiSelectMode?this.multiSelectMenuItems:this.menuItems,this.menuPointerOverHandler=(z)=>{this.handlePreviewEvent(z)},this.menuPointerLeaveHandler=()=>{if(this.overlayType==="preview")this.clearSectionHighlight()},this.menuFocusInHandler=(z)=>{this.handlePreviewEvent(z)},h.addEventListener("pointerover",this.menuPointerOverHandler),h.addEventListener("pointerleave",this.menuPointerLeaveHandler),h.addEventListener("focusin",this.menuFocusInHandler)},detachHoverPreviewListeners(){if(this.menuPointerOverHandler)this.hoverPreviewTarget?.removeEventListener("pointerover",this.menuPointerOverHandler);if(this.menuPointerLeaveHandler)this.hoverPreviewTarget?.removeEventListener("pointerleave",this.menuPointerLeaveHandler);if(this.menuFocusInHandler)this.hoverPreviewTarget?.removeEventListener("focusin",this.menuFocusInHandler);this.menuPointerOverHandler=null,this.menuPointerLeaveHandler=null,this.menuFocusInHandler=null,this.hoverPreviewTarget=null,this.hoverPreviewMenuItems=[],this.clearSectionHighlight()},handlePreviewEvent(h){let z=h.target;if(!(z instanceof HTMLElement))return;let v=z.closest(".cdx-menu-item");if(!v)return;let M=R5(v,this.hoverPreviewMenuItems);if(M===null){this.activeSectionId=null,this.clearSectionHighlight();return}if(M!==this.activeSectionId)this.renderSectionOverlay(M,"preview")}},template:`
    <!-- Sections special case -->
    <div class="spiHelper-section-selector">
      <div class="spiHelper-section-input" :class="{ 'spiHelper-section-input--multi': multiSelectMode }">
        <cdx-select v-if="!multiSelectMode" :menu-items="menuItems" :selected="selectedSection"
                    @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
        <cdx-multiselect-lookup v-else class="spiHelper-multi-select-lookup" ref="multiselectLookup"
            v-model:input-chips="multiSelectChips" v-model:selected="multiSelectSelected"
            :menu-items="multiSelectMenuItems" :keep-input-on-selection="true" />
      </div>
      <cdx-button weight="normal" :disabled="multiSelectMode || !canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
      <cdx-toggle-switch :model-value="multiSelectMode" @update:model-value="$emit('update:multiSelectMode', $event)">
        Multi-action
      </cdx-toggle-switch>
    </div>
  `});var S1=Q({inheritAttrs:!1,props:{modelValue:{type:String,required:!1,default:""},label:{type:String,required:!1,default:""},touched:{type:Boolean,default:!1},shortened:{type:Boolean,default:!1},autoDismiss:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:touched"],data(){return{messages:{warning:this.shortened?"Invalid":"Expiry option is invalid",success:this.shortened?"Valid":"Valid expiry option"},showSuccess:!this.autoDismiss,internalTouched:this.touched,successTimeout:null}},computed:{valid(){return $1(this.modelValue)!==null},status(){if(this.disabled||!this.internalTouched)return"default";if(this.valid)return this.showSuccess?"success":"default";else return"warning"}},watch:{modelValue(){if(this.internalTouched=!0,!this.autoDismiss)return;if(this.successTimeout)clearTimeout(this.successTimeout);if(this.valid)this.showSuccess=!0,this.successTimeout=window.setTimeout(()=>{this.showSuccess=!1},3000)},internalTouched(h){this.$emit("update:touched",h)}},beforeUnmount(){if(this.successTimeout)clearTimeout(this.successTimeout)},template:`
    <cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="modelValue" :disabled="disabled" v-bind="$attrs" />
    </cdx-field>
  `});var T5=10,u1=Q({props:{modelValue:{type:String,required:!0},placeholder:{type:String,default:"Page"},label:{type:String,default:null},description:{type:String,default:null},namespace:{type:Number,required:!0},prefix:{type:String,default:""},validateMessage:{type:Boolean,default:!0}},emits:["update:modelValue"],data(){let h={visibleItemLimit:6,searchQuery:""};return{lookupStatus:"default",messages:{success:"Page exists",warning:"Page not found"},pageSuggestions:[],useLookup:A.useLookup,selection:null,menuConfig:h}},computed:{pagename:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}},fullPagename(){return`${this.prefix}${this.pagename}`}},methods:{async onUpdateInputValue(h){if(this.menuConfig.searchQuery=h,!h){this.pageSuggestions=[];return}await this.$nextTick(),p0(this.fullPagename,this.namespace,T5).then((z)=>{if(this.pagename!==h)return;if(z.length===0){this.pageSuggestions=[];return}this.pageSuggestions=z.filter((v)=>!v.title.includes("/Archive")).map((v)=>({label:this.stripTitle(v.title),value:v.pageid.toString()}))}).catch(()=>{this.pageSuggestions=[]})},onLoadMore(){if(!this.pagename)return;p0(this.fullPagename,this.namespace,this.pageSuggestions.length+T5).then((h)=>{if(h.length===0)return;this.pageSuggestions=h.filter((z)=>!z.title.includes("/Archive")).map((z)=>({label:this.stripTitle(z.title),value:z.pageid.toString()}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.pagename.length===0){this.lookupStatus="default";return}let h=this.pageSuggestions.find((z)=>z.label===this.pagename)??null;if(h!==null)this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null)this.lookupStatus="success"},stripTitle(h){if(this.prefix)return h.split(this.prefix)[1]??h;if(this.namespace===0)return h;return h.split(":")[1]??h}},template:`
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
  `});var J0=Q({props:{lockComment:{type:String,required:!0},skipCUVerifyUsers:{type:Set,required:!0},actionName:{type:String,required:!0},checkConflict:{type:Boolean,required:!0},state:{type:Object,required:!0},accounts:{type:Array,required:!0},caseActions:{type:Object,required:!0},allDisabled:{type:Boolean,required:!0}},emits:["update:lockComment","update:skipCUVerifyUsers","onSubmit"],data(){return{popover:{show:!1,revId:0,cancelAction:{label:"Cancel"},continueAction:{label:"Continue",actionType:"progressive"}},submitElement:null,cdxIconUpdate:q5}},computed:{effectiveStatus(){let h=this.caseActions.status.data;return this.caseActions.status.enabled&&h.new!=="nochange"?h.new:h.old},needsLockComment(){let h=this.caseActions.block;if(!h.enabled)return!1;return this.accounts.some((z)=>z.block.lock&&!E(z.username)&&h.data.userLocks.get(z.username)!==!0)},hasInvalidTag(){if(!this.caseActions.block.enabled)return!1;return this.accounts.some((z)=>z.block.tags.some((v)=>i(v)&&!v.master))},hasInvalidMove(){let h=this.caseActions.move;return h.enabled&&!h.data.target},hasInvalidDuration(){let h=this.caseActions.block;if(!h.enabled)return!1;let{options:z,userBlocks:v,userLocks:M}=h.data;return this.accounts.some((V)=>!f0(V,"duration",z,v,M,this.accounts)&&$1(V.block.duration)===null)},statusTemplateMismatch(){let h=this.caseActions.comment;if(!h.enabled)return null;let z=L2(h.data.text,this.effectiveStatus);if(!z)return null;return z.kind==="template"?`{{${z.match}}}`:`the word "${z.match}"`},blockClaimTemplateWithoutBlock(){if(!this.caseActions.comment.enabled)return null;let h=new Set(r(this.caseActions.comment.data.text).map((d)=>d.name)),v=["bnt","btc","bwt","sblock","ipblock"].find((d)=>h.has(d));if(!v)return null;return this.caseActions.block.enabled&&this.accounts.some((d)=>d.block.block)?null:`{{${v}}}`},cuBlockConfirmationsNeeded(){let h=this.caseActions.block.data,z=new Set;if(O()||!this.caseActions.block.enabled||!h.options.override||!h.options.noBlock)return z;for(let v of this.accounts){if(!v.block.block)continue;let M=h.userBlocks.get(v.username)?.reason;if(M&&k1.exec(M))z.add(v.username)}return z},cuBlockOverrideChecked:{get(){return this.skipCUVerifyUsers.size===this.cuBlockConfirmationsNeeded.size},set(h){this.$emit("update:skipCUVerifyUsers",h?this.cuBlockConfirmationsNeeded:new Set)}},cuBlockOverrideIndeterminate(){let h=this.skipCUVerifyUsers.size;return h>0&&h<this.cuBlockConfirmationsNeeded.size},disableButton(){return Q1(this.actionName)||this.allDisabled||this.hasInvalidTag||this.hasInvalidMove||this.hasInvalidDuration},lockCommentValue:{get(){return this.lockComment},set(h){this.$emit("update:lockComment",h)}}},mounted(){this.submitElement=this.$refs.submitElement},methods:{async onSubmit(){if(this.disableButton)return;if(this.checkConflict)if(this.popover.revId=await t1(Z.pageName),this.popover.revId===Z.startingRevId)this.$emit("onSubmit");else this.popover.show=!0;else this.$emit("onSubmit")},confirmSubmit(){this.popover.show=!1,Z.startingRevId=this.popover.revId,this.state.selectedSection?.type==="single"?c(this.state.selectedSection.section,{purge:!0}):n(this.state,{purge:!0}),this.$emit("onSubmit")}},template:`
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
        <cdx-message v-if="hasInvalidDuration" type="error" :inline="true">A user has an invalid block duration</cdx-message>
        <cdx-message v-if="statusTemplateMismatch" type="warning" :inline="true">
          The comment includes {{ statusTemplateMismatch }}, but the case status is set to {{ effectiveStatus }}.
        </cdx-message>
        <cdx-message v-if="blockClaimTemplateWithoutBlock" type="warning" :inline="true">
          The comment includes {{ blockClaimTemplateWithoutBlock }}, but no block is set to be applied.
        </cdx-message>
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
  `});var X0=Q({props:{open:{type:Boolean,required:!0},anchor:{type:Object,required:!0},clipboardTag:{type:Object,required:!0},defaultMaster:{type:String,required:!0}},emits:{"update:open":(h)=>!0,saveTag:(h)=>!0,addTag:()=>!0,copyTag:(h)=>!0,deleteTag:()=>!0},data(){let h=[{value:"blocked",label:"Suspected"},{value:"proven",label:"Proven"},{value:"confirmed",label:"Confirmed"}],z=[{value:"blocked",label:"Blocked"},{value:"confirmed",label:"Confirmed"},{value:"banned",label:"3X Banned"}],v=[{value:"suspected",label:"Suspected"},{value:"proven",label:"Proven"}],M={tag:"none",altmaster:"none"},V=[{value:"sock",label:"Sockpuppet",icon:H0},{value:"master",label:"Sockmaster",icon:d0}],d=null;return{sockTags:h,masterTags:z,altmasterTags:v,allTagSelections:M,tagCategoryButtons:V,temporaryTag:null,icons:{cdxIconAdd:J1,cdxIconCopy:v0,cdxIconPaste:Z5,cdxIconTrash:H1}}},computed:{openValue:{get(){return this.open},set(h){this.$emit("update:open",h)}},tagCategory:{get(){if(this.temporaryTag===null)return null;return i(this.temporaryTag)?"sock":"master"},set(h){if(h==="sock")this.temporaryTag=new w({status:"blocked",master:this.defaultMaster,evidence:this.temporaryTag?.evidence});else this.temporaryTag=new v1({status:"blocked",evidence:this.temporaryTag?.evidence})}}},methods:{setTag(h){this.temporaryTag=h?h.clone():null},handleSave(){if(this.temporaryTag===null){console.error("No tag to save");return}this.$emit("saveTag",this.temporaryTag),this.openValue=!1},handleCancel(){this.openValue=!1},handleDeleteTag(){this.$emit("deleteTag"),this.openValue=!1},handleCopyTag(){if(!this.temporaryTag)return;this.$emit("copyTag",this.temporaryTag)},handlePasteTag(){if(!this.clipboardTag)return;this.temporaryTag=this.clipboardTag.clone()},handleAddTag(){this.$emit("addTag"),this.openValue=!1}},template:`
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
  `});var D2=Q({props:{state:{type:Object,required:!0},activateButton:{type:Object,required:!0}},data(){return{activateHandler:null,open:!1,archiving:!1,messages:S}},mounted(){this.activateHandler=()=>{S.length=0,this.open=!0,this.archiving=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"oca"}),C5(this.state).then(()=>{this.archiving=!1},()=>{})},this.activateButton.addEventListener("click",this.activateHandler)},beforeUnmount(){if(this.activateHandler)this.activateButton.removeEventListener("click",this.activateHandler)},template:`
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
  `});var G3=/\[\[(?:Wikipedia|WP):(?:Sockpuppet investigations|SPI)\/([^\]]+)/i,l2=Q({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},defaultCase:{type:String,required:!1,default:""},view:{type:String,required:!0}},data(){return{open:!1,openHandler:null,beforeUnloadHandler:null,caseLoaded:!1,caseLoading:!1,targetCase:this.defaultCase,blockData:o1(),accounts:[],actionsRunning:!1,unpinned:!A.interface.pinned,messages:S,cdxIconFeedback:X1,cdxIconPushPin:M0}},computed:{mountPoint(){return this.$el.parentElement},pageName(){return`Wikipedia:Sockpuppet investigations/${this.targetCase}`},caseActions(){return{block:{enabled:!0,data:this.blockData},move:{enabled:!1}}}},watch:{unpinned(h){if(!this.mountPoint){console.error("AlternateView unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");A.interface.pinned=!h}},mounted(){if(!this.mountPoint){console.error("AlternateViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.beforeUnloadHandler=(h)=>{if(i1("alternateActions")!=="success")h.preventDefault()},this.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"alternate"}),!this.caseLoaded)switch(this.view){case"category":this.initialiseCategoryView();break;case"checkuser":this.initialiseCheckUserView();break;case"si":this.initialiseSIView();break}}if(this.beforeUnloadHandler)if(this.open)window.addEventListener("beforeunload",this.beforeUnloadHandler);else window.removeEventListener("beforeunload",this.beforeUnloadHandler)},this.openButton.addEventListener("click",this.openHandler)},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler);if(this.beforeUnloadHandler)window.removeEventListener("beforeunload",this.beforeUnloadHandler)},methods:{handleUserSelected(h,z){let v=this.accounts.find((M)=>M.id===z);if(!v)return;if(h.blockid!==void 0&&!this.blockData.userBlocks.has(v.username)){let M=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.blockData.userBlocks.set(v.username,{username:v.username,duration:h.blockexpiry??"",abao:M??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}Z0(h,v)},handleAddRow(h){h??=Z1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((z)=>!h.includes(z.id))},async handleFetchRows(){let h;try{h=await navigator.clipboard.readText()}catch(d){if(console.error("handleFetchRows failed to read clipboard:",d),d instanceof DOMException&&d.name==="NotAllowedError")new j({type:"warning",content:"Failed to read clipboard. You may need to press 'paste' in the confirmation popup"}).show();return}let[z,v]=N1({text:h,fullSearch:!1,state:this.state}),M=new Set(z),V=[...z,...v].map((d)=>R1({userRow:d,defaultBlock:M.has(d)}));this.massAddUserRows(V)},massAddUserRows(h){let z=new Set(this.accounts.map((v)=>v.username));h.forEach((v)=>{if(!z.has(v.username))this.handleAddRow(v)})},async loadCase(h){if(this.caseLoading=!0,h0(this.pageName,"alternate"),this.targetCase){let z=await K1({page:this.pageName,state:this.state});if(Z.valid=z!==null,z===null)this.state.archiveNotice=new g({username:this.targetCase});else this.state.archiveNotice=z;if(h){let v=await T2(this.targetCase);if(v!==null)this.blockData.userBlocks.set(this.targetCase,v);let M=await B(`User:${this.targetCase}`,!1),{userRow:V,isLocked:d}=await L0({userRow:A1(this.targetCase,this.state),block:v,userPage:M,defaultBlock:!0,checkLock:!1,state:this.state});if(d!==null)this.blockData.userLocks.set(this.targetCase,d);let H=this.accounts.findIndex((L)=>L.username===V.username);if(H===-1)this.accounts.splice(0,0,V);else this.accounts.splice(H,1,V)}}else Z.valid=!1;this.blockData.master=this.targetCase,this.caseLoading=!1,this.caseLoaded=!0},async onSubmitActions(){if(Q1("alternateActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"alternate"}),N("alternateActions"),this.actionsRunning=!0;let h=[],z=[],v=[],M=Promise.resolve([]);({blockPromises:h,tagPromises:z,talkNoticePromises:v,lockPromise:M}=await W2({accounts:this.accounts,blockData:this.blockData}));let V=Promise.all([Promise.all(h),Promise.all(z),M]),d=Promise.all(v),[H,L,f]=await V;if(await d,A.log.enabled){let F=`* [[:User:${Z.userName}]]`+g1({blockedUsers:H,taggedUsers:L,lockedUsers:f});await T1(F)}new j({type:"success",content:"Done!"}).show(),U("alternateActions","success"),this.actionsRunning=!1},async initialiseCategoryView(){if(this.defaultCase===""||this.caseLoading||this.caseLoaded)return;let[,h,z]=await Promise.all([this.loadCase(!1),u0(`Category:Suspected Wikipedia sockpuppets of ${this.targetCase}`),u0(`Category:Wikipedia sockpuppets of ${this.targetCase}`)]),v=(L,f)=>{let F={...A1(L.replace("User:",""),this.state)};return F.block.block=f,F},M=[...z,`User:${this.targetCase}`].map((L)=>v(L,!0)),V=h.map((L)=>v(L,!1)),d=new Set([...M,...V].map((L)=>L.username)),H=await _1({likelySocks:M,possibleSocks:V,allUsernames:d,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(H)},initialiseCheckUserView(){let h=$("form#checkuserform",document),z=$("#checkreason input",h).val();if(typeof z==="string"){let M=G3.exec(z)?.[1];if(M){this.targetCase=M;return}}let v=$("#checktarget input",h).val();if(typeof v==="string"){if(!mw.util.isIPAddress(v,!0))this.targetCase=v}},async initialiseSIView(){let h=[],z=new Set,M=$("ul.mw-checkuser-suggestedinvestigations-users",document).find("li > a.mw-userlink > bdi");for(let d of M){let H=o($(d).text());if(z.has(H))continue;h.push(A1(H,this.state)),z.add(H)}if(h.length>0&&h[0])this.targetCase=h[0].username;let V=await _1({likelySocks:h,possibleSocks:[],allUsernames:z,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(V)},launchFeedback(){let h=this.view.charAt(0).toUpperCase()+this.view.slice(1);this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`${h} form v${k}-${p}`})}},template:`
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
  `});var B2=Q({props:{unseenChanges:{type:Array,required:!0},openState:{type:Object,required:!0}},data(){return{beta:p!=="production"}},methods:{onClose(){this.openState.isOpen=!1,this.$emit("dismissed")},resolveDate(h){if(typeof h==="string")return h;return this.beta?h.beta:h.stable}},template:`
    <cdx-dialog
        v-model:open="openState.isOpen"
        title="What's new"
        @update:open="onClose"
    >
      <div v-for="[version, entry] in unseenChanges" :key="version">
        <h3 style="display: inline;">{{ version }}</h3> · {{ resolveDate(entry.date) }}
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
    </cdx-dialog>`});async function U3(){let h=n2(),z={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",pageids:82598459,formatversion:"2"};try{let M=(await h.get(z)).query.pages[0]?.revisions?.[0]?.slots.main.content;if(M)return JSON.parse(M)}catch(v){console.error("getChangelog fetch error:",v)}return{}}async function u5(h){let z=await U3();return Object.entries(z).filter(([v])=>S5(v,h)).sort(([v],[M])=>S5(v,M)?-1:1)}function S5(h,z){let v=h.split(".").map(Number),M=z.split(".").map(Number);for(let V=0;V<3;V++){if((v[V]??0)>(M[V]??0))return!0;if((v[V]??0)<(M[V]??0))return!1}return!1}var k5=Q({template:`
    <cdx-toast-container />
    `});if(mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/")&&!mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/SPI/"))_0("spi");else if(mw.config.get("wgCanonicalSpecialPageName")==="CheckUser")_0("checkuser");else if(mw.config.get("wgCanonicalSpecialPageName")==="SuggestedInvestigations"&&mw.config.get("wgPageName").includes("/detail/"))_0("si");else if(mw.config.get("wgNamespaceNumber")===14&&["Suspected Wikipedia sockpuppets","Wikipedia sockpuppets"].some((h)=>mw.config.get("wgCategories").includes(h)))_0("category");function _0(h){mw.loader.using(["vue","@wikimedia/codex","mediawiki.api","mediawiki.util","mediawiki.user","mediawiki.feedback"],(z)=>{let v=z("vue"),M=z("@wikimedia/codex");$5(v.toRaw);let V=new mw.Feedback(I2);if(p==="live")mw.loader.load("http://localhost:8080/spihelper.css","text/css");else if(p==="dev")importStylesheet("User:DatGuy/spihelper.dev.css");else importStylesheet("User:DatGuy/spihelper.css");let d,H=v.reactive(new w0);if(h==="spi"){let W=mw.config.get("wgPageName");h0(W),Y1(H)}else if(h==="category"){if(d=/Category:(?:Suspected )?Wikipedia sockpuppets of (.*)/.exec(mw.config.get("wgPageName").replaceAll("_"," ")),!d?.[1])return}let L=n0();if(L)Object.assign(A,L);else(async()=>{await i0(),d1()})();C3(v,M);let f=v.reactive({isOpen:!1});if(A.lastSeenVersion!==k)u5(A.lastSeenVersion).then((W)=>{let q=document.createElement("div");q.style.position="absolute",mw.util.$content.prepend(q);let y=v.createMwApp(B2,{unseenChanges:W,openState:f,onDismissed:async()=>{A.lastSeenVersion=k,await d1(),y.unmount(),q.remove()}}).component("cdx-button",M.CdxButton).component("cdx-dialog",M.CdxDialog).component("cdx-message",M.CdxMessage);y.mount(q)},()=>{});let F=mw.util.addPortletLink("p-cactions","#",p==="production"?"SPI":"SPI-Beta","ca-spiHelper","Run spiHelper");if(F){let W=document.createElement("div");switch(W.setAttribute("id","spiHelper-vue-mount-point"),mw.util.$content.prepend(W),F.addEventListener("click",()=>{f.isOpen=!0}),h){case"spi":{v.createMwApp(Q2,{state:H,feedbackDialog:V,openButton:F}).component("cdx-tabs",M.CdxTabs).component("cdx-tab",M.CdxTab).component("cdx-select",M.CdxSelect).component("cdx-card",M.CdxCard).component("cdx-toggle-switch",M.CdxToggleSwitch).component("cdx-text-area",M.CdxTextArea).component("cdx-toggle-button",M.CdxToggleButton).component("cdx-toggle-button-group",M.CdxToggleButtonGroup).component("cdx-button",M.CdxButton).component("cdx-button-group",M.CdxButtonGroup).component("cdx-icon",M.CdxIcon).component("cdx-table",M.CdxTable).component("cdx-text-input",M.CdxTextInput).component("cdx-checkbox",M.CdxCheckbox).component("cdx-lookup",M.CdxLookup).component("cdx-field",M.CdxField).component("cdx-message",M.CdxMessage).component("cdx-multiselect-lookup",M.CdxMultiselectLookup).component("cdx-progress-bar",M.CdxProgressBar).component("cdx-progress-indicator",M.CdxProgressIndicator).component("cdx-accordion",M.CdxAccordion).component("cdx-label",M.CdxLabel).component("cdx-popover",M.CdxPopover).component("action-accordion",f2).component("action-button",F2).component("action-container",A2).component("action-content",Z2).component("submit-form",J0).component("comment-action",Y2).component("change-status-action",J2).component("multi-section-comment-action",y0).component("multi-section-status-action",Y0).component("block-action",j0).component("link-action",Q0).component("management-action",X2).component("archive-action",y2).component("move-action",_2).component("section-action",K2).component("user-lookup",q0).component("page-lookup",u1).component("expiry-input",S1).component("tag-popover",X0).directive("tooltip",M.CdxTooltip).mount(W);break}case"checkuser":case"category":case"si":{v.createMwApp(l2,{state:H,feedbackDialog:V,openButton:F,view:h,...h==="category"?{defaultCase:d?.[1]??""}:{}}).component("cdx-button",M.CdxButton).component("cdx-checkbox",M.CdxCheckbox).component("cdx-field",M.CdxField).component("cdx-icon",M.CdxIcon).component("cdx-label",M.CdxLabel).component("cdx-lookup",M.CdxLookup).component("cdx-message",M.CdxMessage).component("cdx-popover",M.CdxPopover).component("cdx-progress-indicator",M.CdxProgressIndicator).component("cdx-select",M.CdxSelect).component("cdx-table",M.CdxTable).component("cdx-text-area",M.CdxTextArea).component("cdx-text-input",M.CdxTextInput).component("cdx-toggle-button-group",M.CdxToggleButtonGroup).component("submit-form",J0).component("block-action",j0).component("link-action",Q0).component("user-lookup",q0).component("page-lookup",u1).component("expiry-input",S1).component("tag-popover",X0).directive("tooltip",M.CdxTooltip).mount(W);break}}}if(I3(v,M,V),mw.config.get("wgCategories").includes("SPI cases awaiting archive")&&u())c3(v,M,H);window.addEventListener("beforeunload",(W)=>{if(a2())W.preventDefault()})})}function I3(h,z,v){let M=mw.util.addPortletLink("p-cactions","#",p==="production"?"SPI-Options":"SPI-Beta-Options","ca-spiHelperOpts","Modify spiHelper settings");if(M){let V=document.body.appendChild(document.createElement("div"));h.createMwApp(b5,{feedbackDialog:v,openButton:M,toaster:z.useToast()}).component("cdx-button",z.CdxButton).component("cdx-dialog",z.CdxDialog).component("cdx-field",z.CdxField).component("cdx-lookup",z.CdxLookup).component("cdx-select",z.CdxSelect).component("cdx-toggle-switch",z.CdxToggleSwitch).component("cdx-accordion",z.CdxAccordion).component("cdx-text-input",z.CdxTextInput).component("cdx-icon",z.CdxIcon).component("cdx-message",z.CdxMessage).component("cdx-multiselect-lookup",z.CdxMultiselectLookup).component("watch-setting",g0).component("expiry-setting",r0).component("expiry-input",S1).component("log-page-setting",o0).component("page-lookup",u1).mount(V)}}function c3(h,z,v){let M=mw.util.addPortletLink("p-cactions","#",p==="production"?"SPI-Archive":"SPI-Beta-Archive","ca-spiHelperArchive","Run one click archival");if(M){let V=document.body.appendChild(document.createElement("div"));h.createMwApp(D2,{state:v,activateButton:M}).component("cdx-dialog",z.CdxDialog).component("cdx-message",z.CdxMessage).component("cdx-progress-bar",z.CdxProgressBar).mount(V)}}function C3(h,z){let v=h.createMwApp(k5).component("cdx-toast-container",z.CdxToastContainer),M=document.body.appendChild(document.createElement("div"));v.mount(M)}})();

// </nowiki>
