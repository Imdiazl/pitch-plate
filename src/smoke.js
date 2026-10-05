// Startup smoke test: runs the built script against a fake DOM so init-order and reference errors surface before deploy.
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','app.html'),'utf8');
const js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
const mk=()=>{const el={style:{},dataset:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},children:[],childNodes:[],innerHTML:'',textContent:'',value:'',hidden:false,
  querySelector(){return mk()},querySelectorAll(){return []},getBoundingClientRect(){return{x:0,y:0,width:360,height:40,top:0,left:0,right:360,bottom:40}},appendChild(){},remove(){},closest(){return null},matches(){return false},
  addEventListener(){},setAttribute(){},getAttribute(){return null},focus(){},click(){},scrollIntoView(){},insertBefore(){},after(){},before(){}};return el};
const storage={};global.localStorage={getItem:k=>storage[k]??null,setItem:(k,v)=>{storage[k]=String(v)},removeItem:k=>{delete storage[k]}};
global.sessionStorage={getItem:()=>null,setItem(){}};
const docEl=Object.assign(mk(),{style:{},clientWidth:360});global.document={querySelector:()=>mk(),querySelectorAll:()=>[],createElement:()=>mk(),documentElement:docEl,body:mk(),head:mk(),scripts:[],addEventListener(){},hidden:false,fonts:{check:()=>true},visibilityState:'visible'};
global.window=global;global.scrollTo=()=>{};global.innerWidth=360;global.innerHeight=780;global.addEventListener=()=>{};global.devicePixelRatio=3;global.claude=undefined;global.navigator={userAgent:'smoke',mediaDevices:null,vibrate:null,storage:null,userActivation:{hasBeenActive:false}};
global.history={replaceState(){}};global.location={hash:'',pathname:'/',search:'',origin:'http://x'};
global.matchMedia=()=>({matches:false});global.confirm=()=>false;global.fetch=()=>Promise.reject(new Error('no network in smoke'));
global.requestAnimationFrame=f=>setTimeout(f,0);global.FileReader=function(){};global.Blob=function(){};global.URL={createObjectURL(){return ''},revokeObjectURL(){}};
global.SpeechRecognition=undefined;global.webkitSpeechRecognition=undefined;
let failed=false;process.on('uncaughtException',e=>{console.error('SMOKE FAIL (async):',e.message);failed=true});
try{new Function(js)();}catch(e){console.error('SMOKE FAIL (init):',e.stack.split('\n').slice(0,3).join('\n'));process.exit(1)}
setTimeout(()=>{if(failed)process.exit(1);console.log('smoke ok: script initialised without reference errors (no profile path)');
  // second pass with a profile saved, exercising render() for Today
  storage['pitchplate.v1']=JSON.stringify({profile:{sex:'m',age:34,height:174,startWeight:98,startDate:'2026-10-04',goalWeight:75,goalDate:'2026-12-31',rate:null,activity:1.3,proteinPerKg:1.8,fatPerKg:0.6,fiber:38,eatBack:50,fbPerWeek:3,fbMinutes:60,gymPerWeek:2,gymMinutes:45,ageChecked:true},days:{'2026-10-05':{foods:[{uid:'a',name:'Skyr',brand:'',grams:300,meal:'Breakfast',per100:{kcal:63,p:11,c:4,f:0.2,fib:0,sug:4}}],ex:[{uid:'e',id:'fb_train',name:'Football training',min:60,kcal:700,sets:[]}],weight:97.5}},favs:[],recent:[],custom:{},settings:{}});
  try{new Function(js)();}catch(e){console.error('SMOKE FAIL (with profile):',e.stack.split('\n').slice(0,3).join('\n'));process.exit(1)}
  setTimeout(()=>{if(failed)process.exit(1);console.log('smoke ok: Today rendered with a saved profile');process.exit(0)},300)},300);
