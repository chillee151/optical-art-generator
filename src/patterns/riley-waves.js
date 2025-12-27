/**
 * Riley Waves Pattern
 * Sinusoidal wave patterns with precisely controlled rhythm variation
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const rileyWaves = {
    name: 'Riley Waves',
    description: 'Sinusoidal wave patterns with precisely controlled rhythm variation creating vibration and shimmer effects, inspired by Bridget Riley\'s Op Art masterpieces',
    category: 'op-art',

    // Default slider values for this pattern
    defaults: {
        complexity: 62,
        frequency: 57,
        amplitude: 62,
        rotation: -90
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

        // Use complexity for number of wave lines
        const numLines = Math.max(20, complexity * 2);
        const spacing = height / numLines;

        // Use amplitude for maximum wave amplitude
        const maxAmplitude = (amplitude / 100) * width * 0.2;

        // Use frequency for wave frequency along each line
        const waveFrequency = Math.max(2, frequency / 20);

        // Create wavy lines with Riley-style rhythm variation
        for (let i = 0; i < numLines; i++) {
            const progress = i / numLines;
            const y = i * spacing;

            // CRITICAL: Sinusoidal amplitude variation (Riley's signature!)
            // Lines at edges are straighter, center lines have maximum wave
            const amplitudeModulation = Math.sin(progress * Math.PI);
            const lineAmplitude = maxAmplitude * amplitudeModulation;

            // Frequency variation creates rhythm
            const frequencyModulation = 1 + 0.3 * Math.sin(progress * Math.PI * 2);
            const lineFrequency = waveFrequency * frequencyModulation;

            // Phase shift creates flowing pattern
            const phase = progress * Math.PI * 2;

            // Generate smooth wave path
            const path = createSvgElement('path');
            let pathData = '';

            const numPoints = 200; // High resolution for smooth curves
            const step = width / numPoints;

            for (let x = 0; x <= width; x += step) {
                const xProgress = x / width;

                // Sinusoidal wave with modulated amplitude
                const waveY = y + lineAmplitude * Math.sin(xProgress * Math.PI * 2 * lineFrequency + phase);

                if (pathData === '') {
                    pathData = `M ${x} ${waveY}`;
                } else {
                    pathData += ` L ${x} ${waveY}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');

            // Get color
            const color = ctx.getLineColor(i, numLines);
            path.setAttribute('stroke', color);

            // Variable line weight for depth
            const thickness = lineWidth * (0.8 + progress * 0.4);
            path.setAttribute('stroke-width', thickness);

            // Apply rotation if set
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
        const { centerX, centerY, lineWidth } = ctx;
        const size = 56;

        // Updated to match default settings (complexity: 62, frequency: 57, amplitude: 62)
        const numLines = 12; // Scaled down from 62 for thumbnail
        const spacing = size / numLines;
        const maxAmplitude = size * 0.22; // Scaled from amplitude: 62 (about 62% of range)
        const frequency = 2.8; // Scaled from frequency: 57 (about 57% of range)

        // Rotate -90° for vertical waves (default rotation)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `rotate(-90 ${size/2} ${size/2})`);

        for (let i = 0; i < numLines; i++) {
            const progress = i / numLines;
            const y = i * spacing;

            // Riley amplitude modulation
            const amplitudeModulation = Math.sin(progress * Math.PI);
            const lineAmplitude = maxAmplitude * amplitudeModulation;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            for (let x = 0; x <= size; x += 2) {
                const xProgress = x / size;
                const waveY = y + lineAmplitude * Math.sin(xProgress * Math.PI * 2 * frequency);

                if (pathData === '') {
                    pathData = `M ${x} ${waveY}`;
                } else {
                    pathData += ` L ${x} ${waveY}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.5);

            g.appendChild(path);
        }

        svg.appendChild(g);
    }
};

// Self-register with the pattern registry
patternRegistry.register('riley-waves', rileyWaves);

export default rileyWaves;
