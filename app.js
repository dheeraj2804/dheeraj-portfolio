const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

document.getElementById('year').textContent = new Date().getFullYear();

const themeButton = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const themeIcon = document.querySelector('.theme-icon');
const themeModes = ['auto', 'light', 'dark'];
const themeIcons = { auto: '◐', light: '☀', dark: '☾' };
let themeMode = localStorage.getItem('portfolio-theme') || 'auto';
if (!themeModes.includes(themeMode)) themeMode = 'auto';
const applyTheme = () => {
  if (themeMode === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = themeMode;
  const label = themeMode[0].toUpperCase() + themeMode.slice(1);
  themeLabel.textContent = label;
  themeIcon.textContent = themeIcons[themeMode];
  themeButton.title = `Theme: ${label}`;
  themeButton.setAttribute('aria-label', `Color theme: ${label}. Activate to change.`);
};
applyTheme();
themeButton.addEventListener('click', () => {
  themeMode = themeModes[(themeModes.indexOf(themeMode) + 1) % themeModes.length];
  localStorage.setItem('portfolio-theme', themeMode);
  applyTheme();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

const splitCopy = document.querySelector('[data-split]');
if (splitCopy) {
  splitCopy.innerHTML = splitCopy.textContent.trim().split(/\s+/).map((word) => `<span class="word">${word}</span>`).join(' ');
}

const roles = [
  'Full-Stack Engineer.',
  'Applied AI Engineer.',
  'Machine Learning Engineer.',
  'Data Engineer.',
  'Data Scientist.',
  'Software Engineer.',
];
const roleText = document.getElementById('role-text');
let roleIndex = 0;
if (!reduceMotion && roleText) {
  setInterval(() => {
    roleText.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-14px)' },
    ], { duration: 260, easing: 'ease-in', fill: 'forwards' }).finished.then(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleText.textContent = roles[roleIndex];
      roleText.animate([
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    });
  }, 2700);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const duration = reduceMotion ? 1 : 1600;
    const start = performance.now();
    const format = (value) => {
      if (target >= 1000000) return `${(value / 1000000).toFixed(value < target ? 1 : 0)}M`;
      if (target >= 1000) return `${Math.round(value / 1000)}K`;
      return Math.round(value).toString();
    };
    const tick = (time) => {
      const progress = clamp((time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.7 });
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

const tiltTargets = document.querySelectorAll('[data-tilt]');
if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
  tiltTargets.forEach((card) => {
    let rx = 0;
    let ry = 0;
    let currentX = 0;
    let currentY = 0;
    const render = () => {
      currentX = lerp(currentX, rx, 0.08);
      currentY = lerp(currentY, ry, 0.08);
      card.style.transform = `perspective(1100px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
      requestAnimationFrame(render);
    };
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      rx = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      ry = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    });
    card.addEventListener('pointerleave', () => {
      rx = 0;
      ry = 0;
    });
    render();
  });
}

document.querySelectorAll('.magnetic').forEach((item) => {
  if (reduceMotion || !matchMedia('(pointer:fine)').matches) return;
  item.addEventListener('pointermove', (event) => {
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });
  item.addEventListener('pointerleave', () => {
    item.style.transform = '';
  });
});

document.querySelectorAll('.skill-filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.skill-filter').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.skill-card').forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('filtered-out', !show);
    });
  });
});

document.getElementById('contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get('name');
  const email = data.get('email');
  const subject = encodeURIComponent(data.get('subject'));
  const message = encodeURIComponent(`Hi Dheeraj,\n\n${data.get('message')}\n\nBest,\n${name}\n${email}`);
  window.location.href = `mailto:dheerajarjula@gmail.com?subject=${subject}&body=${message}`;
});

const projectRail = document.querySelector('[data-project-rail]');
const railProgress = document.querySelector('.rail-progress span');
if (projectRail && railProgress) {
  projectRail.addEventListener('scroll', () => {
    const max = projectRail.scrollWidth - projectRail.clientWidth;
    railProgress.style.transform = `scaleX(${max ? projectRail.scrollLeft / max : 0})`;
  }, { passive: true });
}

let ticking = false;
const updateScrollScene = () => {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - innerHeight;
  const scrollProgress = document.querySelector('.scroll-progress span');
  if (scrollProgress) {
    scrollProgress.style.transform = `scaleX(${documentHeight ? scrollTop / documentHeight : 0})`;
  }

  if (!reduceMotion) {
    const hero = document.querySelector('.hero');
    const heroTitle = document.querySelector('.hero-title');
    const heroOrbit = document.querySelector('.hero-orbit');
    const heroBottom = document.querySelector('.hero-bottom');
    if (hero && heroTitle && heroOrbit && heroBottom) {
      const heroRect = hero.getBoundingClientRect();
      const heroProgress = clamp(-heroRect.top / Math.max(1, hero.offsetHeight - innerHeight));
      heroTitle.style.transform = `translateY(${-heroProgress * 46}px) scale(${1 - heroProgress * 0.08})`;
      heroTitle.style.opacity = `${1 - heroProgress * 0.68}`;
      heroOrbit.style.transform = `translateY(-43%) rotate(${heroProgress * 95}deg) scale(${1 + heroProgress * 0.1})`;
      heroBottom.style.transform = `translateY(${heroProgress * 30}px)`;
    }

    if (splitCopy) {
      const rect = splitCopy.getBoundingClientRect();
      const progress = clamp(1 - (rect.top + rect.height * 0.25) / (innerHeight * 0.88));
      const words = splitCopy.querySelectorAll('.word');
      words.forEach((word, index) => {
        word.classList.toggle('active', index / Math.max(1, words.length - 1) < progress);
      });
    }
  }
  ticking = false;
};

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollScene);
    ticking = true;
  }
}, { passive: true });
updateScrollScene();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});
