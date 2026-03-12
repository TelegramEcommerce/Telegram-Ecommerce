/**
 * TeleMart - Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animation has played
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animateElements = document.querySelectorAll(
        '.feature-card, .step-box, .pricing-card, .section-header, .demo-wrapper'
    );

    animateElements.forEach(el => {
        el.classList.add('fade-in'); // Add initial hidden state
        scrollObserver.observe(el);
    });

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Parallax Effect for Hero Blobs (Optional Subtle Interaction)
    document.addEventListener('mousemove', (e) => {
        const blobs = document.querySelectorAll('.blob');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        blobs.forEach((blob, index) => {
            const speed = index === 0 ? 30 : -20;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    // 5. Tabs Logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding pane
            const targetId = button.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 6. Localization Engine (Button Toggle)
    const langSwitcherBtn = document.getElementById('langSwitcherBtn');
    
    // Function to update the page based on the selected language
    function setLanguage(lang) {
        if (!translations[lang]) return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                // If it's HTML (like our spans with icons), use innerHTML, else textContent
                el.innerHTML = translations[lang][key];
            }
        });
        
        // Update the button appearance
        if (lang === 'en') {
            langSwitcherBtn.setAttribute('data-lang', 'en');
            langSwitcherBtn.innerHTML = '🇺🇸 EN';
        } else {
            langSwitcherBtn.setAttribute('data-lang', 'my');
            langSwitcherBtn.innerHTML = '🇲🇲 MM';
        }

        // Save the chosen language to localStorage
        localStorage.setItem('telemart_lang', lang);
    }

    // Set initial language (check localStorage first, fallback to English)
    const savedLang = localStorage.getItem('telemart_lang') || 'en';
    setLanguage(savedLang);

    // Event listener for button click toggle
    if (langSwitcherBtn) {
        langSwitcherBtn.addEventListener('click', () => {
            const currentLang = langSwitcherBtn.getAttribute('data-lang');
            const newLang = currentLang === 'en' ? 'my' : 'en';
            setLanguage(newLang);
        });
    }

});

