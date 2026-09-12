const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
function environment(){
 const nodes=new Map(),stored=new Map();let fail=false;
 const node=()=>({innerHTML:'',textContent:'',value:'',dataset:{},listeners:{},classList:{add(){},remove(){}},addEventListener(k,fn){this.listeners[k]=fn;},append(){},click(){},showModal(){this.open=true;},close(){this.open=false;}});
 const get=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);};
 const ctx={console,crypto:webcrypto,URL,Blob,Intl,Date,setTimeout:()=>0,clearTimeout(){},confirm:()=>true,navigator:{},location:{hostname:'localhost',origin:'http://localhost:4173'},localStorage:{getItem:k=>stored.get(k),setItem(k,v){if(fail)throw Error('quota');stored.set(k,v);}},document:{querySelector:get,createElement:node,body:node()},window:{print(){}}};
 vm.createContext(ctx);for(const file of ['model.js','center.js'])vm.runInContext(fs.readFileSync('public/command-center/'+file,'utf8'),ctx);
 const click=data=>get('#app').listeners.click({target:{closest:()=>({dataset:data})}});
 const input=(path,value)=>get('#app').listeners.input({target:{dataset:{path},value}});
 const state=()=>JSON.parse(stored.get('northpeak-command-center-v1'));
 const upload=async data=>get('#import-file').onchange({target:{files:[{size:100,text:async()=>JSON.stringify(data)}],value:''}});
 return {ctx,get,click,input,state,upload,setFail:()=>fail=true};
}
(async()=>{
 const e=environment();e.get('#new-client').onclick();e.input('answers.studio','<script>alert(1)</script>');e.input('internal','PRIVATE-NOTES');e.input('costs.hours','10');e.input('costs.rate','100');e.input('costs.external','200');const id=e.state().active;
 for(const type of ['preguntas','minuta','propuesta','bienvenida','plan','avance','entrega','resultados']){await e.click({doc:type});const html=e.get('#document-body').innerHTML;assert(!html.includes('PRIVATE-NOTES'));assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert.equal(html,e.get('#print-surface').innerHTML);}
 await e.click({tab:'proposal'});assert(e.get('#app').innerHTML.includes('1,200.00'));
 const backup={type:'northpeak-backup',version:1,clients:e.state().clients};await e.upload(backup);e.get('#confirm-import').onclick();assert.equal(e.state().clients.length,1);assert.equal(e.state().clients[0].internal,'PRIVATE-NOTES');
 await e.upload({type:'northpeak-intake',version:1,ref:id,answers:{studio:'Respuestas del cliente',goal:'Más reservas',__proto__:{admin:true}}});e.get('#confirm-import').onclick();assert.equal(e.state().clients[0].answers.studio,'Respuestas del cliente');assert.equal(e.state().clients[0].internal,'PRIVATE-NOTES');assert.equal(e.state().clients[0].costs.hours,'10');
 await e.upload({type:'invalid',version:1});assert.equal(e.state().clients.length,1);assert(e.get('#notice').textContent.includes('compatible'));
 await e.click({tab:'impact'});e.input('metrics.0.before','0');e.input('metrics.0.after','10');assert(e.get('[data-delta="0"]').textContent.includes('base cero'));e.input('metrics.0.before','5');assert(e.get('[data-delta="0"]').textContent.includes('100.0%'));
 e.setFail();e.input('internal','changed');assert(e.get('#save-status').textContent.includes('No se pudo guardar'));
 console.log('PASS: eight client documents exclude private notes and escape HTML; backup and response imports; invalid files; internal cost arithmetic; zero-baseline metrics; storage failure reporting.');
})().catch(error=>{console.error(error);process.exitCode=1;});
