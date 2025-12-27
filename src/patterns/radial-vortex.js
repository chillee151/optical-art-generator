/**
 * Radial Vortex Pattern
 * Mesmerizing 3D tunnel effect with alternating bands radiating from center, creating powerful depth illusion.
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const radialVortex = {
    name: 'Radial Vortex',
    description: 'Mesmerizing 3D tunnel effect with alternating bands radiating from center, creating powerful depth illusion.',
    category: 'geometric',

    // Default slider values for this pattern
    defaults: {
        complexity: 62,
        frequency: 58,
        amplitude: -38
    },

    /**
     * Generate full-size pattern
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context
     */
    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            rotation, centerX, centerY, lineWidth, slowAnimationTime
        } = ctx;

        const isDarkMode = localStorage.getItem('darkMode') === 'true';

        // Use frequency to control number of petals (lobes)
        const numPetals = Math.max(3, Math.floor(frequency / 10));

        // Use complexity for number of bands
        const numBands = Math.max(20, complexity);

        // Use amplitude for the intensity of the petal modulation
        const petalIntensity = amplitude / 100;

        // Maximum radius to cover the canvas
        const maxRadius = Math.sqrt(width * width + height * height) / 2;
        const bandWidth = maxRadius / numBands;

        // Create the vortex pattern using polar coordinates
        for (let band = 0; band < numBands; band++) {
            const path = createSvgElement('path');

            const innerRadius = band * bandWidth;
            const outerRadius = (band + 1) * bandWidth;

            // Higher resolution for smoother curves
            const angleStep = Math.PI / 180; // 1 degree steps
            let pathData = '';

            // Draw inner curve
            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Create petal/flower effect with sinusoidal modulation
                const petalModulation = 1 + Math.sin(angle * numPetals + slowAnimationTime * 0.5) * petalIntensity;

                // Add spiral twist effect based on radius for 3D depth
                const spiralTwist = innerRadius * 0.01;
                const adjustedAngle = angle + spiralTwist;

                const r = innerRadius * petalModulation;
                const x = centerX + r * Math.cos(adjustedAngle);
                const y = centerY + r * Math.sin(adjustedAngle);

                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }

            // Draw outer curve (in reverse to create closed shape)
            for (let angle = Math.PI * 2; angle >= 0; angle -= angleStep) {
                const petalModulation = 1 + Math.sin(angle * numPetals + slowAnimationTime * 0.5) * petalIntensity;
                const spiralTwist = outerRadius * 0.01;
                const adjustedAngle = angle + spiralTwist;

                const r = outerRadius * petalModulation;
                const x = centerX + r * Math.cos(adjustedAngle);
                const y = centerY + r * Math.sin(adjustedAngle);

                pathData += ` L ${x} ${y}`;
            }

            pathData += ' Z';

            path.setAttribute('d', pathData);

            // Alternate colors or use gradient
            const colorIndex = band;
            const color = ctx.getLineColor(colorIndex, numBands);

            if (band % 2 === 0) {
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '1');
            } else {
                // For odd bands, use complementary effect or white/black
                const colorMode = ctx.colorMode;
                if (colorMode === 'black') {
                    // In dark mode: use black for contrast with white lines
                    const alternateFill = isDarkMode ? '#000' : '#fff';
                    path.setAttribute('fill', alternateFill);
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.5');
                }
            }

            path.setAttribute('stroke', 'none');
            layerGroup.appendChild(path);
        }

        // Add center dot for focal point
        const centerDot = createSvgElement('circle');
        centerDot.setAttribute('cx', centerX);
        centerDot.setAttribute('cy', centerY);
        centerDot.setAttribute('r', Math.max(2, lineWidth * 2));
        centerDot.setAttribute('fill', ctx.getLineColor(0, 1));
        layerGroup.appendChild(centerDot);

        if (rotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth, maxRadius } = ctx;

        // Updated to match default settings (complexity: 62, frequency: 58, amplitude: -38)
        const numPetals = 5; // From frequency: 58 → floor(58/10) = 5
        const numBands = 35; // Scaled down from complexity: 62 for thumbnail
        const petalIntensity = -0.38; // From amplitude: -38 → -38/100 = -0.38 (inward petals)

        const bandWidth = maxRadius / numBands;

        // Create the vortex pattern using polar coordinates
        for (let band = 0; band < numBands; band++) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const innerRadius = band * bandWidth;
            const outerRadius = (band + 1) * bandWidth;

            // Create smooth curves for each petal
            for (let angle = 0; angle <= Math.PI * 2; angle += 0.15) {
                // Modulate radius based on angle to create petals with negative amplitude
                const petalModulation = 1 + Math.sin(angle * numPetals) * petalIntensity;
                const r = innerRadius * petalModulation;

                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);

                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }

            // Create outer path (reverse direction for proper fill)
            for (let angle = Math.PI * 2; angle >= 0; angle -= 0.15) {
                const petalModulation = 1 + Math.sin(angle * numPetals) * petalIntensity;
                const r = outerRadius * petalModulation;

                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);

                pathData += ` L ${x} ${y}`;
            }

            pathData += ' Z';

            // Combine paths for filled region
            path.setAttribute('d', pathData);
            path.setAttribute('fill', band % 2 === 0 ? '#000' : '#fff');
            path.setAttribute('stroke', 'none');
            svg.appendChild(path);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('radial-vortex', radialVortex);

export default radialVortex;
