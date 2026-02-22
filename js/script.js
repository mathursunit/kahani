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

// --- Audio Reading Logic ---
let synth = window.speechSynthesis;
let ambientAudioCtx = null;
let ambientOscillators = [];
let isPlaying = false;
let currentUtterance = null;
let paragraphQueue = [];
let currentParagraphIndex = 0;
let currentVoiceAccent = 'en-US';
let currentVoiceGender = 'female';
let isRestarting = false;

// Warm-up Speech Synthesis to guarantee voices load on Mac/Chrome
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

function createAmbientSound() {
    if (!ambientAudioCtx) {
        ambientAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ambientAudioCtx.state === 'suspended') {
        ambientAudioCtx.resume();
    }

    // Create a low drone - suited for tension/drama
    const masterGain = ambientAudioCtx.createGain();
    masterGain.gain.value = 0.03; // Keep it quiet and ambient
    masterGain.connect(ambientAudioCtx.destination);

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

        osc.connect(masterGain);
        osc.start();
        lfo.start();

        ambientOscillators.push({ osc, lfo });
    });
}

function stopAmbientSound() {
    ambientOscillators.forEach(nodes => {
        nodes.osc.stop();
        nodes.lfo.stop();
        nodes.osc.disconnect();
        nodes.lfo.disconnect();
    });
    ambientOscillators = [];
}

function stopAudioReading() {
    isRestarting = false;
    if (synth) synth.cancel();
    stopAmbientSound();
    isPlaying = false;
    currentUtterance = null;

    const modalBody = document.getElementById('modal-body');
    if (modalBody) modalBody.classList.remove('reading-mode');
    document.querySelectorAll('.reading-active').forEach(el => el.classList.remove('reading-active'));

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

function playNextParagraph() {
    if (!isPlaying || currentParagraphIndex >= paragraphQueue.length) {
        stopAudioReading();
        return;
    }

    document.querySelectorAll('.reading-active').forEach(el => el.classList.remove('reading-active'));

    const currentEl = paragraphQueue[currentParagraphIndex];
    currentEl.classList.add('reading-active');

    // Scroll element smoothly into view
    currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Clean text for speaking (handling the Dropcap 'I t' separation)
    let textToSpeak = currentEl.innerText || currentEl.textContent;
    textToSpeak = textToSpeak.replace(/^([A-Z])\s+([a-z])/, '$1$2');

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = synth.getVoices();

    // Ensure we don't pick opposite gender
    if (voices.length > 0) {
        let preferredVoice = null;

        // Console debug line:
        console.log(`Kahani TTS Engine | Total Voices: ${voices.length} | Searching for: ${currentVoiceAccent} / ${currentVoiceGender}`);

        const femaleRegex = /(female|veena|lekha|samantha|victoria|karen|tessa|moira|serena|nicole|ava|allison|susan|zira|amy|hazel|fiona|neerja|majka|siri|kathy|catherine|alice|grandma)/i;
        const maleRegex = /(male|rishi|alex|daniel|fred|oliver|tom|george|david|mark|ravi|brian|arthur|aaron|bruce|martin|floyd|grandpa)/i;

        // 1. Filter explicitly by Gender First
        let genderVoices = voices;
        if (currentVoiceGender === 'female') {
            genderVoices = voices.filter(v => femaleRegex.test(v.name) || (v.voiceURI && femaleRegex.test(v.voiceURI)));
            if (genderVoices.length === 0) {
                // Failsafe: drop everything that sounds male
                genderVoices = voices.filter(v => !maleRegex.test(v.name));
            }
        } else if (currentVoiceGender === 'male') {
            genderVoices = voices.filter(v => maleRegex.test(v.name) || (v.voiceURI && maleRegex.test(v.voiceURI)));
            if (genderVoices.length === 0) {
                // Failsafe: drop everything that sounds female
                genderVoices = voices.filter(v => !femaleRegex.test(v.name));
            }
        }

        if (genderVoices.length === 0) genderVoices = voices;

        // 2. Filter the gendered pool by Accent
        let accentVoices = genderVoices.filter(v => v.lang.includes(currentVoiceAccent));

        if (accentVoices.length === 0) {
            console.log(`Kahani TTS Engine | Custom Accent ${currentVoiceAccent} not found for this gender. Falling back to 'en'.`);
            accentVoices = genderVoices.filter(v => v.lang.includes('en'));
        }

        // 3. Select final voice
        preferredVoice = accentVoices[0] || genderVoices[0];

        if (preferredVoice) {
            console.log(`Kahani TTS Engine | SELECTED VOICE: ${preferredVoice.name} (${preferredVoice.lang})`);
            utterance.voice = preferredVoice;
        } else {
            console.warn("Kahani TTS Engine | Could not select a voice!");
        }
    }

    const speedSelect = document.getElementById('audio-speed');
    const userSpeed = speedSelect ? parseFloat(speedSelect.value) : 0.9;

    utterance.rate = userSpeed;
    utterance.pitch = 0.9;

    utterance.onend = () => {
        if (!isRestarting) {
            currentParagraphIndex++;
            playNextParagraph();
        } else {
            isRestarting = false;
            playNextParagraph();
        }
    };

    utterance.onerror = (e) => {
        if (isRestarting) {
            isRestarting = false;
            playNextParagraph();
            return;
        }
        console.error("Speech error", e);
        stopAudioReading();
    };

    currentUtterance = utterance;
    synth.speak(utterance);
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

    document.getElementById('modal-body').classList.add('reading-mode');

    // Collect paragraphs and headers
    paragraphQueue = Array.from(document.getElementById('modal-body').querySelectorAll('p, h3'));
    currentParagraphIndex = 0;

    createAmbientSound();

    // Call playNextParagraph immediately to satisfy browser user-gesture requirements
    // Do not use setTimeout here as browsers will block TTS
    playNextParagraph();
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

    // Set voice configuration for the current story
    currentVoiceAccent = rawContent.getAttribute('data-voice-accent') || 'en-US';
    currentVoiceGender = rawContent.getAttribute('data-voice-gender') || 'female';

    // Set body content
    document.getElementById('modal-body').innerHTML = rawContent.innerHTML;

    // Handle Audio button visibility and event attachment
    const audioBtn = document.getElementById('audio-btn');
    const audioSpeedBtn = document.getElementById('audio-speed');

    if (audioBtn) {
        if (rawContent.getAttribute('data-audio') === 'true') {
            audioBtn.style.display = 'flex';
            if (audioSpeedBtn) {
                audioSpeedBtn.style.display = 'flex';
                audioSpeedBtn.onchange = () => {
                    if (isPlaying) {
                        isRestarting = true;
                        synth.cancel();
                        setTimeout(() => {
                            if (isRestarting) {
                                isRestarting = false;
                                playNextParagraph();
                            }
                        }, 100);
                    }
                };
            }
            stopAudioReading(); // reset state
            audioBtn.onclick = () => {
                if (isPlaying) {
                    stopAudioReading();
                } else {
                    startAudioReading();
                }
            };
        } else {
            audioBtn.style.display = 'none';
            if (audioSpeedBtn) audioSpeedBtn.style.display = 'none';
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

