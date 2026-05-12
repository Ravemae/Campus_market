/**
 * QuickMart - Campus Marketplace
 * Interactive JavaScript Functions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initVendorTabs();
    initTestimonialSlider();
    initChatbot();
    initScrollAnimations();
});

/**
 * Navbar scroll effect
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Vendor tabs filtering
 */
function initVendorTabs() {
    const tabs = document.querySelectorAll('.vendor-tab');
    const cards = document.querySelectorAll('.vendor-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;

            // Filter cards
            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * Testimonial slider
 */
function initTestimonialSlider() {
    const slider = document.querySelector('.testimonials-slider');
    const cards = document.querySelectorAll('.testimonial-card');
    const navButtons = document.querySelectorAll('.t-nav-btn');
    let currentIndex = 0;
    let autoSlideInterval;

    function goToSlide(index) {
        currentIndex = index;
        const offset = index * 100;
        slider.scrollTo({
            left: slider.offsetWidth * index,
            behavior: 'smooth'
        });

        // Update nav buttons
        navButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    }

    // Nav button clicks
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            goToSlide(index);
            resetAutoSlide();
        });
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < cards.length - 1) {
                goToSlide(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                goToSlide(currentIndex - 1);
            }
            resetAutoSlide();
        }
    }

    // Auto slide
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % cards.length;
            goToSlide(nextIndex);
        }, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Start auto-slide
    startAutoSlide();

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    slider.addEventListener('mouseleave', startAutoSlide);
}

/**
 * AI Chatbot functionality
 */
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('chatbot-messages');
    const quickReplies = document.querySelectorAll('.quick-reply');

    // Toggle chatbot
    chatbotToggle.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active')) {
            chatbotInput.focus();
            // Hide badge
            const badge = this.querySelector('.chatbot-badge');
            if (badge) badge.style.display = 'none';
        }
    });

    // Close chatbot
    chatbotClose.addEventListener('click', function() {
        chatbotWindow.classList.remove('active');
    });

    // Send message
    function sendMessage(message) {
        if (!message.trim()) return;

        // Add user message
        addMessage(message, 'user');

        // Clear input
        chatbotInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response, 'bot');
        }, 800);
    }

    // Add message to chat
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${type === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Bot responses
    function getBotResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('order') || lowerMessage.includes('how')) {
            return "To place an order, simply browse our vendors, add items to your cart from multiple shops, and checkout with Paystack. Your order will be delivered via Keke Napep in 15-30 minutes! 🛵";
        } else if (lowerMessage.includes('delivery') || lowerMessage.includes('time')) {
            return "Our average delivery time is 15-30 minutes! We use Keke Napep riders who know the campus well and can navigate quickly to your location. Delivery starts from just ₦100. 📍";
        } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
            return "We accept multiple payment methods through Paystack: debit cards, bank transfers, and USSD. All transactions are secure and encrypted. 💳";
        } else if (lowerMessage.includes('vendor') || lowerMessage.includes('sell')) {
            return "To become a vendor, click the 'Become a Vendor' button and fill out the application form. Our team will review and get back to you within 48 hours! 🏪";
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! 👋 Welcome to QuickMart. How can I assist you today?";
        } else if (lowerMessage.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with? 😊";
        } else {
            return "I'd be happy to help! You can ask me about placing orders, delivery times, payment methods, or becoming a vendor. What would you like to know?";
        }
    }

    // Send button click
    sendBtn.addEventListener('click', function() {
        sendMessage(chatbotInput.value);
    });

    // Enter key
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(chatbotInput.value);
        }
    });

    // Quick replies
    quickReplies.forEach(reply => {
        reply.addEventListener('click', function() {
            const message = this.textContent;
            sendMessage(message);
        });
    });
}

/**
 * Scroll animations using Intersection Observer
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add specific animation class based on element
                if (entry.target.classList.contains('feature-card')) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                } else if (entry.target.classList.contains('vendor-card')) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                } else if (entry.target.classList.contains('testimonial-card')) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animateElements = document.querySelectorAll('.feature-card, .vendor-card, .testimonial-card, .section-header');
    animateElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

/**
 * Progress bar animation for delivery section
 */
function animateDeliveryProgress() {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        let width = 0;
        const targetWidth = 70;
        const interval = setInterval(() => {
            if (width >= targetWidth) {
                clearInterval(interval);
            } else {
                width += 2;
                progressBar.style.width = width + '%';
            }
        }, 50);
    }
}

// Animate delivery progress when section is visible
const deliveryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateDeliveryProgress();
            deliveryObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const deliverySection = document.querySelector('.delivery-info-card');
if (deliverySection) {
    deliveryObserver.observe(deliverySection);
}

/**
 * Hero phone animation on load
 */
window.addEventListener('load', function() {
    const heroPhone = document.querySelector('.hero-phone');
    if (heroPhone) {
        heroPhone.style.opacity = '0';
        heroPhone.style.transform = 'translateY(30px)';
        setTimeout(() => {
            heroPhone.style.transition = 'all 0.8s ease';
            heroPhone.style.opacity = '1';
            heroPhone.style.transform = 'translateY(0)';
        }, 300);
    }
});

/**
 * Parallax effect for hero section
 */
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

/**
 * Add hover effects to vendor cards
 */
document.querySelectorAll('.vendor-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

/**
 * Handle window resize
 */
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            const hamburger = document.getElementById('hamburger');
            const mobileMenu = document.getElementById('mobile-menu');
            if (hamburger && mobileMenu) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }, 250);
});

/**
 * Preloader (optional - can be enabled if needed)
 */
// window.addEventListener('load', function() {
//     const preloader = document.getElementById('preloader');
//     if (preloader) {
//         preloader.style.opacity = '0';
//         setTimeout(() => {
//             preloader.style.display = 'none';
//         }, 500);
//     }
// });

console.log('QuickMart Landing Page Initialized Successfully! 🚀');