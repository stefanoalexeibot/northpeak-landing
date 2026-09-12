(() => {
  const form=document.getElementById('reservation-demo');
  const result=document.getElementById('reservation-result');
  const context=document.getElementById('selection-context');
  let chosenPlan='';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
  let frame=0;
  const updateScroll=()=>{frame=0;const distance=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(distance>0?scrollY/distance:0)+')';document.querySelector('.site-header').classList.toggle('scrolled',scrollY>40);};
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateScroll);},{passive:true});updateScroll();
  const motionButton=document.createElement('button');motionButton.type='button';motionButton.className='motion-toggle';motionButton.textContent='Pausar efectos';motionButton.setAttribute('aria-pressed','false');document.querySelector('.hero-copy').append(motionButton);
  motionButton.addEventListener('click',()=>{const paused=document.body.classList.toggle('effects-paused');motionButton.setAttribute('aria-pressed',String(paused));motionButton.textContent=paused?'Activar efectos':'Pausar efectos';});
  const ornament=document.createElement('div');ornament.className='sculpture';ornament.setAttribute('aria-hidden','true');ornament.innerHTML='<i></i><i></i><i></i>';document.querySelector('.template-hero').append(ornament);
  const caption=document.createElement('div');caption.className='floating-note';caption.setAttribute('aria-hidden','true');caption.innerHTML=document.body.classList.contains('forma')?'<b>01 / MOVE</b><span>Tu energía.<br>Tu siguiente nivel.</span>':document.body.classList.contains('alma')?'<b>UNA PAUSA PARA TI</b><span>Inhala calma.<br>Exhala despacio.</span>':'<b>EL ARTE DE MOVERTE</b><span>Más presencia.<br>En cada movimiento.</span>';document.querySelector('.hero-layout').append(caption);
  document.querySelectorAll('.plan,.class-card,.story figure').forEach(card=>{
    card.classList.add('depth-card');
    card.addEventListener('pointermove',event=>{if(motion.matches||!fine.matches)return;const box=card.getBoundingClientRect();const x=(event.clientX-box.left)/box.width,y=(event.clientY-box.top)/box.height;card.style.setProperty('--rx',((.5-y)*5)+'deg');card.style.setProperty('--ry',((x-.5)*6)+'deg');card.style.setProperty('--light-x',(x*100)+'%');card.style.setProperty('--light-y',(y*100)+'%');});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
  });
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('arrived');observer.unobserve(entry.target);} }),{threshold:.12});
    document.querySelectorAll('.reveal').forEach((item,index)=>{item.classList.add('entrance');item.style.setProperty('--delay',(index%3)*70+'ms');observer.observe(item);});
    const sections=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('.site-nav a').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}),{rootMargin:'-20% 0px -50% 0px'});document.querySelectorAll('section[id]').forEach(section=>sections.observe(section));
  }
  const timeSelect=form.elements.namedItem('time');
  const slots=document.createElement('fieldset');slots.className='time-slots';const legend=document.createElement('legend');legend.textContent='Elige tu horario de ejemplo';slots.append(legend);
  [...timeSelect.options].forEach(option=>{const button=document.createElement('button');button.type='button';button.textContent=option.text;button.dataset.time=option.value;button.setAttribute('aria-pressed',String(option.selected));button.addEventListener('click',()=>{timeSelect.value=option.value;timeSelect.dispatchEvent(new Event('change',{bubbles:true}));});slots.append(button);});
  timeSelect.closest('label').hidden=true;form.querySelector('.row').after(slots);
  const ticket=document.createElement('div');ticket.className='reservation-ticket';ticket.setAttribute('aria-hidden','true');form.querySelector('button[type="submit"]').before(ticket);
  const refresh=()=>{slots.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.time===timeSelect.value)));ticket.textContent=form.elements.namedItem('class').value+' · '+form.elements.namedItem('day').value+' · '+timeSelect.value;form.classList.remove('confirmed');};form.addEventListener('change',refresh);refresh();
  document.querySelectorAll('[data-class]').forEach(link=>link.addEventListener('click',()=>{
    form.elements.namedItem('class').value=link.dataset.class;
    refresh();
    result.textContent='Selecciona un día y un horario para probar la reserva.';
  }));
  document.querySelectorAll('[data-plan]').forEach(link=>link.addEventListener('click',()=>{
    chosenPlan=link.dataset.plan;context.textContent='Plan de ejemplo seleccionado: '+chosenPlan;
    document.querySelectorAll('.plan').forEach(card=>card.classList.toggle('selected-plan',card.contains(link)));refresh();
    result.textContent='Selecciona tu clase y prueba el recorrido.';
  }));
  form.addEventListener('change',()=>{result.textContent='Todos los horarios son ficticios; esta demo no realiza reservas.';});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(form);
    form.classList.add('confirmed');
    result.textContent='Tu ejemplo: '+data.get('class')+', '+data.get('day')+' a las '+data.get('time')+(chosenPlan?' · '+chosenPlan:'')+'. Así se presentaría la confirmación. No se ha reservado ninguna clase ni realizado un cobro.';
  });
})();
