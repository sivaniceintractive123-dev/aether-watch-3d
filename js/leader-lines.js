/**
 * AETHER CALIBRE 01 - Dynamic 2D/3D Leader Lines System
 * Projects 3D part coordinates into screen space via camera projection matrix
 * and renders SVG leader lines with responsive technical labels.
 */

class TechnicalLeaderLines {
    constructor(sceneInstance) {
        this.scene = sceneInstance;
        this.svg = document.querySelector('#leader-lines-svg');
        this.container = document.querySelector('#leader-labels-container');
        this.parentContainer = document.querySelector('#leader-lines-container');
        this.activeLabels = [];
        this.visible = false;

        this.initLabels();
    }

    initLabels() {
        if (!this.svg || !this.container) return;

        // Select key components to showcase with dynamic callouts
        const calloutIds = [1, 2, 4, 5, 8, 10, 12, 15, 17, 18, 19];

        calloutIds.forEach(id => {
            const part = this.scene.watchBuilder.partsMap.get(id);
            if (!part) return;

            const u = part.userData;

            // Create HTML Label Badge
            const badge = document.createElement('div');
            badge.className = `leader-badge leader-badge-${u.calloutSide || 'left'}`;
            badge.dataset.partId = id;
            badge.innerHTML = `
                <div class="leader-badge-dot"></div>
                <div class="leader-badge-content">
                    <span class="leader-badge-code">${u.code}</span>
                    <h4 class="leader-badge-title">${u.name}</h4>
                    <p class="leader-badge-role">${u.role}</p>
                </div>
            `;

            // Hover and click bindings
            badge.addEventListener('mouseenter', () => {
                this.scene.highlightPart(part);
            });
            badge.addEventListener('mouseleave', () => {
                this.scene.unhighlightPart(part);
            });
            badge.addEventListener('click', () => {
                this.scene.selectPart(part);
            });

            this.container.appendChild(badge);

            // Create SVG Path for leader line
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'leader-line-path');
            path.setAttribute('data-part-id', id);
            this.svg.appendChild(path);

            this.activeLabels.push({
                id,
                part,
                badge,
                path,
                side: u.calloutSide || 'left'
            });
        });
    }

    update(scrollProgress) {
        if (!this.svg || !this.container) return;

        // Only show leader lines once exploded disassembly is underway (progress > 0.4)
        if (scrollProgress < 0.4) {
            if (this.parentContainer) {
                this.parentContainer.style.opacity = '0';
                this.parentContainer.style.pointerEvents = 'none';
            }
            this.svg.style.opacity = '0';
            this.container.style.opacity = '0';
            this.visible = false;
            return;
        }

        const opacity = Math.min(1, (scrollProgress - 0.4) / 0.25);
        if (this.parentContainer) {
            this.parentContainer.style.opacity = opacity.toFixed(3);
            this.parentContainer.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
        }
        this.svg.style.opacity = opacity.toFixed(3);
        this.container.style.opacity = opacity.toFixed(3);
        this.visible = true;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const camera = this.scene.camera;

        // Position labels and project lines
        this.activeLabels.forEach((item, index) => {
            const worldPos = new THREE.Vector3();
            item.part.getWorldPosition(worldPos);

            // Project 3D coordinate to normalized device coordinates (-1 to +1)
            const ndc = worldPos.clone().project(camera);

            // Check if component is in front of camera
            if (ndc.z > 1) {
                item.badge.style.display = 'none';
                item.path.setAttribute('d', '');
                return;
            }

            item.badge.style.display = 'flex';

            // Convert NDC to screen pixels
            const originX = (ndc.x * 0.5 + 0.5) * w;
            const originY = (-(ndc.y * 0.5) + 0.5) * h;

            // Calibrated anchor positions on left and right flanks
            const isLeft = item.side === 'left';
            const margin = w < 768 ? 20 : (w < 1200 ? 40 : 80);
            
            // Distribute badges vertically
            const totalOnSide = this.activeLabels.filter(l => l.side === item.side).length;
            const sideIndex = this.activeLabels.filter(l => l.side === item.side).indexOf(item);
            const verticalSpread = h * 0.65;
            const targetY = h * 0.2 + (sideIndex / (totalOnSide - 1 || 1)) * verticalSpread;
            const targetX = isLeft ? margin : w - margin - 220;

            // Position badge
            item.badge.style.transform = `translate(${targetX}px, ${targetY}px)`;

            // Calculate elbow connector path: Origin -> Corner -> Badge
            const badgeAnchorX = isLeft ? targetX + 220 : targetX;
            const badgeAnchorY = targetY + 22;

            const elbowX = isLeft ? (originX + badgeAnchorX) * 0.5 - 20 : (originX + badgeAnchorX) * 0.5 + 20;

            const pathD = `M ${originX.toFixed(1)} ${originY.toFixed(1)} L ${elbowX.toFixed(1)} ${badgeAnchorY.toFixed(1)} L ${badgeAnchorX.toFixed(1)} ${badgeAnchorY.toFixed(1)}`;
            item.path.setAttribute('d', pathD);

            // Emphasize line if currently hovered
            if (this.scene.hoveredPart && this.scene.hoveredPart.userData.id === item.id) {
                item.path.classList.add('active');
                item.badge.classList.add('active');
            } else {
                item.path.classList.remove('active');
                item.badge.classList.remove('active');
            }
        });
    }
}

window.TechnicalLeaderLines = TechnicalLeaderLines;
