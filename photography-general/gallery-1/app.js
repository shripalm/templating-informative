gsap.registerPlugin(ScrollTrigger);

const stage = document.querySelector('.gallery-stage');
const panel = document.querySelector('.stage-panel');
const heroFrame = document.querySelector('.hero-frame');
const slides = gsap.utils.toArray('.media-slide');
const wordLeft = document.querySelector('.word-left');
const wordRight = document.querySelector('.word-right');
const introCopy = document.querySelector('.intro-copy');
const topbar = document.querySelector('.topbar');
const footerItems = gsap.utils.toArray('.footer-left, .footer-center, .footer-right');

if (stage && panel && heroFrame && wordLeft && wordRight && introCopy && slides.length) {
  ScrollTrigger.clearScrollMemory('manual');
  window.scrollTo(0, 0);

  const activeSlide = slides[0];
  const activeImage = activeSlide.querySelector('img');
  const activeStory = activeSlide.querySelector('.story-copy');
  const wordExitStart = 1.42;
  const sceneBaseStart = 2;
  const sceneSpacing = 1.18;
  const sceneCount = Math.max(slides.length - 1, 1);
  const finalSceneStart = sceneBaseStart + (sceneCount - 1) * sceneSpacing;
  const wordTravelDuration = Math.max(finalSceneStart - wordExitStart + 1, 1.8);

  const getStageSizes = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    return {
      initialWidth: Math.min(Math.max(viewportWidth * 0.32, 250), 390),
      initialHeight: Math.min(Math.max(viewportWidth * 0.2, 160), 250),
      finalWidth: Math.min(Math.max(viewportWidth * 0.6, 460), 760),
      finalHeight: Math.min(Math.max(viewportHeight * 0.58, 310), 520)
    };
  };

  const stageSizes = getStageSizes();

  gsap.set(heroFrame, {
    width: 0,
    height: 0,
    autoAlpha: 0
  });
  gsap.set(activeImage, { scale: 1.16 });
  gsap.set(activeStory, { autoAlpha: 0 });
  gsap.set(activeSlide, { autoAlpha: 1 });
  gsap.set(slides.slice(1), { autoAlpha: 0 });
  gsap.set(wordLeft, { x: '-120vw', yPercent: 0, autoAlpha: 0 });
  gsap.set(wordRight, { x: '120vw', yPercent: 0, autoAlpha: 0 });
  gsap.set(introCopy, { autoAlpha: 1, scale: 1 });
  gsap.set(topbar, { autoAlpha: 0, y: -14 });
  gsap.set(footerItems, { autoAlpha: 0, y: 14 });

  const master = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=520%',
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  master
    .to(introCopy, {
      autoAlpha: 0,
      scale: 0.96,
      duration: 0.35,
      ease: 'power1.out'
    }, 0)
    .to(topbar, {
      autoAlpha: 1,
      y: 0,
      duration: 0.35,
      ease: 'power1.out'
    }, 0.18)
    .to(footerItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power1.out'
    }, 0.22)
    .to(heroFrame, {
      autoAlpha: 1,
      width: stageSizes.finalWidth,
      height: stageSizes.finalHeight,
      duration: 1.35,
      ease: 'power2.out'
    }, 0)
    .to(activeImage, {
      scale: 1,
      duration: 1.35,
      ease: 'power2.out'
    }, 0)
    .to(wordLeft, {
      x: 0,
      autoAlpha: 1,
      duration: 1.3,
      ease: 'power2.out'
    }, 0.08)
    .to(wordRight, {
      x: 0,
      autoAlpha: 1,
      duration: 1.3,
      ease: 'power2.out'
    }, 0.08)
    .to(activeStory, {
      autoAlpha: 1,
      duration: 0.6,
      ease: 'power1.out'
    }, 0.3)
    .to(wordLeft, {
      x: '110vw',
      autoAlpha: 1,
      duration: wordTravelDuration,
      ease: 'none'
    }, wordExitStart)
    .to(wordRight, {
      x: '-110vw',
      autoAlpha: 1,
      duration: wordTravelDuration,
      ease: 'none'
    }, wordExitStart);

  slides.forEach((slide, index) => {
    if (index === 0) {
      return;
    }

    const image = slide.querySelector('img');
    const story = slide.querySelector('.story-copy');
    const previousSlide = slides[index - 1];
    const previousStory = previousSlide.querySelector('.story-copy');
    const sceneStart = 2 + (index - 1) * 1.18;

    master
      .set(slide, { autoAlpha: 1 }, sceneStart)
      .fromTo(slide, {
        yPercent: 18,
        clipPath: 'inset(100% 0% 0% 0%)'
      }, {
        yPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.72,
        ease: 'power2.out'
      }, sceneStart)
      .fromTo(image, {
        scale: 1.08,
        yPercent: 8,
        filter: 'saturate(0.88) contrast(0.95)'
      }, {
        scale: 1,
        yPercent: 0,
        filter: 'saturate(1) contrast(1)',
        duration: 0.72,
        ease: 'power2.out'
      }, sceneStart)
      .to(previousStory, {
        autoAlpha: 0,
        yPercent: -8,
        duration: 0.28,
        ease: 'power1.inOut'
      }, sceneStart)
      .fromTo(story, {
        autoAlpha: 0,
        yPercent: 10
      }, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.38,
        ease: 'power2.out'
      }, sceneStart + 0.2)
      .to(previousSlide, {
        autoAlpha: 0,
        yPercent: -8,
        duration: 0.48,
        ease: 'power1.inOut',
        onStart: () => {
          slides.forEach((item, itemIndex) => {
            item.classList.toggle('is-active', itemIndex === index);
          });
        }
      }, sceneStart + 0.05);
  });

}