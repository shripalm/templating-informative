/* ==========================================================================
   Aura & Light Photographer Portfolio Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Navigation Scroll Effect
    // ==========================================
    const navbar = document.getElementById('navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check


    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const navToggle = document.getElementById('nav-toggle');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    const toggleMobileMenu = () => {
        navToggle.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
    };

    navToggle.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    // ==========================================
    // 3. Split-Screen Hero Carousel
    // ==========================================
    const slides = document.querySelectorAll('.hero-slide');
    const textItems = document.querySelectorAll('.hero-text-item');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const indicators = document.querySelectorAll('#slider-indicators .indicator');
    
    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 6000;

    const showSlide = (index) => {
        // Deactivate current slide elements
        slides[currentSlide].classList.remove('active');
        textItems[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // Calculate new index
        currentSlide = (index + slides.length) % slides.length;
        
        // Activate new slide elements
        slides[currentSlide].classList.add('active');
        textItems[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
        showSlide(currentSlide + 1);
    };

    const prevSlide = () => {
        showSlide(currentSlide - 1);
    };

    const startSlideShow = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
    };

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startSlideShow();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startSlideShow();
    });

    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', () => {
            showSlide(idx);
            startSlideShow();
        });
    });

    startSlideShow();


    // ==========================================
    // 4. Gallery Hover Video Controls
    // ==========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const hoverVideo = item.querySelector('.gallery-hover-video');
        if (hoverVideo) {
            item.addEventListener('mouseenter', () => {
                hoverVideo.currentTime = 0;
                hoverVideo.play().catch(err => console.log("Video hover autoplay blocked:", err));
            });
            item.addEventListener('mouseleave', () => {
                hoverVideo.pause();
            });
        }
    });


    // ==========================================
    // 5. Gallery Filtering & Mixed Media Lightbox
    // ==========================================
    const filterTabs = document.querySelectorAll('.filter-tab');
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxContentBox = document.getElementById('lightbox-content-box');
    const lightboxCat = document.getElementById('lightbox-cat');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let activeItems = [...galleryItems];
    let currentLightboxIdx = 0;

    // A. Filtering grid
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filterValue = tab.getAttribute('data-filter');
            activeItems = [];

            galleryItems.forEach(item => {
                const isMatch = filterValue === 'all' || item.classList.contains(`item-${filterValue}`);
                
                if (isMatch) {
                    item.classList.remove('hide');
                    item.style.transform = 'scale(0.9)';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.transform = 'scale(1)';
                        item.style.opacity = '1';
                    }, 50);
                    activeItems.push(item);
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // B. Lightbox dynamic media rendering (img or video)
    const openLightbox = (index) => {
        currentLightboxIdx = index;
        const targetItem = activeItems[currentLightboxIdx];
        
        const src = targetItem.getAttribute('data-src');
        const mediaType = targetItem.getAttribute('data-type');
        const cat = targetItem.getAttribute('data-category');
        const title = targetItem.getAttribute('data-title');
        
        // Clean existing media elements (imgs or videos) from the lightbox content box
        const existingMedia = lightboxContentBox.querySelectorAll('.lightbox-media');
        existingMedia.forEach(el => el.remove());
        
        // Inject correct media tag
        if (mediaType === 'video') {
            const videoEl = document.createElement('video');
            videoEl.src = src;
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.controls = true;
            videoEl.playsInline = true;
            videoEl.className = 'lightbox-media';
            lightboxContentBox.insertBefore(videoEl, lightboxContentBox.firstChild);
        } else {
            const imgEl = document.createElement('img');
            imgEl.src = src;
            imgEl.alt = title;
            imgEl.className = 'lightbox-media';
            lightboxContentBox.insertBefore(imgEl, lightboxContentBox.firstChild);
        }
        
        lightboxCat.textContent = cat;
        lightboxTitle.textContent = title;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = activeItems.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    // C. Lightbox navigation and closing cleanup
    const closeLightbox = () => {
        // Pause and cleanup video playback before exit
        const activeVideo = lightboxContentBox.querySelector('video.lightbox-media');
        if (activeVideo) {
            activeVideo.pause();
            activeVideo.src = "";
            activeVideo.load();
        }
        
        lightbox.classList.remove('active');
        if (!mobileOverlay.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    };

    const navigateLightbox = (direction) => {
        if (activeItems.length === 0) return;
        currentLightboxIdx = (currentLightboxIdx + direction + activeItems.length) % activeItems.length;
        openLightbox(currentLightboxIdx);
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxContentBox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });


    // ==========================================
    // 6. Testimonial Slider & Profile Sync
    // ==========================================
    const testiItems = document.querySelectorAll('.testi-item');
    const prevTesti = document.getElementById('prev-testi');
    const nextTesti = document.getElementById('next-testi');
    const testiDots = document.querySelectorAll('#testi-dots .testi-dot');
    const testiProfileImg = document.getElementById('testi-profile-img');
    
    let activeTesti = 0;

    const showTestimonial = (index) => {
        testiItems[activeTesti].classList.remove('active');
        testiDots[activeTesti].classList.remove('active');
        
        activeTesti = (index + testiItems.length) % testiItems.length;
        
        testiItems[activeTesti].classList.add('active');
        testiDots[activeTesti].classList.add('active');
        
        // Transition profile image src with active testimonial
        const targetImgSrc = testiItems[activeTesti].getAttribute('data-img');
        if (testiProfileImg && targetImgSrc) {
            testiProfileImg.style.opacity = '0';
            setTimeout(() => {
                testiProfileImg.src = targetImgSrc;
                testiProfileImg.style.opacity = '1';
            }, 300);
        }
    };

    // Make sure transition styling exists on the profile image dynamically
    if (testiProfileImg) {
        testiProfileImg.style.transition = 'opacity 0.4s ease';
    }

    nextTesti.addEventListener('click', () => showTestimonial(activeTesti + 1));
    prevTesti.addEventListener('click', () => showTestimonial(activeTesti - 1));

    testiDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => showTestimonial(idx));
    });


    // ==========================================
    // 7. FAQ Accordion Panels
    // ==========================================
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');

    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const currentItem = trigger.parentElement;
            const content = currentItem.querySelector('.accordion-content');
            const isActive = currentItem.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            if (isActive) {
                currentItem.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                currentItem.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });


    // ==========================================
    // 8. Contact Form Booking Validation
    // ==========================================
    const form = document.getElementById('inquiry-form');
    const btnSubmit = document.getElementById('btn-submit');
    const formFeedback = document.getElementById('form-feedback');

    const validateInput = (input) => {
        const parent = input.parentElement;
        let isValid = true;

        if (input.required) {
            if (input.value.trim() === '') {
                isValid = false;
            } else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(input.value.trim());
            }
        }

        if (!isValid) {
            parent.classList.add('invalid');
        } else {
            parent.classList.remove('invalid');
        }

        return isValid;
    };

    const inputsToValidate = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputsToValidate.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('invalid')) {
                validateInput(input);
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        inputsToValidate.forEach(input => {
            if (!validateInput(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            formFeedback.textContent = "Please fill in all required fields correctly.";
            formFeedback.className = "form-feedback error";
            return;
        }

        btnSubmit.classList.add('loading');
        btnSubmit.disabled = true;
        formFeedback.style.display = 'none';

        setTimeout(() => {
            btnSubmit.classList.remove('loading');
            btnSubmit.disabled = false;
            
            formFeedback.textContent = `Thank you, ${document.getElementById('form-name').value}. Your inquiry has been sent. We'll reply within 24 hours.`;
            formFeedback.className = "form-feedback success";
            
            form.reset();
            document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('invalid'));
        }, 1500);
    });


    // ==========================================
    // 9. Intersection Observer for Scroll Reveals
    // ==========================================
    const revealElements = document.querySelectorAll('.fade-in-element');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
