document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Sticky Header & Active Link Scroll Spy ---
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a');

    window.addEventListener('scroll', () => {
        // Sticky Header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- 2. Mobile Menu Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-links');
    const mobileBtnIcon = document.querySelector('.mobile-menu-btn i');

    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('nav-active');
        if (navMenu.classList.contains('nav-active')) {
            mobileBtnIcon.classList.remove('fa-bars');
            mobileBtnIcon.classList.add('fa-times');
        } else {
            mobileBtnIcon.classList.remove('fa-times');
            mobileBtnIcon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('nav-active');
            mobileBtnIcon.classList.remove('fa-times');
            mobileBtnIcon.classList.add('fa-bars');
        });
    });

    // --- 3. Scroll Reveal Animations & Progress Bars ---
    const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-bottom');
    const progressBars = document.querySelectorAll('.progress');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // If it's a progress bar container, animate the bars inside
                if (entry.target.classList.contains('skills-card')) {
                    const bars = entry.target.querySelectorAll('.progress');
                    bars.forEach(bar => {
                        const width = bar.getAttribute('data-width');
                        bar.style.width = width;
                    });
                }

                // Optionally unobserve after revealing
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- 4. Particle Background Animation ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    let particlesArray = [];
    const numberOfParticles = window.innerWidth < 768 ? 50 : 120;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            // Mixed colors between white and orange
            this.color = Math.random() > 0.8 ? 'rgba(255, 145, 77, 0.7)' : 'rgba(255, 255, 255, 0.5)';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Loop across screen
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            
            // Draw lines between particles
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 145, 77, ${(1 - distance / 120) * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // --- 5. Contact Form Submission (Live via Formspree) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            // Loading State
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    // Show success popup
                    const successPopup = document.getElementById('successPopup');
                    successPopup.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    
                    btn.innerHTML = 'Success! ✨';
                    contactForm.reset();

                    // Close popup handler
                    document.getElementById('closePopup').onclick = () => {
                        successPopup.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    };
                } else {
                    throw new Error(result.message || 'Form submission failed');
                }
            } catch (error) {
                btn.innerHTML = 'Error! Try Again <i class="fas fa-exclamation-triangle"></i>';
                console.error('Submission error:', error);
            } finally {
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.add('btn-primary');
                    btn.classList.remove('btn-outline');
                    btn.disabled = false;
                }, 4000);
            }
        });
    }

    // --- 6. Certificate Modal Logic ---
    const modal = document.getElementById('certModal');
    const modalImg = document.getElementById('modalImg');
    const closeModal = document.getElementById('closeModal');
    const downloadBtn = document.getElementById('downloadBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const certImages = document.querySelectorAll('.cert-card .project-img');

    certImages.forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            // If the user clicked the download/view link, let it happen naturally if it's the PDF
            // But actually we want the modal to open even for the whole image
            e.preventDefault();
            
            const img = wrapper.querySelector('img');
            const link = wrapper.querySelector('.btn-icon');
            const pdfUrl = link ? link.getAttribute('href') : '#';

            // Open Modal
            modalImg.src = img.src;
            downloadBtn.href = pdfUrl;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    });

    // Close on click outside image
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-body') || e.target.classList.contains('modal-container')) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Fullscreen Toggle
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            modalImg.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // --- 7. Custom Cursor Tracking ---
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        const links = document.querySelectorAll('a, button, .card');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => cursor.classList.add('active'));
            link.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

});

// Scroll Progress Bar
const scrollProgressBar = document.getElementById('scrollProgressBar');
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    if (scrollProgressBar) {
        scrollProgressBar.style.width = scrollPercentage + '%';
    }
});


// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
