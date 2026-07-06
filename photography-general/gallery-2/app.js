const canvas = document.getElementById('portfolio-canvas');
const introScreen = document.getElementById('intro-screen');
const galleryScreen = document.getElementById('stack-stage');
const openGalleryButton = document.getElementById('hold-cta');
const backButton = document.getElementById('gallery-back');
const statusCopy = document.getElementById('status-copy');
const holdCopy = document.getElementById('hold-copy');
const stackSurface = document.getElementById('stack-surface');
const scatterItems = gsap.utils.toArray('.scatter-item');

const carouselState = {
  stackGroupIndex: 0,
  imageIndex: 0,
  wheelLocked: false
};

const carouselElements = {
  container: null,
  main: null,
  backOne: null,
  backTwo: null,
  backThree: null,
  groupProgress: null,
  imageProgress: null,
  imagePrevButton: null,
  imageNextButton: null
};

const introMotionTweens = [];
const carouselIdleTweens = [];

const themePresets = {
  intro: {
    background: '#07110d',
    accent: '#c8ad78',
    ambientOne: 'radial-gradient(circle, rgba(200, 173, 120, 0.4), rgba(200, 173, 120, 0))',
    ambientTwo: 'radial-gradient(circle, rgba(61, 122, 95, 0.42), rgba(61, 122, 95, 0))'
  },
  gallery: {
    background: '#081411',
    accent: '#e6c7a1',
    ambientOne: 'radial-gradient(circle, rgba(230, 199, 161, 0.28), rgba(230, 199, 161, 0))',
    ambientTwo: 'radial-gradient(circle, rgba(60, 105, 90, 0.44), rgba(60, 105, 90, 0))'
  }
};

const galleryCards = [
  {
    title: 'Wedding Flow',
    subtitle: 'Warm ceremony app',
    label: '01 / App Frame',
    accent: '#c8ad78',
    background: '#10251f',
    main: '../images/serv-wedding.JPG',
    stack: ['../images/b-married.jpeg', '../images/ph-wedding.JPG', '../images/testi.jpeg']
  },
  {
    title: 'Portrait Motion',
    subtitle: 'Soft portrait app',
    label: '02 / App Frame',
    accent: '#b7dfc4',
    background: '#13231b',
    main: '../images/ph-portrait.JPG',
    stack: ['../images/about1.jpg', '../images/about2.jpg', '../images/hero1.JPG']
  },
  {
    title: 'Travel Drift',
    subtitle: 'Landscape app feel',
    label: '03 / App Frame',
    accent: '#e2c08f',
    background: '#10271f',
    main: '../images/serv-adventure.JPG',
    stack: ['../images/b-pune.jpeg', '../images/b-manali.jpeg', '../images/hero2.JPG']
  },
  {
    title: 'Night Pulse',
    subtitle: 'Dark celebration app',
    label: '04 / App Frame',
    accent: '#f2e1c2',
    background: '#13261f',
    main: '../images/ph-party.JPG',
    stack: ['../images/serv-commercial.JPG', '../images/faq.jpeg', '../images/contact-banner.jpg']
  }
];

function setTheme(theme) {
  canvas.style.setProperty('--canvas-bg', theme.background);
  canvas.style.setProperty('--accent', theme.accent);
  canvas.style.setProperty('--accent-soft', `${theme.accent}33`);
  canvas.style.setProperty('--ambient-one', theme.ambientOne);
  canvas.style.setProperty('--ambient-two', theme.ambientTwo);
  canvas.style.backgroundColor = theme.background;
}

function setMode(mode) {
  canvas.dataset.mode = mode;
  const isGallery = mode === 'gallery';

  introScreen.setAttribute('aria-hidden', String(isGallery));
  galleryScreen.setAttribute('aria-hidden', String(!isGallery));
  statusCopy.textContent = isGallery ? 'App gallery open' : 'Monogram screen active';
  holdCopy.textContent = isGallery ? 'Back to monogram' : 'Open gallery';

  if (isGallery) {
    setTheme(themePresets.gallery);
  } else {
    setTheme(themePresets.intro);
  }
}

function renderStackCarousel() {
  stackSurface.innerHTML = `
    <article class="stack-carousel" id="stack-carousel" tabindex="0" aria-label="Stack exploration carousel">
      <div class="stack-crooked" aria-hidden="true">
        <img class="stack-back stack-back-one" id="stack-back-one" alt="" />
        <img class="stack-back stack-back-two" id="stack-back-two" alt="" />
        <img class="stack-back stack-back-three" id="stack-back-three" alt="" />
      </div>
      <img class="stack-main" id="stack-main" alt="" />
      <div class="stack-overlay">
        <div class="carousel-controls carousel-controls-main">
          <p class="stack-card-meta" id="stack-group-progress">Stack 1 / ${galleryCards.length}</p>
        </div>
        <div class="carousel-controls carousel-controls-stack">
          <button class="carousel-button" id="image-prev" type="button">Image Prev</button>
          <p class="stack-card-meta" id="image-progress">Image 1 / 4</p>
          <button class="carousel-button" id="image-next" type="button">Image Next</button>
        </div>
      </div>
    </article>
  `;

  carouselElements.container = document.getElementById('stack-carousel');
  carouselElements.main = document.getElementById('stack-main');
  carouselElements.backOne = document.getElementById('stack-back-one');
  carouselElements.backTwo = document.getElementById('stack-back-two');
  carouselElements.backThree = document.getElementById('stack-back-three');
  carouselElements.groupProgress = document.getElementById('stack-group-progress');
  carouselElements.imageProgress = document.getElementById('image-progress');
  carouselElements.imagePrevButton = document.getElementById('image-prev');
  carouselElements.imageNextButton = document.getElementById('image-next');
}

function animateCarouselTransition(direction = 1) {
  const dir = direction >= 0 ? 1 : -1;
  const backLayers = [carouselElements.backOne, carouselElements.backTwo, carouselElements.backThree];

  gsap.killTweensOf([carouselElements.main, ...backLayers, carouselElements.container]);

  gsap.fromTo(
    carouselElements.main,
    {
      autoAlpha: 0.16,
      y: 30 * dir,
      scale: 1.1,
      rotate: 2.2 * dir,
      filter: 'saturate(0.78) contrast(0.9) brightness(0.82) blur(2px)'
    },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      filter: 'saturate(0.95) contrast(0.97) brightness(0.9) blur(0px)',
      duration: 0.62,
      ease: 'power4.out'
    }
  );

  gsap.fromTo(
    backLayers,
    {
      autoAlpha: 0.42,
      y: 22 * dir,
      x: (index) => (index === 1 ? 18 : -14),
      scale: 0.84
    },
    {
      autoAlpha: 0.9,
      y: 0,
      x: 0,
      scale: 1,
      duration: 0.56,
      stagger: { each: 0.05, from: dir > 0 ? 'start' : 'end' },
      ease: 'expo.out'
    }
  );

  gsap.fromTo(
    carouselElements.container,
    { y: 4, scale: 0.994 },
    { y: 0, scale: 1, duration: 0.48, ease: 'power3.out' }
  );
}

function startCarouselIdleMotion() {
  carouselIdleTweens.forEach((tween) => tween.kill());
  carouselIdleTweens.length = 0;

  const layers = [carouselElements.backOne, carouselElements.backTwo, carouselElements.backThree].filter(Boolean);
  if (layers.length === 0 || !carouselElements.main) {
    return;
  }

  carouselIdleTweens.push(
    gsap.to(carouselElements.main, {
      y: -2,
      duration: 5.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  );

  layers.forEach((layer, index) => {
    const xShift = index === 1 ? 6 : -6;
    carouselIdleTweens.push(
      gsap.to(layer, {
        x: xShift,
        y: index === 2 ? 5 : -4,
        duration: 4.8 + index * 0.65,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    );
  });
}

function updateCarousel(direction = 1) {
  const card = galleryCards[carouselState.stackGroupIndex];
  if (!card || !carouselElements.main) {
    return;
  }

  canvas.style.setProperty('--canvas-bg', card.background);
  canvas.style.setProperty('--accent', card.accent);
  canvas.style.setProperty('--accent-soft', `${card.accent}33`);

  carouselState.imageIndex = 0;
  carouselElements.groupProgress.textContent = `Stack ${carouselState.stackGroupIndex + 1} / ${galleryCards.length}`;
  statusCopy.textContent = `${card.title} active`;
  updateActiveImage(direction);
}

function moveStackGroup(step) {
  carouselState.stackGroupIndex = (carouselState.stackGroupIndex + step + galleryCards.length) % galleryCards.length;
  updateCarousel(step);
}

function getActiveStackImages() {
  const card = galleryCards[carouselState.stackGroupIndex];
  if (!card) {
    return [];
  }

  return [card.main, ...card.stack];
}

function updateActiveImage(direction = 1) {
  const card = galleryCards[carouselState.stackGroupIndex];
  const images = getActiveStackImages();

  if (!card || images.length === 0) {
    return;
  }

  const size = images.length;
  const current = carouselState.imageIndex % size;
  const nextOne = (current + 1) % size;
  const nextTwo = (current + 2) % size;
  const nextThree = (current + 3) % size;

  carouselElements.main.src = images[current];
  carouselElements.main.alt = `${card.title} image ${current + 1}`;
  carouselElements.backOne.src = images[nextOne];
  carouselElements.backTwo.src = images[nextTwo];
  carouselElements.backThree.src = images[nextThree];
  carouselElements.imageProgress.textContent = `Image ${current + 1} / ${size}`;

  animateCarouselTransition(direction);
}

function moveImage(step) {
  const images = getActiveStackImages();
  if (images.length === 0) {
    return;
  }

  carouselState.imageIndex = (carouselState.imageIndex + step + images.length) % images.length;
  updateActiveImage(step);
}

function onCarouselWheel(event) {
  if (canvas.dataset.mode !== 'gallery') {
    return;
  }

  event.preventDefault();

  if (carouselState.wheelLocked || Math.abs(event.deltaY) < 10) {
    return;
  }

  carouselState.wheelLocked = true;
  moveStackGroup(event.deltaY > 0 ? 1 : -1);

  window.setTimeout(() => {
    carouselState.wheelLocked = false;
  }, 360);
}

function attachCarouselEvents() {
  if (!carouselElements.container) {
    return;
  }

  stackSurface.addEventListener('wheel', onCarouselWheel, { passive: false });

  carouselElements.imageNextButton?.addEventListener('click', () => moveImage(1));
  carouselElements.imagePrevButton?.addEventListener('click', () => moveImage(-1));

  carouselElements.container.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      moveStackGroup(1);
    }

    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      moveStackGroup(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveImage(1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveImage(-1);
    }
  });
}

function resetIntroCardMotion() {
  introMotionTweens.forEach((tween) => tween.kill());
  introMotionTweens.length = 0;

  scatterItems.forEach((item, index) => {
    const preview = item.querySelector('.scatter-preview');
    const driftX = (index % 2 === 0 ? 1 : -1) * gsap.utils.random(10, 28);
    const driftY = gsap.utils.random(-18, 18);

    introMotionTweens.push(
      gsap.to(item, {
        x: driftX,
        y: driftY,
        rotation: gsap.utils.random(-7, 7),
        duration: gsap.utils.random(4.8, 7.2),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.16
      })
    );

    introMotionTweens.push(
      gsap.to(preview, {
        x: gsap.utils.random(-8, 8),
        y: gsap.utils.random(-10, 10),
        rotation: gsap.utils.random(-4, 4),
        scale: gsap.utils.random(0.98, 1.04),
        duration: gsap.utils.random(6.5, 8.8),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.1
      })
    );
  });
}

function openGallery() {
  if (canvas.dataset.mode === 'gallery') {
    return;
  }

  setMode('gallery');
  gsap.to(introScreen, {
    autoAlpha: 0,
    x: -40,
    duration: 0.5,
    ease: 'power2.out'
  });

  gsap.fromTo(
    galleryScreen,
    { autoAlpha: 0, x: 40 },
    {
      autoAlpha: 1,
      x: 0,
      duration: 0.7,
      ease: 'power3.out'
    }
  );

  gsap.fromTo(
    '.stack-carousel',
    { y: 42, autoAlpha: 0, scale: 0.95 },
    { y: 0, autoAlpha: 1, scale: 1, duration: 0.78, ease: 'power3.out' }
  );
}

function closeGallery() {
  if (canvas.dataset.mode === 'intro') {
    return;
  }

  setMode('intro');
  gsap.to(galleryScreen, {
    autoAlpha: 0,
    x: 40,
    duration: 0.45,
    ease: 'power2.out'
  });

  gsap.to(introScreen, {
    autoAlpha: 1,
    x: 0,
    duration: 0.55,
    ease: 'power2.out'
  });
}

function updateIntroStatus(event) {
  const item = event.currentTarget;
  const label = item.dataset.detail || item.querySelector('.scatter-label')?.textContent || 'Monogram screen active';
  statusCopy.textContent = label;
}

function resetIntroStatus() {
  statusCopy.textContent = 'Monogram screen active';
}

setTheme(themePresets.intro);
setMode('intro');
renderStackCarousel();
attachCarouselEvents();
updateCarousel(1);
startCarouselIdleMotion();
resetIntroCardMotion();

gsap.set('.stack-carousel', { autoAlpha: 0 });
gsap.set(galleryScreen, { autoAlpha: 0, x: 40 });
gsap.set(introScreen, { autoAlpha: 1, x: 0 });

scatterItems.forEach((item) => {
  item.addEventListener('pointerenter', updateIntroStatus);
  item.addEventListener('pointerleave', resetIntroStatus);
});

openGalleryButton.addEventListener('click', openGallery);
backButton.addEventListener('click', closeGallery);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeGallery();
  }
});
