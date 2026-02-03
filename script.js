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
// IMPORTANT: Replace with your actual Razorpay Key ID
const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXX';
const REGISTRATION_AMOUNT = 200000; // Amount in paise (₹2,000)

// Form submission handling with Razorpay integration
const registrationForm = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');

registrationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());

    // Validate form
    if (!validateForm(data)) {
        return;
    }

    // Initiate Razorpay payment
    initiatePayment(data);
});

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

// Razorpay Payment Integration
function initiatePayment(formData) {
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: REGISTRATION_AMOUNT,
        currency: 'INR',
        name: "TeamSK's Management Solutions",
        description: 'Beyond Operations Workshop Registration',
        image: 'logo.png',
        handler: function (response) {
            // Payment successful
            handlePaymentSuccess(response, formData);
        },
        prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone
        },
        notes: {
            organization: formData.organization,
            designation: formData.designation,
            category: formData.category
        },
        theme: {
            color: '#1a4d7a'
        },
        modal: {
            ondismiss: function () {
                console.log('Payment cancelled by user');
            }
        }
    };

    try {
        const razorpay = new Razorpay(options);
        razorpay.on('payment.failed', function (response) {
            handlePaymentFailure(response);
        });
        razorpay.open();
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        alert('Payment system is currently unavailable. Please try again later.');
    }
}

function handlePaymentSuccess(response, formData) {
    // Save registration with payment details
    const registration = {
        ...formData,
        paymentId: response.razorpay_payment_id,
        paymentStatus: 'paid',
        registeredAt: new Date().toISOString(),
        amount: REGISTRATION_AMOUNT / 100
    };

    saveRegistration(registration);

    // Show success message
    registrationForm.style.display = 'none';
    successMessage.classList.add('show');
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    console.log('Registration successful:', registration);
}

function handlePaymentFailure(response) {
    console.error('Payment failed:', response.error);
    alert(`Payment failed: ${response.error.description}\nPlease try again.`);
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

// Video lazy loading
const videoWrapper = document.querySelector('.video-wrapper');
if (videoWrapper) {
    const videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target.querySelector('iframe');
                if (iframe && !iframe.src.includes('autoplay')) {
                    // Video is now visible
                    console.log('Video is in view');
                }
                videoObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    videoObserver.observe(videoWrapper);
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
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

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

console.log('TeamSK Event Page Loaded Successfully!');
