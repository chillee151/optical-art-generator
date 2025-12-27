/**
 * Anuszkiewicz Squares Pattern
 * Concentric squares in complementary colors creating intense chromatic vibration
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const anuszkiewiczSquares = {
    name: 'Anuszkiewicz Squares',
    description: 'Concentric squares in complementary colors creating intense chromatic vibration and afterimages through simultaneous contrast, inspired by Richard Anuszkiewicz',
    category: 'op-art',

    // Default slider values for this pattern
    defaults: {
        complexity: 284,
        frequency: 26,
        amplitude: 23
    },

    /**
     * Generate full-size pattern
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context
     */
    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            rotation, centerX, centerY, lineWidth, colorMode
        } = ctx;

        // Number of concentric squares
        const numSquares = Math.max(10, complexity * 2);
        const maxSize = Math.max(width, height) * 1.4;

        // Amplitude controls size variation/spacing (0-100 maps to 0.5-2.0x spacing)
        const sizeVariation = 0.5 + (amplitude / 100) * 1.5;
        const sizeStep = (maxSize / numSquares) * sizeVariation;

        // Frequency controls color cycling speed (higher = faster color changes)
        const colorCycleSpeed = Math.max(1, frequency / 10);

        // Create concentric squares with colors from palette
        for (let i = 0; i < numSquares; i++) {
            const size = maxSize - (i * sizeStep);

            // For black/single color modes, use alternating complementary colors
            // Otherwise use full gradient across all squares with frequency-based cycling
            let color;
            if (colorMode === 'black' || colorMode === 'single') {
                // Fallback to complementary colors for contrast
                const complementaryPairs = [
                    ['#FF0000', '#00FFFF'], // Red / Cyan
                    ['#0000FF', '#FFB000'], // Blue / Orange
                ];
                const pairIndex = Math.floor((amplitude / 100) * (complementaryPairs.length - 1));
                const colors = complementaryPairs[pairIndex];
                color = colors[Math.floor(i * colorCycleSpeed) % 2];
            } else {
                // Use full palette with frequency-controlled cycling
                const colorIndex = Math.floor(i * colorCycleSpeed) % numSquares;
                color = ctx.getLineColor(colorIndex, numSquares);
            }

            // Rotation per square for enhanced effect
            const squareRotation = rotation + (i * 0.5);

            const rect = createSvgElement('rect');
            rect.setAttribute('x', centerX - size / 2);
            rect.setAttribute('y', centerY - size / 2);
            rect.setAttribute('width', size);
            rect.setAttribute('height', size);
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', 'none');

            if (squareRotation !== 0) {
                rect.setAttribute('transform', `rotate(${squareRotation} ${centerX} ${centerY})`);
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
        const { centerX, centerY, size } = ctx;

        // Updated to match default settings (complexity: 284, frequency: 26, amplitude: 23)
        const numSquares = 22; // Scaled down from complexity: 284
        const sizeVariation = 0.845; // From amplitude: 23 (0.5 + 23/100 * 1.5)
        const sizeStep = (size / numSquares) * sizeVariation;
        const colorCycleSpeed = 2.6; // From frequency: 26 (26/10)

        // Red/Cyan for preview
        const colors = ['#FF0000', '#00FFFF'];

        for (let i = 0; i < numSquares; i++) {
            const squareSize = size - (i * sizeStep);

            // Apply frequency-based color cycling
            const colorIndex = Math.floor(i * colorCycleSpeed) % 2;
            const color = colors[colorIndex];

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', centerX - squareSize / 2);
            rect.setAttribute('y', centerY - squareSize / 2);
            rect.setAttribute('width', squareSize);
            rect.setAttribute('height', squareSize);
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', 'none');

            svg.appendChild(rect);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('anuszkiewicz-squares', anuszkiewiczSquares);

export default anuszkiewiczSquares;
