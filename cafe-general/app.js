document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Global Custom Cursor & Glow ---
  const cursorFollower = document.querySelector('.cursor-follower');
  const cursorGlow = document.querySelector('.cursor-glow');

  if (cursorFollower && cursorGlow) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Show cursor elements once active
      cursorFollower.style.opacity = '1';
      cursorGlow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      cursorFollower.style.opacity = '0';
      cursorGlow.style.opacity = '0';
    });

    // Animate with lerp (linear interpolation) for smooth tracking
    const tick = () => {
      // Follower smooth tracking
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;

      // Glow smooth tracking (more lag)
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(tick);
    };
    tick();

    // Hover effect on links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .filter-tab, .faq-header, .insta-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) scale(1.8)`;
        cursorFollower.style.borderColor = 'var(--color-accent)';
        cursorFollower.style.backgroundColor = 'rgba(194, 109, 79, 0.15)';
      });
      el.addEventListener('mouseleave', () => {
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) scale(1)`;
        cursorFollower.style.borderColor = 'var(--color-accent)';
        cursorFollower.style.backgroundColor = 'rgba(194, 109, 79, 0.05)';
      });
    });
  }

  // --- 2. Scroll Progress Bar & Header Scrolled state ---
  const header = document.querySelector('header');
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');

  window.addEventListener('scroll', () => {
    // Scroll progress calculations
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    if (scrollProgressBar) {
      document.documentElement.style.setProperty('--scroll-progress', `${scrolled}%`);
    }

    // Header active state on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- 3. Mobile Navigation Menu Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinksList = document.querySelectorAll('.nav-links a');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking navigation links
    navLinksList.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // --- 4. Light / Espresso Dark Theme Switcher ---
  const themeToggleBtn = document.querySelector('.theme-toggle-btn');
  const rootHtml = document.documentElement;

  // Read saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  rootHtml.setAttribute('data-theme', savedTheme);

  // Initialize leaf map tiles based on theme
  let mapTileLayer = null;

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = rootHtml.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      rootHtml.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Re-configure map tiles layer if Leaflet map exists
      updateMapTiles(newTheme);
    });
  }

  // --- 5. Leaflet Map setup (Brew & Bloom Surat Location) ---
  let map = null;
  const suratVesuCoords = [21.1610, 72.7845]; // Premium Vesu area

  if (document.getElementById('map')) {
    // Initialize map
    map = L.map('map', { 
      scrollWheelZoom: false,
      zoomControl: false 
    }).setView(suratVesuCoords, 15);

    // Add zoom controls at the bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Initial tile layer setup based on active theme
    const currentTheme = rootHtml.getAttribute('data-theme') || 'light';
    updateMapTiles(currentTheme);

    // Custom aesthetic pin marker matching our Terracotta accents
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: #C26D4F; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #FFFDF8; box-shadow: 0 0 10px rgba(0,0,0,0.3); transform: scale(1.2);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker(suratVesuCoords, { icon: customIcon })
      .addTo(map)
      .bindPopup(`<strong style="font-family: var(--font-body); color: #4A2C2A;">Brew & Bloom Café</strong><br/><span style="font-size: 0.85rem; color: #6B6B6B;">Specialty Roasters, Vesu, Surat</span>`)
      .openPopup();
  }

  function updateMapTiles(theme) {
    if (!map) return;

    if (mapTileLayer) {
      map.removeLayer(mapTileLayer);
    }

    // Use light or dark theme tiles from CartoDB
    const url = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    mapTileLayer = L.tileLayer(url, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
  }

  // --- 6. Scroll Reveal Animation using IntersectionObserver ---
  const reveals = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        
        // If it's a stats element or contains one, trigger stats counters
        if (entry.target.classList.contains('stats-grid') || entry.target.querySelector('.stats-grid')) {
          animateStatsCounters();
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // --- 7. Statistical Counter Animation ---
  let countersAnimated = false;

  function animateStatsCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const suffix = stat.getAttribute('data-suffix') || '';
      let current = 0;
      const duration = 2000; // 2 seconds animation
      const steps = 60;
      const increment = target / steps;
      const stepDuration = duration / steps;

      const counterInterval = setInterval(() => {
        current += increment;
        if (current >= target) {
          // Final value format
          if (Number.isInteger(target)) {
            stat.textContent = target + suffix;
          } else {
            stat.textContent = target.toFixed(1) + suffix;
          }
          clearInterval(counterInterval);
        } else {
          if (Number.isInteger(target)) {
            stat.textContent = Math.floor(current) + suffix;
          } else {
            stat.textContent = current.toFixed(1) + suffix;
          }
        }
      }, stepDuration);
    });
  }

  // --- 8. Signature Menu Interactive Filtering ---
  const filterTabs = document.querySelectorAll('.filter-tab');
  const menuCards = document.querySelectorAll('.menu-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active states
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterVal = tab.getAttribute('data-filter');

      // Animate and filter items
      menuCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (filterVal === 'all' || cardCategory === filterVal) {
          // Slide in and show
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          // Slide down and hide
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.95)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 300);
        }
      });
    });
  });

  // --- 9. Testimonials Swipeable/Auto-Carousel ---
  const carouselContainer = document.querySelector('.reviews-container');
  const slides = document.querySelectorAll('.review-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  let currentSlide = 0;
  let carouselInterval = null;

  if (carouselContainer && slides.length > 0) {
    const updateCarousel = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      currentSlide = index;
      
      // Update position
      carouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Update navigation dots
      dots.forEach(dot => dot.classList.remove('active'));
      if (dots[currentSlide]) {
        dots[currentSlide].classList.add('active');
      }
    };

    // Nav Dot Clicks
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        updateCarousel(idx);
        resetAutoSlide();
      });
    });

    // Arrow Button Clicks
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        updateCarousel(currentSlide - 1);
        resetAutoSlide();
      });
      nextBtn.addEventListener('click', () => {
        updateCarousel(currentSlide + 1);
        resetAutoSlide();
      });
    }

    // Auto rotate slide intervals
    const startAutoSlide = () => {
      carouselInterval = setInterval(() => {
        updateCarousel(currentSlide + 1);
      }, 7000); // Rotate every 7 seconds
    };

    const resetAutoSlide = () => {
      clearInterval(carouselInterval);
      startAutoSlide();
    };

    startAutoSlide();

    // Swipe gestures support on mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const difference = touchStartX - touchEndX;
      if (difference > 50) {
        // Swiped Left - Next slide
        updateCarousel(currentSlide + 1);
        resetAutoSlide();
      } else if (difference < -50) {
        // Swiped Right - Previous slide
        updateCarousel(currentSlide - 1);
        resetAutoSlide();
      }
    };
  }

  // --- 10. FAQ Expandable Accordion ---
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Close all other FAQ items first for an elegant focus experience
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-content').style.maxHeight = '0px';
      });

      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // --- 11. Interactive Modal Overlays (Table Booking) ---
  const openModalBtns = document.querySelectorAll('.open-booking-modal');
  const closeModalBtn = document.querySelector('.close-modal-btn');
  const modalOverlay = document.querySelector('.modal-overlay');
  const reservationForm = document.getElementById('reservation-form');
  const toastMsg = document.querySelector('.toast-msg');

  const openBookingModal = (e) => {
    if (e) e.preventDefault();
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Disable scroll under overlay
    }
  };

  const closeBookingModal = () => {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto'; // Re-enable scroll
    }
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', openBookingModal);
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeBookingModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      // Close only if clicking directly on overlay backdrop, not within container modal
      if (e.target === modalOverlay) {
        closeBookingModal();
      }
    });
  }

  // Handle Form Submission Mockup
  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeBookingModal();

      // Show toast confirmation alert
      if (toastMsg) {
        toastMsg.classList.add('show');
        setTimeout(() => {
          toastMsg.classList.remove('show');
        }, 4000); // Show toast message for 4 seconds
      }

      reservationForm.reset();
    });
  }

  // Mockup Newsletter Subscription
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('.newsletter-input');
      if (input.value.trim() !== '') {
        alert(`Thank you for subscribing, ${input.value}! Expect our curated brews digest shortly.`);
        input.value = '';
      }
    });
  }
});
