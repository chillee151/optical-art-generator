/**
 * Perlin Displacement Pattern
 * Organic patterns from a Perlin noise field with horizontal lines displaced by noise values
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const perlinDisplacement = {
    name: 'Perlin Displacement',
    description: 'Organic patterns from a Perlin noise field',
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
            rotation, centerX, centerY, lineWidth, seed, slowAnimationTime,
            perlin
        } = ctx;

        const lineSpacing = height / complexity;
        const totalLines = Math.ceil(height / lineSpacing);
        const noiseScale = frequency / 1000;

        let lineIndex = 0;
        for (let y = 0; y < height + lineSpacing; y += lineSpacing) {
            const path = createSvgElement('path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= width; x += 5) {
                const noiseVal = perlin.noise(x * noiseScale, y * noiseScale, seed * 5 + slowAnimationTime * 0.1);
                const displacement = noiseVal * amplitude;
                pathData += ` L ${x} ${y + displacement}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', ctx.getLineColor(lineIndex, totalLines));
            path.setAttribute('stroke-width', lineWidth);

            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
            lineIndex++;
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { seed, lineWidth, perlin } = ctx;
        const size = 56;

        const numLines = 25; // complexity: 201 (high density)
        const spacing = size / numLines;

        for (let y = 0; y < size + spacing; y += spacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= size; x += 1.5) {
                // frequency: 83 affects noise scale
                const noiseScale = 0.083; // frequency: 83 mapped to 0.083
                const noiseVal = perlin.noise(x * noiseScale, y * noiseScale, seed * 10);

                // amplitude: 15 affects displacement strength
                const displacement = noiseVal * 1.5; // amplitude: 15 mapped to 1.5
                pathData += ` L ${x} ${y + displacement}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', ctx.getLineColor());
            path.setAttribute('stroke-width', lineWidth * 0.5);
            svg.appendChild(path);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('perlin-displacement', perlinDisplacement);

export default perlinDisplacement;
