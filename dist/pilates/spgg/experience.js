(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function tilt(element, xName, yName, strength) {
    element.addEventListener('pointermove', event => {
      if (reduced.matches || event.pointerType !== 'mouse' || !matchMedia('(min-width: 801px)').matches) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(xName, ((event.clientX - rect.left) / rect.width - .5) * strength + 'deg');
      element.style.setProperty(yName, -((event.clientY - rect.top) / rect.height - .5) * strength + 'deg');
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty(xName, '0deg');
      element.style.setProperty(yName, '0deg');
    });
  }
  tilt(document.querySelector('.hero-art'), '--tilt-x', '--tilt-y', 5);
  tilt(document.querySelector('.desktop-demo'), '--device-x', '--device-y', 4);
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activate(tab, focus) {
    tabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activate(tabs[next], true); }
    });
  });
  const booking = document.getElementById('booking-demo');
  booking.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(booking);
    document.getElementById('booking-feedback').textContent =
      'Así se vería tu confirmación: ' + fields.get('class') + ', ' + fields.get('day') + ' a las ' + fields.get('time') + '. Es una simulación; no se reservó ninguna clase.';
  });
  booking.addEventListener('change', () => { document.getElementById('booking-feedback').textContent = 'Elige una combinación y prueba la confirmación.'; });
  const mobile = document.querySelector('.mobile-contact');
  let heroVisible = true, finalVisible = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.classList.contains('hero')) heroVisible = entry.isIntersecting;
      else finalVisible = entry.isIntersecting;
    });
    mobile.hidden = heroVisible || finalVisible;
  });
  observer.observe(document.querySelector('.hero'));
  observer.observe(document.querySelector('.final-cta'));
  const navigation = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin:'-15% 0px -50% 0px'});
  navigation.forEach(link => sectionObserver.observe(document.querySelector(link.hash)));
})();
