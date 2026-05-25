// {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=refs/heads/build/stable|path=spihelper.js}}
// v3.2.4
// <nowiki>
'use strict';
(()=>{var t={editorInteractionAnalyser:{baseUrl:(h)=>new URL("https://sigma.toolforge.org/editorinteract.py"),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},interactionTimeline:{baseUrl:(h)=>new URL("https://interaction-timeline.toolforge.org"),startingParams:new URLSearchParams("wiki=enwiki"),userQueryStringKey:"user",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},SPITools:{timecard:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timecard/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},consolidatedTimeline:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/timeline/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0},pages:{baseUrl:(h)=>new URL("https://spi-tools.toolforge.org/spi/pages/"+h),userQueryStringKey:"users",userQueryStringSeparator:"&",userQueryStringWrapper:"",multipleUserQueryStringKeys:!0}},sandals:{timecard:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timecard"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},consolidatedTimeline:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/timeline"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},pages:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/pages"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1},summaries:{baseUrl:(h)=>new URL("https://sandals.toolforge.org/summaries"),userQueryStringKey:"users",userQueryStringSeparator:"|",userQueryStringWrapper:"",multipleUserQueryStringKeys:!1}},checkUserWikiSearch:{baseUrl:(h)=>new URL("https://checkuser.wikimedia.org/w/index.php"),startingParams:new URLSearchParams("ns0=1"),userQueryStringKey:"search",userQueryStringSeparator:" OR ",userQueryStringWrapper:'"',multipleUserQueryStringKeys:!1}};var n=/{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i,d1=/^closed?$/i,A0=/{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu-?)?endorse|inprogress|(?:cu\s?)?decline(?:-ip)?|(?:cu)?moreinfo|relisted|onhold)}}/i,H2=/====\s*Suspected sockpuppets\s*====\n*/i,y1=/\n*\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i,C1=/{{(checkuserblock(-account|-wide)?|checkuser block)}}/i,M1=/{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i,O1=/{{spipriorcases}}/i,e=/^(?:===[^=]*===|=====[^=]*=====)\s*$/m,f2=/\u200E/g,b0=/(?<!~)~~~~(?!~)/;var y0=" (using [[:w:en:WP:SPIH-D|SPIH-D]])",L2={title:new mw.Title("User talk:DatGuy/spihelper"),bugsLink:"//github.com/DatGuy1/spihelper/issues/new",showUseragentCheckbox:!0,useragentCheckboxMessage:"I want to share my user agent publicly alongside my feedback. This is optional."},u="3.2.4",C="production",q1={watch:{case:"preferences",archive:"nochange",tagged:"preferences",categories:"nochange",blocked:!0},expiry:{case:"indefinite",archive:"indefinite",tagged:"indefinite",categories:"indefinite",blocked:"indefinite"},log:{enabled:!1,reversed:!1,page:"spihelper_log"},clerk:!0,tickArchiveWhenCaseClosed:!1,useCheckuserblockAccount:mw.config.get("wgUserGroups")?.includes("checkuser")??!1,useLookup:!0,defaultActions:["comment"],interface:{defaultBlockDuration:"indefinite",displayIPv6As64:!0,fullPreview:!1,pinned:!0,buttonLayout:!1},highlightSection:!0,custom:{commentTemplates:[]},debug:{enabled:!1,forceCheckuser:!1,forceAdmin:!1},lastSeenVersion:"3.2.4"};var a2=[{label:"Results",items:[{value:"{{confirmed}}",label:"Confirmed"},{value:"{{confirmed-nc}}",label:"Confirmed, no comment for IPs"},{value:"{{tallyho}}",label:"Indistinguishable"},{value:"{{highly likely}}",label:"Highly likely"},{value:"{{likely}}",label:"Likely"},{value:"{{possilikely}}",label:"Possilikely"},{value:"{{possible}}",label:"Possible"},{value:"{{unlikely}}",label:"Unlikely"},{value:"{{unrelated}}",label:"Unrelated"},{value:"{{inconclusive}}",label:"Inconclusive"},{value:"{{IPstale}}",label:"Stale"}]},{label:"Addendums",items:[{value:"{{behav}}",label:"Needs behavioral evaluation"},{value:"{{nosleepers}}",label:"No sleepers"},{value:"{{ncip}}",label:"No comment for IPs"}]},{label:"Novelties",items:[{value:"{{8ball}} ",label:"Magic 8-Ball"},{value:"{{crystalball",label:"Not a crystal ball"},{value:"{{fishing}}",label:"Not fishing"},{value:"{{pixiedust}}",label:"Not pixie dust"}]}],F2=[{label:"Ducks",items:[{value:"{{duck}}",label:"Duck"},{value:"{{megaphone duck}}",label:"Megaphone duck"},{value:"{{megaphone duck|ultimate}}",label:"Ultimate duck"}]},{label:"Results",items:[{value:"{{IPblock}}",label:"IP blocked"},{value:"{{bnt}}",label:"Blocked and tagged"},{value:"{{bwt}}",label:"Blocked without tags"},{value:"{{sblock}}",label:"Blocked, awaiting tags"},{value:"{{btc}}",label:"Blocked, tagged, closed"},{value:"{{Action and close}}",label:"Requested actions completed, closing"},{value:"{{Closing without action}}",label:"Closing without action"}]},{label:"Other",items:[{value:"{{subst:DiffsNeeded|moreinfo}}",label:"Diffs needed"},{value:"{{GlobalLocksRequested}}",label:"Locks requested"},{value:"{{Decline-IP}}",label:"IP check declined"}]}];class y{type;content;isHtml;_index;constructor(h){this.type=h.type,this.content=h.content,this.isHtml=h.isHtml}show(){let h=R.length;return R.push(this),this._index=h,this}update(h){if(Object.assign(this,h),this._index===void 0)this.show();else R[this._index]=this;return this}}var R=[];mw.loader.using(["vue"],(h)=>{R=h("vue").reactive(R)});class S{username;crosswiki;deny;notalk;moot;constructor(h){this.username=h?.username??a.caseName,this.crosswiki=h?.crosswiki??!1,this.deny=h?.deny??!1,this.notalk=h?.notalk??!1,this.moot=h?.moot??!1}generateWikitext(){let h="{{SPI archive notice|1="+this.username;if(this.crosswiki)h+="|crosswiki=yes";if(this.deny)h+="|deny=yes";if(this.notalk)h+="|notalk=yes";if(this.moot)h+="|moot=yes";return h+="}}",h}}class P{master;status;locked;evidence;altmaster;altmasterStatus;constructor(h){this.master=h.master,this.status=h.status,this.locked=h.locked??!1,this.evidence=h.evidence??"",this.altmaster=h.altmaster??"",this.altmasterStatus=h.altmasterStatus}generateWikitext(h){let v="{{sockpuppet";if(v+=`
| 1 = ${this.master}`,v+=`
| 2 = ${this.status}`,this.locked)v+=`
| locked = yes`;if(h===!1)v+=`
| notblocked = yes`;if(this.evidence)v+=`
| evidence = ${this.evidence}`;if(this.altmaster)v+=`
| altmaster = ${this.altmaster}`,v+=`
| altmaster-status = ${this.altmasterStatus??"suspected"}`;return v+=`
}}`,v}clone(){return new P({master:this.master,status:this.status,evidence:this.evidence,altmaster:this.altmaster,altmasterStatus:this.altmasterStatus})}equals(h){if(!(h instanceof P))return!1;return this.master===h.master&&this.status===h.status&&this.locked===h.locked&&this.evidence===h.evidence&&this.altmaster===h.altmaster&&this.altmasterStatus===h.altmasterStatus}}class o{status;checked;locked;ltapage;spipage;evidence;constructor(h){this.status=h.status,this.checked=h.checked??!1,this.locked=h.locked??!1,this.ltapage=h.ltapage??"",this.spipage=h.spipage??"",this.evidence=h.evidence??""}generateWikitext(){let h="{{sockpuppeteer",v=this.status==="banned"?"banned":"blocked",z=this.checked||this.status!=="blocked";if(h+=`
| 1 = ${v}`,z)h+=`
| checked = yes`;if(this.locked)h+=`
| locked = yes`;if(this.ltapage)h+=`
| ltapage = ${this.ltapage}`;if(this.spipage)h+=`
| spipage = ${this.spipage}`;if(this.evidence)h+=`
| evidence = ${this.evidence}`;return h+=`
}}`,h}clone(){return new o({status:this.status,checked:this.checked,ltapage:this.ltapage,spipage:this.spipage,evidence:this.evidence})}equals(h){if(!(h instanceof o))return!1;return this.status===h.status&&this.checked===h.checked&&this.locked===h.locked&&this.ltapage===h.ltapage&&this.spipage===h.spipage&&this.evidence===h.evidence}}var A2=["sections","management","block","status","link","comment","move","archive"];var b2=[{label:"Follow preferences",value:"preferences"},{label:"No change",value:"nochange"},{label:"Watch",value:"watch"},{label:"Unwatch",value:"unwatch"}],y2=["preferences","watch","nochange","unwatch"],q2={analyser:!1,timeline:!1,timecard:!1,pages:!1,summary:!1,cuwiki:!1};function c1(h){let v=[],z=h.trim().matchAll(/\{\{([\s\S]+?)}}/g);for(let d of z){if(!d[1])continue;v.push(q0(d[1]))}return v}function q0(h){let v=h.split("|").map((c)=>c.trim()),z=v.shift()?.toLowerCase()??"unknown",d={},M=[];for(let c of v){let V=c.indexOf("=");if(V!==-1){let l=c.slice(0,V).trim().toLowerCase(),H=c.slice(V+1).trim();if(H===""){d[l]=H;continue}let f=Number(H);if(!Number.isNaN(f)){d[l]=f;continue}let F=W5(H);if(F===null){d[l]=H;continue}d[l]=F}else if(c)M.push(c)}return{name:z,params:d,positional:M}}function W5(h){if(["y","yes","true","on"].includes(h.toLowerCase()))return!0;if(["n","no","false","off"].includes(h.toLowerCase()))return!1;return null}function Z2(h){let v=[];for(let z of h.positional)v.push(z);for(let[z,d]of Object.entries(h.params))if(!Number.isNaN(Number(z)))v.push(d.toString());return v}function Z1(h){if(h.startsWith("m:")||h.startsWith("meta:"))return h.slice(h.indexOf(":")+1);else return h}function W2(){return mw.config.get("wgPageParseReport").limitreport.postexpandincludesize.limit}function W1(){let h=mw.config.get("wgServer").replace(/^(https?)?:?\/\//,"").split("."),v=h[0],z=h[1];if(v===void 0||z===void 0)return"";let d;switch(z){case"wikimedia":switch(v){case"commons":case"meta":case"species":case"incubator":case"outreach":d=v;break;default:break}break;case"mediawiki":d="mw";break;case"wikidata":switch(v){case"test":d="testwikidata";break;case"www":d="d";break;default:break}break;case"wikipedia":switch(v){case"test":d="testwiki";break;case"test2":d="test2wiki";break;default:d="w:"+v;break}break;case"wiktionary":d="wikt:"+v;break;case"wikiquote":d="q:"+v;break;case"wikibooks":d="b:"+v;break;case"wikinews":d="n:"+v;break;case"wikisource":d="s:"+v;break;case"wikiversity":d="v:"+v;break;case"wikivoyage":d="voy:"+v;break;default:return""}return`:${d}:`}function T(h){if(h=h.replace(f2,""),h=h.trim(),mw.util.isIPAddress(h,!0))h=h.toUpperCase();else if(h)h=new mw.Title(h).getMainText();return h}function V1(h){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(h)}function Z0(h){return mw.util.isInfinity(h)}var $5=["second","seconds","minute","minutes","hour","hours","day","days","week","weeks","month","months","year","years"],j5=new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${$5.join("|")})$`,"i");function Q5(h){return j5.test(h)}function x1(h){if(Z0(h))return h;if(V1(h))return h;if(Q5(h))return h;return null}function O(h){return mw.util.isIPAddress(h,!0)||mw.util.isTemporaryUser(h)}function N1(h){return b0.test(h)?h:h.trimEnd()+" ~~~~"}function N(h,v){return v??=h,$("<a>").attr("href",mw.util.getUrl(h)).attr("title",h).text(v).prop("outerHTML")}function W0(h,v,z){return z??=h,$("<a>").attr("href",h).attr("title",z).text(v).prop("outerHTML")}function R1(h){let{blockedUsers:v,taggedUsers:z,lockedUsers:d}=h,M="",c=v.filter(Boolean);if(c.length>0)M+=`
** blocked `+c.join(", ");let V=z.filter(Boolean);if(V.length>0)M+=`
** tagged `+V.join(", ");if(d.length>0)M+=`
** requested locks for `+d.map((l)=>`{{noping|1=${l}}}`).join(", ");return M}function $2(h){let v=h.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(`^(={3}|={5})\\s*(<big>)?${v}(</big>)?\\s*(={3}|={5})\\s*$`,"m")}function Y5(h,v=0,z){let d=h.length;if(z){let M=$2(z),c=h.slice(v+1).match(M);if(c?.index!==void 0)d=v+c.index}return h.slice(v,d).trim()}function $1(h,v){return v.sort((d,M)=>d.header.getTime()-M.header.getTime()),h.slice(0,j2(h))+`
`+v.map((d)=>d.fullText).join(`

`)}function j2(h){return e.exec(h)?.index??h.length}function j1(h,v){let z=[];if(v.length===0)return z;let d=j2(h),M=h.slice(d);for(let c=0;c<v.length;c++){let V=v[c];if(!V)continue;let l=V.name,H=$2(l),f=M.match(H);if(!f)continue;let F=f.index;if(F===void 0)continue;let A=Y5(M,F,v[c+1]?.name);if(A){let q=u1(l);if(q===null)return new y({type:"error",content:`Failed to parse date from section header "${l}" in archive`}).show(),null;z.push({header:q,fullText:A})}M=M.slice(F+A.length)}return z}function u1(h){let v=new Date(h);if(!isNaN(v.getTime()))return v;return null}function Q2(){return{block:!1,duration:"",acb:!0,abao:!0,ntp:!1,nem:!1,tags:[],lock:!1}}function P1(h=""){return{options:{noBlock:!1,override:!1,tagUnattached:!0,cuBlock:!1,cuBlockOnly:!1,addMasterNotice:!0,addSockNotice:!0,blankTalk:!1,lockHideNames:!1},userLocks:new Map,userBlocks:new Map,userTags:new Map,master:h,lockcomment:"",skipCUVerifyUsers:new Set}}function S1(h){let v=[],z=c1(h);for(let d of z)if(["sockpuppeteer","sockmaster"].includes(d.name)){let M=(d.params["1"]??d.positional[0])?.toString(),c=M==="cu"||(M?.includes("confirmed")??!1),V=d.params.checked===!0||c,l;if(c)l="confirmed";else if(M==="banned")l="banned";else if(M?.includes("blocked"))l=V?"confirmed":"blocked";else{console.warn("Unrecognised master status",M);continue}let H=new o({status:l,checked:V});if(d.params.locked===!0)H.locked=!0;if(d.params.ltapage)H.ltapage=d.params.ltapage;if(d.params.spipage)H.spipage=d.params.spipage;if(d.params.evidence)H.evidence=d.params.evidence;v.push(H)}else if(["sockpuppet","sock"].includes(d.name)){let M=d.params["1"]??d.positional[0];if(!M){console.warn("Master parameter not found");continue}let c=d.params["2"]??d.positional[1],V;switch(c){case"blocked":V="blocked";break;case"proven":V="proven";break;case"confirmed":case"nbconfirmed":case"cuconfirmed":V="confirmed";break;default:console.warn("Unrecognised sock status",c);continue}let l=new P({master:M,status:V}),H=d.params.altmaster;if(H){let f=d.params["altmaster-status"],F;switch(f){case"suspect":case"suspected":F="suspected";break;case"proven":F="proven";break;default:console.warn("Unrecognised altmaster status",f);break}if(F)l.altmaster=H,l.altmasterStatus=F}if(d.params.evidence)l.evidence=d.params.evidence;if(d.params.locked)l.locked=!0;v.push(l)}return v}function r(h){return h instanceof P}function l1(h){return h instanceof o}var Q1=new Map;function x(h){Q1.set(h,"running")}function B(h,v){Q1.set(h,v)}function Y2(){for(let h of Q1.values())if(h==="running")return!0;return!1}function H1(h){return Q1.get(h)==="running"}function T1(h){return Q1.get(h)}async function J2(h){let v=J(),z={action:"query",list:"blocks",bklimit:1,bkusers:h,bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let d=await v.get(z),[M]=d.query.blocks;if(!M)return null;return{username:h,duration:M.expiry,acb:M.nocreate,abao:M.autoblock||M.anononly,ntp:!M.allowusertalk,nem:M.noemail,reason:M.reason}}catch{return null}}async function Y1(h){if(h.length===0)return new Map;let v=J(),z=new Map,d={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:h,formatversion:"2"};try{let M=await v.get(d);for(let c of M.query.pages){if(c.missing)continue;let V=c.revisions?.[0];if(!V)continue;let l=c.title.split(":",2)[1];if(!l){console.error("spiHelperGetBulkPageText: could not find name for",c.title);continue}z.set(l,V.slots.main.content)}}catch(M){console.error("spiHelperGetBulkPageText fetch error:",M)}return z}async function k1(h){if(h.size===0)return new Map;let v=J(),z=new Map,d={action:"query",list:"blocks",bklimit:"max",bkusers:[...h],bkprop:["user","reason","flags","expiry"],formatversion:"2"};try{let M=await v.get(d);for(let c of M.query.blocks)z.set(c.user,{username:c.user,duration:c.expiry,acb:c.nocreate,abao:c.autoblock||c.anononly,ntp:!c.allowusertalk,nem:c.noemail,reason:c.reason})}catch(M){console.error("spiHelperGetBulkUserBlockSettings fetch error:",M)}return z}async function f1(h){let v=J(),z={action:"query",list:"globalallusers",agulimit:1,agufrom:h,aguto:h,aguprop:["lockinfo","existslocally"]};try{let d=await v.get(z),[M]=d.query.globalallusers;if(!M)return null;return{name:M.name,existsLocally:"existslocally"in M,locked:"locked"in M}}catch{return null}}async function Y0(h,v){let z=J(),d={action:"query",list:"allusers",aulimit:v,auprefix:h,auprop:["blockinfo"],formatversion:"2"};try{return(await z.get(d)).query.allusers}catch{return[]}}async function J0(h,v,z){let d=J(),M={action:"query",list:"allpages",aplimit:z,apprefix:h,apnamespace:v,formatversion:"2"};try{return(await d.get(M)).query.allpages}catch{return[]}}async function _0(h,v){let z="delete_"+h;x(z);let d=N(h),M=new y({type:"notice",content:`Deleting ${d}`,isHtml:!0}).show(),c=J(h),V={action:"delete",title:h,reason:v};try{await c.postWithToken("csrf",V),M.update({type:"success",content:`Deleted ${d}`}),B(z,"success")}catch(l){M.update({type:"error",content:`Failed to delete ${d}: ${mw.html.escape(JSON.stringify(l))}`}),B(z,"failed")}}async function _2(h,v){let z="undelete_"+h;x(z);let d=N(h),M=new y({type:"notice",content:`Undeleting ${d}`,isHtml:!0}).show(),c=J(h),V={action:"undelete",title:h,reason:v};try{await c.postWithToken("csrf",V),M.update({type:"success",content:`Undeleted ${d}`}),B(z,"success")}catch(l){M.update({type:"error",content:`Failed to undelete ${d}: ${mw.html.escape(JSON.stringify(l))}`}),B(z,"failed")}}async function X0(h,v){let z={action:"parse",prop:"text",pst:!0,text:v,title:h};try{return(await J(h).post(z)).parse?.text["*"]??""}catch(d){return console.error("Error rendering text:",d),""}}async function h1(h){let{pageName:v,content:z}=h,d={action:"parse",prop:"tocdata",formatversion:"2"};if(v!==void 0)d.page=v;else if(z!==void 0)d.text=z,d.contentmodel="wikitext";else return console.error("spiHelperGetInvestigationSections: No page name or content provided"),[];let M=J();try{let c=await M.post(d);if(!c.parse)return console.error("spiHelperGetInvestigationSections: Could not parse sections"),[];let V=[];for(let l of c.parse.tocdata.sections)if(l.tocLevel===2||l.hLevel===3)V.push(new U0(parseInt(l.index),l.line));return V}catch(c){return console.warn("spiHelperGetInvestigationSections API error:",c),[]}}async function X2(h){let v=J(),z={action:"query",format:"json",list:"backlinks",bltitle:h,blnamespace:4,bldir:"ascending",blfilterredir:"nonredirects"};try{return(await v.get(z)).query.backlinks.filter((M)=>{return M.title.startsWith("Wikipedia:Sockpuppet investigations/")&&!M.title.startsWith("Wikipedia:Sockpuppet investigations/SPI/")&&!/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(M.title)})}catch{return[]}}async function B0(h){let v=J(),z={action:"query",format:"json",prop:"info",titles:h,inprop:"protection",formatversion:"2"};try{let d=await v.get(z),[M]=d.query.pages;return M?.protection??[]}catch{return[]}}async function K0(h){let v=J(),z={action:"query",format:"json",prop:"flagged",titles:h,formatversion:"2"};try{let d=await v.get(z),[M]=d.query.pages;return M?.flagged??null}catch{return null}}async function D0(h,v){let z="protect_"+h;x(z);let d=N(h),M=new y({type:"notice",content:`Protecting ${d}`,isHtml:!0}),c=J();try{let V="",l="";v.forEach((f)=>{if(V!=="")V=V+"|",l=l+"|";V=V+f.type+"="+f.level,l=l+f.expiry});let H={action:"protect",format:"json",title:h,protections:V,expiry:l,reason:"Restoring protection after history merge"};await c.postWithToken("csrf",H),M.update({type:"success",content:`Protected ${d}`}),B(z,"success")}catch(V){M.update({type:"error",content:`Failed to protect ${d}: ${mw.html.escape(JSON.stringify(V))}`}),B(z,"failed")}}async function I0(h,v){if(v.level==="")return;let z="stabilize_"+h;x(z);let d=J(),M={action:"stabilize",format:"json",titles:h,protectlevel:v.level,expiry:v.expiry,reason:"Restoring pending changes protection after history merge"};try{await d.postWithToken("csrf",M),B(z,"success")}catch{B(z,"failed")}}async function B2(){let h=J(),v={action:"query",format:"json",meta:"siteinfo",siprop:"restrictions"};try{return(await h.get(v)).query.restrictions}catch{return{types:[],levels:[],cascadinglevels:[],semiprotectedlevels:[]}}}async function K2(h){let{user:v,duration:z,reason:d,reblock:M,anononly:c,accountcreation:V,autoblock:l,notalkpage:H,noemail:f,watchBlockedUser:F,watchExpiry:A="indefinite"}=h,q="block_"+v;x(q);let Q="User:"+v,b=N(Q),j=new y({type:"notice",content:`Blocking ${b}`,isHtml:!0}).show(),Y=J(),I={action:"block",expiry:z,reason:d,reblock:M,anononly:c,nocreate:V,autoblock:l,allowusertalk:!H,noemail:f,watchuser:F,watchlistexpiry:A,user:v,formatversion:"2"};try{let K=await Y.postWithToken("csrf",I),_=W0(mw.util.getUrl("Special:BlockList",{wpTarget:`#${K.block.id}`}),"Blocked","Special:BlockList");return j.update({type:"success",content:`${_} user ${b}`}),B(q,"success"),!0}catch(K){return j.update({type:"error",content:`Failed to block ${b}: ${mw.html.escape(JSON.stringify(K))}`}),B(q,"failed"),!1}}async function J1(h){let{sourcePage:v,destPage:z,summary:d,ignoreWarnings:M,suppressRedirect:c=!1,moveSubpages:V=!0}=h,l="move_"+v+"_"+z;x(l);let H=J(),f=N(v),F=N(z),A=new y({type:"notice",content:`Moving ${f} to ${F}`,isHtml:!0}).show(),q={action:"move",from:v,to:z,reason:d+y0,noredirect:c,movesubpages:V,ignoreWarnings:M};try{await H.postWithToken("csrf",q),A.update({type:"success",content:`Moved ${f} to ${F}`}),B(l,"success")}catch(Q){A.update({type:"error",content:`Failed to move ${f} to ${F}: ${mw.html.escape(JSON.stringify(Q))}`}),B(l,"failed")}}async function D(h){let{title:v,newText:z,summary:d,createonly:M=!1,watch:c,watchExpiry:V,baseRevId:l,sectionId:H}=h,f=`edit_${v}`;if(H)f+=`_${H}`;x(f);let F=N(v),A=new y({type:"notice",content:"Editing "+F,isHtml:!0}).show(),q=J(v),Q=Z1(v),b={action:"edit",watchlist:c,summary:d+y0,text:z,title:Q,createonly:M,formatversion:"2"};if(H)b.section=H.toString();if(V)b.watchlistexpiry=V;if(l)b.baserevid=l;try{let j=await q.postWithToken("csrf",b),Y=j.edit.newrevid;if(!Y)return A.update({type:"error",content:`Edit failed on ${F}: ${mw.html.escape(JSON.stringify(j))}`}),console.error(j),B(f,"failed"),null;let I=W0(mw.util.getUrl("",{diff:Y}),"Saved",`View diff ${Y}`);return A.update({type:"success",content:`${I} page ${F}`,isHtml:!0}),B(f,"success"),j.edit.newrevid??null}catch(j){return A.update({type:"error",content:`Edit failed on ${F}: ${mw.html.escape(JSON.stringify(j))}`,isHtml:!0}),console.error(j),B(f,"failed"),null}}async function X(h,v,z){let d=N(h),M=new y({type:"notice",content:"Getting page "+d,isHtml:!0});if(v)M.show();let V={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:Z1(h),formatversion:"2"};if(z)V.rvsection=z.toString();try{let H=(await J(h).get(V)).query.pages[0];if(!H||"missing"in H){if(v)M.update({type:"warning",content:`Page ${d} does not exist`,isHtml:!0});return""}let f=H.revisions?.[0];if(!f)return"";if(v)M.update({type:"success",content:`Got ${d}`,isHtml:!0});return f.slots.main.content}catch(l){if(v)M.update({type:"error",content:`Failed to get ${d}: ${mw.html.escape(JSON.stringify(l))}`,isHtml:!0});return""}}async function w1(h){let z={action:"query",prop:"revisions",rvslots:"main",rvprop:"ids",titles:Z1(h),formatversion:"2"};try{let M=(await J(h).get(z)).query.pages[0];if(!M||"missing"in M)return 0;let c=M.revisions?.[0];if(!c)return 0;return c.revid}catch{return 0}}async function p0(h,v){let d={action:"parse",prop:"limitreportdata",page:Z1(h)};if(v)d.section=v.toString();let M=J(h);try{let c=await M.get(d);return Number(c.parse?.limitreportdata.find((V)=>V.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function D2(h){let v=J(),z={action:"parse",prop:"text",text:h,wrapoutputclass:"",disablelimitreport:!0,disableeditsection:!0,contentmodel:"wikitext"};try{return(await v.post(z)).parse?.text["*"]??""}catch{return""}}async function m0(h){let v=J(),z={action:"query",list:"categorymembers",cmtitle:h,cmlimit:"max",cmnamespace:2,formatversion:"2"};try{return(await v.get(z)).query.categorymembers.map((M)=>M.title)}catch{return[]}}var $0=`MediaWiki-JS/${mw.config.get("wgVersion")} spihelper/${u}`,j0={meta:new mw.ForeignApi("https://meta.wikimedia.org/w/api.php",{userAgent:$0}),local:new mw.Api({userAgent:$0})};function J(h){if(h&&(h.startsWith("m:")||h.startsWith("meta:")))return j0.meta;else return j0.local}function I2(){if(mw.config.get("wgWikiID")==="enwiki")return j0.local;return new mw.ForeignApi("https://en.wikipedia.org/w/api.php",{userAgent:$0})}class _1{pageName;prefixedName;caseName;userName;archiveName;casePageName;isArchive;valid;startingRevId;source;constructor(h,v=!1,z="spi"){if(this.pageName=h,this.prefixedName=W1()+h,this.source=z,this.isArchive=/Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(h),this.caseName=J5(h,this.isArchive),this.userName=T(this.caseName),this.casePageName="Wikipedia:Sockpuppet investigations/"+this.caseName,this.archiveName=h+"/Archive",this.valid=!!this.caseName.trim(),v)this.startingRevId=mw.config.get("wgCurRevisionId");else this.startingRevId=0}async refreshRevId(){this.startingRevId=await w1(this.pageName)}async edit(h){return D({title:this.pageName,newText:h.newText,summary:h.summary,createonly:h.createonly??!1,watch:h.watch,watchExpiry:h.watchExpiry,baseRevId:h.baseRevId,sectionId:h.sectionId})}}function J5(h,v){let z=h.replace(/^Wikipedia:Sockpuppet investigations\//,"");return v?z.replace(/\/Archive.*/,""):z}function _5(h){return h.replaceAll(/_/g," ")}var a;function n1(h,v="spi"){a=new _1(_5(h),h===mw.config.get("wgPageName"),v)}function X1(h){return a.valid?h+` per [[${a.prefixedName}]]`:h}class G0{sections;selectedSection;archiveNotice;_text=null;_loadingPromise=null;constructor(h=[],v=null,z=null){if(this.sections=h,v)this.selectedSection={type:"specific",section:v};else this.selectedSection=null;this.archiveNotice=z}}class U0{id;name;_text=null;_loadingPromise=null;constructor(h,v){this.id=h,this.name=v}}async function k(h,v={}){let{purge:z=!1,show:d=!1}=v;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!z)return h._text;return h._loadingPromise=X(a.pageName,d),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}async function L1(h){h.sections=await h1({pageName:a.pageName})}async function m(h,v={}){let{purge:z=!1,show:d=!1}=v;if(h._loadingPromise)return h._loadingPromise;if(h._text!==null&&!z)return h._text;return h._loadingPromise=X(a.pageName,d,h.id),h._text=await h._loadingPromise,h._loadingPromise=null,h._text}var Z=(h)=>h;var E0=Z({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,watchOptions:b2,messages:{error:"Watch option is invalid"}}},computed:{status(){return y2.includes(this.internalValue)?"default":"error"}},watch:{resetTrigger(){this.internalValue=this.modelValue},internalValue(h){this.$emit("update:modelValue",h)}},template:`
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ this.label }}</template>
      <cdx-select
          :menu-items="watchOptions"
          v-model:selected="internalValue"
      />
    </cdx-field>
  `});var C0=Z({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,touched:!1,isResetting:!1}},watch:{resetTrigger(){this.isResetting=!0,this.internalValue=this.modelValue,this.touched=!1,this.$nextTick(()=>{this.isResetting=!1})},internalValue(h){if(!this.isResetting)this.touched=!0;if(h===""||x1(h)!==null)this.$emit("update:modelValue",h)}},template:`
    <expiry-input :label="label" :touched="touched" v-model="internalValue" />
  `});var O0=Z({props:{modelValue:{type:String,required:!0},prefix:{type:String,required:!0}},data(){return{inputValue:this.modelValue,messages:{error:"Page name is invalid"},resetValue:"spihelper_log"}},computed:{valid(){return this.inputValue.length>0&&mw.Title.newFromText(this.prefix+this.inputValue)!==null},status(){return this.valid?"default":"error"}},watch:{inputValue(h){if(this.valid)this.$emit("update:modelValue",h)}},methods:{resetInput(){this.inputValue=this.resetValue}},template:`
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
  `});async function p2(h){return!(await D2("{{#time:r|"+h+"}}")).includes("Error: Invalid time.")}function r1(h){return`User:${mw.config.get("wgUserName")}/${h}`}var X5=[{oldPath:"watchCase",newPath:["watch","case"],type:"WatchOption"},{oldPath:"watchArchive",newPath:["watch","archive"],type:"WatchOption"},{oldPath:"watchTaggedUser",newPath:["watch","tagged"],type:"WatchOption"},{oldPath:"watchNewCats",newPath:["watch","categories"],type:"WatchOption"},{oldPath:"watchBlockedUser",newPath:["watch","blocked"],type:"boolean"},{oldPath:"watchCaseExpiry",newPath:["expiry","case"],type:"expiry"},{oldPath:"watchArchiveExpiry",newPath:["expiry","archive"],type:"expiry"},{oldPath:"watchTaggedUserExpiry",newPath:["expiry","tagged"],type:"expiry"},{oldPath:"watchNewCatsExpiry",newPath:["expiry","categories"],type:"expiry"},{oldPath:"watchBlockedUserExpiry",newPath:["expiry","blocked"],type:"expiry"},{oldPath:"clerk",newPath:["clerk"],type:"boolean"},{oldPath:"log",newPath:["log","enabled"],type:"boolean"},{oldPath:"reversed_log",newPath:["log","reversed"],type:"boolean"},{oldPath:"tickArchiveWhenCaseClosed",newPath:["tickArchiveWhenCaseClosed"],type:"boolean"},{oldPath:"useCheckuserblockAccount",newPath:["useCheckuserblockAccount"],type:"boolean"},{oldPath:"displayIPv6As64",newPath:["interface","displayIPv6As64"],type:"boolean"},{oldPath:"debugForceCheckuserState",newPath:["debug","forceCheckuser"],type:"boolean"},{oldPath:"debugForceAdminState",newPath:["debug","forceAdmin"],type:"boolean"}];function B5(h,v,z){let d=h;for(let c=0;c<v.length-1;c++){if(!v[c])throw Error(`Path segment "${v.join(".")}" is invalid`);let V=v[c],l=d[V];if(l===null||typeof l!=="object")throw Error(`Path segment "${v[c]}" is not an object`);d=l}let M=v[v.length-1];d[M]=z}async function m2(h){let v=X5.map(async({oldPath:z,newPath:d,type:M})=>{let c=h[z];if(c===void 0)return;if(await K5(c,M))B5(L,d,c)});await Promise.all(v)}async function K5(h,v){switch(v){case"boolean":return typeof h==="boolean";case"WatchOption":return typeof h==="string"&&["preferences","watch","nochange","unwatch"].includes(h);case"expiry":return typeof h==="string"&&p2(h)}}var L=structuredClone(q1);function U2(h){L=structuredClone(h)}var G2="userjs-spihelper";function g(){return J().saveOption(G2,JSON.stringify(L))}function x0(){let h=String(mw.user.options.get(G2));try{return h?JSON.parse(h):null}catch(v){return console.warn("Failed to parse saved options",v),null}}async function N0(){mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"migrate"});try{if(await mw.loader.getScript("/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript"),spiHelperCustomOpts!==void 0)await m2(spiHelperCustomOpts)}catch(h){mw.notify("Error retrieving your spihelper-options.js",{type:"error"}),console.error("Error getting local spihelper-options.js: ",h)}}function U(h=!0){if(h&&L.debug.enabled)return L.debug.forceCheckuser;return mw.config.get("wgUserGroups")?.includes("checkuser")??!1}function G(){return L.clerk||U()}function E(){if(L.debug.enabled)return L.debug.forceAdmin;return mw.config.get("wgUserGroups")?.includes("sysop")??!1}function B1(){return E()||(mw.config.get("wgUserGroups")?.includes("extendedmover")??!1)}var a1='<path d="M11 9V4H9v5H4v2h5v5h2v-5h5V9z"/>';var E2='<path d="m2 10 1.42-1.41L9 14.17V2h2v12.17l5.59-5.58L18 10l-8 8z"/>';var C2='<path d="M10 0a10 10 0 1010 10A10 10 0 0010 0m2.5 14.5L9 11V4h2v6l3 3z"/>',O2='<path d="m4.34 2.93 12.73 12.73-1.41 1.41L2.93 4.35z"/><path d="M17.07 4.34 4.34 17.07l-1.41-1.41L15.66 2.93z"/>',x2='<path id="cdx-icon-code-a" d="M1 10.08V8.92h1.15c1.15 0 1.15 0 1.15-1.15V5a7.4 7.4 0 01.09-1.3 2 2 0 01.3-.7 1.84 1.84 0 01.93-.68A6.4 6.4 0 016.74 2h1.18v1.15h-.86A1.32 1.32 0 006 3.62a1.7 1.7 0 00-.36 1.23V7a3.2 3.2 0 01-.28 1.72 2 2 0 01-1.26.77 2.15 2.15 0 011.26.79A3.26 3.26 0 015.62 12v3.15A1.67 1.67 0 006 16.37a1.31 1.31 0 001.08.47h.87V18H6.74a6.3 6.3 0 01-2.12-.29 1.82 1.82 0 01-.93-.71 1.9 1.9 0 01-.3-.72A7.5 7.5 0 013.31 15v-3.77c0-1.15 0-1.15-1.15-1.15zm18 0V8.92h-1.15c-1.15 0-1.15 0-1.15-1.15V5a7.4 7.4 0 00-.08-1.32 2 2 0 00-.3-.73 1.84 1.84 0 00-.93-.68A6.4 6.4 0 0013.26 2h-1.18v1.15h.87a1.32 1.32 0 011.05.47 1.7 1.7 0 01.36 1.23V7a3.2 3.2 0 00.28 1.72 2 2 0 001.26.77 2.15 2.15 0 00-1.26.79 3.26 3.26 0 00-.26 1.72v3.15a1.67 1.67 0 01-.38 1.22 1.31 1.31 0 01-1.08.47h-.87V18h1.19a6.3 6.3 0 002.12-.29 1.82 1.82 0 00.93-.68 1.9 1.9 0 00.3-.72 7.5 7.5 0 00.1-1.31v-3.77c0-1.15 0-1.15 1.15-1.15z"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cdx-icon-code-a" transform="matrix(-1 0 0 1 20 0)"/>',N2='<path d="m2.5 15.25 7.5-7.5 7.5 7.5 1.5-1.5-9-9-9 9z"/>';var o1={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3z"/><path d="M9 9h8v8H9zm0-2c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2z"/>',shouldFlip:!0};var R2='<path d="M17 12v5H3v-5H1v5a2 2 0 002 2h14a2 2 0 002-2v-5z"/><path d="M15 9h-4V1H9v8H5l5 6z"/>';var u2='<path d="m17.5 4.75-7.5 7.5-7.5-7.5L1 6.25l9 9 9-9z"/>';var F1={ltr:'<path d="M19 16 2 12a3.83 3.83 0 01-1-2.5A3.83 3.83 0 012 7l17-4z"/><rect width="4" height="8" x="4" y="9" rx="2"/>',shouldFlip:!0};var P2={ltr:'<path d="M2 18.5A1.5 1.5 0 003.5 20H5V0H3.5A1.5 1.5 0 002 1.5zM6 0v20h10a2 2 0 002-2V2a2 2 0 00-2-2zm7 8H8V7h5zm3-2H8V5h8z"/>',shouldFlip:!0};var S2={ltr:'<path d="M8 12V1H1v18h18v-7z"/><path d="M11 1v8h8V1zm6 6h-4V3h4z"/>',shouldFlip:!0};var T2={ltr:'<path d="M13 15v2a3 3 0 01-3 3 10 10 0 1110-10 5 5 0 01-5 5ZM3 8.5a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3-4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3 4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0"/>',shouldFlip:!0},k2={ltr:'<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3zm4 12v2c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2h-2v2h2v8H9v-2z"/><path d="M10 5H8v3H5v2h3v3h2v-3h3V8h-3z"/>',shouldFlip:!0};var g1='<path d="M13 8V2a2 2 0 002-2H5a2 2 0 002 2v6H6a2 2 0 00-2 2v1h5v5l1 4 1-4v-5h5v-1a2 2 0 00-2-2z"/>';var i1='<path d="M15.65 4.35A8 8 0 1017.4 13h-2.22a6 6 0 11-1-7.22L11 9h7V2z"/>';var i='<path d="M17 2h-3.5l-1-1h-5l-1 1H3v2h14zM4 17a2 2 0 002 2h8a2 2 0 002-2V5H4z"/>';var w2={ltr:'<path d="m6.4 17-1.26-1.25 2.32-2.25H1v-1.75h6.46L5.14 9.5 6.4 8.25l4.5 4.38zm7.2-5.25L9.1 7.37 13.6 3l1.26 1.25-2.32 2.25H19v1.75h-6.46l2.32 2.25z"/>',shouldFlip:!0};var s1='<path d="M10 11c-5.92 0-8 3-8 5v3h16v-3c0-2-2.08-5-8-5"/><circle cx="10" cy="5.5" r="4.5"/>',t1='<path d="M10 8c1.7 0 3.06-1.35 3.06-3S11.7 2 10 2 6.94 3.35 6.94 5 8.3 8 10 8m0 2c-2.8 0-5.06-2.24-5.06-5S7.2 0 10 0s5.06 2.24 5.06 5-2.26 5-5.06 5m-7 8h14v-1.33c0-1.75-2.31-3.56-7-3.56s-7 1.81-7 3.56zm7-6.89c6.66 0 9 3.33 9 5.56V20H1v-3.33c0-2.23 2.34-5.56 9-5.56"/>';var n2={ltr:'<path d="M1 3h16v2H1Zm0 6h6v2H1Zm0 6h8v2H1Zm8-4.24h3.85L14.5 7l1.65 3.76H20l-3 3.17.9 4.05-3.4-2.14L11.1 18l.9-4.05Z"/>',shouldFlip:!0};function K1(h){let{text:v,fullSearch:z,state:d}=h,M=z?[v1(a.caseName,d)]:[],c=[],V=z?new Set([a.caseName]):new Set;if(z){let f=$(document);if(d.selectedSection?.type==="specific")f=$(`a[href$="section=${d.selectedSection.section.id}"]`).parentsUntil(":has(hr)").last().nextUntil("hr");let F=f.find(".cuEntry").find("a:first");for(let A of F){let q=T($(A).text());if(V.has(q))continue;M.push(v1(q,d)),V.add(q)}}let l=(f)=>{return/sock ?list/.exec(f)!==null||["ip","vandal","user","noping"].some((F)=>f.includes(F))},H=c1(v);for(let f of H)if(l(f.name)){let F=Z2(f);for(let A of F){let q=T(A);if(!V.has(q))c.push(v1(q,d)),V.add(q)}}return[M,c,V]}function v1(h,v){if(mw.util.isIPAddress(h,!0))if(L.interface.displayIPv6As64&&mw.util.isIPv6Address(h,!1))return{...z1(v.archiveNotice),username:D5(h)};else return{...z1(v.archiveNotice),username:h};else return{...z1(v.archiveNotice),username:h}}function D5(h){if(!mw.util.isIPv6Address(h,!1))return h;return h.split(":").slice(0,4).concat("0","0","0","0").join(":")+"/64"}function z1(h){let v={id:crypto.randomUUID(),username:"",block:Q2(),link:{...q2}};if(h){if(h.crosswiki)v.block.lock=!0;if(h.notalk)v.block.nem=!0,v.block.ntp=!0}return v.block.duration=L.interface.defaultBlockDuration,v}function D1(h){let{userRow:v,currentBlock:z,userPage:d,defaultBlock:M}=h;if(z)v.block.block=!0,v.block.acb=z.acb,v.block.abao=z.abao,v.block.ntp=z.ntp,v.block.nem=z.nem,v.block.duration=z.duration;else if(v.block.block=M,mw.util.isIPAddress(v.username,!0))v.block.duration="1 week";if(d)v.block.tags=S1(d);return v}var I1=(h)=>("items"in h);async function e1(h){let{block:v,userPage:z,defaultBlock:d,checkLock:M,state:c}=h,V=D1({userRow:h.userRow,defaultBlock:d,currentBlock:v,userPage:z}),l=null;if(M){let H=await f1(V.username);if(H)if(l=H.locked,H.locked||c.archiveNotice?.crosswiki)V.block.lock=!0;else V.block.lock=!1}return{userRow:V,isLocked:l}}function R0(h){return h.map((v)=>{if(I1(v)){let z=R0(v.items);if(z.length===0)return null;return{...v,items:z}}if(!v.value)return null;return v}).filter((v)=>v!==null)}var h0=null;function r2(h){h0=h}var o2=Z({props:{feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},toaster:{type:Object,required:!0}},data:function(){let v=`User:${mw.config.get("wgUserName")??""}/`,z=A2.reduce((d,M)=>{if(M!=="sections")d.push({value:M,label:M.charAt(0).toUpperCase()+M.slice(1)});return d},[]);return{open:!1,openHandler:null,showExtra:L.debug.enabled,showExtraMessage:!1,showExtraHandler:null,logPrefix:v,caseActionMenuItems:z,selectedChipItems:L.defaultActions,icons:{cdxIconAdd:a1,cdxIconArrowDown:E2,cdxIconClock:C2,cdxIconClose:O2,cdxIconCode:x2,cdxIconFeedback:F1,cdxIconJournal:P2,cdxIconLayout:S2,cdxIconPalette:T2,cdxIconReload:i1,cdxIconTrash:i,cdxIconWatchlist:n2},instanceSettings:structuredClone(L),oldSettings:structuredClone(L),resetTrigger:0}},computed:{logPage(){return`${mw.config.get("wgServer")}/wiki/${r1(L.log.page)}`},isCheckUser(){let{debug:h}=this.instanceSettings;return(mw.config.get("wgUserGroups")?.includes("checkuser")??!1)||h.enabled&&h.forceCheckuser},inputChipItems:{get(){return this.instanceSettings.defaultActions.map((h)=>({value:h,label:h.charAt(0).toUpperCase()+h.slice(1)}))},set(h){this.instanceSettings.defaultActions=h.map((v)=>v.value)}}},watch:{open(h){if(h){if(!this.showExtra&&this.showExtraHandler)window.addEventListener("keydown",this.showExtraHandler)}else{let v=JSON.stringify(this.instanceSettings);if(JSON.stringify(this.oldSettings)!==v){if(h0)U2(h0(this.instanceSettings));else{this.toaster.error("Failed to save settings",{autoDismiss:!0});return}let d=this.toaster.info("Saving settings...",{autoDismiss:!1});g().then((M)=>{this.toaster.success("Settings saved! Reload to apply them",{autoDismiss:!0})}).catch((M)=>{let c=M instanceof Error?M.message:String(M);this.toaster.error(`Failed to save settings: ${c}`,{autoDismiss:!0})}).always(()=>{this.oldSettings=JSON.parse(v),setTimeout(()=>{this.toaster.dismiss(d)},3000)})}if(this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler)}}},mounted(){this.openHandler=()=>{this.open=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"options"})},this.openButton.addEventListener("click",this.openHandler);//! Use the Konami code to unlock debug menu
let h=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"],v=0;this.showExtraHandler=(z)=>{if(z.key===h[v]){if(v++,v===h.length){if(this.showExtra=!0,this.showExtraMessage=!0,this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler);v=0}}else v=0}},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler)},methods:{isMenuGroupData:I1,loadDefaults(){this.instanceSettings=JSON.parse(JSON.stringify(q1)),Object.assign(L,q1),this.resetTrigger++},launchFeedback(){this.open=!1,this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`Options form v${u}-${C}`})},removeTemplateEntry(h){this.instanceSettings.custom.commentTemplates.splice(h,1)},addTemplateEntry(h){if(h==="item")this.instanceSettings.custom.commentTemplates.push({label:"",value:""});else this.instanceSettings.custom.commentTemplates.push({label:"",items:[]})},moveDown(h,v){if(v<0||v>=h.length-1)return h;let z=h[v+1];h[v+1]=h[v],h[v]=z}},template:`
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
  `});function u0(){return{sections:{label:"Sections",selectionType:"both"},comment:{label:"Comment",selectionType:"section"},status:{label:"Case Status",selectionType:"section"},block:{label:E()?"Block/Tag Socks":"Tag Socks",selectionType:"both"},link:{label:"Generate Links",selectionType:"both"},management:{label:"SPI Management",selectionType:"case"},move:{label:{case:"Move/Merge Full Case",section:"Move Section"},selectionType:"both"},archive:{label:{case:"Archive Closed",section:"Archive"},selectionType:"both"}}}function P0(){return{sections:{enabled:!0,data:{section:null}},comment:{enabled:!1,data:{text:"* "}},status:{enabled:!1,data:{old:"",new:"nochange"}},block:{enabled:!1,data:P1(a.caseName)},link:{enabled:!1},management:{enabled:!1,data:{flags:new Set}},move:{enabled:!1,data:{target:"",suppress:!1}},archive:{enabled:!1}}}var v0=new Set(["status","management","comment","move","archive"]),z0=new Set(["move","archive","management"]),S0=new Set(["sections","move","archive","block","link"]),g2=new Set(["status","comment"]),i2=new Set(["management"]);var T0=Z({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},emits:["actionToggled"],data(){return{accordionModel:!0}},computed:{allSelected(){return this.selection==="all"},showAccordion(){if(a.isArchive)return!v0.has(this.name);if(!G()&&z0.has(this.name))return!1;if(this.name==="sections")return!0;if(this.selection===null)return!1;if(this.selectionType==="both")return!0;return this.selectionType==="case"===this.allSelected},text(){if(typeof this.label==="string")return this.label;if(this.selectionType==="both")return this.allSelected?this.label.case:this.label.section;return"Unexpected configuration"},showEnabledClass(){return this.name!=="sections"&&this.actionEnabled}},template:`
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
  `});var k0=Z({props:{selection:{type:Object,required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},computed:{buttonEnabled(){return this.displayedForms.has(this.name)||this.actionEnabled},allSelected(){return this.selection==="all"},showButton(){if(a.isArchive)return!v0.has(this.name);if(!G()&&z0.has(this.name))return!1;if(this.name==="sections")return!0;if(this.selection===null)return!1;if(this.selectionType==="both")return!0;return this.selectionType==="case"===this.allSelected},buttonAction(){return this.buttonEnabled?"progressive":"normal"},buttonStyle(){return{opacity:this.buttonEnabled?1:0.7,color:this.displayedForms.has(this.name)?"var(--color-base)":""}},text(){if(typeof this.label==="string")return this.label;if(this.selectionType==="both")return this.allSelected?this.label.case:this.label.section;return"Unexpected configuration"}},template:`
    <cdx-button
        v-if="showButton"
        :name="name"
        :action="buttonAction"
        :style="buttonStyle"
    >
      {{ text }}
    </cdx-button>
  `});var w0=Z({props:{enabled:{type:Boolean,required:!0},empty:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:enabled"],template:`
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="enabled && !empty">
      <slot />
    </div>
  `});var n0=Z({props:{name:{type:String,required:!0},caseActions:{type:Object,required:!0},accounts:{type:Array,required:!0},state:{type:Object,required:!0}},emits:["update-section-selection","update-status","user-selected","remove-rows","add-row","fetch-rows","move-entire-case"],computed:{caseName(){return a.caseName}},methods:{handleUpdateSectionSelection(h){this.$emit("update-section-selection",h)},handleUpdateStatus(h){this.$emit("update-status",h)},handleUserSelected(h,v){this.$emit("user-selected",h,v)},handleRemoveRows(h){this.$emit("remove-rows",h)},handleAddRow(h){this.$emit("add-row",h)},handleFetchRows(){this.$emit("fetch-rows")},handleMoveEntireCase(){this.$emit("move-entire-case")}},template:`
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
  `});var s2=10;function d0(h,v){if(h.blockid!==void 0)v.block.block=!0;if(h.blocknocreate!==void 0)v.block.acb=h.blocknocreate;if(h.blockemail!==void 0)v.block.nem=h.blockemail;if(mw.util.isIPAddress(h.name)){if(h.blockanononly!==void 0)v.block.abao=h.blockanononly}else if(h.blockautoblocking!==void 0)v.block.abao=h.blockautoblocking;if(h.blockowntalk!==void 0)v.block.ntp=h.blockowntalk;if(h.blockexpiry)v.block.duration=h.blockexpiry}var M0=Z({props:{modelValue:{type:String,required:!0},label:{type:String,required:!1,default:""},allowEmpty:{type:Boolean,default:!0}},emits:["update:modelValue","user-selected"],data(){return{lookupStatus:"default",messages:{success:"Valid user",warning:"User not found",error:"Field must not be empty"},selection:null,userSuggestions:[],menuConfig:{visibleItemLimit:6,searchQuery:""},useLookup:L.useLookup}},computed:{username:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}}},methods:{onUpdateInputValue(h){let v=h.trim();if(this.menuConfig.searchQuery=v,!v){this.userSuggestions=[];return}Y0(v,s2).then((z)=>{if(this.username!==h&&this.username!==v)return;if(z.length===0){this.userSuggestions=[];return}this.userSuggestions=z.map((d)=>({label:d.name,value:d.userid.toString(),customData:d}))}).catch(()=>{this.userSuggestions=[]})},onLoadMore(){if(!this.username)return;Y0(this.username,this.userSuggestions.length+s2).then((h)=>{if(h.length===0)return;this.userSuggestions=h.map((v)=>({label:v.name,value:v.userid.toString(),customData:v}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.username.length===0){this.lookupStatus=this.allowEmpty?"default":"error";return}if(mw.util.isIPAddress(this.username)){this.lookupStatus="default";return}let h=this.userSuggestions.find((v)=>v.label===this.username||v.label?.trim()===this.username.trim())??null;if(h!==null)this.$emit("user-selected",h.customData),this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null){let v=this.userSuggestions.find((z)=>z.value===h)??null;if(v)this.$emit("user-selected",v.customData);this.lookupStatus="success"}}},template:`
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
  `});async function A1(h){let{page:v,state:z}=h,d;if(v===a.pageName&&z)d=await k(z);else d=await X(v,!1);if(d==="")return null;let c=c1(d).find((H)=>/SPI\s*archive notice/i.exec(H.name));if(!c)return console.error("Missing archive notice"),null;let V=c.positional[0]??c.params["1"];if(!V)return console.error("Invalid archive notice: Username missing"),null;let l={deny:!1,crosswiki:!1,notalk:!1,moot:!1};for(let[H,f]of Object.entries(c.params)){if(H==="1")continue;if(f!==!0){console.warn("Malformed archivenotice parameter",H,"=",f);continue}if(H in l)l[H]=!0;else console.warn("Unrecognised archivenotice parameter",H,"=",f)}return new S({username:V,...l})}function r0(h){let v=new Set;if(h===null)return v;if(h.deny)v.add("deny");if(h.moot)v.add("moot");if(h.notalk)v.add("notalk");if(h.crosswiki)v.add("crosswiki");return v}async function b1(h){let{likelySocks:v,possibleSocks:z,allUsernames:d,userBlocks:M,userLocks:c,userTags:V,state:l}=h,H=new Set(v.map((b)=>b.id)),f=[...d].filter((b)=>!O(b)).map((b)=>`User:${b}`),[F,A]=await Promise.all([k1(d),Y1(f)]),q=d.size<7,Q=[...v,...z].map(async(b)=>{let j=F.get(b.username);if(j!==void 0)M.set(b.username,j);let Y=A.get(b.username),I=H.has(b.id),{userRow:K,isLocked:_}=await e1({userRow:b,block:j,defaultBlock:I,userPage:Y,checkLock:q,state:l});if(_!==null)c.set(b.username,_);return V.set(b.username,b.block.tags),K});return await Promise.all(Q)}function I5(h){switch(h){case"CUrequest":return"{{CURequest}}";case"admin":return"{{awaitingadmin}}";case"clerk":return"{{Clerk Request}}";case"selfendorse":return"{{Requestandendorse}}";case"inprogress":return"{{Inprogress}}";case"decline":return"{{Decline}}";case"cudecline":return"{{Cudecline}}";case"endorse":return"{{Endorse}}";case"cuendorse":return"{{cu-endorsed}}";case"moreinfo":case"cumoreinfo":return"{{moreinfo}}";case"relist":return"{{relisted}}";case"hold":case"cuhold":return"{{onhold}}";case"reopen":return"{{reopen}}";case"checked":case"closed":return null;default:return console.warn("New case status",h,"is unexpected"),null}}function o0(h,v){let z=I5(v);if(z===null)return h;if(A0.test(h)){let d=h.replace(A0,z);if(!z)d=d.replace(/^(\s*\*\s*)? [-–] /,"$1");return d}else if(z)return"* "+z+" – "+h.replace(/^\s*\*\s*/,"");return h}function t2(h){if(d1.test(h))return"closed";if(/^open$/i.test(h))return"open";if(/^(?:inprogress|checking)$/i.test(h))return"inprogress";if(/^relist(ed)?$/i.test(h))return"relist";if(/^checked|completed$/i.test(h))return"checked";if(/^declined?$/i.test(h))return"decline";if(/^cudeclin(ed)?$/i.test(h))return"cudecline";if(/^endorsed?$/i.test(h))return"endorse";if(/^(?:CU|checkuser|CUrequest|request)$/i.test(h))return"CUrequest";if(/^cumoreinfo$/i.test(h))return"cumoreinfo";if(/^hold$/i.test(h))return"hold";if(/^cuhold$/i.test(h))return"cuhold";if(/^clerk$/i.test(h))return"clerk";if(/^admin$/i.test(h))return"admin";return"new"}async function g0(h){let v=new y({type:"notice",content:"Loading all sections"}).show(),z=k(h),d=(await Promise.all(h.sections.map(async(b)=>{let j=await m(b),Y=n.exec(j);if(!Y?.[1])return null;return d1.test(Y[1])?b:null}))).filter((b)=>b!==null),M=await z;if(v.update({type:"success",content:"All sections loaded"}),d.length===0){new y({type:"warning",content:"Nothing to archive"}).show();return}let c=await X(a.archiveName,!0);if((await p0(a.pageName)+await p0(a.archiveName))/W2()>=1){let b=0;while(c!==""){if(b>30){new y({type:"error",content:"Reached upper bound on possible archives, something probably went catastrophically wrong. Exiting"}).show();return}c=await X(`${a.archiveName}/${++b}`,!0)}let j=`${a.archiveName}/${b}`;await J1({sourcePage:a.archiveName,destPage:j,summary:"Moving archive to avoid exceeding post expand size limit",ignoreWarnings:!1,moveSubpages:!1})}let l=c!=="";if(l)c=c.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);else c=`__TOC__
{{SPI archive notice|1=${a.caseName}}}
{{SPIpriorcases}}
`;let H=l?await h1({pageName:a.archiveName}):[],f=j1(c,H);if(!f){new y({type:"notice",content:"Failed to parse existing archive sections, aborting archival"}).show();return}let F=0;for(let b of d){let j=await m(b);M=M.replace(j+`
`,"").replace(j,"");let Y=j.slice(j.search(e)).replace(n,"");if(c.includes(Y)){new y({type:"warning",content:`Section ${b.name} already exists in the archive`}).show();continue}let I=u1(b.name);if(!I){new y({type:"error",content:`Failed to parse date from section header "${b.name}", aborting archival`}).show();return}f.push({header:I,fullText:Y}),F++}if(F===0){new y({type:"warning",content:"Nothing to archive"}).show();return}c=$1(c,f);let A=F>1,q=`Archiving ${F} section${A?"s":""}`;if(await D({title:a.archiveName,newText:c,summary:`${q} from [[${a.prefixedName}]]`,watch:L.watch.archive,watchExpiry:L.expiry.archive})===null){new y({type:"error",content:"Failed to update archive, not removing sections from case page"}).show();return}await a.edit({newText:M,summary:`${q} to [[${W1()}${a.archiveName}]]`,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:a.startingRevId})}async function e2(h){let v=await m(h);v=v.replace(n,"");let z=await X(a.archiveName,!0),d=new y({type:"error",content:""});if(z.includes(v)){d.type="warning",d.content="Looks like the page has been archived already",d.show();return}if(z==="")z=`__TOC__
{{SPI archive notice|1=`+a.caseName+`}}
{{SPIpriorcases}}
`;else z=z.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);let M=new y({type:"notice",content:"Loading archive sections"}).show(),c=await h1({pageName:a.archiveName}),V=j1(z,c);if(V){M.update({type:"success",content:"Archive sections loaded"});let H=u1(h.name);if(!H){new y({type:"error",content:`Failed to parse date from section header '${h.name}'`}).show();return}V.push({header:H,fullText:v})}else{M.update({type:"error",content:"Failed to parse existing archive sections, aborting archival"});return}if(z=$1(z,V),await D({title:a.archiveName,newText:z,summary:`Archiving case section from [[${a.prefixedName}]]`,createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive})===null){d.content="Failed to update archive, not removing section from case page",d.show();return}await a.edit({newText:"",summary:`Archiving case section to [[${W1()}${a.archiveName}]]`,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:a.startingRevId,sectionId:h.id})}function p5(h){let{sock:v,noticeType:z,sockmaster:d,cuBlock:M}=h,c,V=z==="sock";if(V&&d&&v.username===T(d))V=!1;if(V)c=`== Blocked as a sockpuppet ==
`;else c=`== Blocked for sockpuppetry ==
`;if(M)c+="{{checkuserblock-account|sig=~~~~";else c+="{{subst:uw-sockblock|sig=yes";if(a.valid)c+="|spi="+a.caseName;if(Z0(v.block.duration))c+="|indef=yes";else if(c+="|time="+v.block.duration,M)c+="|indef=no";if(v.block.ntp)c+="|notalk=yes";if(V&&d)c+="|master="+d;return c+="}}",c}function m5(h,v,z,d){let M="Abusing [[WP:SOCK|multiple accounts]]";if(a.valid)M+=`: Please see: [[${a.prefixedName}]]`;if(U()&&h.cuBlock){let c=v?"{{checkuserblock}}":"{{checkuserblock-account}}";if(h.cuBlockOnly)M=c;else M=c+": "+M}else if(z){if(M=`{{rangeblock|1=${M}`,!d)M+="|create=yes";M+="}}"}return M}async function h5(h){let{sock:v,blockOptions:z}=h,d=mw.util.isIPAddress(v.username,!0),M=d&&!mw.util.isIPAddress(v.username,!1),c=m5(z,d,M,v.block.acb);return await K2({user:v.username,duration:v.block.duration,reason:c,reblock:z.override,anononly:d?v.block.abao:!1,accountcreation:v.block.acb,autoblock:d?!1:v.block.abao,notalkpage:v.block.ntp,noemail:v.block.nem,watchBlockedUser:L.watch.blocked,watchExpiry:L.expiry.blocked})}async function v5(h){let{sock:v,blockOptions:z,userTalkContent:d,talkNotices:M,defaultMaster:c}=h;if(M.length===0)return;let V=v.block.tags.find((F)=>r(F))?.master??c,l=z.cuBlock&&U()&&L.useCheckuserblockAccount,H=`User talk:${v.username}`,f=z.blankTalk?"":d??"";for(let F of M)f+=`
`+p5({sock:v,noticeType:F,sockmaster:V,cuBlock:l});await D({title:H,newText:f,summary:X1("Adding sockpuppetry block notice"),createonly:!1,watch:"nochange"})}async function U5(h){return(await Promise.all(h.map(async(z)=>(await f1(z))?.locked?null:z))).filter((z)=>z!==null)}var G5=6;async function z5(h){let{master:v,hideNames:z}=h,d=h.lockTargets.length<G5?await U5(h.lockTargets):h.lockTargets;if(d.length===0)return[];let M,c=d.length>1;if(!c&&d[0])M=`* {{LockHide|1=${d[0]}}}`;else{if(M="{{MultiLock",d.forEach((q,Q)=>{M+=`|${Q+1}=${q}`}),z)M+="|hidename=1";M+="}}"}let V,l="Global lock for ";if(z||!v)V=c?`${d.length} sockpuppets`:"a sockpuppet",l+=V;else V=`${d.length} [[Special:CentralAuth/${v}|${v}]] ${c?"socks":"sock"}`,l+=`${d.length} ${v} ${c?"socks":"sock"}`;let H=h.lockComment.trim().replace(/\.+$/,""),f=`=== Global lock for ${V} ===`;if(f+=`
{{status}}`,f+=`
${M}`,a.source==="spi"&&a.valid)f+=`
${c?"Sockpuppets":"Sockpuppet"} found in enwiki sockpuppet investigation, see [[${a.prefixedName}]].`;else if(a.source==="spi")f+=`
${c?"Sockpuppets":"Sockpuppet"} found in enwiki sockpuppet investigation.`;else f+=`
${c?"Sockpuppets":"Sockpuppet"} found in enwiki.`;if(H!=="")f+=` ${H}.`;f+=" ~~~~";let F=await X("meta:Steward requests/Global",!1);F=F.replace(/\n+(== See also == *\n)/,`

`+f+`

$1`),new y({type:"notice",content:"Filing global lock request"}).show();let A=await D({title:"meta:Steward requests/Global",newText:F,summary:`Global lock request for ${V}`,createonly:!1,watch:"nochange"});if(A){let q=N(`meta:Special:Diff/${A}#${l}`,"filed");new y({type:"success",content:`Global lock request ${q} successfully!`,isHtml:!0}).show()}else new y({type:"warning",content:"Global lock request failed."}).show();return d}async function p1(h){let v=new Date,z=v.toLocaleString("en",{month:"long"})+" "+v.toLocaleString("en",{year:"numeric"}),d="==\\s*"+z+"\\s*==",M=new RegExp(d,"i"),c=/==.*?==/i,V=r1(L.log.page),l=await X(V,!1);if(!l.match(M))if(L.log.reversed){let H=c.exec(l);if(H?.index)l=l.slice(0,H.index)+"== "+z+` ==
`+l.slice(H.index)}else l+=`
== `+z+" ==";if(L.log.reversed){let H=c.exec(l);if(H?.index)l=l.slice(0,H.index+H[0].length)+`
`+h+l.slice(H.index+H[0].length)}else l+=`
`+h;await D({title:V,newText:l,summary:"Logging spihelper edits",createonly:!1,watch:"nochange"})}async function E5(h,v,z){let d=await B0(h),M=await B0(v),c=[];return z.types.forEach((V)=>{let l=d.find((f)=>f.type===V),H=M.find((f)=>f.type===V);if(l&&H){let f=H.expiry;if(V1(H.expiry)||V1(l.expiry))f="infinite";else if(H.expiry<l.expiry)f=l.expiry;let F=z.levels.indexOf(l.level),A=z.levels.indexOf(H.level),q;if(F===-1||A===-1){console.error("Invalid protection information provided from API");return}else if(F>A)q=l.level;else q=H.level;c.push({type:l.type,expiry:f,level:q})}else if(l)c.push(l);else if(H)c.push(H)}),c}async function C5(h,v,z){let d=await K0(h),M=await K0(v),c={level:""};if(d&&M){if(V1(d.protection_expiry)||V1(M.protection_expiry))c.expiry="infinite";else if(M.protection_expiry<d.protection_expiry)c.expiry=d.protection_expiry;else c.expiry=M.protection_expiry;let V=z.levels.indexOf(d.protection_level),l=z.levels.indexOf(M.protection_level);if(V===-1||l===-1)return console.error("Invalid protection information provided from API"),c;else if(V>l)c.level=d.protection_level;else if(V<=l)c.level=M.protection_level}else if(d)c={level:d.protection_level,expiry:d.protection_expiry};else if(M)c={level:M.protection_level,expiry:M.protection_expiry};return c}async function d5(h){let{target:v,suppress:z,archiveNotice:d}=h,M=a,c=new _1(a.pageName.replace(a.caseName,v)),V=await X(c.pageName,!1);if(V)if(E()){if(!confirm("Target page exists, do you want to histmerge the cases?")){new y({type:"warning",content:"Aborted merge"}).show();return}}else{new y({type:"warning",content:"Target page exists and you are unable to histmerge, aborting merge"}).show();return}if(c.pageName===M.pageName){new y({type:"error",content:"Target page is the current page, aborting merge"}).show();return}let l=!1;if(V){let H=await X(M.archiveName,!1),f=await X(c.archiveName,!1);if(H&&f){new y({type:"notice",content:"Archives detected on both source and target cases, copying it manually."}).show(),H=H.replace(/^\s*__TOC__\s*$\n/gm,""),H=H.replace(M1,""),H=H.replace(O1,""),H=H.replace(/^\n*/,""),f+=`
`+H;let Q=await h1({content:f}),b=j1(f,Q);if(b)f=$1(f,b),await D({title:c.archiveName,newText:f,summary:`Merging archives from [[${M.prefixedName}]], see page history for attribution`,createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive}),l=!0;else new y({type:"error",content:"Could not parse the archive. Please merge the archives manually"}).show()}let F=await B2(),A=await E5(M.pageName,c.pageName,F),q=await C5(M.pageName,c.pageName,F);if(await _0(c.pageName,"Deleting as part of case merge"),await J1({sourcePage:M.pageName,destPage:c.pageName,summary:`Merging case to [[${c.prefixedName}]]`,ignoreWarnings:!0,suppressRedirect:z}),await _2(c.pageName,"Restoring page history after merge"),l)if(z)await _0(M.archiveName,`Archives moved to [[${c.archiveName}]]`);else await D({title:M.archiveName,newText:`#REDIRECT [[${c.archiveName}]]`,summary:"Redirecting old archive to new archive",createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive});if(A.length!==0){if(await D0(c.pageName,A),!z)await D0(M.pageName,A)}if(q.level!==""){if(await I0(c.pageName,q),!z)await I0(M.pageName,q)}}else await J1({sourcePage:M.pageName,destPage:c.pageName,summary:`Moving case to [[${c.prefixedName}]]`,suppressRedirect:z&&B1(),ignoreWarnings:!1});await x5({oldContext:M,newContext:c,oldNotice:d,deleteOld:z,preMergeText:V})}async function M5(h,v){let z=new _1(a.pageName.replace(a.caseName,h)),d=await X(z.pageName,!1),M=await m(v);if(M=M.replace(/\n*----(?!([\n.])*----)/,`
* {{clerknote}} originally filed under [[${a.pageName}]]. ~~~~
----`),d==="")d=`<noinclude>__TOC__</noinclude>
{{SPI archive notice|`+h+`}}
{{SPIpriorcases}}`;d+=`
`+M,z.edit({newText:d,summary:`Moving case section from [[${a.prefixedName}]], see page history for attribution`,createonly:!1,watch:L.watch.case,watchExpiry:L.expiry.case}),await a.edit({newText:"",summary:`Moving case section to [[${z.prefixedName}]]`,createonly:!1,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:a.startingRevId,sectionId:v.id})}function O5(h,v){let z=/\{\{sock\s+list[\s\S]*?\}\}/i.exec(h)?.[0];if(!z)return h.replace(H2,`====Suspected sockpuppets====
* {{checkuser|1=`+v+`}} ({{clerknote}} original case name)
`);let d=q0(z.slice(2,-2)),c=z.includes(`
`)?`
`:"",V=v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),l=v.toLowerCase(),H=d.positional.findIndex((A)=>A.toLowerCase()===l),f=-1;for(let[A,q]of Object.entries(d.params))if(/^\d+$/.test(A)&&q.toString().toLowerCase()===l){f=parseInt(A);break}let F;if(H>=0||f>=0){let A=f>=0?f:H+1;if(`note${A}`in d.params)F=z;else{let Q;if(f>=0){let b=new RegExp(`\\|\\s*${f}\\s*=\\s*${V}`,"i").exec(z);Q=b?b[0]:void 0}else{let b=new RegExp(`\\|(?![^|}\\n]*=)\\s*${V}\\s*(?=[|}\\n])`,"i").exec(z);Q=b?b[0]:void 0}F=Q?z.replace(Q,Q+`|note${A}=({{clerknote}} original case name)`):z}}else{let A=Object.keys(d.params).filter((K)=>/^\d+$/.test(K)).map(Number),Q=Math.max(0,...A,d.positional.length)+1,b=`${c}|${Q}=${v}|note${Q}=({{clerknote}} original case name)`,j=Object.keys(d.params).filter((K)=>!/^\d+$/.test(K)&&!/^note\d+$/.test(K)),Y=null;for(let K of j){let _=K.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),p=new RegExp(`(\\n?)\\|\\s*${_}\\s*=`).exec(z);if(p&&(Y===null||p.index<Y.index))Y={index:p.index,match:p}}let I;if(Y)I=Y.match.index;else{let K=z.lastIndexOf("}}");I=K-(z[K-1]===`
`?1:0)}F=z.slice(0,I)+b+z.slice(I)}return h.replace(z,F)}async function x5(h){let{oldContext:v,newContext:z,oldNotice:d,deleteOld:M,preMergeText:c}=h,V=new S({username:z.caseName}),l=V.generateWikitext();V.crosswiki=d.crosswiki,V.deny=d.deny,V.notalk=d.notalk,V.moot=d.moot;let H=[],f=[v.pageName],F=null;while(f.length!==0){if(F=f.pop(),!F||F===z.pageName)continue;H.push(F);let b=await X2(F);for(let j of b){if(j.title===z.pageName)continue;let Y=await A1({page:j.title});if(!Y)continue;if(Y.username===F.replace(/Wikipedia:Sockpuppet investigations\//g,"")){if(await D({title:j.title,newText:l,summary:"Updating backlink following page move",watch:L.watch.case,watchExpiry:L.expiry.case}),!H.includes(j.title))f.push(j.title)}}}if(M){if(!B1())await v.edit({newText:`{{db-g6|rationale=Case moved to [[${z.pageName}]], requesting deletion as non-admin SPI clerk}}`,summary:"Requesting [[WP:G6|G6]] deletion after case move",createonly:!1,watch:L.watch.archive,watchExpiry:L.expiry.archive})}else await v.edit({newText:l,summary:"Updating old case following page move",watch:L.watch.case,watchExpiry:L.expiry.case});let A=await X(z.pageName,!0);if(c){let b=c.replace(/\n*<noinclude>__TOC__.*\n/ig,"");b=b.replace(M1,""),b=b.replace(O1,""),A=A+`
`+b}A=A.replace(M1,V.generateWikitext()),A=O5(A,v.caseName);let q="(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?"+z.caseName+"(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)",Q=new RegExp(q,"sm");A=A.replace(Q,`$1
$2`),await z.edit({newText:A,summary:"Updating new case following page move",watch:L.watch.case,watchExpiry:L.expiry.case})}function c5(h){return D({title:h,newText:"{{sockpuppet category}}",summary:X1("Creating sockpuppet category"),createonly:!0,watch:L.watch.categories,watchExpiry:L.expiry.categories})}function N5(h,v){if(h.length!==v.length)return!1;let z=Array(v.length).fill(!1);for(let d of h){let M=!1;for(let c=0;c<v.length;c++){let V=v[c];if(!V)continue;if(!z[c]&&d.equals(V)){z[c]=!0,M=!0;break}}if(!M)return!1}return!0}function R5(h,v){let z=/\n?\{\{\s*sock\w*\b[\s\S]*?}}/gi,d=[...h.matchAll(z)];if(d.length===0)return v;let M=d[0];if(!M)return v;let c=M[0];return h=h.replace(c,v),d.slice(1).forEach((V)=>{let l=V[0];h=h.replace(l,"")}),h}async function V5(h){let{sock:v,pageText:z,blocked:d,tagNonLocalAccounts:M}=h;if(O(v.username))return!1;let c=await f1(v.username);if(!c)return new y({type:"warning",content:`The account ${v.username} does not exist and so has not been tagged`}).show(),!1;if(!M&&!c.existsLocally)return new y({type:"warning",content:`The account ${v.username} does not exist locally and so has not been tagged`}).show(),!1;v.block.tags.forEach((A)=>{A.locked=c.locked});let V=S1(z),l=v.block.tags.reduce((A,q)=>{let Q=r(q)&&!q.master,b=A.some((j)=>j.equals(q));if(!Q&&!b)A.push(q);return A},[]);if(N5(V,l)){let A=N(`User:${v.username}`);return new y({type:"notice",content:`Tags are unmodified, skipping ${A}`,isHtml:!0}).show(),!1}let H=l.map((A)=>A.generateWikitext(d)).join(`
`),f=R5(z,H),F=V.length<l.length?"Adding":"Updating";return D({title:`User:${v.username}`,newText:f,summary:X1(`${F} sockpuppetry tag`),createonly:!1,watch:L.watch.tagged,watchExpiry:L.expiry.tagged}).then((A)=>A!==null)}function u5(h){let v=new Map;function z(d){if(!v.has(d))v.set(d,{confirmed:!1,suspected:!1});return v.get(d)??{confirmed:!1,suspected:!1}}for(let d of h)for(let M of d.block.tags){if(l1(M))continue;let c=z(M.master);if(M.status==="proven"||M.status==="confirmed")c.confirmed=!0;if(M.status==="blocked")c.suspected=!0;if(M.altmaster){let V=z(M.altmaster);if(M.altmasterStatus==="proven")V.confirmed=!0;if(M.altmasterStatus==="suspected")V.suspected=!0}}return v}async function l5(h){let v=new Map,z=u5(h);for(let[d,{confirmed:M,suspected:c}]of z){if(!d)continue;let V=!1;if(M){let l=`Category:Wikipedia sockpuppets of ${d}`;if(!await X(l,!1))await c5(l),V=!0}if(c){let l=`Category:Suspected Wikipedia sockpuppets of ${d}`;if(!await X(l,!1))await c5(l),V=!0}v.set(d,V)}return v}async function H5(h){x("oneClickArchive"),new y({type:"notice",content:"Starting OCA"}).show();let v=await k(h,{show:!0,purge:!0});if(!e.test(v)){new y({type:"notice",content:"Looks like the page has been archived already"}).show(),B("oneClickArchive","success");return}await L1(h),await g0(h);let z=`* [[${a.pageName}]]: used one-click archiver ~~~~~`;if(L.log.enabled)await p1(z);new y({type:"notice",content:"Refreshing data"}).show(),await a.refreshRevId(),await L1(h),new y({type:"success",content:"Done!"}).show(),B("oneClickArchive","success")}async function f5(h){let{actions:v,accounts:z,state:d}=h;if(Object.values(v).every((_)=>!_.enabled)){new y({type:"warning",content:"No actions are enabled"}).show();return}if(!d.selectedSection){console.error("spiHelperPerformActions: Expected a selected section, got null"),new y({type:"error",content:"Expected a selected section, got null"}).show();return}if(!d.archiveNotice){console.error("spiHelperPerformActions: Could not find archive notice"),new y({type:"error",content:"Could not find archive notice"}).show();return}if(!v.block.data.master){console.error("spiHelperPerformActions: Could not get master"),new y({type:"error",content:"Could not get master"}).show();return}let M=d.selectedSection.type;new y({type:"notice",content:"Running actions"}).show();let c=[],V=`* [[${a.pageName}]]`;if(d.selectedSection.type==="specific")V+=` (section ${d.selectedSection.section.name})`;else V+=" (full case)";V+=" ~~~~~";let l=await(M==="specific"?m(d.selectedSection.section):k(d));if(!l){new y({type:"error",content:"Could not fetch text for the page"}).show();return}let H=l,f=[],F=[],A=[],q=Promise.resolve([]);if(v.block.enabled)({blockPromises:f,tagPromises:F,talkNoticePromises:A,lockPromise:q}=await i0({accounts:z,blockData:v.block.data}));let Q=Promise.all([Promise.all(f),Promise.all(F),q]),b=Promise.all(A);if(!a.isArchive){if(M==="specific"){if(n.exec(l)===null)l=l.replace(/^(\s*===.*===[^\S\r\n]*)/,`$1
{{SPI case status|}}`),v.status.data.old="new";if(v.status.data.new==="nochange")v.status.data.new=v.status.data.old;if(v.status.enabled&&v.status.data.new!==v.status.data.old){let p=S5(v.status.data.new,l);if(l=p.targetText,p.newStatus!=="nochange")c.push(p.summaryItem),V+=`
** changed case status from ${v.status.data.old} to ${p.newStatus}`}if(v.comment.enabled&&v.comment.data.text.trim()!=="*")l=P5(l,v.comment.data.text),c.push("comment"),V+=`
** commented`}else if(v.management.enabled){let _=v.management.data.flags;d.archiveNotice=new S({username:d.archiveNotice.username||a.caseName,deny:_.has("deny"),crosswiki:_.has("crosswiki"),notalk:_.has("notalk"),moot:_.has("moot")});let p=d.archiveNotice.generateWikitext();l=l.replace(M1,p),c.push("update archivenotice"),V+=`
** Updated archivenotice`}}if(c.length===0)c.push("Saving page");let j=v.move.enabled||v.archive.enabled;if(!a.isArchive&&l!==H){let _=d.selectedSection.type==="all"?null:d.selectedSection.section.id,p=T5(c),W=await a.edit({newText:l,summary:p,watch:L.watch.case,watchExpiry:L.expiry.case,baseRevId:a.startingRevId,sectionId:_});if(W===null){if(new y({type:"error",content:"Failed to save edit"}).show(),!j)await a.refreshRevId()}else{if(d.selectedSection.type==="specific"){if(d.selectedSection.section._text=l,d._text)d._text=d._text.replace(H,l)}else d._text=l;a.startingRevId=W}}if(v.archive.enabled)switch(d.selectedSection.type){case"all":{V+=`
** Archived case`,await g0(d);break}case"specific":{V+=`
** Archived section`,await e2(d.selectedSection.section);break}}else if(v.move.enabled){let _=T(v.move.data.target);if(_)switch(d.selectedSection.type){case"all":{V+=`
** moved/merged case to `+_,await d5({target:_,suppress:v.move.data.suppress,archiveNotice:d.archiveNotice});break}case"specific":{V+=`
** moved section to `+_,await M5(_,d.selectedSection.section);break}}}let[Y,I,K]=await Q;if(await b,L.log.enabled)V+=R1({blockedUsers:Y,taggedUsers:I,lockedUsers:K}),await p1(V);if(j){if(v.move.enabled&&d.selectedSection.type==="all")await L1(d);if(d.selectedSection.type==="specific")d.selectedSection=null;await a.refreshRevId()}new y({type:"success",content:"Done!"}).show()}function P5(h,v){if(!h.includes(`
----`))h=h.replace(/<!-+ All comments go ABOVE this line, please. -+>/,""),h+=`
----<!-- All comments go ABOVE this line, please. -->`;if(v=N1(v.trimEnd()),G()||E())return h.replace(/\n*----(?!.*----)/s,`
${v}
----`);else return h.replace(y1,`
`+v+`

====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====
`)}function S5(h,v){let z="";switch(h){case"reopen":h="open",z="Reopening";break;case"open":z="Marking request as open";break;case"CUrequest":z="Adding checkuser request";break;case"admin":z="Requesting admin action";break;case"clerk":z="Requesting clerk action";break;case"selfendorse":h="endorse",z="Adding checkuser request (self-endorsed for checkuser attention)";break;case"checked":z="Marking request as checked";break;case"inprogress":z="Marking request in progress";break;case"decline":z="Declining checkuser";break;case"cudecline":z="CU declining checkuser";break;case"endorse":z="Endorsing for checkuser attention";break;case"cuendorse":z="CU endorsing for checkuser attention";break;case"moreinfo":case"cumoreinfo":z="Requesting additional information";break;case"relist":z="Relisting case for another check";break;case"hold":z="Putting case on hold";break;case"cuhold":z="Placing checkuser request on hold";break;case"closed":z="Closing case";break;case"nochange":break;default:console.error("Unexpected case status value",h)}let d=n.exec(v);if(d?.[0])v=v.replace(d[0],`{{SPI case status|${h}}}`);return{newStatus:h,summaryItem:z,targetText:v}}async function i0(h){let v=[],z=[],d=[],M=Promise.resolve([]),{userLocks:c,options:V,lockcomment:l,master:H,skipCUVerifyUsers:f}=h.blockData,F=h.accounts.filter((W)=>W.username!==""),A=[];await l5(F);let q=E()&&!V.noBlock,{allUsernames:Q,allUserPages:b,allUserTalkPages:j}=F.reduce((W,w)=>{return W.allUsernames.add(w.username),W.allUserPages.push(`User:${w.username}`),W.allUserTalkPages.push(`User talk:${w.username}`),W},{allUsernames:new Set,allUserPages:[],allUserTalkPages:[]}),Y=new y({type:"notice",content:"Fetching user blocks and tags"}).show(),[I,K,_]=await Promise.all([k1(Q),Y1(b),Y1(j)]);Y.update({type:"success",content:"Got previous blocks and tags"});let p=async(W,w)=>{return await V5({sock:W,pageText:K.get(W.username)??"",blocked:w,tagNonLocalAccounts:V.tagUnattached})?W.username:null};for(let W of F){if(W.block.lock&&!O(W.username)){if(c.get(W.username)!==!0)A.push(W.username)}if(q&&W.block.block){let w=[];if(V.addMasterNotice&&(W.block.tags.some((E1)=>l1(E1))||W.username===H))w.push("master");else if(V.addSockNotice)w.push("sock");let l2=Math.max(500,F.length*100);v.push((async()=>{let E1=I.get(W.username);if(E1!==void 0&&!V.override){let s=new y({type:"warning",content:`Block target ${W.username} is already blocked. `});if(W.block.tags.length>0)s.content+="Proceeding with tagging",z.push(p(W,!0));else s.content+='Check the "override existing blocks" box to re-block them';return s.show(),null}let F0=E1?.reason;if(!U()&&!f.has(W.username)&&V.override&&F0&&C1.exec(F0)){let s="User "+W.username+` is CheckUser-blocked, are you SURE you want to re-block them?
Current block message:
`+F0;if(!confirm(s))return null}if(!W.block.duration)return new y({type:"error",content:`Block target ${W.username} does not have an intended duration`}).show(),null;if(await new Promise((s)=>setTimeout(s,Math.random()*l2)),!await h5({sock:W,blockOptions:V}))return null;if(w.length>0)d.push(v5({sock:W,userTalkContent:_.get(W.username),blockOptions:V,talkNotices:w,defaultMaster:H}));if(W.block.tags.length>0)z.push(p(W,!0));return W.username})())}else if(W.block.tags.length>0)z.push(p(W,I.has(W.username)))}if(A.length>0){let W=V.lockHideNames;M=z5({lockTargets:A,hideNames:W,master:H,lockComment:l})}return{blockPromises:v,tagPromises:z,talkNoticePromises:d,lockPromise:M}}function T5(h){let[v,...z]=h;if(!v)return"";let d=v.charAt(0).toUpperCase()+v.slice(1),M=z.length?`, ${z.join(", ")}`:"";return d+M}function k5(h){let v=$(`a[href$="section=${h}"]`).first();if(v.length===0)return null;let z=v.parentsUntil(":has(hr)").last().nextUntil("hr");return z.length>0?z:null}function L5(h){let v=$(`a[href$="section=${h}"]`).first();if(v.length===0)return null;let z=v.closest(".mw-heading");return z.length>0?z.get(0)??null:null}function a5(h){let v=L5(h);if(v)v.scrollIntoView({behavior:"smooth",block:"center"})}function F5(){return document.querySelector("#mw-content-text .mw-parser-output")}function w5(h){let v=F5(),z=L5(h);if(!v||!z)return null;let M=k5(h)?.last().get(0)??z,c=v.getBoundingClientRect(),V=z.getBoundingClientRect(),l=M.getBoundingClientRect(),H=Math.min(V.top,l.top)-c.top+v.scrollTop,f=Math.max(V.bottom,l.bottom)-c.top+v.scrollTop;return{top:H,height:Math.max(1,f-H)}}function n5(){let h=F5();if(!h)return null;let v=document.createElement("div");return v.style.display="none",v.className="spiHelper-section-overlay",h.appendChild(v),v}function r5(h,v,z){let d=w5(v);if(!h||!d)return;h.style.top=`${Math.max(0,d.top)}px`,h.style.height=`${d.height+8}px`,h.style.display="block",h.classList.toggle("spiHelper-section-overlay--preview",z==="preview"),h.classList.toggle("spiHelper-section-overlay--selected",z==="selected")}function A5(h,v){let z=/v-\d+-(\d+)/.exec(h.id);if(z===null||z.length<2)return null;let d=Number(z[1]),M=v[d-1];if(!M||M.value==="all")return null;return typeof M.value==="number"?M.value:null}var c0=null;function o5(){return c0??=n5(),c0}function V0(h,v){let z=o5();r5(z,h,v)}function m1(){if(c0)c0.style.display="none"}var s0=Z({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0}},data(){let h=u0(),v=Object.keys(h);return{open:!1,handlers:{openHandler:null,beforeUnloadHandler:null},actionsRunning:!1,displayedForms:new Set(["sections"]),unpinned:!L.interface.pinned,buttonLayout:L.interface.buttonLayout,actionButtons:h,actionButtonKeys:v,sectionAccountNames:new Set,caseActions:P0(),accounts:[],messages:R,icons:{cdxIconPushPin:g1,cdxIconCollapse:N2,cdxIconExpand:u2,cdxIconFeedback:F1}}},computed:{allDisabled(){for(let[h,v]of Object.entries(this.caseActions)){if(h==="sections"||h==="link")continue;if(v.enabled)return!1}return!0},selectedSection(){return this.state.selectedSection},archiveNotice(){return this.state.archiveNotice},stateSections(){return this.state.sections},mountPoint(){return this.$el.parentElement}},watch:{unpinned(h){if(!this.mountPoint){console.error("TopViewComponent unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");L.interface.pinned=!h},async open(h){if(h)await this.ensureArchiveNotice(),this.syncSelectedSectionOverlay();else this.syncSelectedSectionOverlay(),g()},async stateSections(h){if(this.caseActions.sections.data.section===null){let v=h[0];if(v)this.caseActions.sections.data.section=v.id,await this.ensureArchiveNotice(),await this.loadNewSection(v),this.syncSelectedSectionOverlay();else await this.onUpdateSectionSelection("all")}},archiveNotice(h){this.caseActions.management.data.flags=r0(h)},"caseActions.sections.data.section"(h,v){if(h===v)return;for(let[z,d]of Object.entries(this.caseActions)){let M=z;if(M==="sections")continue;let c=L.defaultActions.includes(M);if(d.enabled=c,c&&(S0.has(M)||h==="all"&&i2.has(M)||typeof h==="number"&&g2.has(M)))this.displayedForms.add(M)}}},mounted(){if(!this.mountPoint){console.error("TopViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.handlers.beforeUnloadHandler=(h)=>{let v=T1("mainActions");if(!this.allDisabled&&v!=="success")h.preventDefault()},this.handlers.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"top"}),this.handlers.beforeUnloadHandler)window.addEventListener("beforeunload",this.handlers.beforeUnloadHandler)}else if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler)},this.openButton.addEventListener("click",this.handlers.openHandler)},beforeUnmount(){if(this.handlers.openHandler)this.openButton.removeEventListener("click",this.handlers.openHandler);if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler)},methods:{syncSelectedSectionOverlay(){if(!L.highlightSection||!this.open){m1();return}let h=this.state.selectedSection;if(h?.type!=="specific"){m1();return}V0(h.section.id,"selected")},toggleButtonLayout(){this.buttonLayout=!this.buttonLayout,L.interface.buttonLayout=this.buttonLayout},onActionClick(h,v){let z=v;if(h.ctrlKey||h.metaKey)if(this.displayedForms.has(z))this.displayedForms.delete(z);else this.displayedForms.add(z);else this.displayedForms=new Set([z])},onAccordionToggle(h){let v=h;if(this.displayedForms.has(v))this.displayedForms.delete(v);else this.displayedForms.add(v)},isVisible(h){return this.displayedForms.has(h)},async onUpdateSectionSelection(h){if(h===null)return;if(this.caseActions.sections.data.section=h,(this.state.selectedSection?.type??null)!==(h==="all"?"all":"specific"))this.displayedForms=new Set(Array.from(this.displayedForms).filter((M)=>S0.has(M)));if(h==="all"){this.state.selectedSection={type:"all"},this.loadSectionAccounts(this.state.selectedSection);return}let d=this.state.sections.find((M)=>M.id===h);if(d===void 0){console.error("onUpdateSectionSelection: Could not find target section with ID",h);return}await this.loadNewSection(d)},async loadNewSection(h){this.state.selectedSection={type:"specific",section:h};let v=await m(h),z=n.exec(v),d=t2(z?.[1]??"");if(this.caseActions.status.data.old=d,this.caseActions.status.data.new=d,d==="closed"&&L.tickArchiveWhenCaseClosed)this.caseActions.archive.enabled=!0;this.loadSectionAccounts(this.state.selectedSection)},async loadSectionAccounts(h){this.accounts=this.accounts.filter((V)=>!this.sectionAccountNames.has(V.username));let v=await(h.type==="all"?k(this.state):m(h.section)),[z,d,M]=K1({text:v,fullSearch:!0,state:this.state}),c=await b1({likelySocks:z,possibleSocks:d,allUsernames:M,userBlocks:this.caseActions.block.data.userBlocks,userLocks:this.caseActions.block.data.userLocks,userTags:this.caseActions.block.data.userTags,state:this.state});this.sectionAccountNames=new Set(this.massAddUserRows(c).map((V)=>V.username))},onUpdateNewStatus(h){this.caseActions.comment.data.text=o0(this.caseActions.comment.data.text,h)},async onSubmitActions(){if(H1("mainActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"top"}),x("mainActions"),this.actionsRunning=!0,await f5({actions:this.caseActions,accounts:this.accounts,state:this.state}),B("mainActions","success"),this.actionsRunning=!1},handleFetchRows(){let[h,v]=K1({text:this.caseActions.comment.data.text,fullSearch:!1,state:this.state}),z=new Set(h),d=[...h,...v].map((M)=>D1({userRow:M,defaultBlock:z.has(M)}));this.massAddUserRows(d)},handleUserSelected(h,v){let z=this.accounts.find((d)=>d.id===v);if(!z)return;if(h.blockid!==void 0&&!this.caseActions.block.data.userBlocks.has(z.username)){let d=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.caseActions.block.data.userBlocks.set(z.username,{username:z.username,duration:h.blockexpiry??"",abao:d??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}d0(h,z)},handleAddRow(h){h??=z1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((v)=>!h.includes(v.id))},massAddUserRows(h){let v=this.accounts.at(-1)?.username==="",z=new Set(this.accounts.map((M)=>M.username)),d=h.filter((M)=>!z.has(M.username));if(v)d.forEach((M)=>{this.accounts.splice(this.accounts.length-1,0,M)});else this.accounts=this.accounts.concat(d);return d},async ensureArchiveNotice(){if(this.state.archiveNotice)return;let h=await A1({page:a.casePageName,state:this.state});if(h===null)this.state.archiveNotice=new S({username:a.caseName}),new y({type:"warning",content:"Can't find archivenotice template! Automatically adding the archive notice to the page."}).show(),mw.notify("Can't find archivenotice template! If this is incorrect, please contact DatGuy",{type:"warn"}),console.warn("archivenoticeResult is null");else this.state.archiveNotice=h},launchFeedback(){this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`SPI form v${u}-${C}`})},async handleMoveEntireCase(){await this.onUpdateSectionSelection("all"),this.caseActions.move.enabled=!0}},template:`
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
  `});var t0=Z({props:{enabled:{type:Boolean,required:!0},selection:{type:Object,required:!0},statusData:{type:Object,required:!0}},emits:["update:enabled"],computed:{badStatus(){return this.selection!=="all"&&this.status!=="closed"},status(){switch(this.statusData.new){case"nochange":return this.statusData.old;case"selfendorse":return"endorse";default:return this.statusData.new}}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus" type="warning" :inline="true">
      The selected section status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
  `});var l0=Z({props:{accounts:{type:Array,required:!0},blockOptions:{type:Object,required:!0},userLocks:{type:Map,required:!0},userBlocks:{type:Map,required:!0},defaultMaster:{type:String,required:!0},fetchType:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","update:blockOptions","removeRows","addRow","userSelected","usernameChanged","fetchRows"],data(){let h=[{id:"username",label:"Username"},{id:"tag",label:"Tag"},{id:"lock",label:"Request Lock"}],v=E(),z=U(),d=G();if(v)h.splice(1,0,...[{id:"block",label:"Block"},{id:"duration",label:"Duration"},{id:"acb",label:"ACB"},{id:"abao",label:"AB/AO"},{id:"ntp",label:"NTP"},{id:"nem",label:"NEM"}]);return{columns:h,selectedRows:[],topButtonActions:{copied:!1,fetched:!1},isAdmin:v,isCheckuser:z,isClerk:d,popovers:{all:{open:!1,tag:null},row:{anchor:null,open:!1,tag:null,tagIndex:0,rowId:null},clipboardTag:null},cdxIconCopy:o1,cdxIconDownload:R2,cdxIconTrash:i,cdxIconUserAvatar:s1,cdxIconUserAvatarOutline:t1}},computed:{selectAll(){return this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)},allowLockOption(){return this.accounts.some((h)=>h.block.lock&&!O(h.username)&&!this.userLocks.get(h.username))}},methods:{isNonRegisteredAccount:O,isSockmasterTag:l1,setAllValue(h){let v=this.getTargetRows().filter((z)=>!this.isCheckboxDisabled(z,h));return v.length>0&&v.every((z)=>z.block[h])},setAllIndeterminate(h){let v=this.getTargetRows().filter((d)=>!this.isCheckboxDisabled(d,h)),z=v.filter((d)=>d.block[h]).length;return z>0&&z<v.length},isCheckboxDisabled(h,v){if(v==="lock"){if(h===null)return!1;return O(h.username)||this.userLocks.get(h.username)===!0}if(v==="block"){if(h===null)return this.blockOptions.noBlock;return this.blockOptions.noBlock||!this.blockOptions.override&&this.userBlocks.get(h.username)!==void 0}if(this.blockOptions.noBlock)return!0;if(h===null)return!this.getTargetRows().some((d)=>d.block.block);if(!h.block.block)return!0;let z=this.userBlocks.get(h.username);if(v==="duration")return!this.blockOptions.override&&z!==void 0;return!this.blockOptions.override&&(z?.[v]??!1)},async copySocks(){if(this.selectedRows.length===0)return;let h="{{sock list",v=0;this.selectedRows.forEach((z)=>{let d=this.accounts[z];if(!d)return;h+=`|${++v}=${d.username}`}),h+="}}",await navigator.clipboard.writeText(h),this.topButtonActions.copied=!0},onMessageDismissed(h){setTimeout(()=>{this.topButtonActions[h]=!1},200)},removeSocks(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},addDefaultRow(){this.$emit("addRow")},handleSelectAll(h){if(this.selectAllIndeterminate=!1,h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,v){this.$emit("userSelected",h,v.id)},setAllBlockFields(h,v){for(let z of this.getTargetRows()){if(this.isCheckboxDisabled(z,h))continue;z.block[h]=v}},setAllTags(h){for(let v of this.getTargetRows()){if(O(v.username))continue;v.block.tags=[h.clone()]}},getTargetRows(){if(this.selectedRows.length===0)return this.accounts;let h=new Set(this.selectedRows);return this.accounts.filter((v,z)=>h.has(z))},fetchSocks(){this.topButtonActions.fetched=!0,this.$emit("fetchRows")},showTagPopover(h,v,z,d){this.popovers.row.tag=h,this.popovers.row.tagIndex=v,this.popovers.row.rowId=z,this.popovers.row.anchor=d.currentTarget,this.popovers.row.open=!0},handleTagUpdate(h){let v=this.accounts.find((z)=>z.id===this.popovers.row.rowId);if(!v){console.error("Could not find target row for tag update",this.popovers.row.rowId);return}v.block.tags.splice(this.popovers.row.tagIndex,1,h)},handleTagDelete(){let h=this.accounts.find((v)=>v.id===this.popovers.row.rowId);if(!h){console.error("Could not find target row for tag delete",this.popovers.row.rowId);return}h.block.tags.splice(this.popovers.row.tagIndex,1)},handleTagAdd(h){let v=this.accounts.find((d)=>d.id===h);if(!v)return console.error("Could not find target row for tag add",h),null;let z=new P({master:this.defaultMaster,status:"blocked"});return v.block.tags.push(z),z},getRowTagsWithDefault(h){if(h.length===0)return[null];else return h},handleTagAddAll(){for(let h of this.getTargetRows()){if(O(h.username))continue;h.block.tags.push(new P({master:this.defaultMaster,status:"blocked"}))}},handleTagDeleteAll(){for(let h of this.getTargetRows())h.block.tags.length=0},validateTag(h){return!(r(h)&&!h.master)}},template:`
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
                            :disabled="isCheckboxDisabled(null, 'block')">
                Set all block
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <expiry-input placeholder="Duration" @update:model-value="setAllBlockFields('duration', $event)"
                            :disabled="isCheckboxDisabled(null, 'duration')" />
            </th>

            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('acb')" :indeterminate="setAllIndeterminate('acb')"
                            @update:model-value="setAllBlockFields('acb', $event)"
                            :disabled="isCheckboxDisabled(null, 'acb')">
                Set all account creation blocked
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('abao')" :indeterminate="setAllIndeterminate('abao')"
                            @update:model-value="setAllBlockFields('abao', $event)"
                            :disabled="isCheckboxDisabled(null, 'abao')">
                Set all autoblock/anon-only
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('ntp')" :indeterminate="setAllIndeterminate('ntp')"
                            @update:model-value="setAllBlockFields('ntp', $event)"
                            :disabled="isCheckboxDisabled(null, 'ntp')">
                Set all no talk page
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('nem')" :indeterminate="setAllIndeterminate('nem')"
                            @update:model-value="setAllBlockFields('nem', $event)"
                            :disabled="isCheckboxDisabled(null, 'nem')">
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
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllValue('lock')" :indeterminate="setAllIndeterminate('lock')"
                            @update:model-value="setAllBlockFields('lock', $event)"
                            :disabled="isCheckboxDisabled(null, 'lock')">
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
                        :disabled="isCheckboxDisabled(row, 'block')">
            Block
          </cdx-checkbox>
        </template>

        <template #item-duration="{ item, row }">
          <expiry-input v-model="row.block.duration" :shortened="true" :auto-dismiss="true" :touched="true"
                        :disabled="isCheckboxDisabled(row, 'duration')"
                        placeholder="Duration" />
        </template>

        <template #item-acb="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.acb"
                        :disabled="isCheckboxDisabled(row, 'acb')">
            Account creation blocked
          </cdx-checkbox>
        </template>
        <template #item-abao="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.abao"
                        :disabled="isCheckboxDisabled(row, 'abao')">
            Autoblock/Anon-only
          </cdx-checkbox>
        </template>
        <template #item-ntp="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.ntp"
                        :disabled="isCheckboxDisabled(row, 'ntp')">
            No talk page
          </cdx-checkbox>
        </template>
        <template #item-nem="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.nem"
                        :disabled="isCheckboxDisabled(row, 'nem')">
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
                        :disabled="isCheckboxDisabled(row, 'lock')">
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
  `});var e0=Z({props:{enabled:{type:Boolean,required:!0},text:{type:String,required:!0},selectedSection:{type:Object,required:!0}},emits:["update:enabled","update:text"],data(){let h=[{value:"takenote",label:"Note"}],v=[...F2],z=[...a2];if(U())h.unshift({value:"cunote",label:"CheckUser note"});if(E())h.unshift({value:"adminnote",label:"Administrator note"});if(G())h.unshift({value:"clerknote",label:"Clerk note"});let d=R0(L.custom.commentTemplates);return{noteTemplates:h,clerkTemplates:v,cuTemplates:z,customTemplates:d,loadingPreview:!1,htmlPreview:"",fullPreview:L.interface.fullPreview,cdxIconReload:i1}},computed:{commentBox(){return this.$refs.commentBox}},methods:{onEnable(h){if(this.$emit("update:enabled",h),h)this.$nextTick(()=>{this.commentBox.focus()})},onTextUpdate(h){this.$emit("update:text",h)},async updatePreview(){this.loadingPreview=!0;let h=N1(this.text);try{if(this.fullPreview&&this.selectedSection?.type==="specific"){let v=await m(this.selectedSection.section),z,d;if(G()||E())z=y1.exec(v)?.index,d=/\n*----(?!.*----)/s.exec(v)?.index;else z=/\s*====\s*<big>Comments by other users<\/big>\s*====\s*/i.exec(v)?.index,d=y1.exec(v)?.index;let M=v.slice(z??0,d??0).trim()+`
`+h;this.htmlPreview=await X0(a.pageName,M)}else this.htmlPreview=await X0(a.pageName,h)}finally{this.loadingPreview=!1}},insertNote(h){let v=this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i,"* {{"+h+"}} ");this.$emit("update:text",v),this.commentBox.focus()},insertText(h){h=`{{${h.replace(/^{+|}+$/g,"")}}}`;let v=this.commentBox.$el.querySelector("textarea");if(!v){console.error("commentAction: Unable to find textarea");return}let{selectionStart:z,selectionEnd:d}=v,M=this.text;if(z||z===0)M=M.slice(0,z)+h+M.slice(d,M.length),v.selectionStart=z+h.length,v.selectionEnd=d+h.length;else M+=h;this.$emit("update:text",M),this.commentBox.focus()}},template:`
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
  `});var h2=Z({props:{enabled:{type:Boolean,required:!0},oldStatus:{type:String,required:!0},newStatus:{type:String,required:!0}},emits:["update:enabled","update:newStatus"],computed:{selected:{get(){let h=this.caseStatusItems.flatMap((z)=>I1(z)?z.items:[z]);if(this.newStatus==="nochange")return h.some((d)=>d.value===this.oldStatus)?this.oldStatus:"nochange";return h.some((z)=>z.value===this.newStatus)?this.newStatus:"nochange"},set(h){if(h===null)return;this.$emit("update:newStatus",String(h))}},caseStatusItems(){let h=[],v=[],z=[],d=[],M=U(),c=G(),V=/^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.oldStatus),l=/^endorsed?$/i.test(this.oldStatus),H=/^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclin(ed)?)$/i.test(this.oldStatus),f=`No change (${this.oldStatus})`;if(h.push({label:f,value:"nochange"}),d1.test(this.oldStatus))h.push({label:"Reopen",value:"reopen"});else h.push({label:"Open",value:"open"});if(h.push({label:"Close",value:"closed"}),z.push({label:"Request CheckUser",value:"CUrequest"}),M)z.push({label:"Check in progress",value:"inprogress"});if(c){if(z.push({label:"Request and self-endorse",value:"selfendorse"}),v.push({label:"Request more information",value:"moreinfo"}),M)z.push({label:"Mark as checked",value:"checked"});if(H)z.push({label:"Relist for another check",value:"relist"})}if(c){if(V){if(M)z.push({label:"Endorse CheckUser",value:"cuendorse"}),z.push({label:"Decline CheckUser",value:"cudecline"});else z.push({label:"Endorse for CheckUser attention",value:"endorse"}),z.push({label:"Decline CheckUser",value:"decline"});v.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}else if(l){if(U())z.push({label:"Decline CheckUser",value:"cudecline"});else z.push({label:"Decline CheckUser",value:"decline"});v.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}}if(v.push({label:"Place case on CU hold",value:"cuhold"}),v.push({label:"Place case on hold",value:"hold"}),d.push({label:"Request clerk action",value:"clerk"}),E()||c)d.push({label:"Request admin action",value:"admin"});let F=[v.length?{label:"Clerking",items:v}:null,z.length?{label:"CheckUser",items:z}:null,d.length?{label:"Deferral",items:d}:null].filter((A)=>A!==null);return[...h,...F]}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
    </action-container>
  `});var H0=Z({props:{accounts:{type:Array,required:!0},caseName:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","removeRows","addRow","userSelected","usernameChanged"],data(){let h=[{id:"username",label:"Username"},{id:"analyser",label:"Interaction Analyser"},{id:"timeline",label:"Timeline"},{id:"timecard",label:"Timecard"},{id:"pages",label:"Pages"},{id:"summary",label:"Summaries"},{id:"cuwiki",label:"CU wiki"}],v=h.slice(1);return{columns:h,optionColumns:v,selectedRows:[],cdxIconAdd:a1,cdxIconTrash:i}},computed:{columnState(){let h=this.accounts,v={};for(let z of this.optionColumns){if(h.length===0){v[z.id]={checked:!1,indeterminate:!1};continue}let d=h.map((V)=>V.link[z.id]),M=d.every(Boolean),c=d.every((V)=>!V);v[z.id]={checked:M,indeterminate:!M&&!c}}return v},allColumnsChecked(){return this.accounts.length>0&&this.optionColumns.every((h)=>this.columnState[h.id].checked)},allColumnsIndeterminate(){let h=this.optionColumns.filter((v)=>this.columnState[v.id].checked).length;return h>0&&h<this.optionColumns.length},linkItems(){let h={};for(let v of this.optionColumns){let z=this.getLinkFormat(v.id);if(z===null){console.error("Couldn't find link format for",v.id);continue}let d=z.baseUrl(this.caseName),M=this.accounts.reduce((c,V)=>{if(V.link[v.id])c.push(z.userQueryStringWrapper+V.username+z.userQueryStringWrapper);return c},[]);if(M.length===0)continue;if(z.multipleUserQueryStringKeys)for(let c of M)d.searchParams.append(z.userQueryStringKey,c);else d.searchParams.set(z.userQueryStringKey,M.join(z.userQueryStringSeparator));h[v.id]={url:d,label:v.label}}return h},selectAll(){return this.accounts.length>0&&this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},selectedRowIDs(){return this.selectedRows.map((h)=>this.accounts[h]?.id).filter((h)=>!!h)}},watch:{selectedRows(h,v){let z=new Set(v),d=new Set(h),M=(c,V)=>{let l=this.accounts[c];if(l)this.toggleRow(l,V)};for(let c of d)if(!z.has(c))M(c,!0);for(let c of z)if(!d.has(c))M(c,!1)}},methods:{handleSelectAll(h){if(h)this.selectedRows=[...this.accounts.keys()];else this.selectedRows=[]},handleUserSelected(h,v){this.$emit("userSelected",h,v.id)},addDefaultRow(){this.$emit("addRow")},removeRows(){this.$emit("removeRows",this.selectedRowIDs),this.selectedRows=[]},toggleColumn(h,v){for(let z of this.accounts)z.link[h]=v},toggleAllColumns(h){for(let v of this.optionColumns)this.toggleColumn(v.id,h)},toggleRow(h,v){for(let z of this.optionColumns)h.link[z.id]=v},getLinkFormat(h){switch(h){case"analyser":return t.editorInteractionAnalyser;case"cuwiki":return t.checkUserWikiSearch;case"pages":return t.sandals.pages;case"summary":return t.sandals.summaries;case"timecard":return t.sandals.timecard;case"timeline":return t.sandals.consolidatedTimeline;default:return null}}},template:`
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
  `});var v2=Z({props:{enabled:{type:Boolean,required:!0},flags:{type:Set,required:!0}},emits:["update:enabled","update:flags"],data(){return{archiveNoticeFlags:[{value:"crosswiki",label:"Cross-wiki"},{value:"deny",label:"Deny"},{value:"notalk",label:"No talkpage access"},{value:"moot",label:"Moot"}]}},computed:{internalFlags:{get(){return Array.from(this.flags)},set(h){this.$emit("update:flags",new Set(h))}}},template:`
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
    </action-container>
  `});var z2=Z({props:{enabled:{type:Boolean,required:!0},target:{type:String,required:!0},suppress:{type:Boolean,required:!0},selection:{type:Object,required:!0},archiveEnabled:{type:Boolean,required:!0}},emits:["update:enabled","update:target","update:suppress","moveEntireCase"],data(){return{canSuppressRedirect:B1()}},computed:{isSectionMove(){return this.selectionType==="specific"},moveTitle(){if(!this.selection)return"ERROR";if(this.selection.type==="all")return"entire case";return"section "+this.selection.section.name},disabled(){return this.archiveEnabled},selectionType(){return this.selection?.type??null}},watch:{archiveEnabled:{handler(h){if(h)this.$emit("update:enabled",!1)},immediate:!0}},template:`
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
  `});var d2=Z({props:{allSections:{type:Array,required:!0},selectedSection:{type:Object,required:!0}},emits:["update-section-selection"],data(){return{menuPointerOverHandler:null,menuPointerLeaveHandler:null,menuFocusInHandler:null,activeSectionId:null,overlayType:null}},computed:{canJumpToSelectedSection(){return this.selectedSection!==null&&this.selectedSection!=="all"},sectionSelectElement(){return this.$refs.sectionSelect.$el},menuItems(){let h=this.allSections.map((v)=>({value:v.id,label:v.name}));return h.push({value:"all",label:"All Sections"}),h}},mounted(){if(!L.highlightSection)return;this.menuPointerOverHandler=(h)=>{this.handlePreviewEvent(h)},this.menuPointerLeaveHandler=()=>{if(this.overlayType==="preview")this.clearSectionHighlight()},this.menuFocusInHandler=(h)=>{this.handlePreviewEvent(h)},this.sectionSelectElement.addEventListener("pointerover",this.menuPointerOverHandler),this.sectionSelectElement.addEventListener("pointerleave",this.menuPointerLeaveHandler),this.sectionSelectElement.addEventListener("focusin",this.menuFocusInHandler)},beforeUnmount(){if(this.menuPointerOverHandler)this.sectionSelectElement.removeEventListener("pointerover",this.menuPointerOverHandler);if(this.menuPointerLeaveHandler)this.sectionSelectElement.removeEventListener("pointerleave",this.menuPointerLeaveHandler);if(this.menuFocusInHandler)this.sectionSelectElement.removeEventListener("focusin",this.menuFocusInHandler);this.clearSectionHighlight()},methods:{handleUpdateSectionSelection(h){if(L.highlightSection){if(h==="all")this.clearSectionHighlight();else if(typeof h==="number")this.renderSectionOverlay(h,"selected")}this.$emit("update-section-selection",h)},jumpToSelectedSection(){if(!this.canJumpToSelectedSection)return;if(this.selectedSection===null||this.selectedSection==="all")return;a5(this.selectedSection)},renderSectionOverlay(h,v){this.overlayType=v,V0(h,v)},clearSectionHighlight(){m1()},handlePreviewEvent(h){let v=h.target;if(!(v instanceof HTMLElement))return;let z=v.closest(".cdx-menu-item");if(!z)return;let d=A5(z,this.menuItems);if(d===null){this.activeSectionId=null,this.clearSectionHighlight();return}if(d!==this.activeSectionId)this.renderSectionOverlay(d,"preview")}},template:`
    <!-- Sections special case -->
    <div class="spiHelper-section-selector">
      <cdx-select :menu-items="menuItems" :selected="selectedSection"
                  @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
      <cdx-button weight="normal" :disabled="!canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
    </div>
  `});var U1=Z({inheritAttrs:!1,props:{modelValue:{type:String,required:!1,default:""},label:{type:String,required:!1,default:""},touched:{type:Boolean,default:!1},shortened:{type:Boolean,default:!1},autoDismiss:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:touched"],data(){return{messages:{warning:this.shortened?"Invalid":"Expiry option is invalid",success:this.shortened?"Valid":"Valid expiry option"},showSuccess:!this.autoDismiss,internalTouched:this.touched,successTimeout:null}},computed:{valid(){return x1(this.modelValue)!==null},status(){if(this.disabled||!this.internalTouched)return"default";if(this.valid)return this.showSuccess?"success":"default";else return"warning"}},watch:{modelValue(){if(this.internalTouched=!0,!this.autoDismiss)return;if(this.successTimeout)clearTimeout(this.successTimeout);if(this.valid)this.showSuccess=!0,this.successTimeout=window.setTimeout(()=>{this.showSuccess=!1},3000)},internalTouched(h){this.$emit("update:touched",h)}},beforeUnmount(){if(this.successTimeout)clearTimeout(this.successTimeout)},template:`
    <cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="modelValue" :disabled="disabled" v-bind="$attrs" />
    </cdx-field>
  `});var b5=10,G1=Z({props:{modelValue:{type:String,required:!0},placeholder:{type:String,default:"Page"},label:{type:String,default:null},description:{type:String,default:null},namespace:{type:Number,required:!0},prefix:{type:String,default:""},validateMessage:{type:Boolean,default:!0}},emits:["update:modelValue"],data(){let h={visibleItemLimit:6,searchQuery:""};return{lookupStatus:"default",messages:{success:"Page exists",warning:"Page not found"},pageSuggestions:[],useLookup:L.useLookup,selection:null,menuConfig:h}},computed:{pagename:{get(){return this.modelValue},set(h){this.$emit("update:modelValue",h)}},fullPagename(){return`${this.prefix}${this.pagename}`}},methods:{async onUpdateInputValue(h){if(this.menuConfig.searchQuery=h,!h){this.pageSuggestions=[];return}await this.$nextTick(),J0(this.fullPagename,this.namespace,b5).then((v)=>{if(this.pagename!==h)return;if(v.length===0){this.pageSuggestions=[];return}this.pageSuggestions=v.filter((z)=>!z.title.includes("/Archive")).map((z)=>({label:this.stripTitle(z.title),value:z.pageid.toString()}))}).catch(()=>{this.pageSuggestions=[]})},onLoadMore(){if(!this.pagename)return;J0(this.fullPagename,this.namespace,this.pageSuggestions.length+b5).then((h)=>{if(h.length===0)return;this.pageSuggestions=h.filter((v)=>!v.title.includes("/Archive")).map((v)=>({label:this.stripTitle(v.title),value:v.pageid.toString()}))},()=>{})},async validateInstantly(){if(await this.$nextTick(),this.pagename.length===0){this.lookupStatus="default";return}let h=this.pageSuggestions.find((v)=>v.label===this.pagename)??null;if(h!==null)this.selection=h.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(h){if(h!==null)this.lookupStatus="success"},stripTitle(h){if(this.prefix)return h.split(this.prefix)[1]??h;if(this.namespace===0)return h;return h.split(":")[1]??h}},template:`
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
  `});var f0=Z({props:{lockComment:{type:String,required:!0},skipCUVerifyUsers:{type:Set,required:!0},actionName:{type:String,required:!0},checkConflict:{type:Boolean,required:!0},state:{type:Object,required:!0},accounts:{type:Array,required:!0},caseActions:{type:Object,required:!0},allDisabled:{type:Boolean,required:!0}},emits:["update:lockComment","update:skipCUVerifyUsers","onSubmit"],data(){return{popover:{show:!1,revId:0,cancelAction:{label:"Cancel"},continueAction:{label:"Continue",actionType:"progressive"}},submitElement:null,cdxIconUpdate:w2}},computed:{needsLockComment(){let h=this.caseActions.block;if(!h.enabled)return!1;return this.accounts.some((v)=>v.block.lock&&!O(v.username)&&h.data.userLocks.get(v.username)!==!0)},hasInvalidTag(){if(!this.caseActions.block.enabled)return!1;return this.accounts.some((v)=>v.block.tags.some((z)=>r(z)&&!z.master))},hasInvalidMove(){let h=this.caseActions.move;return h.enabled&&!h.data.target},cuBlockConfirmationsNeeded(){let h=this.caseActions.block.data,v=new Set;if(U()||!this.caseActions.block.enabled||!h.options.override||!h.options.noBlock)return v;for(let z of this.accounts){if(!z.block.block)continue;let d=h.userBlocks.get(z.username)?.reason;if(d&&C1.exec(d))v.add(z.username)}return v},cuBlockOverrideChecked:{get(){return this.skipCUVerifyUsers.size===this.cuBlockConfirmationsNeeded.size},set(h){this.$emit("update:skipCUVerifyUsers",h?this.cuBlockConfirmationsNeeded:new Set)}},cuBlockOverrideIndeterminate(){let h=this.skipCUVerifyUsers.size;return h>0&&h<this.cuBlockConfirmationsNeeded.size},disableButton(){return H1(this.actionName)||this.allDisabled||this.hasInvalidTag||this.hasInvalidMove},lockCommentValue:{get(){return this.lockComment},set(h){this.$emit("update:lockComment",h)}}},mounted(){this.submitElement=this.$refs.submitElement},methods:{async onSubmit(){if(this.disableButton)return;if(this.checkConflict)if(this.popover.revId=await w1(a.pageName),this.popover.revId===a.startingRevId)this.$emit("onSubmit");else this.popover.show=!0;else this.$emit("onSubmit")},confirmSubmit(){this.popover.show=!1,a.startingRevId=this.popover.revId,this.state.selectedSection?.type==="specific"?m(this.state.selectedSection.section,{purge:!0}):k(this.state,{purge:!0}),this.$emit("onSubmit")}},template:`
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
  `});var L0=Z({props:{tag:{type:Object,required:!0},open:{type:Boolean,required:!0},anchor:{type:Object,required:!0},clipboardTag:{type:Object,required:!0},defaultMaster:{type:String,required:!0}},emits:{"update:open":(h)=>!0,"update:tag":(h)=>!0,addTag:()=>!0,copyTag:(h)=>!0,deleteTag:()=>!0},data(){let h=[{value:"blocked",label:"Suspected"},{value:"proven",label:"Proven"},{value:"confirmed",label:"Confirmed"}],v=[{value:"blocked",label:"Blocked"},{value:"confirmed",label:"Confirmed"},{value:"banned",label:"3X Banned"}],z=[{value:"suspected",label:"Suspected"},{value:"proven",label:"Proven"}],d={tag:"none",altmaster:"none"},M=[{value:"sock",label:"Sockpuppet",icon:t1},{value:"master",label:"Sockmaster",icon:s1}],c=null;return{sockTags:h,masterTags:v,altmasterTags:z,allTagSelections:d,tagCategoryButtons:M,temporaryTag:null,icons:{cdxIconAdd:a1,cdxIconCopy:o1,cdxIconPaste:k2,cdxIconTrash:i}}},computed:{openValue:{get(){return this.open},set(h){this.$emit("update:open",h)}},tagCategory:{get(){if(this.temporaryTag===null)return null;return r(this.temporaryTag)?"sock":"master"},set(h){if(h==="sock")this.temporaryTag=new P({status:"blocked",master:this.defaultMaster,evidence:this.temporaryTag?.evidence});else this.temporaryTag=new o({status:"blocked",evidence:this.temporaryTag?.evidence})}}},watch:{tag(h){if(h)this.temporaryTag=h.clone()}},methods:{handleSave(){if(this.temporaryTag===null){console.error("No tag to save");return}this.$emit("update:tag",this.temporaryTag),this.openValue=!1},handleCancel(){this.openValue=!1},handleDeleteTag(){this.$emit("deleteTag"),this.openValue=!1},handleCopyTag(){if(!this.temporaryTag)return;this.$emit("copyTag",this.temporaryTag)},handlePasteTag(){if(!this.clipboardTag)return;this.temporaryTag=this.clipboardTag.clone()},handleAddTag(){this.$emit("addTag"),this.openValue=!1}},template:`
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
  `});var M2=Z({props:{state:{type:Object,required:!0},activateButton:{type:Object,required:!0}},data(){return{activateHandler:null,open:!1,archiving:!1,messages:R}},mounted(){this.activateHandler=()=>{R.length=0,this.open=!0,this.archiving=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"oca"}),H5(this.state).then(()=>{this.archiving=!1},()=>{})},this.activateButton.addEventListener("click",this.activateHandler)},beforeUnmount(){if(this.activateHandler)this.activateButton.removeEventListener("click",this.activateHandler)},template:`
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
  `});var g5=/\[\[(?:Wikipedia|WP):(?:Sockpuppet investigations|SPI)\/([^\]]+)/i,c2=Z({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},defaultCase:{type:String,required:!1,default:""},view:{type:String,required:!0}},data(){return{open:!1,openHandler:null,beforeUnloadHandler:null,caseLoaded:!1,caseLoading:!1,targetCase:this.defaultCase,blockData:P1(),accounts:[],actionsRunning:!1,unpinned:!L.interface.pinned,messages:R,cdxIconFeedback:F1,cdxIconPushPin:g1}},computed:{mountPoint(){return this.$el.parentElement},pageName(){return`Wikipedia:Sockpuppet investigations/${this.targetCase}`},caseActions(){return{block:{enabled:!0,data:this.blockData},move:{enabled:!1}}}},watch:{unpinned(h){if(!this.mountPoint){console.error("AlternateView unpinned: Could not find mountPoint");return}if(h)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");L.interface.pinned=!h}},mounted(){if(!this.mountPoint){console.error("AlternateViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.beforeUnloadHandler=(h)=>{if(T1("alternateActions")!=="success")h.preventDefault()},this.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"alternate"}),!this.caseLoaded)switch(this.view){case"category":this.initialiseCategoryView();break;case"checkuser":this.initialiseCheckUserView();break;case"si":this.initialiseSIView();break}}if(this.beforeUnloadHandler)if(this.open)window.addEventListener("beforeunload",this.beforeUnloadHandler);else window.removeEventListener("beforeunload",this.beforeUnloadHandler)},this.openButton.addEventListener("click",this.openHandler)},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler);if(this.beforeUnloadHandler)window.removeEventListener("beforeunload",this.beforeUnloadHandler)},methods:{handleUserSelected(h,v){let z=this.accounts.find((d)=>d.id===v);if(!z)return;if(h.blockid!==void 0&&!this.blockData.userBlocks.has(z.username)){let d=mw.util.isIPAddress(h.name)?h.blockanononly:h.blockautoblocking;this.blockData.userBlocks.set(z.username,{username:z.username,duration:h.blockexpiry??"",abao:d??!1,acb:h.blocknocreate??!1,ntp:h.blockowntalk??!1,nem:h.blockemail??!1,reason:""})}d0(h,z)},handleAddRow(h){h??=z1(this.state.archiveNotice),this.accounts.push(h)},handleRemoveRows(h){this.accounts=this.accounts.filter((v)=>!h.includes(v.id))},async handleFetchRows(){let h;try{h=await navigator.clipboard.readText()}catch(c){if(console.error("handleFetchRows failed to read clipboard:",c),c instanceof DOMException&&c.name==="NotAllowedError")new y({type:"warning",content:"Failed to read clipboard. You may need to press 'paste' in the confirmation popup"}).show();return}let[v,z]=K1({text:h,fullSearch:!1,state:this.state}),d=new Set(v),M=[...v,...z].map((c)=>D1({userRow:c,defaultBlock:d.has(c)}));this.massAddUserRows(M)},massAddUserRows(h){let v=new Set(this.accounts.map((z)=>z.username));h.forEach((z)=>{if(!v.has(z.username))this.handleAddRow(z)})},async loadCase(h){if(this.caseLoading=!0,n1(this.pageName,"alternate"),this.targetCase){let v=await A1({page:this.pageName,state:this.state});if(a.valid=v!==null,v===null)this.state.archiveNotice=new S({username:this.targetCase});else this.state.archiveNotice=v;if(h){let z=await J2(this.targetCase);if(z!==null)this.blockData.userBlocks.set(this.targetCase,z);let d=await X(`User:${this.targetCase}`,!1),{userRow:M,isLocked:c}=await e1({userRow:v1(this.targetCase,this.state),block:z,userPage:d,defaultBlock:!0,checkLock:!1,state:this.state});if(c!==null)this.blockData.userLocks.set(this.targetCase,c);let V=this.accounts.findIndex((l)=>l.username===M.username);if(V===-1)this.accounts.splice(0,0,M);else this.accounts.splice(V,1,M)}}else a.valid=!1;this.blockData.master=this.targetCase,this.caseLoading=!1,this.caseLoaded=!0},async onSubmitActions(){if(H1("alternateActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"alternate"}),x("alternateActions"),this.actionsRunning=!0;let h=[],v=[],z=Promise.resolve([]);({blockPromises:h,tagPromises:v,lockPromise:z}=await i0({accounts:this.accounts,blockData:this.blockData}));let d=Promise.all([Promise.all(h),Promise.all(v),z]),[M,c,V]=await d;if(L.log.enabled){let l=`* [[:User:${a.userName}]]`+R1({blockedUsers:M,taggedUsers:c,lockedUsers:V});await p1(l)}new y({type:"success",content:"Done!"}).show(),B("alternateActions","success"),this.actionsRunning=!1},async initialiseCategoryView(){if(this.defaultCase===""||this.caseLoading||this.caseLoaded)return;let[,h,v]=await Promise.all([this.loadCase(!1),m0(`Category:Suspected Wikipedia sockpuppets of ${this.targetCase}`),m0(`Category:Wikipedia sockpuppets of ${this.targetCase}`)]),z=(l,H)=>{let f={...v1(l.replace("User:",""),this.state)};return f.block.block=H,f},d=[...v,`User:${this.targetCase}`].map((l)=>z(l,!0)),M=h.map((l)=>z(l,!1)),c=new Set([...d,...M].map((l)=>l.username)),V=await b1({likelySocks:d,possibleSocks:M,allUsernames:c,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(V)},initialiseCheckUserView(){let h=$("form#checkuserform",document),v=$("#checkreason input",h).val();if(typeof v==="string"){let d=g5.exec(v)?.[1];if(d){this.targetCase=d;return}}let z=$("#checktarget input",h).val();if(typeof z==="string"){if(!mw.util.isIPAddress(z,!0))this.targetCase=z}},async initialiseSIView(){let h=[],v=new Set,d=$("ul.mw-checkuser-suggestedinvestigations-users",document).find("li > a.mw-userlink > bdi");for(let c of d){let V=T($(c).text());if(v.has(V))continue;h.push(v1(V,this.state)),v.add(V)}if(h.length>0&&h[0])this.targetCase=h[0].username;let M=await b1({likelySocks:h,possibleSocks:[],allUsernames:v,userBlocks:this.blockData.userBlocks,userLocks:this.blockData.userLocks,userTags:this.blockData.userTags,state:this.state});this.massAddUserRows(M)},launchFeedback(){let h=this.view.charAt(0).toUpperCase()+this.view.slice(1);this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`${h} form v${u}-${C}`})}},template:`
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
  `});var V2=Z({props:{unseenChanges:{type:Array,required:!0},openState:{type:Object,required:!0}},data(){return{beta:C!=="production"}},methods:{onClose(){this.openState.isOpen=!1,this.$emit("dismissed")},resolveDate(h){if(typeof h==="string")return h;return this.beta?h.beta:h.stable}},template:`
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
    </cdx-dialog>`});async function i5(){let h=I2(),v={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",pageids:82598459,formatversion:"2"};try{let d=(await h.get(v)).query.pages[0]?.revisions?.[0]?.slots.main.content;if(d)return JSON.parse(d)}catch(z){console.error("getChangelog fetch error:",z)}return{}}async function q5(h){let v=await i5();return Object.entries(v).filter(([z])=>y5(z,h)).sort(([z],[d])=>y5(z,d)?-1:1)}function y5(h,v){let z=h.split(".").map(Number),d=v.split(".").map(Number);for(let M=0;M<3;M++){if((z[M]??0)>(d[M]??0))return!0;if((z[M]??0)<(d[M]??0))return!1}return!1}var Z5=Z({template:`
    <cdx-toast-container />
    `});if(mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/")&&!mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/SPI/"))a0("spi");else if(mw.config.get("wgCanonicalSpecialPageName")==="CheckUser")a0("checkuser");else if(mw.config.get("wgCanonicalSpecialPageName")==="SuggestedInvestigations"&&mw.config.get("wgPageName").includes("/detail/"))a0("si");else if(mw.config.get("wgNamespaceNumber")===14&&["Suspected Wikipedia sockpuppets","Wikipedia sockpuppets"].some((h)=>mw.config.get("wgCategories").includes(h)))a0("category");function a0(h){mw.loader.using(["vue","@wikimedia/codex","mediawiki.api","mediawiki.util","mediawiki.user","mediawiki.feedback"],(v)=>{let z=v("vue"),d=v("@wikimedia/codex");r2(z.toRaw);let M=new mw.Feedback(L2);if(C==="live")mw.loader.load("http://localhost:8080/spihelper.css","text/css");else if(C==="dev")importStylesheet("User:DatGuy/spihelper.dev.css");else importStylesheet("User:DatGuy/spihelper.css");let c,V=z.reactive(new G0);if(h==="spi"){let F=mw.config.get("wgPageName");n1(F),L1(V)}else if(h==="category"){if(c=/Category:(?:Suspected )?Wikipedia sockpuppets of (.*)/.exec(mw.config.get("wgPageName").replaceAll("_"," ")),!c?.[1])return}let l=x0();if(l)Object.assign(L,l);else(async()=>{await N0(),g()})();e5(z,d);let H=z.reactive({isOpen:!1});if(L.lastSeenVersion!==u)q5(L.lastSeenVersion).then((F)=>{let A=document.createElement("div");A.style.position="absolute",mw.util.$content.prepend(A);let q=z.createMwApp(V2,{unseenChanges:F,openState:H,onDismissed:async()=>{L.lastSeenVersion=u,await g(),q.unmount(),A.remove()}}).component("cdx-button",d.CdxButton).component("cdx-dialog",d.CdxDialog).component("cdx-message",d.CdxMessage);q.mount(A)},()=>{});let f=mw.util.addPortletLink("p-cactions","#",C==="production"?"SPI":"SPI-Beta","ca-spiHelper","Run spiHelper");if(f){let F=document.createElement("div");switch(F.setAttribute("id","spiHelper-vue-mount-point"),mw.util.$content.prepend(F),f.addEventListener("click",()=>{H.isOpen=!0}),h){case"spi":{z.createMwApp(s0,{state:V,feedbackDialog:M,openButton:f}).component("cdx-tabs",d.CdxTabs).component("cdx-tab",d.CdxTab).component("cdx-select",d.CdxSelect).component("cdx-card",d.CdxCard).component("cdx-toggle-switch",d.CdxToggleSwitch).component("cdx-text-area",d.CdxTextArea).component("cdx-toggle-button",d.CdxToggleButton).component("cdx-toggle-button-group",d.CdxToggleButtonGroup).component("cdx-button",d.CdxButton).component("cdx-button-group",d.CdxButtonGroup).component("cdx-icon",d.CdxIcon).component("cdx-table",d.CdxTable).component("cdx-text-input",d.CdxTextInput).component("cdx-checkbox",d.CdxCheckbox).component("cdx-lookup",d.CdxLookup).component("cdx-field",d.CdxField).component("cdx-message",d.CdxMessage).component("cdx-progress-bar",d.CdxProgressBar).component("cdx-progress-indicator",d.CdxProgressIndicator).component("cdx-accordion",d.CdxAccordion).component("cdx-label",d.CdxLabel).component("cdx-popover",d.CdxPopover).component("action-accordion",T0).component("action-button",k0).component("action-container",w0).component("action-content",n0).component("submit-form",f0).component("comment-action",e0).component("change-status-action",h2).component("block-action",l0).component("link-action",H0).component("management-action",v2).component("archive-action",t0).component("move-action",z2).component("section-action",d2).component("user-lookup",M0).component("page-lookup",G1).component("expiry-input",U1).component("tag-popover",L0).directive("tooltip",d.CdxTooltip).mount(F);break}case"checkuser":case"category":case"si":{z.createMwApp(c2,{state:V,feedbackDialog:M,openButton:f,view:h,...h==="category"?{defaultCase:c?.[1]??""}:{}}).component("cdx-button",d.CdxButton).component("cdx-checkbox",d.CdxCheckbox).component("cdx-field",d.CdxField).component("cdx-icon",d.CdxIcon).component("cdx-label",d.CdxLabel).component("cdx-lookup",d.CdxLookup).component("cdx-message",d.CdxMessage).component("cdx-popover",d.CdxPopover).component("cdx-progress-indicator",d.CdxProgressIndicator).component("cdx-select",d.CdxSelect).component("cdx-table",d.CdxTable).component("cdx-text-area",d.CdxTextArea).component("cdx-text-input",d.CdxTextInput).component("cdx-toggle-button-group",d.CdxToggleButtonGroup).component("submit-form",f0).component("block-action",l0).component("link-action",H0).component("user-lookup",M0).component("page-lookup",G1).component("expiry-input",U1).component("tag-popover",L0).directive("tooltip",d.CdxTooltip).mount(F);break}}}if(s5(z,d,M),mw.config.get("wgCategories").includes("SPI cases awaiting archive")&&G())t5(z,d,V);window.addEventListener("beforeunload",(F)=>{if(Y2())F.preventDefault()})})}function s5(h,v,z){let d=mw.util.addPortletLink("p-cactions","#",C==="production"?"SPI-Options":"SPI-Beta-Options","ca-spiHelperOpts","Modify spiHelper settings");if(d){let M=document.body.appendChild(document.createElement("div"));h.createMwApp(o2,{feedbackDialog:z,openButton:d,toaster:v.useToast()}).component("cdx-button",v.CdxButton).component("cdx-dialog",v.CdxDialog).component("cdx-field",v.CdxField).component("cdx-lookup",v.CdxLookup).component("cdx-select",v.CdxSelect).component("cdx-toggle-switch",v.CdxToggleSwitch).component("cdx-accordion",v.CdxAccordion).component("cdx-text-input",v.CdxTextInput).component("cdx-icon",v.CdxIcon).component("cdx-message",v.CdxMessage).component("cdx-multiselect-lookup",v.CdxMultiselectLookup).component("watch-setting",E0).component("expiry-setting",C0).component("expiry-input",U1).component("log-page-setting",O0).component("page-lookup",G1).mount(M)}}function t5(h,v,z){let d=mw.util.addPortletLink("p-cactions","#",C==="production"?"SPI-Archive":"SPI-Beta-Archive","ca-spiHelperArchive","Run one click archival");if(d){let M=document.body.appendChild(document.createElement("div"));h.createMwApp(M2,{state:z,activateButton:d}).component("cdx-dialog",v.CdxDialog).component("cdx-message",v.CdxMessage).component("cdx-progress-bar",v.CdxProgressBar).mount(M)}}function e5(h,v){let z=h.createMwApp(Z5).component("cdx-toast-container",v.CdxToastContainer),d=document.body.appendChild(document.createElement("div"));z.mount(d)}})();

// </nowiki>
