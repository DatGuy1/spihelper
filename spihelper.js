// {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=refs/heads/build/stable|path=spihelper.js}}
// v3.4.1
// <nowiki>
'use strict';
(()=>{var Le=[{id:"analyser",label:"Interaction Analyser",url:"https://sigma.toolforge.org/editorinteract.py",userParam:"users",separator:"&",wrapper:"",repeatParam:!0,enabled:!0},{id:"timeline",label:"Timeline (Sandals)",url:"https://sandals.toolforge.org/contributions",userParam:"users",separator:"|",wrapper:"",repeatParam:!1,enabled:!0},{id:"spitools-timeline",label:"Timeline (SPI Tools)",url:"https://spi-tools.toolforge.org/spi/timeline/{case}",userParam:"users",separator:"&",wrapper:"",repeatParam:!0,enabled:!1},{id:"interaction-timeline",label:"Interaction Timeline",url:"https://interaction-timeline.toolforge.org/?wiki=enwiki",userParam:"user",separator:"&",wrapper:"",repeatParam:!0,enabled:!1},{id:"timecard",label:"Timecard (Sandals)",url:"https://sandals.toolforge.org/timecard",userParam:"users",separator:"|",wrapper:"",repeatParam:!1,enabled:!0},{id:"spitools-timecard",label:"Timecard (SPI Tools)",url:"https://spi-tools.toolforge.org/spi/timecard/{case}",userParam:"users",separator:"&",wrapper:"",repeatParam:!0,enabled:!1},{id:"pages",label:"Pages (Sandals)",url:"https://sandals.toolforge.org/pages",userParam:"users",separator:"|",wrapper:"",repeatParam:!1,enabled:!0},{id:"spitools-pages",label:"Pages (SPI Tools)",url:"https://spi-tools.toolforge.org/spi/pages/{case}",userParam:"users",separator:"&",wrapper:"",repeatParam:!0,enabled:!1},{id:"summary",label:"Summaries (Sandals)",url:"https://sandals.toolforge.org/summaries",userParam:"users",separator:"|",wrapper:"",repeatParam:!1,enabled:!0},{id:"cuwiki",label:"CU wiki",url:"https://checkuser.wikimedia.org/w/index.php?ns0=1",userParam:"search",separator:" OR ",wrapper:'"',repeatParam:!1,enabled:!0},{id:"interleaved",label:"Interleaved",url:"https://interleaved.toolforge.org/",userParam:"user",separator:"|",wrapper:"",repeatParam:!1,enabled:!0}];var Y=/{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i,ke=/^closed?$/i,an=/{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu-?)?endorse|inprogress|(?:cu\s?)?decline(?:-ip)?|(?:cu)?moreinfo|relisted|onhold)}}/i,rn=/====\s*Suspected sockpuppets\s*====\n*/i,Ue=/\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i,st=/\n*----(?!.*----)/s,at=/<!-+ All comments go ABOVE this line, please. -+>/,it=/{{(checkuserblock(-account|-wide)?|checkuser block)}}/i,Ee=/{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i,ko=/SPI\s*archive notice/i;var se=/^(?:===[^=]*===|=====[^=]*=====)\s*$/m,yo=/\u200E/g,wo=/(?<!~)~~~~(?!~)/;function cn(e){return` (using [[${e?":w:en:":""}WP:SPIH-D|SPIH-D]])`}function So(){return{title:new mw.Title("User talk:DatGuy/spihelper"),bugsLink:"//github.com/DatGuy1/spihelper/issues/new",showUseragentCheckbox:!0,useragentCheckboxMessage:"I want to share my user agent publicly alongside my feedback. This is optional."}}var Q="3.4.1",Z="production",rt={watch:{case:"preferences",archive:"nochange",tagged:"preferences",categories:"nochange",blocked:!0},expiry:{case:"indefinite",archive:"indefinite",tagged:"indefinite",categories:"indefinite",blocked:"indefinite"},log:{enabled:!1,reversed:!1,page:"spihelper_log"},clerk:!0,tickArchiveWhenCaseClosed:!1,useCheckuserblockAccount:mw.config.get("wgUserGroups")?.includes("checkuser")??!1,useLookup:!0,defaultActions:["comment"],interface:{defaultBlockDuration:"indefinite",displayIPv6As64:!0,fullPreview:!1,pinned:!0,buttonLayout:!1},highlightSection:!0,custom:{commentTemplates:[]},linkTools:structuredClone(Le),debug:{enabled:!1,forceCheckuser:!1,forceAdmin:!1},lastSeenVersion:Q};var Ho=[{label:"Results",items:[{value:"{{confirmed}}",label:"Confirmed"},{value:"{{confirmed-nc}}",label:"Confirmed, no comment for IPs"},{value:"{{tallyho}}",label:"Indistinguishable"},{value:"{{highly likely}}",label:"Highly likely"},{value:"{{likely}}",label:"Likely"},{value:"{{possilikely}}",label:"Possilikely"},{value:"{{possible}}",label:"Possible"},{value:"{{unlikely}}",label:"Unlikely"},{value:"{{unrelated}}",label:"Unrelated"},{value:"{{inconclusive}}",label:"Inconclusive"},{value:"{{IPstale}}",label:"Stale"}]},{label:"Addendums",items:[{value:"{{behav}}",label:"Needs behavioral evaluation"},{value:"{{nosleepers}}",label:"No sleepers"},{value:"{{ncip}}",label:"No comment for IPs"},{value:"{{ncta}}",label:"No comment for TAs"}]},{label:"Novelties",items:[{value:"{{8ball}} ",label:"Magic 8-Ball"},{value:"{{crystalball}}",label:"Not a crystal ball"},{value:"{{fishing}}",label:"Not fishing"},{value:"{{pixiedust}}",label:"Not pixie dust"}]}],Ao=[{label:"Ducks",items:[{value:"{{duck}}",label:"Duck"},{value:"{{megaphone duck}}",label:"Megaphone duck"},{value:"{{megaphone duck|ultimate}}",label:"Ultimate duck"}]},{label:"Results",items:[{value:"{{IPblock}}",label:"IP blocked"},{value:"{{bnt}}",label:"Blocked and tagged"},{value:"{{bwt}}",label:"Blocked without tags"},{value:"{{sblock}}",label:"Blocked, awaiting tags"},{value:"{{btc}}",label:"Blocked, tagged, closed"},{value:"{{Action and close}}",label:"Requested actions completed, closing"},{value:"{{Closing without action}}",label:"Closing without action"}]},{label:"Other",items:[{value:"{{subst:DiffsNeeded|moreinfo}}",label:"Diffs needed"},{value:"{{GlobalLocksRequested}}",label:"Locks requested"},{value:"{{Decline-IP}}",label:"IP check declined"}]}],ct=25,lt=[{value:25},{value:50},{value:100}];var ya=["m","meta"];function pt(e){let t=e.indexOf(":");if(t===-1)return null;let n=e.slice(0,t);return ya.includes(n)?n:null}function Ne(e){let t=pt(e);return t===null?e:e.slice(t.length+1)}function Be(){return mw.config.get("wgPageParseReport")?.limitreport.postexpandincludesize.limit??2097152}function Mo(){let e=mw.config.get("wgServer").replace(/^(https?)?:?\/\//,"").split("."),t=e[0],n=e[1];if(t===void 0||n===void 0)return"";let o;switch(n){case"wikimedia":switch(t){case"commons":case"meta":case"species":case"incubator":case"outreach":o=t;break;default:break}break;case"mediawiki":o="mw";break;case"wikidata":switch(t){case"test":o="testwikidata";break;case"www":o="d";break;default:break}break;case"wikipedia":switch(t){case"test":o="testwiki";break;case"test2":o="test2wiki";break;default:o="w:"+t;break}break;case"wiktionary":o="wikt:"+t;break;case"wikiquote":o="q:"+t;break;case"wikibooks":o="b:"+t;break;case"wikinews":o="n:"+t;break;case"wikisource":o="s:"+t;break;case"wikiversity":o="v:"+t;break;case"wikivoyage":o="voy:"+t;break;default:return""}return`:${o}:`}function R(e){if(e=e.replace(yo,""),e=e.trim(),mw.util.isIPAddress(e,!0))e=e.toUpperCase();else if(e)try{e=new mw.Title(e).getMainText()}catch(t){console.error(`Failed to parse username: ${e}.`,t)}return e}function ae(e){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(e)}function $e(e){return mw.util.isInfinity(e)}var wa=["second","seconds","minute","minutes","hour","hours","day","days","week","weeks","month","months","year","years"],ln=new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${wa.join("|")})$`,"i");function Sa(e){return ln.test(e)}function ye(e){if($e(e))return e;if(ae(e))return e;if(Sa(e))return e;return null}function C(e){return mw.util.isIPAddress(e,!0)||mw.util.isTemporaryUser(e)}function dt(e){return wo.test(e)?e:e.trimEnd()+" ~~~~"}function we(e,t){let n=st.exec(t);if(n){let a=n.index,i=t.slice(0,a),r=t.slice(a+n[0].length);return`${i}
${e}
----${r}`}let o=/\s*$/.exec(t)?.[0]??"";return`${t.slice(0,t.length-o.length).replace(at,"")}
${e}
----<!-- All comments go ABOVE this line, please. -->${o}`}function U(e,t){return t??=e,$("<a>").attr("href",mw.util.getUrl(e)).attr("title",e).text(t).prop("outerHTML")}function pn(e,t,n){return n??=e,$("<a>").attr("href",e).attr("title",n).text(t).prop("outerHTML")}function ut(e,t,n=`${t}s`){return e===1?t:n}function B(e,t,n){return`${e} ${ut(e,t,n)}`}function mt(e){let{blockedUsers:t,taggedUsers:n,lockedUsers:o,globalBlockedUsers:s}=e,a="",i=t.filter(Boolean);if(i.length>0)a+=`
** blocked `+i.join(", ");let r=n.filter(Boolean);if(r.length>0)a+=`
** tagged `+r.join(", ");if(o.length>0)a+=`
** requested locks for `+o.map((c)=>`{{noping|1=${c}}}`).join(", ");if(s.length>0)a+=`
** requested global blocks for `+s.map((c)=>`{{noping|1=${c}}}`).join(", ");return a}function Co(e){let t=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(`^(={3}|={5})\\s*(<big>)?${t}(</big>)?\\s*(={3}|={5})\\s*$`,"m")}function Ha(e,t=0,n){let o=e.length;if(n){let s=Co(n),a=e.slice(t+1).match(s);if(a?.index!==void 0)o=t+a.index}return e.slice(t,o).trim()}function ie(e,t){t.sort((s,a)=>s.header.getTime()-a.header.getTime());let n=e.slice(0,De(e)).trimEnd(),o=t.map((s)=>s.fullText).join(`

`);return n?`${n}

${o}`:o}function De(e){return se.exec(e)?.index??e.length}function Se(e,t){let n=[];if(t.length===0)return n;let o=De(e),s=e.slice(o);for(let a=0;a<t.length;a++){let i=t[a];if(!i)continue;let r=i.name,c=Co(r),l=s.match(c);if(!l)continue;let d=l.index;if(d===void 0)continue;let m=Ha(s,d,t[a+1]?.name);if(m){let h=ht(r);if(h===null)return console.error(`Failed to parse date from section header "${r}" in archive`),null;n.push({header:h,fullText:m})}s=s.slice(d+m.length)}return n}function ht(e){let t=new Date(e);if(!isNaN(t.getTime()))return t;return null}function To(){return{block:!1,duration:"",acb:!0,abao:!0,ntp:!1,nem:!1,tags:[],lock:!1}}function gt(e=""){return{options:{noBlock:!1,override:!1,tagUnattached:!0,cuBlock:!1,cuBlockOnly:!1,addMasterNotice:!0,addSockNotice:!0,blankTalk:!1,lockHideNames:!1},userLocks:new Map,userGlobalBlocks:new Map,userBlocks:new Map,fetchedUsers:new Map,master:e,lockcomment:"",skipCUVerifyUsers:new Set}}var qe=new Map;function D(e){qe.set(e,"running")}function H(e,t){qe.set(e,t)}function Po(){for(let e of qe.values())if(e==="running")return!0;return!1}function He(e){return qe.get(e)==="running"}function ft(e){return qe.get(e)}class J{username;crosswiki;deny;notalk;moot;constructor(e){this.username=e.username,this.crosswiki=e.crosswiki??!1,this.deny=e.deny??!1,this.notalk=e.notalk??!1,this.moot=e.moot??!1}generateWikitext(){let e="{{SPI archive notice|1="+this.username;if(this.crosswiki)e+="|crosswiki=yes";if(this.deny)e+="|deny=yes";if(this.notalk)e+="|notalk=yes";if(this.moot)e+="|moot=yes";return e+="}}",e}}class dn{id;name;_text=null;_loadingPromise=null;constructor(e,t){this.id=e,this.name=t}}var Io=["sections","management","block","status","link","comment","move","archive"];var Ae='<path d="M11 9h7v2h-7v7H9v-7H2V9h7V2h2z"/>';var zo='<path d="M11 1v13.876l4-4 1.414 1.414-5.707 5.707H9.293L3.586 12.29 5 10.876l4 4V1z"/>';var Vo='<path d="M10 1a9 9 0 110 18 9 9 0 010-18M5 9v2h10V9z"/>';var Ro='<path d="M10 1a9 9 0 110 18 9 9 0 010-18M4.394 5.806A6.97 6.97 0 003 10a7 7 0 0011.193 5.605l-9.8-9.8ZM10 3a6.97 6.97 0 00-4.191 1.392l9.797 9.798A7 7 0 0010 3"/>';var un='<path d="M18.154 3.837 8 16.8H6.65l-4.8-3.6 1.2-1.6 4.02 3.015 9.517-12.02z"/>',mn='<path d="M14 17h-4v-2h4zm2.404-13.163L6.22 16.8H4.9L.1 13.2l1.2-1.6 4.02 3.015 9.517-12.02zM17 13h-4v-2h4zm3-4h-4V7h4z"/>';var Lo='<path d="M10 1a9 9 0 110 18 9 9 0 010-18m0 2a7 7 0 100 14 7 7 0 000-14m1 7h3v2H9V5h2z"/>',Uo='<path d="M16.707 4.707 11.414 10l5.293 5.293-1.414 1.414L10 11.414l-5.293 5.293-1.414-1.414L8.586 10 3.293 4.707l1.414-1.414L10 8.586l5.293-5.293z"/>',Eo='<path d="M8.5 3H6a1 1 0 00-1 1v2.488c0 1.19-.525 2.273-1.371 3.012A4 4 0 015 12.512V16a1 1 0 001 1h2.5v2H6a3 3 0 01-3-3v-3.488a2 2 0 00-1.648-1.969L1 10.484V8.516l.352-.059A2 2 0 003 6.488V4a3 3 0 013-3h2.5zM14 1a3 3 0 013 3v2.488a2 2 0 001.648 1.969l.352.059v1.968l-.352.059A2 2 0 0017 12.512V16a3 3 0 01-3 3h-2.5v-2H14a1 1 0 001-1v-3.488c0-1.19.525-2.273 1.371-3.012A4 4 0 0115 6.488V4a1 1 0 00-1-1h-2.5V1z"/>',No='<path d="m10 8.1-5.3 5.3L3.3 12l6-6h1.4l6 6-1.4 1.4z"/>';var vt={ltr:'<path d="M13 19H1V7h6V1h12v12h-6zm-6-6V9H3v8h8v-4zm2-2h8V3H9z"/>',shouldFlip:!0};var Bo='<path d="M19 19H1v-2h18zm-8-7.104 3.5-3.5 1.414 1.414-5.207 5.208H9.293L4.086 9.81 5.5 8.396l3.5 3.5V1h2z"/>';var $o='<path d="m15.4.4 4.2 4.2-3.2 3.2-4.2-4.2zM10.8 5 15 9.2l-8.6 8.6-4.5 1.5-1.2-1.2 1.5-4.5z"/>';var Do='<path d="m16.7 8-6 6H9.3l-6-6 1.4-1.4 5.3 5.3 5.3-5.3z"/>';var Me={ltr:'<path d="M17 1v6.174c1.165.412 2 1.52 2 2.826a3 3 0 01-2 2.825V19h-2.563l-4.8-4H8v4H6v-4H3v-2H1V7h2V5h6.637l4.8-4zm-6.36 5.769L10.363 7H7v6h3.362l.279.231L15 16.864V3.136z"/>',shouldFlip:!0};var hn={ltr:'<path d="M11 18H9v-2h2zM10 2c1.497 0 2.76.433 3.66 1.268.905.84 1.34 1.994 1.34 3.232 0 1.182-.443 2.007-1.094 2.638a6.7 6.7 0 01-.95.742c-.363.241-.587.373-.923.602C11.351 10.948 11 11.86 11 13v1H9v-1c0-1.455.443-3.17 1.905-4.169.3-.204.71-.461.94-.615.281-.187.498-.349.67-.515.297-.287.485-.607.485-1.201 0-.762-.258-1.357-.7-1.768C11.853 4.317 11.117 4 10 4 7.98 4 7 5.636 7 6.5v1H5v-1C5 4.614 6.794 2 10 2"/>',shouldFlip:!0,shouldFlipExceptions:["he","yi"]};var qo={ltr:'<path d="M12 10H9V8h3zm2-4H9V4h5z"/><path d="M18 20H2V0h16zM7 18h9V2H7z"/>',shouldFlip:!0};var Oo={ltr:'<path d="M9 18H2V2h7zm-5-2h3V4H4zm14 2h-7v-7h7zm-5-2h3v-3h-3zm5-7h-7V2h7zm-5-2h3V4h-3z"/>',shouldFlip:!0};var Fo='<path d="M5.862 7.453a4.353 4.353 0 016.167-.01l.707.706-1.414 1.414-.707-.707a2.355 2.355 0 00-3.335.005L4.354 11.81a2.725 2.725 0 003.842 3.868l.046-.046.715-.7 1.4 1.43-.715.698-.046.046A4.727 4.727 0 012.934 10.4z"/><path d="M10.405 2.894a4.726 4.726 0 016.662 6.707l-2.928 2.947a4.354 4.354 0 01-6.167.01l-.707-.707 1.414-1.415.707.707c.921.921 2.416.92 3.334-.004l2.928-2.948a2.727 2.727 0 00-3.843-3.868l-.761.746-1.4-1.428.713-.7z"/>';var _o={ltr:'<path d="M1.456 7.172a9 9 0 0117.259 5.079l-.968.75L11.75 13a.75.75 0 00-.75.75v4.21l-1.06 1c-.648-.04-1.938-.142-2.768-.416A9 9 0 011.456 7.172M12.2 3.354a7 7 0 00-4.4 13.291c.3.1.745.17 1.2.224v-3.12A2.75 2.75 0 0111.75 11h5.178A7 7 0 0012.2 3.355Z"/><circle cx="6.5" cy="10.5" r="1.5"/><circle cx="9.5" cy="6.5" r="1.5"/><circle cx="13.5" cy="8.5" r="1.5"/>',shouldFlip:!0},Go={ltr:'<path d="M11 3H9v8h8V9h2v4h-6v6H1V7h6V1h4zM3 17h8v-4H7V9H3z"/><path d="M16.5 3.5H19v2h-2.5V8h-2V5.5H12v-2h2.5V1h2z"/>',shouldFlip:!0};var bt='<path d="M16 2h-2v4.764l3 5.936V14h-6v6H9v-6H3v-1.3l3-5.936V2H4V0h12zM8 7.236 5.618 12h8.764L12 7.236V2H8z"/>';var xt='<path d="M10 1a8.98 8.98 0 016.999 3.343L17 2h2v5l-1 1h-5l-.001-2h2.746a7 7 0 101.184 5h2.016A9 9 0 1110 1"/>';var re='<path d="M10 0a3 3 0 013 3v1h5v2h-2v14H4V6H2V4h5V3a3 3 0 013-3M6 18h8V6H6zm4-16a1 1 0 00-1 1v1h2V3a1 1 0 00-1-1"/>';var Wo={ltr:'<path d="m12.009 13.695.002 1.388-4.694 4.88-1.441-1.385 3.065-3.188H0v-2h8.933l-3.057-3.164 1.438-1.39zm2.115-12.219L11.067 4.64H20v2h-8.941l3.065 3.188-1.441 1.386-4.694-4.881.002-1.388 4.694-4.86 1.439 1.39Z"/>',shouldFlip:!0};var kt='<path d="M12 11a6 6 0 016 6v2H2v-2a6 6 0 016-6z"/><circle cx="10" cy="5" r="4"/>',yt='<path d="M12 11a6 6 0 016 6v2H2v-2a6 6 0 016-6zm-4 2a4 4 0 00-4 4h12a4 4 0 00-4-4zm2-12a4 4 0 110 8 4 4 0 010-8m0 2a2 2 0 100 4 2 2 0 000-4"/>';var jo={ltr:'<path d="M1 3h18v2H1zm0 6h7v2H1zm0 6h8v2H1zm15-4.75h3v1l-2.2 1.5L18 16.5h-1.2l-2.3-1.9-2.3 1.9H11l1.2-3.75-2.2-1.5v-1h3L14 7h1z"/>',shouldFlip:!0};var Qo=[{label:"Follow preferences",value:"preferences"},{label:"No change",value:"nochange"},{label:"Watch",value:"watch"},{label:"Unwatch",value:"unwatch"}],Zo=["preferences","watch","nochange","unwatch"],wt={blocked:{label:"Suspected",icon:hn},proven:{label:"Proven",icon:un},confirmed:{label:"Confirmed",icon:mn}},Oe={blocked:{label:"Blocked",icon:Vo},confirmed:{label:"Confirmed",icon:mn},banned:{label:"3X Banned",icon:Ro}},Jo={suspected:{label:"Suspected",icon:hn},proven:{label:"Proven",icon:un}};var Aa=0;class g{type;content;isHtml;id=Aa++;_shown=!1;constructor(e){this.type=e.type,this.content=e.content,this.isHtml=e.isHtml}show(){return this._shown=!0,q.push(this),this}showOnce(){return q.some((t)=>t.type===this.type&&t.content===this.content&&t.isHtml===this.isHtml)?this:this.show()}update(e){if(!this._shown)return Object.assign(this,e),this.show(),this;let t=q.find((n)=>n.id===this.id);if(t)Object.assign(t,e);return Object.assign(this,e),this}}function St(e){setTimeout(()=>{let t=q.findIndex((n)=>n.id===e);if(t!==-1)q.splice(t,1)},250)}var q=[];function Ko(e){q=e(q)}async function ce(e){if(e.length===0)return new Map;let t=new Map;return await Ge({targets:e,fetchName:"spiHelperGetBulkPageText",buildRequest:(n)=>({action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:n,formatversion:"2"}),onResponse:(n)=>{let o=ls(t,n.query.normalized);for(let s of n.query.pages){if(s.missing)continue;let a=s.revisions?.[0];if(!a)continue;o(s.title,a.slots.main.content)}}}),t}async function Ht(e){if(e.size===0)return new Map;let t=new Map;return await Ge({targets:[...e],fetchName:"spiHelperGetBulkUserBlockSettings",buildRequest:(n)=>({action:"query",list:"blocks",bklimit:"max",bkusers:n,bkprop:["user","reason","flags","expiry"],formatversion:"2"}),onResponse:(n)=>{for(let o of n.query.blocks)t.set(o.user,{username:o.user,duration:o.expiry,acb:o.nocreate,abao:o.autoblock||o.anononly,ntp:!o.allowusertalk,nem:o.noemail,reason:o.reason})}}),t}async function At(e){if(e.size===0)return new Map;let t=new Map;return await Ge({targets:[...e],fetchName:"spiHelperGetBulkGlobalUsers",buildRequest:(n)=>({action:"query",list:"globalusers",gususers:n,gusprop:["locked","localinfo"],formatversion:"2"}),onResponse:(n)=>{for(let o of n.query.globalusers){if(o.missing||o.invalid)continue;t.set(o.name,{name:o.name,existsLocally:o.localinfo?.attached??!1,locked:o.locked??!1})}}}),t}async function Mt(e){if(e.size===0)return new Map;let t=new Map;return await Ge({targets:[...e],fetchName:"spiHelperGetBulkGlobalBlocks",buildRequest:(n)=>({action:"query",list:"globalblocks",bgtargets:n,bglimit:"max",bgprop:["id","target","by","expiry","reason"],formatversion:"2"}),onResponse:(n)=>{for(let o of n.query.globalblocks){if(!o.target)continue;t.set(o.target,{target:o.target,expiry:o.expiry,by:o.by,reason:o.reason})}}}),t}async function vn(e){let{from:t,limit:n,signal:o}=e,s=M(),a={action:"query",list:"allusers",aulimit:n,auprefix:t,auprop:["blockinfo"],formatversion:"2"};try{return(await s.get(a,{signal:o})).query.allusers}catch(i){if(o?.aborted)return[];return console.error("spiHelperGetUsers fetch error:",i),[]}}async function Fe(e){let{from:t,namespace:n,limit:o,signal:s}=e,a=M(),i={action:"query",list:"allpages",aplimit:o,apprefix:t,apnamespace:n,formatversion:"2"};try{return(await a.get(i,{signal:s})).query.allpages}catch(r){if(s?.aborted)return null;return console.error("spiHelperGetPages fetch error:",r),null}}async function bn(e,t){let n="delete_"+e;D(n);let o=U(e),s=new g({type:"notice",content:`Deleting ${o}`,isHtml:!0}).show(),a=M(e),i={action:"delete",title:e,reason:t};try{await a.postWithToken("csrf",i),s.update({type:"success",content:`Deleted ${o}`}),H(n,"success")}catch(r){s.update({type:"error",content:`Failed to delete ${o}: ${mw.html.escape(JSON.stringify(r))}`}),H(n,"failed")}}async function ns(e,t){let n="undelete_"+e;D(n);let o=U(e),s=new g({type:"notice",content:`Undeleting ${o}`,isHtml:!0}).show(),a=M(e),i={action:"undelete",title:e,reason:t};try{await a.postWithToken("csrf",i),s.update({type:"success",content:`Undeleted ${o}`}),H(n,"success")}catch(r){s.update({type:"error",content:`Failed to undelete ${o}: ${mw.html.escape(JSON.stringify(r))}`}),H(n,"failed")}}async function xn(e,t){let n={action:"parse",prop:"text",pst:!0,text:t,title:e};try{return(await Te(M(e),n)).parse?.text["*"]??""}catch(o){return console.error("Error rendering text:",o),""}}async function le(e){let{pageName:t,content:n}=e,o={action:"parse",prop:"tocdata",formatversion:"2"};if(t!==void 0)o.page=t;else if(n!==void 0)o.text=n,o.contentmodel="wikitext";else return console.error("spiHelperGetInvestigationSections: No page name or content provided"),[];let s=M();try{let a=await(o.text===void 0?s.get(o):Te(s,o));if(!a.parse)return console.error("spiHelperGetInvestigationSections: Could not parse sections"),[];let i=[];for(let r of a.parse.tocdata.sections)if(r.tocLevel===2||r.hLevel===3)i.push(new dn(parseInt(r.index),r.line));return i}catch(a){return console.warn("spiHelperGetInvestigationSections API error:",a),[]}}async function os(e){let t=M(),n={action:"query",format:"json",list:"backlinks",bltitle:e,blnamespace:4,bldir:"ascending",blfilterredir:"nonredirects",bllimit:"max"};try{return(await t.get(n)).query.backlinks.filter((s)=>s.title.startsWith("Wikipedia:Sockpuppet investigations/")&&!s.title.startsWith("Wikipedia:Sockpuppet investigations/SPI/")&&!/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(s.title))}catch{return[]}}async function ss(e){let t=new Map;if(e.length===0)return t;return await Ge({targets:e,fetchName:"spiHelperGetBulkPageRestrictions",buildRequest:(n)=>({action:"query",prop:["info","flagged"],titles:n,inprop:"protection",formatversion:"2"}),onResponse:(n)=>{let o=ls(t,n.query.normalized);for(let s of n.query.pages)o(s.title,{protection:s.protection??[],pendingChanges:s.flagged??null})}}),t}async function kn(e,t){let n="protect_"+e;D(n);let o=U(e),s=new g({type:"notice",content:`Protecting ${o}`,isHtml:!0}),a=M();try{let i="",r="";t.forEach((l)=>{if(i!=="")i=i+"|",r=r+"|";i=i+l.type+"="+l.level,r=r+l.expiry});let c={action:"protect",format:"json",title:e,protections:i,expiry:r,reason:"Restoring protection after history merge"};await a.postWithToken("csrf",c),s.update({type:"success",content:`Protected ${o}`}),H(n,"success")}catch(i){s.update({type:"error",content:`Failed to protect ${o}: ${mw.html.escape(JSON.stringify(i))}`}),H(n,"failed")}}async function yn(e,t){if(t.level==="")return;let n="stabilize_"+e;D(n);let o=M(),s={action:"stabilize",format:"json",titles:e,protectlevel:t.level,expiry:t.expiry,reason:"Restoring pending changes protection after history merge"};try{await o.postWithToken("csrf",s),H(n,"success")}catch{H(n,"failed")}}async function as(){let e=M(),t={action:"query",format:"json",meta:"siteinfo",siprop:"restrictions"};try{return(await e.get(t)).query.restrictions}catch{return{types:[],levels:[],cascadinglevels:[],semiprotectedlevels:[]}}}async function is(e){let{user:t,duration:n,reason:o,reblock:s,anononly:a,accountcreation:i,autoblock:r,notalkpage:c,noemail:l,watchBlockedUser:d,watchExpiry:m="indefinite"}=e,h="block_"+t;D(h);let b="User:"+t,y=U(b),x=new g({type:"notice",content:`Blocking ${y}`,isHtml:!0}).show(),w=M(),S={action:"block",expiry:n,reason:o,reblock:s,anononly:a,nocreate:i,autoblock:r,allowusertalk:!c,noemail:l,watchuser:d,watchlistexpiry:m,user:t,formatversion:"2"};try{let P=await w.postWithToken("csrf",S),A=pn(mw.util.getUrl("Special:BlockList",{wpTarget:`#${P.block.id}`}),"Blocked","Special:BlockList");return x.update({type:"success",content:`${A} ${y}`}),H(h,"success"),!0}catch(P){return x.update({type:"error",content:`Failed to block ${y}: ${mw.html.escape(JSON.stringify(P))}`}),H(h,"failed"),!1}}async function _e(e){let{sourcePage:t,destPage:n,summary:o,ignoreWarnings:s,suppressRedirect:a=!1,moveSubpages:i=!0}=e,r="move_"+t+"_"+n;D(r);let c=M(),l=U(t),d=U(n),m=new g({type:"notice",content:`Moving ${l} to ${d}`,isHtml:!0}).show(),h={action:"move",from:t,to:n,reason:o+cn(!1),noredirect:a,movesubpages:i,ignoreWarnings:s};try{await c.postWithToken("csrf",h),m.update({type:"success",content:`Moved ${l} to ${d}`}),H(r,"success")}catch(b){m.update({type:"error",content:`Failed to move ${l} to ${d}: ${mw.html.escape(JSON.stringify(b))}`}),H(r,"failed")}}async function T(e){let{title:t,newText:n,summary:o,createonly:s=!1,watch:a,watchExpiry:i,baseRevId:r,sectionId:c}=e,l=`edit_${t}`;if(c)l+=`_${c}`;D(l);let d=U(t),m=new g({type:"notice",content:"Editing "+d,isHtml:!0}).show(),h=M(t),b=pt(t),y=Ne(t),x={action:"edit",watchlist:a,summary:o+cn(b!==null),text:n,title:y,createonly:s,formatversion:"2"};if(c)x.section=c.toString();if(i)x.watchlistexpiry=i;if(r)x.baserevid=r;try{let w=await h.postWithToken("csrf",x),S=w.edit.newrevid;if(!S)return m.update({type:"error",content:`Edit failed on ${d}: ${mw.html.escape(JSON.stringify(w))}`}),console.error(w),H(l,"failed"),null;let P=b===null?mw.util.getUrl("",{diff:S}):mw.util.getUrl(`${b}:Special:Diff/${S}`),A=pn(P,"Saved",`View diff ${S}`);return m.update({type:"success",content:`${A} page ${d}`,isHtml:!0}),H(l,"success"),w.edit.newrevid??null}catch(w){return m.update({type:"error",content:`Edit failed on ${d}: ${mw.html.escape(JSON.stringify(w))}`,isHtml:!0}),console.error(w),H(l,"failed"),null}}async function I(e,t,n){let o=U(e),s=new g({type:"notice",content:"Getting page "+o,isHtml:!0});if(t)s.show();let i={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",titles:Ne(e),formatversion:"2"};if(n)i.rvsection=n.toString();try{let c=(await M(e).get(i)).query.pages[0];if(!c||"missing"in c){if(t)s.update({type:"warning",content:`Page ${o} does not exist`,isHtml:!0});return""}let l=c.revisions?.[0];if(!l)return"";if(t)s.update({type:"success",content:`Got ${o}`,isHtml:!0});return l.slots.main.content}catch(r){if(t)s.update({type:"error",content:`Failed to get ${o}: ${mw.html.escape(JSON.stringify(r))}`,isHtml:!0});return""}}async function Ce(e){let n={action:"query",prop:"revisions",rvslots:"main",rvprop:"ids",titles:Ne(e),formatversion:"2"};try{let s=(await M(e).get(n)).query.pages[0];if(!s||"missing"in s)return 0;let a=s.revisions?.[0];if(!a)return 0;return a.revid}catch{return 0}}async function wn(e,t){let o={action:"parse",prop:"limitreportdata",page:Ne(e)};if(t)o.section=t.toString();let s=M(e);try{let a=await s.get(o);return Number(a.parse?.limitreportdata.find((i)=>i.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function Ct(e){let t=M(),n={action:"parse",prop:"limitreportdata",text:e,contentmodel:"wikitext"};try{let o=await Te(t,n);return Number(o.parse?.limitreportdata.find((s)=>s.name==="limitreport-postexpandincludesize")?.["0"]??0)}catch{}return 0}async function rs(e){let t=M(),n={action:"parse",prop:"text",text:e,wrapoutputclass:"",disablelimitreport:!0,disableeditsection:!0,contentmodel:"wikitext"};try{return(await Te(t,n)).parse?.text["*"]??""}catch{return""}}async function Sn(e){let t=M(),n={action:"query",list:"categorymembers",cmtitle:e,cmlimit:"max",cmnamespace:2,formatversion:"2"},o=[];try{for await(let s of ps(t,n,"spiHelperGetCategoryMembers",[e],"get"))o.push(...s.query.categorymembers.map((a)=>a.title))}catch{return[]}return o}async function cs(e,t){let n=M();return(await Te(n,{action:"query",list:"search",srsearch:e,srlimit:t,srprop:["snippet"],formatversion:"2"})).query.search.map(({title:a,snippet:i})=>({title:a,snippet:i}))}function Te(e,t){return e.post(t,{headers:{"Promise-Non-Write-API-Action":"true"}})}var Xo=10;function ls(e,t){let n=new Map((t??[]).map(({from:o,to:s})=>[s,o]));return(o,s)=>{e.set(o,s);let a=n.get(o);if(a!==void 0)e.set(a,s)}}function Yo(e,t,n){return Error(`${e} failed fetching ${t.length} item(s), starting with ${t[0]??"(none)"}`,{cause:n})}async function*ps(e,t,n,o,s="post"){let a={};for(let i=0;i<Xo;i++){let r;try{let l={...t,...a};r=await(s==="post"?Te(e,l):e.get(l))}catch(l){throw Yo(n,o,l)}let{continue:c}=r;if(yield r,!c)return;a=c}throw Yo(n,o,Error(`still continuing after ${Xo} rounds, giving up rather than returning a partial result`))}async function Ge(e){let{targets:t,fetchName:n,buildRequest:o,onResponse:s,method:a}=e,i=M(),r=t.length<=gn?gn:await Ta();await Promise.all(Ma(t,r).map(async(c)=>{for await(let l of ps(i,o(c),n,c,a))await s(l)}))}function Ma(e,t){let n=[];for(let o=0;o<e.length;o+=t)n.push(e.slice(o,o+t));return n}var gn=50,Ca=500;async function Ta(){return(await mw.user.getRights()).includes("apihighlimits")?Ca:gn}function Hn(){return`MediaWiki-JS/${mw.config.get("wgVersion")} spihelper/${Q}`}var es=null,ts=null;function ds(){return es??=new mw.Api({userAgent:Hn()}),es}function Pa(){return ts??=new mw.ForeignApi("https://meta.wikimedia.org/w/api.php",{userAgent:Hn()}),ts}function M(e){if(e&&pt(e)!==null)return Pa();else return ds()}function us(){if(mw.config.get("wgWikiID")==="enwiki")return ds();return new mw.ForeignApi("https://en.wikipedia.org/w/api.php",{userAgent:Hn()})}class We{pageName;prefixedName;caseName;userName;archiveName;casePageName;isArchive;valid;startingRevId;source;constructor(e,t=!1,n="spi"){if(this.pageName=e,this.prefixedName=Mo()+e,this.source=n,this.isArchive=/Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(e),this.caseName=Ia(e,this.isArchive),this.userName=R(this.caseName),this.casePageName="Wikipedia:Sockpuppet investigations/"+this.caseName,this.archiveName=e+"/Archive",this.valid=!!this.caseName.trim(),t)this.startingRevId=mw.config.get("wgCurRevisionId");else this.startingRevId=0}async refreshRevId(){this.startingRevId=await Ce(this.pageName)}async edit(e){return T({title:this.pageName,newText:e.newText,summary:e.summary,createonly:e.createonly??!1,watch:e.watch,watchExpiry:e.watchExpiry,baseRevId:e.baseRevId,sectionId:e.sectionId})}}function Ia(e,t){let n=e.replace(/^Wikipedia:Sockpuppet investigations\//,"");return t?n.replace(/\/Archive.*/,""):n}function za(e){return e.replaceAll(/_/g," ")}var u;function Tt(e,t="spi"){u=new We(za(e),e===mw.config.get("wgPageName"),t)}function je(e){return u.source==="spi"&&u.valid?e+` per [[${u.pageName}]]`:e}function ms(e){if(e?.type==="single")return[e.section];if(e?.type==="multiple")return e.sections;return[]}class An{sections;selectedSection;archiveNotice;_text=null;_loadingPromise=null;constructor(e=[],t=null,n=null){if(this.sections=e,t)this.selectedSection={type:"single",section:t};else this.selectedSection=null;this.archiveNotice=n}}async function ee(e,t={}){let{purge:n=!1,show:o=!1}=t;if(e._loadingPromise)return e._loadingPromise;if(e._text!==null&&!n)return e._text;return e._loadingPromise=I(u.pageName,o),e._text=await e._loadingPromise,e._loadingPromise=null,e._text}async function Pe(e){e.sections=await le({pageName:u.pageName})}async function z(e,t={}){let{purge:n=!1,show:o=!1}=t;if(e._loadingPromise)return e._loadingPromise;if(e._text!==null&&!n)return e._text;return e._loadingPromise=I(u.pageName,o,e.id),e._text=await e._loadingPromise,e._loadingPromise=null,e._text}async function hs(e){return!(await rs("{{#time:r|"+e+"}}")).includes("Error: Invalid time.")}function Pt(e){return`User:${mw.config.get("wgUserName")}/${e}`}var Va=[{oldPath:"watchCase",newPath:["watch","case"],type:"WatchOption"},{oldPath:"watchArchive",newPath:["watch","archive"],type:"WatchOption"},{oldPath:"watchTaggedUser",newPath:["watch","tagged"],type:"WatchOption"},{oldPath:"watchNewCats",newPath:["watch","categories"],type:"WatchOption"},{oldPath:"watchBlockedUser",newPath:["watch","blocked"],type:"boolean"},{oldPath:"watchCaseExpiry",newPath:["expiry","case"],type:"expiry"},{oldPath:"watchArchiveExpiry",newPath:["expiry","archive"],type:"expiry"},{oldPath:"watchTaggedUserExpiry",newPath:["expiry","tagged"],type:"expiry"},{oldPath:"watchNewCatsExpiry",newPath:["expiry","categories"],type:"expiry"},{oldPath:"watchBlockedUserExpiry",newPath:["expiry","blocked"],type:"expiry"},{oldPath:"clerk",newPath:["clerk"],type:"boolean"},{oldPath:"log",newPath:["log","enabled"],type:"boolean"},{oldPath:"reversed_log",newPath:["log","reversed"],type:"boolean"},{oldPath:"tickArchiveWhenCaseClosed",newPath:["tickArchiveWhenCaseClosed"],type:"boolean"},{oldPath:"useCheckuserblockAccount",newPath:["useCheckuserblockAccount"],type:"boolean"},{oldPath:"displayIPv6As64",newPath:["interface","displayIPv6As64"],type:"boolean"},{oldPath:"debugForceCheckuserState",newPath:["debug","forceCheckuser"],type:"boolean"},{oldPath:"debugForceAdminState",newPath:["debug","forceAdmin"],type:"boolean"}];function Ra(e,t,n){let o=e;for(let a=0;a<t.length-1;a++){if(!t[a])throw Error(`Path segment "${t.join(".")}" is invalid`);let i=t[a],r=o[i];if(r===null||typeof r!=="object")throw Error(`Path segment "${t[a]}" is not an object`);o=r}let s=t[t.length-1];o[s]=n}async function gs(e,t){let n=Va.map(async({oldPath:o,newPath:s,type:a})=>{let i=e[o];if(i===void 0)return;if(await La(i,a))Ra(t,s,i)});await Promise.all(n)}async function La(e,t){switch(t){case"boolean":return typeof e==="boolean";case"WatchOption":return typeof e==="string"&&["preferences","watch","nochange","unwatch"].includes(e);case"expiry":return typeof e==="string"&&hs(e)}}var p=structuredClone(rt);function vs(e){p=structuredClone(e)}var bs="userjs-spihelper";function pe(){return M().saveOption(bs,JSON.stringify(p))}function Mn(){let e=String(mw.user.options.get(bs));try{return e?JSON.parse(e):null}catch(t){return console.warn("Failed to parse saved options",t),null}}function fs(e){return typeof e==="object"&&e!==null&&!Array.isArray(e)}function It(e,t){let n=e;for(let[o,s]of Object.entries(t)){if(o==="__proto__")continue;let a=n[o];if(fs(a)&&fs(s))It(a,s);else n[o]=s}}async function Cn(){mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"migrate"});try{let e=`User:${mw.config.get("wgUserName")}/spihelper-options.js`;if(await mw.loader.getScript(mw.util.getUrl(e,{action:"raw",ctype:"text/javascript"})),spiHelperCustomOpts!==void 0)await gs(spiHelperCustomOpts,p)}catch(e){mw.notify("Error retrieving your spihelper-options.js",{type:"error"}),console.error("Error getting local spihelper-options.js: ",e)}}function N(e=!0){if(e&&p.debug.enabled)return p.debug.forceCheckuser;return mw.config.get("wgUserGroups")?.includes("checkuser")??!1}function K(){return p.clerk||N()}function O(){if(p.debug.enabled)return p.debug.forceAdmin;return mw.config.get("wgUserGroups")?.includes("sysop")??!1}function Qe(){return O()||(mw.config.get("wgUserGroups")?.includes("extendedmover")??!1)}var f=(e)=>e;var Tn=f({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,touched:!1,isResetting:!1}},watch:{resetTrigger(){this.isResetting=!0,this.internalValue=this.modelValue,this.touched=!1,this.$nextTick(()=>{this.isResetting=!1})},internalValue(e){if(!this.isResetting)this.touched=!0;if(e===""||ye(e)!==null)this.$emit("update:modelValue",e)}},template:`
<expiry-input :label="label" :touched="touched" v-model="internalValue" />
`});var Pn=f({props:{modelValue:{type:String,required:!0},prefix:{type:String,required:!0}},data(){return{inputValue:this.modelValue,messages:{error:"Page name is invalid"},resetValue:"spihelper_log"}},computed:{valid(){return this.inputValue.length>0&&mw.Title.newFromText(this.prefix+this.inputValue)!==null},status(){return this.valid?"default":"error"}},watch:{inputValue(e){if(this.valid)this.$emit("update:modelValue",e)}},methods:{resetInput(){this.inputValue=this.resetValue}},template:`
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
`});var In="custom-",xs="{case}";function zn(e){return e.url.includes(xs)}function ks(e,t){let n;try{n=new URL(e.url.replaceAll(xs,encodeURIComponent(t)))}catch{return null}return n.protocol==="https:"?n:null}function zt(e){if(!e.label.trim())return"The tool is missing a label";if(ks(e,"Example")===null)return"The URL must be a full https:// address";if(!e.userParam.trim())return"Name the query parameter the usernames go in";return null}function ys(e){return e.filter((t)=>t.enabled&&zt(t)===null)}var Vn=new Map(Le.map((e)=>[e.id,e]));function Vt(e){return Vn.has(e.id)}var Ua=["label","url","userParam","separator","wrapper","repeatParam"];function Rt(e){let t=Vn.get(e.id);return t!==void 0&&Ua.some((n)=>e[n]!==t[n])}function ws(e){return e.map((t)=>{if(!Vt(t))return t;let n=Rt(t);if(n===Boolean(t.edited))return t;if(n)return{...t,edited:!0};let o={...t};return delete o.edited,o})}function Rn(e){let t=(Array.isArray(e)?e:[]).filter((s)=>typeof s?.id==="string"),n=new Set,o=[];for(let s of t){if(n.has(s.id))continue;n.add(s.id);let a=Vn.get(s.id);if(a&&!s.edited)o.push({...a,enabled:s.enabled});else if(a||s.edited||s.id.startsWith(In))o.push(s)}for(let s of Le)if(!n.has(s.id))o.push({...s});return o}function Ss(e){return Rn(e.map((t)=>Vt(t)?{...t,edited:!1}:t))}function Lt(e,t,n){if(zn(e)&&!t)return null;let o=ks(e,t);if(!o)return null;let s=n.map((a)=>e.wrapper+a+e.wrapper);if(e.repeatParam)for(let a of s)o.searchParams.append(e.userParam,a);else o.searchParams.set(e.userParam,s.join(e.separator));return o}function Ln(e,t){let n=e.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/[\s_]+/g,"[\\s_]+"),o=[];for(let s of t.matchAll(new RegExp(`\\{\\{\\s*${n}\\s*(?=[|}])`,"gi"))){if(o.some((i)=>s.index<i.end))continue;let a=0;for(let i=s.index;i<t.length-1;i++)if(t.startsWith("{{",i))a++,i++;else if(t.startsWith("}}",i)){if(a--,i++,a===0){o.push({text:t.slice(s.index,i+1),start:s.index,end:i+1});break}}}return o}function ne(e){let t=[],n=e.trim().matchAll(/\{\{([\s\S]+?)}}/g);for(let o of n){if(!o[1])continue;t.push(Ut(o[1]))}return t}function Ea(e){let t=[],n=0,o=0;for(let s=0;s<e.length;s++)if(e.startsWith("[[",s)||e.startsWith("{{",s))n++,s++;else if(e.startsWith("]]",s)||e.startsWith("}}",s))n--,s++;else if(e[s]==="|"&&n===0)t.push(e.slice(o,s)),o=s+1;return t.push(e.slice(o)),t}function Ut(e){let t=Ea(e).map((a)=>a.trim()),n=t.shift()?.toLowerCase()??"unknown",o={},s=[];for(let a of t){let i=a.indexOf("=");if(i!==-1){let r=a.slice(0,i).trim().toLowerCase(),c=a.slice(i+1).trim();if(c===""){o[r]=c;continue}let l=Number(c);if(!Number.isNaN(l)){o[r]=l;continue}let d=$a(c);if(d===null){o[r]=c;continue}o[r]=d}else if(a)s.push(a)}return{name:n,params:o,positional:s}}var Na=new Set(["y","yes","true","on"]),Ba=new Set(["n","no","false","off"]);function $a(e){let t=e.toLowerCase();if(Na.has(t))return!0;if(Ba.has(t))return!1;return null}function Hs(e){let t=[];for(let n of e.positional)t.push(n);for(let[n,o]of Object.entries(e.params))if(!Number.isNaN(Number(n)))t.push(o.toString());return t}class oe{master;status;locked;evidence;altmaster;altmasterStatus;constructor(e){this.master=R(e.master),this.status=e.status,this.locked=e.locked??!1,this.evidence=e.evidence??"",this.altmaster=R(e.altmaster??""),this.altmasterStatus=e.altmasterStatus??"suspected"}generateWikitext(e){let t="{{sockpuppet";if(t+=`
| 1 = ${this.master}`,t+=`
| 2 = ${this.status}`,this.locked)t+=`
| locked = yes`;if(e===!1)t+=`
| notblocked = yes`;if(this.evidence)t+=`
| evidence = ${this.evidence}`;if(this.altmaster)t+=`
| altmaster = ${this.altmaster}`,t+=`
| altmaster-status = ${this.altmasterStatus}`;return t+=`
}}`,t}clone(){return new oe({master:this.master,status:this.status,evidence:this.evidence,altmaster:this.altmaster,altmasterStatus:this.altmasterStatus})}equals(e){if(!(e instanceof oe))return!1;return this.master===e.master&&this.status===e.status&&this.locked===e.locked&&this.evidence===e.evidence&&this.altmaster===e.altmaster&&(!this.altmaster||this.altmasterStatus===e.altmasterStatus)}}class he{status;checked;locked;ltapage;spipage;evidence;constructor(e){this.status=e.status,this.checked=e.checked??!1,this.locked=e.locked??!1,this.ltapage=e.ltapage??"",this.spipage=e.spipage??"",this.evidence=e.evidence??""}generateWikitext(){let e="{{sockpuppeteer",t=this.status==="banned"?"banned":"blocked",n=this.status!=="blocked";if(e+=`
| 1 = ${t}`,n)e+=`
| checked = yes`;if(this.locked)e+=`
| locked = yes`;if(this.ltapage)e+=`
| ltapage = ${this.ltapage}`;if(this.spipage)e+=`
| spipage = ${this.spipage}`;if(this.evidence)e+=`
| evidence = ${this.evidence}`;return e+=`
}}`,e}clone(){return new he({status:this.status,checked:this.checked,ltapage:this.ltapage,spipage:this.spipage,evidence:this.evidence})}equals(e){if(!(e instanceof he))return!1;return this.status===e.status&&this.checked===e.checked&&this.locked===e.locked&&this.ltapage===e.ltapage&&this.spipage===e.spipage&&this.evidence===e.evidence}}function Et(e,t){let n=t?` on ${t}`:"",o=[],s=ne(e);for(let a of s)if(["sockpuppeteer","sockmaster"].includes(a.name)){let i=(a.params["1"]??a.positional[0])?.toString(),r=i==="cu"||(i?.includes("confirmed")??!1),c=a.params.checked===!0||r,l;if(r)l="confirmed";else if(i==="banned")l="banned";else if(i?.includes("blocked"))l=c?"confirmed":"blocked";else{console.warn("Unrecognised master status",i),new g({type:"warning",content:`Ignoring {{${a.name}}} tag${n} with unrecognised status "${i??""}". Tagging will overwrite it`}).showOnce();continue}let d=new he({status:l,checked:c});if(a.params.locked===!0)d.locked=!0;if(a.params.ltapage)d.ltapage=a.params.ltapage;if(a.params.spipage)d.spipage=a.params.spipage;if(a.params.evidence)d.evidence=a.params.evidence;o.push(d)}else if(["sockpuppet","sock"].includes(a.name)){let i=a.params["1"]??a.positional[0];if(!i){console.warn("Master parameter not found");continue}let r=a.params["2"]??a.positional[1],c;switch(r){case"blocked":c="blocked";break;case"proven":c="proven";break;case"confirmed":case"nbconfirmed":case"cuconfirmed":c="confirmed";break;default:console.warn("Unrecognised sock status",r),new g({type:"warning",content:`Ignoring {{${a.name}}} tag${n} with unrecognised status "${r?.toString()??""}". Tagging will overwrite it`}).showOnce();continue}let l=new oe({master:i,status:c}),d=a.params.altmaster;if(d){let m=a.params["altmaster-status"],h;switch(m){case"suspect":case"suspected":h="suspected";break;case"proven":h="proven";break;default:console.warn("Unrecognised altmaster status",m),new g({type:"warning",content:`Dropping altmaster "${d.toString()}"${n}: unrecognised altmaster-status "${m?.toString()??""}"`}).showOnce();break}if(h)l.altmaster=d,l.altmasterStatus=h}if(a.params.evidence)l.evidence=a.params.evidence;if(a.params.locked)l.locked=!0;o.push(l)}return o}function _(e){return e instanceof oe}function de(e){return e instanceof he}var Nt=null;function As(e){Nt=e}var Un=null;function Ms(e){Un=e}function Bt(e){return Un?Un(e):e}var En=null;function Cs(e){En=e}function Ts(e){return En?En(e):e}function ue(e,t){if(mw.util.isIPAddress(e,!0))if(p.interface.displayIPv6As64&&mw.util.isIPv6Address(e,!1))return{...ge(t.archiveNotice),username:Da(e)};else return{...ge(t.archiveNotice),username:e};else return{...ge(t.archiveNotice),username:e}}function Da(e){if(!mw.util.isIPv6Address(e,!1))return e;return e.split(":").slice(0,4).concat("0","0","0","0").join(":")+"/64"}function ge(e){let t=crypto.randomUUID(),n={id:t,username:"",block:To(),link:{}};if(Nt)n[Nt]=t;if(e){if(e.crosswiki)n.block.lock=!0;if(e.notalk)n.block.nem=!0,n.block.ntp=!0}return n.block.duration=p.interface.defaultBlockDuration,n}function Ze(e){let{userRow:t,currentBlock:n,userPage:o,defaultBlock:s}=e;if(n)t.block.block=!0,t.block.acb=n.acb,t.block.abao=n.abao,t.block.ntp=n.ntp,t.block.nem=n.nem,t.block.duration=n.duration;else if(t.block.block=s,mw.util.isIPAddress(t.username,!0))t.block.duration="1 week";if(o)t.block.tags=Et(o,t.username);return t}var Je=(e)=>("items"in e);function Ps(e){let{fetchedUser:t,defaultBlock:n,state:o}=e,s=Ze({userRow:e.userRow,defaultBlock:n,currentBlock:t?.block,userPage:t?.userPage}),a=o.archiveNotice?.crosswiki??!1;if(t?.globalUser)return s.block.lock=t.globalUser.locked||a,{userRow:s,globalStatus:{kind:"locked",locked:t.globalUser.locked}};if(C(s.username)){let i=t?.globalBlock!==void 0;return s.block.lock=i||a,{userRow:s,globalStatus:{kind:"gblocked",blocked:i}}}return{userRow:s,globalStatus:{kind:"none"}}}function Nn(e){return e.map((t)=>{if(Je(t)){let n=Nn(t.items);if(n.length===0)return null;return{...t,items:n}}if(!t.value)return null;return t}).filter((t)=>t!==null)}function Ke(e,t,n,o,s,a,i){if(t==="lock"){if(e===null)return!1;return C(e.username)?a.get(e.username)===!0:s.get(e.username)===!0}if(t==="block"){if(e===null)return n.noBlock;return n.noBlock||!n.override&&o.get(e.username)!==void 0}if(n.noBlock)return!0;if(e===null)return!i.some((r)=>r.block.block);if(!e.block.block)return!0;return!n.override&&o.get(e.username)!==void 0}function $t(e,t){return new Promise((n)=>{if(t.aborted){n();return}let o=setTimeout(n,e);t.addEventListener("abort",()=>{clearTimeout(o),n()},{once:!0})})}function G(e){return e.aborted}var Bn=f({props:{feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},toaster:{type:Object,required:!0}},data:function(){let t=`User:${mw.config.get("wgUserName")??""}/`,n=Io.reduce((o,s)=>{if(s!=="sections")o.push({value:s,label:s.charAt(0).toUpperCase()+s.slice(1)});return o},[]);return{open:!1,openHandler:null,showExtra:p.debug.enabled,showExtraMessage:!1,showExtraHandler:null,logPrefix:t,caseActionMenuItems:n,expandedLinkTool:null,selectedChipItems:p.defaultActions,icons:{cdxIconAdd:Ae,cdxIconArrowDown:zo,cdxIconClock:Lo,cdxIconClose:Uo,cdxIconCode:Eo,cdxIconEdit:$o,cdxIconFeedback:Me,cdxIconJournal:qo,cdxIconLink:Fo,cdxIconLayout:Oo,cdxIconPalette:_o,cdxIconReload:xt,cdxIconTrash:re,cdxIconWatchlist:jo},instanceSettings:structuredClone(p),oldSettings:structuredClone(p),resetTrigger:0}},computed:{hasEditedBuiltins(){return this.instanceSettings.linkTools.some((e)=>Rt(e))},logPage(){return`${mw.config.get("wgServer")}/wiki/${Pt(p.log.page)}`},isCheckUser(){let{debug:e}=this.instanceSettings;return(mw.config.get("wgUserGroups")?.includes("checkuser")??!1)||e.enabled&&e.forceCheckuser},inputChipItems:{get(){return this.instanceSettings.defaultActions.map((e)=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))},set(e){this.instanceSettings.defaultActions=e.map((t)=>t.value)}}},watch:{open(e){if(e){if(!this.showExtra&&this.showExtraHandler)window.addEventListener("keydown",this.showExtraHandler)}else{this.instanceSettings.linkTools=ws(Bt(this.instanceSettings.linkTools));let t=JSON.stringify(this.instanceSettings);if(JSON.stringify(this.oldSettings)!==t){vs(Bt(this.instanceSettings));let o=this.toaster.info("Saving settings...",{autoDismiss:!1});pe().then((s)=>{this.toaster.success("Settings saved! Reload to apply them",{autoDismiss:!0})}).catch((s)=>{let a=s instanceof Error?s.message:String(s);this.toaster.error(`Failed to save settings: ${a}`,{autoDismiss:!0})}).always(()=>{this.oldSettings=JSON.parse(t),setTimeout(()=>{this.toaster.dismiss(o)},3000)})}if(this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler)}}},mounted(){this.openHandler=()=>{this.open=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"options"})},this.openButton.addEventListener("click",this.openHandler);//! Use the Konami code to unlock debug menu
let e=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"],t=0;this.showExtraHandler=(n)=>{if(n.key===e[t]){if(t++,t===e.length){if(this.showExtra=!0,this.showExtraMessage=!0,this.showExtraHandler)window.removeEventListener("keydown",this.showExtraHandler);t=0}}else t=0}},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler)},methods:{isMenuGroupData:Je,linkToolProblem:zt,isBuiltinLinkTool:Vt,linkToolSummary(e){let t="";try{t=new URL(e.url).host}catch{}return Rt(e)?`${t} (edited)`:t},linkToolPreview(e){if(zt(e))return null;let t=Lt(e,"Master",["Sock1","Sock2"]);return t?{href:t.href,text:decodeURI(t.href)}:null},toggleLinkToolEditor(e){this.expandedLinkTool=this.expandedLinkTool===e.id?null:e.id},addLinkTool(){let e=`${In}${crypto.randomUUID()}`;this.instanceSettings.linkTools.push({id:e,enabled:!0,label:"",url:"",userParam:"",separator:"|",wrapper:"",repeatParam:!1}),this.expandedLinkTool=e},restoreBuiltinLinkTools(){this.instanceSettings.linkTools=Ss(Bt(this.instanceSettings.linkTools))},loadDefaults(){this.instanceSettings=JSON.parse(JSON.stringify(rt)),this.resetTrigger++},launchFeedback(){this.open=!1,this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`Options form v${Q}-${Z}`})},removeTemplateEntry(e){this.instanceSettings.custom.commentTemplates.splice(e,1)},addTemplateEntry(e){if(e==="item")this.instanceSettings.custom.commentTemplates.push({label:"",value:""});else this.instanceSettings.custom.commentTemplates.push({label:"",items:[]})},moveDown(e,t){if(t<0||t>=e.length-1)return e;let n=e[t+1];e[t+1]=e[t],e[t]=n}},template:`
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
<template #title>Comment templates</template>
<div>
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
<cdx-accordion :action-icon="icons.cdxIconLink" :action-always-visible="true">
<template #title>Links</template>
<p>
The columns of the Generate Links action, ordered. Some tools are managed by the script; you
can still edit them, but pressing "restore" will undo their edits and load the latest defaults.
</p>
<div class="spiHelper-template-container">
<div v-for="(tool, i) in instanceSettings.linkTools" :key="tool.id" class="spiHelper-template">
<div class="spiHelper-template-input spiHelper-linkTool-header">
<cdx-toggle-switch v-model="tool.enabled" :align-switch="true" class="spiHelper-linkTool-switch">
{{ tool.label || 'Untitled tool' }}
<template #description>{{ linkToolSummary(tool) }}</template>
</cdx-toggle-switch>
<cdx-button @click="toggleLinkToolEditor(tool)" :aria-label="'Edit ' + tool.label"
:aria-expanded="expandedLinkTool === tool.id"
:action="expandedLinkTool === tool.id ? 'progressive' : 'default'">
<cdx-icon :icon="icons.cdxIconEdit" />
</cdx-button>
<cdx-button @click="moveDown(instanceSettings.linkTools, i)" aria-label="Move tool down"
:disabled="instanceSettings.linkTools.length <= i + 1">
<cdx-icon :icon="icons.cdxIconArrowDown" />
</cdx-button>
<cdx-button v-if="!isBuiltinLinkTool(tool)" @click="instanceSettings.linkTools.splice(i, 1)"
action="destructive" aria-label="Delete tool">
<cdx-icon :icon="icons.cdxIconTrash" />
</cdx-button>
</div>
<div v-if="expandedLinkTool === tool.id" class="spiHelper-template-group-item">
<div class="spiHelper-template-input spiHelper-linkTool-fields">
<cdx-field>
<template #label>Label</template>
<cdx-text-input v-model="tool.label" />
</cdx-field>
<cdx-field class="spiHelper-linkTool-url">
<template #label>URL</template>
<cdx-text-input v-model="tool.url" placeholder="https://example.toolforge.org/{case}" />
</cdx-field>
</div>
<div class="spiHelper-template-input spiHelper-linkTool-fields">
<cdx-field>
<template #label>Parameter</template>
<cdx-text-input v-model="tool.userParam" />
</cdx-field>
<cdx-field :disabled="tool.repeatParam">
<template #label>Separator</template>
<cdx-text-input v-model="tool.separator" />
</cdx-field>
<cdx-field>
<template #label>Wrapper</template>
<cdx-text-input v-model="tool.wrapper" />
</cdx-field>
</div>
<cdx-toggle-switch v-model="tool.repeatParam" class="spiHelper-linkTool-repeat">
Repeat the parameter for each user
</cdx-toggle-switch>
<p v-if="linkToolPreview(tool)" class="spiHelper-linkTool-preview">
<a :href="linkToolPreview(tool)?.href" target="_blank" rel="noopener">
{{ linkToolPreview(tool)?.text }}
</a>
</p>
</div>
<cdx-message v-if="linkToolProblem(tool)" type="error" :inline="true">
{{ linkToolProblem(tool) }}
</cdx-message>
</div>
</div>
<cdx-button @click="addLinkTool" action="progressive">
<cdx-icon :icon="icons.cdxIconAdd" />
Add tool
</cdx-button>
<cdx-button @click="restoreBuiltinLinkTools" :disabled="!hasEditedBuiltins">
<cdx-icon :icon="icons.cdxIconReload" />
Restore built-ins
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
`});var $n=f({props:{modelValue:{type:String,required:!0},label:{type:String,required:!0},resetTrigger:{type:Number,default:0}},data(){return{internalValue:this.modelValue,watchOptions:Qo,messages:{error:"Watch option is invalid"}}},computed:{status(){return Zo.includes(this.internalValue)?"default":"error"}},watch:{resetTrigger(){this.internalValue=this.modelValue},internalValue(e){this.$emit("update:modelValue",e)}},template:`
<cdx-field :status="status" :messages="messages">
<template #label>{{ this.label }}</template>
<cdx-select
:menu-items="watchOptions"
v-model:selected="internalValue"
/>
</cdx-field>
`});function Dn(){return{sections:{label:"Sections",selectionType:"both"},comment:{label:"Comment",selectionType:"section"},status:{label:"Case Status",selectionType:"section"},block:{label:O()?"Block/Tag Socks":"Tag Socks",selectionType:"both"},link:{label:"Generate Links",selectionType:"both"},move:{label:{case:"Move/Merge Full Case",section:"Move Section"},selectionType:"both"},archive:{label:{case:"Archive Closed",section:"Archive"},selectionType:"both"},management:{label:"SPI Management",selectionType:"case"}}}function qn(){return{sections:{enabled:!0,data:{section:null}},comment:{enabled:!1,data:{text:"* ",bySection:new Map}},status:{enabled:!1,data:{old:"new",new:"nochange",bySection:new Map}},block:{enabled:!1,data:gt(u.userName)},link:{enabled:!1},management:{enabled:!1,data:{flags:new Set}},move:{enabled:!1,data:{target:"",suppress:!1,addNote:!1}},archive:{enabled:!1}}}var Is=new Set(["status","management","comment","move","archive"]),zs=new Set(["move","archive","management"]),Vs=new Set(["sections","move","archive","block","link"]),Rs=new Set(["status","comment"]);function fe(e){let{name:t,selection:n,selectionType:o}=e;if(u.isArchive)return!Is.has(t);if(!K()&&zs.has(t))return!1;if(t==="sections")return!0;if(n===null)return!1;if(o==="both")return!0;if(Array.isArray(n))return!0;return o==="case"===(n==="all")}function Xe(e){let{label:t,selectionType:n,allSelected:o}=e;if(typeof t==="string")return t;if(n==="both")return o?t.case:t.section;return"Unexpected configuration"}function On(e){let t=new Set;if(e===null)return t;if(e.deny)t.add("deny");if(e.moot)t.add("moot");if(e.notalk)t.add("notalk");if(e.crosswiki)t.add("crosswiki");return t}var Dt=1000,qt=86400*Dt,qa={second:Dt,minute:60*Dt,hour:3600*Dt,day:qt,week:7*qt};function Oa(e,t,n){let o=qa[n];if(o!==void 0)return e.getTime()+t*o;let s=Math.floor(t),a=t-s,i=new Date(e.getTime());if(n==="month")return i.setUTCMonth(i.getUTCMonth()+s),i.getTime()+a*30.44*qt;return i.setUTCFullYear(i.getUTCFullYear()+s),i.getTime()+a*365.25*qt}function Fn(e,t=new Date){if($e(e))return 1/0;if(ae(e)){let i=Date.parse(e);return isNaN(i)?null:i}let n=ln.exec(e);if(!n)return null;let[,o="",s=""]=n,a=Number(o);if(isNaN(a))return null;return Oa(t,a,s.toLowerCase().replace(/s$/,""))}function _n(e){let{username:t,existing:n,intended:o,now:s=new Date}=e,a=[],i=Fn(n.duration,s),r=Fn(o.duration,s);if(i!==null&&r!==null&&r<i)a.push("it expires sooner");if(n.acb&&!o.acb)a.push("account creation is re-enabled");if(mw.util.isIPAddress(t,!0)){if(!n.abao&&o.abao)a.push("it becomes anon-only")}else if(n.abao&&!o.abao)a.push("autoblock is disabled");if(n.ntp&&!o.ntp)a.push("talk page access is restored");if(n.nem&&!o.nem)a.push("email access is restored");return a}function Gn(e){switch(e){case"reopen":return"open";case"selfendorse":return"endorse";default:return e}}function Ie(e){if(!e.enabled||e.new==="nochange")return e.old;return Gn(e.new)}function Wn(e){switch(e){case"CUrequest":return"{{CURequest}}";case"admin":return"{{awaitingadmin}}";case"clerk":return"{{Clerk Request}}";case"selfendorse":return"{{Requestandendorse}}";case"inprogress":return"{{Inprogress}}";case"decline":return"{{Decline}}";case"cudecline":return"{{Cudecline}}";case"endorse":return"{{Endorse}}";case"cuendorse":return"{{cu-endorsed}}";case"moreinfo":case"cumoreinfo":return"{{moreinfo}}";case"relist":return"{{relisted}}";case"hold":case"cuhold":return"{{onhold}}";case"reopen":return"{{reopen}}";case"checked":case"closed":case"new":case"open":case"nochange":return null;default:return console.warn("New case status",e,"is unexpected"),null}}function Ot(e,t){let n=Wn(t);if(n===null)return e;if(an.test(e)){let o=e.replace(an,n);if(!n)o=o.replace(/^(\s*\*\s*)? [-–] /,"$1");return o}else if(n)return"* "+n+" – "+e.replace(/^\s*\*\s*/,"");return e}function jn(e){if(ke.test(e))return"closed";if(/^open$/i.test(e))return"open";if(/^(?:inprogress|checking)$/i.test(e))return"inprogress";if(/^relist(ed)?$/i.test(e))return"relist";if(/^(?:checked|completed)$/i.test(e))return"checked";if(/^declined?$/i.test(e))return"decline";if(/^cudeclined?$/i.test(e))return"cudecline";if(/^endorsed?$/i.test(e))return"endorse";if(/^cuendorsed?$/i.test(e))return"cuendorse";if(/^(?:CU|checkuser|CUrequest|request)$/i.test(e))return"CUrequest";if(/^cumoreinfo$/i.test(e))return"cumoreinfo";if(/^moreinfo$/i.test(e))return"moreinfo";if(/^hold$/i.test(e))return"hold";if(/^cuhold$/i.test(e))return"cuhold";if(/^clerk$/i.test(e))return"clerk";if(/^admin(?:istrator)?$/i.test(e))return"admin";return"new"}function Ft(...e){return({templateNames:t})=>{let n=e.find((o)=>t.has(o.toLowerCase()));return n?`{{${n}}}`:null}}function Fa(e){let t=new RegExp(String.raw`\b${e}\b`,"i");return({wikitext:n})=>{let o=t.exec(n);return o?`the word "${o[0]}"`:null}}var _a=["CUrequest","admin","clerk","selfendorse","inprogress","decline","cudecline","endorse","cuendorse","moreinfo","cumoreinfo","relist","hold","cuhold","reopen"],Ga=_a.reduce((e,t)=>{let n=Wn(t);if(n){let o=n.slice(2,-2),s=Gn(t);e.set(o,(e.get(o)??new Set).add(s))}return e},new Map);function Wa(e){let t=`the case status is set to ${e}`;return[{matchers:[Ft("btc","Action and close","Closing without action","cwa"),Fa("closing")],fulfilled:e==="closed",unfulfilledText:t},...[...Ga].map(([n,o])=>({matchers:[Ft(n)],fulfilled:o.has(e),unfulfilledText:t}))]}function ja(e){return[{matchers:[Ft("bnt","btc","bwt","sblock","IPblock")],fulfilled:e.blockPlanned,unfulfilledText:"no block is set to be applied"},{matchers:[Ft("GlobalLocksRequested","glr")],fulfilled:e.globalRequestPlanned,unfulfilledText:"no lock or global block is set to be requested"}]}function Qn(e,t){let n={wikitext:e,templateNames:new Set(ne(e).map((s)=>s.name))};return[...Wa(t.effectiveStatus),...ja(t)].flatMap(({matchers:s,fulfilled:a,unfulfilledText:i})=>{if(a)return[];let r=s.map((c)=>c(n)).find((c)=>c!==null);return r?[{quoted:r,reason:i}]:[]})}var Ye="Wikipedia:Sockpuppet investigations/",Qa=` prefix:${Ye}`,Za=300,Ja=50,Ls=10,_t="\\p{L}\\p{M}\\p{N}",Ka=new RegExp(`[${_t}]+`,"gu");function Xa(e){return e.slice(Ye.length).replace(/\/Archive(\/.*)?$/,"")}function Zn(e){return/\/Archive(\/|$)/.test(e)}async function Ya(){if(u.isArchive)return!0;return await Ce(u.casePageName+"/Archive")!==0}function ei(e){return new Set(e.map((t)=>t.caseName)).size}function ti(e){return`"${e.replace(/[\\"]/g,"\\$&")}"`}function ni(e){return` -insource:/archive notice\\|(1=)?${e.replace(/[.?+*|{}[\]()"\\#@&<>~/]/g,"\\$&")}[|}]/`}function oi(e,t){let n=ni(t)+Qa,o=[],s=[];for(let a of e){let i=ti(a),r=[...s,i].join(" OR ")+n;if(s.length>0&&r.length>Za)o.push(s.join(" OR ")+n),s=[];s.push(i)}if(s.length>0)o.push(s.join(" OR ")+n);return o}function si(e){let t=e.match(Ka);if(!t)return null;return new RegExp(`(?<![${_t}])${t.join(`[^${_t}]+`)}(?![${_t}])`,"giu")}function ai(e){return new DOMParser().parseFromString(e,"text/html").body.textContent.replace(/\s+/g," ").trim()}function ii(e,t){let n=[],o=0;for(let s of e.matchAll(t)){if(s.index>o)n.push({text:e.slice(o,s.index),isMatch:!1});n.push({text:s[0],isMatch:!0}),o=s.index+s[0].length}if(n.length===0)return null;if(o<e.length)n.push({text:e.slice(o),isMatch:!1});return n}async function ri(e){let t=new Map;for(let i of e){let r=si(i);if(r)t.set(i,r)}let n=oi(t.keys(),u.userName),[o,s]=await Promise.all([Promise.all(n.map((i)=>cs(i,Ja))),t.has(u.userName)&&Ya()]),a=new Map;for(let{title:i,snippet:r}of o.flat()){if(i===u.casePageName||i.startsWith(u.casePageName+"/")||i.startsWith(Ye+"SPI/"))continue;let c=ai(r);for(let[l,d]of t){if(s&&l===u.userName&&Zn(i))continue;let m=ii(c,d);if(!m)continue;let h=a.get(l)??[];if(h.some((b)=>b.title===i))continue;h.push({title:i,caseName:Xa(i),snippets:m}),a.set(l,h)}}for(let i of a.values())i.sort((r,c)=>Number(Zn(r.title))-Number(Zn(c.title)));return a}function ci(e,t){let n=(r)=>U(r,r.replace(Ye,"")),o=ei(t),[s]=t,a;if(o===1&&s)a=U(Ye+s.caseName,s.caseName);else if(o>Ls)a=`${Ls}+ SPIs`;else a=B(o,"SPI");if(t.length!==o)a+=` (${B(t.length,"page")})`;let i=t.map(({title:r,snippets:c})=>{let l=c.map(({text:d,isMatch:m})=>m?`<b>${mw.html.escape(d)}</b>`:mw.html.escape(d)).join("");return`<li>${n(r)}: …${l}…</li>`}).join("");return`<details><summary>${mw.html.escape(e)} is mentioned in ${a}</summary><ul>${i}</ul></details>`}async function Us(e){let t;try{t=await ri(e)}catch(n){console.error("Searching for user mentions failed:",n),new g({type:"warning",content:"Could not search other cases for mentions of these accounts"}).showOnce();return}for(let[n,o]of t)new g({type:"notice",content:ci(n,o),isHtml:!0}).showOnce()}var li=/sock ?list/,pi=["ip","vandal","user","noping","np"];function di(e){return li.test(e)||pi.some((t)=>e.includes(t))}function ze(e){let{text:t,fullSearch:n,state:o}=e,s=n?[ue(u.userName,o)]:[],a=[],i=n?new Set([u.userName]):new Set;if(n){let c=$(document);if(o.selectedSection?.type==="single")c=$(`a[href$="section=${o.selectedSection.section.id}"]`).parentsUntil(":has(hr)").last().nextUntil("hr");let l=c.find(".cuEntry").toArray().map((d)=>d.querySelector("a")).filter((d)=>d!==null);for(let d of l){let m=Array.from(d.childNodes).find((b)=>b.nodeType===Node.TEXT_NODE)?.textContent??"";if(!m)continue;let h=R(m);if(i.has(h))continue;s.push(ue(h,o)),i.add(h)}}let r=ne(t);for(let c of r)if(di(c.name)){let l=Hs(c);for(let d of l){let m=R(d);if(m&&!i.has(m))a.push(ue(m,o)),i.add(m)}}return[s,a]}async function ve(e,t){let n=new Set([...e].filter((m)=>!t.has(m))),o=new Set,s=new Set;for(let m of n)(C(m)?s:o).add(m);let a=[...o].map((m)=>`User:${m}`);if(n.size>0)Us(n);let i=await Promise.all([Ht(n),ce(a),At(o),Mt(s)]).catch((m)=>{let h=m instanceof Error?m.message:String(m);return new g({type:"warning",content:`Could not look up blocks and tags for these accounts: ${h}`}).show(),null});if(!i)return;let[r,c,l,d]=i;for(let m of n){let h={block:r.get(m),userPage:c.get(`User:${m}`),globalUser:l.get(m),globalBlock:d.get(m)};t.set(m,Ts(h))}}function Es(e){let{userRow:t,defaultBlock:n,blockData:o,state:s}=e,a=o.fetchedUsers.get(t.username),{userRow:i,globalStatus:r}=Ps({userRow:t,fetchedUser:a,defaultBlock:n,state:s});if(a?.block)o.userBlocks.set(i.username,a.block);switch(r.kind){case"locked":o.userLocks.set(i.username,r.locked);break;case"gblocked":o.userGlobalBlocks.set(i.username,r.blocked);break;case"none":break}return i}function et(e){let{accounts:t,usernames:n,blockData:o,state:s}=e;for(let a of t){if(!n.has(a.username))continue;Es({userRow:a,defaultBlock:a.block.block,blockData:o,state:s})}}async function be(e){let{likelySocks:t,possibleSocks:n,blockData:o,state:s}=e,a=[...t,...n],i=new Set(t.map((r)=>r.id));return await ve(new Set(a.map((r)=>r.username)),o.fetchedUsers),a.map((r)=>Es({userRow:r,defaultBlock:i.has(r.id),blockData:o,state:s}))}var Jn=f({props:{selection:{type:[Number,Array,String,null],required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},emits:["actionToggled"],data(){return{accordionModel:!0}},computed:{allSelected(){return this.selection==="all"},showAccordion(){return fe({name:this.name,selection:this.selection,selectionType:this.selectionType})},text(){return Xe({label:this.label,selectionType:this.selectionType,allSelected:this.allSelected})},showEnabledClass(){return this.name!=="sections"&&this.actionEnabled}},template:`
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
`});var Kn=f({props:{selection:{type:[Number,Array,String,null],required:!0},name:{type:String,required:!0},label:{type:[String,Object],required:!0},selectionType:{type:String,required:!0},displayedForms:{type:Set,required:!0},actionEnabled:{type:Boolean,required:!0}},computed:{buttonEnabled(){return this.displayedForms.has(this.name)||this.actionEnabled},allSelected(){return this.selection==="all"},showButton(){return fe({name:this.name,selection:this.selection,selectionType:this.selectionType})},buttonAction(){return this.buttonEnabled?"progressive":"normal"},buttonStyle(){return{opacity:this.buttonEnabled?1:0.7,color:this.displayedForms.has(this.name)?"var(--color-base)":""}},text(){return Xe({label:this.label,selectionType:this.selectionType,allSelected:this.allSelected})}},template:`
<cdx-button
v-if="showButton"
:name="name"
:action="buttonAction"
:style="buttonStyle"
>
{{ text }}
</cdx-button>
`});var Xn=f({props:{enabled:{type:Boolean,required:!0},empty:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:enabled"],data(){return{built:this.enabled}},watch:{enabled(e){if(!e||this.built)return;requestAnimationFrame(()=>{this.built=this.enabled})}},template:`
<cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
Enabled
</cdx-toggle-switch>
<div v-if="!empty && built" v-show="enabled">
<slot />
</div>
`});var Yn=f({props:{name:{type:String,required:!0},caseActions:{type:Object,required:!0},accounts:{type:Array,required:!0},state:{type:Object,required:!0},multiSelectMode:{type:Boolean,required:!0},selectedSections:{type:Array,required:!0},displayed:{type:Boolean,required:!0}},emits:["update:multiSelectMode","update-multi-select-sections","update-section-selection","update-status","update-section-status","user-selected","remove-rows","add-row","fetch-rows","move-entire-case"],computed:{caseName(){return u.caseName},isMultiSelect(){return this.state.selectedSection?.type==="multiple"}},methods:{handleUpdateSectionSelection(e){this.$emit("update-section-selection",e)},handleUpdateStatus(e){this.$emit("update-status",e)},handleUpdateSectionStatus(e,t){this.$emit("update-section-status",e,t)},handleUserSelected(e,t){this.$emit("user-selected",e,t)},handleRemoveRows(e){this.$emit("remove-rows",e)},handleAddRow(e){this.$emit("add-row",e)},handleFetchRows(){this.$emit("fetch-rows")},handleMoveEntireCase(){this.$emit("move-entire-case")}},template:`
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
:user-locks="caseActions.block.data.userLocks"
:user-global-blocks="caseActions.block.data.userGlobalBlocks"
:user-blocks="caseActions.block.data.userBlocks"
@user-selected="handleUserSelected"
@remove-rows="handleRemoveRows" @add-row="handleAddRow"
@fetch-rows="handleFetchRows" />
<!-- Link special case -->
<link-action v-else-if="name === 'link' && displayed"
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
:status-action="caseActions.status" />
<management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
v-model:flags="caseActions.management.data.flags" />
`});var Ns=10,ui=250;function Bs(e){return{label:e.name,value:e.userid.toString(),customData:e}}function Gt(e,t){if(e.blockid!==void 0)t.block.block=!0;if(e.blocknocreate!==void 0)t.block.acb=e.blocknocreate;if(e.blockemail!==void 0)t.block.nem=e.blockemail;if(mw.util.isIPAddress(e.name)){if(e.blockanononly!==void 0)t.block.abao=e.blockanononly}else if(e.blockautoblocking!==void 0)t.block.abao=e.blockautoblocking;if(e.blockowntalk!==void 0)t.block.ntp=e.blockowntalk;if(e.blockexpiry)t.block.duration=e.blockexpiry}var Wt=f({props:{modelValue:{type:String,required:!0},label:{type:String,required:!1,default:""},allowEmpty:{type:Boolean,default:!0}},emits:["update:modelValue","user-selected"],data(){return{lookupStatus:"default",messages:{success:"Valid user",warning:"User not found",error:"Field must not be empty"},selection:null,userSuggestions:[],menuConfig:{visibleItemLimit:6,searchQuery:""},useLookup:p.useLookup,searchController:null}},computed:{username:{get(){return this.modelValue},set(e){this.$emit("update:modelValue",e)}}},beforeUnmount(){this.cancelPendingSearch()},methods:{cancelPendingSearch(){this.searchController?.abort(),this.searchController=null},startSearch(){this.cancelPendingSearch();let e=new AbortController;return this.searchController=e,e.signal},async onUpdateInputValue(e){let t=e.trim();this.menuConfig.searchQuery=t;let n=this.startSearch();if(!t){this.userSuggestions=[];return}if(await $t(ui,n),G(n))return;let o=await vn({from:t,limit:Ns,signal:n});if(G(n))return;this.userSuggestions=o.map(Bs)},onFocus(){if(this.userSuggestions.length===0)this.onLoadMore()},async onLoadMore(){if(!this.username)return;let e=this.startSearch(),t=await vn({from:this.username.trim(),limit:this.userSuggestions.length+Ns,signal:e});if(G(e)||t.length===0)return;this.userSuggestions=t.map(Bs)},async validateInstantly(){if(await this.$nextTick(),this.username.length===0){this.lookupStatus=this.allowEmpty?"default":"error";return}if(mw.util.isIPAddress(this.username)){this.lookupStatus="default";return}let e=this.userSuggestions.find((t)=>t.label===this.username||t.label?.trim()===this.username.trim())??null;if(e!==null)this.$emit("user-selected",e.customData),this.selection=e.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(e){if(e!==null){let t=this.userSuggestions.find((n)=>n.value===e)??null;if(t)this.$emit("user-selected",t.customData);this.lookupStatus="success"}}},template:`
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
@focus="onFocus"
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
`});async function jt(e){let{page:t,state:n}=e,o;if(t===u.pageName&&n)o=await ee(n);else o=await I(t,!1);return Qt(o)}function Qt(e){if(e==="")return null;let n=ne(e).find((a)=>ko.test(a.name));if(!n)return console.error("Missing archive notice"),null;let o=n.positional[0]??n.params["1"];if(!o)return console.error("Invalid archive notice: Username missing"),null;let s={deny:!1,crosswiki:!1,notalk:!1,moot:!1};for(let[a,i]of Object.entries(n.params)){if(a==="1")continue;if(i!==!0){console.warn("Malformed archivenotice parameter",a,"=",i);continue}if(a in s)s[a]=!0;else console.warn("Unrecognised archivenotice parameter",a,"=",i),new g({type:"warning",content:`Ignoring unrecognised archive notice parameter |${a}`}).showOnce()}return new J({username:o,...s})}var mi=30;async function Zt(e,t){let n=new g({type:"notice",content:"Loading all sections"}).show(),o=ee(e),s=t??e.sections,a=(await Promise.all(s.map(async(x)=>{let w=await z(x),S=Y.exec(w);if(!S?.[1])return null;return ke.test(S[1])?x:null}))).filter((x)=>x!==null),i=await o;if(n.update({type:"success",content:"All sections loaded"}),a.length===0)return new g({type:"warning",content:"Nothing to archive"}).show(),[];let r=await I(u.archiveName,!0),c=await hi(u.pageName,u.archiveName);if(c==="abort")return[];if(c==="moved")r="";let l=r!=="";if(l)r=r.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);else r=`__TOC__
{{SPI archive notice|1=${u.caseName}}}
{{SPIpriorcases}}
`;let d=l?await le({pageName:u.archiveName}):[],m=l&&d.length===0?null:Se(r,d);if(!m)return new g({type:"notice",content:"Failed to parse existing archive sections, aborting archival"}).show(),[];let h=[];for(let x of a){let w=await z(x);i=i.replace(w+`
`,"").replace(w,"");let S=w.search(se),P=(S===-1?w:w.slice(S)).replace(Y,"").trim();if(r.includes(P)){new g({type:"warning",content:`Section ${x.name} already exists in the archive`}).show();continue}let A=ht(x.name);if(!A)return new g({type:"error",content:`Failed to parse date from section header "${x.name}", aborting archival`}).show(),[];m.push({header:A,fullText:P}),h.push(x)}if(h.length===0)return new g({type:"warning",content:"Nothing to archive"}).show(),[];r=ie(r,m);let b=`Archiving ${B(h.length,"section")}`;if(await T({title:u.archiveName,newText:r,summary:`${b} from [[${u.pageName}]]`,watch:p.watch.archive,watchExpiry:p.expiry.archive})===null)return new g({type:"error",content:"Failed to update archive, not removing sections from case page"}).show(),[];return await u.edit({newText:i,summary:`${b} to [[${u.archiveName}]]`,watch:p.watch.case,watchExpiry:p.expiry.case,baseRevId:u.startingRevId}),h}async function $s(e){let t=await z(e);t=t.replace(Y,"").trim();let n=await I(u.archiveName,!0),o=new g({type:"error",content:""});if(n.includes(t)){o.type="warning",o.content="Looks like the page has been archived already",o.show();return}let s=n!=="";if(!s)n=`__TOC__
{{SPI archive notice|1=`+u.caseName+`}}
{{SPIpriorcases}}
`;else n=n.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi,`
{{SPIpriorcases}}`);let a=s?new g({type:"notice",content:"Loading archive sections"}).show():null,i=s?await le({pageName:u.archiveName}):[],r=s&&i.length===0?null:Se(n,i);if(r){a?.update({type:"success",content:"Archive sections loaded"});let l=ht(e.name);if(!l){new g({type:"error",content:`Failed to parse date from section header '${e.name}'`}).show();return}r.push({header:l,fullText:t})}else{a?.update({type:"error",content:"Failed to parse existing archive sections, aborting archival"});return}if(n=ie(n,r),await T({title:u.archiveName,newText:n,summary:`Archiving case section from [[${u.pageName}]]`,createonly:!1,watch:p.watch.archive,watchExpiry:p.expiry.archive})===null){o.content="Failed to update archive, not removing section from case page",o.show();return}await u.edit({newText:"",summary:`Archiving case section to [[${u.archiveName}]]`,watch:p.watch.case,watchExpiry:p.expiry.case,baseRevId:u.startingRevId,sectionId:e.id})}async function hi(e,t){let[n,o]=await Promise.all([wn(e),wn(t)]);if((n+o)/Be()<1)return"ok";let a=await eo(t);if(a===null)return"abort";return await _e({sourcePage:t,destPage:`${t}/${a}`,summary:"Moving archive to avoid exceeding post expand size limit",ignoreWarnings:!1,moveSubpages:!1}),"moved"}async function eo(e){let t=await Fe({from:`${e.replace(/^Wikipedia:/,"")}/`,namespace:4,limit:"max"});if(t===null)return new g({type:"error",content:"Failed to find the existing sub-archives, aborting move"}).show(),null;let n=new Set(t.map((o)=>o.title));for(let o=1;o<=mi;o++)if(!n.has(`${e}/${o}`))return o;return new g({type:"error",content:"Reached upper bound on possible archives, something probably went catastrophically wrong"}).show(),null}async function Ds(e,t){let n=Be(),o=0,s=e.length;while(o<s){let a=Math.floor((o+s)/2),i=ie(t,e.slice(a));if(await Ct(i)<n)s=a;else o=a+1}return o}function gi(e){let{sock:t,noticeType:n,sockmaster:o,cuBlock:s}=e,a,i=n==="sock";if(i&&o&&t.username===o)i=!1;if(i)a=`== Blocked as a sockpuppet ==
`;else a=`== Blocked for sockpuppetry ==
`;if(s)a+="{{checkuserblock-account|sig=~~~~";else a+="{{subst:uw-sockblock|sig=yes";if(u.source==="spi"&&u.valid)a+="|spi="+u.caseName;if($e(t.block.duration))a+="|indef=yes";else if(a+="|time="+t.block.duration,s)a+="|indef=no";if(t.block.ntp)a+="|notalk=yes";if(i&&o)a+="|master="+o;return a+="}}",a}function fi(e,t,n,o){let s="Abusing [[WP:SOCK|multiple accounts]]";if(u.source==="spi"&&u.valid)s+=`: Please see: [[${u.pageName}]]`;if(N()&&e.cuBlock){let a=t?"{{checkuserblock}}":"{{checkuserblock-account}}";if(e.cuBlockOnly)s=a;else s=a+": "+s}else if(n){if(s=`{{rangeblock|1=${s}`,!o)s+="|create=yes";s+="}}"}return s}async function qs(e){let{sock:t,blockOptions:n}=e,o=mw.util.isIPAddress(t.username,!0),s=o&&!mw.util.isIPAddress(t.username,!1),a=fi(n,o,s,t.block.acb);return await is({user:t.username,duration:t.block.duration,reason:a,reblock:n.override,anononly:o?t.block.abao:!1,accountcreation:t.block.acb,autoblock:o?!1:t.block.abao,notalkpage:t.block.ntp,noemail:t.block.nem,watchBlockedUser:p.watch.blocked,watchExpiry:p.expiry.blocked})}async function Os(e){let{sock:t,blockOptions:n,userTalkContent:o,talkNotices:s}=e;if(s.length===0)return;let a=t.block.tags.find((l)=>_(l))?.master,i=n.cuBlock&&N()&&p.useCheckuserblockAccount,r=`User talk:${t.username}`,c=n.blankTalk?"":o??"";for(let l of s)c+=`
`+gi({sock:t,noticeType:l,sockmaster:a,cuBlock:i});await T({title:r,newText:c,summary:je("Adding sockpuppetry block notice"),createonly:!1,watch:"nochange"})}var to="meta:Steward requests/Global",vi={block:/\n+(== Requests for global \(un\)lock and \(un\)hiding == *\n)/,lock:/\n+(== See also == *\n)/};function bi(e){return`[[${C(e)?"Special:Contributions":"Special:CentralAuth"}/${e}|${e}]]`}function no(e){let{targets:t,master:n,hideNames:o}=e;if(o||!n){let r=t.length>1?`${t.length} sockpuppets`:"a sockpuppet";return{heading:r,headingText:r}}let s=bi(n),a=t.filter((r)=>r!==n).length;if(a===0)return{heading:s,headingText:n};let i=a>1;if(a<t.length){if(i)return{heading:`${s} and ${a} socks`,headingText:`${n} and ${a} socks`};return{heading:`${s} and their sock`,headingText:`${n} and their sock`}}if(i)return{heading:`${a} ${s} socks`,headingText:`${a} ${n} socks`};return{heading:`${s} sock`,headingText:`${n} sock`}}function xi(e){let t=e?"Sockpuppets":"Sockpuppet";if(u.source==="spi"&&u.valid)return`${t} found in enwiki sockpuppet investigation, see [[${u.prefixedName}]].`;if(u.source==="spi")return`${t} found in enwiki sockpuppet investigation.`;return`${t} found in enwiki.`}function Fs(e,t=!1){let[n]=e;if(e.length===1&&n)return`* {{LockHide|1=${n}${t?"|hidename=1":""}}}`;let o="{{MultiLock";if(e.forEach((s,a)=>{o+=`|${a+1}=${s}`}),t)o+="|hidename=1";return`${o}}}`}function _s(e){let t=e.comment.trim().replace(/\.+$/,""),n=`
${xi(e.usePlural)}`;if(t!=="")n+=` ${t}.`;return`${n} ~~~~`}function ki(e){let{targets:t,master:n,hideNames:o}=e;if(t.length===0)return null;let{heading:s,headingText:a}=no({targets:t,master:n,hideNames:o}),i=`=== Global lock for ${s} ===`;return i+=`
{{status}}`,i+=`
${Fs(t,o)}`,i+=_s({usePlural:t.length>1,comment:e.comment}),{kind:"lock",targets:t,body:i,headingText:`Global lock for ${a}`}}function yi(e){let{targets:t,master:n}=e;if(t.length===0)return null;let o=t.filter((c)=>mw.util.isTemporaryUser(c)),s=t.filter((c)=>!mw.util.isTemporaryUser(c)),{heading:a,headingText:i}=no({targets:t,master:n,hideNames:!1}),r=`=== Global block for ${a} ===`;if(r+=`
{{status}}`,o.length>0)r+=`
${Fs(o)}`;for(let c of s)r+=`
* {{Luxotool|${c}}}`;return r+=_s({usePlural:t.length>1,comment:e.comment}),{kind:"block",targets:t,body:r,headingText:`Global block for ${i}`}}function wi(e){let[t]=e;if(e.length===1&&t)return`Global ${t.kind} request`;return"Global lock and block requests"}async function Gs(e){let{lockTargets:t,blockTargets:n,master:o,hideNames:s,comment:a}=e,i={lockedUsers:[],globalBlockedUsers:[]},r=ki({targets:t,master:o,hideNames:s,comment:a}),c=yi({targets:n,master:o,comment:a}),l=[c,r].filter((b)=>b!==null);if(l.length===0)return i;let d=wi(l),m=await I(to,!1);for(let b of l){let y=m.replace(vi[b.kind],(x,w)=>`

${b.body}

${w}`);if(y===m)return new g({type:"error",content:`${d} failed: could not find the global ${b.kind} section on ${to}.`}).show(),i;m=y}new g({type:"notice",content:`Filing ${d.toLowerCase()}`}).show();let h=await T({title:to,newText:m,summary:`${d} for ${no({targets:[...n,...t],master:o,hideNames:s}).heading}`,createonly:!1,watch:"nochange"});if(!h)return new g({type:"warning",content:`${d} failed.`}).show(),i;for(let b of l){let y=U(`meta:Special:Diff/${h}#${b.headingText}`,"filed");new g({type:"success",content:`Global ${b.kind} request ${y} successfully!`,isHtml:!0}).show()}return{lockedUsers:r?.targets??[],globalBlockedUsers:c?.targets??[]}}async function tt(e){let t=new Date,n=t.toLocaleString("en",{month:"long"})+" "+t.toLocaleString("en",{year:"numeric"}),o="==\\s*"+n+"\\s*==",s=new RegExp(o,"i"),a=/==.*?==/i,i=Pt(p.log.page),r=await I(i,!1);if(!r.match(s))if(p.log.reversed){let c=a.exec(r);if(c?.index)r=r.slice(0,c.index)+"== "+n+` ==
`+r.slice(c.index)}else r+=`
== `+n+" ==";if(p.log.reversed){let c=a.exec(r);if(c?.index)r=r.slice(0,c.index+c[0].length)+`
`+e+r.slice(c.index+c[0].length)}else r+=`
`+e;await T({title:i,newText:r,summary:"Logging spihelper edits",createonly:!1,watch:"nochange"})}function Si(e,t,n){let o=[];return n.types.forEach((s)=>{let a=e.find((r)=>r.type===s),i=t.find((r)=>r.type===s);if(a&&i){let r=i.expiry;if(ae(i.expiry)||ae(a.expiry))r="infinite";else if(i.expiry<a.expiry)r=a.expiry;let c=n.levels.indexOf(a.level),l=n.levels.indexOf(i.level),d;if(c===-1||l===-1){console.error("Invalid protection information provided from API");return}else if(c>l)d=a.level;else d=i.level;o.push({type:a.type,expiry:r,level:d})}else if(a)o.push(a);else if(i)o.push(i)}),o}function Hi(e,t,n){let o={level:""};if(e&&t){if(ae(e.protection_expiry)||ae(t.protection_expiry))o.expiry="infinite";else if(t.protection_expiry<e.protection_expiry)o.expiry=e.protection_expiry;else o.expiry=t.protection_expiry;let s=n.levels.indexOf(e.protection_level),a=n.levels.indexOf(t.protection_level);if(s===-1||a===-1)return console.error("Invalid protection information provided from API"),o;else if(s>a)o.level=e.protection_level;else if(s<=a)o.level=t.protection_level}else if(e)o={level:e.protection_level,expiry:e.protection_expiry};else if(t)o={level:t.protection_level,expiry:t.protection_expiry};return o}async function Ai(e,t,n){let o=await I(e.archiveName,!1),s=await I(t.archiveName,!1);if(!o||!s)return"skipped";new g({type:"notice",content:"Archives detected on both source and target cases, copying it manually"}).show();let a=await le({pageName:e.archiveName}),i=await le({pageName:t.archiveName}),r=a.length?Se(o,a):null,c=i.length?Se(s,i):null;if(!r||!c)return new g({type:"error",content:"Could not parse the archive. Please merge the archives manually"}).show(),"skipped";if(n)for(let m of r)m.fullText=we(`* {{clerknote}} originally filed under [[${e.pageName}]]. ~~~~`,m.fullText);let l=[...c,...r];s=ie(s,l);let d=Be();if(await Ct(s)>=d){new g({type:"notice",content:"Running binary search to find cutoff point for post-expand include size"}).show();let m=await Ds(l,s);if(m>=l.length)return new g({type:"error",content:"Archives are too large to merge without hitting post-expand size limit. Please merge manually"}).show(),"abort";let h=await eo(t.archiveName);if(h===null)return"abort";let b=`__TOC__
{{SPI archive notice|1=${t.caseName}}}
{{SPIpriorcases}}
`;await T({title:`${t.archiveName}/${h}`,newText:ie(b,l.slice(0,m)),summary:"Splitting archive due to post-expand size limit",createonly:!1,watch:p.watch.archive,watchExpiry:p.expiry.archive}),s=ie(s,l.slice(m))}return await T({title:t.archiveName,newText:s,summary:`Merging archives from [[${e.pageName}]], see page history for attribution`,createonly:!1,watch:p.watch.archive,watchExpiry:p.expiry.archive}),"copied"}async function Ws(e){let{target:t,suppress:n,addNote:o,archiveNotice:s}=e,a=u,i=new We(u.pageName.replace(u.caseName,()=>t)),r=await I(i.pageName,!1);if(r)if(O()){if(!confirm("Target page exists, do you want to histmerge the cases?")){new g({type:"warning",content:"Aborted merge"}).show();return}}else{new g({type:"warning",content:"Target page exists and you are unable to histmerge, aborting merge"}).show();return}if(i.pageName===a.pageName){new g({type:"error",content:"Target page is the current page, aborting merge"}).show();return}if(r){let c=await Ai(a,i,o);if(c==="abort")return;let[l,d]=await Promise.all([as(),ss([a.pageName,i.pageName])]),m=d.get(a.pageName),h=d.get(i.pageName),b=Si(m?.protection??[],h?.protection??[],l),y=Hi(m?.pendingChanges??null,h?.pendingChanges??null,l);if(await bn(i.pageName,"Deleting as part of case merge"),await _e({sourcePage:a.pageName,destPage:i.pageName,summary:`Merging case to [[${i.pageName}]]`,ignoreWarnings:!0,suppressRedirect:n}),await ns(i.pageName,"Restoring page history after merge"),c==="copied")if(n)await bn(a.archiveName,`Archives moved to [[${i.archiveName}]]`);else await T({title:a.archiveName,newText:`#REDIRECT [[${i.archiveName}]]`,summary:"Redirecting old archive to new archive",createonly:!1,watch:p.watch.archive,watchExpiry:p.expiry.archive});if(b.length!==0){if(await kn(i.pageName,b),!n)await kn(a.pageName,b)}if(y.level!==""){if(await yn(i.pageName,y),!n)await yn(a.pageName,y)}}else await _e({sourcePage:a.pageName,destPage:i.pageName,summary:`Moving case to [[${i.pageName}]]`,suppressRedirect:n&&Qe(),ignoreWarnings:!1});await zi({oldContext:a,newContext:i,oldNotice:s,deleteOld:n,preMergeText:r})}async function js(e,t){let n=new We(u.pageName.replace(u.caseName,()=>e)),o=await I(n.pageName,!1),s=await z(t);if(s=we(`* {{clerknote}} originally filed under [[${u.pageName}]]. ~~~~`,s),o==="")o=`<noinclude>__TOC__</noinclude>
{{SPI archive notice|`+e+`}}
{{SPIpriorcases}}`;o+=`
`+s,n.edit({newText:o,summary:`Moving case section from [[${u.pageName}]], see page history for attribution`,createonly:!1,watch:p.watch.case,watchExpiry:p.expiry.case}),await u.edit({newText:"",summary:`Moving case section to [[${n.pageName}]]`,createonly:!1,watch:p.watch.case,watchExpiry:p.expiry.case,baseRevId:u.startingRevId,sectionId:t.id})}function Mi(e,t){let n=Ln("sock list",e)[0];if(!n)return e.replace(rn,()=>`====Suspected sockpuppets====
* {{checkuser|1=`+t+`}} ({{clerknote}} original case name)
`);let o=n.text,s=Ut(o.slice(2,-2)),i=o.includes(`
`)?`
`:"",r=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),c=t.toLowerCase(),l=s.positional.findIndex((h)=>h.toLowerCase()===c),d=-1;for(let[h,b]of Object.entries(s.params))if(/^\d+$/.test(h)&&b.toString().toLowerCase()===c){d=parseInt(h);break}let m;if(l>=0||d>=0){let h=d>=0?d:l+1;if(`note${h}`in s.params)m=o;else{let y;if(d>=0){let x=new RegExp(`\\|\\s*${d}\\s*=\\s*${r}`,"i").exec(o);y=x?x[0]:void 0}else{let x=new RegExp(`\\|(?![^|}\\n]*=)\\s*${r}\\s*(?=[|}\\n])`,"i").exec(o);y=x?x[0]:void 0}m=y?o.replace(y,()=>y+`|note${h}=({{clerknote}} original case name)`):o}}else{let h=Object.keys(s.params).filter((A)=>/^\d+$/.test(A)).map(Number),y=Math.max(0,...h,s.positional.length)+1,x=`${i}|${y}=${t}|note${y}=({{clerknote}} original case name)`,w=Object.keys(s.params).filter((A)=>!/^\d+$/.test(A)&&!/^note\d+$/.test(A)),S=null;for(let A of w){let me=A.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),k=new RegExp(`(\\n?)\\|\\s*${me}\\s*=`).exec(o);if(k&&(S===null||k.index<S.index))S={index:k.index,match:k}}let P;if(S)P=S.match.index;else{let A=o.lastIndexOf("}}");P=A-(o[A-1]===`
`?1:0)}m=o.slice(0,P)+x+o.slice(P)}return e.slice(0,n.start)+m+e.slice(n.end)}function Ci(e,t){let n=new Set(e.split(`
`).map((s)=>s.trim())),o=t.replace(Ee,"").split(`
`).filter((s)=>s.trim()&&!n.has(s.trim()));return o.length?o.join(`
`)+`
`+e:e}function Ti(e,t){let n=Ut(e.slice(2,-2));if("remove_master"in n.params)return e;if("master"in n.params&&String(n.params.master).toLowerCase()!==t)return e;if(!(n.positional.some((i)=>i.toLowerCase()===t)||Object.entries(n.params).some(([i,r])=>/^\d+$/.test(i)&&r.toString().toLowerCase()===t)))return e;let s=e.lastIndexOf("}}"),a=s-(e[s-1]===`
`?1:0);return e.slice(0,a)+"|remove_master=yes"+e.slice(a)}function Pi(e,t){let n=t.toLowerCase(),o="",s=0;for(let i of Ln("sock list",e))o+=e.slice(s,i.start)+Ti(i.text,n),s=i.end;o+=e.slice(s);let a=new RegExp(rn.source+"[\\s\\S]*?(?=\\n====|$)","gi");return o.replace(a,(i)=>i.split(`
`).filter((r)=>{if(!r.trim().startsWith("*"))return!0;let c=ne(r)[0];if(c?.name!=="checkuser")return!0;let l=c.positional[0]??c.params["1"];return String(l??"").toLowerCase()!==n}).join(`
`))}function Ii(e,t){let n=new RegExp(se.source,"gm"),o=[...t.matchAll(n)].map((i)=>i.index),s=o[0];if(s===void 0)return t;let a=t.slice(0,s);for(let[i,r]of o.entries()){let c=o[i+1]??t.length;a+=we(e,t.slice(r,c))}return a}async function zi(e){let{oldContext:t,newContext:n,oldNotice:o,deleteOld:s,preMergeText:a}=e,i=new J({username:n.caseName}).generateWikitext(),r=a?Qt(a):null,c=new J({username:n.caseName,crosswiki:o.crosswiki||r?.crosswiki,deny:o.deny||r?.deny,notalk:o.notalk||r?.notalk,moot:o.moot||r?.moot}),l=[],d=[t.pageName],m=null;while(d.length!==0){if(m=d.pop(),!m||m===n.pageName)continue;l.push(m);let b=(await os(m)).filter((x)=>x.title!==n.pageName),y=await ce(b.map(({title:x})=>x));for(let x of b){let w=Qt(y.get(x.title)??"");if(!w)continue;if(w.username===m.replace(/Wikipedia:Sockpuppet investigations\//g,"")){if(await T({title:x.title,newText:i,summary:"Updating backlink following page move",watch:p.watch.case,watchExpiry:p.expiry.case}),!l.includes(x.title))d.push(x.title)}}}if(s){if(!Qe())await t.edit({newText:`{{db-g6|rationale=Case moved to [[${n.pageName}]], requesting deletion as non-admin SPI clerk}}`,summary:"Requesting [[WP:G6|G6]] deletion after case move",createonly:!1,watch:p.watch.archive,watchExpiry:p.expiry.archive})}else await t.edit({newText:i,summary:"Updating old case following page move",watch:p.watch.case,watchExpiry:p.expiry.case});let h=await I(n.pageName,!0);if(h=Mi(h,t.caseName),h=Ii(a?`* {{cnmerged}} from [[${t.pageName}]]. ~~~~`:`* {{clerknote}} originally filed under [[${t.pageName}]]. ~~~~`,h),a){let b=De(a),y=De(h),x=Ci(h.slice(0,y),a.slice(0,b)),w=a.slice(b),S=h.slice(y)+(w?`
`+w:"");h=x+S}h=h.replace(Ee,()=>c.generateWikitext()),h=Pi(h,n.caseName),await n.edit({newText:h,summary:"Updating new case following page move",watch:p.watch.case,watchExpiry:p.expiry.case})}function Vi(e){return T({title:e,newText:"{{sockpuppet category}}",summary:je("Creating sockpuppet category"),createonly:!0,watch:p.watch.categories,watchExpiry:p.expiry.categories})}function Ri(e,t){if(e.length!==t.length)return!1;let n=Array(t.length).fill(!1);for(let o of e){let s=!1;for(let a=0;a<t.length;a++){let i=t[a];if(!i)continue;if(!n[a]&&o.equals(i)){n[a]=!0,s=!0;break}}if(!s)return!1}return!0}function Li(e,t){let n=/\n?\{\{\s*sock\w*\b[\s\S]*?}}/gi,o=[...e.matchAll(n)];if(o.length===0)return t;let s=o[0];if(!s)return t;let a=s[0];return e=e.replace(a,()=>t),o.slice(1).forEach((i)=>{let r=i[0];e=e.replace(r,"")}),e}async function Qs(e){let{sock:t,pageText:n,blocked:o,globalUser:s,tagNonLocalAccounts:a}=e;if(C(t.username))return!1;if(!s)return new g({type:"warning",content:`The account ${t.username} does not exist and so has not been tagged`}).show(),!1;if(!a&&!s.existsLocally)return new g({type:"warning",content:`The account ${t.username} does not exist locally and so has not been tagged`}).show(),!1;t.block.tags.forEach((h)=>{h.locked=s.locked});let i=Et(n,t.username),r=t.block.tags.reduce((h,b)=>{let y=_(b)&&!b.master,x=h.some((w)=>w.equals(b));if(!y&&!x)h.push(b);return h},[]);if(Ri(i,r)){let h=U(`User:${t.username}`);return new g({type:"notice",content:`Tags are unmodified, skipping ${h}`,isHtml:!0}).show(),!1}let c=r.map((h)=>h.generateWikitext(o)).join(`
`),l=Li(n,c),d=i.length<r.length?"Adding":"Updating",m=r.length>1?B(r.length,"sockpuppetry tag"):"sockpuppetry tag";return T({title:`User:${t.username}`,newText:l,summary:je(`${d} ${m}`),createonly:!1,watch:p.watch.tagged,watchExpiry:p.expiry.tagged}).then((h)=>h!==null)}function Ui(e){let t=new Map;function n(o){if(!t.has(o))t.set(o,{confirmed:!1,suspected:!1});return t.get(o)??{confirmed:!1,suspected:!1}}for(let o of e)for(let s of o.block.tags){if(de(s))continue;let a=n(s.master);if(s.status==="proven"||s.status==="confirmed")a.confirmed=!0;if(s.status==="blocked")a.suspected=!0;if(s.altmaster){let i=n(s.altmaster);if(s.altmasterStatus==="proven")i.confirmed=!0;if(s.altmasterStatus==="suspected")i.suspected=!0}}return t}async function Zs(e){let t=new Map,n=Ui(e),o=[];for(let[i,{confirmed:r,suspected:c}]of n){if(!i)continue;if(r)o.push({master:i,title:`Category:Wikipedia sockpuppets of ${i}`});if(c)o.push({master:i,title:`Category:Suspected Wikipedia sockpuppets of ${i}`});t.set(i,!1)}if(o.length===0)return t;let s=await ce(o.map(({title:i})=>i)),a=o.filter(({title:i})=>!s.get(i));await Promise.all(a.map(({title:i})=>Vi(i)));for(let{master:i}of a)t.set(i,!0);return t}function Js(e){return{multiSection:e,status:"",closedCount:0,statusChangedCount:0,commentedCount:0,archiveNoticeUpdated:!1,blockedUsers:[],taggedUsers:[],lockedUsers:[],globalBlockedUsers:[]}}function Ei(e){let t=e.at(-1);if(!t)return"";let n=e.slice(0,-1);if(n.length===0)return t;return`${n.join(", ")}${n.length>1?",":""} and ${t}`}function oo(e,t){return e===1?t:B(e,t)}function Ni(e){let t=[{verb:()=>"blocking",users:e.blockedUsers},{verb:()=>"tagging",users:e.taggedUsers},{verb:(o)=>`requesting ${ut(o,"lock")} for`,solo:(o)=>`requesting ${oo(o,"lock")}`,users:e.lockedUsers},{verb:(o)=>`requesting ${ut(o,"global block")} for`,solo:(o)=>`requesting ${oo(o,"global block")}`,users:e.globalBlockedUsers}],n=new Map;for(let o of t.filter(({users:s})=>s.length>0)){let s=[...o.users].sort().join("|");n.set(s,[...n.get(s)??[],o])}return[...n.values()].flatMap((o)=>{let[s,...a]=o;if(!s)return[];let i=s.users.length;if(a.length===0&&s.solo)return s.solo(i);return`${Ei(o.map(({verb:c})=>c(i)))} ${oo(i,"account")}`})}function Ks(e){let t=[];if(e.archiveNoticeUpdated)t.push("updating archivenotice");if(e.commentedCount>0)t.push(e.multiSection?`commenting on ${B(e.commentedCount,"section")}`:"commenting");if(t.push(...Ni(e)),e.multiSection){if(e.statusChangedCount>0)t.push(`changing status on ${B(e.statusChangedCount,"section")}`);if(e.closedCount>0)t.push(`closing ${B(e.closedCount,"section")}`)}else if(e.status)t.push(e.status);if(t.length===0)t.push("saving page");return t}function Xs(e,t){let[n,...o]=e;if(!n)return"";let s=n.charAt(0).toUpperCase()+n.slice(1),a=o.length?`, ${o.join(", ")}`:"";return(t?`/* ${t} */ `:"")+s+a}async function ta(e){D("oneClickArchive"),new g({type:"notice",content:"Starting OCA"}).show();let t=await ee(e,{show:!0,purge:!0});if(!se.test(t)){new g({type:"notice",content:"Looks like the page has been archived already"}).show(),H("oneClickArchive","success");return}await Pe(e),await Zt(e);let n=`* [[${u.pageName}]]: used one-click archiver ~~~~~`;if(p.log.enabled)await tt(n);new g({type:"notice",content:"Refreshing data"}).show(),await u.refreshRevId(),await Pe(e),new g({type:"success",content:"Done!"}).show(),H("oneClickArchive","success")}async function na(e){let{actions:t,accounts:n,state:o}=e,s=Object.values(t).some((k)=>k.enabled),a=[...t.comment.data.bySection.values(),...t.status.data.bySection.values()].some((k)=>k.enabled);if(!s&&!a){new g({type:"warning",content:"No actions are enabled"}).show();return}if(!o.selectedSection){console.error("spiHelperPerformActions: Expected a selected section, got null"),new g({type:"error",content:"Expected a selected section, got null"}).show();return}if(!o.archiveNotice){console.error("spiHelperPerformActions: Could not find archive notice"),new g({type:"error",content:"Could not find archive notice"}).show();return}if(!t.block.data.master){console.error("spiHelperPerformActions: Could not get master"),new g({type:"error",content:"Could not get master"}).show();return}let i=o.selectedSection.type;new g({type:"notice",content:"Running actions"}).show();let r=Js(i==="multiple"),c=`* [[${u.pageName}]]`;if(o.selectedSection.type==="single")c+=` (section ${o.selectedSection.section.name})`;else if(o.selectedSection.type==="multiple")c+=" (multiple sections)";else c+=" (full case)";c+=" ~~~~~";let l=await(i==="single"?z(o.selectedSection.section):ee(o));if(!l){new g({type:"error",content:"Could not fetch text for the page"}).show();return}let d=l,m=[],h=[],b=[],y=Promise.resolve({lockedUsers:[],globalBlockedUsers:[]});if(t.block.enabled)({blockPromises:m,tagPromises:h,talkNoticePromises:b,globalRequestPromise:y}=await so({accounts:n,blockData:t.block.data}));let x=Promise.all([Promise.all(m),Promise.all(h),y]),w=Promise.all(b);if(!u.isArchive)if(i==="single"){if(Y.exec(l)===null)l=l.replace(/^(\s*===.*===[^\S\r\n]*)/,`$1
{{SPI case status|}}`),t.status.data.old="new";if(t.status.data.new==="nochange")t.status.data.new=t.status.data.old;if(t.status.enabled&&t.status.data.new!==t.status.data.old){let E=ea(t.status.data.new,l);if(l=E.targetText,E.newStatus!=="nochange")r.status=E.summaryItem,c+=`
** changed case status from ${t.status.data.old} to ${E.newStatus}`}if(t.comment.enabled&&t.comment.data.text.trim()!=="*")l=Ys(l,t.comment.data.text),r.commentedCount++,c+=`
** commented`}else{if(i==="multiple")for(let k of o.selectedSection.sections){let E=await z(k),F=E,te=[];if(Y.exec(F)===null)F=F.replace(/^(\s*===.*===[^\S\r\n]*)/,`$1
{{SPI case status|}}`);let v=t.status.data.bySection.get(k.id);if(v?.enabled&&v.new!=="nochange"&&v.new!==v.old){let L=ea(v.new,F);if(F=L.targetText,L.newStatus==="closed")r.closedCount++;else if(L.newStatus!=="nochange")r.statusChangedCount++;if(L.newStatus!=="nochange")te.push(`changed case status from ${v.old} to ${L.newStatus}`)}let V=t.comment.data.bySection.get(k.id);if(V?.enabled&&V.text.trim()!=="*")F=Ys(F,V.text),r.commentedCount++,te.push("commented");if(te.length>0){c+=`
** ${k.name}`;for(let L of te)c+=`
*** ${L}`}if(F!==E){let L=l.replace(E,()=>F);if(L===l)new g({type:"error",content:`Failed to update section ${k.name}`}).show();l=L}}if(t.management.enabled){let k=t.management.data.flags;o.archiveNotice=new J({username:o.archiveNotice.username||u.caseName,deny:k.has("deny"),crosswiki:k.has("crosswiki"),notalk:k.has("notalk"),moot:k.has("moot")});let E=o.archiveNotice.generateWikitext();l=l.replace(Ee,()=>E),r.archiveNoticeUpdated=!0,c+=`
** Updated archivenotice`}}let[S,P,A]=await x;r.blockedUsers=S.filter((k)=>k!==null),r.taggedUsers=P.filter((k)=>k!==null),r.lockedUsers=A.lockedUsers,r.globalBlockedUsers=A.globalBlockedUsers;let me=t.move.enabled||t.archive.enabled;if(!u.isArchive&&l!==d){let k=o.selectedSection.type==="single"?o.selectedSection.section.id:null,E=o.selectedSection.type==="single"?o.selectedSection.section.name:null,F=Xs(Ks(r),E),te=await u.edit({newText:l,summary:F,watch:p.watch.case,watchExpiry:p.expiry.case,baseRevId:u.startingRevId,sectionId:k});if(te===null){if(new g({type:"error",content:"Failed to save edit"}).show(),!me)await u.refreshRevId()}else{if(o.selectedSection.type==="single"){if(o.selectedSection.section._text=l,o._text)o._text=o._text.replace(d,()=>l)}else if(o._text=l,o.selectedSection.type==="multiple")for(let xe of o.selectedSection.sections)xe._text=null;u.startingRevId=te}}if(t.archive.enabled)switch(o.selectedSection.type){case"all":{c+=`
** Archived case`,await Zt(o);break}case"single":{c+=`
** Archived section`,await $s(o.selectedSection.section);break}case"multiple":{let k=await Zt(o,o.selectedSection.sections);if(k.length>0)c+=`
** Archived ${B(k.length,"section")}`;break}}else if(t.move.enabled){let k=R(t.move.data.target);if(k)switch(o.selectedSection.type){case"all":{c+=`
** moved/merged case to `+k,await Ws({target:k,suppress:t.move.data.suppress,addNote:t.move.data.addNote,archiveNotice:o.archiveNotice});break}case"single":{c+=`
** moved section to `+k,await js(k,o.selectedSection.section);break}}}if(await w,p.log.enabled)c+=mt({blockedUsers:S,taggedUsers:P,lockedUsers:A.lockedUsers,globalBlockedUsers:A.globalBlockedUsers}),await tt(c);if(me){if(t.move.enabled&&o.selectedSection.type==="all")await Pe(o);if(o.selectedSection.type==="single"||o.selectedSection.type==="multiple")o.selectedSection=null;await u.refreshRevId()}new g({type:"success",content:"Done!"}).show()}function Ys(e,t){if(!e.includes(`
----`))e=e.replace(at,""),e+=`
----<!-- All comments go ABOVE this line, please. -->`;if(t=dt(t.trimEnd()),K()||O())return we(t,e);else return e.replace(Ue,()=>`
`+t+`

====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====
`)}function ea(e,t){let n="";switch(e){case"reopen":e="open",n="reopening";break;case"open":n="marking request as open";break;case"CUrequest":n="adding checkuser request";break;case"admin":n="requesting admin action";break;case"clerk":n="requesting clerk action";break;case"selfendorse":e="endorse",n="adding self-endorsed checkuser request";break;case"checked":n="marking request as checked";break;case"inprogress":n="marking request in progress";break;case"decline":n="declining checkuser";break;case"cudecline":n="CU declining checkuser";break;case"endorse":n="endorsing for checkuser attention";break;case"cuendorse":n="CU endorsing for checkuser attention";break;case"moreinfo":case"cumoreinfo":n="requesting additional information";break;case"relist":n="relisting case for another check";break;case"hold":n="putting case on hold";break;case"cuhold":n="placing checkuser request on hold";break;case"closed":n="closing";break;case"new":case"nochange":break;default:console.error("Unexpected case status value",e)}let o=Y.exec(t);if(o?.[0])t=t.replace(o[0],`{{SPI case status|${e}}}`);return{newStatus:e,summaryItem:n,targetText:t}}async function so(e){let t=[],n=[],o=[],s=Promise.resolve({lockedUsers:[],globalBlockedUsers:[]}),{options:a,lockcomment:i,master:r,skipCUVerifyUsers:c}=e.blockData;for(let v of e.accounts)v.username=R(v.username);let l=e.accounts.filter((v)=>v.username!==""),d=[],m=Zs(l),h=O()&&!a.noBlock,b=l.some((v)=>v.block.tags.length>0),y=h&&!a.blankTalk&&(a.addMasterNotice||a.addSockNotice),{allUsernames:x,allUserPages:w,allUserTalkPages:S}=l.reduce((v,V)=>(v.allUsernames.add(V.username),v.allUserPages.push(`User:${V.username}`),v.allUserTalkPages.push(`User talk:${V.username}`),v),{allUsernames:new Set,allUserPages:[],allUserTalkPages:[]}),P=[...b?w:[],...y?S:[]],A=new g({type:"notice",content:"Fetching user blocks and tags"}).show(),[me,k,E,F]=await Promise.all([Ht(x),ce(P),At(new Set([...x].filter((v)=>!C(v)))),Mt(new Set([...x].filter((v)=>C(v)))),m]);A.update({type:"success",content:"Got previous blocks and tags"});let te=async(v,V)=>await Qs({sock:v,pageText:k.get(`User:${v.username}`)??"",blocked:V,globalUser:E.get(v.username),tagNonLocalAccounts:a.tagUnattached})?v.username:null;for(let v of l){if(v.block.lock)d.push(v);if(h&&v.block.block){let V=[];if(a.addMasterNotice&&(v.block.tags.some((W)=>de(W))||v.username===r))V.push("master");else if(a.addSockNotice)V.push("sock");let L=Math.max(500,l.length*100),Ve=(async()=>{let W=me.get(v.username);if(W!==void 0&&!a.override){let j=new g({type:"warning",content:`Block target ${v.username} is already blocked. `}),xo=v.block.tags.length>0;if(xo)j.content+="Proceeding with tagging";else j.content+='Check the "override existing blocks" box to re-block them';return j.show(),{blockedUsername:null,shouldTag:xo}}let Re=W?.reason;if(!N()&&!c.has(v.username)&&a.override&&Re&&it.exec(Re)){let j="User "+v.username+` is CheckUser-blocked, are you SURE you want to re-block them?
Current block message:
`+Re;if(!confirm(j))return{blockedUsername:null,shouldTag:!1}}if(!v.block.duration)return new g({type:"error",content:`Block target ${v.username} does not have an intended duration`}).show(),{blockedUsername:null,shouldTag:!1};await new Promise((j)=>setTimeout(j,Math.random()*L));let X=await qs({sock:v,blockOptions:a});return{blockedUsername:X?v.username:null,shouldTag:X}})();if(t.push(Ve.then(({blockedUsername:W})=>W)),V.length>0)o.push((async()=>{let{blockedUsername:W}=await Ve;if(W===null)return;await Os({sock:v,userTalkContent:k.get(`User talk:${v.username}`),blockOptions:a,talkNotices:V})})());if(v.block.tags.length>0)n.push((async()=>{let{shouldTag:W}=await Ve;if(!W)return null;return te(v,!0)})())}else if(v.block.tags.length>0)n.push(te(v,me.has(v.username)))}let xe=d.filter((v)=>!(C(v.username)?F.has(v.username):E.get(v.username)?.locked));if(xe.length>0){let v=a.lockHideNames,V=new Set(xe.flatMap((X)=>X.block.tags.filter((j)=>_(j))).map((X)=>X.master).filter((X)=>X!=="")),[L]=V,Ve=V.size===1&&L?L:r,[W,Re]=xe.reduce((X,j)=>(X[C(j.username)?0:1].push(j.username),X),[[],[]]);s=Gs({lockTargets:Re,blockTargets:W,hideNames:v,master:Ve,comment:i})}return{blockPromises:t,tagPromises:n,talkNoticePromises:o,globalRequestPromise:s}}function sa(e){let t=$(`a[href$="section=${e}"]`).first();return t.length>0?t:null}function Bi(e){let t=e.parentsUntil(":has(hr)").last().nextUntil("hr");return t.length>0?t:null}function aa(e){let t=e.closest(".mw-heading");return t.length>0?t.get(0)??null:null}function ia(e){let t=sa(e);return t?aa(t):null}function ra(e){let t=ia(e);if(t)t.scrollIntoView({behavior:"smooth",block:"start"})}function ao(){return document.querySelector("#mw-content-text .mw-parser-output")}function ca(e,t){let n=sa(e),o=n&&aa(n);if(!t||!n||!o)return null;let a=Bi(n)?.last().get(0)??o,i=t.getBoundingClientRect(),r=o.getBoundingClientRect(),c=a.getBoundingClientRect(),l=Math.min(r.top,c.top)-i.top+t.scrollTop,d=Math.max(r.bottom,c.bottom)-i.top+t.scrollTop;return{top:l,height:Math.max(1,d-l)}}function la(){let e=ao();if(!e)return null;let t=document.createElement("div");return t.style.display="none",t.className="spiHelper-section-overlay",e.appendChild(t),t}function pa(e,t,n,o){e.style.top=`${Math.max(0,n.top)}px`,e.style.height=`${n.height+8}px`,e.style.display="block",e.dataset.sectionId=String(t),e.classList.toggle("spiHelper-section-overlay--preview",o==="preview"),e.classList.toggle("spiHelper-section-overlay--selected",o==="selected")}function $i(e,t,n){let o=ca(t,ao());if(!e||!o)return;pa(e,t,o,n)}function da(e,t){let n=/v-\d+-(\d+)/.exec(e.id);if(n===null||n.length<2)return null;let o=Number(n[1]),s=t[o-1];if(!s||s.value==="all")return null;return typeof s.value==="number"?s.value:null}var Jt=null,Kt=new Map;function Di(){return Jt??=la(),Jt}function ua(e){let t=Kt.get(e);if(!t){let n=la();if(!n)return null;t=n,Kt.set(e,t)}return t}function ma(e,t){let n=t==="preview"?Di():ua(e);$i(n,e,t)}function ha(){if(Jt)Jt.style.display="none"}function io(e){let t=new Set(e);for(let[a,i]of Kt)if(!t.has(a))i.remove(),Kt.delete(a);let n=new Map;for(let a of e){let i=ua(a);if(i)n.set(a,i)}let o=ao(),s=new Map;for(let a of n.keys()){let i=ca(a,o);if(i)s.set(a,i)}for(let[a,i]of n){let r=s.get(a);if(r)pa(i,a,r,"selected")}}function ga(){io([])}var oa="open in spiHelper";function fa(e,t){let n=[];for(let o of e){let s=ia(o);if(!s)continue;let a=s.querySelector(".mw-editsection");if(a){let i=a.querySelector(".mw-editsection-bracket:last-child"),r=document.createElement("span");r.className="mw-editsection-divider",r.textContent=" | ";let c=document.createElement("a");if(c.href="#",c.className="spiHelper-section-open",c.textContent=oa,c.addEventListener("click",(l)=>{l.preventDefault(),t(o)}),i)a.insertBefore(r,i),a.insertBefore(c,i);else a.append(r,c);n.push(r,c)}else{let i=document.createElement("span");i.className="mw-editsection-like spiHelper-section-open";let r=document.createElement("span");r.className="mw-editsection-bracket",r.textContent="[";let c=document.createElement("a");c.href="#",c.textContent=oa,c.addEventListener("click",(d)=>{d.preventDefault(),t(o)});let l=document.createElement("span");l.className="mw-editsection-bracket",l.textContent="]",i.append(r,c,l),s.appendChild(i),n.push(i)}}return()=>{for(let o of n)o.remove()}}var ro=f({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0}},data(){let e=Dn(),t=Object.keys(e);return{open:!1,handlers:{openHandler:null,beforeUnloadHandler:null},actionsRunning:!1,displayedForms:new Set(["sections"]),unpinned:!p.interface.pinned,buttonLayout:p.interface.buttonLayout,actionButtons:e,actionButtonKeys:t,sectionAccountNames:new Set,sectionSelectionController:null,caseActions:qn(),accounts:[],messages:q,sectionClickCleanup:null,multiSelectMode:!1,icons:{cdxIconPushPin:bt,cdxIconCollapse:No,cdxIconExpand:Do,cdxIconFeedback:Me}}},computed:{allDisabled(){for(let[e,t]of Object.entries(this.caseActions)){if(e==="sections")continue;if(t.enabled)return!1}if(this.state.selectedSection?.type!=="multiple")return!0;return[...this.caseActions.comment.data.bySection.values(),...this.caseActions.status.data.bySection.values()].every((e)=>!e.enabled)},selectedSection(){return this.state.selectedSection},selectedSections(){return ms(this.state.selectedSection)},archiveNotice(){return this.state.archiveNotice},stateSections(){return this.state.sections},mountPoint(){return this.$el.parentElement}},watch:{unpinned(e){if(!this.mountPoint){console.error("TopViewComponent unpinned: Could not find mountPoint");return}if(e)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");p.interface.pinned=!e},async open(e){if(e)await this.ensureArchiveNotice(),this.syncSelectedSectionOverlay();else this.syncSelectedSectionOverlay(),pe()},async stateSections(e){if(this.setupSectionButtons(),this.caseActions.sections.data.section===null){let t=e[0];if(t)this.caseActions.sections.data.section=t.id,await this.ensureArchiveNotice(),await this.loadNewSection(t);else await this.onUpdateSectionSelection("all")}},archiveNotice(e){this.caseActions.management.data.flags=On(e)},"caseActions.sections.data.section"(e,t){if(e===t)return;for(let[n,o]of Object.entries(this.caseActions)){let s=n;if(s==="sections")continue;let a=p.defaultActions.includes(s),i=fe({name:s,selection:e,selectionType:this.actionButtons[s].selectionType}),r=Array.isArray(e)&&Rs.has(s);if(s!=="link")o.enabled=a&&i&&!r;if(a&&i)this.displayedForms.add(s)}}},mounted(){if(!this.mountPoint){console.error("TopViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.handlers.beforeUnloadHandler=(e)=>{let t=ft("mainActions");if(!this.allDisabled&&t!=="success")e.preventDefault()},this.handlers.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"top"}),this.handlers.beforeUnloadHandler)window.addEventListener("beforeunload",this.handlers.beforeUnloadHandler)}else if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler)},this.openButton.addEventListener("click",this.handlers.openHandler)},beforeUnmount(){if(this.handlers.openHandler)this.openButton.removeEventListener("click",this.handlers.openHandler);if(this.handlers.beforeUnloadHandler)window.removeEventListener("beforeunload",this.handlers.beforeUnloadHandler);this.sectionClickCleanup?.(),this.sectionClickCleanup=null},methods:{dismissMessage:St,setupSectionButtons(){this.sectionClickCleanup?.(),this.sectionClickCleanup=null;let e=this.state.sections.map((t)=>t.id);if(e.length===0)return;this.sectionClickCleanup=fa(e,(t)=>{if(this.multiSelectMode)this.toggleMultiSelectSection(t);else this.onUpdateSectionSelection(t);if(!this.open)this.open=!0})},syncSelectedSectionOverlay(){if(!p.highlightSection||!this.open){ga();return}io(this.selectedSections.map((e)=>e.id))},toggleButtonLayout(){this.buttonLayout=!this.buttonLayout,p.interface.buttonLayout=this.buttonLayout},onActionClick(e,t){let n=t;if(e.ctrlKey||e.metaKey)if(this.displayedForms.has(n))this.displayedForms.delete(n);else this.displayedForms.add(n);else this.displayedForms=new Set([n])},onAccordionToggle(e){let t=e;if(this.displayedForms.has(t))this.displayedForms.delete(t);else this.displayedForms.add(t)},isVisible(e){return this.displayedForms.has(e)},isActionEnabled(e){if(this.state.selectedSection?.type==="multiple"){if(e==="comment")return[...this.caseActions.comment.data.bySection.values()].some((t)=>t.enabled);if(e==="status")return[...this.caseActions.status.data.bySection.values()].some((t)=>t.enabled)}return this.caseActions[e].enabled},async onUpdateSectionSelection(e){if(e===null)return;if(this.caseActions.sections.data.section=e,(this.state.selectedSection?.type??null)!==(e==="all"?"all":"single"))this.displayedForms=new Set(Array.from(this.displayedForms).filter((s)=>Vs.has(s)));if(e==="all"){this.state.selectedSection={type:"all"},this.loadSectionAccounts(this.state.selectedSection,this.startSelectionLoad()),this.syncSelectedSectionOverlay();return}let o=this.state.sections.find((s)=>s.id===e);if(o===void 0){console.error("onUpdateSectionSelection: Could not find target section with ID",e);return}await this.loadNewSection(o)},async loadNewSection(e){let t={type:"single",section:e},n=this.startSelectionLoad();this.state.selectedSection=t;let o=await z(e);if(G(n))return;let s=Y.exec(o),a=jn(s?.[1]??"");if(this.caseActions.status.data.old=a,this.caseActions.status.data.new=a,a==="closed"&&p.tickArchiveWhenCaseClosed)this.caseActions.archive.enabled=!0;this.syncSelectedSectionOverlay(),this.loadSectionAccounts(t,n)},async toggleMultiSelectMode(e){if(this.multiSelectMode=e,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"multi",enabled:e}),!e){if(this.state.selectedSection?.type==="multiple"){let[t]=this.selectedSections;if(t)await this.applySectionSelection([t])}return}if(this.state.selectedSection?.type!=="multiple")await this.applySectionSelection(this.selectedSections)},async toggleMultiSelectSection(e){let t=this.selectedSections;if(t.some((s)=>s.id===e)){await this.applySectionSelection(t.filter((s)=>s.id!==e));return}let o=this.state.sections.find((s)=>s.id===e);if(!o){console.error("toggleMultiSelectSection: Could not find target section with ID",e);return}await this.applySectionSelection([...t,o])},async handleUpdateMultiSelectSections(e){let t=new Set(e),n=this.state.sections.filter((o)=>t.has(o.id));await this.applySectionSelection(n)},async applySectionSelection(e){if(this.pruneBySectionData(new Set(e.map((o)=>o.id))),e.length===0){this.caseActions.sections.data.section=null,this.state.selectedSection=null,this.syncSelectedSectionOverlay();return}if(e.length===1&&!this.multiSelectMode){let[o]=e;if(!o)return;this.caseActions.sections.data.section=o.id,await this.loadNewSection(o);return}let t=this.startSelectionLoad();this.caseActions.sections.data.section=e.map((o)=>o.id);let n={type:"multiple",sections:e};if(this.state.selectedSection=n,await Promise.all(e.map((o)=>this.ensureBySectionEntry(o))),G(t))return;this.syncSelectedSectionOverlay(),this.loadSectionAccounts(n,t)},async ensureBySectionEntry(e){if(!this.caseActions.comment.data.bySection.has(e.id))this.caseActions.comment.data.bySection.set(e.id,{text:"* ",enabled:p.defaultActions.includes("comment")});if(!this.caseActions.status.data.bySection.has(e.id)){let t=await z(e),n=Y.exec(t),o=jn(n?.[1]??"");this.caseActions.status.data.bySection.set(e.id,{old:o,new:o,enabled:p.defaultActions.includes("status")})}},pruneBySectionData(e){for(let t of this.caseActions.comment.data.bySection.keys())if(!e.has(t))this.caseActions.comment.data.bySection.delete(t);for(let t of this.caseActions.status.data.bySection.keys())if(!e.has(t))this.caseActions.status.data.bySection.delete(t)},startSelectionLoad(){this.sectionSelectionController?.abort();let e=new AbortController;return this.sectionSelectionController=e,e.signal},async loadSectionAccounts(e,t){this.accounts=this.accounts.filter((i)=>!this.sectionAccountNames.has(i.username));let n=await(async()=>{if(e.type==="all")return ee(this.state);if(e.type==="multiple")return(await Promise.all(e.sections.map((r)=>z(r)))).join(`
`);return z(e.section)})();if(G(t))return;let[o,s]=ze({text:n,fullSearch:!0,state:this.state}),a=await be({likelySocks:o,possibleSocks:s,blockData:this.caseActions.block.data,state:this.state});if(G(t))return;this.sectionAccountNames=new Set(this.massAddUserRows(a).map((i)=>i.username))},onUpdateNewStatus(e){this.caseActions.comment.data.text=Ot(this.caseActions.comment.data.text,e)},onUpdateSectionStatus(e,t){let n=this.caseActions.comment.data.bySection.get(e);if(n)n.text=Ot(n.text,t)},async onSubmitActions(){if(He("mainActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"top",mode:this.state.selectedSection?.type??"none"}),D("mainActions"),this.actionsRunning=!0;try{await na({actions:this.caseActions,accounts:this.accounts,state:this.state}),H("mainActions","success")}catch(e){let t=e instanceof Error?e.message:String(e);new g({type:"error",content:`Actions stopped: ${t}. Reload and try again. If the issue persists, file a bug report`}).show(),H("mainActions","failed")}finally{this.caseActions.block.data.fetchedUsers.clear(),this.actionsRunning=!1}},async handleFetchRows(){let[e,t]=ze({text:this.caseActions.comment.data.text,fullSearch:!1,state:this.state}),n=new Set(e.map((a)=>a.username)),o=[...e,...t].map((a)=>Ze({userRow:a,defaultBlock:n.has(a.username)})),s=new Set(this.massAddUserRows(o).map((a)=>a.username));await ve(s,this.caseActions.block.data.fetchedUsers),et({accounts:this.accounts,usernames:s,blockData:this.caseActions.block.data,state:this.state})},handleUserSelected(e,t){let n=this.accounts.find((o)=>o.id===t);if(!n)return;if(e.blockid!==void 0&&!this.caseActions.block.data.userBlocks.has(n.username)){let o=mw.util.isIPAddress(e.name)?e.blockanononly:e.blockautoblocking;this.caseActions.block.data.userBlocks.set(n.username,{username:n.username,duration:e.blockexpiry??"",abao:o??!1,acb:e.blocknocreate??!1,ntp:e.blockowntalk??!1,nem:e.blockemail??!1,reason:""})}Gt(e,n)},handleAddRow(e){e??=ge(this.state.archiveNotice),this.accounts.push(e)},handleRemoveRows(e){this.accounts=this.accounts.filter((t)=>!e.includes(t.id))},massAddUserRows(e){let t=this.accounts.at(-1)?.username==="",n=new Set(this.accounts.map((s)=>s.username)),o=e.filter((s)=>!n.has(s.username));if(t)o.forEach((s)=>{this.accounts.splice(this.accounts.length-1,0,s)});else this.accounts=this.accounts.concat(o);return o},async ensureArchiveNotice(){if(this.state.archiveNotice)return;let e=await jt({page:u.casePageName,state:this.state});if(e===null)this.state.archiveNotice=new J({username:u.caseName}),new g({type:"warning",content:"Can't find archivenotice template! Automatically adding the archive notice to the page"}).show(),mw.notify("Can't find archivenotice template! If this is incorrect, please contact DatGuy",{type:"warn"}),console.warn("archivenoticeResult is null");else this.state.archiveNotice=e},launchFeedback(){this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`SPI form v${Q}-${Z}`})},async handleMoveEntireCase(){await this.onUpdateSectionSelection("all"),this.caseActions.move.enabled=!0}},template:`
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
<div class="spiHelper-buttonRow">
<action-button
v-for="[name, button] of Object.entries(actionButtons)"
:key="name"
:name="name"
:label="button.label"
:selection-type="button.selectionType"
:selection="caseActions.sections.data.section"
:displayedForms="displayedForms"
:actionEnabled="isActionEnabled(name)"
@click="onActionClick($event, name)"
/>
</div>
<div class="spiHelper-contentRow">
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
:displayed="isVisible(name)"
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
:actionEnabled="isActionEnabled(name)"
@action-toggled="onAccordionToggle(name)"
>
<action-content
:name="name"
:case-actions="caseActions"
:accounts="accounts"
:state="state"
:multi-select-mode="multiSelectMode"
:selected-sections="selectedSections"
:displayed="isVisible(name)"
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
<div class="spiHelper-messageRow">
<cdx-message v-for="message in messages" :key="message.id" :type="message.type" :fade-in="true"
:allow-user-dismiss="true" @user-dismissed="dismissMessage(message.id)">
<span v-if="message.isHtml" v-html="message.content" />
<span v-else>
{{ message.content }}
</span>
</cdx-message>
</div>
</div>
`});var co=f({props:{enabled:{type:Boolean,required:!0},selection:{type:[Object,null],required:!0},statusAction:{type:Object,required:!0}},emits:["update:enabled"],computed:{isMultiSelectMode(){return this.selection?.type==="multiple"},skippedSections(){if(this.selection?.type!=="multiple")return[];return this.selection.sections.map((e)=>({name:e.name,status:this.effectiveSectionStatus(e.id)})).filter((e)=>e.status!=="closed")},badStatus(){if(!this.selection||this.selection.type==="all")return!1;if(this.selection.type==="multiple")return this.skippedSections.length===this.selection.sections.length;return this.status!=="closed"},status(){let{enabled:e,data:t}=this.statusAction;return Ie({enabled:e,old:t.old,new:t.new})}},methods:{effectiveSectionStatus(e){let t=this.statusAction.data.bySection.get(e);return t?Ie(t):""}},template:`
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
`});var qi=["block","duration","acb","abao","ntp","nem","lock"],Oi=["block","acb","abao","ntp","nem","lock"],Xt=f({props:{accounts:{type:Array,required:!0},blockOptions:{type:Object,required:!0},userLocks:{type:Map,required:!0},userGlobalBlocks:{type:Map,required:!0},userBlocks:{type:Map,required:!0},defaultMaster:{type:String,required:!0},fetchType:{type:String,required:!0},enabled:{type:Boolean,required:!0}},emits:["update:enabled","update:modelValue","update:blockOptions","removeRows","addRow","userSelected","usernameChanged","fetchRows"],data(){let e=[{id:"username",label:"Username"},{id:"tag",label:"Tag"},{id:"lock",label:"Request Global"}],t=O(),n=N(),o=K();if(t)e.splice(1,0,...[{id:"block",label:"Block"},{id:"duration",label:"Duration"},{id:"acb",label:"ACB"},{id:"abao",label:"AB/AO"},{id:"ntp",label:"NTP"},{id:"nem",label:"NEM"}]);return{columns:e,selectedRows:[],topButtonActions:{copied:!1,fetched:!1},isAdmin:t,isCheckuser:n,isClerk:o,popovers:{all:{open:!1},row:{anchor:null,open:!1,tagIndex:0,rowId:null,sourceTag:null},clipboardTag:null},cdxIconCopy:vt,cdxIconDownload:Bo,cdxIconTrash:re,cdxIconUserAvatar:kt,cdxIconUserAvatarOutline:yt,spiHelperPaginationSizeOptions:lt}},computed:{paginate(){return this.accounts.length>ct},selectAll(){return this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0},allowLockOption(){return this.accounts.some((e)=>e.block.lock&&!C(e.username)&&!this.userLocks.get(e.username))},targetRows(){if(this.selectedRows.length===0)return this.accounts;let e=new Set(this.selectedRows);return this.accounts.filter((t)=>e.has(t.id))},disabledCells(){let e=new Map;for(let t of this.accounts){let n={};for(let o of qi)n[o]=Ke(t,o,this.blockOptions,this.userBlocks,this.userLocks,this.userGlobalBlocks,this.targetRows);e.set(t.id,n)}return e},setAllState(){let e={};for(let t of Oi){let n=0,o=0;for(let s of this.targetRows){if(this.disabledCells.get(s.id)?.[t])continue;if(n++,s.block[t])o++}e[t]={value:n>0&&o===n,indeterminate:o>0&&o<n}}return e}},methods:{isNonRegisteredAccount:C,isSockmasterTag:de,isInputDisabled(e,t){if(e===null)return Ke(null,t,this.blockOptions,this.userBlocks,this.userLocks,this.userGlobalBlocks,this.targetRows);return this.disabledCells.get(e.id)?.[t]??!1},async copySocks(){if(this.selectedRows.length===0)return;let e="{{sock list",t=0;for(let n of this.targetRows)e+=`|${++t}=${n.username}`;e+="}}",await navigator.clipboard.writeText(e),this.topButtonActions.copied=!0},onMessageDismissed(e){setTimeout(()=>{this.topButtonActions[e]=!1},200)},removeSocks(){this.$emit("removeRows",[...this.selectedRows]),this.selectedRows=[]},addDefaultRow(){this.$emit("addRow")},handleSelectAll(e){if(e)this.selectedRows=this.accounts.map((t)=>t.id);else this.selectedRows=[]},handleUserSelected(e,t){this.$emit("userSelected",e,t.id)},setAllBlockFields(e,t){let n=this.targetRows.filter((o)=>!this.isInputDisabled(o,e));for(let o of n)o.block[e]=t},setAllTags(e){for(let t of this.targetRows){if(C(t.username))continue;t.block.tags=[e.clone()]}},fetchSocks(){this.topButtonActions.fetched=!0,this.$emit("fetchRows")},isSameTagTarget(e,t,n){let{row:o}=this.popovers;if(o.rowId!==n)return!1;return e===null?o.sourceTag===null&&o.tagIndex===t:o.sourceTag===e},showTagPopover(e,t,n,o){let s=this.isSameTagTarget(e,t,n);if(this.popovers.row.tagIndex=t,this.popovers.row.rowId=n,this.popovers.row.anchor=o.currentTarget,s)this.popovers.row.open=!this.popovers.row.open;else this.popovers.row.sourceTag=e,this.popovers.row.open=!0,this.$refs.rowTagPopover.setTag(e)},handleTagUpdate(e){let t=this.accounts.find((n)=>n.id===this.popovers.row.rowId);if(!t){console.error("Could not find target row for tag update",this.popovers.row.rowId);return}t.block.tags.splice(this.popovers.row.tagIndex,1,e.clone())},handleTagDelete(){let e=this.accounts.find((t)=>t.id===this.popovers.row.rowId);if(!e){console.error("Could not find target row for tag delete",this.popovers.row.rowId);return}e.block.tags.splice(this.popovers.row.tagIndex,1)},handleTagAdd(e,t){let n=this.accounts.find((a)=>a.id===e);if(!n){console.error("Could not find target row for tag add",e);return}let o=t?t.clone():new oe({master:this.defaultMaster,status:"blocked"});n.block.tags.push(o),this.popovers.row.tagIndex=n.block.tags.length-1,this.popovers.row.sourceTag=o,this.$refs.rowTagPopover.setTag(o)},getRowTagsWithDefault(e){if(e.length===0)return[null];else return e},handleTagAddAll(){for(let e of this.targetRows){if(C(e.username))continue;e.block.tags.push(new oe({master:this.defaultMaster,status:"blocked"}))}},handleTagDeleteAll(){for(let e of this.targetRows)e.block.tags.length=0},validateTag(e){return!(_(e)&&!e.master)},tagStatusDisplay(e){return de(e)?Oe[e.status]:wt[e.status]},tagLabel(e){if(e===null)return"None";return de(e)?Oe[e.status].label:e.master}},template:`
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
:paginate="paginate" :pagination-size-options="spiHelperPaginationSizeOptions"
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
:model-value="setAllState.block.value" :indeterminate="setAllState.block.indeterminate"
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
:model-value="setAllState.acb.value" :indeterminate="setAllState.acb.indeterminate"
@update:model-value="setAllBlockFields('acb', $event)"
:disabled="isInputDisabled(null, 'acb')">
Set all account creation blocked
</cdx-checkbox>
</th>
<th scope="col" v-if="isAdmin">
<cdx-checkbox :hide-label="true"
:model-value="setAllState.abao.value" :indeterminate="setAllState.abao.indeterminate"
@update:model-value="setAllBlockFields('abao', $event)"
:disabled="isInputDisabled(null, 'abao')">
Set all autoblock/anon-only
</cdx-checkbox>
</th>
<th scope="col" v-if="isAdmin">
<cdx-checkbox :hide-label="true"
:model-value="setAllState.ntp.value" :indeterminate="setAllState.ntp.indeterminate"
@update:model-value="setAllBlockFields('ntp', $event)"
:disabled="isInputDisabled(null, 'ntp')">
Set all no talk page
</cdx-checkbox>
</th>
<th scope="col" v-if="isAdmin">
<cdx-checkbox :hide-label="true"
:model-value="setAllState.nem.value" :indeterminate="setAllState.nem.indeterminate"
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

<th scope="col"
v-tooltip="'Locks for accounts, global blocks for temporary accounts and IPs'">
<cdx-checkbox :hide-label="true"
:model-value="setAllState.lock.value" :indeterminate="setAllState.lock.indeterminate"
@update:model-value="setAllBlockFields('lock', $event)"
:disabled="isInputDisabled(null, 'lock')">
Set all global requests
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
<cdx-icon v-if="tag !== null" class="userTag__kind"
:icon="isSockmasterTag(tag) ? cdxIconUserAvatar : cdxIconUserAvatarOutline"
:title="isSockmasterTag(tag) ? 'Master' : 'Sockpuppet'" />
<span class="userTag__label">{{ tagLabel(tag) }}</span>
<cdx-icon v-if="tag !== null" class="userTag__status"
:icon="tagStatusDisplay(tag).icon"
:title="tagStatusDisplay(tag).label" />
</cdx-button>
</template>

<template #item-lock="{ item, row }">
<cdx-checkbox :hide-label="true" v-model="row.block.lock"
:disabled="isInputDisabled(row, 'lock')">
Request {{ isNonRegisteredAccount(row.username) ? 'global block' : 'lock' }}
</cdx-checkbox>
</template>

<template #footer>
<cdx-button @click="addDefaultRow">Add Row</cdx-button>
</template>
</cdx-table>
<tag-popover ref="rowTagPopover" :anchor="popovers.row.anchor" v-model:open="popovers.row.open"
:default-master="defaultMaster" :clipboard-tag="popovers.clipboardTag"
@saveTag="handleTagUpdate" @addTag="handleTagAdd(popovers.row.rowId, $event)"
@deleteTag="handleTagDelete" @copyTag="popovers.clipboardTag = $event" />
</action-container>
`});var lo=f({props:{enabled:{type:Boolean,required:!0},text:{type:String,required:!0},selectedSection:{type:[Object,null],required:!0}},emits:["update:enabled","update:text"],data(){let e=K(),t=O(),n=N(),o=[{value:"takenote",label:"Note"}],s=[...Ao],a=[...Ho];if(n)o.unshift({value:"cunote",label:"CheckUser note"});if(t)o.unshift({value:"adminnote",label:"Administrator note"});if(e)o.unshift({value:"clerknote",label:"Clerk note"});let i=Nn(p.custom.commentTemplates);return{isClerk:e,isAdmin:t,isCheckuser:n,noteTemplates:o,clerkTemplates:s,cuTemplates:a,customTemplates:i,loadingPreview:!1,htmlPreview:"",fullPreview:p.interface.fullPreview,cdxIconReload:xt}},computed:{commentBox(){return this.$refs.commentBox}},methods:{onEnable(e){if(this.$emit("update:enabled",e),e)this.$nextTick(()=>{this.commentBox.focus()})},onTextUpdate(e){this.$emit("update:text",e)},async updatePreview(){this.loadingPreview=!0;let e=dt(this.text);try{if(this.fullPreview&&this.selectedSection?.type==="single"){let t=await z(this.selectedSection.section),n,o;if(this.isClerk||this.isAdmin)n=Ue.exec(t)?.index,o=st.exec(t)?.index;else n=/\s*====\s*<big>Comments by other users<\/big>\s*====\s*/i.exec(t)?.index,o=Ue.exec(t)?.index;let s=t.slice(n??0,o??0).trim()+`
`+e;this.htmlPreview=await xn(u.pageName,s)}else this.htmlPreview=await xn(u.pageName,e)}finally{this.loadingPreview=!1}},insertNote(e){let t=this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i,"* {{"+e+"}} ");this.$emit("update:text",t),this.commentBox.focus()},insertText(e){e=`{{${e.replace(/^{+|}+$/g,"")}}}`;let t=this.commentBox.$el.querySelector("textarea");if(!t){console.error("commentAction: Unable to find textarea");return}let{selectionStart:n,selectionEnd:o}=t,s=this.text;if(n||n===0)s=s.slice(0,n)+e+s.slice(o,s.length),t.selectionStart=n+e.length,t.selectionEnd=o+e.length;else s+=e;this.$emit("update:text",s),this.commentBox.focus()}},template:`
<action-container v-model:enabled="enabled" @update:enabled="onEnable">
<div class="spiHelper-templateRow">
<cdx-select :menu-items="noteTemplates" default-label="Comment templates" @update:selected="insertNote" />
<cdx-select v-if="isClerk || isAdmin" :menu-items="clerkTemplates" default-label="Admin/clerk templates" @update:selected="insertText" />
<cdx-select v-if="isCheckuser" :menu-items="cuTemplates" default-label="CheckUser templates" @update:selected="insertText" />
<cdx-select v-if="customTemplates.length > 0" :menu-items="customTemplates" default-label="Custom templates"
@update:selected="insertText" />
</div>
<cdx-text-area ref="commentBox" :autosize="true" placeholder="Write your comment" :model-value="text"
@update:model-value="onTextUpdate" />
<div class="cdx-card spiHelper-PreviewBox" style="min-height:26px">
<cdx-button class="spiHelper-preview-reload" aria-label="Load preview" @click="updatePreview"
weight="primary" action="progressive" :disabled="loadingPreview">
<cdx-progress-indicator v-if="loadingPreview">Loading preview</cdx-progress-indicator>
<cdx-icon v-else :icon="cdxIconReload" />
</cdx-button>
<div v-html="htmlPreview" class="spiHelper-htmlPreview" />
</div>
</action-container>
`});var po=f({props:{enabled:{type:Boolean,required:!0},oldStatus:{type:String,required:!0},newStatus:{type:String,required:!0}},emits:["update:enabled","update:newStatus"],computed:{selected:{get(){let e=this.caseStatusItems.flatMap((n)=>Je(n)?n.items:[n]);if(this.newStatus==="nochange")return e.some((o)=>o.value===this.oldStatus)?this.oldStatus:"nochange";return e.some((n)=>n.value===this.newStatus)?this.newStatus:"nochange"},set(e){if(e===null)return;this.$emit("update:newStatus",String(e))}},caseStatusItems(){let e=[],t=[],n=[],o=[],s=N(),a=K(),i=/^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.oldStatus),r=/^(?:cu)?endorsed?$/i.test(this.oldStatus),c=/^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclined?)$/i.test(this.oldStatus),l=`No change (${this.oldStatus})`;if(e.push({label:l,value:"nochange"}),ke.test(this.oldStatus))e.push({label:"Reopen",value:"reopen"});else e.push({label:"Open",value:"open"});if(e.push({label:"Close",value:"closed"}),n.push({label:"Request CheckUser",value:"CUrequest"}),a){if(t.push({label:"In progress",value:"inprogress"}),n.push({label:"Request and self-endorse",value:"selfendorse"}),t.push({label:"Request more information",value:"moreinfo"}),s)n.push({label:"Mark as checked",value:"checked"});if(c)n.push({label:"Relist for another check",value:"relist"})}if(a){if(i){if(s)n.push({label:"Endorse CheckUser",value:"cuendorse"}),n.push({label:"Decline CheckUser",value:"cudecline"});else n.push({label:"Endorse for CheckUser attention",value:"endorse"}),n.push({label:"Decline CheckUser",value:"decline"});t.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}else if(r){if(N())n.push({label:"Decline CheckUser",value:"cudecline"});else n.push({label:"Decline CheckUser",value:"decline"});t.push({label:"Request more information for CheckUser",value:"cumoreinfo"})}}if(s)t.push({label:"Place case on CU hold",value:"cuhold"});if(t.push({label:"Place case on hold",value:"hold"}),o.push({label:"Request clerk action",value:"clerk"}),O()||a)o.push({label:"Request admin action",value:"admin"});let d=[t.length?{label:"Clerking",items:t}:null,n.length?{label:"CheckUser",items:n}:null,o.length?{label:"Deferral",items:o}:null].filter((m)=>m!==null);return[...e,...d]}},template:`
<action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
<cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
</action-container>
`});var Yt=f({props:{accounts:{type:Array,required:!0},caseName:{type:String,required:!0}},emits:["update:modelValue","removeRows","addRow","userSelected","usernameChanged"],data(){let e=[];return{linkTools:ys(p.linkTools),selectedRows:e,cdxIconAdd:Ae,cdxIconTrash:re,spiHelperPaginationSizeOptions:lt}},computed:{optionColumns(){return this.linkTools.filter((e)=>this.caseName||!zn(e)).map((e)=>({id:e.id,label:e.label,slot:`item-${e.id}`,tool:e}))},columns(){return[{id:"username",label:"Username"},...this.optionColumns.map(({id:e,label:t})=>({id:e,label:t}))]},paginate(){return this.accounts.length>ct},columnState(){let e=this.accounts,t={};for(let n of this.optionColumns){if(e.length===0){t[n.id]={checked:!1,indeterminate:!1};continue}let o=e.map((i)=>i.link[n.id]),s=o.every(Boolean),a=o.every((i)=>!i);t[n.id]={checked:s,indeterminate:!s&&!a}}return t},allColumnsChecked(){return this.accounts.length>0&&this.optionColumns.every((e)=>this.columnState[e.id]?.checked)},allColumnsIndeterminate(){let e=this.optionColumns.filter((t)=>this.columnState[t.id]?.checked).length;return e>0&&e<this.optionColumns.length},linkItems(){let e={};for(let t of this.optionColumns){let n=this.accounts.filter((s)=>s.link[t.id]).map((s)=>s.username);if(n.length===0)continue;let o=Lt(t.tool,this.caseName,n);if(o)e[t.id]={url:o,label:t.label}}return e},selectAll(){return this.accounts.length>0&&this.selectedRows.length===this.accounts.length},selectAllIndeterminate(){if(this.selectedRows.length===this.accounts.length)return!1;else return this.selectedRows.length!==0}},watch:{selectedRows(e,t){let n=new Set(t),o=new Set(e),s=new Map(this.accounts.map((i)=>[i.id,i])),a=(i,r)=>{let c=s.get(i);if(c)this.toggleRow(c,r)};for(let i of o)if(!n.has(i))a(i,!0);for(let i of n)if(!o.has(i))a(i,!1)}},methods:{handleSelectAll(e){if(e)this.selectedRows=this.accounts.map((t)=>t.id);else this.selectedRows=[]},handleUserSelected(e,t){this.$emit("userSelected",e,t.id)},addDefaultRow(){this.$emit("addRow")},removeRows(){this.$emit("removeRows",[...this.selectedRows]),this.selectedRows=[]},toggleColumn(e,t){for(let n of this.accounts)n.link[e]=t},toggleAllColumns(e){for(let t of this.optionColumns)this.toggleColumn(t.id,e)},toggleRow(e,t){for(let n of this.optionColumns)e.link[n.id]=t}},template:`
<!--suppress VueUnrecognizedDirective -->
<cdx-table :hide-caption="false" caption="Links" :use-row-selection="true"
:columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
:paginate="paginate" :pagination-size-options="spiHelperPaginationSizeOptions"
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

<template v-for="column in optionColumns" :key="column.id" #[column.slot]="{ row }">
<cdx-checkbox :hide-label="true" v-model="row.link[column.id]">{{ column.label }}</cdx-checkbox>
</template>
</cdx-table>
<ul>
<li v-for="[columnId, linkItem] in Object.entries(linkItems)" :key="columnId">
<a :href="linkItem.url.href">{{ linkItem.label }}</a>
</li>
</ul>
`});var uo=f({props:{enabled:{type:Boolean,required:!0},flags:{type:Set,required:!0}},emits:["update:enabled","update:flags"],data(){return{archiveNoticeFlags:[{value:"crosswiki",label:"Cross-wiki"},{value:"deny",label:"Deny"},{value:"notalk",label:"No talkpage access"},{value:"moot",label:"Moot"}]}},computed:{internalFlags:{get(){return Array.from(this.flags)},set(e){this.$emit("update:flags",new Set(e))}}},template:`
<action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
<cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
</action-container>
`});var mo=f({props:{enabled:{type:Boolean,required:!0},target:{type:String,required:!0},suppress:{type:Boolean,required:!0},addNote:{type:Boolean,required:!0},selection:{type:[Object,null],required:!0},archiveEnabled:{type:Boolean,required:!0}},emits:["update:enabled","update:target","update:suppress","update:addNote","moveEntireCase"],data(){return{canSuppressRedirect:Qe()}},computed:{isSectionMove(){return this.selectionType==="single"},moveTitle(){if(!this.selection)return"ERROR";if(this.selection.type==="all")return"entire case";if(this.selection.type==="multiple")return`${this.selection.sections.length} sections`;return"section "+this.selection.section.name},disabled(){return this.archiveEnabled||this.selectionType==="multiple"},selectionType(){return this.selection?.type??null}},watch:{archiveEnabled:{handler(e){if(e)this.$emit("update:enabled",!1)},immediate:!0}},template:`
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
Moving isn't currently supported in multi-action mode.
</cdx-message>
`});var Fi={text:"* ",enabled:!1},en=f({props:{sections:{type:Array,required:!0},bySection:{type:Object,required:!0}},methods:{entry(e){return this.bySection.get(e)??Fi},onUpdateEnabled(e,t){let n=this.bySection.get(e);if(n)n.enabled=t},onUpdateText(e,t){let n=this.bySection.get(e);if(n)n.text=t}},template:`
<div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
<h4>{{ section.name }}</h4>
<comment-action :enabled="entry(section.id).enabled"
@update:enabled="onUpdateEnabled(section.id, $event)"
:text="entry(section.id).text"
@update:text="onUpdateText(section.id, $event)"
:selected-section="{ type: 'single', section }" />
</div>
`});var _i={old:"new",new:"nochange",enabled:!1},tn=f({props:{sections:{type:Array,required:!0},bySection:{type:Object,required:!0}},emits:["update-section-status"],methods:{entry(e){return this.bySection.get(e)??_i},onUpdateEnabled(e,t){let n=this.bySection.get(e);if(n)n.enabled=t},onUpdateNewStatus(e,t){let n=this.bySection.get(e);if(n)n.new=t;this.$emit("update-section-status",e,t)}},template:`
<div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
<h4>{{ section.name }}</h4>
<change-status-action :enabled="entry(section.id).enabled"
@update:enabled="onUpdateEnabled(section.id, $event)"
:old-status="entry(section.id).old" :new-status="entry(section.id).new"
@update:new-status="onUpdateNewStatus(section.id, $event)" />
</div>
`});var ho=f({props:{allSections:{type:Array,required:!0},selectedSection:{type:[Number,Array,String,null],required:!0},multiSelectMode:{type:Boolean,required:!0},selectedSections:{type:Array,required:!0}},emits:["update-section-selection","update:multiSelectMode","update-multi-select-sections"],data(){return{menuPointerOverHandler:null,menuPointerLeaveHandler:null,menuFocusInHandler:null,activeSectionId:null,overlayType:null,hoverPreviewTarget:null,hoverPreviewMenuItems:[]}},computed:{canJumpToSelectedSection(){return!this.multiSelectMode&&typeof this.selectedSection==="number"},sectionSelectElement(){let e=this.$refs.sectionSelect;return e?e.$el:null},multiselectLookupElement(){let e=this.$refs.multiselectLookup;return e?e.$el:null},menuItems(){let e=this.allSections.map((t)=>({value:t.id,label:t.name}));return e.push({value:"all",label:"All Sections"}),e},multiSelectMenuItems(){return this.allSections.map((e)=>({value:e.id,label:e.name}))},multiSelectChips:{get(){return this.selectedSections.map((e)=>({value:e.id,label:e.name}))},set(e){this.emitMultiSelectIds(e.map((t)=>t.value))}},multiSelectSelected:{get(){return this.selectedSections.map((e)=>e.id)},set(e){this.emitMultiSelectIds(e)}}},watch:{async multiSelectMode(){this.detachHoverPreviewListeners(),await this.$nextTick(),this.attachHoverPreviewListeners()}},mounted(){this.attachHoverPreviewListeners()},beforeUnmount(){this.detachHoverPreviewListeners()},methods:{handleUpdateSectionSelection(e){this.$emit("update-section-selection",e)},emitMultiSelectIds(e){let t=e.filter((a)=>typeof a==="number"),n=this.selectedSections.map((a)=>a.id),o=new Set(n);if(t.length===n.length&&t.every((a)=>o.has(a)))return;this.$emit("update-multi-select-sections",t)},jumpToSelectedSection(){if(!this.canJumpToSelectedSection)return;if(this.selectedSection===null||this.selectedSection==="all"||Array.isArray(this.selectedSection))return;ra(this.selectedSection)},renderSectionOverlay(e,t){this.overlayType=t,ma(e,t)},clearSectionHighlight(){ha()},attachHoverPreviewListeners(){if(!p.highlightSection)return;let e=this.multiSelectMode?this.multiselectLookupElement:this.sectionSelectElement;if(!e)return;this.hoverPreviewTarget=e,this.hoverPreviewMenuItems=this.multiSelectMode?this.multiSelectMenuItems:this.menuItems,this.menuPointerOverHandler=(t)=>{this.handlePreviewEvent(t)},this.menuPointerLeaveHandler=()=>{if(this.overlayType==="preview")this.clearSectionHighlight()},this.menuFocusInHandler=(t)=>{this.handlePreviewEvent(t)},e.addEventListener("pointerover",this.menuPointerOverHandler),e.addEventListener("pointerleave",this.menuPointerLeaveHandler),e.addEventListener("focusin",this.menuFocusInHandler)},detachHoverPreviewListeners(){if(this.menuPointerOverHandler)this.hoverPreviewTarget?.removeEventListener("pointerover",this.menuPointerOverHandler);if(this.menuPointerLeaveHandler)this.hoverPreviewTarget?.removeEventListener("pointerleave",this.menuPointerLeaveHandler);if(this.menuFocusInHandler)this.hoverPreviewTarget?.removeEventListener("focusin",this.menuFocusInHandler);this.menuPointerOverHandler=null,this.menuPointerLeaveHandler=null,this.menuFocusInHandler=null,this.hoverPreviewTarget=null,this.hoverPreviewMenuItems=[],this.clearSectionHighlight()},handlePreviewEvent(e){let t=e.target;if(!(t instanceof HTMLElement))return;let n=t.closest(".cdx-menu-item");if(!n)return;let o=da(n,this.hoverPreviewMenuItems);if(o===null){this.activeSectionId=null,this.clearSectionHighlight();return}if(o!==this.activeSectionId)this.renderSectionOverlay(o,"preview")}},template:`
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
<cdx-toggle-switch v-if="allSections.length > 0"
:model-value="multiSelectMode" @update:model-value="$emit('update:multiSelectMode', $event)">
Multi-action
</cdx-toggle-switch>
</div>
`});var nt=f({inheritAttrs:!1,props:{modelValue:{type:String,required:!1,default:""},label:{type:String,required:!1,default:""},touched:{type:Boolean,default:!1},shortened:{type:Boolean,default:!1},autoDismiss:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["update:touched"],data(){return{messages:{warning:this.shortened?"Invalid":"Expiry option is invalid",success:this.shortened?"Valid":"Valid expiry option"},showSuccess:!this.autoDismiss,internalTouched:this.touched,successTimeout:null}},computed:{valid(){return ye(this.modelValue)!==null},status(){if(this.disabled||!this.internalTouched)return"default";if(this.valid)return this.showSuccess?"success":"default";else return"warning"}},watch:{modelValue(){if(this.internalTouched=!0,!this.autoDismiss)return;if(this.successTimeout)clearTimeout(this.successTimeout);if(this.valid)this.showSuccess=!0,this.successTimeout=window.setTimeout(()=>{this.showSuccess=!1},3000)},internalTouched(e){this.$emit("update:touched",e)}},beforeUnmount(){if(this.successTimeout)clearTimeout(this.successTimeout)},template:`
<cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
<template #label>{{ label }}</template>
<cdx-text-input v-model="modelValue" :disabled="disabled" v-bind="$attrs" />
</cdx-field>
`});var va=10,Gi=250,ot=f({props:{modelValue:{type:String,required:!0},placeholder:{type:String,default:"Page"},label:{type:String,default:null},description:{type:String,default:null},namespace:{type:Number,required:!0},prefix:{type:String,default:""},validateMessage:{type:Boolean,default:!0}},emits:["update:modelValue"],data(){let e={visibleItemLimit:6,searchQuery:""};return{lookupStatus:"default",messages:{success:"Page exists",warning:"Page not found"},pageSuggestions:[],useLookup:p.useLookup,searchController:null,selection:null,menuConfig:e}},computed:{pagename:{get(){return this.modelValue},set(e){this.$emit("update:modelValue",e)}},fullPagename(){return`${this.prefix}${this.pagename}`}},beforeUnmount(){this.cancelPendingSearch()},methods:{cancelPendingSearch(){this.searchController?.abort(),this.searchController=null},startSearch(){this.cancelPendingSearch();let e=new AbortController;return this.searchController=e,e.signal},async onUpdateInputValue(e){this.menuConfig.searchQuery=e;let t=this.startSearch();if(!e){this.pageSuggestions=[];return}let n=`${this.prefix}${e}`;if(await $t(Gi,t),G(t))return;let o=await Fe({from:n,namespace:this.namespace,limit:va,signal:t});if(G(t))return;this.pageSuggestions=this.toMenuItems(o??[])},onFocus(){if(this.pageSuggestions.length===0)this.onLoadMore()},async onLoadMore(){if(!this.pagename)return;let e=this.startSearch(),t=await Fe({from:this.fullPagename,namespace:this.namespace,limit:this.pageSuggestions.length+va,signal:e});if(G(e)||!t?.length)return;this.pageSuggestions=this.toMenuItems(t)},async validateInstantly(){if(await this.$nextTick(),this.pagename.length===0){this.lookupStatus="default";return}let e=this.pageSuggestions.find((t)=>t.label===this.pagename)??null;if(e!==null)this.selection=e.value;this.lookupStatus=this.selection===null?"warning":"success"},onSelection(e){if(e!==null)this.lookupStatus="success"},toMenuItems(e){return e.filter((t)=>!t.title.includes("/Archive")).map((t)=>({label:this.stripTitle(t.title),value:t.pageid.toString()}))},stripTitle(e){if(this.prefix)return e.split(this.prefix)[1]??e;if(this.namespace===0)return e;return e.split(":")[1]??e}},template:`
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
@focus="onFocus"
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
`});var nn=f({props:{lockComment:{type:String,required:!0},skipCUVerifyUsers:{type:Set,required:!0},actionName:{type:String,required:!0},checkConflict:{type:Boolean,required:!0},state:{type:Object,required:!0},accounts:{type:Array,required:!0},caseActions:{type:Object,required:!0},allDisabled:{type:Boolean,required:!0}},emits:["update:lockComment","update:skipCUVerifyUsers","onSubmit"],data(){return{popover:{show:!1,revId:0,cancelAction:{label:"Cancel"},continueAction:{label:"Continue",actionType:"progressive"}},submitElement:null,cdxIconUpdate:Wo}},computed:{effectiveStatus(){let e=this.caseActions.status;if(!e)return"";let{enabled:t,data:n}=e;return Ie({enabled:t,old:n.old,new:n.new})},globalRequestTargets(){let e=this.caseActions.block;if(!e.enabled)return[];return this.accounts.filter((t)=>t.block.lock&&(C(t.username)?e.data.userGlobalBlocks.get(t.username)!==!0:e.data.userLocks.get(t.username)!==!0))},needsLockComment(){return this.globalRequestTargets.length>0},hasInvalidTag(){if(!this.caseActions.block.enabled)return!1;return this.accounts.some((t)=>t.block.tags.some((n)=>_(n)&&!n.master))},hasInvalidMove(){let e=this.caseActions.move;return e?.enabled===!0&&!e.data.target},hasInvalidDuration(){let e=this.caseActions.block;if(!e.enabled)return!1;let{options:t,userBlocks:n,userLocks:o,userGlobalBlocks:s}=e.data;return this.accounts.some((a)=>!Ke(a,"duration",t,n,o,s,this.accounts)&&ye(a.block.duration)===null)},commentClaims(){let e=this.caseActions.comment;if(!e?.enabled||this.state.selectedSection?.type!=="single")return[];let t=this.caseActions.block;return Qn(e.data.text,{effectiveStatus:this.effectiveStatus,blockPlanned:t.enabled&&this.accounts.some((n)=>n.block.block),globalRequestPlanned:this.globalRequestTargets.length>0})},lenientOverrides(){let e=this.caseActions.block,{options:t,userBlocks:n}=e.data;if(!e.enabled||!t.override||t.noBlock)return[];let o=new Date;return this.accounts.flatMap((s)=>{let a=n.get(s.username);if(!s.block.block||!a)return[];let i=_n({username:s.username,existing:a,intended:s.block,now:o});return i.length>0?[{username:s.username,reasons:i}]:[]})},cuBlockConfirmationsNeeded(){let e=this.caseActions.block.data,t=new Set;if(N()||!this.caseActions.block.enabled||!e.options.override||!e.options.noBlock)return t;for(let n of this.accounts){if(!n.block.block)continue;let o=e.userBlocks.get(n.username)?.reason;if(o&&it.exec(o))t.add(n.username)}return t},cuBlockOverrideChecked:{get(){return this.skipCUVerifyUsers.size===this.cuBlockConfirmationsNeeded.size},set(e){this.$emit("update:skipCUVerifyUsers",e?this.cuBlockConfirmationsNeeded:new Set)}},cuBlockOverrideIndeterminate(){let e=this.skipCUVerifyUsers.size;return e>0&&e<this.cuBlockConfirmationsNeeded.size},disableButton(){return He(this.actionName)||this.allDisabled||this.hasInvalidTag||this.hasInvalidMove||this.hasInvalidDuration},lockCommentValue:{get(){return this.lockComment},set(e){this.$emit("update:lockComment",e)}}},mounted(){this.submitElement=this.$refs.submitElement},methods:{async onSubmit(){if(this.disableButton)return;if(this.checkConflict)if(this.popover.revId=await Ce(u.pageName),this.popover.revId===u.startingRevId)this.$emit("onSubmit");else this.popover.show=!0;else this.$emit("onSubmit")},confirmSubmit(){this.popover.show=!1,u.startingRevId=this.popover.revId,this.state.selectedSection?.type==="single"?z(this.state.selectedSection.section,{purge:!0}):ee(this.state,{purge:!0}),this.$emit("onSubmit")}},template:`
<div class="spiHelper-submitForm">
<cdx-field v-if="needsLockComment">
<template #label>Global request comment</template>
<template #description>Optional comment to include in the global lock/block request</template>
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
<cdx-message v-for="claim in commentClaims" :key="claim.quoted + claim.reason"
type="warning" :inline="true">
The comment includes {{ claim.quoted }}, but {{ claim.reason }}
</cdx-message>
<cdx-message v-for="override in lenientOverrides" :key="override.username"
type="warning" :inline="true">
Overriding <b>{{ override.username }}</b>'s existing block with a more lenient one:
{{ override.reasons.join(', ') }}
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
`});function go(e){return Object.entries(e).map(([t,{label:n,icon:o}])=>({value:t,label:n,icon:o}))}var on=f({props:{open:{type:Boolean,required:!0},anchor:{type:Object,required:!1,default:null},clipboardTag:{type:[Object,null],required:!0},defaultMaster:{type:String,required:!0}},emits:{"update:open":(e)=>!0,saveTag:(e)=>!0,addTag:(e)=>!0,copyTag:(e)=>!0,deleteTag:()=>!0},data(){let e=go(wt),t=go(Oe),n=go(Jo),o={tag:"none",altmaster:"none"},s=[{value:"sock",label:"Sockpuppet",icon:yt},{value:"master",label:"Sockmaster",icon:kt}],a=null,i=null;return{sockTags:e,masterTags:t,altmasterTags:n,allTagSelections:o,tagCategoryButtons:s,temporaryTag:null,originalTag:null,icons:{cdxIconAdd:Ae,cdxIconCopy:vt,cdxIconPaste:Go,cdxIconTrash:re}}},computed:{openValue:{get(){return this.open},set(e){this.$emit("update:open",e)}},tagCategory:{get(){if(this.temporaryTag===null)return null;return _(this.temporaryTag)?"sock":"master"},set(e){if(e==="sock")this.temporaryTag=new oe({status:"blocked",master:this.defaultMaster,evidence:this.temporaryTag?.evidence});else this.temporaryTag=new he({status:"blocked",evidence:this.temporaryTag?.evidence})}}},methods:{setTag(e){this.originalTag=e?e.clone():null,this.temporaryTag=e?e.clone():null},normaliseMasters(e){if(_(e))e.master=R(e.master),e.altmaster=R(e.altmaster);return e},handleSave(){if(this.temporaryTag===null){console.error("No tag to save");return}this.$emit("saveTag",this.normaliseMasters(this.temporaryTag)),this.openValue=!1},handleCancel(){this.temporaryTag=this.originalTag?this.originalTag.clone():null,this.openValue=!1},handleDeleteTag(){this.$emit("deleteTag"),this.openValue=!1},handleCopyTag(){if(!this.temporaryTag)return;this.$emit("copyTag",this.temporaryTag.clone())},handlePasteTag(){if(!this.clipboardTag)return;this.temporaryTag=this.clipboardTag.clone()},handleAddTag(){this.$emit("addTag",this.temporaryTag&&this.normaliseMasters(this.temporaryTag))}},template:`
<cdx-popover v-if="anchor" :anchor="anchor" v-model:open="openValue"
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
`});var fo=f({props:{state:{type:Object,required:!0},activateButton:{type:Object,required:!0}},data(){return{activateHandler:null,open:!1,archiving:!1,messages:q}},mounted(){this.activateHandler=()=>{q.length=0,this.open=!0,this.archiving=!0,mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"oca"}),ta(this.state).then(()=>{this.archiving=!1},()=>{})},this.activateButton.addEventListener("click",this.activateHandler)},beforeUnmount(){if(this.activateHandler)this.activateButton.removeEventListener("click",this.activateHandler)},template:`
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
`});var Wi=/\[\[(?:Wikipedia|WP):(?:Sockpuppet investigations|SPI)\/([^\]]+)/i,vo=f({props:{state:{type:Object,required:!0},feedbackDialog:{type:Object,required:!0},openButton:{type:Object,required:!0},defaultCase:{type:String,required:!1,default:""},view:{type:String,required:!0}},data(){return{open:!1,openHandler:null,beforeUnloadHandler:null,caseLoaded:!1,caseLoading:!1,accountsLoading:!1,targetCase:this.defaultCase,blockData:gt(),accounts:[],actionsRunning:!1,unpinned:!p.interface.pinned,messages:q,cdxIconFeedback:Me,cdxIconPushPin:bt}},computed:{mountPoint(){return this.$el.parentElement},pageName(){return`Wikipedia:Sockpuppet investigations/${this.targetCase}`},caseActions(){return{block:{enabled:!0,data:this.blockData}}}},watch:{unpinned(e){if(!this.mountPoint){console.error("AlternateView unpinned: Could not find mountPoint");return}if(e)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");p.interface.pinned=!e}},mounted(){if(!this.mountPoint){console.error("AlternateViewComponent mounted: Could not find mountPoint");return}if(this.unpinned)this.mountPoint.classList.add("unpinned");else this.mountPoint.classList.remove("unpinned");this.beforeUnloadHandler=(e)=>{if(ft("alternateActions")!=="success")e.preventDefault()},this.openHandler=()=>{if(this.open=!this.open,this.open){if(mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"open",type:"alternate"}),!this.caseLoaded)switch(this.view){case"category":this.initialiseCategoryView();break;case"checkuser":this.initialiseCheckUserView();break;case"si":this.initialiseSIView();break}}if(this.beforeUnloadHandler)if(this.open)window.addEventListener("beforeunload",this.beforeUnloadHandler);else window.removeEventListener("beforeunload",this.beforeUnloadHandler)},this.openButton.addEventListener("click",this.openHandler)},beforeUnmount(){if(this.openHandler)this.openButton.removeEventListener("click",this.openHandler);if(this.beforeUnloadHandler)window.removeEventListener("beforeunload",this.beforeUnloadHandler)},methods:{dismissMessage:St,handleUserSelected(e,t){let n=this.accounts.find((o)=>o.id===t);if(!n)return;if(e.blockid!==void 0&&!this.blockData.userBlocks.has(n.username)){let o=mw.util.isIPAddress(e.name)?e.blockanononly:e.blockautoblocking;this.blockData.userBlocks.set(n.username,{username:n.username,duration:e.blockexpiry??"",abao:o??!1,acb:e.blocknocreate??!1,ntp:e.blockowntalk??!1,nem:e.blockemail??!1,reason:""})}Gt(e,n)},handleAddRow(e){e??=ge(this.state.archiveNotice),this.accounts.push(e)},handleRemoveRows(e){this.accounts=this.accounts.filter((t)=>!e.includes(t.id))},async handleFetchRows(){let e;try{e=await navigator.clipboard.readText()}catch(i){if(console.error("handleFetchRows failed to read clipboard:",i),i instanceof DOMException&&i.name==="NotAllowedError")new g({type:"warning",content:"Failed to read clipboard. You may need to press 'paste' in the confirmation popup"}).show();return}let[t,n]=ze({text:e,fullSearch:!1,state:this.state}),o=new Set(t.map((i)=>i.username)),s=[...t,...n].map((i)=>Ze({userRow:i,defaultBlock:o.has(i.username)})),a=new Set(this.massAddUserRows(s).map((i)=>i.username));await ve(a,this.blockData.fetchedUsers),et({accounts:this.accounts,usernames:a,blockData:this.blockData,state:this.state})},massAddUserRows(e){let t=new Set(this.accounts.map((o)=>o.username)),n=e.filter((o)=>!t.has(o.username));return n.forEach((o)=>{this.handleAddRow(o)}),n},async loadCase(e){this.caseLoading=!0;try{if(Tt(this.pageName,"alternate"),this.targetCase){let[t]=await Promise.all([jt({page:this.pageName,state:this.state}),ve(e?new Set([this.targetCase]):new Set,this.blockData.fetchedUsers)]);if(u.valid=t!==null,t===null)this.state.archiveNotice=new J({username:this.targetCase});else this.state.archiveNotice=t;if(e){let[n]=await be({likelySocks:[ue(this.targetCase,this.state)],possibleSocks:[],blockData:this.blockData,state:this.state});if(n){let o=this.accounts.findIndex((s)=>s.username===n.username);if(o===-1)this.accounts.splice(0,0,n);else this.accounts.splice(o,1,n)}}}else u.valid=!1;this.blockData.master=R(this.targetCase),this.caseLoaded=!0}finally{this.caseLoading=!1}},async onSubmitActions(){if(He("alternateActions"))return;mw.track("stats.mediawiki_gadget_spihelper_total",1,{action:"submit",type:"alternate"}),D("alternateActions"),this.actionsRunning=!0;try{let{blockPromises:e,tagPromises:t,talkNoticePromises:n,globalRequestPromise:o}=await so({accounts:this.accounts,blockData:this.blockData}),s=Promise.all([Promise.all(e),Promise.all(t),o]),a=Promise.all(n),[i,r,c]=await s;if(await a,p.log.enabled){let l=`* [[:User:${u.userName}]]`+mt({blockedUsers:i,taggedUsers:r,lockedUsers:c.lockedUsers,globalBlockedUsers:c.globalBlockedUsers});await tt(l)}new g({type:"success",content:"Done!"}).show(),H("alternateActions","success")}catch(e){let t=e instanceof Error?e.message:String(e);new g({type:"error",content:`Actions stopped: ${t}. Reload and try again. If the issue persists, file a bug report`}).show(),H("alternateActions","failed")}finally{this.blockData.fetchedUsers.clear(),this.actionsRunning=!1}},async initialiseCategoryView(){if(this.defaultCase===""||this.caseLoading||this.caseLoaded)return;let[,e,t]=await Promise.all([this.loadCase(!1),Sn(`Category:Suspected Wikipedia sockpuppets of ${this.targetCase}`),Sn(`Category:Wikipedia sockpuppets of ${this.targetCase}`)]),n=(a,i)=>{let r={...ue(a.replace("User:",""),this.state)};return r.block.block=i,r},o=[...t,`User:${this.targetCase}`].map((a)=>n(a,!0)),s=e.map((a)=>n(a,!1));this.accountsLoading=!0;try{let a=await be({likelySocks:o,possibleSocks:s,blockData:this.blockData,state:this.state});this.massAddUserRows(a)}finally{this.accountsLoading=!1}},async initialiseCheckUserView(){let e=$("form#checkuserform",document),t=$("#checkreason input",e).val();if(typeof t==="string"){let a=Wi.exec(t)?.[1];if(a){this.targetCase=a;return}}let n=$("#checktarget input",e).val();if(typeof n==="string"){if(!mw.util.isIPAddress(n,!0))this.targetCase=n}let s=$("table.mw-checkuser-helper-table",document).find("td a.mw-userlink > bdi");await this.populateUserRows(s)},async initialiseSIView(){let t=$("ul.mw-checkuser-suggestedinvestigations-users",document).find("li a.mw-userlink > bdi");await this.populateUserRows(t)},async populateUserRows(e){let t=[],n=new Set;for(let o of e){let s=R($(o).text());if(n.has(s))continue;t.push(ue(s,this.state)),n.add(s)}if(t.length>0&&t[0])this.targetCase=t[0].username;this.accountsLoading=!0;try{let o=await be({likelySocks:t,possibleSocks:[],blockData:this.blockData,state:this.state});this.massAddUserRows(o)}finally{this.accountsLoading=!1}},launchFeedback(){let e=this.view.charAt(0).toUpperCase()+this.view.slice(1);this.feedbackDialog.launch({subject:`Feedback from ${mw.config.get("wgUserName")}`,message:`${e} form v${Q}-${Z}`})}},template:`
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
<cdx-button weight="primary" action="progressive" :disabled="caseLoading"
@click="loadCase(true)">Load</cdx-button>
<cdx-progress-indicator v-if="caseLoading">Loading case</cdx-progress-indicator>
<cdx-progress-indicator v-else-if="accountsLoading">Loading accounts</cdx-progress-indicator>
</div>
</div>
<div id="spiHelper-alternateView-Content" v-if="caseLoaded">
<div>
<h4>Link</h4>
<link-action :case-name="targetCase" :accounts="accounts" @user-selected="handleUserSelected"
@remove-rows="handleRemoveRows" @add-row="handleAddRow" />
</div>
<div>
<h4>Block</h4>
<block-action :enabled="true" fetch-type="clipboard"
:accounts="accounts" v-model:block-options="blockData.options"
:user-locks="blockData.userLocks"
:user-global-blocks="blockData.userGlobalBlocks"
:user-blocks="blockData.userBlocks"
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
<div class="spiHelper-messageRow">
<cdx-message v-for="message in messages" :key="message.id" :type="message.type" :fade-in="true"
:allow-user-dismiss="true" @user-dismissed="dismissMessage(message.id)">
<span v-if="message.isHtml" v-html="message.content" />
<span v-else>
{{ message.content }}
</span>
</cdx-message>
</div>
</div>
`});var bo=f({props:{unseenChanges:{type:Array,required:!0},openState:{type:Object,required:!0}},data(){return{beta:Z!=="production"}},methods:{onClose(){this.openState.isOpen=!1,this.$emit("dismissed")},resolveDate(e){if(typeof e==="string")return e;return this.beta?e.beta:e.stable}},template:`
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
</cdx-dialog>`});async function ji(){let e=us(),t={action:"query",prop:"revisions",rvprop:"content",rvslots:"main",pageids:82598459,formatversion:"2"};try{let o=(await e.get(t)).query.pages[0]?.revisions?.[0]?.slots.main.content;if(o)return JSON.parse(o)}catch(n){console.error("getChangelog fetch error:",n)}return{}}async function xa(e){let t=await ji();return Object.entries(t).filter(([n])=>ba(n,e)).sort(([n],[o])=>ba(n,o)?-1:1)}function ba(e,t){let n=e.split(".").map(Number),o=t.split(".").map(Number);for(let s=0;s<3;s++){if((n[s]??0)>(o[s]??0))return!0;if((n[s]??0)<(o[s]??0))return!1}return!1}var ka=f({template:`
<cdx-toast-container />
`});if(mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/")&&!mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/SPI/"))sn("spi");else if(mw.config.get("wgCanonicalSpecialPageName")==="CheckUser")sn("checkuser");else if(mw.config.get("wgCanonicalSpecialPageName")==="SuggestedInvestigations"&&mw.config.get("wgPageName").includes("/detail/"))sn("si");else if(mw.config.get("wgNamespaceNumber")===14&&["Suspected Wikipedia sockpuppets","Wikipedia sockpuppets"].some((e)=>mw.config.get("wgCategories").includes(e)))sn("category");function sn(e){mw.loader.using(["vue","@wikimedia/codex","mediawiki.api","mediawiki.ForeignApi","mediawiki.util","mediawiki.user"],(t)=>{let n=t("vue"),o=t("@wikimedia/codex");Ms(n.toRaw),Cs(n.markRaw),Ko(n.reactive),As(o.TableRowIdentifier);let s=Qi();importStylesheet("User:DatGuy/spihelper.css");let a,i=n.reactive(new An);if(e==="spi"){let d=mw.config.get("wgPageName");Tt(d),Pe(i)}else if(e==="category"){if(a=/Category:(?:Suspected )?Wikipedia sockpuppets of (.*)/.exec(mw.config.get("wgPageName").replaceAll("_"," ")),!a?.[1])return}let r=Mn();if(r)It(p,r),p.linkTools=Rn(p.linkTools);else(async()=>{await Cn(),pe()})();Ki(n,o);let c=n.reactive({isOpen:!1});if(p.lastSeenVersion!==Q)xa(p.lastSeenVersion).then((d)=>{let m=document.createElement("div");m.style.position="absolute",mw.util.$content.prepend(m);let h=n.createMwApp(bo,{unseenChanges:d,openState:c,onDismissed:async()=>{p.lastSeenVersion=Q,await pe(),h.unmount(),m.remove()}}).component("cdx-button",o.CdxButton).component("cdx-dialog",o.CdxDialog).component("cdx-message",o.CdxMessage);h.mount(m)},()=>{});let l=mw.util.addPortletLink("p-cactions","#",Z==="production"?"SPI":"SPI-Beta","ca-spiHelper","Run spiHelper");if(l){let d=document.createElement("div");switch(d.setAttribute("id","spiHelper-vue-mount-point"),mw.util.$content.prepend(d),l.addEventListener("click",()=>{c.isOpen=!0}),e){case"spi":{n.createMwApp(ro,{state:i,feedbackDialog:s,openButton:l}).component("cdx-tabs",o.CdxTabs).component("cdx-tab",o.CdxTab).component("cdx-select",o.CdxSelect).component("cdx-card",o.CdxCard).component("cdx-toggle-switch",o.CdxToggleSwitch).component("cdx-text-area",o.CdxTextArea).component("cdx-toggle-button",o.CdxToggleButton).component("cdx-toggle-button-group",o.CdxToggleButtonGroup).component("cdx-button",o.CdxButton).component("cdx-button-group",o.CdxButtonGroup).component("cdx-icon",o.CdxIcon).component("cdx-table",o.CdxTable).component("cdx-text-input",o.CdxTextInput).component("cdx-checkbox",o.CdxCheckbox).component("cdx-lookup",o.CdxLookup).component("cdx-field",o.CdxField).component("cdx-message",o.CdxMessage).component("cdx-multiselect-lookup",o.CdxMultiselectLookup).component("cdx-progress-bar",o.CdxProgressBar).component("cdx-progress-indicator",o.CdxProgressIndicator).component("cdx-accordion",o.CdxAccordion).component("cdx-label",o.CdxLabel).component("cdx-popover",o.CdxPopover).component("action-accordion",Jn).component("action-button",Kn).component("action-container",Xn).component("action-content",Yn).component("submit-form",nn).component("comment-action",lo).component("change-status-action",po).component("multi-section-comment-action",en).component("multi-section-status-action",tn).component("block-action",Xt).component("link-action",Yt).component("management-action",uo).component("archive-action",co).component("move-action",mo).component("section-action",ho).component("user-lookup",Wt).component("page-lookup",ot).component("expiry-input",nt).component("tag-popover",on).directive("tooltip",o.CdxTooltip).mount(d);break}case"checkuser":case"category":case"si":{n.createMwApp(vo,{state:i,feedbackDialog:s,openButton:l,view:e,...e==="category"?{defaultCase:a?.[1]??""}:{}}).component("cdx-button",o.CdxButton).component("cdx-checkbox",o.CdxCheckbox).component("cdx-field",o.CdxField).component("cdx-icon",o.CdxIcon).component("cdx-label",o.CdxLabel).component("cdx-lookup",o.CdxLookup).component("cdx-message",o.CdxMessage).component("cdx-popover",o.CdxPopover).component("cdx-progress-indicator",o.CdxProgressIndicator).component("cdx-select",o.CdxSelect).component("cdx-table",o.CdxTable).component("cdx-text-area",o.CdxTextArea).component("cdx-text-input",o.CdxTextInput).component("cdx-toggle-button-group",o.CdxToggleButtonGroup).component("submit-form",nn).component("block-action",Xt).component("link-action",Yt).component("user-lookup",Wt).component("page-lookup",ot).component("expiry-input",nt).component("tag-popover",on).directive("tooltip",o.CdxTooltip).mount(d);break}}}if(Zi(n,o,s),mw.config.get("wgCategories").includes("SPI cases awaiting archive")&&K())Ji(n,o,i);window.addEventListener("beforeunload",(d)=>{if(Po())d.preventDefault()})})}function Qi(){let e=null;return{launch(t){(async()=>{try{if(!e)await mw.loader.using(["mediawiki.feedback"]),e=new mw.Feedback(So());e.launch(t)}catch(n){mw.notify("Could not load the feedback dialog",{type:"error"}),console.error("Error loading mediawiki.feedback:",n)}})()}}}function Zi(e,t,n){let o=mw.util.addPortletLink("p-cactions","#",Z==="production"?"SPI-Options":"SPI-Beta-Options","ca-spiHelperOpts","Modify spiHelper settings");if(o){let s=document.body.appendChild(document.createElement("div"));e.createMwApp(Bn,{feedbackDialog:n,openButton:o,toaster:t.useToast()}).component("cdx-button",t.CdxButton).component("cdx-dialog",t.CdxDialog).component("cdx-field",t.CdxField).component("cdx-lookup",t.CdxLookup).component("cdx-select",t.CdxSelect).component("cdx-toggle-switch",t.CdxToggleSwitch).component("cdx-accordion",t.CdxAccordion).component("cdx-text-input",t.CdxTextInput).component("cdx-icon",t.CdxIcon).component("cdx-message",t.CdxMessage).component("cdx-multiselect-lookup",t.CdxMultiselectLookup).component("watch-setting",$n).component("expiry-setting",Tn).component("expiry-input",nt).component("log-page-setting",Pn).component("page-lookup",ot).mount(s)}}function Ji(e,t,n){let o=mw.util.addPortletLink("p-cactions","#",Z==="production"?"SPI-Archive":"SPI-Beta-Archive","ca-spiHelperArchive","Run one click archival");if(o){let s=document.body.appendChild(document.createElement("div"));e.createMwApp(fo,{state:n,activateButton:o}).component("cdx-dialog",t.CdxDialog).component("cdx-message",t.CdxMessage).component("cdx-progress-bar",t.CdxProgressBar).mount(s)}}function Ki(e,t){let n=e.createMwApp(ka).component("cdx-toast-container",t.CdxToastContainer),o=document.body.appendChild(document.createElement("div"));n.mount(o)}})();

// </nowiki>
