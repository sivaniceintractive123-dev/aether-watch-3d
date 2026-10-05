/**
 * AETHER CALIBRE 01 - Horological Audio Engine
 * Pure procedural Web Audio API synthesis for mechanical escapement ticking
 * and scroll-driven winding ratchets.
 */

class HorologicalAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = true; // start muted by default for UX friendliness, toggleable
        this.isPlayingTick = false;
        this.tickInterval = null;
        this.tickStep = 0;
        this.lastScrollY = 0;
        this.ratchetThrottle = 0;
        
        this.init();
    }

    init() {
        // AudioContext will be initialized on first user interaction
        const unlock = () => {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('scroll', unlock);
        };

        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('scroll', unlock, { once: true });
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.ensureContext();
        this.isMuted = !this.isMuted;
        if (!this.isMuted) {
            this.startTicking();
            this.playMechanicalChime(587.33, 0.08); // D5 note soft confirmation chime
        } else {
            this.stopTicking();
        }
        return !this.isMuted;
    }

    /**
     * Synthesize authentic 4Hz (28,800 vph) mechanical watch escapement:
     * 8 beats per second with alternating "tic" and "tac" acoustic signatures.
     * Includes pallet stone jewel strike (high frequency ping) and balance impulse.
     */
    playTick() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const isTic = (this.tickStep % 2 === 0);
        this.tickStep++;

        // Base frequency: Tic (2400Hz) vs Tac (2150Hz)
        const baseFreq = isTic ? 2450 : 2180;
        const pingFreq = isTic ? 5800 : 5400;

        // 1. Escapement Jewel Strike (synthetic ruby pallet stone impacting escape tooth)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.018);

        gain1.gain.setValueAtTime(0.06, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.025);

        // 2. High-frequency micro-metallic ring (balance spring resonation)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(pingFreq, now);
        osc2.frequency.exponentialRampToValueAtTime(pingFreq * 0.8, now + 0.035);

        gain2.gain.setValueAtTime(0.015, now);
        gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.04);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.045);

        // 3. Low-body impulse (case resonance)
        const noiseBuffer = this.createMicroNoiseBuffer(0.015);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1600;
            filter.Q.value = 3.0;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.03, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(now);
        }
    }

    createMicroNoiseBuffer(duration) {
        if (!this.ctx) return null;
        const sampleRate = this.ctx.sampleRate;
        const frameCount = sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        return buffer;
    }

    startTicking() {
        if (this.tickInterval) clearInterval(this.tickInterval);
        // 28,800 vph = 8 beats per sec = 125ms per tick
        this.tickInterval = setInterval(() => {
            this.playTick();
        }, 125);
    }

    stopTicking() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    }

    /**
     * Mechanical ratchet sound triggered when scrolling through exploded stages
     * Gives tactile acoustic feedback like turning the crown or winding the barrel
     */
    playScrollRatchet(velocity = 1) {
        if (this.isMuted || !this.ctx) return;
        const now = Date.now();
        if (now - this.ratchetThrottle < 35) return;
        this.ratchetThrottle = now;

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const pitch = 3200 + Math.min(velocity * 80, 1400);
        osc.type = 'square';
        osc.frequency.setValueAtTime(pitch, time);
        osc.frequency.exponentialRampToValueAtTime(800, time + 0.012);

        const vol = Math.min(0.025 * Math.abs(velocity), 0.04);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.012);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.015);
    }

    playHoverChime(freq = 1200) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.06);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    playMechanicalChime(freq = 880, vol = 0.05) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
    }
}

window.horologicalAudio = new HorologicalAudio();
