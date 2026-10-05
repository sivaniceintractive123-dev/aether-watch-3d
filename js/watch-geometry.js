/**
 * AETHER CALIBRE 01 - Procedural 3D Watch Horological Geometry
 * Generates all 23 distinct mechanical components with micron-level alignment,
 * assembly coordinates (assembled state) and exploded 3D vectors.
 */

class WatchGeometryBuilder {
    constructor(materialsManager) {
        this.mat = materialsManager.materials;
        this.parts = []; // array of all 23 parts
        this.partsMap = new Map(); // id -> part object
        this.watchGroup = new THREE.Group();
        this.watchGroup.name = "AetherWatch_Root";

        // Dynamic components that animate in real-time
        this.handsGroup = null;
        this.hourHandMesh = null;
        this.minuteHandMesh = null;
        this.secondHandMesh = null;
        this.balanceWheelGroup = null;
        this.rotorGroup = null;
        this.escapementGroup = null;

        this.buildAllComponents();
    }

    /**
     * Helper to wrap a 3D mesh/group as an official Part
     */
    registerPart(config) {
        const {
            id,
            name,
            code,
            role,
            materialName,
            tolerance,
            desc,
            callout = false,
            calloutSide = 'left',
            object,
            assembledPos = new THREE.Vector3(0, 0, 0),
            assembledRot = new THREE.Euler(0, 0, 0),
            explodedPos = new THREE.Vector3(0, 0, 0),
            explodedRot = new THREE.Euler(0, 0, 0)
        } = config;

        object.name = `Part_${id}_${name.replace(/\s+/g, '_')}`;
        
        // Store technical dossier metadata on the object
        object.userData = {
            id,
            name,
            code,
            role,
            materialName,
            tolerance,
            desc,
            callout,
            calloutSide,
            assembledPos: assembledPos.clone(),
            assembledRot: assembledRot.clone(),
            explodedPos: explodedPos.clone(),
            explodedRot: explodedRot.clone(),
            currentProgress: 0,
            originalMaterials: []
        };

        // Track meshes for hover glow effects
        object.traverse(child => {
            if (child.isMesh) {
                child.userData.partId = id;
                child.userData.parentPart = object;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Set initial assembled position
        object.position.copy(assembledPos);
        object.rotation.copy(assembledRot);

        this.parts.push(object);
        this.partsMap.set(id, object);
        this.watchGroup.add(object);

        return object;
    }

    // ==========================================
    // BUILD ALL 23 CONTROLLABLE COMPONENTS
    // ==========================================
    buildAllComponents() {
        this.buildSapphireCrystal();         // 1
        this.buildBezel();                   // 2
        this.buildHourMarkers();             // 3
        this.buildWatchHands();              // 4
        this.buildDial();                    // 5
        this.buildDateMechanism();           // 6
        this.buildMainPlate();               // 7
        this.buildBalanceWheel();            // 8
        this.buildEscapement();              // 9
        this.buildGearTrain();               // 10
        this.buildMainspringBarrel();        // 11
        this.buildBridges();                 // 12
        this.buildJewels();                  // 13
        this.buildScrews();                  // 14
        this.buildCrown();                   // 15
        this.buildCrownGears();              // 16
        this.buildCaseMiddle();              // 17
        this.buildCaseBack();                // 18
        this.buildRotor();                   // 19
        this.buildGaskets();                 // 20
        this.buildInnerMechanicalParts();    // 21
        this.buildStrapConnectors();         // 22
        this.buildStrapSections();           // 23
    }

    /**
     * 1. SAPPHIRE CRYSTAL
     * Double-domed scratch-resistant synthetic corundum crystal with chamfered rim
     */
    buildSapphireCrystal() {
        const group = new THREE.Group();
        
        // Double domed lathe geometry
        const points = [];
        points.push(new THREE.Vector2(0, 0.22));
        points.push(new THREE.Vector2(1.2, 0.20));
        points.push(new THREE.Vector2(2.1, 0.14));
        points.push(new THREE.Vector2(2.48, 0.06));
        points.push(new THREE.Vector2(2.52, 0.0));
        points.push(new THREE.Vector2(2.52, -0.08));
        points.push(new THREE.Vector2(2.45, -0.10));
        points.push(new THREE.Vector2(2.1, 0.02));
        points.push(new THREE.Vector2(1.2, 0.08));
        points.push(new THREE.Vector2(0, 0.10));

        const latheGeo = new THREE.LatheGeometry(points, 64);
        const crystalMesh = new THREE.Mesh(latheGeo, this.mat.sapphireCrystal);
        group.add(crystalMesh);

        // Anti-reflective coating sheen ring
        const rimGeo = new THREE.TorusGeometry(2.51, 0.015, 16, 64);
        const rimMesh = new THREE.Mesh(rimGeo, this.mat.polishedSteel);
        group.add(rimMesh);

        this.registerPart({
            id: 1,
            code: "PART 01",
            name: "SAPPHIRE CRYSTAL",
            role: "Front Armored Optics",
            materialName: "Synthetic Corundum (9 Mohs)",
            tolerance: "± 0.002 mm",
            desc: "Double-domed synthetic sapphire crystal with dual-sided 7-layer anti-reflective vapor deposition. Crystal hardness second only to diamond, ensuring distortion-free readability and scratch immunity up to 300 meters depth.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.52),
            explodedPos: new THREE.Vector3(0, 0, 7.5)
        });
    }

    /**
     * 2. BEZEL
     * Fluted ceramic tachymeter bezel with polished inner ring step
     */
    buildBezel() {
        const group = new THREE.Group();

        // Outer knurled/fluted ring
        const outerGeo = new THREE.CylinderGeometry(2.78, 2.82, 0.22, 64, 1, true);
        const outerMesh = new THREE.Mesh(outerGeo, this.mat.titanium);
        outerMesh.rotation.x = Math.PI / 2;
        group.add(outerMesh);

        // Ceramic top face with tachymeter texture
        const faceGeo = new THREE.RingGeometry(2.48, 2.78, 64);
        const faceMesh = new THREE.Mesh(faceGeo, this.mat.bezel);
        faceMesh.position.z = 0.11;
        group.add(faceMesh);

        // Mirror polished inner chamfer step
        const chamferGeo = new THREE.CylinderGeometry(2.48, 2.52, 0.08, 64, 1, true);
        const chamferMesh = new THREE.Mesh(chamferGeo, this.mat.polishedSteel);
        chamferMesh.rotation.x = Math.PI / 2;
        chamferMesh.position.z = 0.05;
        group.add(chamferMesh);

        this.registerPart({
            id: 2,
            code: "PART 02",
            name: "CERAMIC BEZEL",
            role: "Tachymetric Register",
            materialName: "Zirconia High-Tech Ceramic (ZrO2)",
            tolerance: "± 0.003 mm",
            desc: "Sintered zirconium dioxide ceramic bezel with laser-engraved tachymetric scale infilled with liquid platinum. Diamond-micro-machined with 60 perimeter flutes for grip.",
            callout: true,
            calloutSide: 'right',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.44),
            explodedPos: new THREE.Vector3(0, 0, 6.2)
        });
    }

    /**
     * 3. HOUR MARKERS (INDICES)
     * 12 applied faceted 3D baton indices with Super-LumiNova white luminescent core
     */
    buildHourMarkers() {
        const group = new THREE.Group();

        for (let i = 0; i < 12; i++) {
            const markerGroup = new THREE.Group();
            const angle = Math.PI / 2 - (i * Math.PI * 2) / 12;
            const is12 = (i === 0);

            // Double marker at 12 o'clock, single at other hours
            const widths = is12 ? [-0.07, 0.07] : [0];

            widths.forEach(offset => {
                // Faceted metallic baton base
                const batonGeo = new THREE.BoxGeometry(0.1, 0.32, 0.08);
                const batonMesh = new THREE.Mesh(batonGeo, this.mat.polishedSteel);
                batonMesh.position.x = offset;
                markerGroup.add(batonMesh);

                // Luminescent core inlay
                const lumeGeo = new THREE.BoxGeometry(0.048, 0.22, 0.02);
                const lumeMesh = new THREE.Mesh(lumeGeo, this.mat.lume);
                lumeMesh.position.set(offset, 0.02, 0.045);
                markerGroup.add(lumeMesh);
            });

            // Position radially on dial
            const r = 2.15;
            markerGroup.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
            markerGroup.rotation.z = angle - Math.PI / 2;
            group.add(markerGroup);
        }

        this.registerPart({
            id: 3,
            code: "PART 03",
            name: "HOUR MARKERS & INDICES",
            role: "Precision Optical Indices",
            materialName: "Rhodium-Plated Brass / Super-LumiNova X1",
            tolerance: "± 0.001 mm",
            desc: "12 hand-applied, three-dimensional faceted baton indices. Diamond-cut beveled flanks reflect ambient light from every perspective, with vacuum-injected Swiss Super-LumiNova Grade X1 phosphorescent channels.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.32),
            explodedPos: new THREE.Vector3(0, 0, 4.4)
        });
    }

    /**
     * 4. WATCH HANDS
     * Faceted Dauphine hour hand, minute hand, and needle chronograph seconds hand
     */
    buildWatchHands() {
        const handsGroup = new THREE.Group();

        // 1. Central Cannon Pinion Cap
        const capGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 32);
        const capMesh = new THREE.Mesh(capGeo, this.mat.polishedSteel);
        capMesh.rotation.x = Math.PI / 2;
        capMesh.position.z = 0.06;
        handsGroup.add(capMesh);

        // 2. Hour Hand (Dauphine)
        const hourGroup = new THREE.Group();
        const hourBodyGeo = new THREE.ConeGeometry(0.12, 1.35, 4);
        const hourMesh = new THREE.Mesh(hourBodyGeo, this.mat.polishedSteel);
        hourMesh.position.y = 0.675;
        hourMesh.scale.set(1, 1, 0.25);
        hourGroup.add(hourMesh);

        const hourLumeGeo = new THREE.BoxGeometry(0.04, 0.7, 0.02);
        const hourLumeMesh = new THREE.Mesh(hourLumeGeo, this.mat.lume);
        hourLumeMesh.position.set(0, 0.65, 0.025);
        hourGroup.add(hourLumeMesh);

        hourGroup.position.z = 0.02;
        hourGroup.rotation.z = Math.PI / 3; // 10 o'clock position (classic luxury display)
        handsGroup.add(hourGroup);
        this.hourHandMesh = hourGroup;

        // 3. Minute Hand (Longer Dauphine)
        const minGroup = new THREE.Group();
        const minBodyGeo = new THREE.ConeGeometry(0.1, 1.95, 4);
        const minMesh = new THREE.Mesh(minBodyGeo, this.mat.polishedSteel);
        minMesh.position.y = 0.975;
        minMesh.scale.set(1, 1, 0.25);
        minGroup.add(minMesh);

        const minLumeGeo = new THREE.BoxGeometry(0.035, 1.1, 0.02);
        const minLumeMesh = new THREE.Mesh(minLumeGeo, this.mat.lume);
        minLumeMesh.position.set(0, 0.95, 0.025);
        minGroup.add(minLumeMesh);

        minGroup.position.z = 0.05;
        minGroup.rotation.z = -Math.PI / 3; // 2 o'clock position (10:10 horological smile!)
        handsGroup.add(minGroup);
        this.minuteHandMesh = minGroup;

        // 4. Central Chronograph Seconds Hand (Blued steel with counterbalance)
        const secGroup = new THREE.Group();
        const secNeedleGeo = new THREE.CylinderGeometry(0.015, 0.025, 2.2, 16);
        const secNeedleMesh = new THREE.Mesh(secNeedleGeo, this.mat.bluedSteel);
        secNeedleMesh.position.y = 1.0;
        secGroup.add(secNeedleMesh);

        // Counterbalance ring
        const counterGeo = new THREE.TorusGeometry(0.08, 0.02, 16, 32);
        const counterMesh = new THREE.Mesh(counterGeo, this.mat.bluedSteel);
        counterMesh.position.y = -0.35;
        secGroup.add(counterMesh);

        secGroup.position.z = 0.08;
        secGroup.rotation.z = 0.35;
        handsGroup.add(secGroup);
        this.secondHandMesh = secGroup;

        this.handsGroup = handsGroup;

        this.registerPart({
            id: 4,
            code: "PART 04",
            name: "WATCH HANDS & ARBOR",
            role: "Temporal Indicators",
            materialName: "Diamond-Faceted Steel & Blued Chronograph Needle",
            tolerance: "± 0.001 mm",
            desc: "Dauphine-profile hands with central razor-edge spine creating light-dark dichotomy. Central seconds hand heat-blued at exactly 290°C with openworked crescent counterbalance and friction-fitted cannon pinion.",
            callout: true,
            calloutSide: 'right',
            object: handsGroup,
            assembledPos: new THREE.Vector3(0, 0, 0.36),
            explodedPos: new THREE.Vector3(0, 0, 5.2)
        });
    }

    /**
     * 5. DIAL
     * Multi-layered sunburst dial plate with subdial counters, printed minute track & date window
     */
    buildDial() {
        const group = new THREE.Group();

        // Main dial circular disc
        const dialGeo = new THREE.CylinderGeometry(2.46, 2.46, 0.05, 64);
        const dialMesh = new THREE.Mesh(dialGeo, this.mat.dial);
        dialMesh.rotation.x = Math.PI / 2;
        group.add(dialMesh);

        // Date window metallic beveled frame at 3 o'clock (x: 1.5, y: 0)
        const frameGeo = new THREE.BoxGeometry(0.42, 0.32, 0.06);
        const frameMesh = new THREE.Mesh(frameGeo, this.mat.polishedSteel);
        frameMesh.position.set(1.5, 0, 0.03);
        group.add(frameMesh);

        // Center arbor bushing hole ring
        const centerRingGeo = new THREE.TorusGeometry(0.18, 0.03, 16, 32);
        const centerRingMesh = new THREE.Mesh(centerRingGeo, this.mat.brassGold);
        centerRingMesh.position.z = 0.03;
        group.add(centerRingMesh);

        this.registerPart({
            id: 5,
            code: "PART 05",
            name: "CHRONOMETER DIAL",
            role: "Visual Architecture",
            materialName: "Anthracite Sunburst Galvanic Brass Plate",
            tolerance: "± 0.002 mm",
            desc: "Multi-layered dial with radial soleil brushing, three snailed chronometer registers, pad-printed calibrated rail track, and chamfered date aperture with polished rhodium frame.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.28),
            explodedPos: new THREE.Vector3(0, 0, 3.4)
        });
    }

    /**
     * 6. DATE MECHANISM
     * Annular date wheel disc, date star wheel gear & jumper spring
     */
    buildDateMechanism() {
        const group = new THREE.Group();

        // Date Disc Ring
        const ringGeo = new THREE.RingGeometry(1.2, 2.25, 64);
        const ringMesh = new THREE.Mesh(ringGeo, this.mat.dateDisc);
        group.add(ringMesh);

        // Date Star Wheel gear at 3 o'clock
        const starGearGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16);
        const starGearMesh = new THREE.Mesh(starGearGeo, this.mat.brassGold);
        starGearMesh.rotation.x = Math.PI / 2;
        starGearMesh.position.set(1.5, 0, -0.02);
        group.add(starGearMesh);

        // Date Jumper Spring (curved steel blade)
        const springCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(1.3, -0.25, 0),
            new THREE.Vector3(1.65, -0.22, 0),
            new THREE.Vector3(1.52, -0.08, 0)
        );
        const springGeo = new THREE.TubeGeometry(springCurve, 20, 0.015, 8, false);
        const springMesh = new THREE.Mesh(springGeo, this.mat.polishedSteel);
        group.add(springMesh);

        this.registerPart({
            id: 6,
            code: "PART 06",
            name: "DATE MECHANISM",
            role: "Calendar Star Complication",
            materialName: "BeCu Spring Alloy & Calibrated Disc",
            tolerance: "± 0.002 mm",
            desc: "Instantaneous date-jump mechanism powered by a 31-tooth star wheel and pre-tensioned beryllium copper jumper spring. Changes the date precisely at midnight in under 5 milliseconds.",
            callout: false,
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.22),
            explodedPos: new THREE.Vector3(0, 0, 2.6)
        });
    }

    /**
     * 7. MAIN PLATE
     * Master movement baseplate with perlage circular graining, CNC pockets, threaded holes
     */
    buildMainPlate() {
        const group = new THREE.Group();

        // Master Circular Baseplate
        const plateGeo = new THREE.CylinderGeometry(2.35, 2.35, 0.16, 64);
        const plateMesh = new THREE.Mesh(plateGeo, this.mat.perlage);
        plateMesh.rotation.x = Math.PI / 2;
        group.add(plateMesh);

        // Recessed pockets (darker stepped cylinders representing CNC milled gear recesses)
        const pocketConfigs = [
            { x: -0.9, y: -0.6, r: 0.65, d: 0.18 }, // Balance recess
            { x: 1.0, y: -0.6, r: 0.72, d: 0.18 },  // Mainspring barrel recess
            { x: 0.6, y: 0.4, r: 0.55, d: 0.18 },   // Gear train recess
            { x: -1.2, y: 0.1, r: 0.42, d: 0.18 }   // Escapement recess
        ];

        pocketConfigs.forEach(cfg => {
            const pocketGeo = new THREE.CylinderGeometry(cfg.r, cfg.r, 0.04, 32);
            const pocketMesh = new THREE.Mesh(pocketGeo, this.mat.titanium);
            pocketMesh.rotation.x = Math.PI / 2;
            pocketMesh.position.set(cfg.x, cfg.y, 0.08);
            group.add(pocketMesh);
        });

        // Locating guide pins / mounting pillars
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2) + 0.4;
            const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 16);
            const pinMesh = new THREE.Mesh(pinGeo, this.mat.polishedSteel);
            pinMesh.rotation.x = Math.PI / 2;
            pinMesh.position.set(Math.cos(angle) * 2.05, Math.sin(angle) * 2.05, 0.05);
            group.add(pinMesh);
        }

        this.registerPart({
            id: 7,
            code: "PART 07",
            name: "MAIN PLATE (PLATINE)",
            role: "Structural Foundation",
            materialName: "Rhodium-Plated Maillechort (German Silver)",
            tolerance: "± 0.0015 mm",
            desc: "The structural bedrock of the calibre, micro-milled from German silver on 5-axis CNC machines. Features engine-turned circular perlage patterning with 280 overlapping pearled discs and jeweled pivot pockets.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, -0.20),
            explodedPos: new THREE.Vector3(0, 0, -1.4)
        });
    }

    /**
     * 8. BALANCE WHEEL & HAIRSPRING
     * Variable inertia Glucydur balance wheel, micro-weight screws, coiled spiral hairspring
     */
    buildBalanceWheel() {
        const group = new THREE.Group();

        // 1. Balance Wheel Rim
        const rimGeo = new THREE.TorusGeometry(0.55, 0.035, 16, 48);
        const rimMesh = new THREE.Mesh(rimGeo, this.mat.brassGold);
        group.add(rimMesh);

        // 2. Four Curved Spokes
        for (let s = 0; s < 4; s++) {
            const spokeAngle = (s * Math.PI) / 2;
            const spokeGeo = new THREE.BoxGeometry(0.035, 0.54, 0.02);
            const spokeMesh = new THREE.Mesh(spokeGeo, this.mat.brassGold);
            spokeMesh.position.set(
                Math.cos(spokeAngle) * 0.27,
                Math.sin(spokeAngle) * 0.27,
                0
            );
            spokeMesh.rotation.z = spokeAngle + Math.PI / 2;
            group.add(spokeMesh);
        }

        // 3. Poise Regulating Screws around the balance rim
        for (let p = 0; p < 8; p++) {
            const pAngle = (p * Math.PI * 2) / 8;
            const screwGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12);
            const screwMesh = new THREE.Mesh(screwGeo, this.mat.bluedSteel);
            screwMesh.position.set(
                Math.cos(pAngle) * 0.57,
                Math.sin(pAngle) * 0.57,
                0
            );
            screwMesh.rotation.z = pAngle;
            group.add(screwMesh);
        }

        // 4. Archimedean Coiled Hairspring (spiral curve)
        const spiralPoints = [];
        const coils = 5;
        const totalSteps = 120;
        for (let i = 0; i <= totalSteps; i++) {
            const t = i / totalSteps;
            const angle = t * coils * Math.PI * 2;
            const r = 0.06 + t * 0.35;
            spiralPoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, t * 0.02));
        }
        const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
        const spiralGeo = new THREE.TubeGeometry(spiralCurve, 80, 0.008, 6, false);
        const spiralMesh = new THREE.Mesh(spiralGeo, this.mat.bluedSteel);
        spiralMesh.position.z = 0.04;
        group.add(spiralMesh);

        // 5. Central Staff and Incabloc Shock Jewel
        const staffGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
        const staffMesh = new THREE.Mesh(staffGeo, this.mat.polishedSteel);
        staffMesh.rotation.x = Math.PI / 2;
        group.add(staffMesh);

        const shockJewelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
        const shockJewel = new THREE.Mesh(shockJewelGeo, this.mat.rubyJewel);
        shockJewel.rotation.x = Math.PI / 2;
        shockJewel.position.z = 0.08;
        group.add(shockJewel);

        this.balanceWheelGroup = group;

        this.registerPart({
            id: 8,
            code: "PART 08",
            name: "BALANCE WHEEL & HAIRSPRING",
            role: "Harmonic Heart (28,800 VPH)",
            materialName: "Glucydur Beryllium Bronze & Nivarox Spiral",
            tolerance: "± 0.0005 mm (0.5 micron)",
            desc: "The regulating organ oscillating at 4 Hz (28,800 vibrations/hour). The variable-inertia Glucydur balance wheel is poise-adjusted with 8 blued gold masselottes, powered by a self-compensating anti-magnetic Archimedean hairspring.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(-0.9, -0.6, -0.05),
            explodedPos: new THREE.Vector3(-1.8, -1.0, 0.2)
        });
    }

    /**
     * 9. ESCAPEMENT
     * 15-tooth club escape wheel & articulated pallet fork with ruby pallet jewels
     */
    buildEscapement() {
        const group = new THREE.Group();

        // 1. Club-tooth escape wheel
        const escapeWheelGroup = new THREE.Group();
        const numTeeth = 15;
        for (let i = 0; i < numTeeth; i++) {
            const angle = (i * Math.PI * 2) / numTeeth;
            // Club tooth shape
            const toothGeo = new THREE.BoxGeometry(0.03, 0.12, 0.015);
            const toothMesh = new THREE.Mesh(toothGeo, this.mat.brassGold);
            toothMesh.position.set(Math.cos(angle) * 0.26, Math.sin(angle) * 0.26, 0);
            toothMesh.rotation.z = angle + 0.35; // club angle
            escapeWheelGroup.add(toothMesh);
        }
        const wheelHubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
        const wheelHubMesh = new THREE.Mesh(wheelHubGeo, this.mat.brassGold);
        wheelHubMesh.rotation.x = Math.PI / 2;
        escapeWheelGroup.add(wheelHubMesh);

        group.add(escapeWheelGroup);
        this.escapementGroup = escapeWheelGroup;

        // 2. Pallet Fork Lever
        const palletGroup = new THREE.Group();
        const leverBodyGeo = new THREE.BoxGeometry(0.04, 0.36, 0.02);
        const leverBodyMesh = new THREE.Mesh(leverBodyGeo, this.mat.polishedSteel);
        palletGroup.add(leverBodyMesh);

        // Entry and Exit synthetic ruby pallet stones
        const rubyEntry = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.025), this.mat.rubyJewel);
        rubyEntry.position.set(-0.06, 0.15, 0);
        palletGroup.add(rubyEntry);

        const rubyExit = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.025), this.mat.rubyJewel);
        rubyExit.position.set(0.06, 0.15, 0);
        palletGroup.add(rubyExit);

        palletGroup.position.set(0.25, 0.15, 0);
        group.add(palletGroup);

        this.registerPart({
            id: 9,
            code: "PART 09",
            name: "SWISS ANCHOR ESCAPEMENT",
            role: "Energy Metering Organ",
            materialName: "Synthetic Ruby Pallets & Micro-Cut Steel",
            tolerance: "± 0.0008 mm",
            desc: "The precision energy release gateway. The 15-tooth club escape wheel transfers fractional impulses from the gear train into the balance wheel via two synthetic ruby pallet jewels, emitting the signature horological ticking.",
            callout: false,
            object: group,
            assembledPos: new THREE.Vector3(-1.2, 0.1, -0.08),
            explodedPos: new THREE.Vector3(-2.2, 0.2, 0.1)
        });
    }

    /**
     * 10. GEAR TRAIN
     * Center wheel, third wheel, fourth wheel (seconds wheel), and leaf-toothed steel pinions
     */
    buildGearTrain() {
        const group = new THREE.Group();

        // Helper to generate a realistic horological wheel with spokes and micro teeth
        const createHorologicalGear = (radius, teethCount, spokeCount, mat, pinionR = 0.06) => {
            const gearGroup = new THREE.Group();
            
            // Outer toothed rim
            const rimGeo = new THREE.TorusGeometry(radius, 0.025, 8, teethCount * 2);
            const rimMesh = new THREE.Mesh(rimGeo, mat);
            gearGroup.add(rimMesh);

            // Micro teeth
            for (let i = 0; i < teethCount; i++) {
                const angle = (i * Math.PI * 2) / teethCount;
                const toothGeo = new THREE.BoxGeometry(0.015, 0.04, 0.012);
                const toothMesh = new THREE.Mesh(toothGeo, mat);
                toothMesh.position.set(
                    Math.cos(angle) * (radius + 0.015),
                    Math.sin(angle) * (radius + 0.015),
                    0
                );
                toothMesh.rotation.z = angle;
                gearGroup.add(toothMesh);
            }

            // Skeletonized curved spokes
            for (let s = 0; s < spokeCount; s++) {
                const sAngle = (s * Math.PI * 2) / spokeCount;
                const spokeGeo = new THREE.BoxGeometry(0.02, radius, 0.012);
                const spokeMesh = new THREE.Mesh(spokeGeo, mat);
                spokeMesh.position.set(
                    Math.cos(sAngle) * (radius / 2),
                    Math.sin(sAngle) * (radius / 2),
                    0
                );
                spokeMesh.rotation.z = sAngle + Math.PI / 2;
                gearGroup.add(spokeMesh);
            }

            // Center steel pinion
            const pinionGeo = new THREE.CylinderGeometry(pinionR, pinionR, 0.14, 16);
            const pinionMesh = new THREE.Mesh(pinionGeo, this.mat.polishedSteel);
            pinionMesh.rotation.x = Math.PI / 2;
            gearGroup.add(pinionMesh);

            return gearGroup;
        };

        // 1. Center Wheel (Great Wheel - 1 rotation per hour)
        const centerWheel = createHorologicalGear(0.65, 48, 5, this.mat.brassGold, 0.08);
        centerWheel.position.set(0, 0, 0);
        group.add(centerWheel);

        // 2. Third Wheel
        const thirdWheel = createHorologicalGear(0.48, 36, 4, this.mat.brassGold, 0.06);
        thirdWheel.position.set(0.45, 0.35, 0.04);
        group.add(thirdWheel);

        // 3. Fourth Wheel (Seconds Wheel - 1 rotation per minute)
        const fourthWheel = createHorologicalGear(0.38, 30, 4, this.mat.brassGold, 0.05);
        fourthWheel.position.set(-0.25, 0.55, 0.08);
        group.add(fourthWheel);

        this.registerPart({
            id: 10,
            code: "PART 10",
            name: "GEAR TRAIN (ROUAGE)",
            role: "Kinematic Energy Transmission",
            materialName: "CuBe 22k Gold-Gilt Brass & Polished Steel Pinions",
            tolerance: "± 0.001 mm",
            desc: "The master kinematic multiplier transmitting stored potential energy from the mainspring to the escapement. Cycloidal gear teeth precision-hobbed to reduce friction to near-zero, supported by mirror-polished steel pinion pivots.",
            callout: true,
            calloutSide: 'right',
            object: group,
            assembledPos: new THREE.Vector3(0.5, 0.4, -0.12),
            explodedPos: new THREE.Vector3(1.4, 0.7, -0.4)
        });
    }

    /**
     * 11. MAINSPRING BARREL
     * Twin-capacity toothed barrel drum, snailed ratchet wheel, center arbor & click spring
     */
    buildMainspringBarrel() {
        const group = new THREE.Group();

        // 1. Toothed Barrel Drum
        const drumGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.22, 48);
        const drumMesh = new THREE.Mesh(drumGeo, this.mat.brassGold);
        drumMesh.rotation.x = Math.PI / 2;
        group.add(drumMesh);

        // 2. Drum perimeter gear teeth
        for (let i = 0; i < 48; i++) {
            const angle = (i * Math.PI * 2) / 48;
            const toothGeo = new THREE.BoxGeometry(0.02, 0.05, 0.2);
            const toothMesh = new THREE.Mesh(toothGeo, this.mat.brassGold);
            toothMesh.position.set(Math.cos(angle) * 0.73, Math.sin(angle) * 0.73, 0);
            toothMesh.rotation.z = angle;
            group.add(toothMesh);
        }

        // 3. Snailed Ratchet Wheel on top
        const ratchetGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.05, 36);
        const ratchetMesh = new THREE.Mesh(ratchetGeo, this.mat.cotesDeGeneve);
        ratchetMesh.rotation.x = Math.PI / 2;
        ratchetMesh.position.z = 0.12;
        group.add(ratchetMesh);

        // Center blued fixing screw
        const screwGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
        const screwMesh = new THREE.Mesh(screwGeo, this.mat.bluedSteel);
        screwMesh.rotation.x = Math.PI / 2;
        screwMesh.position.z = 0.16;
        group.add(screwMesh);

        this.registerPart({
            id: 11,
            code: "PART 11",
            name: "MAINSPRING BARREL",
            role: "Autonomous Power Cell",
            materialName: "Nivaflex Alloy & 22k Gold-Gilded Drum",
            tolerance: "± 0.002 mm",
            desc: "The mechanical power reservoir of Calibre 01. Houses a high-tensile Nivaflex spring ribbon coiled inside a toothed drum, storing 72 hours of constant-torque chronometric energy without electronic intervention.",
            callout: false,
            object: group,
            assembledPos: new THREE.Vector3(0.9, -0.6, -0.15),
            explodedPos: new THREE.Vector3(1.8, -0.8, -0.8)
        });
    }

    /**
     * 12. BRIDGES
     * Three-quarter bridge, train bridge, balance cock with Côtes de Genève & diamond anglage
     */
    buildBridges() {
        const group = new THREE.Group();

        // 1. Barrel & Train Bridge (Sculpted organic arch plate with CNC cutouts)
        const shape = new THREE.Shape();
        shape.moveTo(-0.4, 0.2);
        shape.lineTo(1.8, 0.4);
        shape.quadraticCurveTo(2.1, 0.0, 1.9, -1.2);
        shape.quadraticCurveTo(1.2, -1.6, 0.2, -1.4);
        shape.quadraticCurveTo(-0.2, -0.8, 0.1, -0.2);
        shape.quadraticCurveTo(-0.4, 0.0, -0.4, 0.2);

        const extrudeSettings = {
            depth: 0.12,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: 0.03,
            bevelThickness: 0.03
        };

        const bridgeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const bridgeMesh = new THREE.Mesh(bridgeGeo, this.mat.cotesDeGeneve);
        bridgeMesh.position.z = -0.06;
        group.add(bridgeMesh);

        // 2. Balance Cock Bridge (cantilever arch supporting the balance pivot)
        const cockShape = new THREE.Shape();
        cockShape.moveTo(-1.6, -1.2);
        cockShape.lineTo(-1.8, -0.7);
        cockShape.quadraticCurveTo(-1.4, -0.3, -0.9, -0.6);
        cockShape.quadraticCurveTo(-1.2, -1.1, -1.6, -1.2);

        const cockGeo = new THREE.ExtrudeGeometry(cockShape, extrudeSettings);
        const cockMesh = new THREE.Mesh(cockGeo, this.mat.cotesDeGeneve);
        cockMesh.position.z = 0.02;
        group.add(cockMesh);

        // 3. Mirror polished bevel anglage highlight lines
        const rimHighlightGeo = new THREE.TorusGeometry(2.1, 0.015, 8, 48);
        const rimHighlight = new THREE.Mesh(rimHighlightGeo, this.mat.polishedSteel);
        rimHighlight.position.z = 0.08;
        group.add(rimHighlight);

        this.registerPart({
            id: 12,
            code: "PART 12",
            name: "CÔTES DE GENÈVE BRIDGES",
            role: "Micro-Architectural Framework",
            materialName: "Rhodium-Finished Nickel Silver / Anglage",
            tolerance: "± 0.001 mm",
            desc: "Architectural bridges securing the wheel pivots under tension. Decorated with authentic Côtes de Genève (Geneva stripes), hand-chamfered anglage edges mirror-polished with gentian wood paste, and gold-filled calibre engravings.",
            callout: true,
            calloutSide: 'right',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.05),
            explodedPos: new THREE.Vector3(0, 0, 1.6)
        });
    }

    /**
     * 13. JEWELS
     * 16 synthetic ruby bearing jewels set in polished gold chatons
     */
    buildJewels() {
        const group = new THREE.Group();

        const jewelPositions = [
            { x: -0.9, y: -0.6, z: 0.1 },  // Balance cock jewel
            { x: -1.2, y: 0.1, z: 0.06 },   // Escapement jewel
            { x: 0.0, y: 0.0, z: 0.08 },    // Center pinion jewel
            { x: 0.45, y: 0.35, z: 0.08 },  // Third wheel jewel
            { x: -0.25, y: 0.55, z: 0.08 }, // Fourth wheel jewel
            { x: 0.9, y: -0.6, z: 0.08 },   // Barrel arbor jewel
            { x: 1.2, y: 0.2, z: 0.08 },
            { x: 0.7, y: -1.1, z: 0.08 },
            { x: -0.6, y: 0.6, z: 0.08 },
            { x: 0.3, y: 0.9, z: 0.08 }
        ];

        jewelPositions.forEach(pos => {
            const jewelSubGroup = new THREE.Group();

            // Gold Chaton mounting collar
            const chatonGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
            const chatonMesh = new THREE.Mesh(chatonGeo, this.mat.brassGold);
            chatonMesh.rotation.x = Math.PI / 2;
            jewelSubGroup.add(chatonMesh);

            // Synthetic Ruby Cabochon jewel
            const rubyGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16);
            const rubyMesh = new THREE.Mesh(rubyGeo, this.mat.rubyJewel);
            rubyMesh.rotation.x = Math.PI / 2;
            rubyMesh.position.z = 0.01;
            jewelSubGroup.add(rubyMesh);

            jewelSubGroup.position.set(pos.x, pos.y, pos.z);
            group.add(jewelSubGroup);
        });

        this.registerPart({
            id: 13,
            code: "PART 13",
            name: "SYNTHETIC RUBY JEWELS",
            role: "Low-Friction Kinetic Bearings",
            materialName: "Monocrystalline Corundum (Ruby) & 18k Gold Chatons",
            tolerance: "± 0.0005 mm",
            desc: "31 functional ruby bearings produced via the Verneuil flame-fusion process. Possessing exceptional hardness (Mohs 9) and minimal coefficient of friction with polished steel arbors, ensuring chronometric precision over decades.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.07),
            explodedPos: new THREE.Vector3(0, 0, 2.0)
        });
    }

    /**
     * 14. SCREWS
     * 16 heat-blued horological screws with slotted heads and polished chamfers
     */
    buildScrews() {
        const group = new THREE.Group();

        const screwPositions = [
            { x: 1.6, y: 0.3, z: 0.1 },
            { x: 1.8, y: -0.9, z: 0.1 },
            { x: 0.4, y: -1.4, z: 0.1 },
            { x: -0.3, y: -0.1, z: 0.1 },
            { x: -1.7, y: -1.1, z: 0.1 },
            { x: -1.5, y: -0.4, z: 0.1 },
            { x: 0.8, y: 0.8, z: 0.1 },
            { x: -0.8, y: 0.8, z: 0.1 }
        ];

        screwPositions.forEach(pos => {
            const screwSubGroup = new THREE.Group();

            // Screw Head
            const headGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
            const headMesh = new THREE.Mesh(headGeo, this.mat.bluedSteel);
            headMesh.rotation.x = Math.PI / 2;
            screwSubGroup.add(headMesh);

            // Screw Slot
            const slotGeo = new THREE.BoxGeometry(0.14, 0.02, 0.02);
            const slotMesh = new THREE.Mesh(slotGeo, this.mat.polishedSteel);
            slotMesh.position.z = 0.022;
            screwSubGroup.add(slotMesh);

            // Screw Shaft
            const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12);
            const shaftMesh = new THREE.Mesh(shaftGeo, this.mat.bluedSteel);
            shaftMesh.rotation.x = Math.PI / 2;
            shaftMesh.position.z = -0.06;
            screwSubGroup.add(shaftMesh);

            screwSubGroup.position.set(pos.x, pos.y, pos.z);
            group.add(screwSubGroup);
        });

        this.registerPart({
            id: 14,
            code: "PART 14",
            name: "HEAT-BLUED SCREWS",
            role: "Tensile Fasteners",
            materialName: "Thermally Blued Carbon Steel (54 HRC)",
            tolerance: "± 0.001 mm",
            desc: "Precision-turned steel screws tempered individually over a flame to achieve the royal cornflower blue oxide layer at 290°C. Features mirror-polished slots and diamond-beveled perimeters.",
            callout: false,
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0.09),
            explodedPos: new THREE.Vector3(0, 0, 2.3)
        });
    }

    /**
     * 15. CROWN & WINDING STEM
     * Fluted knurled winding crown with embossed crest & elongated winding stem
     */
    buildCrown() {
        const group = new THREE.Group();

        // 1. Knurled Fluted Crown Head
        const crownHeadGeo = new THREE.CylinderGeometry(0.42, 0.44, 0.38, 32);
        const crownHeadMesh = new THREE.Mesh(crownHeadGeo, this.mat.titanium);
        crownHeadMesh.rotation.z = Math.PI / 2;
        group.add(crownHeadMesh);

        // Fluted ridges around crown circumference
        for (let i = 0; i < 24; i++) {
            const angle = (i * Math.PI * 2) / 24;
            const ridgeGeo = new THREE.BoxGeometry(0.36, 0.03, 0.03);
            const ridgeMesh = new THREE.Mesh(ridgeGeo, this.mat.polishedSteel);
            ridgeMesh.position.set(
                0,
                Math.cos(angle) * 0.43,
                Math.sin(angle) * 0.43
            );
            group.add(ridgeMesh);
        }

        // Embossed brand logo / monogram cap
        const capGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 32);
        const capMesh = new THREE.Mesh(capGeo, this.mat.polishedSteel);
        capMesh.rotation.z = Math.PI / 2;
        capMesh.position.x = 0.2;
        group.add(capMesh);

        // 2. Elongated Winding Stem (extending into movement)
        const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16);
        const stemMesh = new THREE.Mesh(stemGeo, this.mat.polishedSteel);
        stemMesh.rotation.z = Math.PI / 2;
        stemMesh.position.x = -0.7;
        group.add(stemMesh);

        this.registerPart({
            id: 15,
            code: "PART 15",
            name: "WINDING CROWN & STEM",
            role: "Tactile User Interface",
            materialName: "Grade 5 Titanium & Hardened Steel Stem",
            tolerance: "± 0.002 mm",
            desc: "Double-sealed screw-down crown with micro-milled ergonomic gripping flutes. Transmits manual winding torque through a hardened steel stem equipped with triple water-resistant O-rings.",
            callout: true,
            calloutSide: 'right',
            object: group,
            assembledPos: new THREE.Vector3(3.05, 0, 0),
            explodedPos: new THREE.Vector3(5.6, 0, 0)
        });
    }

    /**
     * 16. CROWN GEARS
     * Winding pinion, sliding clutch wheel, and crown intermediate wheel
     */
    buildCrownGears() {
        const group = new THREE.Group();

        // 1. Sliding Clutch Wheel (castle wheel with radial teeth)
        const clutchGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.16, 20);
        const clutchMesh = new THREE.Mesh(clutchGeo, this.mat.polishedSteel);
        clutchMesh.rotation.z = Math.PI / 2;
        group.add(clutchMesh);

        // 2. Winding Pinion
        const pinionGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 24);
        const pinionMesh = new THREE.Mesh(pinionGeo, this.mat.brassGold);
        pinionMesh.rotation.z = Math.PI / 2;
        pinionMesh.position.x = -0.22;
        group.add(pinionMesh);

        // 3. Crown Wheel (meshing with ratchet wheel)
        const crownWheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 32);
        const crownWheelMesh = new THREE.Mesh(crownWheelGeo, this.mat.polishedSteel);
        crownWheelMesh.position.set(-0.55, 0.35, 0);
        group.add(crownWheelMesh);

        this.registerPart({
            id: 16,
            code: "PART 16",
            name: "CROWN GEARS & CLUTCH",
            role: "Winding & Setting Train",
            materialName: "Carburized Hardened Steel & Beryllium Bronze",
            tolerance: "± 0.002 mm",
            desc: "Keyless winding works including the Breguet sliding clutch and winding pinion. Engages the mainspring during manual winding and shifts into gear-contact during time calibration.",
            callout: false,
            object: group,
            assembledPos: new THREE.Vector3(2.1, 0, 0),
            explodedPos: new THREE.Vector3(3.8, 0, 0)
        });
    }

    /**
     * 17. CASE MIDDLE
     * Sculpted Grade-5 Titanium case middle with ergonomic curved lugs & crown guards
     */
    buildCaseMiddle() {
        const group = new THREE.Group();

        // 1. Central Circular Case Drum
        const drumGeo = new THREE.CylinderGeometry(2.72, 2.76, 0.72, 64, 1, true);
        const drumMesh = new THREE.Mesh(drumGeo, this.mat.titanium);
        drumMesh.rotation.x = Math.PI / 2;
        group.add(drumMesh);

        // 2. Four Sculpted Ergonomic Horn Lugs
        const lugConfigs = [
            { x: -1.85, y: 2.65, rotZ: 0.18 }, // Top Left
            { x: 1.85, y: 2.65, rotZ: -0.18 }, // Top Right
            { x: -1.85, y: -2.65, rotZ: -0.18 }, // Bottom Left
            { x: 1.85, y: -2.65, rotZ: 0.18 }  // Bottom Right
        ];

        lugConfigs.forEach(cfg => {
            const lugGeo = new THREE.BoxGeometry(0.38, 1.25, 0.65);
            const lugMesh = new THREE.Mesh(lugGeo, this.mat.titanium);
            lugMesh.position.set(cfg.x, cfg.y, -0.05);
            lugMesh.rotation.z = cfg.rotZ;
            group.add(lugMesh);

            // Chamfered mirror-polished lug facet
            const facetGeo = new THREE.BoxGeometry(0.08, 1.25, 0.15);
            const facetMesh = new THREE.Mesh(facetGeo, this.mat.polishedSteel);
            facetMesh.position.set(cfg.x + (cfg.x > 0 ? 0.16 : -0.16), cfg.y, 0.22);
            facetMesh.rotation.z = cfg.rotZ;
            group.add(facetMesh);
        });

        // 3. Integrated Crown Guards at 3 o'clock (+X)
        const guardGeo = new THREE.BoxGeometry(0.35, 1.2, 0.45);
        const guardMesh = new THREE.Mesh(guardGeo, this.mat.titanium);
        guardMesh.position.set(2.75, 0, 0);
        group.add(guardMesh);

        this.registerPart({
            id: 17,
            code: "PART 17",
            name: "CASE MIDDLE (CARRURE)",
            role: "Monolithic Armor Chassis",
            materialName: "Grade 5 Titanium (Ti-6Al-4V)",
            tolerance: "± 0.002 mm",
            desc: "Monolithic aerospace Grade-5 titanium chassis forged under 150-ton hydraulic pressure. Alternating satin-brushed flanks and hand-polished sweeping chamfers deliver exceptional featherweight rigidity and 300m pressure endurance.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0),
            explodedPos: new THREE.Vector3(0, 0, 0) // Anchor datum stays centered!
        });
    }

    /**
     * 18. CASE BACK
     * Exhibition screw-down caseback ring with engraved hallmarks & exhibition sapphire
     */
    buildCaseBack() {
        const group = new THREE.Group();

        // 1. Threaded Titanium Outer Ring
        const ringGeo = new THREE.CylinderGeometry(2.75, 2.75, 0.15, 64, 1, true);
        const ringMesh = new THREE.Mesh(ringGeo, this.mat.caseback);
        ringMesh.rotation.x = Math.PI / 2;
        group.add(ringMesh);

        // Flat engraved caseback annular face
        const faceGeo = new THREE.RingGeometry(1.65, 2.75, 64);
        const faceMesh = new THREE.Mesh(faceGeo, this.mat.caseback);
        faceMesh.position.z = -0.07;
        faceMesh.rotation.y = Math.PI; // facing backward
        group.add(faceMesh);

        // 6 Notches around perimeter for case-opening tool
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const notchGeo = new THREE.BoxGeometry(0.18, 0.1, 0.08);
            const notchMesh = new THREE.Mesh(notchGeo, this.mat.polishedSteel);
            notchMesh.position.set(Math.cos(angle) * 2.58, Math.sin(angle) * 2.58, -0.07);
            notchMesh.rotation.z = angle;
            group.add(notchMesh);
        }

        // 2. Fitted Exhibition Sapphire Crystal Window
        const glassGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.08, 48);
        const glassMesh = new THREE.Mesh(glassGeo, this.mat.sapphireCrystal);
        glassMesh.rotation.x = Math.PI / 2;
        group.add(glassMesh);

        this.registerPart({
            id: 18,
            code: "PART 18",
            name: "EXHIBITION CASE BACK",
            role: "Hermetic Exhibition Shield",
            materialName: "Titanium & Flat Sapphire Crystal",
            tolerance: "± 0.002 mm",
            desc: "Threaded screw-down caseback with 6 torque-tool notches. Fitted with an exhibition sapphire crystal revealing the internal mechanical architecture while maintaining hermetic integrity up to 30 bar (300 meters).",
            callout: true,
            calloutSide: 'right',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, -0.55),
            explodedPos: new THREE.Vector3(0, 0, -5.6)
        });
    }

    /**
     * 19. ROTOR (OSCILLATING WEIGHT)
     * Semicircular skeletonized automatic rotor with 22k gold rim & ball-bearing race
     */
    buildRotor() {
        const group = new THREE.Group();

        // 1. Semicircular Sintered Heavy Mass
        const rotorShape = new THREE.Shape();
        rotorShape.absarc(0, 0, 2.15, 0, Math.PI, false);
        rotorShape.lineTo(0.5, 0);
        rotorShape.absarc(0, 0, 0.5, 0, Math.PI, true);
        rotorShape.closePath();

        const extrudeSettings = {
            depth: 0.10,
            bevelEnabled: true,
            bevelSegments: 3,
            bevelSize: 0.02,
            bevelThickness: 0.02
        };

        const rotorGeo = new THREE.ExtrudeGeometry(rotorShape, extrudeSettings);
        const rotorMesh = new THREE.Mesh(rotorGeo, this.mat.rotorGold);
        rotorMesh.position.z = -0.05;
        group.add(rotorMesh);

        // 2. Central Micro Ceramic Ball-Bearing Hub
        const hubGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 32);
        const hubMesh = new THREE.Mesh(hubGeo, this.mat.polishedSteel);
        hubMesh.rotation.x = Math.PI / 2;
        group.add(hubMesh);

        // Bearing balls
        for (let b = 0; b < 7; b++) {
            const bAngle = (b * Math.PI * 2) / 7;
            const ballGeo = new THREE.SphereGeometry(0.045, 12, 12);
            const ballMesh = new THREE.Mesh(ballGeo, this.mat.rubyJewel);
            ballMesh.position.set(Math.cos(bAngle) * 0.24, Math.sin(bAngle) * 0.24, 0.03);
            group.add(ballMesh);
        }

        this.rotorGroup = group;

        this.registerPart({
            id: 19,
            code: "PART 19",
            name: "SKELETONIZED OSCILLATING ROTOR",
            role: "Kinetic Auto-Winding Mass",
            materialName: "Tungsten Heavy Metal & 22k Gold Inlay",
            tolerance: "± 0.001 mm",
            desc: "High-density semicircular winding weight with tungsten peripheral mass to maximize gravitational winding efficiency. Mounted on unlubricated ceramic micro-ball bearings with bidirectional winding pawls.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, -0.38),
            explodedPos: new THREE.Vector3(0, 0, -2.8)
        });
    }

    /**
     * 20. GASKETS
     * Front crystal elastomer O-ring gasket and rear caseback waterproof sealing ring
     */
    buildGaskets() {
        const group = new THREE.Group();

        // 1. Front Crystal Gasket
        const frontGasketGeo = new THREE.TorusGeometry(2.5, 0.04, 16, 64);
        const frontGasketMesh = new THREE.Mesh(frontGasketGeo, this.mat.gasket);
        frontGasketMesh.position.z = 0.48;
        group.add(frontGasketMesh);

        // 2. Rear Caseback O-Ring Gasket
        const rearGasketGeo = new THREE.TorusGeometry(2.6, 0.05, 16, 64);
        const rearGasketMesh = new THREE.Mesh(rearGasketGeo, this.mat.gasket);
        rearGasketMesh.position.z = -0.45;
        group.add(rearGasketMesh);

        this.registerPart({
            id: 20,
            code: "PART 20",
            name: "SEALING GASKETS (O-RINGS)",
            role: "Hermetic Barrier System",
            materialName: "Fluorocarbon Elastomer (Viton)",
            tolerance: "± 0.005 mm",
            desc: "Aerospace-grade fluorocarbon synthetic elastomer O-rings offering extreme chemical resistance and high compressive elastic memory to guarantee hermetic water resistance to 300 meters.",
            callout: false,
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0),
            explodedPos: new THREE.Vector3(0, 0, 6.8)
        });
    }

    /**
     * 21. INNER MECHANICAL COMPONENTS
     * Chronograph column wheel (pillar wheel with 6 columns), reset hammer lever & jumper springs
     */
    buildInnerMechanicalParts() {
        const group = new THREE.Group();

        // 1. Chronograph Column Wheel (6 vertical pillars on geared ratchet base)
        const colWheelBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), this.mat.polishedSteel);
        colWheelBase.rotation.x = Math.PI / 2;
        group.add(colWheelBase);

        for (let p = 0; p < 6; p++) {
            const pAngle = (p * Math.PI * 2) / 6;
            const pillarGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12);
            const pillarMesh = new THREE.Mesh(pillarGeo, this.mat.polishedSteel);
            pillarMesh.rotation.x = Math.PI / 2;
            pillarMesh.position.set(Math.cos(pAngle) * 0.20, Math.sin(pAngle) * 0.20, 0.08);
            group.add(pillarMesh);
        }

        // Center blued fixing screw
        const colScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), this.mat.bluedSteel);
        colScrew.rotation.x = Math.PI / 2;
        colScrew.position.z = 0.12;
        group.add(colScrew);

        // 2. Articulated Reset Hammer Lever
        const leverShape = new THREE.Shape();
        leverShape.moveTo(0, 0);
        leverShape.lineTo(0.65, 0.25);
        leverShape.lineTo(0.58, 0.45);
        leverShape.lineTo(-0.15, 0.2);
        leverShape.closePath();

        const leverGeo = new THREE.ExtrudeGeometry(leverShape, { depth: 0.04, bevelEnabled: false });
        const leverMesh = new THREE.Mesh(leverGeo, this.mat.polishedSteel);
        leverMesh.position.set(-0.25, -0.4, 0.02);
        group.add(leverMesh);

        this.registerPart({
            id: 21,
            code: "PART 21",
            name: "COLUMN WHEEL & COUPLING LEVERS",
            role: "Chronograph Command Center",
            materialName: "Hardened Carbon Steel & Micro-Spring Alloys",
            tolerance: "± 0.001 mm",
            desc: "The prestigious command center of the chronograph function. The 6-pillar column wheel orchestrates start, stop, and flyback zero-reset commands with silky tactile actuation feel.",
            callout: true,
            calloutSide: 'right',
            object: group,
            assembledPos: new THREE.Vector3(0.2, 0.9, -0.02),
            explodedPos: new THREE.Vector3(0.5, 1.6, 0.9)
        });
    }

    /**
     * 22. STRAP CONNECTORS
     * Solid titanium end-links & quick-release cylindrical spring bars (top and bottom)
     */
    buildStrapConnectors() {
        const group = new THREE.Group();

        // Top End-Link
        const topEndGeo = new THREE.BoxGeometry(1.68, 0.45, 0.42);
        const topEndMesh = new THREE.Mesh(topEndGeo, this.mat.titanium);
        topEndMesh.position.set(0, 2.85, -0.15);
        group.add(topEndMesh);

        // Top Spring Bar
        const topBarGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.85, 16);
        const topBarMesh = new THREE.Mesh(topBarGeo, this.mat.polishedSteel);
        topBarMesh.rotation.z = Math.PI / 2;
        topBarMesh.position.set(0, 2.95, -0.15);
        group.add(topBarMesh);

        // Bottom End-Link
        const bottomEndGeo = new THREE.BoxGeometry(1.68, 0.45, 0.42);
        const bottomEndMesh = new THREE.Mesh(bottomEndGeo, this.mat.titanium);
        bottomEndMesh.position.set(0, -2.85, -0.15);
        group.add(bottomEndMesh);

        // Bottom Spring Bar
        const bottomBarGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.85, 16);
        const bottomBarMesh = new THREE.Mesh(bottomBarGeo, this.mat.polishedSteel);
        bottomBarMesh.rotation.z = Math.PI / 2;
        bottomBarMesh.position.set(0, -2.95, -0.15);
        group.add(bottomBarMesh);

        this.registerPart({
            id: 22,
            code: "PART 22",
            name: "SOLID END LINKS & SPRING BARS",
            role: "Ergonomic Articulation Interface",
            materialName: "Titanium Grade 5 & Stainless Steel Barrels",
            tolerance: "± 0.003 mm",
            desc: "Custom-machined titanium solid end-links seamlessly integrating with the case radius. Incorporates internal dual-flange quick-release spring bars engineered for 250N tensile strength.",
            callout: false,
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0),
            explodedPos: new THREE.Vector3(0, 0, -1.2)
        });
    }

    /**
     * 23. LEATHER/METAL STRAP SECTIONS
     * Top alligator leather strap with saddle stitching, and bottom strap with titanium folding deployant clasp
     */
    buildStrapSections() {
        const group = new THREE.Group();

        // 1. Top Strap Section (curving upwards and back)
        const topStrapGeo = new THREE.BoxGeometry(1.58, 2.8, 0.22);
        const topStrapMesh = new THREE.Mesh(topStrapGeo, this.mat.strap);
        topStrapMesh.position.set(0, 4.4, -0.38);
        topStrapMesh.rotation.x = 0.22;
        group.add(topStrapMesh);

        // 2. Bottom Strap Section
        const bottomStrapGeo = new THREE.BoxGeometry(1.58, 2.8, 0.22);
        const bottomStrapMesh = new THREE.Mesh(bottomStrapGeo, this.mat.strap);
        bottomStrapMesh.position.set(0, -4.4, -0.38);
        bottomStrapMesh.rotation.x = -0.22;
        group.add(bottomStrapMesh);

        // 3. Titanium Butterfly Deployant Clasp Buckle
        const claspGeo = new THREE.BoxGeometry(1.4, 0.55, 0.26);
        const claspMesh = new THREE.Mesh(claspGeo, this.mat.titanium);
        claspMesh.position.set(0, -5.85, -0.5);
        group.add(claspMesh);

        // Embossed logo on clasp
        const claspLogo = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.04), this.mat.polishedSteel);
        claspLogo.position.set(0, -5.85, -0.36);
        group.add(claspLogo);

        this.registerPart({
            id: 23,
            code: "PART 23",
            name: "ALLIGATOR STRAP & DEPLOYANT CLASP",
            role: "Ergonomic Wrist Adornment",
            materialName: "Hand-Stitched Mississippiensis Alligator & Titanium Clasp",
            tolerance: "± 0.05 mm",
            desc: "Hand-selected large-scale Louisiana alligator leather, vegetable tanned and hand-stitched by Genevan artisans with beeswax flax thread. Secured by a double-folding titanium butterfly security clasp.",
            callout: true,
            calloutSide: 'left',
            object: group,
            assembledPos: new THREE.Vector3(0, 0, 0),
            explodedPos: new THREE.Vector3(0, 0, -2.4)
        });
    }

    /**
     * Update all parts based on normalized scroll progress (0.0 to 1.0)
     * @param {number} progress Normalized progress from 0 (assembled) to 1 (fully exploded)
     */
    updateExplosion(progress) {
        // Clamp 0 to 1
        const p = Math.max(0, Math.min(1, progress));

        this.parts.forEach(part => {
            const u = part.userData;
            u.currentProgress = p;

            // Phase curve: Easing for pin-to-pin mechanical precision
            // Separation starts at p = 0.25 and smoothly expands to max at p = 0.9
            let factor = 0;
            if (p > 0.2) {
                factor = Math.min(1, (p - 0.2) / 0.7);
                // Smooth cubic ease out
                factor = 1 - Math.pow(1 - factor, 2.5);
            }

            // Lerp position from assembledPos to explodedPos
            part.position.lerpVectors(u.assembledPos, u.explodedPos, factor);

            // Interpolate rotation if any exploded rotation is set
            if (u.explodedRot && (u.explodedRot.x !== 0 || u.explodedRot.y !== 0 || u.explodedRot.z !== 0)) {
                part.rotation.x = THREE.MathUtils.lerp(u.assembledRot.x, u.explodedRot.x, factor);
                part.rotation.y = THREE.MathUtils.lerp(u.assembledRot.y, u.explodedRot.y, factor);
                part.rotation.z = THREE.MathUtils.lerp(u.assembledRot.z, u.explodedRot.z, factor);
            }
        });
    }

    /**
     * Real-time animation tick for mechanical movement:
     * - Balance wheel oscillation (4Hz harmonic oscillation)
     * - Escape wheel impulse
     * - Rotor inertial movement
     * - Hands sweeping
     */
    animateMovement(time, delta) {
        // 1. Balance wheel oscillation: 4Hz = 8 beats per sec
        if (this.balanceWheelGroup) {
            const oscillationAngle = Math.sin(time * 25.13) * 0.55; // ~280 degrees amplitude
            this.balanceWheelGroup.rotation.z = oscillationAngle;
        }

        // 2. Escape wheel micro-rotation
        if (this.escapementGroup) {
            this.escapementGroup.rotation.z += delta * 1.5;
        }

        // 3. Sweep hands continuously
        if (this.secondHandMesh) {
            this.secondHandMesh.rotation.z -= delta * (Math.PI * 2 / 60); // 60s per rev
        }
        if (this.minuteHandMesh) {
            this.minuteHandMesh.rotation.z -= delta * (Math.PI * 2 / 3600); // 1hr per rev
        }
        if (this.hourHandMesh) {
            this.hourHandMesh.rotation.z -= delta * (Math.PI * 2 / 43200); // 12hr per rev
        }

        // 4. Subtle Rotor sway based on time
        if (this.rotorGroup) {
            const rotorSway = Math.sin(time * 0.8) * 0.25 + Math.cos(time * 1.6) * 0.12;
            this.rotorGroup.rotation.z = rotorSway;
        }
    }
}

window.WatchGeometryBuilder = WatchGeometryBuilder;
