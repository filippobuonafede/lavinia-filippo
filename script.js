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

// ---------- RSVP form (Netlify AJAX submit) ----------
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
