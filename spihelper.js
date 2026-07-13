// {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=refs/heads/build/stable|path=spihelper.js}}
// v3.3.0
// <nowiki>
'use strict';
(()=>{var i={editorInteractionAnalyser:{baseUrl:(h)=>new URL("https://sigma.toolforge.org/editorinteract.py"),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},interactionTimeline:{baseUrl:(h)=>new URL("https://interaction-timeline.toolforge.org"),startingParams:new URLSearchParams("wiki=enwiki"),userQueryStringKey:"user",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},SPITools:{timecard:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timecard/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},consolidatedTimeline:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timeline/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},pages:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/pages/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0}},sandals:{timecard:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timecard"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},consolidatedTimeline:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timeline"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},pages:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/pages"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},summaries:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/summaries"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1}},checkUserWikiSearch:{baseUrl:(h)=>new URL("https://checkuser.wikimedia.org/w/index.php"),startingParams:new URLSearchParams("ns0=1"),userQueryStringKey:"search",userQueryStringSeparator:" OR ",userQueryStringWrapper:'"',multipleUserQueryStringKeys:!1},interleaved:{baseUrl:(h)=>new URL("https://interleaved.toolforge.org/"),userQueryStringKey:"user",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1}};var o=/{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i,H1=/^closed?$/i,b0=/{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu-?)?endorse|inprogress|(?:cu\s?)?decline(?:-ip)?|(?:cu)?moreinfo|relisted|onhold)}}/i,j2=/====\s*Suspected sockpuppets\s*====\n*/i,$1=/\n*\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i,m1=/{{(checkuserblock(-account|-wide)?|checkuser block)}}/i,j1=/{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i,W0=/{{spipriorcases}}/i,d1=/^(?:===[^=]*===|=====[^=]*=====)\s*$/m,Q2=/\u200E/g,$0=/(?<!~)~~~~(?!~)/;var j0=" (using [[:w:en:WP:SPIH-D|SPIH-D]])",Y2={title:new mw.Title("User talk:DatGuy/spihelper"),bugsLink:"//github.com/DatGuy1/spihelper/issues/new",showUseragentCheckbox:!0,useragentCheckboxMessage:"I want to share my user agent publicly alongside my feedback. This is optional."},P="3.3.0",C="production",Q1={watch:{case:"preferences",archive:"nochange",tagged:"preferences",categories:"nochange",blocked:!0},expiry:{case:"indefinite",archive:"indefinite",tagged:"indefinite",categories:"indefinite",blocked:"indefinite"},log:{enabled:!1,reversed:!1,page:"spihelper_log"},clerk:!0,tickArchiveWhenCaseClosed:!1,useCheckuserblockAccount:mw.config.get("wgUserGroups")?.includes("checkuser")??!1,useLookup:!0,defaultActions:["comment"],interface:{defaultBlockDuration:"indefinite",displayIPv6As64:!0,fullPreview:!1,pinned:!0,buttonLayout:!1},highlightSection:!0,custom:{commentTemplates:[]},debug:{enabled:!1,forceCheckuser:!1,forceAdmin:!1},lastSeenVersion:"3.3.0"};var J2=[{label:"Results",items:[{value:"{{confirmed}}",label:"Confirmed"},{value:"{{confirmed-nc}}",label:"Confirmed, no comment for IPs"},{value:"{{tallyho}}",label:"Indistinguishable"},{value:"{{highly likely}}",label:"Highly likely"},{value:"{{likely}}",label:"Likely"},{value:"{{possilikely}}",label:"Possilikely"},{value:"{{possible}}",label:"Possible"},{value:"{{unlikely}}",label:"Unlikely"},{value:"{{unrelated}}",label:"Unrelated"},{value:"{{inconclusive}}",label:"Inconclusive"},{value:"{{IPstale}}",label:"Stale"}]},{label:"Addendums",items:[{value:"{{behav}}",label:"Needs behavioral evaluation"},{value:"{{nosleepers}}",label:"No sleepers"},{value:"{{ncip}}",label:"No comment for IPs"}]},{label:"Novelties",items:[{value:"{{8ball}} ",label:"Magic 8-Ball"},{value:"{{crystalball",label:"Not a crystal ball"},{value:"{{fishing}}",label:"Not fishing"},{value:"{{pixiedust}}",label:"Not pixie dust"}]}],X2=[{label:"Ducks",items:[{value:"{{duck}}",label:"Duck"},{value:"{{megaphone duck}}",label:"Megaphone duck"},{value:"{{megaphone duck|ultimate}}",label:"Ultimate duck"}]},{label:"Results",items:[{value:"{{IPblock}}",label:"IP blocked"},{value:"{{bnt}}",label:"Blocked and tagged"},{value:"{{bwt}}",label:"Blocked without tags"},{value:"{{sblock}}",label:"Blocked, awaiting tags"},{value:"{{btc}}",label:"Blocked, tagged, closed"},{value:"{{Action and close}}",label:"Requested actions completed, closing"},{value:"{{Closing without action}}",label:"Closing without action"}]},{label:"Other",items:[{value:"{{subst:DiffsNeeded|moreinfo}}",label:"Diffs needed"},{value:"{{GlobalLocksRequested}}",label:"Locks requested"},{value:"{{Decline-IP}}",label:"IP check declined"}]}];class Z{type;content;isHtml;_index;constructor(h){this.type=h.type,this.content=h.content,this.isHtml=h.isHtml}show(){let h=R.length;return R.push(this),this._index=h,this}update(h){if(this._index===void 0)return Object.assign(this,h),this.show(),this;let z=R[this._index];if(z)Object.assign(z,h);return Object.assign(this,h),this}}var R=[];mw.loader.using(["vue"],(h)=>{R=h("vue").reactive(R)});class u{username;crosswiki;deny;notalk;moot;constructor(h){this.username=h?.username??l.caseName,this.crosswiki=h?.crosswiki??!1,this.deny=h?.deny??!1,this.notalk=h?.notalk??!1,this.moot=h?.moot??!1}generateWikitext(){let h="{{SPI archive notice|1="+this.username;if(this.crosswiki)h+="|crosswiki=yes";if(this.deny)h+="|deny=yes";if(this.notalk)h+="|notalk=yes";if(this.moot)h+="|moot=yes";return h+="}}",h}}class S{master;status;locked;evidence;altmaster;altmasterStatus;constructor(h){this.master=h.master,this.status=h.status,this.locked=h.locked??!1,this.evidence=h.evidence??"",this.altmaster=h.altmaster??"",this.altmasterStatus=h.altmasterStatus}generateWikitext(h){let z="{{sockpuppet";if(z+=`
| 1 = ${this.master}`,z+=`
| 2 = ${this.status}`,this.locked)z+=`
| locked = yes`;if(h===!1)z+=`
| notblocked = yes`;if(this.evidence)z+=`
| evidence = ${this.evidence}`;if(this.altmaster)z+=`
| altmaster = ${this.altmaster}`,z+=`
| altmaster-status = ${this.altmasterStatus??"suspected"}`;return z+=`
}}`,z}clone(){return new S({master:this.master,status:this.status,evidence:this.evidence,altmaster:this.altmaster,altmasterStatus:this.altmasterStatus})}equals(h){if(!(h instanceof S))return!1;return this.master===h.master&&this.status===h.status&&this.locked===h.locked&&this.evidence===h.evidence&&this.altmaster===h.altmaster&&this.altmasterStatus===h.altmasterStatus}}class s{status;checked;locked;ltapage;spipage;evidence;constructor(h){this.status=h.status,this.checked=h.checked??!1,this.locked=h.locked??!1,this.ltapage=h.ltapage??"",this.spipage=h.spipage??"",this.evidence=h.evidence??""}generateWikitext(){let h="{{sockpuppeteer",z=this.status==="banned"?"banned":"blocked",v=this.checked||this.status!=="blocked";if(h+=`
| 1 = ${z}`,v)h+=`
| checked = yes`;if(this.locked)h+=`
| locked = yes`;if(this.ltapage)h+=`
| ltapage = ${this.ltapage}`;if(this.spipage)h+=`
| spipage = ${this.spipage}`;if(this.evidence)h+=`
| evidence = ${this.evidence}`;return h+=`
}}`,h}clone(){return new s({status:this.status,checked:this.checked,ltapage:this.ltapage,spipage:this.spipage,evidence:this.evidence})}equals(h){if(!(h instanceof s))return!1;return this.status===h.status&&this.checked===h.checked&&this.locked===h.locked&&this.ltapage===h.ltapage&&this.spipage===h.spipage&&this.evidence===h.evidence}}var _2=["sections","management","block","status","link","comment","move","archive"];var K2=[{label:"Follow preferences",value:"preferences"},{label:"No change",value:"nochange"},{label:"Watch",value:"watch"},{label:"Unwatch",value:"unwatch"}],D2=["preferences","watch","nochange","unwatch"],I2={analyser:!1,timeline:!1,timecard:!1,pages:!1,summary:!1,cuwiki:!1,interleaved:!1};function T(h){let z=[],v=h.trim().matchAll(/\{\{([\s\S]+?)}}/g);for(let d of v){if(!d[1])continue;z.push(Q0(d[1]))}return z}function E5(h){let z=[],v=0,d="";for(let M=0;M<h.length;M++){let V=h.charAt(M),H=h.charAt(M+1);if(V==="["&&H==="["||V==="{"&&H==="{")v++,d+=V+H,M++;else if(V==="]"&&H==="]"||V==="}"&&H==="}")v--,d+=V+H,M++;else if(V==="|"&&v===0)z.push(d),d="";else d+=V}return z.push(d),z}function Q0(h){let z=E5(h).map((V)=>V.trim()),v=z.shift()?.toLowerCase()??"unknown",d={},M=[];for(let V of z){let H=V.indexOf("=");if(H!==-1){let c=V.slice(0,H).trim().toLowerCase(),L=V.slice(H+1).trim();if(L===""){d[c]=L;continue}let f=Number(L);if(!Number.isNaN(f)){d[c]=f;continue}let A=O5(L);if(A===null){d[c]=L;continue}d[c]=A}else if(V)M.push(V)}return{name:v,params:d,positional:M}}function O5(h){if(["y","yes","true","on"].includes(h.toLowerCase()))return!0;if(["n","no","false","off"].includes(h.toLowerCase()))return!1;return null}function B2(h){let z=[];for(let v of h.positional)z.push(v);for(let[v,d]of Object.entries(h.params))if(!Number.isNaN(Number(v)))z.push(d.toString());return z}function Y1(h){if(h.startsWith("m:")||h.startsWith("meta:"))return h.slice(h.indexOf(":")+1);else return h}function J1(){return mw.config.get("wgPageParseReport").limitreport.postexpandincludesize.limit}function X1(){let h=mw.config.get("wgServer").replace(/^(https?)?:?\/\//,"").split("."),z=h[0],v=h[1];if(z===void 0||v===void 0)return"";let d;switch(v){case"wikimedia":switch(z){case"commons":case"meta":case"species":case"incubator":case"outreach":d=z;break;default:break}break;case"mediawiki":d="mw";break;case"wikidata":switch(z){case"test":d="testwikidata";break;case"www":d="d";break;default:break}break;case"wikipedia":switch(z){case"test":d="testwiki";break;case"test2":d="test2wiki";break;default:d="w:"+z;break}break;case"wiktionary":d="wikt:"+z;break;case"wikiquote":d="q:"+z;break;case"wikibooks":d="b:"+z;break;case"wikinews":d="n:"+z;break;case"wikisource":d="s:"+z;break;case"wikiversity":d="v:"+z;break;case"wikivoyage":d="voy:"+z;break;default:return""}return`:${d}:`}function k(h){if(h=h.replace(Q2,""),h=h.trim(),mw.util.isIPAddress(h,!0))h=h.toUpperCase();else if(h)try{h=new mw.Title(h).getMainText()}catch(z){console.error(`Failed to parse username: ${h}.`,z)}return h}function c1(h){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(h)}function Y0(h){return mw.util.isInfinity(h)}var C5=["second","seconds","minute","minutes","hour","hours","day","days","week","weeks","month","months","year","years"],x5=new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${C5.join("|")})$`,"i");function p5(h){return x5.test(h)}function L1(h){if(Y0(h))return h;if(c1(h))return h;if(p5(h))return h;return null}function a(h){return mw.util.isIPAddress(h,!0)||mw.util.isTemporaryUser(h)}function N1(h){return $0.test(h)?h:h.trimEnd()+" ~~~~"}function N(h,z){return z??=h,$("<a>").attr("href",mw.util.getUrl(h)).attr("title",h).text(z).prop("outerHTML")}function J0(h,z,v){return v??=h,$("<a>").attr("href",h).attr("title",v).text(z).prop("outerHTML")}function R1(h){let{blockedUsers:z,taggedUsers:v,lockedUsers:d}=h,M="",V=z.filter(Boolean);if(V.length>0)M+=`
** blocked `+V.join(", ");let H=v.filter(Boolean);if(H.length>0)M+=`
** tagged `+H.join(", ");if(d.length>0)M+=`
** requested locks for `+d.map((c)=>`{{noping|1=${c}}}`).join(", ");return M}function G2(h){let z=h.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(`^(={3}|={5})\\s*(<big>)?${z}(</big>)?\\s*(={3}|={5})\\s*$`,"m")}function m5(h,z=0,v){let d=h.length;if(v){let M=G2(v),V=h.slice(z+1).match(M);if(V?.index!==void 0)d=z+V.index}return h.slice(z,d).trim()}function t(h,z){return z.sort((d,M)=>d.header.getTime()-M.header.getTime()),h.slice(0,U2(h))+`
`+z.map((d)=>d.fullText).join(`

`)}function U2(h){return d1.exec(h)?.index??h.length}function f1(h,z){let v=[];if(z.length===0)return v;let d=U2(h),M=h.slice(d);for(let V=0;V<z.length;V++){let H=z[V];if(!H)continue;let c=H.name,L=G2(c),f=M.match(L);if(!f)continue;let A=f.index;if(A===void 0)continue;let q=m5(M,A,z[V+1]?.name);if(q){let b=P1(c);if(b===null)return new Z({type:"error",content:`Failed to parse date from section header "${c}" in archive`}).show(),null;v.push({header:b,fullText:q})}M=M.slice(A+q.length)}return v}function P1(h){let z=new Date(h);if(!isNaN(z.getTime()))return z;return null}function a2(){return{block:!1,duration:"",acb:!0,abao:!0,ntp:!1,nem:!1,tags:[],lock:!1}}function S1(h=""){return{options:{noBlock:!1,override:!1,tagUnattached:!0,cuBlock:!1,cuBlockOnly:!1,addMasterNotice:!0,addSockNotice:!0,blankTalk:!1,lockHideNames:!1},userLocks:new Map,userBlocks:new Map,userTags:new Map,master:h,lockcomment:"",skipCUVerifyUsers:new Set}}function u1(h){let z=[],v=T(h);for(let d of v)if(["sockpuppeteer","sockmaster"].includes(d.name)){let M=(d.params["1"]??d.positional[0])?.toString(),V=M==="cu"||(M?.includes("confirmed")??!1),H=d.params.checked===!0||V,c;if(V)c="confirmed";else if(M==="banned")c="banned";else if(M?.includes("blocked"))c=H?"confirmed":"blocked";else{console.warn("Unrecognised master status",M);continue}let L=new s({status:c,checked:H});if(d.params.locked===!0)L.locked=!0;if(d.params.ltapage)L.ltapage=d.params.ltapage;if(d.params.spipage)L.spipage=d.params.spipage;if(d.params.evidence)L.evidence=d.params.evidence;z.push(L)}else if(["sockpuppet","sock"].includes(d.name)){let M=d.params["1"]??d.positional[0];if(!M){console.warn("Master parameter not found");continue}let V=d.params["2"]??d.positional[1],H;switch(V){case"blocked":H="blocked";break;case"proven":H="proven";break;case"confirmed":case"nbconfirmed":case"cuconfirmed":H="confirmed";break;default:console.warn("Unrecognised sock status",V);continue}let c=new S({master:M,status:H}),L=d.params.altmaster;if(L){let f=d.params["altmaster-status"],A;switch(f){case"suspect":case"suspected":A="suspected";break;case"proven":A="proven";break;default:console.warn("Unrecognised altmaster status",f);break}if(A)c.altmaster=L,c.altmasterStatus=A}if(d.params.evidence)c.evidence=d.params.evidence;if(d.params.locked)c.locked=!0;z.push(c)}return z}function r(h){return h instanceof S}function F1(h){return h instanceof s}var _1=new Map;function x(h){_1.set(h,"running")}function D(h,z){_1.set(h,z)}function E2(){for(let h of _1.values())if(h==="running")return!0;return!1}function l1(h){return _1.get(h)==="running"}function T1(h){return _1.get(h)}async function O2(h){let z=J(),v={action:"query",list:"blocks",bklimit:1,bkusers:h,bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let d=await z.get(v),[M]=d.query.blocks;if(!M)return null;return{username:h,duration:M.expiry,acb:M.nocreate,abao:M.autoblock||M.anononly,ntp:!M.allowusertalk,nem:M.noemail,reason:M.reason}}catch{return null}}async function K1(h){if(h.length===0)return new Map;let z=J(),v=new Map,d=await P2();return await Promise.all(R2(h,d).map(async(M)=>{let V={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:M,formatversion:"2"};try{let H=await z.post(V);for(let c of H.query.pages){if(c.missing)continue;let L=c.revisions?.[0];if(!L)continue;let f=c.title.split(":",2)[1];if(!f){console.error("spiHelperGetBulkPageText: could not find name for",c.title);continue}v.set(f,L.slots.main.content)}}catch(H){console.error("spiHelperGetBulkPageText fetch error:",H)}})),v}async function k1(h){if(h.size===0)return new Map;let z=J(),v=new Map,d=await P2();return await Promise.all(R2([...h],d).map(async(M)=>{let V={action:"query",list:"blocks",bklimit:"max",bkusers:M,bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let H=await z.post(V);for(let c of H.query.blocks)v.set(c.user,{username:c.user,duration:c.expiry,acb:c.nocreate,abao:c.autoblock||c.anononly,ntp:!c.allowusertalk,nem:c.noemail,reason:c.reason})}catch(H){console.error("spiHelperGetBulkUserBlockSettings fetch error:",H)}})),v}async function A1(h){let z=J(),v={action:"query",list:"globalallusers",agulimit:1,agufrom:h,aguto:h,aguprop:["lockinfo","existslocally"]};try{let d=await z.get(v),[M]=d.query.globalallusers;if(!M)return null;return{name:M.name,existsLocally:"existslocally"in M,locked:"locked"in M}}catch{return null}}async function D0(h,z){let v=J(),d={action:"query",list:"allusers",aulimit:z,auprefix:h,auprop:["blockinfo"],formatversion:"2"};try{return(await v.get(d)).query.allusers}catch{return[]}}async function I0(h,z,v){let d=J(),M={action:"query",list:"allpages",aplimit:v,apprefix:h,apnamespace:z,formatversion:"2"};try{return(await d.get(M)).query.allpages}catch{return[]}}async function B0(h,z){let v="delete_"+h;x(v);let d=N(h),M=new Z({type:"notice",content:`Deleting ${d}`,isHtml:!0}).show(),V=J(h),H={action:"delete",title:h,reason:z};try{await V.postWithToken("csrf",H),M.update({type:"success",content:`Deleted ${d}`}),D(v,"success")}catch(c){M.update({type:"error",content:`Failed to delete ${d}: ${mw.html.escape(JSON.stringify(c))}`}),D(v,"failed")}}async function C2(h,z){let v="undelete_"+h;x(v);let d=N(h),M=new Z({type:"notice",content:`Undeleting ${d}`,isHtml:!0}).show(),V=J(h),H={action:"undelete",title:h,reason:z};try{await V.postWithToken("csrf",H),M.update({type:"success",content:`Undeleted ${d}`}),D(v,"success")}catch(c){M.update({type:"error",content:`Failed to undelete ${d}: ${mw.html.escape(JSON.stringify(c))}`}),D(v,"failed")}}async function G0(h,z){let v={action:"parse",prop:"text",pst:!0,text:z,title:h};try{return(await J(h).post(v)).parse?.text["*"]??""}catch(d){return console.error("Error rendering text:",d),""}}async function e(h){let{pageName:z,content:v}=h,d={action:"parse",prop:"tocdata",formatversion:"2"};if(z!==void 0)d.page=z;else if(v!==void 0)d.text=v,d.contentmodel="wikitext";else return console.error("spiHelperGetInvestigationSections: No page name or content provided"),[];let M=J();try{let V=await M.post(d);if(!V.parse)return console.error("spiHelperGetInvestigationSections: Could not parse sections"),[];let H=[];for(let c of V.parse.tocdata.sections)if(c.tocLevel===2||c.hLevel===3)H.push(new p0(parseInt(c.index),c.line));return H}catch(V){return console.warn("spiHelperGetInvestigationSections API error:",V),[]}}async function x2(h){let z=J(),v={action:"query",format:"json",list:"backlinks",bltitle:h,blnamespace:4,bldir:"ascending",blfilterredir:"nonredirects"};try{return(await z.get(v)).query.backlinks.filter((M)=>{return M.title.startsWith("Wikipedia:Sockpuppet investigations/")&&!M.title.startsWith("Wikipedia:Sockpuppet investigations/SPI/")&&!/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(M.title)})}catch{return[]}}async function U0(h){let z=J(),v={action:"query",format:"json",prop:"info",titles:h,inprop:"protection",formatversion:"2"};try{let d=await z.get(v),[M]=d.query.pages;return M?.protection??[]}catch{return[]}}async function a0(h){let z=J(),v={action:"query",format:"json",prop:"flagged",titles:h,formatversion:"2"};try{let d=await z.get(v),[M]=d.query.pages;return M?.flagged??null}catch{return null}}async function E0(h,z){let v="protect_"+h;x(v);let d=N(h),M=new Z({type:"notice",content:`Protecting ${d}`,isHtml:!0}),V=J();try{let H="",c="";z.forEach((f)=>{if(H!=="")H=H+"|",c=c+"|";H=H+f.type+"="+f.level,c=c+f.expiry});let L={action:"protect",format:"json",title:h,protections:H,expiry:c,reason:"Restoring protection after history merge"};await V.postWithToken("csrf",L),M.update({type:"success",content:`Protected ${d}`}),D(v,"success")}catch(H){M.update({type:"error",content:`Failed to protect ${d}: ${mw.html.escape(JSON.stringify(H))}`}),D(v,"failed")}}async function O0(h,z){if(z.level==="")return;let v="stabilize_"+h;x(v);let d=J(),M={action:"stabilize",format:"json",titles:h,protectlevel:z.level,expiry:z.expiry,reason:"Restoring pending changes protection after history merge"};try{await d.postWithToken("csrf",M),D(v,"success")}catch{D(v,"failed")}}async function p2(){let h=J(),z={action:"query",format:"json",meta:"siteinfo",siprop:"restrictions"};try{return(await h.get(z)).query.restrictions}catch{return{types:[],levels:[],cascadinglevels:[],semiprotectedlevels:[]}}}async function m2(h){let{user:z,duration:v,reason:d,reblock:M,anononly:V,accountcreation:H,autoblock:c,notalkpage:L,noemail:f,watchBlockedUser:A,watchExpiry:q="indefinite"}=h,b="block_"+z;x(b);let Y="User:"+z,y=N(Y),Q=new Z({type:"notice",content:`Blocking ${y}`,isHtml:!0}).show(),X=J(),G={action:"block",expiry:v,reason:d,reblock:M,anononly:V,nocreate:H,autoblock:c,allowusertalk:!L,noemail:f,watchuser:A,watchlistexpiry:q,user:z,formatversion:"2"};try{let B=await X.postWithToken("csrf",G),_=J0(mw.util.getUrl("Special:BlockList",{wpTarget:`#${B.block.id}`}),"Blocked","Special:BlockList");return Q.update({type:"success",content:`${_} user ${y}`}),D(b,"success"),!0}catch(B){return Q.update({type:"error",content:`Failed to block ${y}: ${mw.html.escape(JSON.stringify(B))}`}),D(b,"failed"),!1}}async function D1(h){let{sourcePage:z,destPage:v,summary:d,ignoreWarnings:M,suppressRedirect:V=!1,moveSubpages:H=!0}=h,c="move_"+z+"_"+v;x(c);let L=J(),f=N(z),A=N(v),q=new Z({type:"notice",content:`Moving ${f} to ${A}`,isHtml:!0}).show(),b={action:"move",from:z,to:v,reason:d+j0,noredirect:V,movesubpages:H,ignoreWarnings:M};try{await L.postWithToken("csrf",b),q.update({type:"success",content:`Moved ${f} to ${A}`}),D(c,"success")}catch(Y){q.update({type:"error",content:`Failed to move ${f} to ${A}: ${mw.html.escape(JSON.stringify(Y))}`}),D(c,"failed")}}async function I(h){let{title:z,newText:v,summary:d,createonly:M=!1,watch:V,watchExpiry:H,baseRevId:c,sectionId:L}=h,f=`edit_${z}`;if(L)f+=`_${L}`;x(f);let A=N(z),q=new Z({type:"notice",content:"Editing "+A,isHtml:!0}).show(),b=J(z),Y=Y1(z),y={action:"edit",watchlist:V,summary:d+j0,text:v,title:Y,createonly:M,formatversion:"2"};if(L)y.section=L.toString();if(H)y.watchlistexpiry=H;if(c)y.baserevid=c;try{let Q=await b.postWithToken("csrf",y),X=Q.edit.newrevid;if(!X)return q.update({type:"error",content:`Edit failed on ${A}: ${mw.html.escape(JSON.stringify(Q))}`}),console.error(Q),D(f,"failed"),null;let G=J0(mw.util.getUrl("",{diff:X}),"Saved",`View diff ${X}`);return q.update({type:"success",content:`${G} page ${A}`,isHtml:!0}),D(f,"success"),Q.edit.newrevid??null}catch(Q){return q.update({type:"error",content:`Edit failed on ${A}: ${mw.html.escape(JSON.stringify(Q))}`,isHtml:!0}),console.error(Q),D(f,"failed"),null}}async function K(h,z,v){let d=N(h),M=new Z({type:"notice",content:"Getting page "+d,isHtml:!0});if(z)M.show();let H={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:Y1(h),formatversion:"2"};if(v)H.rvsection=v.toString();try{let L=(await J(h).get(H)).query.pages[0];if(!L||"missing"in L){if(z)M.update({type:"warning",content:`Page ${d} does not exist`,isHtml:!0});return""}let f=L.revisions?.[0];if(!f)return"";if(z)M.update({type:"success",content:`Got ${d}`,isHtml:!0});return f.slots.main.content}catch(c){if(z)M.update({type:"error",content:`Failed to get ${d}: ${mw.html.escape(JSON.stringify(c))}`,isHtml:!0});return""}}async function w1(h){let v={action:"query",prop:"revisions",rvslots:"main",rvprop:"ids",titles:Y1(h),formatversion:"2"};try{let M=(await J(h).get(v)).query.pages[0];if(!M||"missing"in M)return 0;let V=M.revisions?.[0];if(!V)return 0;return V.revid}catch{return 0}}async function C0(h,z){let d={action:"parse",prop:"limitreportdata",page:Y1(h)};if(z)d.section=z.toString();let M=J(h);try{let V=await M.get(d);return Number(V.parse?.limitreportdata.find((H)=>H.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function g1(h){let z=J(),v={action:"parse",prop:"limitreportdata",text:h,contentmodel:"wikitext"};try{let d=await z.post(v);return Number(d.parse?.limitreportdata.find((M)=>M.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function N2(h){let z=J(),v={action:"parse",prop:"text",text:h,wrapoutputclass:"",disablelimitreport:!0,disableeditsection:!0,contentmodel:"wikitext"};try{return(await z.post(v)).parse?.text["*"]??""}catch{return""}}async function x0(h){let z=J(),v={action:"query",list:"categorymembers",cmtitle:h,cmlimit:"max",cmnamespace:2,formatversion:"2"};try{return(await z.get(v)).query.categorymembers.map((M)=>M.title)}catch{return[]}}function R2(h,z){let v=[];for(let d=0;d<h.length;d+=z)v.push(h.slice(d,d+z));return v}async function P2(){return(await mw.user.getRights()).includes("apihighlimits")?500:50}var X0=`MediaWiki-JS/${mw.config.get("wgVersion")} spihelper/${P}`,_0={meta:new mw.ForeignApi("https://meta.wikimedia.org/w/api.php",{userAgent:X0}),local:new mw.Api({userAgent:X0})};function J(h){if(h&&(h.startsWith("m:")||h.startsWith("meta:")))return _0.meta;else return _0.local}function S2(){if(mw.config.get("wgWikiID")==="enwiki")return _0.local;return new mw.ForeignApi("https://en.wikipedia.org/w/api.php",{userAgent:X0})}class I1{pageName;prefixedName;caseName;userName;archiveName;casePageName;isArchive;valid;startingRevId;source;constructor(h,z=!1,v="spi"){if(this.pageName=h,this.prefixedName=X1()+h,this.source=v,this.isArchive=/Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(h),this.caseName=N5(h,this.isArchive),this.userName=k(this.caseName),this.casePageName="Wikipedia:Sockpuppet investigations/"+this.caseName,this.archiveName=h+"/Archive",this.valid=!!this.caseName.trim(),z)this.startingRevId=mw.config.get("wgCurRevisionId");else this.startingRevId=0}async refreshRevId(){this.startingRevId=await w1(this.pageName)}async edit(h){return I({title:this.pageName,newText:h.newText,summary:h.summary,createonly:h.createonly??!1,watch:h.watch,watchExpiry:h.watchExpiry,baseRevId:h.baseRevId,sectionId:h.sectionId})}}function N5(h,z){let v=h.replace(/^Wikipedia:Sockpuppet investigations\//,"");return z?v.replace(/\/Archive.*/,""):v}function R5(h){return h.replaceAll(/_/g," ")}var l;function n1(h,z="spi"){l=new I1(R5(h),h===mw.config.get("wgPageName"),z)}function B1(h){return l.valid?h+` per [[${l.prefixedName}]]`:h}class m0{sections;selectedSection;archiveNotice;_text=null;_loadingPromise=null;constructor(h=[],z=null,v=null){if(this.sections=h,z)this.selectedSection={type:"specific",section:z};else this.selectedSection=null;this.archiveNotice=v}}class p0{id;name;_text=null;_loadingPromise=null;constructor(h,z){this.id=h,this.name=z}}async function w(h,z={}){let{purge:v=!1,show:d=!1}=z;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!v)return h._text;return h._loadingPromise=K(l.pageName,d),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}async function q1(h){h.sections=await e({pageName:l.pageName})}async function E(h,z={}){let{purge:v=!1,show:d=!1}=z;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!v)return h._text;return h._loadingPromise=K(l.pageName,d,h.id),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}var W=(h)=>h;var N0=W({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,watchOptions:K2,messages:{error:"Watch option is invalid"}}},computed:{status(){return D2.includes(this.internalValue)?"default":"error"}},watch:{resetTrigger(){this.internalValue=this.modelValue},internalValue(h){this.$emit("update:modelValue",h)}},template:`
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ this.label }}</template>
      <cdx-select
          :menu-items="watchOptions"
          v-model:selected="internalValue"
      />
    </cdx-field>
  `});var R0=W({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,touched:!1,isResetting:!1}},watch:{resetTrigger(){this.isResetting=!0,this.internalValue=this.modelValue,this.touched=!1,this.$nextTick(()=>{this.isResetting=!1})},internalValue(h){if(!this.isResetting)this.touched=!0;if(h===""||L1(h)!==null)this.$emit("update:modelValue",h)}},template:`
    <expiry-input :label="label" :touched="touched" v-model="internalValue" />
  `});var P0=W({props:{modelValue:{type:String,required:!0},prefix:{type:String,required:!0}},data(){return{inputValue:this.modelValue,messages:{error:"Page name is invalid"},resetValue:"spihelper_log"}},computed:{valid(){return this.inputValue.length>0&&mw.Title.newFromText(this.prefix+this.inputValue)!==null},status(){return this.valid?"default":"error"}},watch:{inputValue(h){if(this.valid)this.$emit("update:modelValue",h)}},methods:{resetInput(){this.inputValue=this.resetValue}},template:`
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
  `});async function u2(h){return!(await N2("{{#time:r|"+h+"}}")).includes("Error: Invalid time.")}function o1(h){return`User:${mw.config.get("wgUserName")}/${h}`}var P5=[{oldPath:"watchCase",newPath:["watch","case"],type:"WatchOption"},{oldPath:"watchArchive",newPath:["watch","archive"],type:"WatchOption"},{oldPath:"watchTaggedUser",newPath:["watch","tagged"],type:"WatchOption"},{oldPath:"watchNewCats",newPath:["watch","categories"],type:"WatchOption"},{oldPath:"watchBlockedUser",newPath:["watch","blocked"],type:"boolean"},{oldPath:"watchCaseExpiry",newPath:["expiry","case"],type:"expiry"},{oldPath:"watchArchiveExpiry",newPath:["expiry","archive"],type:"expiry"},{oldPath:"watchTaggedUserExpiry",newPath:["expiry","tagged"],type:"expiry"},{oldPath:"watchNewCatsExpiry",newPath:["expiry","categories"],type:"expiry"},{oldPath:"watchBlockedUserExpiry",newPath:["expiry","blocked"],type:"expiry"},{oldPath:"clerk",newPath:["clerk"],type:"boolean"},{oldPath:"log",newPath:["log","enabled"],type:"boolean"},{oldPath:"reversed_log",newPath:["log","reversed"],type:"boolean"},{oldPath:"tickArchiveWhenCaseClosed",newPath:["tickArchiveWhenCaseClosed"],type:"boolean"},{oldPath:"useCheckuserblockAccount",newPath:["useCheckuserblockAccount"],type:"boolean"},{oldPath:"displayIPv6As64",newPath:["interface","displayIPv6As64"],type:"boolean"},{oldPath:"debugForceCheckuserState",newPath:["debug","forceCheckuser"],type:"boolean"},{oldPath:"debugForceAdminState",newPath:["debug","forceAdmin"],type:"boolean"}];function S5(h,z,v){let d=h;for(let V=0;V<z.length-1;V++){if(!z[V])throw Error(`Path segment "${z.join(".")}" is invalid`);let H=z[V],c=d[H];if(c===null||typeof c!=="object")throw Error(`Path segment "${z[V]}" is not an object`);d=c}let M=z[z.length-1];d[M]=v}async function T2(h){let z=P5.map(async({oldPath:v,newPath:d,type:M})=>{let V=h[v];if(V===void 0)return;if(await u5(V,M))S5(F,d,V)});await Promise.all(z)}async function u5(h,z){switch(z){case"boolean":return typeof h==="boolean";case"WatchOption":return typeof h==="string"&&["preferences","watch","nochange","unwatch"].includes(h);case"expiry":return typeof h==="string"&&u2(h)}}var F=structuredClone(Q1);function k2(h){F=structuredClone(h)}var w2="userjs-spihelper";function h1(){return J().saveOption(w2,JSON.stringify(F))}function S0(){let h=String(mw.user.options.get(w2));try{return h?JSON.parse(h):null}catch(z){return console.warn("Failed to parse saved options",z),null}}async function u0(){mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"migrate"});try{if(await mw.loader.getScript("/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript"),spiHelperCustomOpts!==void 0)await T2(spiHelperCustomOpts)}catch(h){mw.notify("Error retrieving your spihelper-options.js",{type:"error"}),console.error("Error getting local spihelper-options.js: ",h)}}function O(h=!0){if(h&&F.debug.enabled)return F.debug.forceCheckuser;return mw.config.get("wgUserGroups")?.includes("checkuser")??!1}function p(){return F.clerk||O()}function m(){if(F.debug.enabled)return F.debug.forceAdmin;return mw.config.get("wgUserGroups")?.includes("sysop")??!1}function G1(){return m()||(mw.config.get("wgUserGroups")?.includes("extendedmover")??!1)}var Z1='<path d="M11 9V4H9v5H4v2h5v5h2v-5h5V9z"/>';var g2='<path d="m2 10 1.42-1.41L9 14.17V2h2v12.17l5.59-5.58L18 10l-8 8z"/>';var n2='<path d="M10 0a10 10 0 1010 10A10 10 0 0010 0m2.5 14.5L9 11V4h2v6l3 3z"/>',o2='<path d="m4.34 2.93 12.73 12.73-1.41 1.41L2.93 4.35z"/><path d="M17.07 4.34 4.34 17.07l-1.41-1.41L15.66 2.93z"/>',r2='<path id="cdx-icon-code-a" d="M1 10.08V8.92h1.15c1.15 0 1.15 0 1.15-1.15V5a7.4 7.4 0 01.09-1.3 2 2 0 01.3-.7 1.84 1.84 0 01.93-.68A6.4 6.4 0 016.74 2h1.18v1.15h-.86A1.32 1.32 0 006 3.62a1.7 1.7 0 00-.36 1.23V7a3.2 3.2 0 01-.28 1.72 2 2 0 01-1.26.77 2.15 2.15 0 011.26.79A3.26 3.26 0 015.62 12v3.15A1.67 1.67 0 006 16.37a1.31 1.31 0 001.08.47h.87V18H6.74a6.3 6.3 0 01-2.12-.29 1.82 1.82 0 01-.93-.71 1.9 1.9 0 01-.3-.72A7.5 7.5 0 013.31 15v-3.77c0-1.15 0-1.15-1.15-1.15zm18 0V8.92h-1.15c-1.15 0-1.15 0-1.15-1.15V5a7.4 7.4 0 00-.08-1.32 2 2 0 00-.3-.73 1.84 1.84 0 00-.93-.68A6.4 6.4 0 0013.26 2h-1.18v1.15h.87a1.32 1.32 0 011.05.47 1.7 1.7 0 01.36 1.23V7a3.2 3.2 0 00.28 1.72 2 2 0 001.26.77 2.15 2.15 0 00-1.26.79 3.26 3.26 0 00-.26 1.72v3.15a1.67 1.67 0 01-.38 1.22 1.31 1.31 0 01-1.08.47h-.87V18h1.19a6.3 6.3 0 002.12-.29 1.82 1.82 0 00.93-.68 1.9 1.9 0 00.3-.72 7.5 7.5 0 00.1-1.31v-3.77c0-1.15 0-1.15 1.15-1.15z"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cdx-icon-code-a" transform="matrix(-1 0 0 1 20 0)"/>',i2='<path d="m2.5 15.25 7.5-7.5 7.5 7.5 1.5-1.5-9-9-9 9z"/>';var r1={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3z"/><path d="M9 9h8v8H9zm0-2c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2z"/>',shouldFlip:!0};var s2='<path d="M17 12v5H3v-5H1v5a2 2 0 002 2h14a2 2 0 002-2v-5z"/><path d="M15 9h-4V1H9v8H5l5 6z"/>';var t2='<path d="m17.5 4.75-7.5 7.5-7.5-7.5L1 6.25l9 9 9-9z"/>';var y1={ltr:'<path d="M19 16 2 12a3.83 3.83 0 01-1-2.5A3.83 3.83 0 012 7l17-4z"/><rect width="4" height="8" x="4" y="9" rx="2"/>',shouldFlip:!0};var e2={ltr:'<path d="M2 18.5A1.5 1.5 0 003.5 20H5V0H3.5A1.5 1.5 0 002 1.5zM6 0v20h10a2 2 0 002-2V2a2 2 0 00-2-2zm7 8H8V7h5zm3-2H8V5h8z"/>',shouldFlip:!0};var h5={ltr:'<path d="M8 12V1H1v18h18v-7z"/><path d="M11 1v8h8V1zm6 6h-4V3h4z"/>',shouldFlip:!0};var z5={ltr:'<path d="M13 15v2a3 3 0 01-3 3 10 10 0 1110-10 5 5 0 01-5 5ZM3 8.5a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3-4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3 4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0"/>',shouldFlip:!0},v5={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3zm4 12v2c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2h-2v2h2v8H9v-2z"/><path d="M10 5H8v3H5v2h3v3h2v-3h3V8h-3z"/>',shouldFlip:!0};var i1='<path d="M13 8V2a2 2 0 002-2H5a2 2 0 002 2v6H6a2 2 0 00-2 2v1h5v5l1 4 1-4v-5h5v-1a2 2 0 00-2-2z"/>';var s1='<path d="M15.65 4.35A8 8 0 1017.4 13h-2.22a6 6 0 11-1-7.22L11 9h7V2z"/>';var z1='<path d="M17 2h-3.5l-1-1h-5l-1 1H3v2h14zM4 17a2 2 0 002 2h8a2 2 0 002-2V5H4z"/>';var d5={ltr:'<path d="m6.4 17-1.26-1.25 2.32-2.25H1v-1.75h6.46L5.14 9.5 6.4 8.25l4.5 4.38zm7.2-5.25L9.1 7.37 13.6 3l1.26 1.25-2.32 2.25H19v1.75h-6.46l2.32 2.25z"/>',shouldFlip:!0};var t1='<path d="M10 11c-5.92 0-8 3-8 5v3h16v-3c0-2-2.08-5-8-5"/><circle cx="10" cy="5.5" r="4.5"/>',e1='<path d="M10 8c1.7 0 3.06-1.35 3.06-3S11.7 2 10 2 6.94 3.35 6.94 5 8.3 8 10 8m0 2c-2.8 0-5.06-2.24-5.06-5S7.2 0 10 0s5.06 2.24 5.06 5-2.26 5-5.06 5m-7 8h14v-1.33c0-1.75-2.31-3.56-7-3.56s-7 1.81-7 3.56zm7-6.89c6.66 0 9 3.33 9 5.56V20H1v-3.33c0-2.23 2.34-5.56 9-5.56"/>';var M5={ltr:'<path d="M1 3h16v2H1Zm0 6h6v2H1Zm0 6h8v2H1Zm8-4.24h3.85L14.5 7l1.65 3.76H20l-3 3.17.9 4.05-3.4-2.14L11.1 18l.9-4.05Z"/>',shouldFlip:!0};function U1(h){let{text:z,fullSearch:v,state:d}=h,M=v?[M1(l.caseName,d)]:[],V=[],H=v?new Set([l.caseName]):new Set;if(v){let f=$(document);if(d.selectedSection?.type==="specific")f=$(`a[href$="section=${d.selectedSection.section.id}"]`).parentsUntil(":has(hr)").last().nextUntil("hr");let A=f.find(".cuEntry").find("a:first");for(let q of A){let b=Array.from(q.childNodes).find((y)=>y.nodeType===Node.TEXT_NODE)?.textContent??"";if(!b)continue;let Y=k(b);if(H.has(Y))continue;M.push(M1(Y,d)),H.add(Y)}}let c=(f)=>{return/sock ?list/.exec(f)!==null||["ip","vandal","user","noping"].some((A)=>f.includes(A))},L=T(z);for(let f of L)if(c(f.name)){let A=B2(f);for(let q of A){let b=k(q);if(!H.has(b))V.push(M1(b,d)),H.add(b)}}return[M,V,H]}function M1(h,z){if(mw.util.isIPAddress(h,!0))if(F.interface.displayIPv6As64&&mw.util.isIPv6Address(h,!1))return{...V1(z.archiveNotice),username:T5(h)};else return{...V1(z.archiveNotice),username:h};else return{...V1(z.archiveNotice),username:h}}function T5(h){if(!mw.util.isIPv6Address(h,!1))return h;return h.split(":").slice(0,4).concat("0","0","0","0").join(":")+"/64"}function V1(h){let z={id:crypto.randomUUID(),username:"",block:a2(),link:{...I2}};if(h){if(h.crosswiki)z.block.lock=!0;if(h.notalk)z.block.nem=!0,z.block.ntp=!0}return z.block.duration=F.interface.defaultBlockDuration,z}function a1(h){let{userRow:z,currentBlock:v,userPage:d,defaultBlock:M}=h;if(v)z.block.block=!0,z.block.acb=v.acb,z.block.abao=v.abao,z.block.ntp=v.ntp,z.block.nem=v.nem,z.block.duration=v.duration;else if(z.block.block=M,mw.util.isIPAddress(z.username,!0))z.block.duration="1 week";if(d)z.block.tags=u1(d);return z}var E1=(h)=>("items"in h);async function h0(h){let{block:z,userPage:v,defaultBlock:d,checkLock:M,state:V}=h,H=a1({userRow:h.userRow,defaultBlock:d,currentBlock:z,userPage:v}),c=null;if(M){let L=await A1(H.username);if(L)if(c=L.locked,L.locked||V.archiveNotice?.crosswiki)H.block.lock=!0;else H.block.lock=!1}return{userRow:H,isLocked:c}}function T0(h){return h.map((z)=>{if(E1(z)){let v=T0(z.items);if(v.length===0)return null;return{...z,items:v}}if(!z.value)return null;return z}).filter((z)=>z!==null)}function z0(h,z,v,d,M,V){if(z==="lock"){if(h===null)return!1;return a(h.username)||M.get(h.username)===!0}if(z==="block"){if(h===null)return v.noBlock;return v.noBlock||!v.override&&d.get(h.username)!==void 0}if(v.noBlock)return!0;if(h===null)return!V.some((H)=>H.block.block);if(!h.block.block)return!0;return!v.override&&d.get(h.username)!==void 0}var v0=null;function V5(h){v0=h}var H5=W({props:{feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},toaster:{type:Object,required:!0}},data:function(){let z=`User:${mw.config.get("wgUserName")??""}/`,v=_2.reduce((d,M)=>{if(M!=="sections")d.push({value:M,label:M.charAt(0).toUpperCase()+M.slice(1)});return d},[]);return{open:!1,openHandler:null,showExtra:F.debug.enabled,showExtraMessage:!1,showExtraHandler:null,logPrefix:z,caseActionMenuItems:v,selectedChipItems:F.defaultActions,icons:{cdxIconAdd:Z1,cdxIconArrowDown:g2,cdxIconClock:n2,cdxIconClose:o2,cdxIconCode:r2,cdxIconFeedback:y1,cdxIconJournal:e2,cdxIconLayout:h5,cdxIconPalette:z5,cdxIconReload:s1,cdxIconTrash:z1,cdxIconWatchlist:M5},instanceSettings:structuredClone(F),oldSettings:structuredClone(F),resetTrigger:0}},computed:{logPage(){return`${mw.config.get("wgServer")}/wiki/${o1(F.log.page)}`},isCheckUser(){let{debug:h}=this.instanceSettings;return(mw.config.get("wgUserGroups")?.includes("checkuser")??!1)||h.enabled&&h.forceCheckuser},inputChipItems:{get(){return this.instanceSettings.defaultActions.map((h)=>({value:h,label:h.charAt(0).toUpperCase()+h.slice(1)}))},set(h){this.instanceSettings.defaultActions=h.map((z)=>z.value)}}},watch:{open(h){if(h){if(!this.showExtra&&this.showExtraHandler)window.addEventListener("keydown",this.showExtraHandler)}else{let z=JSON.stringify(this.instanceSettings);if(JSON.stringify(this.oldSettings)!==z){if(v0)k2(v0(this.instanceSettings));else{this.toaster.error("Failed to save settings",{autoDismiss:!0});return}let d=this.toaster.info("Saving settings...",{autoDismiss:!1});h1().then((M)=>{this.toaster.success("Settings saved! Reload to apply them",{autoDismiss:!0})}).catch((M)=>{let V=M instanceof Error?M.message:String(M);this.toaster.error(`Failed to save settings: ${V}`,{autoDismiss:!0})}).always(()=>{this.oldSettings=JSON.parse(z),setTimeout(()=>{this.toaster.dismiss(d)},3000)})}if(this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler)}}},mounted(){this.openHandler=()=>{this.open=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"options"})},this.openButton.addEventListener("click",this.openHandler);//! Use the Konami code to unlock debug menu
let h=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"],z=0;this.showExtraHandler=(v)=>{if(v.key===h[z]){if(z++,z===h.length){if(this.showExtra=!0,this.showExtraMessage=!0,this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler);z=0}}else z=0}},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler)},methods:{isMenuGroupData:E1,loadDefaults(){this.instanceSettings=JSON.parse(JSON.stringify(Q1)),Object.assign(F,Q1),this.resetTrigger++},launchFeedback(){this.open=!1,this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`Options form v${P}-${C}`})},removeTemplateEntry(h){this.instanceSettings.custom.commentTemplates.splice(h,1)},addTemplateEntry(h){if(h==="item")this.instanceSettings.custom.commentTemplates.push({label:"",value:""});else this.instanceSettings.custom.commentTemplates.push({label:"",items:[]})},moveDown(h,z){if(z<0||z>=h.length-1)return h;let v=h[z+1];h[z+1]=h[z],h[z]=v}},template:`
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
  `});function k0(){return{sections:{label:"Sections",selectionType:"both"},comment:{label:"Comment",selectionType:"section"},status:{label:"Case Status",selectionType:"section"},block:{label:m()?"Block/Tag Socks":"Tag Socks",selectionType:"both"},link:{label:"Generate Links",selectionType:"both"},management:{label:"SPI Management",selectionType:"case"},move:{label:{case:"Move/Merge Full Case",section:"Move Section"},selectionType:"both"},archive:{label:{case:"Archive Closed",section:"Archive"},selectionType:"both"}}}function w0(){return{sections:{enabled:!0,data:{section:null}},comment:{enabled:!1,data:{text:"* "}},status:{enabled:!1,data:{old:"",new:"nochange"}},block:{enabled:!1,data:S1(l.caseName)},link:{enabled:!1},management:{enabled:!1,data:{flags:new Set}},move:{enabled:!1,data:{target:"",suppress:!1,addNote:!1}},archive:{enabled:!1}}}var d0=new Set(["status","management","comment","move","archive"]),M0=new Set(["move","archive","management"]),g0=new Set(["sections","move","archive","block","link"]),c5=new Set(["status","comment"]),L5=new Set(["management"]);var n0=W({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},emits:["actionToggled"],data(){return{accordionModel:!0}},computed:{allSelected(){return this.selection==="all"},showAccordion(){if(l.isArchive)return!d0.has(this.name);if(!p()&&M0.has(this.name))return!1;if(this.name==="sections")return!0;if(this.selection===null)return!1;if(this.selectionType==="both")return!0;return this.selectionType==="case"===this.allSelected},text(){if(typeof this.label==="string")return this.label;if(this.selectionType==="both")return this.allSelected?this.label.case:this.label.section;return"Unexpected configuration"},showEnabledClass(){return this.name!=="sections"&&this.actionEnabled}},template:`
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
  `});var o0=W({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},computed:{buttonEnabled(){return this.displayedForms.has(this.name)||this.actionEnabled},allSelected(){return this.selection==="all"},showButton(){if(l.isArchive)return!d0.has(this.name);if(!p()&&M0.has(this.name))return!1;if(this.name==="sections")return!0;if(this.selection===null)return!1;if(this.selectionType==="both")return!0;return this.selectionType==="case"===this.allSelected},buttonAction(){return this.buttonEnabled?"progressive":"normal"},buttonStyle(){return{opacity:this.buttonEnabled?1:0.7,color:this.displayedForms.has(this.name)?"var(--color-base)":""}},text(){if(typeof this.label==="string")return this.label;if(this.selectionType==="both")return this.allSelected?this.label.case:this.label.section;return"Unexpected configuration"}},template:`
    <cdx-button
        v-if="showButton"
        :name="name"
        :action="buttonAction"
        :style="buttonStyle"
    >
      {{ text }}
    </cdx-button>
  `});var r0=W({props:{enabled:{type:Boolean,required:!0},empty:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:enabled"],template:`
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="enabled && !empty">
      <slot />
    </div>
  `});var i0=W({props:{name:{type:String,required:!0},caseActions:{type:Object,required:!0},accounts:{type:Array,required:!0},state:{type:Object,required:!0}},emits:["update-section-selection","update-status","user-selected","remove-rows","add-row","fetch-rows","move-entire-case"],computed:{caseName(){return l.caseName}},methods:{handleUpdateSectionSelection(h){this.$emit("update-section-selection",h)},handleUpdateStatus(h){this.$emit("update-status",h)},handleUserSelected(h,z){this.$emit("user-selected",h,z)},handleRemoveRows(h){this.$emit("remove-rows",h)},handleAddRow(h){this.$emit("add-row",h)},handleFetchRows(){this.$emit("fetch-rows")},handleMoveEntireCase(){this.$emit("move-entire-case")}},template:`
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
                 v-model:addNote="caseActions.move.data.addNote"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled"
                 @move-entire-case="handleMoveEntireCase" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="caseActions.sections.data.section"
                    :status-data="caseActions.status.data" />
  `});var f5=10;function V0(h,z){if(h.blockid!==void 0)z.block.block=!0;if(h.blocknocreate!==void 0)z.block.acb=h.blocknocreate;if(h.blockemail!==void 0)z.block.nem=h.blockemail;if(mw.util.isIPAddress(h.name)){if(h.blockanononly!==void 0)z.block.abao=h.blockanononly}else if(h.blockautoblocking!==void 0)z.block.abao=h.blockautoblocking;if(h.blockowntalk!==void 0)z.block.ntp=h.blockowntalk;if(h.blockexpiry)z.block.duration=h.blockexpiry}var H0=W({props:{modelValue:{type:String,required:!0},label:{type:String,required:!1,default:""},allowEmpty:{type:Boolean,default:!0}},emits:["update:modelValue","user-selected"],data(){return{lookupStatus:"default",messages:{success:"Valid user",warning:"User not found",error:"Field must not be empty"},selection:null,userSuggestions:[],menuConfig:{visibleItemLimit:6,searchQuery:""},useLookup:F.useLookup}},computed:{username:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}}},methods:{onUpdateInputValue(h){let z=h.trim();if(this.menuConfig.searchQuery=z,!z){this.userSuggestions=[];return}D0(z,f5).then((v)=>{if(this.username!==h&&this.username!==z)return;if(v.length===0){this.userSuggestions=[];return}this.userSuggestions=v.map((d)=>({label:d.name,value:d.userid.toString(),customData:d}))}).catch(()=>{this.userSuggestions=[]})},onLoadMore(){if(!this.username)return;D0(this.username,this.userSuggestions.length+f5).then((h)=>{if(h.length===0)return;this.userSuggestions=h.map((z)=>({label:z.name,value:z.userid.toString(),customData:z}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.username.length===0){this.lookupStatus=this.allowEmpty?"default":"error";return}if(mw.util.isIPAddress(this.username)){this.lookupStatus="default";return}let h=this.userSuggestions.find((z)=>z.label===this.username||z.label?.trim()===this.username.trim())??null;if(h!==null)this.$emit("user-selected",h.customData),this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null){let z=this.userSuggestions.find((v)=>v.value===h)??null;if(z)this.$emit("user-selected",z.customData);this.lookupStatus="success"}}},template:`
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
  `});async function b1(h){let{page:z,state:v}=h,d;if(z===l.pageName&&v)d=await w(v);else d=await K(z,!1);if(d==="")return null;let V=T(d).find((L)=>/SPI\s*archive notice/i.exec(L.name));if(!V)return console.error("Missing archive notice"),null;let H=V.positional[0]??V.params["1"];if(!H)return console.error("Invalid archive notice: Username missing"),null;let c={deny:!1,crosswiki:!1,notalk:!1,moot:!1};for(let[L,f]of Object.entries(V.params)){if(L==="1")continue;if(f!==!0){console.warn("Malformed archivenotice parameter",L,"=",f);continue}if(L in c)c[L]=!0;else console.warn("Unrecognised archivenotice parameter",L,"=",f)}return new u({username:H,...c})}function s0(h){let z=new Set;if(h===null)return z;if(h.deny)z.add("deny");if(h.moot)z.add("moot");if(h.notalk)z.add("notalk");if(h.crosswiki)z.add("crosswiki");return z}async function W1(h){let{likelySocks:z,possibleSocks:v,allUsernames:d,userBlocks:M,userLocks:V,userTags:H,state:c}=h,L=new Set(z.map((y)=>y.id)),f=[...d].filter((y)=>!a(y)).map((y)=>`User:${y}`),[A,q]=await Promise.all([k1(d),K1(f)]),b=d.size<7,Y=[...z,...v].map(async(y)=>{let Q=A.get(y.username);if(Q!==void 0)M.set(y.username,Q);let X=q.get(y.username),G=L.has(y.id),{userRow:B,isLocked:_}=await h0({userRow:y,block:Q,defaultBlock:G,userPage:X,checkLock:b,state:c});if(_!==null)V.set(y.username,_);return H.set(y.username,y.block.tags),B});return await Promise.all(Y)}function t0(h){switch(h){case"CUrequest":return"{{CURequest}}";case"admin":return"{{awaitingadmin}}";case"clerk":return"{{Clerk Request}}";case"selfendorse":return"{{Requestandendorse}}";case"inprogress":return"{{Inprogress}}";case"decline":return"{{Decline}}";case"cudecline":return"{{Cudecline}}";case"endorse":return"{{Endorse}}";case"cuendorse":return"{{cu-endorsed}}";case"moreinfo":case"cumoreinfo":return"{{moreinfo}}";case"relist":return"{{relisted}}";case"hold":case"cuhold":return"{{onhold}}";case"reopen":return"{{reopen}}";case"checked":case"closed":return null;default:return console.warn("New case status",h,"is unexpected"),null}}function e0(h,z){let v=t0(z);if(v===null)return h;if(b0.test(h)){let d=h.replace(b0,v);if(!v)d=d.replace(/^(\s*\*\s*)? [-–] /,"$1");return d}else if(v)return"* "+v+" – "+h.replace(/^\s*\*\s*/,"");return h}function F5(h){if(H1.test(h))return"closed";if(/^open$/i.test(h))return"open";if(/^(?:inprogress|checking)$/i.test(h))return"inprogress";if(/^relist(ed)?$/i.test(h))return"relist";if(/^checked|completed$/i.test(h))return"checked";if(/^declined?$/i.test(h))return"decline";if(/^cudeclin(ed)?$/i.test(h))return"cudecline";if(/^endorsed?$/i.test(h))return"endorse";if(/^(?:CU|checkuser|CUrequest|request)$/i.test(h))return"CUrequest";if(/^cumoreinfo$/i.test(h))return"cumoreinfo";if(/^hold$/i.test(h))return"hold";if(/^cuhold$/i.test(h))return"cuhold";if(/^clerk$/i.test(h))return"clerk";if(/^admin$/i.test(h))return"admin";return"new"}function h2(h){return T(h)[0]?.name??null}var k5=new Set(["{{btc}}","{{Action and close}}","{{Closing without action}}"].map(h2).filter((h)=>h!==null)),w5=["CUrequest","admin","clerk","selfendorse","inprogress","decline","cudecline","endorse","cuendorse","moreinfo","relist","hold","reopen"],g5=new Set(w5.map((h)=>t0(h)).filter((h)=>h!==null).map(h2));function z2(h,z){let v=new Set(T(h).map((V)=>V.name));if(z!=="closed"){let V=[...k5].find((H)=>v.has(H));if(V)return{kind:"template",match:V}}let d=t0(z),M=d?h2(d):null;for(let V of v)if(g5.has(V)&&V!==M)return{kind:"template",match:V};if(z!=="closed"&&/\bclosing\b/i.test(h))return{kind:"text",match:"closing"};return null}async function v2(h){let z=new Z({type:"notice",content:"Loading all sections"}).show(),v=w(h),d=(await Promise.all(h.sections.map(async(y)=>{let Q=await E(y),X=o.exec(Q);if(!X?.[1])return null;return H1.test(X[1])?y:null}))).filter((y)=>y!==null),M=await v;if(z.update({type:"success",content:"All sections loaded"}),d.length===0){new Z({type:"warning",content:"Nothing to archive"}).show();return}let V=await K(l.archiveName,!0),H=await n5(l.pageName,l.archiveName);if(H==="abort")return;if(H==="moved")V="";let c=V!=="";if(c)V=V.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);else V=`__TOC__
{{SPI archive notice|1=${l.caseName}}}
{{SPIpriorcases}}
`;let L=c?await e({pageName:l.archiveName}):[],f=c&&L.length===0?null:f1(V,L);if(!f){new Z({type:"notice",content:"Failed to parse existing archive sections, aborting archival"}).show();return}let A=0;for(let y of d){let Q=await E(y);M=M.replace(Q+`
`,"").replace(Q,"");let X=Q.slice(Q.search(d1)).replace(o,"");if(V.includes(X)){new Z({type:"warning",content:`Section ${y.name} already exists in the archive`}).show();continue}let G=P1(y.name);if(!G){new Z({type:"error",content:`Failed to parse date from section header "${y.name}", aborting archival`}).show();return}f.push({header:G,fullText:X}),A++}if(A===0){new Z({type:"warning",content:"Nothing to archive"}).show();return}V=t(V,f);let q=A>1,b=`Archiving ${A} section${q?"s":""}`;if(await I({title:l.archiveName,newText:V,summary:`${b} from [[${l.prefixedName}]]`,watch:F.watch.archive,watchExpiry:F.expiry.archive})===null){new Z({type:"error",content:"Failed to update archive, not removing sections from case page"}).show();return}await l.edit({newText:M,summary:`${b} to [[${X1()}${l.archiveName}]]`,watch:F.watch.case,watchExpiry:F.expiry.case,baseRevId:l.startingRevId})}async function l5(h){let z=await E(h);z=z.replace(o,"");let v=await K(l.archiveName,!0),d=new Z({type:"error",content:""});if(v.includes(z)){d.type="warning",d.content="Looks like the page has been archived already",d.show();return}let M=v!=="";if(!M)v=`__TOC__
{{SPI archive notice|1=`+l.caseName+`}}
{{SPIpriorcases}}
`;else v=v.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);let V=M?new Z({type:"notice",content:"Loading archive sections"}).show():null,H=M?await e({pageName:l.archiveName}):[],c=M&&H.length===0?null:f1(v,H);if(c){V?.update({type:"success",content:"Archive sections loaded"});let f=P1(h.name);if(!f){new Z({type:"error",content:`Failed to parse date from section header '${h.name}'`}).show();return}c.push({header:f,fullText:z})}else{V?.update({type:"error",content:"Failed to parse existing archive sections, aborting archival"});return}if(v=t(v,c),await I({title:l.archiveName,newText:v,summary:`Archiving case section from [[${l.prefixedName}]]`,createonly:!1,watch:F.watch.archive,watchExpiry:F.expiry.archive})===null){d.content="Failed to update archive, not removing section from case page",d.show();return}await l.edit({newText:"",summary:`Archiving case section to [[${X1()}${l.archiveName}]]`,watch:F.watch.case,watchExpiry:F.expiry.case,baseRevId:l.startingRevId,sectionId:h.id})}async function n5(h,z){if((await C0(h)+await C0(z))/J1()<1)return"ok";let d=await d2(z);if(d===null)return"abort";return await D1({sourcePage:z,destPage:`${z}/${d}`,summary:"Moving archive to avoid exceeding post expand size limit",ignoreWarnings:!1,moveSubpages:!1}),"moved"}async function d2(h){let z=0,v="sentinel";while(v!==""){if(z>30)return new Z({type:"error",content:"Reached upper bound on possible archives, something probably went catastrophically wrong."}).show(),null;v=await K(`${h}/${++z}`,!1)}return z}async function A5(h,z){let v=J1(),d=0,M=h.length;while(d<M){let V=Math.floor((d+M)/2),H=t(z,h.slice(V));if(await g1(H)<v)M=V;else d=V+1}return d}function o5(h){let{sock:z,noticeType:v,sockmaster:d,cuBlock:M}=h,V,H=v==="sock";if(H&&d&&z.username===k(d))H=!1;if(H)V=`== Blocked as a sockpuppet ==
`;else V=`== Blocked for sockpuppetry ==
`;if(M)V+="{{checkuserblock-account|sig=~~~~";else V+="{{subst:uw-sockblock|sig=yes";if(l.valid)V+="|spi="+l.caseName;if(Y0(z.block.duration))V+="|indef=yes";else if(V+="|time="+z.block.duration,M)V+="|indef=no";if(z.block.ntp)V+="|notalk=yes";if(H&&d)V+="|master="+d;return V+="}}",V}function r5(h,z,v,d){let M="Abusing [[WP:SOCK|multiple accounts]]";if(l.valid)M+=`: Please see: [[${l.prefixedName}]]`;if(O()&&h.cuBlock){let V=z?"{{checkuserblock}}":"{{checkuserblock-account}}";if(h.cuBlockOnly)M=V;else M=V+": "+M}else if(v){if(M=`{{rangeblock|1=${M}`,!d)M+="|create=yes";M+="}}"}return M}async function q5(h){let{sock:z,blockOptions:v}=h,d=mw.util.isIPAddress(z.username,!0),M=d&&!mw.util.isIPAddress(z.username,!1),V=r5(v,d,M,z.block.acb);return await m2({user:z.username,duration:z.block.duration,reason:V,reblock:v.override,anononly:d?z.block.abao:!1,accountcreation:z.block.acb,autoblock:d?!1:z.block.abao,notalkpage:z.block.ntp,noemail:z.block.nem,watchBlockedUser:F.watch.blocked,watchExpiry:F.expiry.blocked})}async function Z5(h){let{sock:z,blockOptions:v,userTalkContent:d,talkNotices:M}=h;if(M.length===0)return;let V=z.block.tags.find((f)=>r(f))?.master,H=v.cuBlock&&O()&&F.useCheckuserblockAccount,c=`User talk:${z.username}`,L=v.blankTalk?"":d??"";for(let f of M)L+=`
`+o5({sock:z,noticeType:f,sockmaster:V,cuBlock:H});await I({title:c,newText:L,summary:B1("Adding sockpuppetry block notice"),createonly:!1,watch:"nochange"})}async function i5(h){return(await Promise.all(h.map(async(v)=>(await A1(v))?.locked?null:v))).filter((v)=>v!==null)}var s5=6;async function y5(h){let{master:z,hideNames:v}=h,d=h.lockTargets.length<s5?await i5(h.lockTargets):h.lockTargets;if(d.length===0)return[];let M,V=d.length>1;if(!V&&d[0])M=`* {{LockHide|1=${d[0]}}}`;else{if(M="{{MultiLock",d.forEach((b,Y)=>{M+=`|${Y+1}=${b}`}),v)M+="|hidename=1";M+="}}"}let H,c="Global lock for ";if(v||!z)H=V?`${d.length} sockpuppets`:"a sockpuppet",c+=H;else H=`${d.length} [[Special:CentralAuth/${z}|${z}]] ${V?"socks":"sock"}`,c+=`${d.length} ${z} ${V?"socks":"sock"}`;let L=h.lockComment.trim().replace(/\.+$/,""),f=`=== Global lock for ${H} ===`;if(f+=`
{{status}}`,f+=`
${M}`,l.source==="spi"&&l.valid)f+=`
${V?"Sockpuppets":"Sockpuppet"} found in enwiki sockpuppet investigation, see [[${l.prefixedName}]].`;else if(l.source==="spi")f+=`
${V?"Sockpuppets":"Sockpuppet"} found in enwiki sockpuppet investigation.`;else f+=`
${V?"Sockpuppets":"Sockpuppet"} found in enwiki.`;if(L!=="")f+=` ${L}.`;f+=" ~~~~";let A=await K("meta:Steward requests/Global",!1);A=A.replace(/\n+(== See also == *\n)/,`

`+f+`

$1`),new Z({type:"notice",content:"Filing global lock request"}).show();let q=await I({title:"meta:Steward requests/Global",newText:A,summary:`Global lock request for ${H}`,createonly:!1,watch:"nochange"});if(q){let b=N(`meta:Special:Diff/${q}#${c}`,"filed");new Z({type:"success",content:`Global lock request ${b} successfully!`,isHtml:!0}).show()}else new Z({type:"warning",content:"Global lock request failed."}).show();return d}async function O1(h){let z=new Date,v=z.toLocaleString("en",{month:"long"})+" "+z.toLocaleString("en",{year:"numeric"}),d="==\\s*"+v+"\\s*==",M=new RegExp(d,"i"),V=/==.*?==/i,H=o1(F.log.page),c=await K(H,!1);if(!c.match(M))if(F.log.reversed){let L=V.exec(c);if(L?.index)c=c.slice(0,L.index)+"== "+v+` ==
`+c.slice(L.index)}else c+=`
== `+v+" ==";if(F.log.reversed){let L=V.exec(c);if(L?.index)c=c.slice(0,L.index+L[0].length)+`
`+h+c.slice(L.index+L[0].length)}else c+=`
`+h;await I({title:H,newText:c,summary:"Logging spihelper edits",createonly:!1,watch:"nochange"})}async function t5(h,z,v){let d=await U0(h),M=await U0(z),V=[];return v.types.forEach((H)=>{let c=d.find((f)=>f.type===H),L=M.find((f)=>f.type===H);if(c&&L){let f=L.expiry;if(c1(L.expiry)||c1(c.expiry))f="infinite";else if(L.expiry<c.expiry)f=c.expiry;let A=v.levels.indexOf(c.level),q=v.levels.indexOf(L.level),b;if(A===-1||q===-1){console.error("Invalid protection information provided from API");return}else if(A>q)b=c.level;else b=L.level;V.push({type:c.type,expiry:f,level:b})}else if(c)V.push(c);else if(L)V.push(L)}),V}async function e5(h,z,v){let d=await a0(h),M=await a0(z),V={level:""};if(d&&M){if(c1(d.protection_expiry)||c1(M.protection_expiry))V.expiry="infinite";else if(M.protection_expiry<d.protection_expiry)V.expiry=d.protection_expiry;else V.expiry=M.protection_expiry;let H=v.levels.indexOf(d.protection_level),c=v.levels.indexOf(M.protection_level);if(H===-1||c===-1)return console.error("Invalid protection information provided from API"),V;else if(H>c)V.level=d.protection_level;else if(H<=c)V.level=M.protection_level}else if(d)V={level:d.protection_level,expiry:d.protection_expiry};else if(M)V={level:M.protection_level,expiry:M.protection_expiry};return V}async function h3(h,z,v){let d=await K(h.archiveName,!1),M=await K(z.archiveName,!1);if(!d||!M)return"skipped";new Z({type:"notice",content:"Archives detected on both source and target cases, copying it manually."}).show();let V=await e({pageName:h.archiveName}),H=await e({pageName:z.archiveName}),c=V.length?f1(d,V):null,L=H.length?f1(M,H):null;if(!c||!L)return new Z({type:"error",content:"Could not parse the archive. Please merge the archives manually"}).show(),"skipped";if(v)for(let q of c)q.fullText=q.fullText.replace(/\n*----(?!([\n.])*----)/,`
* {{clerknote}} originally filed under [[${h.pageName}]]. ~~~~
----`);let f=[...L,...c];M=t(M,f);let A=J1();if(await g1(M)>=A){new Z({type:"notice",content:"Running binary search to find cutoff point for post-expand include size"}).show();let q=await A5(f,M);if(q>=f.length)return new Z({type:"error",content:"Archives are too large to merge without hitting post-expand size limit. Please merge manually"}).show(),"abort";let b=await d2(z.archiveName);if(b===null)return"abort";let Y=`__TOC__
{{SPI archive notice|1=${z.caseName}}}
{{SPIpriorcases}}
`;await I({title:`${z.archiveName}/${b}`,newText:t(Y,f.slice(0,q)),summary:"Splitting archive due to post-expand size limit",createonly:!1,watch:F.watch.archive,watchExpiry:F.expiry.archive}),M=t(M,f.slice(q))}return await I({title:z.archiveName,newText:M,summary:`Merging archives from [[${h.prefixedName}]], see page history for attribution`,createonly:!1,watch:F.watch.archive,watchExpiry:F.expiry.archive}),"copied"}async function b5(h){let{target:z,suppress:v,addNote:d,archiveNotice:M}=h,V=l,H=new I1(l.pageName.replace(l.caseName,z)),c=await K(H.pageName,!1);if(c)if(m()){if(!confirm("Target page exists, do you want to histmerge the cases?")){new Z({type:"warning",content:"Aborted merge"}).show();return}}else{new Z({type:"warning",content:"Target page exists and you are unable to histmerge, aborting merge"}).show();return}if(H.pageName===V.pageName){new Z({type:"error",content:"Target page is the current page, aborting merge"}).show();return}if(c){let L=await h3(V,H,d);if(L==="abort")return;let f=await p2(),A=await t5(V.pageName,H.pageName,f),q=await e5(V.pageName,H.pageName,f);if(await B0(H.pageName,"Deleting as part of case merge"),await D1({sourcePage:V.pageName,destPage:H.pageName,summary:`Merging case to [[${H.prefixedName}]]`,ignoreWarnings:!0,suppressRedirect:v}),await C2(H.pageName,"Restoring page history after merge"),L==="copied")if(v)await B0(V.archiveName,`Archives moved to [[${H.archiveName}]]`);else await I({title:V.archiveName,newText:`#REDIRECT [[${H.archiveName}]]`,summary:"Redirecting old archive to new archive",createonly:!1,watch:F.watch.archive,watchExpiry:F.expiry.archive});if(A.length!==0){if(await E0(H.pageName,A),!v)await E0(V.pageName,A)}if(q.level!==""){if(await O0(H.pageName,q),!v)await O0(V.pageName,q)}}else await D1({sourcePage:V.pageName,destPage:H.pageName,summary:`Moving case to [[${H.prefixedName}]]`,suppressRedirect:v&&G1(),ignoreWarnings:!1});await v3({oldContext:V,newContext:H,oldNotice:M,deleteOld:v,preMergeText:c})}async function W5(h,z){let v=new I1(l.pageName.replace(l.caseName,h)),d=await K(v.pageName,!1),M=await E(z);if(M=M.replace(/\n*----(?!([\n.])*----)/,`
* {{clerknote}} originally filed under [[${l.pageName}]]. ~~~~
----`),d==="")d=`<noinclude>__TOC__</noinclude>
{{SPI archive notice|`+h+`}}
{{SPIpriorcases}}`;d+=`
`+M,v.edit({newText:d,summary:`Moving case section from [[${l.prefixedName}]], see page history for attribution`,createonly:!1,watch:F.watch.case,watchExpiry:F.expiry.case}),await l.edit({newText:"",summary:`Moving case section to [[${v.prefixedName}]]`,createonly:!1,watch:F.watch.case,watchExpiry:F.expiry.case,baseRevId:l.startingRevId,sectionId:z.id})}function z3(h,z){let v=/\{\{sock\s+list[\s\S]*?\}\}/i.exec(h)?.[0];if(!v)return h.replace(j2,`====Suspected sockpuppets====
* {{checkuser|1=`+z+`}} ({{clerknote}} original case name)
`);let d=Q0(v.slice(2,-2)),V=v.includes(`
`)?`
`:"",H=z.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),c=z.toLowerCase(),L=d.positional.findIndex((q)=>q.toLowerCase()===c),f=-1;for(let[q,b]of Object.entries(d.params))if(/^\d+$/.test(q)&&b.toString().toLowerCase()===c){f=parseInt(q);break}let A;if(L>=0||f>=0){let q=f>=0?f:L+1;if(`note${q}`in d.params)A=v;else{let Y;if(f>=0){let y=new RegExp(`\\|\\s*${f}\\s*=\\s*${H}`,"i").exec(v);Y=y?y[0]:void 0}else{let y=new RegExp(`\\|(?![^|}\\n]*=)\\s*${H}\\s*(?=[|}\\n])`,"i").exec(v);Y=y?y[0]:void 0}A=Y?v.replace(Y,Y+`|note${q}=({{clerknote}} original case name)`):v}}else{let q=Object.keys(d.params).filter((B)=>/^\d+$/.test(B)).map(Number),Y=Math.max(0,...q,d.positional.length)+1,y=`${V}|${Y}=${z}|note${Y}=({{clerknote}} original case name)`,Q=Object.keys(d.params).filter((B)=>!/^\d+$/.test(B)&&!/^note\d+$/.test(B)),X=null;for(let B of Q){let _=B.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),U=new RegExp(`(\\n?)\\|\\s*${_}\\s*=`).exec(v);if(U&&(X===null||U.index<X.index))X={index:U.index,match:U}}let G;if(X)G=X.match.index;else{let B=v.lastIndexOf("}}");G=B-(v[B-1]===`
`?1:0)}A=v.slice(0,G)+y+v.slice(G)}return h.replace(v,A)}async function v3(h){let{oldContext:z,newContext:v,oldNotice:d,deleteOld:M,preMergeText:V}=h,H=new u({username:v.caseName}),c=H.generateWikitext();H.crosswiki=d.crosswiki,H.deny=d.deny,H.notalk=d.notalk,H.moot=d.moot;let L=[],f=[z.pageName],A=null;while(f.length!==0){if(A=f.pop(),!A||A===v.pageName)continue;L.push(A);let y=await x2(A);for(let Q of y){if(Q.title===v.pageName)continue;let X=await b1({page:Q.title});if(!X)continue;if(X.username===A.replace(/Wikipedia:Sockpuppet investigations\//g,"")){if(await I({title:Q.title,newText:c,summary:"Updating backlink following page move",watch:F.watch.case,watchExpiry:F.expiry.case}),!L.includes(Q.title))f.push(Q.title)}}}if(M){if(!G1())await z.edit({newText:`{{db-g6|rationale=Case moved to [[${v.pageName}]], requesting deletion as non-admin SPI clerk}}`,summary:"Requesting [[WP:G6|G6]] deletion after case move",createonly:!1,watch:F.watch.archive,watchExpiry:F.expiry.archive})}else await z.edit({newText:c,summary:"Updating old case following page move",watch:F.watch.case,watchExpiry:F.expiry.case});let q=await K(v.pageName,!0);if(q=z3(q,z.caseName),V){let y=V.replace(/\n*<noinclude>__TOC__.*\n/ig,"");y=y.replace(j1,""),y=y.replace(W0,""),q=q+`
`+y}q=q.replace(j1,H.generateWikitext());let b="(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?"+v.caseName+"(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)",Y=new RegExp(b,"sm");q=q.replace(Y,`$1
$2`),await v.edit({newText:q,summary:"Updating new case following page move",watch:F.watch.case,watchExpiry:F.expiry.case})}function $5(h){return I({title:h,newText:"{{sockpuppet category}}",summary:B1("Creating sockpuppet category"),createonly:!0,watch:F.watch.categories,watchExpiry:F.expiry.categories})}function d3(h,z){if(h.length!==z.length)return!1;let v=Array(z.length).fill(!1);for(let d of h){let M=!1;for(let V=0;V<z.length;V++){let H=z[V];if(!H)continue;if(!v[V]&&d.equals(H)){v[V]=!0,M=!0;break}}if(!M)return!1}return!0}function M3(h,z){let v=/\n?\{\{\s*sock\w*\b[\s\S]*?}}/gi,d=[...h.matchAll(v)];if(d.length===0)return z;let M=d[0];if(!M)return z;let V=M[0];return h=h.replace(V,z),d.slice(1).forEach((H)=>{let c=H[0];h=h.replace(c,"")}),h}async function j5(h){let{sock:z,pageText:v,blocked:d,tagNonLocalAccounts:M}=h;if(a(z.username))return!1;let V=await A1(z.username);if(!V)return new Z({type:"warning",content:`The account ${z.username} does not exist and so has not been tagged`}).show(),!1;if(!M&&!V.existsLocally)return new Z({type:"warning",content:`The account ${z.username} does not exist locally and so has not been tagged`}).show(),!1;z.block.tags.forEach((q)=>{q.locked=V.locked});let H=u1(v),c=z.block.tags.reduce((q,b)=>{let Y=r(b)&&!b.master,y=q.some((Q)=>Q.equals(b));if(!Y&&!y)q.push(b);return q},[]);if(d3(H,c)){let q=N(`User:${z.username}`);return new Z({type:"notice",content:`Tags are unmodified, skipping ${q}`,isHtml:!0}).show(),!1}let L=c.map((q)=>q.generateWikitext(d)).join(`
`),f=M3(v,L),A=H.length<c.length?"Adding":"Updating";return I({title:`User:${z.username}`,newText:f,summary:B1(`${A} sockpuppetry tag`),createonly:!1,watch:F.watch.tagged,watchExpiry:F.expiry.tagged}).then((q)=>q!==null)}function V3(h){let z=new Map;function v(d){if(!z.has(d))z.set(d,{confirmed:!1,suspected:!1});return z.get(d)??{confirmed:!1,suspected:!1}}for(let d of h)for(let M of d.block.tags){if(F1(M))continue;let V=v(M.master);if(M.status==="proven"||M.status==="confirmed")V.confirmed=!0;if(M.status==="blocked")V.suspected=!0;if(M.altmaster){let H=v(M.altmaster);if(M.altmasterStatus==="proven")H.confirmed=!0;if(M.altmasterStatus==="suspected")H.suspected=!0}}return z}async function Q5(h){let z=new Map,v=V3(h);for(let[d,{confirmed:M,suspected:V}]of v){if(!d)continue;let H=!1;if(M){let c=`Category:Wikipedia sockpuppets of ${d}`;if(!await K(c,!1))await $5(c),H=!0}if(V){let c=`Category:Suspected Wikipedia sockpuppets of ${d}`;if(!await K(c,!1))await $5(c),H=!0}z.set(d,H)}return z}async function Y5(h){x("oneClickArchive"),new Z({type:"notice",content:"Starting OCA"}).show();let z=await w(h,{show:!0,purge:!0});if(!d1.test(z)){new Z({type:"notice",content:"Looks like the page has been archived already"}).show(),D("oneClickArchive","success");return}await q1(h),await v2(h);let v=`* [[${l.pageName}]]: used one-click archiver ~~~~~`;if(F.log.enabled)await O1(v);new Z({type:"notice",content:"Refreshing data"}).show(),await l.refreshRevId(),await q1(h),new Z({type:"success",content:"Done!"}).show(),D("oneClickArchive","success")}async function J5(h){let{actions:z,accounts:v,state:d}=h;if(Object.values(z).every((_)=>!_.enabled)){new Z({type:"warning",content:"No actions are enabled"}).show();return}if(!d.selectedSection){console.error("spiHelperPerformActions: Expected a selected section, got null"),new Z({type:"error",content:"Expected a selected section, got null"}).show();return}if(!d.archiveNotice){console.error("spiHelperPerformActions: Could not find archive notice"),new Z({type:"error",content:"Could not find archive notice"}).show();return}if(!z.block.data.master){console.error("spiHelperPerformActions: Could not get master"),new Z({type:"error",content:"Could not get master"}).show();return}let M=d.selectedSection.type;new Z({type:"notice",content:"Running actions"}).show();let V=[],H=`* [[${l.pageName}]]`;if(d.selectedSection.type==="specific")H+=` (section ${d.selectedSection.section.name})`;else H+=" (full case)";H+=" ~~~~~";let c=await(M==="specific"?E(d.selectedSection.section):w(d));if(!c){new Z({type:"error",content:"Could not fetch text for the page"}).show();return}let L=c,f=[],A=[],q=[],b=Promise.resolve([]);if(z.block.enabled)({blockPromises:f,tagPromises:A,talkNoticePromises:q,lockPromise:b}=await M2({accounts:v,blockData:z.block.data}));let Y=Promise.all([Promise.all(f),Promise.all(A),b]),y=Promise.all(q);if(!l.isArchive){if(M==="specific"){if(o.exec(c)===null)c=c.replace(/^(\s*===.*===[^\S\r\n]*)/,`$1
{{SPI case status|}}`),z.status.data.old="new";if(z.status.data.new==="nochange")z.status.data.new=z.status.data.old;if(z.status.enabled&&z.status.data.new!==z.status.data.old){let U=c3(z.status.data.new,c);if(c=U.targetText,U.newStatus!=="nochange")V.push(U.summaryItem),H+=`
** changed case status from ${z.status.data.old} to ${U.newStatus}`}if(z.comment.enabled&&z.comment.data.text.trim()!=="*")c=H3(c,z.comment.data.text),V.push("comment"),H+=`
** commented`}else if(z.management.enabled){let _=z.management.data.flags;d.archiveNotice=new u({username:d.archiveNotice.username||l.caseName,deny:_.has("deny"),crosswiki:_.has("crosswiki"),notalk:_.has("notalk"),moot:_.has("moot")});let U=d.archiveNotice.generateWikitext();c=c.replace(j1,U),V.push("update archivenotice"),H+=`
** Updated archivenotice`}}if(V.length===0)V.push("Saving page");let Q=z.move.enabled||z.archive.enabled;if(!l.isArchive&&c!==L){let _=d.selectedSection.type==="all"?null:d.selectedSection.section.id,U=L3(V),j=await l.edit({newText:c,summary:U,watch:F.watch.case,watchExpiry:F.expiry.case,baseRevId:l.startingRevId,sectionId:_});if(j===null){if(new Z({type:"error",content:"Failed to save edit"}).show(),!Q)await l.refreshRevId()}else{if(d.selectedSection.type==="specific"){if(d.selectedSection.section._text=c,d._text)d._text=d._text.replace(L,c)}else d._text=c;l.startingRevId=j}}if(z.archive.enabled)switch(d.selectedSection.type){case"all":{H+=`
** Archived case`,await v2(d);break}case"specific":{H+=`
** Archived section`,await l5(d.selectedSection.section);break}}else if(z.move.enabled){let _=k(z.move.data.target);if(_)switch(d.selectedSection.type){case"all":{H+=`
** moved/merged case to `+_,await b5({target:_,suppress:z.move.data.suppress,addNote:z.move.data.addNote,archiveNotice:d.archiveNotice});break}case"specific":{H+=`
** moved section to `+_,await W5(_,d.selectedSection.section);break}}}let[X,G,B]=await Y;if(await y,F.log.enabled)H+=R1({blockedUsers:X,taggedUsers:G,lockedUsers:B}),await O1(H);if(Q){if(z.move.enabled&&d.selectedSection.type==="all")await q1(d);if(d.selectedSection.type==="specific")d.selectedSection=null;await l.refreshRevId()}new Z({type:"success",content:"Done!"}).show()}function H3(h,z){if(!h.includes(`
----`))h=h.replace(/<!-+ All comments go ABOVE this line, please. -+>/,""),h+=`
----<!-- All comments go ABOVE this line, please. -->`;if(z=N1(z.trimEnd()),p()||m())return h.replace(/\n*----(?!.*----)/s,`
${z}
----`);else return h.replace($1,`
`+z+`

====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====
`)}function c3(h,z){let v="";switch(h){case"reopen":h="open",v="Reopening";break;case"open":v="Marking request as open";break;case"CUrequest":v="Adding checkuser request";break;case"admin":v="Requesting admin action";break;case"clerk":v="Requesting clerk action";break;case"selfendorse":h="endorse",v="Adding checkuser request (self-endorsed for checkuser attention)";break;case"checked":v="Marking request as checked";break;case"inprogress":v="Marking request in progress";break;case"decline":v="Declining checkuser";break;case"cudecline":v="CU declining checkuser";break;case"endorse":v="Endorsing for checkuser attention";break;case"cuendorse":v="CU endorsing for checkuser attention";break;case"moreinfo":case"cumoreinfo":v="Requesting additional information";break;case"relist":v="Relisting case for another check";break;case"hold":v="Putting case on hold";break;case"cuhold":v="Placing checkuser request on hold";break;case"closed":v="Closing case";break;case"nochange":break;default:console.error("Unexpected case status value",h)}let d=o.exec(z);if(d?.[0])z=z.replace(d[0],`{{SPI case status|${h}}}`);return{newStatus:h,summaryItem:v,targetText:z}}async function M2(h){let z=[],v=[],d=[],M=Promise.resolve([]),{userLocks:V,options:H,lockcomment:c,master:L,skipCUVerifyUsers:f}=h.blockData,A=h.accounts.filter((j)=>j.username!==""),q=[];await Q5(A);let b=m()&&!H.noBlock,{allUsernames:Y,allUserPages:y,allUserTalkPages:Q}=A.reduce((j,g)=>{return j.allUsernames.add(g.username),j.allUserPages.push(`User:${g.username}`),j.allUserTalkPages.push(`User talk:${g.username}`),j},{allUsernames:new Set,allUserPages:[],allUserTalkPages:[]}),X=new Z({type:"notice",content:"Fetching user blocks and tags"}).show(),[G,B,_]=await Promise.all([k1(Y),K1(y),K1(Q)]);X.update({type:"success",content:"Got previous blocks and tags"});let U=async(j,g)=>{return await j5({sock:j,pageText:B.get(j.username)??"",blocked:g,tagNonLocalAccounts:H.tagUnattached})?j.username:null};for(let j of A){if(j.block.lock&&!a(j.username)){if(V.get(j.username)!==!0)q.push(j.username)}if(b&&j.block.block){let g=[];if(H.addMasterNotice&&(j.block.tags.some((n)=>F1(n))||j.username===L))g.push("master");else if(H.addSockNotice)g.push("sock");let b2=Math.max(500,A.length*100),Z0=(async()=>{let n=G.get(j.username);if(n!==void 0&&!H.override){let v1=new Z({type:"warning",content:`Block target ${j.username} is already blocked. `}),$2=j.block.tags.length>0;if($2)v1.content+="Proceeding with tagging";else v1.content+='Check the "override existing blocks" box to re-block them';return v1.show(),{blockedUsername:null,shouldTag:$2}}let y0=n?.reason;if(!O()&&!f.has(j.username)&&H.override&&y0&&m1.exec(y0)){let v1="User "+j.username+` is CheckUser-blocked, are you SURE you want to re-block them?
Current block message:
`+y0;if(!confirm(v1))return{blockedUsername:null,shouldTag:!1}}if(!j.block.duration)return new Z({type:"error",content:`Block target ${j.username} does not have an intended duration`}).show(),{blockedUsername:null,shouldTag:!1};await new Promise((v1)=>setTimeout(v1,Math.random()*b2));let W2=await q5({sock:j,blockOptions:H});return{blockedUsername:W2?j.username:null,shouldTag:W2}})();if(z.push(Z0.then(({blockedUsername:n})=>n)),g.length>0)d.push((async()=>{let{blockedUsername:n}=await Z0;if(n===null)return;await Z5({sock:j,userTalkContent:_.get(j.username),blockOptions:H,talkNotices:g})})());if(j.block.tags.length>0)v.push((async()=>{let{shouldTag:n}=await Z0;if(!n)return null;return U(j,!0)})())}else if(j.block.tags.length>0)v.push(U(j,G.has(j.username)))}if(q.length>0){let j=H.lockHideNames;M=y5({lockTargets:q,hideNames:j,master:L,lockComment:c})}return{blockPromises:z,tagPromises:v,talkNoticePromises:d,lockPromise:M}}function L3(h){let[z,...v]=h;if(!z)return"";let d=z.charAt(0).toUpperCase()+z.slice(1),M=v.length?`, ${v.join(", ")}`:"";return d+M}function f3(h){let z=$(`a[href$="section=${h}"]`).first();if(z.length===0)return null;let v=z.parentsUntil(":has(hr)").last().nextUntil("hr");return v.length>0?v:null}function V2(h){let z=$(`a[href$="section=${h}"]`).first();if(z.length===0)return null;let v=z.closest(".mw-heading");return v.length>0?v.get(0)??null:null}function _5(h){let z=V2(h);if(z)z.scrollIntoView({behavior:"smooth",block:"center"})}function K5(){return document.querySelector("#mw-content-text .mw-parser-output")}function F3(h){let z=K5(),v=V2(h);if(!z||!v)return null;let M=f3(h)?.last().get(0)??v,V=z.getBoundingClientRect(),H=v.getBoundingClientRect(),c=M.getBoundingClientRect(),L=Math.min(H.top,c.top)-V.top+z.scrollTop,f=Math.max(H.bottom,c.bottom)-V.top+z.scrollTop;return{top:L,height:Math.max(1,f-L)}}function l3(){let h=K5();if(!h)return null;let z=document.createElement("div");return z.style.display="none",z.className="spiHelper-section-overlay",h.appendChild(z),z}function A3(h,z,v){let d=F3(z);if(!h||!d)return;h.style.top=`${Math.max(0,d.top)}px`,h.style.height=`${d.height+8}px`,h.style.display="block",h.classList.toggle("spiHelper-section-overlay--preview",v==="preview"),h.classList.toggle("spiHelper-section-overlay--selected",v==="selected")}function D5(h,z){let v=/v-\d+-(\d+)/.exec(h.id);if(v===null||v.length<2)return null;let d=Number(v[1]),M=z[d-1];if(!M||M.value==="all")return null;return typeof M.value==="number"?M.value:null}var c0=null;function q3(){return c0??=l3(),c0}function L0(h,z){let v=q3();A3(v,h,z)}function C1(){if(c0)c0.style.display="none"}var X5="open in spiHelper";function I5(h,z){let v=[];for(let d of h){let M=V2(d);if(!M)continue;let V=M.querySelector(".mw-editsection");if(V){let H=V.querySelector(".mw-editsection-bracket:last-child"),c=document.createElement("span");c.className="mw-editsection-divider",c.textContent=" | ";let L=document.createElement("a");if(L.href="#",L.className="spiHelper-section-open",L.textContent=X5,L.addEventListener("click",(f)=>{f.preventDefault(),z(d)}),H)V.insertBefore(c,H),V.insertBefore(L,H);else V.append(c,L);v.push(c,L)}else{let H=document.createElement("span");H.className="mw-editsection-like spiHelper-section-open";let c=document.createElement("span");c.className="mw-editsection-bracket",c.textContent="[";let L=document.createElement("a");L.href="#",L.textContent=X5,L.addEventListener("click",(A)=>{A.preventDefault(),z(d)});let f=document.createElement("span");f.className="mw-editsection-bracket",f.textContent="]",H.append(c,L,f),M.appendChild(H),v.push(H)}}return()=>{for(let d of v)d.remove()}}var H2=W({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0}},data(){let h=k0(),z=Object.keys(h);return{open:!1,handlers:{openHandler:null,beforeUnloadHandler:null},actionsRunning:!1,displayedForms:new Set(["sections"]),unpinned:!F.interface.pinned,buttonLayout:F.interface.buttonLayout,actionButtons:h,actionButtonKeys:z,sectionAccountNames:new Set,caseActions:w0(),accounts:[],messages:R,sectionClickCleanup:null,icons:{cdxIconPushPin:i1,cdxIconCollapse:i2,cdxIconExpand:t2,cdxIconFeedback:y1}}},computed:{allDisabled(){for(let[h,z]of Object.entries(this.caseActions)){if(h==="sections"||h==="link")continue;if(z.enabled)return!1}return!0},selectedSection(){return this.state.selectedSection},archiveNotice(){return this.state.archiveNotice},stateSections(){return this.state.sections},mountPoint(){return this.$el.parentElement}},watch:{unpinned(h){if(!this.mountPoint){console.error("TopViewComponent unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");F.interface.pinned=!h},async open(h){if(h)await this.ensureArchiveNotice(),this.syncSelectedSectionOverlay();else this.syncSelectedSectionOverlay(),h1()},async stateSections(h){if(this.setupSectionButtons(),this.caseActions.sections.data.section===null){let z=h[0];if(z)this.caseActions.sections.data.section=z.id,await this.ensureArchiveNotice(),await this.loadNewSection(z);else await this.onUpdateSectionSelection("all")}},archiveNotice(h){this.caseActions.management.data.flags=s0(h)},"caseActions.sections.data.section"(h,z){if(h===z)return;for(let[v,d]of Object.entries(this.caseActions)){let M=v;if(M==="sections")continue;let V=F.defaultActions.includes(M);if(d.enabled=V,V&&(g0.has(M)||h==="all"&&L5.has(M)||typeof h==="number"&&c5.has(M)))this.displayedForms.add(M)}}},mounted(){if(!this.mountPoint){console.error("TopViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.handlers.beforeUnloadHandler=(h)=>{let z=T1("mainActions");if(!this.allDisabled&&z!=="success")h.preventDefault()},this.handlers.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"top"}),this.handlers.beforeUnloadHandler)window.addEventListener("beforeunload",this.handlers.beforeUnloadHandler)}else if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler)},this.openButton.addEventListener("click",this.handlers.openHandler)},beforeUnmount(){if(this.handlers.openHandler)this.openButton.removeEventListener("click",this.handlers.openHandler);if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler);this.sectionClickCleanup?.(),this.sectionClickCleanup=null},methods:{setupSectionButtons(){let h=this.state.sections.map((z)=>z.id);if(h.length===0)return;this.sectionClickCleanup=I5(h,(z)=>{if(this.onUpdateSectionSelection(z),!this.open)this.open=!0})},syncSelectedSectionOverlay(){if(!F.highlightSection||!this.open){C1();return}let h=this.state.selectedSection;if(h?.type!=="specific"){C1();return}L0(h.section.id,"selected")},toggleButtonLayout(){this.buttonLayout=!this.buttonLayout,F.interface.buttonLayout=this.buttonLayout},onActionClick(h,z){let v=z;if(h.ctrlKey||h.metaKey)if(this.displayedForms.has(v))this.displayedForms.delete(v);else this.displayedForms.add(v);else this.displayedForms=new Set([v])},onAccordionToggle(h){let z=h;if(this.displayedForms.has(z))this.displayedForms.delete(z);else this.displayedForms.add(z)},isVisible(h){return this.displayedForms.has(h)},async onUpdateSectionSelection(h){if(h===null)return;if(this.caseActions.sections.data.section=h,(this.state.selectedSection?.type??null)!==(h==="all"?"all":"specific"))this.displayedForms=new Set(Array.from(this.displayedForms).filter((M)=>g0.has(M)));if(h==="all"){this.state.selectedSection={type:"all"},this.loadSectionAccounts(this.state.selectedSection),this.syncSelectedSectionOverlay();return}let d=this.state.sections.find((M)=>M.id===h);if(d===void 0){console.error("onUpdateSectionSelection: Could not find target section with ID",h);return}await this.loadNewSection(d)},async loadNewSection(h){this.state.selectedSection={type:"specific",section:h};let z=await E(h),v=o.exec(z),d=F5(v?.[1]??"");if(this.caseActions.status.data.old=d,this.caseActions.status.data.new=d,d==="closed"&&F.tickArchiveWhenCaseClosed)this.caseActions.archive.enabled=!0;this.syncSelectedSectionOverlay(),this.loadSectionAccounts(this.state.selectedSection)},async loadSectionAccounts(h){this.accounts=this.accounts.filter((H)=>!this.sectionAccountNames.has(H.username));let z=await(h.type==="all"?w(this.state):E(h.section)),[v,d,M]=U1({text:z,fullSearch:!0,state:this.state}),V=await W1({likelySocks:v,possibleSocks:d,allUsernames:M,userBlocks:this.caseActions.block.data.userBlocks,userLocks:this.caseActions.block.data.userLocks,userTags:this.caseActions.block.data.userTags,state:this.state});this.sectionAccountNames=new Set(this.massAddUserRows(V).map((H)=>H.username))},onUpdateNewStatus(h){this.caseActions.comment.data.text=e0(this.caseActions.comment.data.text,h)},async onSubmitActions(){if(l1("mainActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"top"}),x("mainActions"),this.actionsRunning=!0,await J5({actions:this.caseActions,accounts:this.accounts,state:this.state}),D("mainActions","success"),this.actionsRunning=!1},handleFetchRows(){let[h,z]=U1({text:this.caseActions.comment.data.text,fullSearch:!1,state:this.state}),v=new Set(h),d=[...h,...z].map((M)=>a1({userRow:M,defaultBlock:v.has(M)}));this.massAddUserRows(d)},handleUserSelected(h,z){let v=this.accounts.find((d)=>d.id===z);if(!v)return;if(h.blockid!==void 0&&!this.caseActions.block.data.userBlocks.has(v.username)){let d=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.caseActions.block.data.userBlocks.set(v.username,{username:v.username,duration:h.blockexpiry??"",abao:d??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}V0(h,v)},handleAddRow(h){h??=V1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((z)=>!h.includes(z.id))},massAddUserRows(h){let z=this.accounts.at(-1)?.username==="",v=new Set(this.accounts.map((M)=>M.username)),d=h.filter((M)=>!v.has(M.username));if(z)d.forEach((M)=>{this.accounts.splice(this.accounts.length-1,0,M)});else this.accounts=this.accounts.concat(d);return d},async ensureArchiveNotice(){if(this.state.archiveNotice)return;let h=await b1({page:l.casePageName,state:this.state});if(h===null)this.state.archiveNotice=new u({username:l.caseName}),new Z({type:"warning",content:"Can't find archivenotice template! Automatically adding the archive notice to the page."}).show(),mw.notify("Can't find archivenotice template! If this is incorrect, please contact DatGuy",{type:"warn"}),console.warn("archivenoticeResult is null");else this.state.archiveNotice=h},launchFeedback(){this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`SPI form v${P}-${C}`})},async handleMoveEntireCase(){await this.onUpdateSectionSelection("all"),this.caseActions.move.enabled=!0}},template:`
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
  `});var c2=W({props:{enabled:{type:Boolean,required:!0},selection:{type:Object,required:!0},statusData:{type:Object,required:!0}},emits:["update:enabled"],computed:{badStatus(){return this.selection!=="all"&&this.status!=="closed"},status(){switch(this.statusData.new){case"nochange":return this.statusData.old;case"selfendorse":return"endorse";default:return this.statusData.new}}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus" type="warning" :inline="true">
      The selected section status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
  `});var f0=W({props:{accounts:{type:Array,required:!0},blockOptions:{type:Object,required:!0},userLocks:{type:Map,required:!0},userBlocks:{type:Map,required:!0},defaultMaster:{type:String,required:!0},fetchType:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","update:blockOptions","removeRows","addRow","userSelected","usernameChanged","fetchRows"],data(){let h=[{id:"username",label:"Username"},{id:"tag",label:"Tag"},{id:"lock",label:"Request Lock"}],z=m(),v=O(),d=p();if(z)h.splice(1,0,...[{id:"block",label:"Block"},{id:"duration",label:"Duration"},{id:"acb",label:"ACB"},{id:"abao",label:"AB/AO"},{id:"ntp",label:"NTP"},{id:"nem",label:"NEM"}]);return{columns:h,selectedRows:[],topButtonActions:{copied:!1,fetched:!1},isAdmin:z,isCheckuser:v,isClerk:d,popovers:{all:{open:!1},row:{anchor:null,open:!1,tagIndex:0,rowId:null},clipboardTag:null},cdxIconCopy:r1,cdxIconDownload:s2,cdxIconTrash:z1,cdxIconUserAvatar:t1,cdxIconUserAvatarOutline:e1}},computed:{selectAll(){return this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)},allowLockOption(){return this.accounts.some((h)=>h.block.lock&&!a(h.username)&&!this.userLocks.get(h.username))}},methods:{isNonRegisteredAccount:a,isSockmasterTag:F1,setAllValue(h){let z=this.getTargetRows().filter((v)=>!this.isInputDisabled(v,h));return z.length>0&&z.every((v)=>v.block[h])},setAllIndeterminate(h){let z=this.getTargetRows().filter((d)=>!this.isInputDisabled(d,h)),v=z.filter((d)=>d.block[h]).length;return v>0&&v<z.length},isInputDisabled(h,z){return z0(h,z,this.blockOptions,this.userBlocks,this.userLocks,this.getTargetRows())},async copySocks(){if(this.selectedRows.length===0)return;let h="{{sock list",z=0;this.selectedRows.forEach((v)=>{let d=this.accounts[v];if(!d)return;h+=`|${++z}=${d.username}`}),h+="}}",await navigator.clipboard.writeText(h),this.topButtonActions.copied=!0},onMessageDismissed(h){setTimeout(()=>{this.topButtonActions[h]=!1},200)},removeSocks(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},addDefaultRow(){this.$emit("addRow")},handleSelectAll(h){if(this.selectAllIndeterminate=!1,h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,z){this.$emit("userSelected",h,z.id)},setAllBlockFields(h,z){for(let v of this.getTargetRows()){if(this.isInputDisabled(v,h))continue;v.block[h]=z}},setAllTags(h){for(let z of this.getTargetRows()){if(a(z.username))continue;z.block.tags=[h.clone()]}},getTargetRows(){if(this.selectedRows.length===0)return this.accounts;let h=new Set(this.selectedRows);return this.accounts.filter((z,v)=>h.has(v))},fetchSocks(){this.topButtonActions.fetched=!0,this.$emit("fetchRows")},showTagPopover(h,z,v,d){let M=v!==this.popovers.row.rowId||z!==this.popovers.row.tagIndex;if(this.popovers.row.tagIndex=z,this.popovers.row.rowId=v,this.popovers.row.anchor=d.currentTarget,M)this.popovers.row.open=!0,this.$refs.rowTagPopover.setTag(h);else this.popovers.row.open=!this.popovers.row.open},handleTagUpdate(h){let z=this.accounts.find((v)=>v.id===this.popovers.row.rowId);if(!z){console.error("Could not find target row for tag update",this.popovers.row.rowId);return}z.block.tags.splice(this.popovers.row.tagIndex,1,h)},handleTagDelete(){let h=this.accounts.find((z)=>z.id===this.popovers.row.rowId);if(!h){console.error("Could not find target row for tag delete",this.popovers.row.rowId);return}h.block.tags.splice(this.popovers.row.tagIndex,1)},handleTagAdd(h){let z=this.accounts.find((d)=>d.id===h);if(!z)return console.error("Could not find target row for tag add",h),null;let v=new S({master:this.defaultMaster,status:"blocked"});return z.block.tags.push(v),v},getRowTagsWithDefault(h){if(h.length===0)return[null];else return h},handleTagAddAll(){for(let h of this.getTargetRows()){if(a(h.username))continue;h.block.tags.push(new S({master:this.defaultMaster,status:"blocked"}))}},handleTagDeleteAll(){for(let h of this.getTargetRows())h.block.tags.length=0},validateTag(h){return!(r(h)&&!h.master)}},template:`
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
  `});var L2=W({props:{enabled:{type:Boolean,required:!0},text:{type:String,required:!0},selectedSection:{type:Object,required:!0}},emits:["update:enabled","update:text"],data(){let h=p(),z=m(),v=O(),d=[{value:"takenote",label:"Note"}],M=[...X2],V=[...J2];if(v)d.unshift({value:"cunote",label:"CheckUser note"});if(z)d.unshift({value:"adminnote",label:"Administrator note"});if(h)d.unshift({value:"clerknote",label:"Clerk note"});let H=T0(F.custom.commentTemplates);return{isClerk:h,isAdmin:z,isCheckuser:v,noteTemplates:d,clerkTemplates:M,cuTemplates:V,customTemplates:H,loadingPreview:!1,htmlPreview:"",fullPreview:F.interface.fullPreview,cdxIconReload:s1}},computed:{commentBox(){return this.$refs.commentBox}},methods:{onEnable(h){if(this.$emit("update:enabled",h),h)this.$nextTick(()=>{this.commentBox.focus()})},onTextUpdate(h){this.$emit("update:text",h)},async updatePreview(){this.loadingPreview=!0;let h=N1(this.text);try{if(this.fullPreview&&this.selectedSection?.type==="specific"){let z=await E(this.selectedSection.section),v,d;if(this.isClerk||this.isAdmin)v=$1.exec(z)?.index,d=/\n*----(?!.*----)/s.exec(z)?.index;else v=/\s*====\s*<big>Comments by other users<\/big>\s*====\s*/i.exec(z)?.index,d=$1.exec(z)?.index;let M=z.slice(v??0,d??0).trim()+`
`+h;this.htmlPreview=await G0(l.pageName,M)}else this.htmlPreview=await G0(l.pageName,h)}finally{this.loadingPreview=!1}},insertNote(h){let z=this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i,"* {{"+h+"}} ");this.$emit("update:text",z),this.commentBox.focus()},insertText(h){h=`{{${h.replace(/^{+|}+$/g,"")}}}`;let z=this.commentBox.$el.querySelector("textarea");if(!z){console.error("commentAction: Unable to find textarea");return}let{selectionStart:v,selectionEnd:d}=z,M=this.text;if(v||v===0)M=M.slice(0,v)+h+M.slice(d,M.length),z.selectionStart=v+h.length,z.selectionEnd=d+h.length;else M+=h;this.$emit("update:text",M),this.commentBox.focus()}},template:`
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
  `});var f2=W({props:{enabled:{type:Boolean,required:!0},oldStatus:{type:String,required:!0},newStatus:{type:String,required:!0}},emits:["update:enabled","update:newStatus"],computed:{selected:{get(){let h=this.caseStatusItems.flatMap((v)=>E1(v)?v.items:[v]);if(this.newStatus==="nochange")return h.some((d)=>d.value===this.oldStatus)?this.oldStatus:"nochange";return h.some((v)=>v.value===this.newStatus)?this.newStatus:"nochange"},set(h){if(h===null)return;this.$emit("update:newStatus",String(h))}},caseStatusItems(){let h=[],z=[],v=[],d=[],M=O(),V=p(),H=/^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.oldStatus),c=/^endorsed?$/i.test(this.oldStatus),L=/^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclin(ed)?)$/i.test(this.oldStatus),f=`No change (${this.oldStatus})`;if(h.push({label:f,value:"nochange"}),H1.test(this.oldStatus))h.push({label:"Reopen",value:"reopen"});else h.push({label:"Open",value:"open"});if(h.push({label:"Close",value:"closed"}),v.push({label:"Request CheckUser",value:"CUrequest"}),M)v.push({label:"Check in progress",value:"inprogress"});if(V){if(v.push({label:"Request and self-endorse",value:"selfendorse"}),z.push({label:"Request more information",value:"moreinfo"}),M)v.push({label:"Mark as checked",value:"checked"});if(L)v.push({label:"Relist for another check",value:"relist"})}if(V){if(H){if(M)v.push({label:"Endorse CheckUser",value:"cuendorse"}),v.push({label:"Decline CheckUser",value:"cudecline"});else v.push({label:"Endorse for CheckUser attention",value:"endorse"}),v.push({label:"Decline CheckUser",value:"decline"});z.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}else if(c){if(O())v.push({label:"Decline CheckUser",value:"cudecline"});else v.push({label:"Decline CheckUser",value:"decline"});z.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}}if(z.push({label:"Place case on CU hold",value:"cuhold"}),z.push({label:"Place case on hold",value:"hold"}),d.push({label:"Request clerk action",value:"clerk"}),m()||V)d.push({label:"Request admin action",value:"admin"});let A=[z.length?{label:"Clerking",items:z}:null,v.length?{label:"CheckUser",items:v}:null,d.length?{label:"Deferral",items:d}:null].filter((q)=>q!==null);return[...h,...A]}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
    </action-container>
  `});var F0=W({props:{accounts:{type:Array,required:!0},caseName:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","removeRows","addRow","userSelected","usernameChanged"],data(){let h=[{id:"username",label:"Username"},{id:"analyser",label:"Interaction Analyser"},{id:"timeline",label:"Timeline"},{id:"timecard",label:"Timecard"},{id:"pages",label:"Pages"},{id:"summary",label:"Summaries"},{id:"cuwiki",label:"CU wiki"},{id:"interleaved",label:"Interleaved"}],z=h.slice(1);return{columns:h,optionColumns:z,selectedRows:[],cdxIconAdd:Z1,cdxIconTrash:z1}},computed:{columnState(){let h=this.accounts,z={};for(let v of this.optionColumns){if(h.length===0){z[v.id]={checked:!1,indeterminate:!1};continue}let d=h.map((H)=>H.link[v.id]),M=d.every(Boolean),V=d.every((H)=>!H);z[v.id]={checked:M,indeterminate:!M&&!V}}return z},allColumnsChecked(){return this.accounts.length>0&&this.optionColumns.every((h)=>this.columnState[h.id].checked)},allColumnsIndeterminate(){let h=this.optionColumns.filter((z)=>this.columnState[z.id].checked).length;return h>0&&h<this.optionColumns.length},linkItems(){let h={};for(let z of this.optionColumns){let v=this.getLinkFormat(z.id);if(v===null){console.error("Couldn't find link format for",z.id);continue}let d=v.baseUrl(this.caseName);if(v.startingParams)for(let[V,H]of v.startingParams)d.searchParams.set(V,H);let M=this.accounts.reduce((V,H)=>{if(H.link[z.id])V.push(v.userQueryStringWrapper+H.username+v.userQueryStringWrapper);return V},[]);if(M.length===0)continue;if(v.multipleUserQueryStringKeys)for(let V of M)d.searchParams.append(v.userQueryStringKey,V);else d.searchParams.set(v.userQueryStringKey,M.join(v.userQueryStringSeparator));h[z.id]={url:d,label:z.label}}return h},selectAll(){return this.accounts.length>0&&this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)}},watch:{selectedRows(h,z){let v=new Set(z),d=new Set(h),M=(V,H)=>{let c=this.accounts[V];if(c)this.toggleRow(c,H)};for(let V of d)if(!v.has(V))M(V,!0);for(let V of v)if(!d.has(V))M(V,!1)}},methods:{handleSelectAll(h){if(h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,z){this.$emit("userSelected",h,z.id)},addDefaultRow(){this.$emit("addRow")},removeRows(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},toggleColumn(h,z){for(let v of this.accounts)v.link[h]=z},toggleAllColumns(h){for(let z of this.optionColumns)this.toggleColumn(z.id,h)},toggleRow(h,z){for(let v of this.optionColumns)h.link[v.id]=z},getLinkFormat(h){switch(h){case"analyser":return i.editorInteractionAnalyser;case"cuwiki":return i.checkUserWikiSearch;case"interleaved":return i.interleaved;case"pages":return i.sandals.pages;case"summary":return i.sandals.summaries;case"timecard":return i.sandals.timecard;case"timeline":return i.sandals.consolidatedTimeline;default:return null}}},template:`
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
  `});var F2=W({props:{enabled:{type:Boolean,required:!0},flags:{type:Set,required:!0}},emits:["update:enabled","update:flags"],data(){return{archiveNoticeFlags:[{value:"crosswiki",label:"Cross-wiki"},{value:"deny",label:"Deny"},{value:"notalk",label:"No talkpage access"},{value:"moot",label:"Moot"}]}},computed:{internalFlags:{get(){return Array.from(this.flags)},set(h){this.$emit("update:flags",new Set(h))}}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
    </action-container>
  `});var l2=W({props:{enabled:{type:Boolean,required:!0},target:{type:String,required:!0},suppress:{type:Boolean,required:!0},addNote:{type:Boolean,required:!0},selection:{type:Object,required:!0},archiveEnabled:{type:Boolean,required:!0}},emits:["update:enabled","update:target","update:suppress","update:addNote","moveEntireCase"],data(){return{canSuppressRedirect:G1()}},computed:{isSectionMove(){return this.selectionType==="specific"},moveTitle(){if(!this.selection)return"ERROR";if(this.selection.type==="all")return"entire case";return"section "+this.selection.section.name},disabled(){return this.archiveEnabled},selectionType(){return this.selection?.type??null}},watch:{archiveEnabled:{handler(h){if(h)this.$emit("update:enabled",!1)},immediate:!0}},template:`
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
  `});var A2=W({props:{allSections:{type:Array,required:!0},selectedSection:{type:Object,required:!0}},emits:["update-section-selection"],data(){return{menuPointerOverHandler:null,menuPointerLeaveHandler:null,menuFocusInHandler:null,activeSectionId:null,overlayType:null}},computed:{canJumpToSelectedSection(){return this.selectedSection!==null&&this.selectedSection!=="all"},sectionSelectElement(){return this.$refs.sectionSelect.$el},menuItems(){let h=this.allSections.map((z)=>({value:z.id,label:z.name}));return h.push({value:"all",label:"All Sections"}),h}},mounted(){if(!F.highlightSection)return;this.menuPointerOverHandler=(h)=>{this.handlePreviewEvent(h)},this.menuPointerLeaveHandler=()=>{if(this.overlayType==="preview")this.clearSectionHighlight()},this.menuFocusInHandler=(h)=>{this.handlePreviewEvent(h)},this.sectionSelectElement.addEventListener("pointerover",this.menuPointerOverHandler),this.sectionSelectElement.addEventListener("pointerleave",this.menuPointerLeaveHandler),this.sectionSelectElement.addEventListener("focusin",this.menuFocusInHandler)},beforeUnmount(){if(this.menuPointerOverHandler)this.sectionSelectElement.removeEventListener("pointerover",this.menuPointerOverHandler);if(this.menuPointerLeaveHandler)this.sectionSelectElement.removeEventListener("pointerleave",this.menuPointerLeaveHandler);if(this.menuFocusInHandler)this.sectionSelectElement.removeEventListener("focusin",this.menuFocusInHandler);this.clearSectionHighlight()},methods:{handleUpdateSectionSelection(h){if(F.highlightSection){if(h==="all")this.clearSectionHighlight();else if(typeof h==="number")this.renderSectionOverlay(h,"selected")}this.$emit("update-section-selection",h)},jumpToSelectedSection(){if(!this.canJumpToSelectedSection)return;if(this.selectedSection===null||this.selectedSection==="all")return;_5(this.selectedSection)},renderSectionOverlay(h,z){this.overlayType=z,L0(h,z)},clearSectionHighlight(){C1()},handlePreviewEvent(h){let z=h.target;if(!(z instanceof HTMLElement))return;let v=z.closest(".cdx-menu-item");if(!v)return;let d=D5(v,this.menuItems);if(d===null){this.activeSectionId=null,this.clearSectionHighlight();return}if(d!==this.activeSectionId)this.renderSectionOverlay(d,"preview")}},template:`
    <!-- Sections special case -->
    <div class="spiHelper-section-selector">
      <cdx-select :menu-items="menuItems" :selected="selectedSection"
                  @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
      <cdx-button weight="normal" :disabled="!canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
    </div>
  `});var x1=W({inheritAttrs:!1,props:{modelValue:{type:String,required:!1,default:""},label:{type:String,required:!1,default:""},touched:{type:Boolean,default:!1},shortened:{type:Boolean,default:!1},autoDismiss:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:touched"],data(){return{messages:{warning:this.shortened?"Invalid":"Expiry option is invalid",success:this.shortened?"Valid":"Valid expiry option"},showSuccess:!this.autoDismiss,internalTouched:this.touched,successTimeout:null}},computed:{valid(){return L1(this.modelValue)!==null},status(){if(this.disabled||!this.internalTouched)return"default";if(this.valid)return this.showSuccess?"success":"default";else return"warning"}},watch:{modelValue(){if(this.internalTouched=!0,!this.autoDismiss)return;if(this.successTimeout)clearTimeout(this.successTimeout);if(this.valid)this.showSuccess=!0,this.successTimeout=window.setTimeout(()=>{this.showSuccess=!1},3000)},internalTouched(h){this.$emit("update:touched",h)}},beforeUnmount(){if(this.successTimeout)clearTimeout(this.successTimeout)},template:`
    <cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="modelValue" :disabled="disabled" v-bind="$attrs" />
    </cdx-field>
  `});var B5=10,p1=W({props:{modelValue:{type:String,required:!0},placeholder:{type:String,default:"Page"},label:{type:String,default:null},description:{type:String,default:null},namespace:{type:Number,required:!0},prefix:{type:String,default:""},validateMessage:{type:Boolean,default:!0}},emits:["update:modelValue"],data(){let h={visibleItemLimit:6,searchQuery:""};return{lookupStatus:"default",messages:{success:"Page exists",warning:"Page not found"},pageSuggestions:[],useLookup:F.useLookup,selection:null,menuConfig:h}},computed:{pagename:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}},fullPagename(){return`${this.prefix}${this.pagename}`}},methods:{async onUpdateInputValue(h){if(this.menuConfig.searchQuery=h,!h){this.pageSuggestions=[];return}await this.$nextTick(),I0(this.fullPagename,this.namespace,B5).then((z)=>{if(this.pagename!==h)return;if(z.length===0){this.pageSuggestions=[];return}this.pageSuggestions=z.filter((v)=>!v.title.includes("/Archive")).map((v)=>({label:this.stripTitle(v.title),value:v.pageid.toString()}))}).catch(()=>{this.pageSuggestions=[]})},onLoadMore(){if(!this.pagename)return;I0(this.fullPagename,this.namespace,this.pageSuggestions.length+B5).then((h)=>{if(h.length===0)return;this.pageSuggestions=h.filter((z)=>!z.title.includes("/Archive")).map((z)=>({label:this.stripTitle(z.title),value:z.pageid.toString()}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.pagename.length===0){this.lookupStatus="default";return}let h=this.pageSuggestions.find((z)=>z.label===this.pagename)??null;if(h!==null)this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null)this.lookupStatus="success"},stripTitle(h){if(this.prefix)return h.split(this.prefix)[1]??h;if(this.namespace===0)return h;return h.split(":")[1]??h}},template:`
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
  `});var l0=W({props:{lockComment:{type:String,required:!0},skipCUVerifyUsers:{type:Set,required:!0},actionName:{type:String,required:!0},checkConflict:{type:Boolean,required:!0},state:{type:Object,required:!0},accounts:{type:Array,required:!0},caseActions:{type:Object,required:!0},allDisabled:{type:Boolean,required:!0}},emits:["update:lockComment","update:skipCUVerifyUsers","onSubmit"],data(){return{popover:{show:!1,revId:0,cancelAction:{label:"Cancel"},continueAction:{label:"Continue",actionType:"progressive"}},submitElement:null,cdxIconUpdate:d5}},computed:{effectiveStatus(){let h=this.caseActions.status.data;return this.caseActions.status.enabled&&h.new!=="nochange"?h.new:h.old},needsLockComment(){let h=this.caseActions.block;if(!h.enabled)return!1;return this.accounts.some((z)=>z.block.lock&&!a(z.username)&&h.data.userLocks.get(z.username)!==!0)},hasInvalidTag(){if(!this.caseActions.block.enabled)return!1;return this.accounts.some((z)=>z.block.tags.some((v)=>r(v)&&!v.master))},hasInvalidMove(){let h=this.caseActions.move;return h.enabled&&!h.data.target},hasInvalidDuration(){let h=this.caseActions.block;if(!h.enabled)return!1;let{options:z,userBlocks:v,userLocks:d}=h.data;return this.accounts.some((M)=>!z0(M,"duration",z,v,d,this.accounts)&&L1(M.block.duration)===null)},statusTemplateMismatch(){let h=this.caseActions.comment;if(!h.enabled)return null;let z=z2(h.data.text,this.effectiveStatus);if(!z)return null;return z.kind==="template"?`{{${z.match}}}`:`the word "${z.match}"`},blockClaimTemplateWithoutBlock(){if(!this.caseActions.comment.enabled)return null;let h=new Set(T(this.caseActions.comment.data.text).map((V)=>V.name)),v=["bnt","btc","bwt","sblock","ipblock"].find((V)=>h.has(V));if(!v)return null;return this.caseActions.block.enabled&&this.accounts.some((V)=>V.block.block)?null:`{{${v}}}`},cuBlockConfirmationsNeeded(){let h=this.caseActions.block.data,z=new Set;if(O()||!this.caseActions.block.enabled||!h.options.override||!h.options.noBlock)return z;for(let v of this.accounts){if(!v.block.block)continue;let d=h.userBlocks.get(v.username)?.reason;if(d&&m1.exec(d))z.add(v.username)}return z},cuBlockOverrideChecked:{get(){return this.skipCUVerifyUsers.size===this.cuBlockConfirmationsNeeded.size},set(h){this.$emit("update:skipCUVerifyUsers",h?this.cuBlockConfirmationsNeeded:new Set)}},cuBlockOverrideIndeterminate(){let h=this.skipCUVerifyUsers.size;return h>0&&h<this.cuBlockConfirmationsNeeded.size},disableButton(){return l1(this.actionName)||this.allDisabled||this.hasInvalidTag||this.hasInvalidMove||this.hasInvalidDuration},lockCommentValue:{get(){return this.lockComment},set(h){this.$emit("update:lockComment",h)}}},mounted(){this.submitElement=this.$refs.submitElement},methods:{async onSubmit(){if(this.disableButton)return;if(this.checkConflict)if(this.popover.revId=await w1(l.pageName),this.popover.revId===l.startingRevId)this.$emit("onSubmit");else this.popover.show=!0;else this.$emit("onSubmit")},confirmSubmit(){this.popover.show=!1,l.startingRevId=this.popover.revId,this.state.selectedSection?.type==="specific"?E(this.state.selectedSection.section,{purge:!0}):w(this.state,{purge:!0}),this.$emit("onSubmit")}},template:`
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
  `});var A0=W({props:{open:{type:Boolean,required:!0},anchor:{type:Object,required:!0},clipboardTag:{type:Object,required:!0},defaultMaster:{type:String,required:!0}},emits:{"update:open":(h)=>!0,saveTag:(h)=>!0,addTag:()=>!0,copyTag:(h)=>!0,deleteTag:()=>!0},data(){let h=[{value:"blocked",label:"Suspected"},{value:"proven",label:"Proven"},{value:"confirmed",label:"Confirmed"}],z=[{value:"blocked",label:"Blocked"},{value:"confirmed",label:"Confirmed"},{value:"banned",label:"3X Banned"}],v=[{value:"suspected",label:"Suspected"},{value:"proven",label:"Proven"}],d={tag:"none",altmaster:"none"},M=[{value:"sock",label:"Sockpuppet",icon:e1},{value:"master",label:"Sockmaster",icon:t1}],V=null;return{sockTags:h,masterTags:z,altmasterTags:v,allTagSelections:d,tagCategoryButtons:M,temporaryTag:null,icons:{cdxIconAdd:Z1,cdxIconCopy:r1,cdxIconPaste:v5,cdxIconTrash:z1}}},computed:{openValue:{get(){return this.open},set(h){this.$emit("update:open",h)}},tagCategory:{get(){if(this.temporaryTag===null)return null;return r(this.temporaryTag)?"sock":"master"},set(h){if(h==="sock")this.temporaryTag=new S({status:"blocked",master:this.defaultMaster,evidence:this.temporaryTag?.evidence});else this.temporaryTag=new s({status:"blocked",evidence:this.temporaryTag?.evidence})}}},methods:{setTag(h){this.temporaryTag=h?h.clone():null},handleSave(){if(this.temporaryTag===null){console.error("No tag to save");return}this.$emit("saveTag",this.temporaryTag),this.openValue=!1},handleCancel(){this.openValue=!1},handleDeleteTag(){this.$emit("deleteTag"),this.openValue=!1},handleCopyTag(){if(!this.temporaryTag)return;this.$emit("copyTag",this.temporaryTag)},handlePasteTag(){if(!this.clipboardTag)return;this.temporaryTag=this.clipboardTag.clone()},handleAddTag(){this.$emit("addTag"),this.openValue=!1}},template:`
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
  `});var q2=W({props:{state:{type:Object,required:!0},activateButton:{type:Object,required:!0}},data(){return{activateHandler:null,open:!1,archiving:!1,messages:R}},mounted(){this.activateHandler=()=>{R.length=0,this.open=!0,this.archiving=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"oca"}),Y5(this.state).then(()=>{this.archiving=!1},()=>{})},this.activateButton.addEventListener("click",this.activateHandler)},beforeUnmount(){if(this.activateHandler)this.activateButton.removeEventListener("click",this.activateHandler)},template:`
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
  `});var Z3=/\[\[(?:Wikipedia|WP):(?:Sockpuppet investigations|SPI)\/([^\]]+)/i,Z2=W({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},defaultCase:{type:String,required:!1,default:""},view:{type:String,required:!0}},data(){return{open:!1,openHandler:null,beforeUnloadHandler:null,caseLoaded:!1,caseLoading:!1,targetCase:this.defaultCase,blockData:S1(),accounts:[],actionsRunning:!1,unpinned:!F.interface.pinned,messages:R,cdxIconFeedback:y1,cdxIconPushPin:i1}},computed:{mountPoint(){return this.$el.parentElement},pageName(){return`Wikipedia:Sockpuppet investigations/${this.targetCase}`},caseActions(){return{block:{enabled:!0,data:this.blockData},move:{enabled:!1}}}},watch:{unpinned(h){if(!this.mountPoint){console.error("AlternateView unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");F.interface.pinned=!h}},mounted(){if(!this.mountPoint){console.error("AlternateViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.beforeUnloadHandler=(h)=>{if(T1("alternateActions")!=="success")h.preventDefault()},this.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"alternate"}),!this.caseLoaded)switch(this.view){case"category":this.initialiseCategoryView();break;case"checkuser":this.initialiseCheckUserView();break;case"si":this.initialiseSIView();break}}if(this.beforeUnloadHandler)if(this.open)window.addEventListener("beforeunload",this.beforeUnloadHandler);else window.removeEventListener("beforeunload",this.beforeUnloadHandler)},this.openButton.addEventListener("click",this.openHandler)},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler);if(this.beforeUnloadHandler)window.removeEventListener("beforeunload",this.beforeUnloadHandler)},methods:{handleUserSelected(h,z){let v=this.accounts.find((d)=>d.id===z);if(!v)return;if(h.blockid!==void 0&&!this.blockData.userBlocks.has(v.username)){let d=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.blockData.userBlocks.set(v.username,{username:v.username,duration:h.blockexpiry??"",abao:d??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}V0(h,v)},handleAddRow(h){h??=V1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((z)=>!h.includes(z.id))},async handleFetchRows(){let h;try{h=await navigator.clipboard.readText()}catch(V){if(console.error("handleFetchRows failed to read clipboard:",V),V instanceof DOMException&&V.name==="NotAllowedError")new Z({type:"warning",content:"Failed to read clipboard. You may need to press 'paste' in the confirmation popup"}).show();return}let[z,v]=U1({text:h,fullSearch:!1,state:this.state}),d=new Set(z),M=[...z,...v].map((V)=>a1({userRow:V,defaultBlock:d.has(V)}));this.massAddUserRows(M)},massAddUserRows(h){let z=new Set(this.accounts.map((v)=>v.username));h.forEach((v)=>{if(!z.has(v.username))this.handleAddRow(v)})},async loadCase(h){if(this.caseLoading=!0,n1(this.pageName,"alternate"),this.targetCase){let z=await b1({page:this.pageName,state:this.state});if(l.valid=z!==null,z===null)this.state.archiveNotice=new u({username:this.targetCase});else this.state.archiveNotice=z;if(h){let v=await O2(this.targetCase);if(v!==null)this.blockData.userBlocks.set(this.targetCase,v);let d=await K(`User:${this.targetCase}`,!1),{userRow:M,isLocked:V}=await h0({userRow:M1(this.targetCase,this.state),block:v,userPage:d,defaultBlock:!0,checkLock:!1,state:this.state});if(V!==null)this.blockData.userLocks.set(this.targetCase,V);let H=this.accounts.findIndex((c)=>c.username===M.username);if(H===-1)this.accounts.splice(0,0,M);else this.accounts.splice(H,1,M)}}else l.valid=!1;this.blockData.master=this.targetCase,this.caseLoading=!1,this.caseLoaded=!0},async onSubmitActions(){if(l1("alternateActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"alternate"}),x("alternateActions"),this.actionsRunning=!0;let h=[],z=[],v=[],d=Promise.resolve([]);({blockPromises:h,tagPromises:z,talkNoticePromises:v,lockPromise:d}=await M2({accounts:this.accounts,blockData:this.blockData}));let M=Promise.all([Promise.all(h),Promise.all(z),d]),V=Promise.all(v),[H,c,L]=await M;if(await V,F.log.enabled){let f=`* [[:User:${l.userName}]]`+R1({blockedUsers:H,taggedUsers:c,lockedUsers:L});await O1(f)}new Z({type:"success",content:"Done!"}).show(),D("alternateActions","success"),this.actionsRunning=!1},async initialiseCategoryView(){if(this.defaultCase===""||this.caseLoading||this.caseLoaded)return;let[,h,z]=await Promise.all([this.loadCase(!1),x0(`Category:Suspected Wikipedia sockpuppets of ${this.targetCase}`),x0(`Category:Wikipedia sockpuppets of ${this.targetCase}`)]),v=(c,L)=>{let f={...M1(c.replace("User:",""),this.state)};return f.block.block=L,f},d=[...z,`User:${this.targetCase}`].map((c)=>v(c,!0)),M=h.map((c)=>v(c,!1)),V=new Set([...d,...M].map((c)=>c.username)),H=await W1({likelySocks:d,possibleSocks:M,allUsernames:V,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(H)},initialiseCheckUserView(){let h=$("form#checkuserform",document),z=$("#checkreason input",h).val();if(typeof z==="string"){let d=Z3.exec(z)?.[1];if(d){this.targetCase=d;return}}let v=$("#checktarget input",h).val();if(typeof v==="string"){if(!mw.util.isIPAddress(v,!0))this.targetCase=v}},async initialiseSIView(){let h=[],z=new Set,d=$("ul.mw-checkuser-suggestedinvestigations-users",document).find("li > a.mw-userlink > bdi");for(let V of d){let H=k($(V).text());if(z.has(H))continue;h.push(M1(H,this.state)),z.add(H)}if(h.length>0&&h[0])this.targetCase=h[0].username;let M=await W1({likelySocks:h,possibleSocks:[],allUsernames:z,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(M)},launchFeedback(){let h=this.view.charAt(0).toUpperCase()+this.view.slice(1);this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`${h} form v${P}-${C}`})}},template:`
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
  `});var y2=W({props:{unseenChanges:{type:Array,required:!0},openState:{type:Object,required:!0}},data(){return{beta:C!=="production"}},methods:{onClose(){this.openState.isOpen=!1,this.$emit("dismissed")},resolveDate(h){if(typeof h==="string")return h;return this.beta?h.beta:h.stable}},template:`
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
    </cdx-dialog>`});async function y3(){let h=S2(),z={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",pageids:82598459,formatversion:"2"};try{let d=(await h.get(z)).query.pages[0]?.revisions?.[0]?.slots.main.content;if(d)return JSON.parse(d)}catch(v){console.error("getChangelog fetch error:",v)}return{}}async function U5(h){let z=await y3();return Object.entries(z).filter(([v])=>G5(v,h)).sort(([v],[d])=>G5(v,d)?-1:1)}function G5(h,z){let v=h.split(".").map(Number),d=z.split(".").map(Number);for(let M=0;M<3;M++){if((v[M]??0)>(d[M]??0))return!0;if((v[M]??0)<(d[M]??0))return!1}return!1}var a5=W({template:`
    <cdx-toast-container />
    `});if(mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/")&&!mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/SPI/"))q0("spi");else if(mw.config.get("wgCanonicalSpecialPageName")==="CheckUser")q0("checkuser");else if(mw.config.get("wgCanonicalSpecialPageName")==="SuggestedInvestigations"&&mw.config.get("wgPageName").includes("/detail/"))q0("si");else if(mw.config.get("wgNamespaceNumber")===14&&["Suspected Wikipedia sockpuppets","Wikipedia sockpuppets"].some((h)=>mw.config.get("wgCategories").includes(h)))q0("category");function q0(h){mw.loader.using(["vue","@wikimedia/codex","mediawiki.api","mediawiki.util","mediawiki.user","mediawiki.feedback"],(z)=>{let v=z("vue"),d=z("@wikimedia/codex");V5(v.toRaw);let M=new mw.Feedback(Y2);if(C==="live")mw.loader.load("http://localhost:8080/spihelper.css","text/css");else if(C==="dev")importStylesheet("User:DatGuy/spihelper.dev.css");else importStylesheet("User:DatGuy/spihelper.css");let V,H=v.reactive(new m0);if(h==="spi"){let A=mw.config.get("wgPageName");n1(A),q1(H)}else if(h==="category"){if(V=/Category:(?:Suspected )?Wikipedia sockpuppets of (.*)/.exec(mw.config.get("wgPageName").replaceAll("_"," ")),!V?.[1])return}let c=S0();if(c)Object.assign(F,c);else(async()=>{await u0(),h1()})();$3(v,d);let L=v.reactive({isOpen:!1});if(F.lastSeenVersion!==P)U5(F.lastSeenVersion).then((A)=>{let q=document.createElement("div");q.style.position="absolute",mw.util.$content.prepend(q);let b=v.createMwApp(y2,{unseenChanges:A,openState:L,onDismissed:async()=>{F.lastSeenVersion=P,await h1(),b.unmount(),q.remove()}}).component("cdx-button",d.CdxButton).component("cdx-dialog",d.CdxDialog).component("cdx-message",d.CdxMessage);b.mount(q)},()=>{});let f=mw.util.addPortletLink("p-cactions","#",C==="production"?"SPI":"SPI-Beta","ca-spiHelper","Run spiHelper");if(f){let A=document.createElement("div");switch(A.setAttribute("id","spiHelper-vue-mount-point"),mw.util.$content.prepend(A),f.addEventListener("click",()=>{L.isOpen=!0}),h){case"spi":{v.createMwApp(H2,{state:H,feedbackDialog:M,openButton:f}).component("cdx-tabs",d.CdxTabs).component("cdx-tab",d.CdxTab).component("cdx-select",d.CdxSelect).component("cdx-card",d.CdxCard).component("cdx-toggle-switch",d.CdxToggleSwitch).component("cdx-text-area",d.CdxTextArea).component("cdx-toggle-button",d.CdxToggleButton).component("cdx-toggle-button-group",d.CdxToggleButtonGroup).component("cdx-button",d.CdxButton).component("cdx-button-group",d.CdxButtonGroup).component("cdx-icon",d.CdxIcon).component("cdx-table",d.CdxTable).component("cdx-text-input",d.CdxTextInput).component("cdx-checkbox",d.CdxCheckbox).component("cdx-lookup",d.CdxLookup).component("cdx-field",d.CdxField).component("cdx-message",d.CdxMessage).component("cdx-progress-bar",d.CdxProgressBar).component("cdx-progress-indicator",d.CdxProgressIndicator).component("cdx-accordion",d.CdxAccordion).component("cdx-label",d.CdxLabel).component("cdx-popover",d.CdxPopover).component("action-accordion",n0).component("action-button",o0).component("action-container",r0).component("action-content",i0).component("submit-form",l0).component("comment-action",L2).component("change-status-action",f2).component("block-action",f0).component("link-action",F0).component("management-action",F2).component("archive-action",c2).component("move-action",l2).component("section-action",A2).component("user-lookup",H0).component("page-lookup",p1).component("expiry-input",x1).component("tag-popover",A0).directive("tooltip",d.CdxTooltip).mount(A);break}case"checkuser":case"category":case"si":{v.createMwApp(Z2,{state:H,feedbackDialog:M,openButton:f,view:h,...h==="category"?{defaultCase:V?.[1]??""}:{}}).component("cdx-button",d.CdxButton).component("cdx-checkbox",d.CdxCheckbox).component("cdx-field",d.CdxField).component("cdx-icon",d.CdxIcon).component("cdx-label",d.CdxLabel).component("cdx-lookup",d.CdxLookup).component("cdx-message",d.CdxMessage).component("cdx-popover",d.CdxPopover).component("cdx-progress-indicator",d.CdxProgressIndicator).component("cdx-select",d.CdxSelect).component("cdx-table",d.CdxTable).component("cdx-text-area",d.CdxTextArea).component("cdx-text-input",d.CdxTextInput).component("cdx-toggle-button-group",d.CdxToggleButtonGroup).component("submit-form",l0).component("block-action",f0).component("link-action",F0).component("user-lookup",H0).component("page-lookup",p1).component("expiry-input",x1).component("tag-popover",A0).directive("tooltip",d.CdxTooltip).mount(A);break}}}if(b3(v,d,M),mw.config.get("wgCategories").includes("SPI cases awaiting archive")&&p())W3(v,d,H);window.addEventListener("beforeunload",(A)=>{if(E2())A.preventDefault()})})}function b3(h,z,v){let d=mw.util.addPortletLink("p-cactions","#",C==="production"?"SPI-Options":"SPI-Beta-Options","ca-spiHelperOpts","Modify spiHelper settings");if(d){let M=document.body.appendChild(document.createElement("div"));h.createMwApp(H5,{feedbackDialog:v,openButton:d,toaster:z.useToast()}).component("cdx-button",z.CdxButton).component("cdx-dialog",z.CdxDialog).component("cdx-field",z.CdxField).component("cdx-lookup",z.CdxLookup).component("cdx-select",z.CdxSelect).component("cdx-toggle-switch",z.CdxToggleSwitch).component("cdx-accordion",z.CdxAccordion).component("cdx-text-input",z.CdxTextInput).component("cdx-icon",z.CdxIcon).component("cdx-message",z.CdxMessage).component("cdx-multiselect-lookup",z.CdxMultiselectLookup).component("watch-setting",N0).component("expiry-setting",R0).component("expiry-input",x1).component("log-page-setting",P0).component("page-lookup",p1).mount(M)}}function W3(h,z,v){let d=mw.util.addPortletLink("p-cactions","#",C==="production"?"SPI-Archive":"SPI-Beta-Archive","ca-spiHelperArchive","Run one click archival");if(d){let M=document.body.appendChild(document.createElement("div"));h.createMwApp(q2,{state:v,activateButton:d}).component("cdx-dialog",z.CdxDialog).component("cdx-message",z.CdxMessage).component("cdx-progress-bar",z.CdxProgressBar).mount(M)}}function $3(h,z){let v=h.createMwApp(a5).component("cdx-toast-container",z.CdxToastContainer),d=document.body.appendChild(document.createElement("div"));v.mount(d)}})();

// </nowiki>
