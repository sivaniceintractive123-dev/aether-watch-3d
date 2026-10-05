/**
 * AETHER CALIBRE 01 - Main Application Controller
 * Orchestrates Scene, Scroll, UI Controls, Dossier Drawer,
 * Sound Engine, and Material Customizer.
 */

class HorologicalApplication {
    constructor() {
        this.scene = null;
        this.scrollController = null;
        this.leaderLines = null;
        this.currentTheme = 'titanium';

        this.init();
    }

    init() {
        // 1. Initialize Three.js Scene
        const canvasContainer = document.querySelector('#canvas-stage');
        if (!canvasContainer) {
            console.error('Canvas container not found');
            return;
        }

        this.scene = new WatchScene(canvasContainer);

        // 2. Initialize Dynamic Leader Lines
        this.leaderLines = new TechnicalLeaderLines(this.scene);

        // 3. Initialize Scroll Controller
        this.scrollController = new HorologicalScrollController(this.scene);

        // 4. Setup UI Listeners & Interactions
        this.setupEventListeners();
        this.setupDossierDrawer();
        this.setupCustomizer();
        this.setupOrbitToggle();
        this.setupScrubber();
        this.setupAudioToggle();
        this.setupReservationModal();
        this.setupSpecsModal();

        // 5. Hide Loader smoothly
        this.hideLoader();
    }

    hideLoader() {
        const loader = document.querySelector('#preloader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => {
                    loader.remove();
                }, 800);
            }, 600);
        }
    }

    setupEventListeners() {
        // Floating hover tooltip following cursor
        const tooltip = document.querySelector('#part-hover-tooltip');
        window.addEventListener('watch:part-hovered', (e) => {
            const data = e.detail;
            if (tooltip) {
                tooltip.querySelector('.tooltip-code').textContent = data.code;
                tooltip.querySelector('.tooltip-name').textContent = data.name;
                tooltip.querySelector('.tooltip-spec').textContent = data.materialName;
                tooltip.classList.add('visible');
            }
        });

        window.addEventListener('watch:part-unhovered', () => {
            if (tooltip) {
                tooltip.classList.remove('visible');
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (tooltip && tooltip.classList.contains('visible')) {
                tooltip.style.left = `${e.clientX + 18}px`;
                tooltip.style.top = `${e.clientY + 18}px`;
            }
        });

        // Part Selection -> Open Dossier
        window.addEventListener('watch:part-selected', (e) => {
            this.openDossier(e.detail);
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDossier();
                this.closeModal('#reservation-modal');
                this.closeModal('#specs-modal');
            } else if (e.key.toLowerCase() === 'm') {
                this.toggleSound();
            } else if (e.key.toLowerCase() === 'o') {
                this.toggleOrbit();
            }
        });
    }

    /**
     * Technical Dossier Drawer
     */
    setupDossierDrawer() {
        const drawer = document.querySelector('#dossier-drawer');
        const closeBtn = document.querySelector('#close-dossier-btn');
        const focusBtn = document.querySelector('#focus-part-cam-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeDossier();
            });
        }

        if (focusBtn) {
            focusBtn.addEventListener('click', () => {
                const partId = parseInt(drawer.dataset.activePartId, 10);
                if (partId && this.scene) {
                    this.scene.focusOnPart(partId);
                    focusBtn.textContent = 'CAMERA FOCUSED';
                    setTimeout(() => {
                        focusBtn.textContent = 'FOCUS MACRO CAMERA';
                    }, 2000);
                }
            });
        }
    }

    openDossier(data) {
        const drawer = document.querySelector('#dossier-drawer');
        if (!drawer) return;

        drawer.dataset.activePartId = data.id;
        drawer.querySelector('#dossier-part-code').textContent = `${data.code} // CALIBRE 01`;
        drawer.querySelector('#dossier-part-title').textContent = data.name;
        drawer.querySelector('#dossier-part-role').textContent = data.role;
        drawer.querySelector('#dossier-tolerance').textContent = data.tolerance;
        drawer.querySelector('#dossier-material').textContent = data.materialName;
        drawer.querySelector('#dossier-desc').textContent = data.desc;

        drawer.classList.add('open');
    }

    closeDossier() {
        const drawer = document.querySelector('#dossier-drawer');
        if (drawer) {
            drawer.classList.remove('open');
        }
    }

    /**
     * Material Finish Customizer (Titanium, Rose Gold, Obsidian DLC)
     */
    setupCustomizer() {
        const buttons = document.querySelectorAll('.finish-option-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const finish = btn.dataset.finish;
                this.currentTheme = finish;
                this.scene.materialsManager.setTheme(finish);

                if (window.horologicalAudio) {
                    window.horologicalAudio.playMechanicalChime(784, 0.05); // G5 chime
                }
            });
        });
    }

    /**
     * Free 3D Orbit Inspection Mode Toggle
     */
    setupOrbitToggle() {
        const orbitBtn = document.querySelector('#toggle-orbit-btn');
        const resetBtn = document.querySelector('#reset-cam-btn');

        if (orbitBtn) {
            orbitBtn.addEventListener('click', () => {
                this.toggleOrbit();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.scene.resetCamera();
                if (orbitBtn) {
                    orbitBtn.classList.remove('active');
                    orbitBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                        <span>INSPECT 3D (ORBIT)</span>
                    `;
                }
            });
        }
    }

    toggleOrbit() {
        const orbitBtn = document.querySelector('#toggle-orbit-btn');
        const isNowOrbit = !this.scene.isOrbitMode;
        this.scene.setOrbitMode(isNowOrbit);

        if (orbitBtn) {
            if (isNowOrbit) {
                orbitBtn.classList.add('active');
                orbitBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                    <span>EXIT ORBIT MODE</span>
                `;
            } else {
                orbitBtn.classList.remove('active');
                orbitBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <span>INSPECT 3D (ORBIT)</span>
                `;
                this.scene.resetCamera();
            }
        }
    }

    /**
     * Explode Scrubber Slider (Syncs with Lenis & ScrollTrigger)
     */
    setupScrubber() {
        const slider = document.querySelector('#explode-scrubber');
        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                this.scrollController.scrollToProgress(val);
            });
        }
    }

    /**
     * Audio Engine Mute / Unmute
     */
    setupAudioToggle() {
        const soundBtn = document.querySelector('#toggle-sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.toggleSound();
            });
        }
    }

    toggleSound() {
        const soundBtn = document.querySelector('#toggle-sound-btn');
        if (!window.horologicalAudio) return;

        const isUnmuted = window.horologicalAudio.toggleMute();
        if (soundBtn) {
            if (isUnmuted) {
                soundBtn.classList.add('active');
                soundBtn.innerHTML = `
                    <span class="sound-wave"></span>
                    <span class="sound-wave"></span>
                    <span class="sound-wave"></span>
                    <span>SOUND: 4Hz ESCAPEMENT ON</span>
                `;
            } else {
                soundBtn.classList.remove('active');
                soundBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                    <span>SOUND: MUTED</span>
                `;
            }
        }
    }

    /**
     * Acquisition / Reservation Modal
     */
    setupReservationModal() {
        const openBtns = document.querySelectorAll('.open-reserve-btn');
        const modal = document.querySelector('#reservation-modal');
        const closeBtn = document.querySelector('#close-reserve-btn');
        const form = document.querySelector('#reserve-form');

        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('open');
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.textContent = 'ALLOCATION CONFIRMED (PIECE #042)';
                submitBtn.style.background = '#327c59';
                setTimeout(() => {
                    modal.classList.remove('open');
                    submitBtn.textContent = 'SUBMIT CONCIERGE REQUEST';
                    submitBtn.style.background = '';
                }, 2200);
            });
        }
    }

    /**
     * Full Specifications Modal
     */
    setupSpecsModal() {
        const openBtns = document.querySelectorAll('.open-specs-btn');
        const modal = document.querySelector('#specs-modal');
        const closeBtn = document.querySelector('#close-specs-btn');

        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('open');
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }
    }

    closeModal(selector) {
        const modal = document.querySelector(selector);
        if (modal) modal.classList.remove('open');
    }
}

// Instantiate once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.horologicalApp = new HorologicalApplication();
});
