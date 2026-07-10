const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const siteHeader = document.querySelector(".site-header");
const nav = document.querySelector(".nav");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = Array.from(document.querySelectorAll(".mobile-link"));
const scrollIndicator = document.getElementById("scroll-indicator");
const heroMedia = document.getElementById("hero-media");

const splitText = () => {
  const splitTarget = document.querySelector("[data-split-text]");
  if (!splitTarget) {
    return;
  }

  const text = splitTarget.textContent.trim();
  splitTarget.textContent = "";

  for (const char of text) {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = char === " " ? "\u00A0" : char;
    splitTarget.appendChild(span);
  }
};

const markLoadedMedia = () => {
  const blurTargets = Array.from(document.querySelectorAll("img.lazy-blur"));
  blurTargets.forEach((img) => {
    if (img.complete) {
      img.classList.add("loaded");
      return;
    }
    img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
  });
};

const setupMarquee = () => {
  const track = document.getElementById("marquee-track");
  if (!track) {
    return;
  }
  track.innerHTML += track.innerHTML;
};

const setNavBlurOnScroll = () => {
  if (!siteHeader) {
    return;
  }
  const toggleNavState = () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  };
  toggleNavState();
  window.addEventListener("scroll", toggleNavState, { passive: true });
};

const setupMobileMenu = () => {
  if (!menuToggle || !mobileMenu) {
    return;
  }

  const setMenu = (isOpen) => {
    mobileMenu.classList.toggle("open", isOpen);
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("open");
    setMenu(isOpen);
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
};

const setupScrollIndicator = () => {
  if (!scrollIndicator) {
    return;
  }

  scrollIndicator.addEventListener("click", () => {
    const nextSection = document.querySelector("#stats");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
};

const setActiveNavLink = () => {
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  if (!sections.length || !navLinks.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("active", isActive);
        });
      });
    },
    { threshold: 0.55 }
  );

  sections.forEach((section) => observer.observe(section));
};

const setupFormValidation = () => {
  const form = document.getElementById("contact-form");
  if (!form) {
    return;
  }

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const status = document.getElementById("form-status");

  const errors = {
    name: document.getElementById("name-error"),
    email: document.getElementById("email-error"),
    message: document.getElementById("message-error"),
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;

    errors.name.textContent = "";
    errors.email.textContent = "";
    errors.message.textContent = "";
    status.textContent = "";

    if (!nameInput.value.trim()) {
      errors.name.textContent = "Please enter your full name.";
      valid = false;
    }

    if (!emailRegex.test(emailInput.value.trim())) {
      errors.email.textContent = "Please provide a valid email address.";
      valid = false;
    }

    if (messageInput.value.trim().length < 20) {
      errors.message.textContent = "Share at least 20 characters about your project.";
      valid = false;
    }

    if (!valid) {
      status.textContent = "Please review highlighted fields.";
      return;
    }

    status.textContent = "Thank you. Your inquiry has been prepared successfully.";
    form.reset();
  });
};

const setupHeroParallax = () => {
  if (prefersReducedMotion || !heroMedia) {
    return;
  }

  const onMove = (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    heroMedia.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
  };

  window.addEventListener("mousemove", onMove);
};

const ensureHeroVideoPlayback = () => {
  const heroVideos = Array.from(document.querySelectorAll(".hero-video"));
  heroVideos.forEach((video) => {
    video.muted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        video.setAttribute("controls", "controls");
      });
    }
  });
};

const initGsap = () => {
  if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll(".reveal-section, .reveal-card, .char").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".hero-media", {
    scale: 1,
    duration: 2,
    ease: "power4.out",
  });

  gsap.to(".char", {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    stagger: 0.02,
    duration: 0.8,
    ease: "power4.out",
    delay: 0.2,
  });

  gsap.to(".hero-subtitle, .hero .btn", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power4.out",
    delay: 0.4,
    stagger: 0.08,
  });

  gsap.utils.toArray(".reveal-section, h2, .section-title").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power4.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });
  });

  gsap.utils.toArray(".reveal-card").forEach((el, index) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power4.out",
      delay: (index % 3) * 0.12,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    });
  });

  gsap.utils.toArray(".parallax-image").forEach((img) => {
    gsap.to(img, {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: img,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  gsap.utils.toArray(".stats-planet").forEach((planet) => {
    gsap.fromTo(
      planet,
      {
        yPercent: 18,
        opacity: 0,
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.25,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".stats-showcase",
          start: "top 78%",
          once: true,
        },
      }
    );
  });

  gsap.to(".recognition-bg", {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: ".recognition",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  const counters = Array.from(document.querySelectorAll("[data-counter]"));
  counters.forEach((counter) => {
    const value = Number(counter.dataset.counter || "0");
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: counter,
        start: "top 88%",
        once: true,
      },
      onUpdate: () => {
        let suffix = "";
        if (value === 1200 || value === 2000) {
          suffix = " m²";
        }
        if (value === 98) {
          suffix = "%";
        }
        if (value === 10) {
          suffix = "+ years";
        }
        if (value === 34) {
          suffix = "+";
        }

        counter.textContent = `${Math.floor(obj.val)}${suffix}`;
      },
    });
  });

  gsap.from(".timeline-line", {
    scaleX: 0,
    transformOrigin: "left center",
    duration: 1,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".timeline-line",
      start: "top 90%",
      once: true,
    },
  });
};

splitText();
markLoadedMedia();
setupMarquee();
setNavBlurOnScroll();
setupMobileMenu();
setupScrollIndicator();
setActiveNavLink();
setupFormValidation();
setupHeroParallax();
ensureHeroVideoPlayback();
initGsap();
