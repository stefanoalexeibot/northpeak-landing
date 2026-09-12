(() => {
'use strict';
const root = '/pilates/spgg/diagnostico';
const key = 'northpeak-pilates-journey-v1';
const screen = document.getElementById('screen');
const params = new URLSearchParams(location.search);
const origins = ['general','lanzamiento','crecimiento','movil','plantilla'];
const templateNames = {luminosa:'Luminosa · Pilates Reformer',forma:'Forma · Barre & Sculpt',alma:'Alma · Yoga & Mat'};
const templateIds = Object.keys(templateNames);
const initialOrigin = origins.includes(params.get('origen')) ? params.get('origen') : 'general';
let state = {answers:{}, origin:initialOrigin, template:null};
try {
  const stored = JSON.parse(sessionStorage.getItem(key));
  if (stored && typeof stored.answers === 'object' && stored.answers && Date.now() - stored.savedAt < 7200000) {
    state.answers = stored.answers;
    state.origin = origins.includes(stored.origin) ? stored.origin : initialOrigin;
    state.template = templateIds.includes(stored.template) ? stored.template : null;
  }
} catch {}
if (params.has('origen')) state.origin = initialOrigin;
if (params.has('plantilla')) state.template = templateIds.includes(params.get('plantilla')) ? params.get('plantilla') : null;
else if (params.has('origen') && initialOrigin !== 'plantilla') state.template = null;
if (state.template) state.origin = 'plantilla';
if (state.template && !state.answers.studio) {
 try { const preview=JSON.parse(sessionStorage.getItem('northpeak-preview-brand'));if(preview&&Date.now()-preview.savedAt<7200000&&typeof preview.name==='string'&&preview.name.trim().length>=2)state.answers.studio=preview.name.trim().slice(0,45); } catch {}
}
const steps = [
 {slug:'estudio',title:'Cuéntanos de tu estudio.',intro:'Empecemos por el movimiento que te define.',field:'type',image:'hero-studio.jpg',chapter:'EL ESTUDIO',quote:'Cada espacio empieza<br><em>con una intención.</em>',options:[
 ['Pilates Reformer','Movimiento, precisión y atención al detalle.'],['Mat, Barre o Yoga','Bienestar que se vive de distintas formas.'],['Estudio multidisciplina','Varias experiencias bajo una misma marca.'],['Estoy por abrir','Estamos construyendo el siguiente capítulo.']]},
 {slug:'presencia',title:'¿Dónde estás hoy en digital?',intro:'Así podemos distinguir lo que ya funciona de lo que falta conectar.',field:'stage',image:'pilates-woman.jpg',chapter:'TU PUNTO DE PARTIDA',quote:'El siguiente paso<br><em>empieza donde estás.</em>',options:[
 ['Sin página web','Hoy me encuentran por redes o recomendación.'],['Tengo web, falta mejorarla','La imagen o el proceso de reserva pueden mejorar.'],['Web y reservas funcionando','Quiero fortalecer la captación y el contenido.'],['Aún no lo tengo claro','Necesito una revisión para decidir.']]},
 {slug:'objetivo',title:'¿Qué te gustaría lograr primero?',intro:'Elige una prioridad. La conversación nos ayudará a afinar el resto.',field:'goal',image:'barre-class.jpg',chapter:'LO QUE TE MUEVE',quote:'Más intención.<br><em>Una dirección clara.</em>',options:[
 ['Una imagen a la altura','Que mi web y contenido reflejen mi estudio.'],['Organizar las reservas','Facilitar las citas y reducir mensajes manuales.'],['Atraer nuevas alumnas','Trabajar la publicidad y el seguimiento.'],['Preparar mi lanzamiento','Salir con una presencia digital coherente.']]},
 {slug:'inversion',title:'Hablemos de una inversión cómoda.',intro:'Es una referencia para preparar la conversación. No estás contratando ni realizando un pago.',field:'budget',image:'hero-studio.jpg',chapter:'UN PLAN A TU MEDIDA',quote:'Crecer también es<br><em>elegir por dónde empezar.</em>',options:[
 ['Lanzamiento · $9,900 MXN','Proyecto de pago único para web y reservas.'],['Crecimiento · $7,500 MXN/mes','Acompañamiento mensual de contenido y publicidad.'],['Ambas etapas','Primero la base y después el crecimiento mensual.'],['Prefiero definirlo en la plática','Quiero entender el alcance antes de decidir.']]},
 {slug:'momento',title:'¿Cuándo te gustaría empezar?',intro:'Ubicación y tiempos nos ayudan a preparar una propuesta realista.',image:'barre-class.jpg',chapter:'EL MOMENTO',quote:'A tu ritmo.<br><em>Con el siguiente paso claro.</em>'},
 {slug:'contacto',title:'Pongámosle nombre a tu proyecto.',intro:'Solo necesitamos saber cómo llamarte y cómo se llama tu estudio.',image:'pilates-woman.jpg',chapter:'TU PROYECTO',quote:'Tu historia.<br><em>Tu próxima etapa.</em>'}
];
const times = ['Lo antes posible','En 1–3 meses','Estoy explorando'];
const zones = ['San Pedro Garza García','Monterrey u otra zona metropolitana','Otra ciudad'];
function save() { try { sessionStorage.setItem(key, JSON.stringify({...state,savedAt:Date.now()})); } catch {} }
function valid(index) {
 const s = steps[index], a=state.answers;
 if (s.options) return s.options.some(o=>o[0]===a[s.field]);
 if (index===4) return times.includes(a.time)&&zones.includes(a.zone);
 return typeof a.name==='string'&&a.name.trim().length>=2&&a.name.length<=70&&typeof a.studio==='string'&&a.studio.trim().length>=2&&a.studio.length<=90;
}
function firstIncomplete() { for(let i=0;i<steps.length;i++) if(!valid(i))return i;return steps.length; }
function path(index) { return root+'?paso='+(index===6?'tu-plan':steps[index].slug)+(state.template?'&plantilla='+state.template:''); }
function move(index,replace=false) {
 index=Math.min(Math.max(0,index),firstIncomplete());
 history[replace?'replaceState':'pushState']({step:index},'',path(index));
 render(index,true);
}
function storedValue(field) { return typeof state.answers[field]==='string'?state.answers[field]:''; }
function inputField(label,field,max,placeholder,auto) {
 const wrapper=document.createElement('label');wrapper.className='field';wrapper.append(document.createTextNode(label));
 const input=document.createElement('input');input.name=field;input.required=true;input.minLength=2;input.maxLength=max;input.placeholder=placeholder;input.autocomplete=auto;input.value=storedValue(field);
 input.addEventListener('input',()=>{input.setCustomValidity('');state.answers[field]=input.value;save();});
 input.addEventListener('blur',()=>{input.value=input.value.trim();state.answers[field]=input.value;save();});
 wrapper.append(input);return wrapper;
}
function selectField(label,field,options) {
 const wrapper=document.createElement('label');wrapper.className='field';wrapper.append(document.createTextNode(label));
 const select=document.createElement('select');select.name=field;select.required=true;
 const empty=new Option('Selecciona una opción','');empty.disabled=true;select.add(empty);
 options.forEach(option=>select.add(new Option(option,option)));
 select.value=storedValue(field);
 select.addEventListener('change',()=>{state.answers[field]=select.value;save();});
 wrapper.append(select);return wrapper;
}
function recommendation(a) {
 if(a.budget==='Prefiero definirlo en la plática'||a.stage==='Aún no lo tengo claro')
  return {name:'Primero, una revisión juntos.',reason:'Nos falta definir el alcance. Revisaremos tu presencia actual y tu prioridad antes de recomendarte un paquete.',price:'Plática inicial gratuita',route:['Revisar','Priorizar','Definir alcance']};
 if(a.stage==='Web y reservas funcionando'&&a.goal==='Atraer nuevas alumnas')
  return {name:'Crecimiento Continuo',reason:'Ya cuentas con web y reservas. Tu prioridad es atraer alumnas, así que el siguiente paso puede ser contenido, publicidad y seguimiento.',price:'Referencia: $7,500 MXN / mes',route:['Contenido','Captación','Seguimiento']};
 return {name:'Lanzamiento Digital',reason:a.stage==='Web y reservas funcionando'?'Tu prioridad es mejorar la experiencia actual. Primero revisaremos qué conviene rediseñar o conectar, sin sustituir lo que ya funciona.':'Conviene empezar con una presencia digital coherente y un camino claro hacia la reserva. Después podemos valorar publicidad y contenido mensual.',price:'Referencia: $9,900 MXN · pago único',route:['Diseño','Reservas','Lanzamiento']};
}
function render(index,focus) {
 const final=index===6,s=final?steps[5]:steps[index];
 document.title=(final?'Tu plan inicial':s.title)+' · NorthPeak';
 document.getElementById('chapter').textContent=final?'07 / TU SIGUIENTE ETAPA':String(index+1).padStart(2,'0')+' / '+s.chapter;
 document.getElementById('story-quote').innerHTML=final?'Tu próximo capítulo.<br><em>Ya tiene un comienzo.</em>':s.quote;
 document.getElementById('story-image').src='/pilates/spgg/'+s.image;
 document.getElementById('progress-label').textContent=final?'Tu plan inicial':'Paso '+(index+1)+' de 6';
 document.getElementById('progress-fill').style.width=(index/6*100)+'%';
 document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',String(index));
 screen.replaceChildren();
 const section=document.createElement('div');section.className='step';screen.append(section);
 const title=document.createElement('h1');title.tabIndex=-1;title.textContent=final?'Tu estudio. Tu siguiente paso.':s.title;section.append(title);
 if(state.template){const chosen=document.createElement('p');chosen.className='note';chosen.textContent='Diseño que te interesa: '+templateNames[state.template];section.append(chosen);}
 if(final){renderSummary(section);}
 else{
  const intro=document.createElement('p');intro.className='intro';intro.textContent=s.intro;section.append(intro);
  const form=document.createElement('form');section.append(form);
  if(s.options){
   const fieldset=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent=s.title;fieldset.append(legend);const choices=document.createElement('div');choices.className='choices';
   s.options.forEach(([label,description])=>{
    const wrapper=document.createElement('label');wrapper.className='choice';
    const input=document.createElement('input');input.type='radio';input.name=s.field;input.value=label;input.required=true;input.checked=storedValue(s.field)===label;
    input.addEventListener('change',()=>{state.answers[s.field]=label;save();});
    const text=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=label;small.textContent=description;text.append(strong,small);wrapper.append(input,text);choices.append(wrapper);
   });fieldset.append(choices);form.append(fieldset);
  }else if(index===4){
    form.append(selectField('¿Cuándo quieres empezar?','time',times),selectField('¿Dónde está tu estudio?','zone',zones));
  }else{
    form.append(inputField('Tu nombre','name',70,'¿Cómo te llamas?','given-name'),inputField('Nombre de tu estudio','studio',90,'Si aún no tiene nombre, escribe “En apertura”','organization'));
  }
  const controls=document.createElement('div');controls.className='controls';
  const back=document.createElement('button');back.type='button';back.className='back';back.textContent='← Atrás';back.disabled=index===0;back.addEventListener('click',()=>move(index-1));
  const next=document.createElement('button');next.type='submit';next.className='primary';next.textContent=index===5?'Ver mi plan inicial →':'Continuar →';controls.append(back,next);form.append(controls);
  form.addEventListener('submit',event=>{
   event.preventDefault();
   if(index===5){
    for(const field of ['name','studio']){
     const input=form.elements.namedItem(field);
     input.value=input.value.trim();state.answers[field]=input.value;
     input.setCustomValidity(input.value.length<2?'Escribe al menos dos caracteres, sin contar espacios.':'');
    }
    if(!form.reportValidity())return;
   }
   save();move(index+1);
  });
 }
 if(focus){title.focus({preventScroll:true});window.scrollTo({top:matchMedia('(max-width:700px)').matches?Math.max(0,document.querySelector('.workspace').offsetTop-18):0,behavior:'instant'});}
}
function renderSummary(section){
 const a=state.answers,rec=recommendation(a);
 const intro=document.createElement('p');intro.className='intro';intro.textContent=a.name+', este es un punto de partida para '+a.studio+'. Lo afinaremos contigo en una plática.';section.append(intro);
 const card=document.createElement('div');card.className='recommendation';card.innerHTML='<span class="eyebrow">Recomendación inicial · Según tus respuestas</span><h2></h2><p class="reason"></p><p class="price"></p><div class="route-map"></div>';
 card.querySelector('h2').textContent=rec.name;card.querySelector('.reason').textContent=rec.reason;card.querySelector('.price').textContent=rec.price;
 rec.route.forEach(label=>{const span=document.createElement('span');span.textContent=label;card.querySelector('.route-map').append(span);});section.append(card);
 const pairs=[['Estudio',a.studio],['Disciplina',a.type],['Situación',a.stage],['Prioridad',a.goal],['Inversión',a.budget],['Inicio',a.time],['Ubicación',a.zone]];
 if(state.template)pairs.unshift(['Plantilla',templateNames[state.template]]);
 const dl=document.createElement('dl');dl.className='summary';
 pairs.forEach(([key,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;row.append(dt,dd);dl.append(row);});section.append(dl);
 const note=document.createElement('p');note.className='note';note.textContent='Orientación inicial, no cotización definitiva. Revisaremos alcance, impuestos, anuncios y licencias. '+(a.zone!=='San Pedro Garza García'?'Confirmaremos la cobertura en tu ubicación. ':'')+'Todavía no has reservado una cita.';section.append(note);
 const message=['Hola NorthPeak, soy '+a.name+'. Me gustaría una plática para mi estudio.',...pairs.map(([k,v])=>k+': '+v),'Plan sugerido: '+rec.name,'Interés de entrada: '+state.origin,'¿Podemos acordar un horario para conversar?'].join('\n');
 const review=document.createElement('details');review.className='review-message';const sum=document.createElement('summary');sum.textContent='Revisar el mensaje que compartiré';const pre=document.createElement('pre');pre.className='summary-message';pre.textContent=message;review.append(sum,pre);section.append(review);
 const share=document.createElement('form');share.action='https://wa.me/528121980008';share.method='get';share.target='_blank';share.rel='noopener noreferrer';
 const hidden=document.createElement('input');hidden.type='hidden';hidden.name='text';hidden.value=message;share.append(hidden);
 const consent=document.createElement('label');consent.className='consent';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.required=true;consent.append(checkbox,document.createTextNode('Quiero compartir estas respuestas con NorthPeak por WhatsApp para conversar sobre mi estudio.'));share.append(consent);
 const actions=document.createElement('div');actions.className='final-actions';const send=document.createElement('button');send.type='submit';send.className='primary';send.textContent='Llevar mi plan a WhatsApp ↗';actions.append(send);share.append(actions);section.append(share);
 const explain=document.createElement('p');explain.className='note';explain.textContent='Se abrirá WhatsApp con tu resumen. Tú revisas y envías el mensaje; el horario se acuerda en la conversación.';section.append(explain);
 const secondary=document.createElement('div');secondary.className='secondary-row';
 const edit=document.createElement('button');edit.type='button';edit.className='edit';edit.textContent='← Revisar mis respuestas';edit.addEventListener('click',()=>move(0));
 const copy=document.createElement('button');copy.type='button';copy.className='copy';copy.textContent='Copiar mi resumen';
 const status=document.createElement('p');status.className='status';status.setAttribute('aria-live','polite');
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(message);status.textContent='Resumen copiado.';}catch{review.open=true;status.textContent='Puedes seleccionar y copiar el texto del mensaje de arriba.';}});
 secondary.append(edit,copy);section.append(secondary,status);
 const restart=document.createElement('button');restart.type='button';restart.className='restart';restart.textContent='Borrar respuestas y empezar de nuevo';restart.addEventListener('click',()=>{state.answers={};try{sessionStorage.removeItem(key);}catch{}move(0,true);});section.append(restart);
}
function route(){
 const slug=new URLSearchParams(location.search).get('paso');
 let index=slug==='tu-plan'?6:steps.findIndex(s=>s.slug===slug);
 if(index<0) index=0;
 const safe=Math.min(index,firstIncomplete());
 if(safe!==index||!slug)history.replaceState({step:safe},'',path(safe));
 render(safe,false);
}
window.addEventListener('popstate',route);
save();route();
})();
