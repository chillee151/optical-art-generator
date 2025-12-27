/**
 * Riley Crest Pattern
 * Vertical lines with phase-shifted horizontal wave displacement
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const rileyCrest = {
    name: 'Riley Crest',
    description: 'Vertical lines with phase-shifted horizontal wave displacement creating mesmerizing traveling wave illusion and lateral shimmer effects, from Bridget Riley\'s Crest series',
    category: 'op-art',

    // Default slider values for this pattern
    defaults: {
        complexity: 50,
        frequency: 50,
        amplitude: 50
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

        // Number of vertical lines
        const numLines = Math.max(30, complexity * 3);
        const spacing = width / numLines;

        // Horizontal wave amplitude
        const maxAmplitude = (amplitude / 100) * width * 0.15;

        // Wavelength and phase shift
        const wavelength = Math.max(50, height / (frequency / 20));
        const phaseShift = (Math.PI * 2) / numLines;

        // Create vertical lines with horizontal wave displacement
        for (let i = 0; i < numLines; i++) {
            const x = i * spacing;
            const phase = i * phaseShift;

            const path = createSvgElement('path');
            let pathData = '';

            const numPoints = 100;
            const step = height / numPoints;

            for (let y = 0; y <= height; y += step) {
                // Horizontal displacement with phase shift
                const dx = maxAmplitude * Math.sin((2 * Math.PI * y / wavelength) + phase);
                const warpedX = x + dx;

                if (pathData === '') {
                    pathData = `M ${warpedX} ${y}`;
                } else {
                    pathData += ` L ${warpedX} ${y}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');

            const color = ctx.getLineColor(i, numLines);
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', lineWidth);

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
        const { lineWidth } = ctx;
        const size = 56;

        // Updated to match default settings (complexity: 50, frequency: 50, amplitude: 50)
        const numLines = 10; // Scaled down from complexity
        const spacing = size / numLines;
        const maxAmplitude = size * 0.08; // Scaled from amplitude: 50 (subtle waves)
        const wavelength = size / 2.5; // Scaled from frequency: 50 (medium frequency)
        const phaseShift = (Math.PI * 2) / numLines;

        for (let i = 0; i < numLines; i++) {
            const x = i * spacing;
            const phase = i * phaseShift;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            for (let y = 0; y <= size; y += 2) {
                const dx = maxAmplitude * Math.sin((2 * Math.PI * y / wavelength) + phase);
                const warpedX = x + dx;

                if (pathData === '') {
                    pathData = `M ${warpedX} ${y}`;
                } else {
                    pathData += ` L ${warpedX} ${y}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.5);

            svg.appendChild(path);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('riley-crest', rileyCrest);

export default rileyCrest;
