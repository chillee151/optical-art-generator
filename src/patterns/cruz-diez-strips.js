/**
 * Cruz-Diez Chromatic Strips Pattern
 * Vertical chromatic strips in carefully arranged color triads creating kinetic color mixing
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const cruzDiezStrips = {
    name: 'Cruz-Diez Strips',
    description: 'Vertical chromatic strips in carefully arranged color triads creating kinetic color mixing and additive interference effects, inspired by Carlos Cruz-Diez\'s Physichromie',
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

        // Complexity controls strip width (higher complexity = thinner strips)
        const stripWidth = Math.max(0.5, 10 / Math.max(1, complexity / 10));
        const numStrips = Math.floor(width / stripWidth);

        // Frequency controls pattern repeat (how often the color sequence repeats)
        const patternRepeat = Math.max(1, Math.floor(frequency / 10));

        // Amplitude controls strip width variation (0-100 = uniform, >100 = varied widths)
        const widthVariation = Math.max(0, (amplitude - 100) / 100);

        // Create vertical strips in A-B-C pattern using palette colors
        for (let i = 0; i < numStrips; i++) {
            // Apply width variation if amplitude > 100
            const thisStripWidth = stripWidth * (1 + (Math.sin(i * 0.5) * widthVariation));
            const x = i * stripWidth;

            // Determine color based on position in pattern - use 3-color cycling
            const posInPattern = i % (patternRepeat * 3);
            let colorIndex;

            if (posInPattern < patternRepeat) {
                colorIndex = 0; // Color A
            } else if (posInPattern < patternRepeat * 2) {
                colorIndex = 1; // Color B (middle)
            } else {
                colorIndex = 2; // Color C
            }

            const color = ctx.getLineColor(colorIndex, 3);

            const rect = createSvgElement('rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', thisStripWidth);
            rect.setAttribute('height', height);
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', 'none');

            if (rotation !== 0) {
                rect.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(rect);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { size } = ctx;

        // Updated to match default settings (complexity: 197, frequency: 61, amplitude: 77)
        const stripWidth = 0.5; // Very thin strips from high complexity (197)
        const numStrips = Math.floor(size / stripWidth);
        const patternRepeat = 6; // From frequency: 61 → floor(61/10)

        // Red + Blue + White for preview
        const colors = ['#FF0000', '#FFFFFF', '#0000FF'];

        for (let i = 0; i < numStrips; i++) {
            const x = i * stripWidth;

            // 3-color cycling pattern
            const posInPattern = i % (patternRepeat * 3);
            let colorIndex;

            if (posInPattern < patternRepeat) {
                colorIndex = 0; // Red
            } else if (posInPattern < patternRepeat * 2) {
                colorIndex = 1; // White
            } else {
                colorIndex = 2; // Blue
            }

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', stripWidth);
            rect.setAttribute('height', size);
            rect.setAttribute('fill', colors[colorIndex]);
            rect.setAttribute('stroke', 'none');

            svg.appendChild(rect);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('cruz-diez-strips', cruzDiezStrips);

export default cruzDiezStrips;
