// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveNav() {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
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

window.addEventListener('scroll', setActiveNav);

// Razorpay Configuration
// Payment Configuration
const REGISTRATION_AMOUNT = 2500; // Amount in Rupees
const WHATSAPP_NUMBER = '919985200023'; // REPLACE WITH ACTUAL COORDINATOR NUMBER

// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');
const paymentModal = document.getElementById('paymentModal');
const closeModal = document.querySelector('.close-modal');
const whatsappBtn = document.querySelector('#whatsappBtn');

// Store form data temporarily
let doNotDelete_pendingRegistrationData = null;

// Form Submission
registrationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());

    // Validate form
    // if (!validateForm(data)) {
    //     return;
    // }

    // Save pending data and show payment modal
    doNotDelete_pendingRegistrationData = data;
    showPaymentModal();
});

// Modal Logic
function showPaymentModal() {
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hidePaymentModal() {
    paymentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

closeModal.addEventListener('click', hidePaymentModal);

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === paymentModal) {
        hidePaymentModal();
    }
});

// WhatsApp Verification Logic
whatsappBtn.addEventListener('click', () => {
    if (!doNotDelete_pendingRegistrationData) return;

    // 1. Save data directly (mark as 'pending verification')
    saveRegistrationLocally(doNotDelete_pendingRegistrationData, 'pending_verification');

    // 2. Construct WhatsApp Message
    const name = doNotDelete_pendingRegistrationData.fullName;
    const phone = doNotDelete_pendingRegistrationData.phone;
    const org = doNotDelete_pendingRegistrationData.organization;

    const message = `*New Registration Payment Verification*%0A%0A` +
        `Hello, I have registered for the Beyond Operations Workshop.%0A` +
        `Here are my details:%0A` +
        `Name: *${name}*%0A` +
        `Phone: ${phone}%0A` +
        `Org: ${org}%0A%0A` +
        `I have completed the payment of ₹2,500 via QR/UPI. Attaching the payment screenshot here.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    // 3. Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // 4. Close modal and show on-page success
    hidePaymentModal();
    showSuccessMessage('pending_verification');
});

// Inquiry / Callback Logic
const inquiryBtn = document.getElementById('inquiryBtn');
if (inquiryBtn) {
    inquiryBtn.addEventListener('click', () => {
        if (!doNotDelete_pendingRegistrationData) return;

        // 1. Save data (mark as 'pending_inquiry')
        saveRegistrationLocally(doNotDelete_pendingRegistrationData, 'pending_inquiry');

        // 2. Construct WhatsApp Message
        const name = doNotDelete_pendingRegistrationData.fullName;
        const phone = doNotDelete_pendingRegistrationData.phone;
        const org = doNotDelete_pendingRegistrationData.organization;

        const message = `*Inquiry / Request for Callback*%0A%0A` +
            `Hello, I experienced the registration process for the Beyond Operations Workshop.%0A` +
            `Here are my details:%0A` +
            `Name: *${name}*%0A` +
            `Phone: ${phone}%0A` +
            `Org: ${org}%0A%0A` +
            `I have a few questions before completing the payment or need more details. Please call me back.`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

        // 3. Open WhatsApp
        window.open(whatsappUrl, '_blank');

        // 4. Close modal and show on-page success (custom message)
        hidePaymentModal();
        showSuccessMessage('pending_inquiry');
    });
}

function showSuccessMessage(status = 'pending_verification') {
    registrationForm.style.display = 'none';
    successMessage.classList.add('show');

    if (status === 'pending_inquiry') {
        successMessage.innerHTML = `
            <div class="success-icon" style="background: var(--color-secondary); color: var(--color-primary);">💬</div>
            <h3>Request Submitted!</h3>
            <p>Thank you for your interest. We have received your callback request and our coordinator will contact you shortly.</p>
            <button onclick="resetForm()" class="btn btn-secondary" style="margin-top: 20px;">Return to Form</button>
        `;
    } else {
        successMessage.innerHTML = `
            <div class="success-icon">✓</div>
            <h3>Registration Submitted!</h3>
            <p>Thank you for registering. Please ensure you have sent the payment screenshot on WhatsApp to confirm your seat.</p>
            <button onclick="resetForm()" class="btn btn-secondary" style="margin-top: 20px;">Register Another Participant</button>
        `;
    }
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function validateForm(data) {
    // Check required fields
    const requiredFields = ['fullName', 'email', 'phone', 'organization', 'designation', 'category'];

    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Validate phone
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(data.phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }

    // Check terms acceptance
    if (!data.terms) {
        alert('Please accept the terms and conditions.');
        return false;
    }

    return true;
}

// Local Storage Function
// Local Storage Function
function saveRegistrationLocally(formData, status = 'pending_verification') {
    const registration = {
        ...formData,
        paymentStatus: status, // Use passed status
        registeredAt: new Date().toISOString(),
        paymentId: 'manual_verification',
        amount: REGISTRATION_AMOUNT
    };

    const registrations = getRegistrations();
    registrations.push(registration);
    localStorage.setItem('teamsk_registrations', JSON.stringify(registrations));
    console.log('Registration saved locally:', registration);
}

// Registration Storage (localStorage-based)
function saveRegistration(registration) {
    const registrations = getRegistrations();
    registrations.push(registration);
    localStorage.setItem('teamsk_registrations', JSON.stringify(registrations));
    console.log('Registration saved:', registration);
}

function getRegistrations() {
    const stored = localStorage.getItem('teamsk_registrations');
    return stored ? JSON.parse(stored) : [];
}

function sortRegistrations(registrations, sortBy = 'registeredAt', ascending = false) {
    return registrations.sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];

        // Handle string comparisons
        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (ascending) {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
}

// Reset form function
function resetForm() {
    registrationForm.reset();
    registrationForm.style.display = 'block';
    successMessage.classList.remove('show');
    registrationForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.theme-card, .highlight-item, .benefit-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Video Slider Logic
const slides = document.querySelectorAll('.video-slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (slides.length > 0) {
    let currentSlide = 0;

    function showSlide(index) {
        // Handle index bounds
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        // Update active classes
        slides.forEach(slide => {
            slide.classList.remove('active');
            // Pause all videos
            const video = slide.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });

        dots.forEach(dot => dot.classList.remove('active'));

        // Activate new slide
        slides[index].classList.add('active');
        dots[index].classList.add('active');

        // Play active video
        const activeVideo = slides[index].querySelector('video');
        if (activeVideo) {
            // Check if element is visible and play
            activeVideo.play().catch(e => console.log('Autoplay prevented:', e));
        }

        currentSlide = index;
    }

    // Event Listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-slide'));
            showSlide(index);
        });
    });

    // Auto-advance when video ends
    slides.forEach((slide, index) => {
        const video = slide.querySelector('video');
        if (video) {
            video.addEventListener('ended', () => {
                showSlide(index + 1);
            });
        }
    });

    // Initial play attempt if in view
    const sliderObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeVideo = slides[currentSlide].querySelector('video');
                if (activeVideo && activeVideo.paused) {
                    activeVideo.play().catch(e => console.log('Autoplay prevented:', e));
                }
            } else {
                const activeVideo = slides[currentSlide].querySelector('video');
                if (activeVideo) activeVideo.pause();
            }
        });
    }, { threshold: 0.5 });

    const sliderContainer = document.querySelector('.video-slider');
    if (sliderContainer) sliderObserver.observe(sliderContainer);
}

// Add parallax effect to hero section
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.animated-particles');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Form input animations
const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
formInputs.forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function () {
        if (this.value === '') {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Mobile menu toggle (if needed in future)


// Countdown timer (optional - can be added if needed)
function initCountdown(targetDate) {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownElement.innerHTML = "Event Started!";
        }
    }

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

// Initialize countdown for event date (February 28, 2026)
// Uncomment to enable countdown
// const eventDate = new Date('February 28, 2026 09:00:00').getTime();
// initCountdown(eventDate);

// Mobile Menu Toggle
// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navContainer = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navContainer.classList.toggle('active');
    });
}

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navContainer.classList.remove('active');
    });
});

// Counter Animation
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps

            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };

            updateCounter();
            observer.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => {
    counterObserver.observe(counter);
});

console.log('TeamSK Event Page Loaded Successfully!');
