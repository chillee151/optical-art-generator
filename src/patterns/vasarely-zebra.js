/**
 * Vasarely Zebra Pattern
 * Iconic stripe deformation where parallel lines warp around invisible spheres
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const vasarelyZebra = {
    name: 'Vasarely Zebra',
    description: 'Iconic Vasarely stripe deformation where parallel lines warp around invisible spheres, creating the illusion of 3D forms beneath a striped surface',
    category: 'op-art',

    // Default slider values for this pattern
    defaults: {
        complexity: 70,
        frequency: 62,
        amplitude: 123
    },

    /**
     * Generate full-size pattern
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context
     */
    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            rotation, centerX, centerY, lineWidth
        } = ctx;

        // Number of stripes based on complexity
        const numStripes = Math.max(20, complexity * 3);
        const stripeSpacing = height / numStripes;

        // Single centered sphere - classic Vasarely Zebra effect
        const spheres = [{
            x: centerX,
            y: centerY,
            radius: (amplitude / 100) * Math.min(width, height) * 0.3
        }];

        // Use frequency to control deformation strength (how much stripes bend)
        const deformationStrength = (frequency / 100) * 0.8; // 0 to 0.8

        // Create horizontal stripes that warp around the spheres
        for (let i = 0; i < numStripes; i++) {
            const isBlack = i % 2 === 0;
            const y = i * stripeSpacing;

            const path = createSvgElement('path');
            let pathData = '';

            const numPoints = 200;
            const step = width / numPoints;

            // Generate stripe with deformation
            for (let x = 0; x <= width; x += step) {
                let totalDisplacement = 0;

                // Calculate displacement from all influence spheres
                for (const sphere of spheres) {
                    const dx = x - sphere.x;
                    const dy = y - sphere.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < sphere.radius) {
                        // Vasarely displacement formula with frequency-controlled strength
                        const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                        totalDisplacement += influence * sphere.radius * deformationStrength;
                    }
                }

                const warpedY = y + totalDisplacement;

                if (pathData === '') {
                    pathData = `M ${x} ${warpedY}`;
                } else {
                    pathData += ` L ${x} ${warpedY}`;
                }
            }

            // Complete the stripe by going back
            pathData += ` L ${width} ${y + stripeSpacing}`;
            for (let x = width; x >= 0; x -= step) {
                let totalDisplacement = 0;

                for (const sphere of spheres) {
                    const dx = x - sphere.x;
                    const dy = (y + stripeSpacing) - sphere.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < sphere.radius) {
                        const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                        totalDisplacement += influence * sphere.radius * deformationStrength;
                    }
                }

                const warpedY = (y + stripeSpacing) + totalDisplacement;
                pathData += ` L ${x} ${warpedY}`;
            }

            pathData += ' Z';

            path.setAttribute('d', pathData);
            // Use color palette system instead of hardcoded black/white
            const color = isBlack ? ctx.getLineColor(0, 2) : ctx.getLineColor(1, 2);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', 'none');

            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { size, complexity } = ctx;
        const numStripes = Math.min(12, complexity * 2);
        const stripeSpacing = size / numStripes;

        // Single centered sphere for preview
        const sphere = {
            x: size / 2,
            y: size / 2,
            radius: size * 0.35
        };

        for (let i = 0; i < numStripes; i++) {
            const isBlack = i % 2 === 0;
            const y = i * stripeSpacing;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            // Top edge of stripe
            for (let x = 0; x <= size; x += 2) {
                const dx = x - sphere.x;
                const dy = y - sphere.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let displacement = 0;
                if (distance < sphere.radius) {
                    const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                    displacement = influence * sphere.radius * 0.5;
                }

                const warpedY = y + displacement;
                if (pathData === '') {
                    pathData = `M ${x} ${warpedY}`;
                } else {
                    pathData += ` L ${x} ${warpedY}`;
                }
            }

            // Bottom edge of stripe (reverse)
            pathData += ` L ${size} ${y + stripeSpacing}`;
            for (let x = size; x >= 0; x -= 2) {
                const dx = x - sphere.x;
                const dy = (y + stripeSpacing) - sphere.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let displacement = 0;
                if (distance < sphere.radius) {
                    const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                    displacement = influence * sphere.radius * 0.5;
                }

                const warpedY = (y + stripeSpacing) + displacement;
                pathData += ` L ${x} ${warpedY}`;
            }

            pathData += ' Z';

            path.setAttribute('d', pathData);
            // Thumbnails use hardcoded black/white for consistency
            path.setAttribute('fill', isBlack ? '#000' : '#fff');
            path.setAttribute('stroke', 'none');

            svg.appendChild(path);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('vasarely-zebra', vasarelyZebra);

export default vasarelyZebra;
