/**
 * AETHER CALIBRE 01 - Scroll Animation & Lenis Controller
 * Ties normalized scroll progress (0.0 -> 1.0) to 3D watch disassembly,
 * camera orbit, audio ratchet feedback, and narrative phase transitions.
 */

class HorologicalScrollController {
    constructor(watchScene) {
        this.scene = watchScene;
        this.lenis = null;
        this.scrollTrigger = null;
        this.normalizedProgress = 0;
        this.lastProgress = 0;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.initLenis();
        this.initScrollTimeline();
    }

    initLenis() {
        if (typeof Lenis !== 'undefined' && !this.isReducedMotion) {
            this.lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                touchMultiplier: 1.8
            });

            // Connect Lenis to GSAP ScrollTrigger
            this.lenis.on('scroll', (e) => {
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.update();
                }
                // Play subtle mechanical ratchet sound based on scroll velocity
                if (window.horologicalAudio && Math.abs(e.velocity) > 0.4) {
                    window.horologicalAudio.playScrollRatchet(e.velocity);
                }
            });

            gsap.ticker.add((time) => {
                this.lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }

    initScrollTimeline() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn("GSAP / ScrollTrigger not loaded");
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const pinTrack = document.querySelector('#scroll-track');
        if (!pinTrack) return;

        // Master ScrollTrigger across the pinned 500vh track
        this.scrollTrigger = ScrollTrigger.create({
            trigger: '#scroll-track',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.0, // silky smooth scrub damping
            onUpdate: (self) => {
                this.onScrollProgress(self.progress);
            }
        });

        // Setup DOM Narrative Overlays Transitions
        this.setupDOMNarrativeTransitions();
    }

    onScrollProgress(progress) {
        this.normalizedProgress = progress;

        // Skip 3D camera override if user is actively in free 3D Orbit Mode
        if (this.scene.isOrbitMode) {
            this.scene.watchBuilder.updateExplosion(progress);
            return;
        }

        // 1. Explode / Reassemble all 23 watch components
        this.scene.watchBuilder.updateExplosion(progress);

        // 2. Slow, cinematic camera orbit & position based on progress
        const cam = this.scene.camera;
        const watchGroup = this.scene.watchBuilder.watchGroup;

        // Camera path:
        // Assembled: (2.5, 1.8, 13.5)
        // Reveal: (1.8, 0.8, 11.0)
        // Exploded: (4.2, 3.2, 14.8)
        let camTargetPos = new THREE.Vector3();
        let watchRot = new THREE.Euler();

        if (progress < 0.25) {
            // Phase 0 -> 1: Zoom in slightly, reveal craftsmanship
            const t = progress / 0.25;
            camTargetPos.set(
                THREE.MathUtils.lerp(this.scene.cameraBasePos.x, 1.8, t),
                THREE.MathUtils.lerp(this.scene.cameraBasePos.y, 0.8, t),
                THREE.MathUtils.lerp(this.scene.cameraBasePos.z, 11.2, t)
            );
            watchRot.y = THREE.MathUtils.lerp(-0.25, 0.45, t);
            watchRot.x = THREE.MathUtils.lerp(0.08, 0.15, t);
        } else {
            // Phase 1 -> 2 & 3: Pull out to elevated technical perspective
            const t = (progress - 0.25) / 0.75;
            camTargetPos.set(
                THREE.MathUtils.lerp(1.8, 5.0, t),
                THREE.MathUtils.lerp(0.8, 3.2, t),
                THREE.MathUtils.lerp(11.2, this.scene.width < 768 ? 20.0 : 15.6, t)
            );
            watchRot.y = THREE.MathUtils.lerp(0.45, 1.25, t);
            watchRot.x = THREE.MathUtils.lerp(0.15, 0.36, t);
        }

        // Apply camera and watch rotation synchronized with GSAP scrub
        cam.position.copy(camTargetPos);
        cam.lookAt(this.scene.cameraTarget);

        watchGroup.rotation.y = watchRot.y;
        watchGroup.rotation.x = watchRot.x;

        // 3. Optical Alignment Laser Beam opacity
        if (this.scene.alignmentLine) {
            const lineOpacity = Math.max(0, Math.min(0.4, (progress - 0.25) * 0.8));
            this.scene.alignmentLine.material.opacity = lineOpacity;
        }

        // 4. Update HUD Progress Bar, Narrative Text & Scrubber
        this.updateHUDProgressBar(progress);
        this.updateDOMNarratives(progress);

        // 5. Update Technical Leader Lines
        if (window.horologicalApp && window.horologicalApp.leaderLines) {
            window.horologicalApp.leaderLines.update(progress);
        }

        this.lastProgress = progress;
    }

    updateDOMNarratives(progress) {
        // Hero Narrative (Phase 00)
        const hero = document.querySelector('#hero-narrative');
        if (hero) {
            const op = Math.max(0, 1 - progress * 4.5);
            hero.style.opacity = op.toFixed(3);
            hero.style.transform = `translateY(${-progress * 120}px)`;
            hero.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
        }

        // Reveal Narrative (Phase 01)
        const reveal = document.querySelector('#reveal-narrative');
        if (reveal) {
            let op = 0;
            if (progress >= 0.18 && progress <= 0.45) {
                if (progress < 0.30) {
                    op = (progress - 0.18) / 0.12;
                } else {
                    op = 1 - (progress - 0.30) / 0.15;
                }
            }
            reveal.style.opacity = Math.max(0, Math.min(1, op)).toFixed(3);
            reveal.style.transform = `translate(-50%, ${(0.3 - progress) * 40}px)`;
        }

        // Floating Specs HUD (visible during Phase 01)
        const specs = document.querySelector('#floating-specs-hud');
        if (specs) {
            let op = 0;
            if (progress >= 0.15 && progress <= 0.55) {
                if (progress < 0.25) op = (progress - 0.15) / 0.1;
                else if (progress > 0.45) op = 1 - (progress - 0.45) / 0.1;
                else op = 1;
            }
            specs.style.opacity = Math.max(0, Math.min(1, op)).toFixed(3);
            specs.style.pointerEvents = op > 0.2 ? 'auto' : 'none';
        }

        // Exploded Narrative (Phase 03)
        const exploded = document.querySelector('#exploded-narrative');
        if (exploded) {
            const op = progress >= 0.5 ? Math.min(1, (progress - 0.5) / 0.25) : 0;
            exploded.style.opacity = op.toFixed(3);
            exploded.style.transform = `translate(-50%, ${(1 - op) * 20}px)`;
        }

        // Sync Explode Scrubber Slider
        const slider = document.querySelector('#explode-scrubber');
        if (slider && document.activeElement !== slider) {
            slider.value = Math.round(progress * 100);
        }
    }

    setupDOMNarrativeTransitions() {
        // Fade out Hero Section as scrolling begins
        ScrollTrigger.create({
            trigger: '#scroll-track',
            start: 'top top',
            end: '15% top',
            scrub: true,
            onUpdate: (self) => {
                const el = document.querySelector('#hero-narrative');
                if (el) {
                    el.style.opacity = Math.max(0, 1 - self.progress * 1.5);
                    el.style.transform = `translateY(${-self.progress * 80}px)`;
                }
            }
        });

        // Phase 01: Mechanical Reveal (15% to 45%)
        ScrollTrigger.create({
            trigger: '#scroll-track',
            start: '15% top',
            end: '45% top',
            scrub: true,
            onUpdate: (self) => {
                const el = document.querySelector('#reveal-narrative');
                const specs = document.querySelector('#floating-specs-hud');
                if (el) {
                    let op = 0;
                    if (self.progress < 0.5) {
                        op = self.progress * 2;
                    } else {
                        op = (1 - self.progress) * 2;
                    }
                    el.style.opacity = op;
                    el.style.transform = `translateY(${(1 - self.progress) * 40}px)`;
                }
                if (specs) {
                    specs.style.opacity = self.progress > 0.1 && self.progress < 0.9 ? 1 : 0;
                }
            }
        });

        // Phase 02 & 03: Exploded Architecture (55% to 100%)
        ScrollTrigger.create({
            trigger: '#scroll-track',
            start: '55% top',
            end: '100% top',
            scrub: true,
            onUpdate: (self) => {
                const el = document.querySelector('#exploded-narrative');
                const leaderOverlay = document.querySelector('#leader-lines-container');
                const inspectionHUD = document.querySelector('#inspection-hud-controls');

                if (el) {
                    el.style.opacity = self.progress;
                    el.style.transform = `translateY(${(1 - self.progress) * 30}px)`;
                }
                if (leaderOverlay) {
                    leaderOverlay.style.opacity = self.progress > 0.4 ? 1 : 0;
                    leaderOverlay.style.pointerEvents = self.progress > 0.4 ? 'auto' : 'none';
                }
                if (inspectionHUD) {
                    inspectionHUD.style.opacity = self.progress > 0.5 ? 1 : 0;
                    inspectionHUD.style.pointerEvents = self.progress > 0.5 ? 'auto' : 'none';
                }
            }
        });
    }

    updateHUDProgressBar(progress) {
        const fill = document.querySelector('#scroll-progress-fill');
        const text = document.querySelector('#scroll-progress-pct');
        if (fill) {
            fill.style.width = `${(progress * 100).toFixed(1)}%`;
        }
        if (text) {
            text.textContent = `${Math.round(progress * 100)}%`;
        }

        // Active Phase Indicator
        const phaseLabel = document.querySelector('#current-phase-label');
        if (phaseLabel) {
            if (progress < 0.2) {
                phaseLabel.textContent = "PHASE 00 — ASSEMBLED CHRONOMÈTRE";
            } else if (progress < 0.45) {
                phaseLabel.textContent = "PHASE 01 — MECHANICAL REVEAL";
            } else if (progress < 0.8) {
                phaseLabel.textContent = "PHASE 02 — CALIBRATED DISASSEMBLY";
            } else {
                phaseLabel.textContent = "PHASE 03 — ARCHITECTURE OF TIME";
            }
        }
    }

    /**
     * Programmatically scroll to normalized position (used by scrubber slider)
     */
    scrollToProgress(targetProgress) {
        if (!this.scrollTrigger) return;
        const totalScroll = this.scrollTrigger.end - this.scrollTrigger.start;
        const targetScrollY = this.scrollTrigger.start + totalScroll * targetProgress;

        if (this.lenis) {
            this.lenis.scrollTo(targetScrollY, { duration: 1.0 });
        } else {
            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        }
    }
}

window.HorologicalScrollController = HorologicalScrollController;
