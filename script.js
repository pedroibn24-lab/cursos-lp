const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbyfMYB8VCgN0pnnXIT4Xlugm9r62xdQcITJ39FZ0lzbuK_vYqkvpKDQXHfX1baqWhGENQ/exec";

(function(){
  const form = document.getElementById('leadForm');
  const card = document.getElementById('formCard');
  const btn  = document.getElementById('submitBtn');

  function sanitize(val){
    return String(val).trim()
      .replace(/[<>"'`]/g, '')
      .replace(/^[=+\-@\t\r]/g, '');
  }

  let lastSubmit = 0;
  const RATE_MS = 30000;

  // Máscara WhatsApp
  const wpp = document.getElementById('whatsapp');
  wpp.addEventListener('input', function(){
    let v = this.value.replace(/\D/g,'').slice(0,11);
    if(v.length > 6) this.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if(v.length > 2) this.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if(v.length > 0) this.value = `(${v}`;
    else this.value = '';
  });

  function validate(){
    let ok = true;

    // Campos de texto e select
    form.querySelectorAll('input[required]:not([type="radio"]):not([type="checkbox"]), select[required]').forEach(el=>{
      const field = el.closest('.field');
      let valid = el.value.trim() !== '';
      if(el.id === 'whatsapp') valid = valid && el.value.replace(/\D/g,'').length >= 10;
      field.classList.toggle('invalid', !valid);
      if(!valid) ok = false;
    });

    // Grupos de radio
    const groups = new Set();
    form.querySelectorAll('input[type="radio"][required]').forEach(el => groups.add(el.name));
    groups.forEach(name => {
      const first = form.querySelector(`input[name="${name}"]`);
      const field = first.closest('.field');
      const valid = form.querySelector(`input[name="${name}"]:checked`) !== null;
      field.classList.toggle('invalid', !valid);
      if(!valid) ok = false;
    });

    // Checkboxes
    form.querySelectorAll('input[type="checkbox"][required]').forEach(el => {
      const field = el.closest('.field');
      field.classList.toggle('invalid', !el.checked);
      if(!el.checked) ok = false;
    });

    return ok;
  }

  form.addEventListener('input', e => {
    const field = e.target.closest('.field');
    if(field && field.classList.contains('invalid')) validate();
  });
  form.addEventListener('change', e => {
    const field = e.target.closest('.field');
    if(field && field.classList.contains('invalid')) validate();
  });

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    // Honeypot anti-spam
    if(document.getElementById('hp_website')?.value) return;

    const now = Date.now();
    if(now - lastSubmit < RATE_MS) return;

    if(!validate()){
      form.querySelector('.field.invalid input, .field.invalid select')?.focus();
      return;
    }

    const raw = Object.fromEntries(new FormData(form).entries());
    const data = {};
    for(const key of Object.keys(raw)){
      if(key === 'website') continue;
      data[key] = sanitize(raw[key]);
    }
    data.dataHora = new Date().toLocaleString('pt-BR', {timeZone:'America/Sao_Paulo'});

    btn.disabled = true;
    lastSubmit = Date.now();
    const original = btn.textContent;
    btn.textContent = 'Enviando...';

    try{
      if(SHEET_ENDPOINT){
        await fetch(SHEET_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams(data).toString()
        });
      }
    }catch(err){
      console.warn('Falha ao enviar para a planilha:', err);
    }finally{
      card.classList.add('done');
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold: 0.08});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', function(){
      const expanded = this.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });
      if(!expanded){
        this.setAttribute('aria-expanded', 'true');
        this.nextElementSibling.classList.add('open');
      }
    });
  });
})();

// ── HAMBURGER MENU ──
(function(){
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if(!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ── MULTI-STEP FORM ──
(function(){
  const steps     = document.querySelectorAll('.form-step');
  const btnNext   = document.getElementById('btnNext');
  const btnBack   = document.getElementById('btnBack');
  const submitBtn = document.getElementById('submitBtn');
  const formCard  = document.getElementById('formCard');
  if(!steps.length || !btnNext) return;

  let current = 1;

  function showStep(n) {
    // Clear stale invalid marks from the incoming step before showing
    const incoming = document.querySelector(`.form-step[data-step="${n}"]`);
    incoming.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));

    steps.forEach(s => { s.hidden = parseInt(s.dataset.step) !== n; });

    document.querySelectorAll('.step-dot').forEach(d => {
      const sn = parseInt(d.dataset.step);
      d.classList.toggle('active', sn === n);
      d.classList.toggle('done',   sn < n);
    });

    btnBack.hidden   = n === 1;
    btnNext.hidden   = n === steps.length;
    submitBtn.hidden = n !== steps.length;
  }

  function validateStep(n) {
    const el = document.querySelector(`.form-step[data-step="${n}"]`);
    let ok = true;

    el.querySelectorAll('input[required]:not([type="radio"]):not([type="checkbox"]), select[required]').forEach(f => {
      const field = f.closest('.field');
      let v = f.value.trim() !== '';
      if(f.id === 'whatsapp') v = v && f.value.replace(/\D/g,'').length >= 10;
      field.classList.toggle('invalid', !v);
      if(!v) ok = false;
    });

    const groups = new Set();
    el.querySelectorAll('input[type="radio"][required]').forEach(r => groups.add(r.name));
    groups.forEach(name => {
      const first = el.querySelector(`input[name="${name}"]`);
      const field = first.closest('.field');
      const v = el.querySelector(`input[name="${name}"]:checked`) !== null;
      field.classList.toggle('invalid', !v);
      if(!v) ok = false;
    });

    el.querySelectorAll('input[type="checkbox"][required]').forEach(c => {
      const field = c.closest('.field');
      field.classList.toggle('invalid', !c.checked);
      if(!c.checked) ok = false;
    });

    return ok;
  }

  btnNext.addEventListener('click', () => {
    if(validateStep(current)) {
      current++;
      showStep(current);
      formCard.scrollIntoView({behavior:'smooth', block:'start'});
    } else {
      const first = document.querySelector(`.form-step[data-step="${current}"] .field.invalid`);
      if(first) first.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });

  btnBack.addEventListener('click', () => { current--; showStep(current); });
})();
