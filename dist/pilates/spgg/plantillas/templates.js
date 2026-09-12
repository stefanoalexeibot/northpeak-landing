(() => {
  const form=document.getElementById('reservation-demo');
  const result=document.getElementById('reservation-result');
  const context=document.getElementById('selection-context');
  let chosenPlan='';
  document.querySelectorAll('[data-class]').forEach(link=>link.addEventListener('click',()=>{
    form.elements.namedItem('class').value=link.dataset.class;
    result.textContent='Selecciona un día y un horario para probar la reserva.';
  }));
  document.querySelectorAll('[data-plan]').forEach(link=>link.addEventListener('click',()=>{
    chosenPlan=link.dataset.plan;context.textContent='Plan de ejemplo seleccionado: '+chosenPlan;
    result.textContent='Selecciona tu clase y prueba el recorrido.';
  }));
  form.addEventListener('change',()=>{result.textContent='Todos los horarios son ficticios; esta demo no realiza reservas.';});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(form);
    result.textContent='Tu ejemplo: '+data.get('class')+', '+data.get('day')+' a las '+data.get('time')+(chosenPlan?' · '+chosenPlan:'')+'. Así se presentaría la confirmación. No se ha reservado ninguna clase ni realizado un cobro.';
  });
})();
