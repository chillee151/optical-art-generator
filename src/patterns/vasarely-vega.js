/**
 * Vasarely Vega Pattern
 * Checkerboard pattern with wave-based size modulation creating billowing, undulating surface
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const vasarelyVega = {
    name: 'Vasarely Vega',
    description: 'Checkerboard pattern with wave-based size modulation creating billowing, undulating surface illusion through anamorphic distortion, from Vasarely\'s Vega series',
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
            rotation, centerX, centerY
        } = ctx;

        // Grid dimensions based on complexity
        const gridSize = Math.max(8, Math.floor(complexity / 15));
        const baseSquareSize = Math.min(width, height) / gridSize;

        // Wave parameters for size modulation
        const waveAmplitude = (amplitude / 100) * 0.8; // Scale factor: 0-0.8
        const freqX = Math.max(1, frequency / 30);
        const freqY = Math.max(1, frequency / 30);

        // Create checkerboard with size-modulated squares
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const isBlack = (row + col) % 2 === 0;

                // Calculate center of this grid cell
                const cellCenterX = col * baseSquareSize + baseSquareSize / 2;
                const cellCenterY = row * baseSquareSize + baseSquareSize / 2;

                // Calculate wave-based size modulation
                const normalizedX = col / gridSize;
                const normalizedY = row / gridSize;

                // Combine sine waves to create bulging/caving effect
                const wave = Math.sin(normalizedX * Math.PI * 2 * freqX) *
                           Math.sin(normalizedY * Math.PI * 2 * freqY);

                // Map wave to size multiplier (1.0 - waveAmplitude to 1.0 + waveAmplitude)
                const sizeMultiplier = 1.0 + (wave * waveAmplitude);
                const squareSize = baseSquareSize * sizeMultiplier;

                // Create square centered in cell
                const rect = createSvgElement('rect');
                rect.setAttribute('x', cellCenterX - squareSize / 2);
                rect.setAttribute('y', cellCenterY - squareSize / 2);
                rect.setAttribute('width', squareSize);
                rect.setAttribute('height', squareSize);
                // Use color palette system instead of hardcoded black/white
                const color = isBlack ? ctx.getLineColor(0, 2) : ctx.getLineColor(1, 2);
                rect.setAttribute('fill', color);
                rect.setAttribute('stroke', 'none');

                if (rotation !== 0) {
                    rect.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
                }

                layerGroup.appendChild(rect);
            }
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { size } = ctx;

        // Updated to match default settings (complexity: 232, frequency: 65, amplitude: 85)
        const gridSize = 14; // Scaled down from 15 (232/15) for thumbnail
        const baseSquareSize = size / gridSize;
        const waveAmplitude = 0.68; // From amplitude: 85 → (85/100) * 0.8
        const freq = 2.17; // From frequency: 65 → 65/30

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const isBlack = (row + col) % 2 === 0;

                const cellCenterX = col * baseSquareSize + baseSquareSize / 2;
                const cellCenterY = row * baseSquareSize + baseSquareSize / 2;

                const normalizedX = col / gridSize;
                const normalizedY = row / gridSize;

                const wave = Math.sin(normalizedX * Math.PI * 2 * freq) *
                           Math.sin(normalizedY * Math.PI * 2 * freq);

                const sizeMultiplier = 1.0 + (wave * waveAmplitude);
                const squareSize = baseSquareSize * sizeMultiplier;

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', cellCenterX - squareSize / 2);
                rect.setAttribute('y', cellCenterY - squareSize / 2);
                rect.setAttribute('width', squareSize);
                rect.setAttribute('height', squareSize);
                // Thumbnails use hardcoded black/white for consistency
                rect.setAttribute('fill', isBlack ? '#000' : '#fff');
                rect.setAttribute('stroke', 'none');

                svg.appendChild(rect);
            }
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('vasarely-vega', vasarelyVega);

export default vasarelyVega;
