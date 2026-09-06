// ---------- Fullscreen menu ----------
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const menuOverlay = document.getElementById('menuOverlay');

function openMenu(){
  menuOverlay.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
}
function closeMenu(){
  menuOverlay.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
menuOverlay.querySelectorAll('.menu-item').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// ---------- Countdown ----------
const WEDDING_DATE = new Date('2027-07-10T11:00:00+02:00');
const countdownEl = document.getElementById('countdown');

if (countdownEl){
  function updateCountdown(){
    const now = new Date();
    const diffMs = WEDDING_DATE - now;
    if (diffMs <= 0){
      countdownEl.textContent = 'È il grande giorno.';
      return;
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    countdownEl.textContent = `Mancano ${days} giorni.`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000 * 60 * 60);
}

// ---------- Reveal on scroll ----------
const revealTargets = document.querySelectorAll('.page');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach(el => observer.observe(el));

// ---------- RSVP: URL dello script Google (risposte + elenco invitati) ----------
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw-GteY9jQIOVU2_gDypUOOVREa4jHeq9TFX-0uaG4xP2fXoNrML2QmB1qIxPSLKIze/exec';

// ---------- RSVP: autocompletamento nome invitato (elenco caricato dal foglio Google) ----------
const nomeInput = document.getElementById('nome');
const nomeList = document.getElementById('nomeList');

const DIACRITICS_RE = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

function normalizeText(s){
  return s.normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase().trim();
}

if (nomeInput && nomeList){
  let guestList = [];
  let activeIndex = -1;

  if (GOOGLE_SHEETS_URL){
    fetch(GOOGLE_SHEETS_URL)
      .then(res => res.json())
      .then(names => { guestList = Array.isArray(names) ? names : []; })
      .catch(() => { guestList = []; });
  }

  function renderMatches(matches){
    nomeList.innerHTML = '';
    activeIndex = -1;
    if (matches.length === 0){
      nomeList.hidden = true;
      return;
    }
    matches.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        nomeInput.value = name;
        nomeList.hidden = true;
      });
      nomeList.appendChild(li);
    });
    nomeList.hidden = false;
  }

  nomeInput.addEventListener('input', () => {
    const query = normalizeText(nomeInput.value);
    if (query.length === 0 || guestList.length === 0){
      nomeList.hidden = true;
      return;
    }
    const matches = guestList
      .filter(name => normalizeText(name).includes(query))
      .slice(0, 6);
    renderMatches(matches);
  });

  nomeInput.addEventListener('keydown', (e) => {
    const items = Array.from(nomeList.querySelectorAll('li'));
    if (nomeList.hidden || items.length === 0) return;

    if (e.key === 'ArrowDown'){
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp'){
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Enter'){
      if (activeIndex >= 0){
        e.preventDefault();
        nomeInput.value = items[activeIndex].textContent;
        nomeList.hidden = true;
      }
      return;
    } else if (e.key === 'Escape'){
      nomeList.hidden = true;
      return;
    } else {
      return;
    }
    items.forEach((li, i) => li.classList.toggle('is-active', i === activeIndex));
  });

  nomeInput.addEventListener('blur', () => {
    nomeList.hidden = true;
  });
}

// ---------- RSVP form (invio a Netlify e Google Sheets) ----------
const rsvpForm = document.getElementById('rsvpForm');
const rsvpThanks = document.getElementById('rsvpThanks');

function encodeForm(data){
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

if (rsvpForm){
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(rsvpForm);
    const payload = {};
    formData.forEach((value, key) => { payload[key] = value; });

    if (GOOGLE_SHEETS_URL){
      fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm(payload)
      }).catch(() => {});
    }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeForm(payload)
    })
      .then(() => {
        rsvpForm.reset();
        rsvpForm.hidden = true;
        rsvpThanks.hidden = false;
      })
      .catch(() => {
        rsvpForm.submit();
      });
  });
}
