# AETHER CALIBRE 01 — The Architecture of Time
### Cinematic Luxury Swiss Watchmaking Experience with Scroll-Driven 3D Exploded-View

A premier, museum-grade luxury watch website built with Three.js, GSAP ScrollTrigger, Lenis smooth scrolling, and procedural Web Audio API mechanical sound synthesis.

---

## 💎 Core Experience

- **Photorealistic 3D Watch**: Initially floats in the center of the viewport as an assembled, master chronometer.
- **Pinned Viewport Scroll System**: Continuous 600vh scroll section that keeps the watch centered while dynamically rotating and exploding its 23 precision-engineered components along its assembly axis.
- **Deterministic 0 → 1 Reversibility**: Disassembles smoothly when scrolling down; perfectly reassembles in reverse order when scrolling up.
- **Pin-to-Pin Mechanical Precision**: All components stay aligned along the central optical laser axis with zero confusing overlap or random scattering.
- **Dynamic 2D/3D Technical Leader Lines**: Screen-space projected SVG leader lines with glowing dots connecting to interactive callouts on key components.
- **Interactive Part Inspection & Technical Dossier**: Hover over any component to see it lift with an emissive highlight; click to open the slide-out Horological Dossier with micron tolerances and material breakdown.
- **4Hz Escapement Audio Synthesizer**: Procedural Web Audio API simulating 28,800 vibrations per hour (8 ticks per second with alternating "tic" and "tac" pallet jewel strikes) and scroll ratcheting sounds.
- **Live Finish Customizer**:
  - **Grade 5 Titanium Chronos** (Ref. 01.100)
  - **18K 5N Rose Gold Nocturne** (Ref. 01.200)
  - **Obsidian DLC Stealth** (Ref. 01.300)
- **Free 3D Orbit Inspection Mode**: Allows 360° mouse drag orbit around the exploded watch in 3D space with a one-click reset camera function.

---

## ⚙️ The 23 Controllable 3D Components

1. **Sapphire Crystal** (Double-domed synthetic corundum, 9 Mohs hardness, dual-sided AR coating)
2. **Ceramic Bezel** (Zirconia ZrO2 ceramic with liquid platinum tachymeter scale)
3. **Hour Markers & Indices** (12 applied faceted 3D baton indices with Swiss Super-LumiNova Grade X1)
4. **Watch Hands & Arbor** (Dauphine hour & minute hands, blued steel chronograph seconds needle with counterweight)
5. **Chronometer Dial** (Anthracite sunburst galvanic brass plate with recessed registers & date window)
6. **Date Mechanism** (Instantaneous 31-tooth star wheel, calibrated date disc, and jumper spring)
7. **Main Plate (Platine)** (German silver baseplate with 280 engine-turned circular perlage disks and CNC pockets)
8. **Balance Wheel & Hairspring** (Glucydur beryllium bronze rim with poise screws and Archimedean spiral hairspring oscillating at 28,800 VPH)
9. **Swiss Anchor Escapement** (15-tooth club escape wheel and articulated pallet fork with synthetic ruby pallet stones)
10. **Gear Train (Rouage)** (Cycloidal-toothed center wheel, third wheel, fourth seconds wheel, and polished steel pinions)
11. **Mainspring Barrel** (Twin-capacity Nivaflex power cell storing 72 hours of constant torque, snailed ratchet wheel)
12. **Côtes de Genève Bridges** (Three-quarter bridge and balance cock with Geneva wave stripes and hand-beveled mirror anglage)
13. **Synthetic Ruby Jewels** (31 monocrystalline ruby bearings set in polished 18k gold chatons)
14. **Heat-Blued Screws** (Thermally oxidized carbon steel screws tempered at exactly 290°C)
15. **Winding Crown & Stem** (Ergonomic fluted titanium crown with embossed crest and double O-ring stem)
16. **Crown Gears & Clutch** (Breguet sliding clutch wheel, winding pinion, and intermediate crown wheel)
17. **Case Middle (Carrure)** (Monolithic aerospace Grade-5 titanium chassis with satin flanks and mirror chamfers)
18. **Exhibition Case Back** (Threaded titanium ring with 6 tool notches and sapphire exhibition crystal window)
19. **Skeletonized Oscillating Rotor** (Bidirectional automatic winding mass with heavy tungsten/22k gold outer rim)
20. **Sealing Gaskets** (Viton fluorocarbon elastomer O-rings guaranteeing 300m / 30 bar water resistance)
21. **Inner Mechanical Parts** (6-pillar chronograph column wheel, coupling clutch, and reset hammer levers)
22. **Solid End Links & Spring Bars** (Articulated titanium end-links with dual-flange quick-release spring bars)
23. **Alligator Strap & Deployant Clasp** (Hand-stitched Louisiana alligator leather with folding titanium butterfly buckle)

---

## 🚀 Running the Experience Locally

### Option A: Local Static Server (Recommended)
Run the included Node.js server:
```bash
node server.js
```
Then open:
```
http://localhost:3333
```

### Option B: Direct Browser Opening
Simply double-click or open `index.html` in any modern WebGL-compatible browser (Chrome, Edge, Safari, Firefox).

---

## ⌨️ Keyboard Shortcuts

- **M**: Toggle 4Hz Mechanical Escapement Sound On/Off
- **O**: Toggle 3D Free Orbit Inspection Mode
- **Escape**: Close any active drawer (Horological Dossier, Specifications, Bespoke Allocation)

---

## 📐 Technologies Used

- **Three.js (r128)**: High-performance WebGL scene, PBR materials, ACESFilmic tone-mapping, soft shadows, and raycasting.
- **GSAP 3.12 & ScrollTrigger**: Silky smooth scroll synchronization mapping progress (0 → 1) to 3D explosion vectors and cinematic camera movement.
- **Lenis Smooth Scroll**: Luxury inertial momentum scrolling.
- **Web Audio API**: Real-time synthesized 4Hz horological escapement engine and scroll ratcheting sounds.
- **Responsive Layout**: Designed for 4K displays down to mobile smartphones with adaptive camera distances and touch controls.
