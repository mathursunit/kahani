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

    // Theme Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-pill');
    const stories = document.querySelectorAll('.story-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            stories.forEach(card => {
                const cardTheme = card.getAttribute('data-theme');
                if (filter === 'all' || cardTheme === filter) {
                    card.classList.remove('hidden');
                    // Trigger reflow for animation if needed
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.classList.add('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                }
            });
        });
    });
});

// --- Audio Reading Logic ---
let ambientAudioCtx = null;
let ambientOscillators = [];
let masterGainNode = null;
let isPlaying = false;
let audioElements = [];
let currentAudioPartIndex = 0;
let currentAudioObj = null;
let currentStoryId = null;

function createAmbientSound() {
    if (!ambientAudioCtx) {
        ambientAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ambientAudioCtx.state === 'suspended') {
        ambientAudioCtx.resume();
    }

    // Create a low drone - suited for tension/drama
    masterGainNode = ambientAudioCtx.createGain();
    masterGainNode.gain.setValueAtTime(0, ambientAudioCtx.currentTime);
    masterGainNode.gain.linearRampToValueAtTime(0.06, ambientAudioCtx.currentTime + 3);
    masterGainNode.connect(ambientAudioCtx.destination);

    const freqs = [55, 110, 165]; // Low A notes
    freqs.forEach(freq => {
        const osc = ambientAudioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const lfo = ambientAudioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // slow modulation
        const lfoGain = ambientAudioCtx.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(masterGainNode);
        osc.start();
        lfo.start();

        ambientOscillators.push({ osc, lfo });
    });
}

function stopAmbientSound() {
    if (masterGainNode && ambientAudioCtx) {
        masterGainNode.gain.linearRampToValueAtTime(0, ambientAudioCtx.currentTime + 1);
        setTimeout(() => {
            ambientOscillators.forEach(nodes => {
                try {
                    nodes.osc.stop();
                    nodes.lfo.stop();
                    nodes.osc.disconnect();
                    nodes.lfo.disconnect();
                } catch (e) { }
            });
            ambientOscillators = [];
            masterGainNode = null;
        }, 1200);
    }
}

function stopAudioReading() {
    if (currentAudioObj) {
        currentAudioObj.pause();
        currentAudioObj.currentTime = 0;
        currentAudioObj = null;
    }
    stopAmbientSound();
    isPlaying = false;

    const modalBody = document.getElementById('modal-body');
    if (modalBody) modalBody.classList.remove('reading-mode');

    const audioBtn = document.getElementById('audio-btn');
    if (audioBtn) {
        audioBtn.classList.remove('playing');
        audioBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
            Listen
        `;
    }
}

function playNextAudioPart() {
    if (!isPlaying || currentAudioPartIndex >= audioElements.length) {
        currentAudioPartIndex = 0; // Reset for next time if finished
        if (currentStoryId) localStorage.setItem('kahani_progress_' + currentStoryId, 0);
        stopAudioReading();
        return;
    }

    if (currentStoryId) localStorage.setItem('kahani_progress_' + currentStoryId, currentAudioPartIndex);
    currentAudioObj = audioElements[currentAudioPartIndex];

    // Default dramatic pacing
    let delay = 600;

    // Special beats for "Shattering the Illusion" (story-3)
    const modalTitle = document.getElementById('modal-title').innerText;
    if (modalTitle === "Shattering the Illusion") {
        if (currentAudioPartIndex === 2) delay = 1500; // After "Seen. No reply."
        if (currentAudioPartIndex === 3) delay = 800;  // Before "The caption read..."
        if (currentAudioPartIndex === 8) delay = 1200; // Before final reveal
    }

    // Special beats for "The Inheritance Trap" (story-2)
    if (modalTitle === "The Inheritance Trap") {
        if (currentAudioPartIndex === 4) delay = 1500; // Dramatic pause before ASI reveal
    }

    setTimeout(() => {
        if (!isPlaying) return;

        currentAudioObj.play().catch(e => console.error(e));
        currentAudioObj.onended = () => {
            currentAudioPartIndex++;
            playNextAudioPart();
        };
    }, delay);
}

function startAudioReading() {
    if (isPlaying) return;
    isPlaying = true;

    const audioBtn = document.getElementById('audio-btn');
    if (audioBtn) {
        audioBtn.classList.add('playing');
        audioBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <rect x="9" y="9" width="6" height="6"></rect>
            </svg>
            Stop
        `;
    }

    // Enter a cinematic reading mode
    document.getElementById('modal-body').classList.add('reading-mode');

    createAmbientSound();
    // currentAudioPartIndex is already set by openStory or previous play state
    playNextAudioPart();
}

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

    // Handle Audio Drama Logic
    const audioBtn = document.getElementById('audio-btn');
    const audioSpeedBtn = document.getElementById('audio-speed');

    // Hide speed button as it breaks pre-recorded timing
    if (audioSpeedBtn) audioSpeedBtn.style.display = 'none';

    if (audioBtn) {
        const dramaLinks = rawContent.getAttribute('data-audio-drama');
        if (dramaLinks) {
            audioBtn.style.display = 'flex';

            // Preload tracks
            audioElements = dramaLinks.split(',').map(src => {
                const a = new Audio(src);
                a.preload = 'auto';
                return a;
            });

            currentStoryId = templateId;
            currentAudioPartIndex = parseInt(localStorage.getItem('kahani_progress_' + currentStoryId)) || 0;

            stopAudioReading(); // reset playback state but keep currentAudioPartIndex progress
            audioBtn.onclick = () => {
                if (isPlaying) {
                    stopAudioReading();
                } else {
                    startAudioReading();
                }
            };
        } else {
            audioBtn.style.display = 'none';
            stopAudioReading();
        }
    }

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
            if (typeof stopAudioReading === 'function') stopAudioReading();
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('story-modal').classList.remove('is-open');
            document.body.style.overflow = '';
            if (typeof stopAudioReading === 'function') stopAudioReading();
        }
    });

    // Fullscreen Toggle
    const fsBtn = document.querySelector('.js-toggle-fullscreen');
    const modalContainer = document.querySelector('.kindle-modal-container');
    const expandIcon = document.querySelector('.icon-expand');
    const compressIcon = document.querySelector('.icon-compress');

    if (fsBtn) {
        fsBtn.addEventListener('click', () => {
            modalContainer.classList.toggle('is-fullscreen');
            if (modalContainer.classList.contains('is-fullscreen')) {
                if (expandIcon) expandIcon.style.display = 'none';
                if (compressIcon) compressIcon.style.display = 'block';
            } else {
                if (expandIcon) expandIcon.style.display = 'block';
                if (compressIcon) compressIcon.style.display = 'none';
            }
        });
    }
});

