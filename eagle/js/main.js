$(document).ready(function() {
    // Smooth scrolling for navigation links
    $('a.nav-link').on('click', function(event) {
        if (this.hash !== '') {
            event.preventDefault();
            const hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top - 56
            }, 800);
        }
    });

    // Navbar background change on scroll
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').addClass('bg-dark-scroll');
        } else {
            $('.navbar').removeClass('bg-dark-scroll');
        }
    });

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Service cards hover effect
    $('.service-card').hover(
        function() {
            $(this).addClass('shadow-lg');
        },
        function() {
            $(this).removeClass('shadow-lg');
        }
    );

    // Gallery image loading animation
    $('.gallery-item').each(function(index) {
        $(this).css({
            'animation': 'fadeInUp 0.5s ease forwards',
            'animation-delay': (index * 0.1) + 's'
        });
    });

    // Add animation keyframes to head
    if (!$('style#animation-keyframes').length) {
        $('head').append(`
            <style id="animation-keyframes">
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `);
    }
});
