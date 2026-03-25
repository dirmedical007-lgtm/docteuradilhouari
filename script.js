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

  // contact form — Web3Forms (https://web3forms.com)
  const form = document.getElementById('contactForm');

  function clean(v){ return String(v||'').trim(); }
  function wrap(el){ return el ? el.closest('.field') : null; }
  function setInvalid(el, bad){
    const w = wrap(el);
    if (!w) return;
    w.classList.toggle('invalid', !!bad);
  }

  if (form){
    const submitBtn = document.getElementById('submitBtn');
    const formResult = document.getElementById('formResult');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name');
      const phone = document.getElementById('phone');
      const reason = document.getElementById('reason');
      const message = document.getElementById('message');

      const checks = [
        [name, !clean(name && name.value)],
        [phone, !clean(phone && phone.value)],
        [reason, !clean(reason && reason.value)],
        [message, !clean(message && message.value)]
      ];

      let bad = false;
      checks.forEach(([el, isBad]) => {
        setInvalid(el, isBad);
        if (isBad) bad = true;
      });

      if (bad) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours\u2026';
      formResult.className = 'form-result';
      formResult.textContent = '';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form)
        });
        const json = await res.json();

        if (json.success) {
          formResult.className = 'form-result form-result--ok';
          formResult.textContent = 'Message envoy\u00e9 ! Nous vous r\u00e9pondrons dans les plus brefs d\u00e9lais.';
          form.reset();
        } else {
          throw new Error(json.message || 'Erreur');
        }
      } catch {
        formResult.className = 'form-result form-result--err';
        formResult.textContent = 'Une erreur est survenue. Veuillez appeler le +212\u00a07\u00a017\u00a017\u00a030\u00a088 ou envoyer un email \u00e0 dradil.houari@gmail.com.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer le message';
      }
    });

    ['name','phone','reason','message'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => setInvalid(el, false));
      el.addEventListener('change', () => setInvalid(el, false));
    });
  }
})();
