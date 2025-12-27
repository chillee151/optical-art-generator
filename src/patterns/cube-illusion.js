/**
 * Cube Illusion Pattern
 * Creates mesmerizing isometric cube arrays with Escher-style impossible geometry,
 * dynamic perspective, and wave-based depth modulation
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const cubeIllusion = {
    name: 'Cube Illusion',
    description: 'Creates mesmerizing isometric cube arrays with Escher-style impossible geometry, dynamic perspective, and wave-based depth modulation',
    category: 'geometric',

    // Default slider values for this pattern
    defaults: {
        complexity: 160,
        frequency: 35,
        amplitude: -892
    },

    /**
     * Generate full-size pattern
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context
     */
    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            centerX, centerY, lineWidth, seed
        } = ctx;
        const seededRandom = (s) => ctx.seededRandom(s);

        // Use complexity to determine grid density
        const gridDensity = Math.max(2, Math.floor(complexity / 15));
        const baseSize = Math.min(width, height) / (gridDensity + 2);

        // Helper function to draw an isometric cube
        const drawIsometricCube = (cx, cy, size, lw, shouldFlip, orientationFactor, rotationAngle, colorIndex, totalCubes) => {
            // Isometric projection angles: 30° for depth
            const angle = Math.PI / 6; // 30 degrees
            const cos30 = Math.cos(angle);
            const sin30 = Math.sin(angle);

            // Calculate cube vertices in isometric view
            const halfSize = size / 2;

            // Define 8 vertices of a cube in isometric projection
            // Flip orientation based on shouldFlip for Escher effect
            const flipMultiplier = shouldFlip ? -1 : 1;
            const orientMult = orientationFactor;

            const vertices = [
                // Bottom face (closer)
                { x: cx - halfSize * cos30 * flipMultiplier, y: cy + halfSize * sin30 + halfSize },
                { x: cx + halfSize * cos30 * flipMultiplier, y: cy - halfSize * sin30 + halfSize },
                { x: cx + halfSize * cos30 * flipMultiplier, y: cy - halfSize * sin30 - halfSize },
                { x: cx - halfSize * cos30 * flipMultiplier, y: cy + halfSize * sin30 - halfSize },
                // Top face (farther)
                { x: cx - halfSize * cos30 * flipMultiplier * orientMult, y: cy + halfSize * sin30 * orientMult },
                { x: cx + halfSize * cos30 * flipMultiplier * orientMult, y: cy - halfSize * sin30 * orientMult },
                { x: cx + halfSize * cos30 * flipMultiplier * orientMult, y: cy - halfSize * sin30 * orientMult - size },
                { x: cx - halfSize * cos30 * flipMultiplier * orientMult, y: cy + halfSize * sin30 * orientMult - size }
            ];

            // Get colors for different faces
            const topColor = ctx.getLineColor(colorIndex, totalCubes);
            const leftColor = ctx.getLineColor(colorIndex + totalCubes / 3, totalCubes);
            const rightColor = ctx.getLineColor(colorIndex + 2 * totalCubes / 3, totalCubes);

            // Draw three visible faces with different colors for depth

            // Top face (parallelogram)
            const topFace = createSvgElement('path');
            const topPath = `M ${vertices[3].x} ${vertices[3].y}
                            L ${vertices[2].x} ${vertices[2].y}
                            L ${vertices[6].x} ${vertices[6].y}
                            L ${vertices[7].x} ${vertices[7].y} Z`;
            topFace.setAttribute('d', topPath);
            topFace.setAttribute('fill', topColor);
            topFace.setAttribute('fill-opacity', '0.3');
            topFace.setAttribute('stroke', topColor);
            topFace.setAttribute('stroke-width', lw);
            layerGroup.appendChild(topFace);

            // Left face
            const leftFace = createSvgElement('path');
            const leftPath = `M ${vertices[0].x} ${vertices[0].y}
                             L ${vertices[3].x} ${vertices[3].y}
                             L ${vertices[7].x} ${vertices[7].y}
                             L ${vertices[4].x} ${vertices[4].y} Z`;
            leftFace.setAttribute('d', leftPath);
            leftFace.setAttribute('fill', leftColor);
            leftFace.setAttribute('fill-opacity', '0.2');
            leftFace.setAttribute('stroke', leftColor);
            leftFace.setAttribute('stroke-width', lw);
            layerGroup.appendChild(leftFace);

            // Right face
            const rightFace = createSvgElement('path');
            const rightPath = `M ${vertices[1].x} ${vertices[1].y}
                              L ${vertices[2].x} ${vertices[2].y}
                              L ${vertices[6].x} ${vertices[6].y}
                              L ${vertices[5].x} ${vertices[5].y} Z`;
            rightFace.setAttribute('d', rightPath);
            rightFace.setAttribute('fill', rightColor);
            rightFace.setAttribute('fill-opacity', '0.2');
            rightFace.setAttribute('stroke', rightColor);
            rightFace.setAttribute('stroke-width', lw);
            layerGroup.appendChild(rightFace);
        };

        // Helper function to add impossible connections
        const addImpossibleConnections = () => {
            // Create Escher-style impossible connections between distant cubes
            const connectionColor = ctx.getLineColor(0, 1);

            for (let i = 0; i < gridDensity; i++) {
                const angle1 = (i / gridDensity) * Math.PI * 2;
                const angle2 = ((i + gridDensity / 2) % gridDensity / gridDensity) * Math.PI * 2;

                const radius = baseSize * gridDensity * 0.4;

                const x1 = centerX + Math.cos(angle1) * radius;
                const y1 = centerY + Math.sin(angle1) * radius;
                const x2 = centerX + Math.cos(angle2) * radius;
                const y2 = centerY + Math.sin(angle2) * radius;

                // Create curved connection for impossible effect
                const path = createSvgElement('path');
                const controlX = centerX + Math.cos((angle1 + angle2) / 2) * radius * 0.5;
                const controlY = centerY + Math.sin((angle1 + angle2) / 2) * radius * 0.5;

                const pathData = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', connectionColor);
                path.setAttribute('stroke-width', lineWidth * 0.5);
                path.setAttribute('stroke-dasharray', '5,5');
                path.setAttribute('opacity', '0.3');
                layerGroup.appendChild(path);
            }
        };

        // Create isometric cube grid with depth illusion
        for (let row = 0; row < gridDensity; row++) {
            for (let col = 0; col < gridDensity; col++) {
                const index = row * gridDensity + col;

                // Calculate position with perspective
                const xOffset = col - gridDensity / 2;
                const yOffset = row - gridDensity / 2;

                // Create isometric positioning
                const isoX = centerX + (xOffset - yOffset) * baseSize * 0.866; // sqrt(3)/2 for 30° angle
                const isoY = centerY + (xOffset + yOffset) * baseSize * 0.5;

                // Dynamic cube size based on distance and mathematical functions
                const distFromCenter = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
                const maxDist = Math.sqrt(2) * gridDensity / 2;

                // Use frequency for wave-based size modulation
                const waveEffect = Math.sin(distFromCenter * frequency * 0.1 + seed * 10) * 0.3;

                // Use amplitude for depth scaling
                const depthScale = 0.6 + 0.4 * (1 - distFromCenter / maxDist) * (amplitude / 50);
                const sizeScale = (0.7 + waveEffect) * depthScale;

                const cubeSize = baseSize * sizeScale;

                // Determine cube orientation (some flip to create Escher-like effect)
                const shouldFlip = (row + col) % 2 === 0;
                const orientationFactor = seededRandom(seed + index) > 0.5 ? 1 : -1;

                // Calculate rotation angle for variety
                const rotationAngle = (index * frequency * 0.5) % 90;

                // Color index for gradients
                const colorIndex = index;
                const totalCubes = gridDensity * gridDensity;

                drawIsometricCube(
                    isoX,
                    isoY,
                    cubeSize,
                    lineWidth,
                    shouldFlip,
                    orientationFactor,
                    rotationAngle,
                    colorIndex,
                    totalCubes
                );
            }
        }

        // Add connecting lines for impossible object effect (only if complexity is high)
        if (complexity > 30) {
            addImpossibleConnections();
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { width, centerX, centerY } = ctx;
        const gridSize = 5; // 5x5 grid for high complexity (160)
        const baseSize = 8;  // Smaller cubes to fit more

        // Helper function to draw mini isometric cube
        const drawMiniIsometricCube = (cx, cy, cubeSize, lw, shouldFlip) => {
            const angle = Math.PI / 6; // 30 degrees
            const cos30 = Math.cos(angle);
            const sin30 = Math.sin(angle);
            const halfSize = cubeSize / 2;
            const flipMult = shouldFlip ? -1 : 1;

            // Calculate vertices
            const vertices = [
                { x: cx - halfSize * cos30 * flipMult, y: cy + halfSize * sin30 + halfSize },
                { x: cx + halfSize * cos30 * flipMult, y: cy - halfSize * sin30 + halfSize },
                { x: cx + halfSize * cos30 * flipMult, y: cy - halfSize * sin30 - halfSize },
                { x: cx - halfSize * cos30 * flipMult, y: cy + halfSize * sin30 - halfSize },
                { x: cx - halfSize * cos30 * flipMult, y: cy + halfSize * sin30 },
                { x: cx + halfSize * cos30 * flipMult, y: cy - halfSize * sin30 },
                { x: cx + halfSize * cos30 * flipMult, y: cy - halfSize * sin30 - cubeSize },
                { x: cx - halfSize * cos30 * flipMult, y: cy + halfSize * sin30 - cubeSize }
            ];

            // Draw three visible faces
            // Top face
            const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            topFace.setAttribute('d', `M ${vertices[3].x} ${vertices[3].y} L ${vertices[2].x} ${vertices[2].y} L ${vertices[6].x} ${vertices[6].y} L ${vertices[7].x} ${vertices[7].y} Z`);
            topFace.setAttribute('fill', '#888');
            topFace.setAttribute('stroke', '#000');
            topFace.setAttribute('stroke-width', lw * 0.5);
            svg.appendChild(topFace);

            // Left face
            const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            leftFace.setAttribute('d', `M ${vertices[0].x} ${vertices[0].y} L ${vertices[3].x} ${vertices[3].y} L ${vertices[7].x} ${vertices[7].y} L ${vertices[4].x} ${vertices[4].y} Z`);
            leftFace.setAttribute('fill', '#666');
            leftFace.setAttribute('stroke', '#000');
            leftFace.setAttribute('stroke-width', lw * 0.5);
            svg.appendChild(leftFace);

            // Right face
            const rightFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            rightFace.setAttribute('d', `M ${vertices[1].x} ${vertices[1].y} L ${vertices[2].x} ${vertices[2].y} L ${vertices[6].x} ${vertices[6].y} L ${vertices[5].x} ${vertices[5].y} Z`);
            rightFace.setAttribute('fill', '#aaa');
            rightFace.setAttribute('stroke', '#000');
            rightFace.setAttribute('stroke-width', lw * 0.5);
            svg.appendChild(rightFace);
        };

        // Create isometric cube grid with more complex patterns
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const xOffset = col - gridSize / 2;
                const yOffset = row - gridSize / 2;

                // Isometric positioning
                const isoX = centerX + (xOffset - yOffset) * baseSize * 0.866;
                const isoY = centerY + (xOffset + yOffset) * baseSize * 0.5;

                // Vary size for depth - amplitude: -892 affects depth variation
                const distFromCenter = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
                const depthScale = 0.6 + 0.4 * (1 - distFromCenter / 3.5);
                const cubeSize = baseSize * depthScale;

                // frequency: 35 affects flip pattern frequency
                const flipPattern = Math.sin((row * 35 + col * 35) * 0.1) > 0;

                // Draw isometric cube with reduced line width
                const lineWidth = 0.6;
                drawMiniIsometricCube(isoX, isoY, cubeSize, lineWidth * 0.6, flipPattern);
            }
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('cube-illusion', cubeIllusion);

export default cubeIllusion;
