// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  // 1. Loader Hide
  const loader = document.querySelector('.loader-wrapper');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('fade-out');
    }, 400); // Small delay to feel premium
  });
  // Fallback for loader if load event takes too long
  setTimeout(() => {
    if (!loader.classList.contains('fade-out')) {
      loader.classList.add('fade-out');
    }
  }, 3000);

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Navigation & Sticky Header & Scroll Progress
  const header = document.querySelector('header');
  const scrollProgress = document.querySelector('.scroll-progress');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // Progress Bar
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }

    // Sticky Navbar
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to Top Button
    if (scrollTop > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }

    // Scroll active link highlight
    updateActiveNavLink();
    
    // Process Line progress
    updateProcessTimeline();
  });

  // Smooth Back to Top Action
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Active Link Update
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveNavLink() {
    let current = '';
    const scrollPos = window.scrollY + 150; // offset
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  // Mobile Menu Toggle
  const menuBtn = document.querySelector('.menu-btn');
  const navList = document.querySelector('.nav-links');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navList.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navList.classList.remove('active');
    });
  });

  // 3. Theme Toggle (Light/Dark Mode)
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Check saved theme
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
    body.classList.add('light-theme');
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const activeTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', activeTheme);
    // Re-draw chart on theme change
    drawCalculatorChart();
  });

  // 4. Scroll Reveal Animations
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Trigger counters if this section contains counters
        if (entry.target.classList.contains('stats-grid')) {
          animateCounters();
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // 5. Counters Animation
  let countersAnimated = false;
  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    
    const countItems = document.querySelectorAll('.stat-number');
    countItems.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const duration = 2000; // ms
      const startTime = performance.now();
      const isFloat = counter.getAttribute('data-float') === 'true';

      function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out quadratic
        const easeProgress = progress * (2 - progress);
        
        let currentVal = easeProgress * target;
        if (isFloat) {
          counter.textContent = prefix + currentVal.toFixed(1) + suffix;
        } else {
          counter.textContent = prefix + Math.floor(currentVal).toLocaleString('en-IN') + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          if (isFloat) {
            counter.textContent = prefix + target.toFixed(1) + suffix;
          } else {
            counter.textContent = prefix + target.toLocaleString('en-IN') + suffix;
          }
        }
      }
      
      requestAnimationFrame(updateCount);
    });
  }

  // 6. Process Timeline Connection Line Animation
  const processSteps = document.querySelectorAll('.process-step');
  
  function updateProcessTimeline() {
    const timeline = document.querySelector('.process-line');
    const progress = document.querySelector('.process-line-progress');
    if (!timeline || !progress) return;

    const timelineRect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the timeline is visible on screen
    const timelineTop = timelineRect.top;
    const timelineHeight = timelineRect.height;
    
    // We want the fill progress to match the scroll position relative to the process section
    const fillStartOffset = windowHeight * 0.6; // trigger line progress when section is 60% down
    const fillEndOffset = windowHeight * 0.4;
    
    let percent = 0;
    if (timelineTop < fillStartOffset) {
      const totalDist = timelineHeight;
      const traversed = fillStartOffset - timelineTop;
      percent = Math.min(Math.max((traversed / totalDist) * 100, 0), 100);
    }
    
    progress.style.height = percent + '%';

    // Highlight active steps
    processSteps.forEach((step, index) => {
      const stepRect = step.getBoundingClientRect();
      if (stepRect.top < windowHeight * 0.6) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  // 7. Testimonials Carousel
  const testimonials = [
    {
      name: "Rajesh & Meera Iyer",
      role: "NRI Professionals, London",
      image: "assets/advisor_portrait.png", // Reusing advisor image or a general asset
      stars: 5,
      quote: "Managing investments in India from abroad was complex. Pinnacle Wealth Advisors created an offshore tax-efficient portfolio that has grown beautifully. Their transparency is second to none."
    },
    {
      name: "Sanjay Singhal",
      role: "Founder, Singhal Logistics",
      image: "assets/business_meeting.png",
      stars: 5,
      quote: "Pinnacle restructured our corporate treasury and family trust funds. Their expert advisory helped us optimize taxes by 28% and set up a solid succession plan. Highly recommended!"
    },
    {
      name: "Anjali Deshmukh",
      role: "Sr. Architect & Young Investor",
      image: "assets/family_wealth.png",
      stars: 5,
      quote: "As a young professional, I needed guidance on structured wealth building. The advisor sat down, understood my goals, and drafted a custom roadmap. Booking that first consultation changed my life."
    }
  ];

  const sliderWrapper = document.getElementById('slider-wrapper');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const dotsContainer = document.getElementById('slider-dots');
  let currentSlide = 0;
  let autoplayInterval;

  // Build slides dynamic content
  function setupTestimonials() {
    if (!sliderWrapper) return;
    sliderWrapper.innerHTML = '';
    
    testimonials.forEach(t => {
      const slide = document.createElement('div');
      slide.className = 'slide-item';
      
      let starHtml = '';
      for (let i = 0; i < 5; i++) {
        starHtml += `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
      }

      slide.innerHTML = `
        <div class="testimonial-card">
          <div class="testimonial-quote-icon">“</div>
          <div class="testimonial-rating">${starHtml}</div>
          <p class="testimonial-text">"${t.quote}"</p>
          <div class="testimonial-author">
            <div class="author-img">
              <img src="${t.image}" alt="${t.name}">
            </div>
            <div class="author-info">
              <h4>${t.name}</h4>
              <p>${t.role}</p>
            </div>
          </div>
        </div>
      `;
      sliderWrapper.appendChild(slide);
    });

    // Setup Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      testimonials.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });
    }

    startAutoplay();
  }

  function goToSlide(idx) {
    if (!sliderWrapper) return;
    currentSlide = idx;
    if (currentSlide >= testimonials.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = testimonials.length - 1;
    
    sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update active dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        if (index === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6000);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  // Hover pauses autoplay
  if (sliderWrapper) {
    sliderWrapper.addEventListener('mouseenter', stopAutoplay);
    sliderWrapper.addEventListener('mouseleave', startAutoplay);
  }

  setupTestimonials();

  // 8. SIP Mutual Fund Calculator
  const calcInv = document.getElementById('calc-monthly-inv');
  const calcRate = document.getElementById('calc-expected-return');
  const calcYears = document.getElementById('calc-years');

  const valInv = document.getElementById('val-monthly-inv');
  const valRate = document.getElementById('val-expected-return');
  const valYears = document.getElementById('val-years');

  const resInvested = document.getElementById('res-invested');
  const resReturns = document.getElementById('res-returns');
  const resTotal = document.getElementById('res-total');

  const canvas = document.getElementById('calc-chart');

  // Input Listeners
  if (calcInv) {
    calcInv.addEventListener('input', (e) => {
      valInv.textContent = '₹' + parseInt(e.target.value).toLocaleString('en-IN');
      calculateWealth();
    });
    calcRate.addEventListener('input', (e) => {
      valRate.textContent = e.target.value + '%';
      calculateWealth();
    });
    calcYears.addEventListener('input', (e) => {
      valYears.textContent = e.target.value + ' Years';
      calculateWealth();
    });
  }

  function calculateWealth() {
    if (!calcInv) return;
    
    const P = parseFloat(calcInv.value);      // Monthly Investment
    const annualRate = parseFloat(calcRate.value); // Expected annual return rate
    const Y = parseInt(calcYears.value);      // Years
    
    const i = (annualRate / 12) / 100;        // Monthly Interest rate
    const n = Y * 12;                         // Total number of months
    
    // SIP Future Value Formula: M = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
    let totalValue = 0;
    if (i === 0) {
      totalValue = P * n;
    } else {
      totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }
    
    const investedAmount = P * n;
    const estReturns = Math.max(totalValue - investedAmount, 0);

    // Update numbers
    resInvested.textContent = '₹' + Math.round(investedAmount).toLocaleString('en-IN');
    resReturns.textContent = '₹' + Math.round(estReturns).toLocaleString('en-IN');
    resTotal.textContent = '₹' + Math.round(totalValue).toLocaleString('en-IN');

    // Re-draw chart
    drawCalculatorChart(investedAmount, totalValue, Y);
  }

  function drawCalculatorChart(invested = 1800000, total = 4200000, years = 15) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set proper dimensions for high DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Background color settings depending on dark/light mode
    const isLight = body.classList.contains('light-theme');
    const colorGrid = isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const colorText = isLight ? '#475569' : '#94a3b8';
    const colorBlue = '#2563eb';
    const colorGold = '#d4af37';

    ctx.clearRect(0, 0, w, h);

    // Padding settings
    const padL = 60;
    const padR = 20;
    const padT = 30;
    const padB = 40;

    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Draw Grids & Axes
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    ctx.fillStyle = colorText;
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const yTicks = 4;
    for (let r = 0; r <= yTicks; r++) {
      const yVal = padT + (chartH / yTicks) * r;
      ctx.beginPath();
      ctx.moveTo(padL, yVal);
      ctx.lineTo(w - padR, yVal);
      ctx.stroke();

      // Label
      const numLabel = Math.round(total - (total / yTicks) * r);
      let formattedLabel = '₹0';
      if (numLabel >= 10000000) {
        formattedLabel = '₹' + (numLabel / 10000000).toFixed(1) + 'Cr';
      } else if (numLabel >= 100000) {
        formattedLabel = '₹' + (numLabel / 100000).toFixed(0) + 'L';
      } else if (numLabel > 0) {
        formattedLabel = '₹' + (numLabel / 1000).toFixed(0) + 'K';
      }
      ctx.fillText(formattedLabel, padL - 10, yVal);
    }

    // X-Axis Year Labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const xTicks = 5;
    for (let c = 0; c < xTicks; c++) {
      const fraction = c / (xTicks - 1);
      const xVal = padL + chartW * fraction;
      const labelYear = Math.round(years * fraction);
      ctx.fillText(`Yr ${labelYear}`, xVal, h - padB + 10);
    }

    // Plotting Data points
    const pointsInvested = [];
    const pointsTotal = [];

    // Sample data across years to draw smooth curve
    const steps = 20;
    const P = parseFloat(calcInv ? calcInv.value : 10000);
    const annualRate = parseFloat(calcRate ? calcRate.value : 12);
    const i = (annualRate / 12) / 100;

    for (let s = 0; s <= steps; s++) {
      const fraction = s / steps;
      const currentYear = years * fraction;
      const currentMonths = currentYear * 12;
      
      const currentInvested = P * currentMonths;
      let currentTotal = 0;
      if (i === 0) {
        currentTotal = currentInvested;
      } else {
        currentTotal = P * ((Math.pow(1 + i, currentMonths) - 1) / i) * (1 + i);
      }

      const x = padL + chartW * fraction;
      const yInv = h - padB - (currentInvested / total) * chartH;
      const yTot = h - padB - (currentTotal / total) * chartH;

      pointsInvested.push({ x, y: yInv });
      pointsTotal.push({ x, y: yTot });
    }

    // Draw total wealth growth area (Gold Fill)
    ctx.beginPath();
    ctx.moveTo(pointsTotal[0].x, h - padB);
    pointsTotal.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pointsTotal[pointsTotal.length - 1].x, h - padB);
    ctx.closePath();
    const gradGold = ctx.createLinearGradient(0, padT, 0, h - padB);
    gradGold.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
    gradGold.addColorStop(1, 'rgba(212, 175, 55, 0.01)');
    ctx.fillStyle = gradGold;
    ctx.fill();

    // Draw invested growth area (Blue Fill)
    ctx.beginPath();
    ctx.moveTo(pointsInvested[0].x, h - padB);
    pointsInvested.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pointsInvested[pointsInvested.length - 1].x, h - padB);
    ctx.closePath();
    const gradBlue = ctx.createLinearGradient(0, padT, 0, h - padB);
    gradBlue.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
    gradBlue.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
    ctx.fillStyle = gradBlue;
    ctx.fill();

    // Draw growth line (Total Wealth)
    ctx.beginPath();
    ctx.strokeStyle = colorGold;
    ctx.lineWidth = 3;
    pointsTotal.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw invested line
    ctx.beginPath();
    ctx.strokeStyle = colorBlue;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    pointsInvested.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw final point circles
    const lastP = pointsTotal[pointsTotal.length - 1];
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = colorGold;
    ctx.fill();
    ctx.strokeStyle = isLight ? '#ffffff' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    const lastPInv = pointsInvested[pointsInvested.length - 1];
    ctx.beginPath();
    ctx.arc(lastPInv.x, lastPInv.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = colorBlue;
    ctx.fill();
    ctx.stroke();
  }

  // Initial Calculation
  calculateWealth();

  // Resize listener to redraw chart correctly
  window.addEventListener('resize', () => {
    calculateWealth();
  });

  // 9. Accordion (FAQs)
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(faqHeader => {
    faqHeader.addEventListener('click', () => {
      const currentItem = faqHeader.parentElement;
      const currentContent = currentItem.querySelector('.faq-content');
      
      // Check if item is already active
      const isActive = currentItem.classList.contains('active');
      
      // Close all FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-content').style.maxHeight = null;
      });

      if (!isActive) {
        currentItem.classList.add('active');
        currentContent.style.maxHeight = currentContent.scrollHeight + 'px';
      }
    });
  });

  // 10. Book Consultation Form Validation
  const form = document.getElementById('consultation-form');
  const privacyCheckbox = document.getElementById('privacy');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Reset validation states
      let isValid = true;
      const formControls = form.querySelectorAll('.form-control');
      
      formControls.forEach(control => {
        if (!control.value.trim() && control.required) {
          isValid = false;
          control.style.borderColor = '#ef4444';
        } else {
          control.style.borderColor = '';
        }
      });

      if (!privacyCheckbox.checked) {
        isValid = false;
        alert("Please accept our Privacy Policy to proceed.");
        return;
      }

      if (!isValid) {
        showToast("Please fill in all required fields.", "error");
        return;
      }

      // Simulate submission loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="loader-circle" style="width:20px; height:20px; border-width:2px; display:inline-block; position:relative; vertical-align:middle; margin-right:8px;"></span>Processing...`;

      setTimeout(() => {
        showToast("Thank you! Your free 30-minute consultation is booked. Our certified advisor will contact you within 2 business hours.", "success");
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 2000);
    });
  }

  // 11. Toast Notifications Utility
  function showToast(message, type = "success") {
    // Create element if not exists or reuse
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }

    toast.className = `toast-notification ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon ${type}">${iconSvg}</div>
      <div class="toast-message">${message}</div>
    `;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

  // 12. Newsletter Form Handling
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(nForm => {
    nForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nForm.querySelector('input');
      if (input && input.value.trim()) {
        showToast("Welcome to our mailing list! You will now receive exclusive market insights weekly.", "success");
        input.value = '';
        
        // Hide newsletter modal if open
        const newsModal = document.getElementById('newsletter-modal');
        if (newsModal && newsModal.classList.contains('show')) {
          newsModal.classList.remove('show');
        }
      }
    });
  });

  // 13. Exit Intent Popup Trigger
  const exitIntentModal = document.getElementById('exit-intent-modal');
  let exitIntentTriggered = false;

  document.addEventListener('mouseleave', (e) => {
    // Detect mouse leaving top of the page
    if (e.clientY < 0 && !exitIntentTriggered) {
      // Check localStorage to see if it was dismissed today
      const dismissedTime = localStorage.getItem('exit_intent_dismissed');
      const now = new Date().getTime();
      
      // Show if never dismissed, or dismissed more than 24 hours ago
      if (!dismissedTime || (now - dismissedTime > 24 * 60 * 60 * 1000)) {
        if (exitIntentModal) {
          exitIntentModal.classList.add('show');
          exitIntentTriggered = true;
        }
      }
    }
  });

  // 14. Modals Closes Handles
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    
    // Close on button click
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        
        if (modal.id === 'exit-intent-modal') {
          localStorage.setItem('exit_intent_dismissed', new Date().getTime());
        }
      });
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        if (modal.id === 'exit-intent-modal') {
          localStorage.setItem('exit_intent_dismissed', new Date().getTime());
        }
      }
    });
  });

  // 15. Newsletter Modal (Triggered after 15 seconds)
  const newsletterModal = document.getElementById('newsletter-modal');
  setTimeout(() => {
    const subscribed = localStorage.getItem('newsletter_subscribed');
    const dismissed = localStorage.getItem('newsletter_dismissed');
    const now = new Date().getTime();
    
    if (!subscribed && (!dismissed || (now - dismissed > 7 * 24 * 60 * 60 * 1000))) {
      // Don't show if exit-intent modal is currently active
      if (newsletterModal && (!exitIntentModal || !exitIntentModal.classList.contains('show'))) {
        newsletterModal.classList.add('show');
      }
    }
  }, 15000);

  // Handle Newsletter Modal close dismiss persist
  if (newsletterModal) {
    const newsCloseBtn = newsletterModal.querySelector('.modal-close');
    if (newsCloseBtn) {
      newsCloseBtn.addEventListener('click', () => {
        localStorage.setItem('newsletter_dismissed', new Date().getTime());
      });
    }
  }

  // 16. Cookie Consent Banner Logic
  const cookieBanner = document.getElementById('cookie-consent');
  const acceptCookiesBtn = document.getElementById('accept-cookies');
  const declineCookiesBtn = document.getElementById('decline-cookies');

  setTimeout(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent && cookieBanner) {
      cookieBanner.classList.add('show');
    }
  }, 2000);

  if (acceptCookiesBtn) {
    acceptCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'accepted');
      cookieBanner.classList.remove('show');
    });
  }

  if (declineCookiesBtn) {
    declineCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'declined');
      cookieBanner.classList.remove('show');
    });
  }
});
