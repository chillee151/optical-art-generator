/**
 * De Jong Attractor Pattern
 * Chaotic patterns based on the De Jong strange attractor.
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const deJongAttractor = {
    name: 'De Jong Attractor',
    description: 'Chaotic patterns based on the De Jong strange attractor.',
    category: 'mathematical',

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
            centerX, centerY, lineWidth, rotation, slowAnimationTime,
            seed
        } = ctx;
        const seededRandom = (s) => ctx.seededRandom(s);

        // Use sliders and slowAnimationTime to influence the attractor's parameters
        const a = -2.0 + (seededRandom(seed + slowAnimationTime * 0.001) * 4.0) * (frequency / 100.0);
        const b = -2.0 + (seededRandom(seed + 0.1 + slowAnimationTime * 0.001) * 4.0) * (amplitude / 1000.0);
        const c = -2.5 + (seededRandom(seed + 0.2 + slowAnimationTime * 0.001) * 5.0);
        const d = -2.5 + (seededRandom(seed + 0.3 + slowAnimationTime * 0.001) * 5.0);

        const iterations = complexity * 100;
        const scale = Math.min(width, height) / 4;

        const path = createSvgElement('path');
        let pathData = "";
        let x = 0, y = 0;

        for (let i = 0; i < iterations; i++) {
            const x_new = Math.sin(a * y) - Math.cos(b * x);
            const y_new = Math.sin(c * x) - Math.cos(d * y);
            x = x_new;
            y = y_new;

            const pointX = centerX + x * scale;
            const pointY = centerY + y * scale;

            if (i === 0) {
                pathData += `M ${pointX} ${pointY}`;
            } else {
                pathData += ` L ${pointX} ${pointY}`;
            }
        }

        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', ctx.getLineColor(0, 1)); // De Jong is usually single color
        path.setAttribute('stroke-width', lineWidth);
        path.style.strokeLinecap = 'round';
        path.style.strokeLinejoin = 'round';

        if (rotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }

        layerGroup.appendChild(path);
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth } = ctx;

        // De Jong attractor thumbnail - complexity: 197, frequency: 28, amplitude: 85
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = `M ${centerX} ${centerY}`;
        let x = 0, y = 0;

        // frequency: 28 affects attractor parameters (2.8 scaled)
        const a = 1.4, b = -2.3, c = 2.8, d = -2.1; // c = 2.8 from frequency

        // amplitude: 85 affects scale
        const scale = 8.5; // amplitude: 85 mapped to 8.5

        // complexity: 197 affects number of iterations
        const iterations = 1970; // complexity: 197 mapped to 1970 points

        for (let i = 0; i < iterations; i++) {
            const x_new = Math.sin(a * y) - Math.cos(b * x);
            const y_new = Math.sin(c * x) - Math.cos(d * y);
            x = x_new;
            y = y_new;
            pathData += ` L ${centerX + x * scale} ${centerY + y * scale}`;
        }

        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', ctx.getLineColor());
        path.setAttribute('stroke-width', lineWidth * 0.3);
        svg.appendChild(path);
    }
};

// Self-register with the pattern registry
patternRegistry.register('de-jong-attractor', deJongAttractor);

export default deJongAttractor;
