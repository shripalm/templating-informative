const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const revealItems = document.querySelectorAll('.reveal');
const accordionTriggers = document.querySelectorAll('.accordion-trigger');
const testimonialDots = document.querySelectorAll('.testimonial .dot');
const testimonialText = document.getElementById('testimonialText');
const testimonialName = document.getElementById('testimonialName');
const heroBg = document.querySelector('.hero-bg');
const heroBgLayers = heroBg ? Array.from(heroBg.querySelectorAll('.hero-bg-layer')) : [];
const miniCards = document.querySelectorAll('.mini-card');
const newsletter = document.querySelector('.newsletter');
const audioToggle = document.getElementById('audioToggle');
const cursorReactiveElements = document.querySelectorAll(
  '.service-card, .team-card, .blog-card, .portfolio-item, .mini-card, .testimonial-media, .faq-aside, .about-collage, .about-collage img'
);

let backgroundAudio;
let ambientRunning = false;
let ambientUserStopped = false;

const testimonials = [
  {
    text: 'The team captured our wedding with cinematic precision. Every frame feels emotional, elegant, and timeless.',
    name: 'Jessica & Ryan'
  },
  {
    text: 'Our brand campaign looked premium across every channel. The direction, lighting, and edits were world-class.',
    name: 'Ariana, Creative Director'
  },
  {
    text: 'From pre-production to final delivery, SnapLense made the whole process smooth, creative, and highly professional.',
    name: 'Daniel, Travel Producer'
  }
];

function toggleNavbarState() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
}

function setAudioToggleState(isOn) {
  if (!audioToggle) {
    return;
  }

  audioToggle.classList.toggle('is-on', isOn);
  audioToggle.setAttribute('aria-pressed', String(isOn));
  audioToggle.setAttribute('aria-label', isOn ? 'Turn background sound off' : 'Turn background sound on');
  audioToggle.textContent = isOn ? 'Sound On' : 'Sound Off';
}

function createBackgroundAudio() {
  if (backgroundAudio) {
    return;
  }

  backgroundAudio = new Audio('assets/bgm.mp3');
  backgroundAudio.loop = true;
  backgroundAudio.preload = 'auto';
  backgroundAudio.volume = 0.22;
}

async function startAmbientSound() {
  createBackgroundAudio();
  if (!backgroundAudio) {
    return;
  }

  await backgroundAudio.play();
  ambientRunning = true;
  ambientUserStopped = false;
  setAudioToggleState(true);
}

function stopAmbientSound() {
  if (!backgroundAudio) {
    ambientRunning = false;
    setAudioToggleState(false);
    return;
  }

  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;
  ambientRunning = false;
  setAudioToggleState(false);
}

function attachAmbientFallbackStart() {
  const startOnInteraction = () => {
    if (!ambientRunning && !ambientUserStopped) {
      startAmbientSound().catch(() => {
        setAudioToggleState(false);
      });
    }

    window.removeEventListener('pointerdown', startOnInteraction);
    window.removeEventListener('keydown', startOnInteraction);
    window.removeEventListener('touchstart', startOnInteraction);
  };

  window.addEventListener('pointerdown', startOnInteraction, { once: true });
  window.addEventListener('keydown', startOnInteraction, { once: true });
  window.addEventListener('touchstart', startOnInteraction, { once: true, passive: true });
}

if (audioToggle) {
  setAudioToggleState(false);

  audioToggle.addEventListener('click', () => {
    if (ambientRunning) {
      ambientUserStopped = true;
      stopAmbientSound();
      return;
    }

    startAmbientSound().catch(() => {
      setAudioToggleState(false);
    });
  });

  startAmbientSound().catch(() => {
    setAudioToggleState(false);
  });
  attachAmbientFallbackStart();
}

function updateCursorMotion(element, event) {
  const rect = element.getBoundingClientRect();
  const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
  const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
  const normalizedX = Math.max(0, Math.min(100, pointerX));
  const normalizedY = Math.max(0, Math.min(100, pointerY));
  const tiltX = ((normalizedX - 50) / 50) * 7;
  const tiltY = ((50 - normalizedY) / 50) * 7;
  const liftX = ((normalizedX - 50) / 50) * 6;
  const liftY = ((normalizedY - 50) / 50) * 6;

  element.style.setProperty('--cursor-x', `${normalizedX.toFixed(2)}%`);
  element.style.setProperty('--cursor-y', `${normalizedY.toFixed(2)}%`);
  element.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
  element.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
  element.style.setProperty('--lift-x', `${liftX.toFixed(2)}px`);
  element.style.setProperty('--lift-y', `${liftY.toFixed(2)}px`);
}

function resetCursorMotion(element) {
  element.style.setProperty('--cursor-x', '50%');
  element.style.setProperty('--cursor-y', '50%');
  element.style.setProperty('--tilt-x', '0deg');
  element.style.setProperty('--tilt-y', '0deg');
  element.style.setProperty('--lift-x', '0px');
  element.style.setProperty('--lift-y', '0px');
}

cursorReactiveElements.forEach((element) => {
  resetCursorMotion(element);

  element.addEventListener('pointermove', (event) => {
    updateCursorMotion(element, event);
  });

  element.addEventListener('pointerenter', (event) => {
    updateCursorMotion(element, event);
  });

  element.addEventListener('pointerleave', () => {
    resetCursorMotion(element);
  });
});

window.addEventListener('scroll', toggleNavbarState);
toggleNavbarState();

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

navMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`);
  revealObserver.observe(item);
});

accordionTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    accordionTriggers.forEach((other) => {
      const panel = other.closest('.accordion-item').querySelector('.accordion-panel');
      const isCurrent = other === trigger;
      other.setAttribute('aria-expanded', String(isCurrent));
      panel.classList.toggle('open', isCurrent);
    });
  });
});

function setActiveTestimonial(index) {
  testimonialText.textContent = testimonials[index].text;
  testimonialName.textContent = testimonials[index].name;

  testimonialDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
  });
}

testimonialDots.forEach((dot, index) => {
  dot.addEventListener('click', () => setActiveTestimonial(index));
});

let testimonialIndex = 0;
setInterval(() => {
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  setActiveTestimonial(testimonialIndex);
}, 5000);

const heroImages = Array.from(miniCards).map((card) => card.dataset.heroBg || card.querySelector('img')?.src).filter(Boolean);
let heroIndex = 0;
let heroTimer;
let activeHeroLayer = 0;

function setHeroBackground(index) {
  if (!heroBg || heroImages.length === 0) {
    return;
  }

  heroIndex = (index + heroImages.length) % heroImages.length;

  miniCards.forEach((card, cardIndex) => {
    card.classList.toggle('active', cardIndex === heroIndex);
  });

  if (heroBgLayers.length < 2) {
    return;
  }

  const nextLayer = (activeHeroLayer + 1) % heroBgLayers.length;
  heroBgLayers[nextLayer].style.backgroundImage = `url("${heroImages[heroIndex]}")`;
  heroBgLayers[nextLayer].classList.add('is-active');
  heroBgLayers[activeHeroLayer].classList.remove('is-active');
  activeHeroLayer = nextLayer;
}

function stopHeroAutoplay() {
  if (heroTimer) {
    clearInterval(heroTimer);
    heroTimer = undefined;
  }
}

function startHeroAutoplay() {
  stopHeroAutoplay();

  if (heroImages.length < 2) {
    return;
  }

  heroTimer = setInterval(() => {
    setHeroBackground(heroIndex + 1);
  }, 3500);
}

miniCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    setHeroBackground(index);
    startHeroAutoplay();
  });

  card.addEventListener('keydown', (event) => {
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    if (isActivationKey) {
      event.preventDefault();
      setHeroBackground(index);
      startHeroAutoplay();
    }
  });
});

if (heroImages.length > 0) {
  if (heroBgLayers[0]) {
    heroBgLayers[0].style.backgroundImage = `url("${heroImages[0]}")`;
  }
  setHeroBackground(0);
}

startHeroAutoplay();

if (newsletter) {
  newsletter.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = newsletter.querySelector('input[type="email"]');
    input.value = '';
    input.placeholder = 'Subscribed successfully';
  });
}
