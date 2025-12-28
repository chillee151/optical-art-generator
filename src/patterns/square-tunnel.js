/**
 * Square Tunnel Pattern
 * 3D vortex tunnel with exponential perspective, spiral twist, alternating fills, and depth-based transformations
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const squareTunnel = {
    name: 'Square Tunnel',
    description: '3D vortex tunnel with exponential perspective, spiral twist, alternating fills, and depth-based transformations',
    category: 'geometric',

    defaults: {
        complexity: 114,
        frequency: 40,
        amplitude: 446,
        rotation: -73,
        symmetry: 8
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            centerX, centerY, lineWidth, colorMode, isDarkMode
        } = ctx;

        // Use complexity for number of squares (rings)
        const numSquares = Math.max(20, complexity);
        const maxDimension = Math.max(width, height);

        // Use amplitude for perspective distortion intensity
        const perspectiveStrength = amplitude / 100;

        // Use frequency for rotation twist
        const twistFactor = frequency / 50;

        for (let i = 0; i < numSquares; i++) {
            // Non-linear scaling for better perspective (exponential)
            const progress = i / numSquares;
            const scale = Math.pow(1 - progress, 1.5); // Exponential decay for depth

            // Calculate size with perspective
            const baseSize = maxDimension * scale * 0.9;

            // Add spiral twist - rotation increases toward center
            const rotation = progress * twistFactor * 360;

            // Add wave modulation to size for organic feel
            const waveModulation = 1 + Math.sin(progress * Math.PI * 4) * perspectiveStrength * 0.1;
            const squareSize = baseSize * waveModulation;

            // Calculate depth-based offset for 3D effect
            const depthOffset = (1 - scale) * perspectiveStrength * 5;

            // Create path for more control over shape
            const path = createSvgElement('path');

            // Calculate corners with slight perspective distortion
            const half = squareSize / 2;
            const perspectiveDistortion = 1 + (1 - scale) * perspectiveStrength * 0.1;

            const corners = [
                [-half * perspectiveDistortion, -half * perspectiveDistortion],
                [half * perspectiveDistortion, -half * perspectiveDistortion],
                [half * perspectiveDistortion, half * perspectiveDistortion],
                [-half * perspectiveDistortion, half * perspectiveDistortion]
            ];

            // Build path
            let pathData = `M ${corners[0][0]} ${corners[0][1]}`;
            for (let j = 1; j < corners.length; j++) {
                pathData += ` L ${corners[j][0]} ${corners[j][1]}`;
            }
            pathData += ' Z';

            path.setAttribute('d', pathData);

            // Alternating fills for 3D tunnel effect (like Radial Vortex)
            const colorIndex = i;
            const color = ctx.getLineColor(colorIndex, numSquares);

            if (i % 2 === 0) {
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '1');
                path.setAttribute('stroke', 'none');
            } else {
                if (colorMode === 'black') {
                    // In dark mode, color is already white, so alternate with black
                    const alternateFill = isDarkMode ? '#000' : '#fff';
                    path.setAttribute('fill', alternateFill);
                    path.setAttribute('fill-opacity', '1');
                    path.setAttribute('stroke', 'none');
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.5');
                    path.setAttribute('stroke', color);
                    path.setAttribute('stroke-width', lineWidth * 0.5);
                }
            }

            // Apply rotation and center transformation
            const transform = `translate(${centerX + depthOffset}, ${centerY + depthOffset}) rotate(${rotation})`;
            path.setAttribute('transform', transform);

            layerGroup.appendChild(path);
        }
    },

    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth } = ctx;
        const numSquares = 15;  // complexity: 114
        const symmetryCount = 8; // symmetry: 8

        // Create 8-fold radial symmetry
        for (let sym = 0; sym < symmetryCount; sym++) {
            const symAngle = (360 / symmetryCount) * sym - 73; // rotation: -73

            for (let i = 0; i < numSquares; i++) {
                const progress = i / numSquares;
                const scale = Math.pow(1 - progress, 1.5);
                const squareSize = 44 * scale;
                const rotation = progress * 40 + symAngle; // frequency: 40 affects twist

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const half = squareSize / 2;

                const pathData = `M ${-half} ${-half} L ${half} ${-half} L ${half} ${half} L ${-half} ${half} Z`;
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', ctx.getLineColor());
                path.setAttribute('stroke-width', lineWidth * 0.2);

                const transform = `translate(${centerX}, ${centerY}) rotate(${rotation})`;
                path.setAttribute('transform', transform);

                svg.appendChild(path);
            }
        }
    }
};

patternRegistry.register('square-tunnel', squareTunnel);

export default squareTunnel;
