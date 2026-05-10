// Scroll progress bar
const bar = document.getElementById('scroll-bar');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });

// Navbar scroll state
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.10 });
document.querySelectorAll('.reveal, .stat-item, .feature-card, .loc-card, .section-label, .section-h2').forEach(el => observer.observe(el));

// Window flicker effect
setInterval(() => {
  const wins = document.querySelectorAll('.ci-win.lit');
  if (wins.length > 0) {
    const pick = wins[Math.floor(Math.random() * wins.length)];
    pick.style.opacity = '0.3';
    setTimeout(() => pick.style.opacity = '1', 120);
  }
}, 2800);