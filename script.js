// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Countdown ----------
const WEDDING_DATE = new Date('2027-07-10T11:00:00+02:00');
const countdownEl = document.getElementById('countdown');

function updateCountdown(){
  const now = new Date();
  const diffMs = WEDDING_DATE - now;
  if (diffMs <= 0){
    countdownEl.textContent = 'È il grande giorno! ♡';
    return;
  }
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  countdownEl.textContent = `Mancano ${days} giorni al nostro giorno`;
}
updateCountdown();
setInterval(updateCountdown, 1000 * 60 * 60);

// ---------- Reveal on scroll ----------
const revealTargets = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));

// Trigger hero entrance once fonts/page are ready
window.addEventListener('load', () => {
  document.body.classList.add('is-loaded');
});

// ---------- RSVP form (Netlify AJAX submit) ----------
const rsvpForm = document.getElementById('rsvpForm');
const rsvpThanks = document.getElementById('rsvpThanks');

function encodeForm(data){
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

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
      // Fallback: let the browser do a normal submit if fetch fails
      rsvpForm.submit();
    });
});
