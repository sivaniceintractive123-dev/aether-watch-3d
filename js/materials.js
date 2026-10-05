/**
 * AETHER CALIBRE 01 - Material & Procedural Texture Studio
 * High-precision PBR materials with procedural horological textures:
 * Côtes de Genève, Perlage, Sunburst Dial, Tachymeter Bezel, Alligator Leather,
 * Blued Steel, and Synthetic Corundum Rubies.
 */

class HorologicalMaterials {
    constructor() {
        this.textures = {};
        this.materials = {};
        this.currentTheme = 'titanium'; // 'titanium' | 'rosegold' | 'obsidian'

        this.generateAllTextures();
        this.createMaterials();
    }

    generateAllTextures() {
        this.textures.cotesDeGeneve = this.createCotesDeGeneveTexture();
        this.textures.perlage = this.createPerlageTexture();
        this.textures.sunburstDial = this.createSunburstDialTexture();
        this.textures.bezel = this.createBezelTexture();
        this.textures.dateDisc = this.createDateDiscTexture();
        this.textures.caseback = this.createCasebackTexture();
        this.textures.strap = this.createStrapTexture();
        this.textures.envMap = this.createStudioEnvMap();
    }

    /**
     * Procedural Côtes de Genève (Geneva Stripes) with micro-milled optical diffraction
     */
    createCotesDeGeneveTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Base metallic gray
        ctx.fillStyle = '#b4b8be';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const stripeWidth = 64;
        const count = canvas.width / stripeWidth;

        for (let i = 0; i < count; i++) {
            const x = i * stripeWidth;
            const grad = ctx.createLinearGradient(x, 0, x + stripeWidth, 0);
            if (i % 2 === 0) {
                grad.addColorStop(0, '#c2c6cd');
                grad.addColorStop(0.5, '#e4e7ed');
                grad.addColorStop(1, '#a6abb2');
            } else {
                grad.addColorStop(0, '#a6abb2');
                grad.addColorStop(0.5, '#8c9199');
                grad.addColorStop(1, '#c2c6cd');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(x, 0, stripeWidth, canvas.height);

            // Micro-ridges / brushed grain inside each stripe
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            for (let y = 0; y < canvas.height; y += 3) {
                if (Math.random() > 0.4) {
                    ctx.fillRect(x, y, stripeWidth, 1.2);
                }
            }
            ctx.fillStyle = 'rgba(0,0,0,0.07)';
            for (let y = 1; y < canvas.height; y += 3) {
                if (Math.random() > 0.4) {
                    ctx.fillRect(x, y, stripeWidth, 1);
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    /**
     * Procedural Perlage (Circular graining engine-turned circles)
     */
    createPerlageTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#b0b5bb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const radius = 28;
        const stepX = 22;
        const stepY = 20;

        for (let y = -radius; y < canvas.height + radius; y += stepY) {
            const rowOffset = (Math.floor(y / stepY) % 2) * (stepX / 2);
            for (let x = -radius; x < canvas.width + radius; x += stepX) {
                const cx = x + rowOffset;
                const cy = y;

                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
                grad.addColorStop(0, 'rgba(240, 243, 248, 0.45)');
                grad.addColorStop(0.5, 'rgba(180, 185, 192, 0.3)');
                grad.addColorStop(0.85, 'rgba(130, 135, 142, 0.55)');
                grad.addColorStop(1, 'rgba(70, 75, 80, 0.7)');

                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Fine spiral snailing brush strokes
                ctx.strokeStyle = 'rgba(255,255,255,0.18)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 1.5);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    /**
     * Procedural Sunburst Dial with subdial chronometer registers, minute rail track & markings
     */
    createSunburstDialTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        const cx = 1024;
        const cy = 1024;
        const outerR = 960;

        // Base dark sunburst radial gradient
        const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, outerR);
        bgGrad.addColorStop(0, '#1c1f24');
        bgGrad.addColorStop(0.6, '#101215');
        bgGrad.addColorStop(1, '#08090a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ray sunburst brush lines
        const numRays = 720;
        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < numRays; i++) {
            const angle = (i * Math.PI * 2) / numRays;
            const alpha = 0.03 + Math.sin(angle * 8) * 0.02 + Math.random() * 0.025;
            ctx.strokeStyle = `rgba(220, 230, 245, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
            ctx.stroke();
        }
        ctx.restore();

        // Perimeter Minute / Second Rail Track
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 910, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(cx, cy, 875, 0, Math.PI * 2);
        ctx.stroke();

        // 60-second / minute tick marks
        for (let i = 0; i < 60; i++) {
            const angle = (i * Math.PI * 2) / 60 - Math.PI / 2;
            const is5Min = i % 5 === 0;
            const inner = is5Min ? 855 : 880;
            const outer = 910;
            ctx.strokeStyle = is5Min ? '#e2e7ec' : 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = is5Min ? 5 : 2;

            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
            ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
            ctx.stroke();

            // Arabic minute numerals at 5-min intervals
            if (is5Min) {
                const numText = (i === 0 ? '60' : (i < 10 ? '0' + i : '' + i));
                ctx.font = '600 24px "Space Grotesk", sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textR = 825;
                ctx.fillText(numText, cx + Math.cos(angle) * textR, cy + Math.sin(angle) * textR);
            }
        }

        // Subdials: Small seconds at 9 o'clock, 30-min at 3 o'clock, 12-hour at 6 o'clock
        const subdials = [
            { x: cx - 440, y: cy, label: 'SECONDS', max: 60, steps: 12 },
            { x: cx + 440, y: cy, label: 'MINUTES', max: 30, steps: 6 },
            { x: cx, y: cy + 440, label: 'HOURS', max: 12, steps: 12 }
        ];

        subdials.forEach(sub => {
            const r = 210;
            // Recessed subdial shadow
            const subGrad = ctx.createRadialGradient(sub.x, sub.y, 0, sub.x, sub.y, r);
            subGrad.addColorStop(0, '#0d0f12');
            subGrad.addColorStop(0.85, '#121519');
            subGrad.addColorStop(1, '#050607');
            ctx.fillStyle = subGrad;
            ctx.beginPath();
            ctx.arc(sub.x, sub.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Concentric snailing grooves
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let gr = 15; gr < r; gr += 8) {
                ctx.beginPath();
                ctx.arc(sub.x, sub.y, gr, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Outer subdial ring
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sub.x, sub.y, r, 0, Math.PI * 2);
            ctx.stroke();

            // Subdial ticks
            for (let s = 0; s < sub.steps; s++) {
                const sAngle = (s * Math.PI * 2) / sub.steps - Math.PI / 2;
                const sInner = r - 22;
                const sOuter = r;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(sub.x + Math.cos(sAngle) * sInner, sub.y + Math.sin(sAngle) * sInner);
                ctx.lineTo(sub.x + Math.cos(sAngle) * sOuter, sub.y + Math.sin(sAngle) * sOuter);
                ctx.stroke();
            }
        });

        // Luxury Brand Branding & Calibre Typography on Dial
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Crest Icon / Monogram
        ctx.font = '700 48px "Cinzel", "Times New Roman", serif';
        ctx.fillStyle = '#e2c58a'; // Brushed pale gold
        ctx.fillText('A E T H E R', cx, cy - 470);

        ctx.font = '500 18px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.letterSpacing = '6px';
        ctx.fillText('GENÈVE', cx, cy - 425);

        ctx.font = '600 20px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(220, 225, 235, 0.7)';
        ctx.fillText('CHRONOMÈTRE OFFICIELLEMENT CERTIFIÉ', cx, cy + 240);

        ctx.font = '400 16px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('CALIBRE 01 • 300M / 1000FT', cx, cy + 275);

        // Swiss Made at 6 o'clock bottom
        ctx.font = '500 15px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillText('SWISS   MADE', cx, cy + 935);

        // Date Window Frame cutout guide
        ctx.strokeStyle = '#c2a66e';
        ctx.lineWidth = 4;
        ctx.strokeRect(cx + 620, cy - 45, 120, 90);

        const texture = new THREE.CanvasTexture(canvas);
        texture.center.set(0.5, 0.5);
        texture.rotation = Math.PI / 2;
        texture.anisotropy = 16;
        return texture;
    }

    /**
     * Procedural Tachymeter Ceramic Bezel with calibrated scale 60 - 400
     */
    createBezelTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0f1114';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle horizontal brushed ceramic texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let y = 0; y < canvas.height; y += 2) {
            ctx.fillRect(0, y, canvas.width, 1);
        }

        const markings = [
            'TACHYMETRE', '400', '350', '300', '275', '250', '225', '200', '190',
            '180', '170', '160', '150', '140', '130', '120', '110', '100', '95',
            '90', '85', '80', '75', '70', '65', '60'
        ];

        const step = canvas.width / markings.length;
        ctx.font = '600 32px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f0f3f6';

        markings.forEach((text, i) => {
            const x = i * step + step / 2;
            ctx.fillText(text, x, canvas.height / 2);

            // Intermediate dot or tick
            ctx.fillStyle = '#c5a059';
            ctx.beginPath();
            ctx.arc(x + step / 2, canvas.height / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f0f3f6';
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Procedural Date Disc Ring (1 through 31 printed radially)
     */
    createDateDiscTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        const cx = 512;
        const cy = 512;
        const r = 420;

        ctx.fillStyle = '#111316';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Metallic outer ring disc
        ctx.beginPath();
        ctx.arc(cx, cy, 470, 0, Math.PI * 2);
        ctx.fillStyle = '#191c20';
        ctx.fill();

        ctx.font = '700 28px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        for (let d = 1; d <= 31; d++) {
            const angle = ((d - 1) * Math.PI * 2) / 31 - Math.PI / 2;
            ctx.save();
            ctx.translate(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText('' + d, 0, 0);
            ctx.restore();
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    /**
     * Procedural Exhibition Case Back Ring with horological hallmarks
     */
    createCasebackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        const cx = 512;
        const cy = 512;

        ctx.fillStyle = '#3a3e44';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Circular satin brushed ring
        for (let r = 360; r < 500; r += 2) {
            ctx.strokeStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Circular text inscription around caseback perimeter
        const text = 'AETHER MANUFACTURE GENEVE • TITANIUM GRADE 5 • 300M WATER RESISTANT • SAPPHIRE CRYSTAL • CALIBRE 01 • NO. 042/1000 • ';
        const radius = 430;
        const charCount = text.length;

        ctx.font = '600 24px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < charCount; i++) {
            const angle = (i * Math.PI * 2) / charCount;
            ctx.save();
            ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    /**
     * Procedural Alligator Leather Strap with scales and contrast edge saddle-stitching
     */
    createStrapTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Deep leather base
        ctx.fillStyle = '#131417';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rectangular alligator scales with organic variation
        const rows = 18;
        const cols = 6;
        const cellW = canvas.width / cols;
        const cellH = canvas.height / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * cellW + (Math.random() * 4 - 2);
                const y = r * cellH + (Math.random() * 4 - 2);
                const w = cellW - 6;
                const h = cellH - 6;

                // Scale fill gradient
                const scaleGrad = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, w / 2);
                scaleGrad.addColorStop(0, '#22252a');
                scaleGrad.addColorStop(0.8, '#17191d');
                scaleGrad.addColorStop(1, '#0e0f12');

                ctx.fillStyle = scaleGrad;
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h);
                ctx.fill();

                // Micro wrinkles inside scale
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x + 8, y + h * 0.4);
                ctx.lineTo(x + w - 8, y + h * 0.4);
                ctx.stroke();
            }
        }

        // Contrast saddle stitching along left and right borders
        const stitchMargin = 28;
        ctx.strokeStyle = '#c5a059'; // Golden flax thread
        ctx.lineWidth = 3.5;
        ctx.setLineDash([12, 8]);

        // Left stitch
        ctx.beginPath();
        ctx.moveTo(stitchMargin, 0);
        ctx.lineTo(stitchMargin, canvas.height);
        ctx.stroke();

        // Right stitch
        ctx.beginPath();
        ctx.moveTo(canvas.width - stitchMargin, 0);
        ctx.lineTo(canvas.width - stitchMargin, canvas.height);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Procedural Studio Environment Reflection CubeMap simulation
     */
    createStudioEnvMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Studio gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#10141a');
        grad.addColorStop(0.4, '#1b222d');
        grad.addColorStop(0.5, '#424d5d');
        grad.addColorStop(0.6, '#1b222d');
        grad.addColorStop(1, '#080a0d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Softbox light panels (for specular reflections)
        // Key softbox
        const keyGrad = ctx.createRadialGradient(250, 200, 10, 250, 200, 180);
        keyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        keyGrad.addColorStop(0.3, 'rgba(240, 245, 255, 0.6)');
        keyGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = keyGrad;
        ctx.beginPath();
        ctx.arc(250, 200, 180, 0, Math.PI * 2);
        ctx.fill();

        // Rim softbox
        const rimGrad = ctx.createRadialGradient(800, 220, 10, 800, 220, 220);
        rimGrad.addColorStop(0, 'rgba(230, 240, 255, 0.85)');
        rimGrad.addColorStop(0.4, 'rgba(200, 220, 250, 0.4)');
        rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(800, 220, 220, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        return texture;
    }

    createMaterials() {
        const env = this.textures.envMap;

        // 1. Titanium Case / Bezel Base
        this.materials.titanium = new THREE.MeshStandardMaterial({
            color: 0x989da3,
            metalness: 0.92,
            roughness: 0.28,
            envMap: env,
            envMapIntensity: 1.2
        });

        // 2. Polished Steel (Chamfers, indices, pinions)
        this.materials.polishedSteel = new THREE.MeshStandardMaterial({
            color: 0xebedf2,
            metalness: 0.98,
            roughness: 0.08,
            envMap: env,
            envMapIntensity: 1.6
        });

        // 3. Côtes de Genève Bridge Material
        this.materials.cotesDeGeneve = new THREE.MeshStandardMaterial({
            color: 0xc4c8ce,
            metalness: 0.9,
            roughness: 0.32,
            map: this.textures.cotesDeGeneve,
            bumpMap: this.textures.cotesDeGeneve,
            bumpScale: 0.04,
            envMap: env,
            envMapIntensity: 1.1
        });

        // 4. Perlage Mainplate Material
        this.materials.perlage = new THREE.MeshStandardMaterial({
            color: 0xbac0c7,
            metalness: 0.92,
            roughness: 0.35,
            map: this.textures.perlage,
            bumpMap: this.textures.perlage,
            bumpScale: 0.03,
            envMap: env,
            envMapIntensity: 1.0
        });

        // 5. Sunburst Dial Material
        this.materials.dial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.82,
            roughness: 0.3,
            map: this.textures.sunburstDial,
            envMap: env,
            envMapIntensity: 0.9
        });

        // 6. Ceramic Tachymeter Bezel
        this.materials.bezel = new THREE.MeshStandardMaterial({
            color: 0x141619,
            metalness: 0.5,
            roughness: 0.15,
            map: this.textures.bezel,
            envMap: env,
            envMapIntensity: 1.4
        });

        // 7. Synthetic Ruby Jewels (Synthetic Corundum)
        this.materials.rubyJewel = new THREE.MeshPhysicalMaterial({
            color: 0xd9044b,
            emissive: 0x3d0012,
            emissiveIntensity: 0.2,
            roughness: 0.04,
            metalness: 0.1,
            transmission: 0.65,
            ior: 1.76,
            transparent: true,
            opacity: 0.92,
            envMap: env,
            envMapIntensity: 1.8
        });

        // 8. Blued Steel Screws (Signature heat-blued horological finish)
        this.materials.bluedSteel = new THREE.MeshStandardMaterial({
            color: 0x1b449c,
            metalness: 0.92,
            roughness: 0.16,
            envMap: env,
            envMapIntensity: 1.5
        });

        // 9. Brass / Gold Gears & Balance Wheel (Glucydur Bronze)
        this.materials.brassGold = new THREE.MeshStandardMaterial({
            color: 0xd6ae52,
            metalness: 0.95,
            roughness: 0.22,
            envMap: env,
            envMapIntensity: 1.4
        });

        // 10. Oscillating Rotor (22k Gold Accent)
        this.materials.rotorGold = new THREE.MeshStandardMaterial({
            color: 0xdfb455,
            metalness: 0.94,
            roughness: 0.25,
            map: this.textures.cotesDeGeneve,
            bumpMap: this.textures.cotesDeGeneve,
            bumpScale: 0.03,
            envMap: env,
            envMapIntensity: 1.3
        });

        // 11. Sapphire Crystal (Double Domed Anti-Reflective)
        this.materials.sapphireCrystal = new THREE.MeshPhysicalMaterial({
            color: 0xecf4ff,
            transmission: 0.96,
            opacity: 0.32,
            transparent: true,
            roughness: 0.02,
            ior: 1.77,
            metalness: 0.05,
            reflectivity: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            envMap: env,
            envMapIntensity: 1.5
        });

        // 12. Date Ring
        this.materials.dateDisc = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.3,
            map: this.textures.dateDisc,
            envMap: env,
            envMapIntensity: 0.8
        });

        // 13. Case Back
        this.materials.caseback = new THREE.MeshStandardMaterial({
            color: 0xa8adb4,
            metalness: 0.92,
            roughness: 0.25,
            map: this.textures.caseback,
            envMap: env,
            envMapIntensity: 1.2
        });

        // 14. Rubber Gaskets
        this.materials.gasket = new THREE.MeshStandardMaterial({
            color: 0x181a1d,
            roughness: 0.85,
            metalness: 0.05
        });

        // 15. Alligator Leather Strap
        this.materials.strap = new THREE.MeshStandardMaterial({
            color: 0x141619,
            metalness: 0.1,
            roughness: 0.55,
            map: this.textures.strap,
            bumpMap: this.textures.strap,
            bumpScale: 0.08,
            envMap: env,
            envMapIntensity: 0.6
        });

        // 16. Super-LumiNova Luminescent Inlay
        this.materials.lume = new THREE.MeshStandardMaterial({
            color: 0xd8ffeb,
            emissive: 0x228855,
            emissiveIntensity: 0.45,
            roughness: 0.2,
            metalness: 0.1
        });
    }

    /**
     * Switch watch finish colorway across all materials
     * @param {'titanium'|'rosegold'|'obsidian'} theme 
     */
    setTheme(theme) {
        this.currentTheme = theme;
        if (theme === 'rosegold') {
            this.materials.titanium.color.setHex(0xdf9775); // 18k Rose Gold
            this.materials.polishedSteel.color.setHex(0xf5b18f);
            this.materials.bezel.color.setHex(0x231815);
            this.materials.dial.color.setHex(0x35231c);
            this.materials.cotesDeGeneve.color.setHex(0xe8b89e);
            this.materials.rotorGold.color.setHex(0xeb9977);
            this.materials.strap.color.setHex(0x251612); // Dark chestnut leather
        } else if (theme === 'obsidian') {
            this.materials.titanium.color.setHex(0x1c1e22); // DLC Black matte
            this.materials.polishedSteel.color.setHex(0x4a4f59); // Gunmetal
            this.materials.bezel.color.setHex(0x0a0b0d);
            this.materials.dial.color.setHex(0x111316);
            this.materials.cotesDeGeneve.color.setHex(0x2c3038); // Smoked ruthenium
            this.materials.rotorGold.color.setHex(0xcca03c); // High-contrast gold
            this.materials.strap.color.setHex(0x0c0d0f); // Deep vulcanized black
        } else {
            // Default Titanium
            this.materials.titanium.color.setHex(0x989da3);
            this.materials.polishedSteel.color.setHex(0xebedf2);
            this.materials.bezel.color.setHex(0x141619);
            this.materials.dial.color.setHex(0xffffff);
            this.materials.cotesDeGeneve.color.setHex(0xc4c8ce);
            this.materials.rotorGold.color.setHex(0xdfb455);
            this.materials.strap.color.setHex(0x141619);
        }
    }
}

window.HorologicalMaterials = HorologicalMaterials;
