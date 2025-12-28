/**
 * Eye Pattern
 * Psychedelic eye with organic distortion, detailed iris lines, realistic pupil with highlight, and eyelid curves creating hypnotic depth
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const eyePattern = {
    name: 'Eye Pattern',
    description: 'Psychedelic eye with organic distortion, detailed iris lines, realistic pupil with highlight, and eyelid curves creating hypnotic depth',
    category: 'organic',

    // Default slider values for this pattern
    defaults: {
        complexity: 121,
        frequency: 100,
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
            centerX, centerY, lineWidth, seed
        } = ctx;

        console.log(`🔵 EYE PATTERN (Advanced) - Amplitude: ${amplitude}, Frequency: ${frequency}`);

        // Create horizontal lines that curve around eye shape
        const lineSpacing = height / complexity;
        const totalLines = Math.ceil((height + 2 * lineSpacing) / lineSpacing);

        // Amplitude controls overall eye size (0-100 maps to 0.2-0.8x size)
        const eyeScale = 0.2 + (Math.abs(amplitude) / 100) * 0.6;
        const displacementStrength = 3.0; // Fixed strength

        // Frequency controls wave detail (0-100 maps to 0.01-0.2 wave frequency)
        const waveFrequency = 0.01 + (Math.abs(frequency) / 100) * 0.19;

        let lineIndex = 0;
        for (let y = -lineSpacing; y < height + lineSpacing; y += lineSpacing) {
            const path = createSvgElement('path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= width; x += 1) {
                const dx = x - centerX;
                const dy = y - centerY;

                // Create eye-like displacement field - scaled by amplitude
                const eyeWidth = width * 0.4 * eyeScale;
                const eyeHeight = height * 0.2 * eyeScale;

                // Elliptical field
                const normalizedX = dx / eyeWidth;
                const normalizedY = dy / eyeHeight;
                const ellipseDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

                // Eye field strength controlled by amplitude
                const baseFieldStrength = Math.exp(-ellipseDistance * 2) * 40;
                const fieldStrength = baseFieldStrength * displacementStrength;

                // Vertical displacement creating eye curve
                const eyeDisplacement = fieldStrength * Math.sin(normalizedX * Math.PI) * (1 - Math.abs(normalizedY));

                // Add wave variation controlled by frequency
                const waveDisplacement = Math.sin(x * waveFrequency + seed * 3) * fieldStrength * 0.5;

                const finalY = y + eyeDisplacement + waveDisplacement;
                pathData += ` L ${x} ${finalY}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', ctx.getLineColor(lineIndex, totalLines));
            path.setAttribute('stroke-width', lineWidth);
            layerGroup.appendChild(path);
            lineIndex++;
        }

        // Add pupil - FREQUENCY controls pupil size (dilation)
        // 0-100 maps to 5%-35% of canvas size
        const basePupilSize = Math.min(width, height);
        const pupilScale = 0.05 + (Math.abs(frequency) / 100) * 0.3; // 0.05 to 0.35
        const pupilRadius = basePupilSize * pupilScale * eyeScale; // Also scales with overall eye size

        console.log(`⚫ PUPIL SIZE - Frequency: ${frequency}, Pupil Radius: ${pupilRadius.toFixed(1)}px`);

        const pupil = createSvgElement('circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', pupilRadius);
        pupil.setAttribute('fill', '#000');
        layerGroup.appendChild(pupil);
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth } = ctx;
        const width = 56;
        const height = 56;

        // Advanced Eye Pattern style: horizontal wavy lines forming eye shape
        const numLines = 20;
        const eyeWidth = width * 0.4;  // Amplitude controls eye size
        const eyeHeight = height * 0.2;

        for (let i = 0; i < numLines; i++) {
            const y = (i / numLines) * height;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= width; x += 2) {
                const dx = x - centerX;
                const dy = y - centerY;

                // Elliptical eye field
                const normalizedX = dx / eyeWidth;
                const normalizedY = dy / eyeHeight;
                const ellipseDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

                // Eye curve displacement
                const fieldStrength = Math.exp(-ellipseDistance * 2) * 8;
                const eyeDisplacement = fieldStrength * Math.sin(normalizedX * Math.PI) * (1 - Math.abs(normalizedY));

                const finalY = y + eyeDisplacement;
                pathData += ` L ${x} ${finalY}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', ctx.getLineColor());
            path.setAttribute('stroke-width', lineWidth * 0.5);
            svg.appendChild(path);
        }

        // Large pupil (frequency=100 means max dilation at 35%)
        const pupilRadius = 10;  // 35% of 28 (half canvas)
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', pupilRadius);
        pupil.setAttribute('fill', ctx.getLineColor());
        svg.appendChild(pupil);
    }
};

// Self-register with the pattern registry
patternRegistry.register('eye-pattern', eyePattern);

export default eyePattern;
