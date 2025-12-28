/**
 * Concentric Circles Pattern
 * Hypnotic wavy rings with golden ratio spacing
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const concentricCircles = {
    name: 'Concentric Circles',
    description: 'Hypnotic wavy rings with golden ratio spacing, variable thickness, breathing effects, and alternating fills creating powerful depth illusion',
    category: 'geometric',

    // Default slider values for this pattern
    defaults: {
        complexity: 103,
        frequency: 70,
        amplitude: -208
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

        const maxRadius = Math.min(width, height) * 0.48;

        // Use complexity for number of rings
        const numRings = Math.max(10, complexity);

        // Use amplitude for wave modulation intensity
        const waveIntensity = amplitude / 100;

        // Use frequency for wave count (breathing effect)
        const waveCount = Math.max(2, Math.floor(frequency / 20));

        // Golden ratio for natural spacing (optional enhancement)
        const phi = (1 + Math.sqrt(5)) / 2;
        const useGoldenRatio = frequency > 50;

        for (let i = 0; i < numRings; i++) {
            const progress = i / numRings;

            // Calculate radius with optional golden ratio spacing
            let baseRadius;
            if (useGoldenRatio) {
                baseRadius = maxRadius * (Math.pow(progress, 1 / phi));
            } else {
                baseRadius = maxRadius * progress;
            }

            // Create wavy circle using path for more control
            const path = createSvgElement('path');
            let pathData = '';

            const numPoints = 180; // High resolution for smooth curves
            const angleStep = (Math.PI * 2) / numPoints;

            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Add wave modulation for organic breathing effect (increased from 0.2 to 0.4 for stronger effect)
                const waveModulation = 1 + Math.sin(angle * waveCount + progress * Math.PI * 2) * waveIntensity * 0.4;
                const radius = baseRadius * waveModulation;

                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            pathData += ' Z';

            path.setAttribute('d', pathData);

            // Variable thickness based on radius (thinner toward center)
            const thickness = lineWidth * (0.5 + progress * 0.5);

            // Get color for this ring
            const color = ctx.getLineColor(i, numRings);

            // Make it line-based optical art (not solid)
            if (i % 5 === 0 && amplitude > 50) {
                // Only every 5th ring filled, and only if amplitude is high
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.15');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', thickness);
            } else {
                // All other rings: outline only (optical art!)
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', thickness);
            }

            if (rotation !== 0) {
                const ringRotation = rotation + progress * 45; // Progressive rotation
                path.setAttribute('transform', `rotate(${ringRotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
        }

        // Add subtle center dot only if complexity is low
        if (numRings < 30) {
            const centerDot = createSvgElement('circle');
            centerDot.setAttribute('cx', centerX);
            centerDot.setAttribute('cy', centerY);
            centerDot.setAttribute('r', Math.max(2, lineWidth));
            centerDot.setAttribute('fill', ctx.getLineColor(0, 1));
            centerDot.setAttribute('opacity', '0.5');
            layerGroup.appendChild(centerDot);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth, maxRadius } = ctx;
        const numRings = 20;

        for (let i = 0; i < numRings; i++) {
            const progress = i / numRings;
            const baseRadius = maxRadius * progress;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 80;
            const angleStep = (Math.PI * 2) / numPoints;

            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Wave modulation matching defaults: frequency 70, amplitude -208
                const waveFreq = 7;
                const waveAmp = 0.25;
                const waveModulation = 1 + Math.sin(angle * waveFreq) * waveAmp;
                const radius = baseRadius * waveModulation;

                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            pathData += ' Z';

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', ctx.getLineColor());
            path.setAttribute('stroke-width', lineWidth * 0.4);

            svg.appendChild(path);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('concentric-circles', concentricCircles);

export default concentricCircles;
