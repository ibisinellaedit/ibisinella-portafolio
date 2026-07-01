/* -------------------------------------------------------------
   IBISINELLA.EDIT PORTFOLIO - INTERACTIVE LOGIC (JS)
   ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    
    // Disable scrolling initially during boot screen
    document.body.style.overflow = 'hidden';
    
    // 1. RETRO COIN SOUND GENERATOR (WEB AUDIO API)
    function playCoinSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const now = ctx.currentTime;
            
            // First note (B5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'square';
            osc1.frequency.setValueAtTime(987.77, now); // B5 frequency
            
            gain1.gain.setValueAtTime(0.08, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            
            osc1.start(now);
            osc1.stop(now + 0.08);
            
            // Second note (E6) - Starts slightly after
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6 frequency
            
            gain2.gain.setValueAtTime(0.08, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
            
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            
            osc2.start(now + 0.08);
            osc2.stop(now + 0.35);
            
        } catch (e) {
            console.warn("Web Audio API not supported or blocked by browser policy.", e);
        }
    }

    // 2. BOOT SCREEN TRANSITION
    const bootScreen = document.getElementById('boot-screen');
    const insertCoinBtn = document.getElementById('insert-coin-btn');
    const appContent = document.getElementById('app-content');
    const bootContainer = document.querySelector('.boot-container');

    if (insertCoinBtn) {
        insertCoinBtn.addEventListener('click', () => {
            // Play retro synthesized sound
            playCoinSound();
            
            // Trigger CRT/Glitch effect on container
            bootContainer.classList.add('boot-glitch');
            
            // Wait for sound and glitch to complete, then load main layout
            setTimeout(() => {
                bootScreen.classList.add('fade-out');
                appContent.classList.remove('hidden');
                
                // Allow CSS transitions to execute
                setTimeout(() => {
                    appContent.classList.add('visible');
                    document.body.style.overflow = '';
                    
                    // Trigger scroll reveals initially visible
                    handleScrollReveal();
                }, 50);
            }, 550);
        });
    }

    // 3. MOBILE MENU TOGGLE
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            // Toggle hamburger animation state
            const bars = mobileMenuToggle.querySelectorAll('.bar');
            if (mobileMenuToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Close menu when navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                const bars = mobileMenuToggle.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    });

    // 4. ACTIVE NAVIGATION LINK ON SCROLL & SCROLL REVEALS
    const sections = document.querySelectorAll('section[id]');
    
    function handleScrollActiveNav() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*='${sectionId}']`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }

    // Intersection Observer for Scroll Reveals
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Unobserve once revealed to optimize performance
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    function handleScrollReveal() {
        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    window.addEventListener('scroll', handleScrollActiveNav);

    // 5. DYNAMIC AVAILABILITY CLOCK (LOCAL WORK TIME CHECK)
    const availabilityDot = document.getElementById('availability-dot');
    const availabilityText = document.getElementById('availability-text');

    function checkAvailability() {
        if (!availabilityDot || !availabilityText) return;
        
        // Argentine Timezone (GMT-3) calculation
        // Get Argentine date object directly by styling UTC offset or LocaleString
        const dateOptions = {
            timeZone: 'America/Argentina/Buenos_Aires',
            hour: 'numeric',
            minute: 'numeric',
            weekday: 'short',
            hour12: false
        };
        
        try {
            const formatter = new Intl.DateTimeFormat('es-AR', dateOptions);
            const formattedParts = formatter.formatToParts(new Date());
            
            let weekday = '';
            let hour = 12; // default fallback
            let minute = 0; // default fallback
            
            formattedParts.forEach(part => {
                if (part.type === 'weekday') weekday = part.value.toLowerCase();
                if (part.type === 'hour') hour = parseInt(part.value, 10);
                if (part.type === 'minute') minute = parseInt(part.value, 10);
            });
            
            // Determine if it is weekend (sáb/sab/dom in short weekday format for Spanish)
            const isWeekend = weekday.includes('sáb') || weekday.includes('sab') || weekday.includes('dom') || weekday.includes('sd');
            
            // Work Hours definition (Monday to Friday, 08:30 - 13:00 and 17:30 - 21:00)
            const minutes = hour * 60 + minute;
            const morningStart = 8 * 60 + 30; // 08:30
            const morningEnd = 13 * 60;       // 13:00
            const afternoonStart = 17 * 60 + 30; // 17:30
            const afternoonEnd = 21 * 60;        // 21:00
            
            const isWorkHour = ((minutes >= morningStart && minutes < morningEnd) || 
                                (minutes >= afternoonStart && minutes < afternoonEnd));
            
            if (isWeekend) {
                availabilityDot.className = 'status-dot inactive';
                availabilityText.innerHTML = '🔴 FUERA DE SERVICIO (Fin de semana)';
                availabilityText.style.color = '#ff5555';
            } else if (!isWorkHour) {
                availabilityDot.className = 'status-dot inactive';
                availabilityText.innerHTML = `🔴 FUERA DE HORARIO (Lun a Vie 08:30-13:00 / 17:30-21:00)`;
                availabilityText.style.color = '#ff5555';
            } else {
                availabilityDot.className = 'status-dot active';
                availabilityText.innerHTML = '🟢 DISPONIBLE AHORA (Lunes a Viernes)';
                availabilityText.style.color = '#50fa7b';
            }
        } catch (e) {
            // Local Time fallback in case America/Argentina/Buenos_Aires formatting fails
            const localDate = new Date();
            const day = localDate.getDay();
            const localHour = localDate.getHours();
            const localMinute = localDate.getMinutes();
            
            const isWeekend = (day === 0 || day === 6);
            
            const minutes = localHour * 60 + localMinute;
            const morningStart = 8 * 60 + 30; // 08:30
            const morningEnd = 13 * 60;       // 13:00
            const afternoonStart = 17 * 60 + 30; // 17:30
            const afternoonEnd = 21 * 60;        // 21:00
            
            const isWorkHour = ((minutes >= morningStart && minutes < morningEnd) || 
                                (minutes >= afternoonStart && minutes < afternoonEnd));
            
            if (isWeekend) {
                availabilityDot.className = 'status-dot inactive';
                availabilityText.innerHTML = '🔴 FUERA DE SERVICIO (Fin de semana)';
                availabilityText.style.color = '#ff5555';
            } else if (!isWorkHour) {
                availabilityDot.className = 'status-dot inactive';
                availabilityText.innerHTML = '🔴 FUERA DE HORARIO (Lun a Vie 08:30-13:00 / 17:30-21:00)';
                availabilityText.style.color = '#ff5555';
            } else {
                availabilityDot.className = 'status-dot active';
                availabilityText.innerHTML = '🟢 DISPONIBLE AHORA (Lunes a Viernes)';
                availabilityText.style.color = '#50fa7b';
            }
        }
    }
    
    // Check initial status and update every minute
    checkAvailability();
    setInterval(checkAvailability, 60000);
});
