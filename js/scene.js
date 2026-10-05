/**
 * AETHER CALIBRE 01 - Three.js Cinematic Scene, Lighting & Raycaster Engine
 * Implements ACESFilmic tone-mapping, multi-point horological studio lighting,
 * atmospheric particle field, dynamic raycasting, and dual-mode camera system.
 */

class WatchScene {
    constructor(canvasContainer) {
        this.container = canvasContainer;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Core Three.js Objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.orbitControls = null;
        this.isOrbitMode = false;

        // Managers & Builders
        this.materialsManager = null;
        this.watchBuilder = null;

        // Interactive Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.hoveredPart = null;
        this.selectedPart = null;

        // Optical Alignment Line
        this.alignmentLine = null;

        // Particle field
        this.particles = null;

        // Camera animation targets
        this.cameraBasePos = new THREE.Vector3(2.5, 1.8, 13.5);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);

        // Clock & Delta
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // transparent to allow deep CSS gradient background

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
        this.updateResponsiveCamera();
        this.camera.position.copy(this.cameraBasePos);
        this.camera.lookAt(this.cameraTarget);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        // 4. Orbit Controls (for free 3D inspection)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.orbitControls.enableDamping = true;
            this.orbitControls.dampingFactor = 0.05;
            this.orbitControls.enablePan = false;
            this.orbitControls.minDistance = 6;
            this.orbitControls.maxDistance = 24;
            this.orbitControls.enabled = false; // Disabled by default until user activates Orbit Mode
        }

        // 5. Materials & 3D Watch Model
        this.materialsManager = new HorologicalMaterials();
        this.watchBuilder = new WatchGeometryBuilder(this.materialsManager);
        this.scene.add(this.watchBuilder.watchGroup);

        // 6. Setup Lighting, Alignment Line & Particles
        this.setupLighting();
        this.setupOpticalAlignmentLine();
        this.setupParticles();

        // 7. Event Listeners
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
        window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });

        // 8. Start Render Loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    setupLighting() {
        // Ambient fill
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Key Light (Warm horological studio softbox)
        const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.4);
        keyLight.position.set(6, 8, 10);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.bias = -0.0001;
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far = 25;
        keyLight.shadow.camera.left = -5;
        keyLight.shadow.camera.right = 5;
        keyLight.shadow.camera.top = 5;
        keyLight.shadow.camera.bottom = -5;
        this.scene.add(keyLight);

        // Rim Light (Cold cyan/blue edge grazing light for metal chamfer glints)
        const rimLight = new THREE.DirectionalLight(0x7eb0ea, 2.8);
        rimLight.position.set(-8, -6, -8);
        this.scene.add(rimLight);

        // Secondary Top Light (Highlights bezel tachymeter & sapphire crystal dome)
        const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
        topLight.position.set(0, 10, 4);
        this.scene.add(topLight);

        // Front Specular Glint Accent (Floating near dial center)
        const glintLight = new THREE.PointLight(0xffeacc, 1.0, 15, 2);
        glintLight.position.set(2, 2, 4);
        this.scene.add(glintLight);
    }

    /**
     * Optical laser alignment axis running through the center of all circular components
     * Gives engineered CAD precision during exploded view
     */
    setupOpticalAlignmentLine() {
        const points = [
            new THREE.Vector3(0, 0, -6.5),
            new THREE.Vector3(0, 0, 8.5)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({
            color: 0x4da3ff,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: true,
            opacity: 0.0, // starts invisible, fades in during exploded state
            linewidth: 1
        });

        this.alignmentLine = new THREE.Line(geometry, material);
        this.alignmentLine.computeLineDistances();
        this.scene.add(this.alignmentLine);
    }

    /**
     * Subtle floating atmospheric dust particles for cinematic depth
     */
    setupParticles() {
        const count = 350;
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 24;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
            scales[i] = Math.random() * 0.04 + 0.01;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        const mat = new THREE.PointsMaterial({
            color: 0xc4d8ee,
            size: 0.06,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    updateResponsiveCamera() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;

        // Mobile responsive distance adjustment
        if (this.width < 768) {
            this.cameraBasePos.set(1.5, 1.2, 19.5); // move camera back on mobile
        } else if (this.width < 1200) {
            this.cameraBasePos.set(2.0, 1.5, 15.5);
        } else {
            this.cameraBasePos.set(2.5, 1.8, 13.5);
        }

        this.camera.updateProjectionMatrix();
    }

    onResize() {
        this.updateResponsiveCamera();
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / this.width) * 2 - 1;
        this.mouse.y = -(e.clientY / this.height) * 2 + 1;
    }

    onTouchStart(e) {
        if (e.touches.length > 0) {
            this.mouse.x = (e.touches[0].clientX / this.width) * 2 - 1;
            this.mouse.y = -(e.touches[0].clientY / this.height) * 2 + 1;
        }
    }

    onClick(e) {
        // If clicking on a 3D component, select it and trigger dossier event
        if (this.hoveredPart) {
            this.selectPart(this.hoveredPart);
        }
    }

    selectPart(part) {
        this.selectedPart = part;
        if (window.horologicalAudio) {
            window.horologicalAudio.playMechanicalChime(1174.66, 0.06); // D6 chime
        }

        // Dispatch custom DOM event with the part's technical dossier
        const event = new CustomEvent('watch:part-selected', {
            detail: part.userData
        });
        window.dispatchEvent(event);
    }

    /**
     * Raycast and handle hover highlight & lifting
     */
    updateRaycasting() {
        // Avoid raycasting during active orbit dragging to keep 60fps
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.watchBuilder.parts, true);

        let newHovered = null;

        if (intersects.length > 0) {
            // Find root part
            let obj = intersects[0].object;
            while (obj && !obj.userData.partId && obj.parent) {
                obj = obj.parent;
            }
            if (obj && obj.userData && obj.userData.parentPart) {
                newHovered = obj.userData.parentPart;
            }
        }

        if (newHovered !== this.hoveredPart) {
            // Reset previous hovered part
            if (this.hoveredPart) {
                this.unhighlightPart(this.hoveredPart);
            }

            this.hoveredPart = newHovered;

            // Highlight new part
            if (this.hoveredPart) {
                this.highlightPart(this.hoveredPart);
                if (window.horologicalAudio) {
                    window.horologicalAudio.playHoverChime(1400);
                }
                const hoverEvent = new CustomEvent('watch:part-hovered', {
                    detail: this.hoveredPart.userData
                });
                window.dispatchEvent(hoverEvent);
            } else {
                const unhoverEvent = new CustomEvent('watch:part-unhovered');
                window.dispatchEvent(unhoverEvent);
            }
        }
    }

    highlightPart(part) {
        // Lift part slightly along its normal/vector
        gsap.to(part.position, {
            z: part.position.z + 0.35,
            duration: 0.35,
            ease: "power2.out"
        });

        // Set subtle emissive glow on meshes
        part.traverse(child => {
            if (child.isMesh && child.material) {
                if (!child.userData.savedEmissive) {
                    child.userData.savedEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0x000000);
                    child.userData.savedIntensity = child.material.emissiveIntensity || 0;
                }
                if (child.material.emissive) {
                    child.material.emissive.setHex(0x3a6ca8);
                    child.material.emissiveIntensity = 0.45;
                }
            }
        });

        document.body.style.cursor = 'pointer';
    }

    unhighlightPart(part) {
        // Return position to interpolated target
        const p = part.userData.currentProgress || 0;
        let factor = 0;
        if (p > 0.2) {
            factor = Math.min(1, (p - 0.2) / 0.7);
            factor = 1 - Math.pow(1 - factor, 2.5);
        }
        const targetPos = new THREE.Vector3().lerpVectors(part.userData.assembledPos, part.userData.explodedPos, factor);

        gsap.to(part.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 0.35,
            ease: "power2.out"
        });

        // Restore emissive
        part.traverse(child => {
            if (child.isMesh && child.material && child.userData.savedEmissive) {
                if (child.material.emissive) {
                    child.material.emissive.copy(child.userData.savedEmissive);
                    child.material.emissiveIntensity = child.userData.savedIntensity;
                }
            }
        });

        document.body.style.cursor = 'default';
    }

    /**
     * Toggle Free 3D Orbit Mode
     */
    setOrbitMode(enable) {
        this.isOrbitMode = enable;
        if (this.orbitControls) {
            this.orbitControls.enabled = enable;
            if (enable) {
                this.orbitControls.target.copy(this.cameraTarget);
            }
        }
    }

    resetCamera(duration = 1.2) {
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
            this.isOrbitMode = false;
        }

        gsap.to(this.camera.position, {
            x: this.cameraBasePos.x,
            y: this.cameraBasePos.y,
            z: this.cameraBasePos.z,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.lookAt(this.cameraTarget);
            }
        });
    }

    /**
     * Smoothly focus camera onto a specific micro-component
     */
    focusOnPart(partId) {
        const part = this.watchBuilder.partsMap.get(partId);
        if (!part) return;

        this.setOrbitMode(false);
        const worldPos = new THREE.Vector3();
        part.getWorldPosition(worldPos);

        const targetCamPos = new THREE.Vector3(
            worldPos.x + 2.0,
            worldPos.y + 1.2,
            worldPos.z + 4.5
        );

        gsap.to(this.camera.position, {
            x: targetCamPos.x,
            y: targetCamPos.y,
            z: targetCamPos.z,
            duration: 1.4,
            ease: "power3.inOut"
        });

        gsap.to(this.cameraTarget, {
            x: worldPos.x,
            y: worldPos.y,
            z: worldPos.z,
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => {
                this.camera.lookAt(this.cameraTarget);
            }
        });
    }

    /**
     * Main animation & render tick
     */
    render() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Animate mechanical escapement & watch movement
        this.watchBuilder.animateMovement(time, delta);

        // 2. Slow ambient particle drift
        if (this.particles) {
            this.particles.rotation.y = time * 0.02;
            this.particles.rotation.x = time * 0.01;
        }

        // 3. Update OrbitControls or Raycast
        if (this.isOrbitMode && this.orbitControls) {
            this.orbitControls.update();
        } else {
            // Subtle idle camera floating when not scrolling
            this.updateRaycasting();
        }

        // 4. Render Scene
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.render);
    }
}

window.WatchScene = WatchScene;
