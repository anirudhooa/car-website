// API Configuration
const API_URL = window.location.origin;

// DOM Elements
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-links a');
const statNumbers = document.querySelectorAll('.stat-number');
const specTabs = document.querySelectorAll('.spec-tab');
const specContents = document.querySelectorAll('.specs-content-tab');
const testimonials = document.querySelectorAll('.testimonial');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const modalClose = document.querySelector('.modal-close');
const modalCaption = document.querySelector('.modal-caption');
const contactForm = document.querySelector('.contact-form');
const modelsGrid = document.querySelector('.models-grid');

// ==================== API FUNCTIONS ====================

// Fetch cars from backend
async function fetchCars() {
    try {
        const response = await fetch(`${API_URL}/api/cars`);
        const data = await response.json();
        if (data.cars) {
            renderCars(data.cars);
        }
    } catch (error) {
        console.error('Error fetching cars:', error);
    }
}

// Fetch testimonials from backend
async function fetchTestimonials() {
    try {
        const response = await fetch(`${API_URL}/api/testimonials`);
        const data = await response.json();
        if (data.testimonials && data.testimonials.length > 0) {
            renderTestimonials(data.testimonials);
        }
    } catch (error) {
        console.error('Error fetching testimonials:', error);
    }
}

// Submit contact form
async function submitContact(formData) {
    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Success! Your message has been sent.', 'success');
            return true;
        } else {
            showNotification(result.error || 'Something went wrong.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error submitting contact:', error);
        showNotification('Failed to send message. Please try again.', 'error');
        return false;
    }
}

// Book test drive
async function bookTestDrive(formData) {
    try {
        const response = await fetch(`${API_URL}/api/test-drive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification(`Test drive booked! Reference: ${result.booking_reference}`, 'success');
            return true;
        } else {
            showNotification(result.error || 'Failed to book test drive.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error booking test drive:', error);
        showNotification('Failed to book test drive. Please try again.', 'error');
        return false;
    }
}

// ==================== RENDER FUNCTIONS ====================

// Render cars dynamically
function renderCars(cars) {
    if (!modelsGrid) return;

    modelsGrid.innerHTML = cars.map(car => `
        <div class="model-card ${car.featured ? 'featured' : ''}" data-id="${car.id}">
            ${car.featured ? '<div class="featured-badge">Flagship</div>' : ''}
            <div class="model-image">
                <img src="${car.image_url}" alt="${car.name}" loading="lazy">
                <div class="model-overlay">
                    <button class="btn btn-small" onclick="showTestDriveModal(${car.id}, '${car.name}')">Book Test Drive</button>
                </div>
            </div>
            <div class="model-info">
                <h3>${car.name}</h3>
                <p class="model-tagline">${car.tagline || 'Premium Luxury'}</p>
                <div class="model-specs">
                    <span><i class="fas fa-tachometer-alt"></i> ${car.acceleration}s</span>
                    <span><i class="fas fa-bolt"></i> ${car.horsepower} HP</span>
                </div>
                <p class="model-price">From $${car.price?.toLocaleString() || 'Contact Us'}</p>
            </div>
        </div>
    `).join('');
}

// Render testimonials dynamically
function renderTestimonials(testimonialData) {
    const slider = document.querySelector('.testimonial-slider');
    if (!slider) return;

    const testimonialsContainer = slider.querySelectorAll('.testimonial');
    testimonialsContainer.forEach((t, index) => {
        if (testimonialData[index]) {
            const data = testimonialData[index];
            t.querySelector('.testimonial-text').textContent = `"${data.quote}"`;
            t.querySelector('.testimonial-author h4').textContent = data.name;
            t.querySelector('.testimonial-author span').textContent = `${data.car_model} Owner`;
            t.querySelector('.testimonial-author img').src = data.image_url;
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Test Drive Modal
function showTestDriveModal(carId, carName) {
    const modal = document.createElement('div');
    modal.className = 'test-drive-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close-btn">&times;</span>
            <h2>Book Test Drive - ${carName}</h2>
            <form id="testDriveForm">
                <div class="form-group">
                    <input type="text" name="name" placeholder="Full Name" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="Email Address" required>
                </div>
                <div class="form-group">
                    <input type="tel" name="phone" placeholder="Phone Number" required>
                </div>
                <div class="form-group">
                    <input type="date" name="preferred_date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <select name="preferred_time">
                        <option value="">Preferred Time</option>
                        <option value="morning">Morning (9AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                        <option value="evening">Evening (5PM - 8PM)</option>
                    </select>
                </div>
                <div class="form-group">
                    <textarea name="notes" placeholder="Additional Notes (optional)" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Confirm Booking</button>
            </form>
        </div>
    `;

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;

    modal.querySelector('.modal-content').style.cssText = `
        background: #1a1a1a;
        padding: 40px;
        border-radius: 10px;
        max-width: 500px;
        width: 100%;
        position: relative;
        border: 1px solid #e63946;
    `;

    modal.querySelector('.modal-close-btn').style.cssText = `
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 30px;
        cursor: pointer;
        color: #888;
        transition: color 0.3s;
    `;

    modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    const form = modal.querySelector('#testDriveForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            model: carName,
            preferred_date: form.preferred_date.value,
            preferred_time: form.preferred_time.value,
            notes: form.notes.value
        };

        const success = await bookTestDrive(formData);
        if (success) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// ==================== EVENT LISTENERS ====================

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu on link click
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// Stats Counter Animation
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const isFloat = target % 1 !== 0;

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = isFloat ? start.toFixed(1) : Math.floor(start).toLocaleString();
        }
    }, 16);
};

// Intersection Observer for Stats
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseFloat(entry.target.dataset.target);
            animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => statsObserver.observe(stat));

// Specifications Tabs
specTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        specTabs.forEach(t => t.classList.remove('active'));
        specContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Testimonial Slider
let currentTestimonial = 0;

const showTestimonial = (index) => {
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
};

const nextTestimonial = () => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
};

const prevTestimonialFunc = () => {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
};

nextBtn?.addEventListener('click', nextTestimonial);
prevBtn?.addEventListener('click', prevTestimonialFunc);

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentTestimonial = index;
        showTestimonial(currentTestimonial);
    });
});

// Auto-rotate testimonials
setInterval(nextTestimonial, 6000);

// Gallery Modal
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        modalImg.src = img.src;
        modalCaption.textContent = img.alt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

const closeModalFunc = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

modalClose?.addEventListener('click', closeModalFunc);
modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunc();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModalFunc();
});

// Contact Form
contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: contactForm.querySelector('input[type="text"]').value,
        email: contactForm.querySelector('input[type="email"]').value,
        phone: contactForm.querySelector('input[type="tel"]')?.value || '',
        model_interest: contactForm.querySelector('select')?.value || '',
        message: contactForm.querySelector('textarea')?.value || ''
    };

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const success = await submitContact(formData);

    btn.disabled = false;
    btn.textContent = 'Send Request';

    if (success) {
        contactForm.reset();
    }
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroOverlay = document.querySelector('.hero-overlay');
    if (heroOverlay && scrolled < window.innerHeight) {
        heroOverlay.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Intersection Observer for Fade-in Animations
const fadeElements = document.querySelectorAll('.model-card, .gallery-item, .spec-row');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
});

// Active Navigation Highlight
const sections = document.querySelectorAll('section[id]');

const highlightNav = () => {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinkItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

window.addEventListener('scroll', highlightNav);

// ==================== INITIALIZATION ====================

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchCars();
    fetchTestimonials();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Preloader
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Console Easter Egg
console.log('%c APEX MOTORS ', 'background: #e63946; color: #ffffff; font-size: 24px; font-weight: bold; padding: 10px 20px;');
console.log('%c Welcome to the pinnacle of automotive excellence ', 'color: #e63946; font-size: 14px;');
console.log('%c Backend API: ' + API_URL, 'color: #888; font-size: 12px;');
