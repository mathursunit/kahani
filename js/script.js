// Intersection Observer for fade-in animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Glass navbar scroll effect
    const nav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(15, 15, 23, 0.85)';
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            nav.style.background = 'rgba(20, 20, 30, 0.5)';
            nav.style.boxShadow = 'none';
        }
    });
});

// Story Modal Logic
function openStory(templateId) {
    const template = document.getElementById(templateId);
    if (!template) return;

    // Extract content from template content
    const rawContent = template.content ? template.content.querySelector('div') : template.querySelector('div');
    if (!rawContent) return;

    // Set header information
    document.getElementById('modal-title').innerText = rawContent.getAttribute('data-title') || '';
    document.getElementById('modal-tag').innerText = rawContent.getAttribute('data-tag') || '';

    // Set body content
    document.getElementById('modal-body').innerHTML = rawContent.innerHTML;

    // Show modal and prevent background scroll
    document.getElementById('story-modal').classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Scroll modal to top
    const scrollArea = document.getElementById('kindle-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
}

// Close Modal Events
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('story-modal').classList.remove('is-open');
            document.body.style.overflow = '';
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('story-modal').classList.remove('is-open');
            document.body.style.overflow = '';
        }
    });
});

