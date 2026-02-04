/* script.js — ultra light
   - mobile menu (a11y)
   - mailto contact (no backend)
*/

(function(){
  const nav = document.getElementById('nav');
  const btn = document.querySelector('.navbtn');
  const year = document.getElementById('year');

  if (year) year.textContent = String(new Date().getFullYear());

  function setOpen(open){
    if (!nav || !btn) return;
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (btn && nav){
    btn.addEventListener('click', () => {
      const open = nav.classList.contains('is-open');
      setOpen(!open);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });

    nav.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.tagName === 'A') setOpen(false);
    });

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (btn.contains(target) || nav.contains(target)) return;
      setOpen(false);
    });
  }

  // mailto form
  const form = document.getElementById('contactForm');
  const EMAIL = 'dradil.houari@gmail.com';

  function clean(v){ return String(v||'').trim(); }
  function wrap(el){ return el ? el.closest('.field') : null; }
  function setInvalid(el, bad){
    const w = wrap(el);
    if (!w) return;
    w.classList.toggle('invalid', !!bad);
  }

  function buildMailto(data){
    const subject = `Contact – Cabinet Médical Dr Houari Adil – ${data.reason || 'Demande'}`;
    const body = [
      'Bonjour Dr Houari Adil,',
      '',
      'Je vous contacte via le site du cabinet.',
      '',
      `Nom : ${data.name}`,
      `Téléphone : ${data.phone}`,
      `Motif : ${data.reason}`,
      '',
      'Message :',
      data.message,
      '',
      '—',
      'Cabinet Médical Dr Houari Adil',
      'Bouskoura & Ville Verte, Casablanca, Maroc'
    ].join('\n');

    const params = new URLSearchParams({ subject, body });
    return `mailto:${EMAIL}?${params.toString()}`;
  }

  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name');
      const phone = document.getElementById('phone');
      const reason = document.getElementById('reason');
      const message = document.getElementById('message');

      const data = {
        name: clean(name && name.value),
        phone: clean(phone && phone.value),
        reason: clean(reason && reason.value),
        message: clean(message && message.value)
      };

      const checks = [
        [name, !data.name],
        [phone, !data.phone],
        [reason, !data.reason],
        [message, !data.message]
      ];

      let bad = false;
      checks.forEach(([el, isBad]) => {
        setInvalid(el, isBad);
        if (isBad) bad = true;
      });

      if (bad) return;

      window.location.href = buildMailto(data);
    });

    ['name','phone','reason','message'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => setInvalid(el, false));
      el.addEventListener('change', () => setInvalid(el, false));
    });
  }
})();
