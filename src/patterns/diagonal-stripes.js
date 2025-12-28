/**
 * Diagonal Stripes Pattern
 * Dynamic Op-Art stripes with wave distortion
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const diagonalStripes = {
    name: 'Diagonal Stripes',
    description: 'Dynamic Op-Art stripes with wave distortion, variable thickness, and alternating fills creating chevron-like patterns with 3D depth',
    category: 'geometric',

    defaults: {
        complexity: 24,
        frequency: 21,
        amplitude: 20
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            rotation, centerX, centerY, lineWidth, colorMode
        } = ctx;

        const maxDimension = Math.sqrt(width * width + height * height);

        // Use complexity for number of stripes
        const numStripes = Math.max(10, complexity);
        const spacing = maxDimension / numStripes;

        // Use amplitude for wave distortion intensity
        const waveIntensity = amplitude / 50;

        // Use frequency for wave frequency along stripes
        const waveFrequency = frequency / 10;

        // Create Op-Art chevron effect with alternating fills
        for (let i = 0; i < numStripes; i++) {
            const progress = i / numStripes;
            const basePosition = -maxDimension * 0.5 + i * spacing;

            // Create wavy stripe using path
            const path = createSvgElement('path');
            let pathData = '';

            // Generate points along the stripe with wave distortion
            const numPoints = 100;
            const length = maxDimension * 1.5;
            const step = length / numPoints;

            // Variable thickness for depth with sinusoidal amplitude modulation
            const baseThickness = lineWidth * (0.5 + progress * 1.5);
            const amplitudeModulation = 1 + Math.sin(progress * Math.PI * 4) * (amplitude / 200);
            const thickness = baseThickness * amplitudeModulation;

            // Draw top edge of stripe
            for (let t = 0; t <= length; t += step) {
                const x = basePosition + t * Math.cos(Math.PI / 4);
                const y = t * Math.sin(Math.PI / 4);

                // Add wave distortion perpendicular to stripe direction
                const waveOffset = Math.sin(t * 0.01 * waveFrequency + progress * Math.PI * 2) * waveIntensity;
                const offsetX = waveOffset * Math.cos(Math.PI / 4 + Math.PI / 2);
                const offsetY = waveOffset * Math.sin(Math.PI / 4 + Math.PI / 2);

                const finalX = x + offsetX;
                const finalY = y + offsetY;

                if (pathData === '') {
                    pathData = `M ${finalX} ${finalY}`;
                } else {
                    pathData += ` L ${finalX} ${finalY}`;
                }
            }

            // Draw bottom edge of stripe (in reverse to create filled shape)
            for (let t = length; t >= 0; t -= step) {
                const x = basePosition + t * Math.cos(Math.PI / 4);
                const y = t * Math.sin(Math.PI / 4);

                const waveOffset = Math.sin(t * 0.01 * waveFrequency + progress * Math.PI * 2) * waveIntensity;
                const offsetX = waveOffset * Math.cos(Math.PI / 4 + Math.PI / 2);
                const offsetY = waveOffset * Math.sin(Math.PI / 4 + Math.PI / 2);

                // Offset for stripe width
                const widthOffsetX = thickness * Math.cos(Math.PI / 4 + Math.PI / 2);
                const widthOffsetY = thickness * Math.sin(Math.PI / 4 + Math.PI / 2);

                const finalX = x + offsetX + widthOffsetX;
                const finalY = y + offsetY + widthOffsetY;

                pathData += ` L ${finalX} ${finalY}`;
            }

            pathData += ' Z';
            path.setAttribute('d', pathData);

            // Op-Art alternating pattern
            const color = ctx.getLineColor(i, numStripes);

            if (i % 4 === 0) {
                // Filled stripes
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '1');
                path.setAttribute('stroke', 'none');
            } else if (i % 4 === 1) {
                // Outlined stripes
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth);
            } else if (i % 4 === 2) {
                // White/light stripes for contrast
                if (colorMode === 'black') {
                    path.setAttribute('fill', '#fff');
                    path.setAttribute('fill-opacity', '1');
                    path.setAttribute('stroke', 'none');
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.3');
                    path.setAttribute('stroke', 'none');
                }
            } else {
                // Gradient-like effect with semi-transparent
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.6');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth * 0.3);
            }

            // Apply rotation
            const angle = 45 + rotation;
            path.setAttribute('transform', `rotate(${angle} ${centerX} ${centerY})`);

            layerGroup.appendChild(path);
        }
    },

    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth } = ctx;
        const symmetryCount = 4;
        const numStripes = 3;

        // Create 4-fold radial symmetry
        for (let sym = 0; sym < symmetryCount; sym++) {
            const symAngle = (360 / symmetryCount) * sym;

            for (let i = 0; i < numStripes; i++) {
                const progress = i / numStripes;
                const distance = 3 + i * 6;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                let pathData = '';

                // Create wavy stripe
                const numPoints = 20;
                for (let j = 0; j <= numPoints; j++) {
                    const t = (j / numPoints) * 50;
                    const waveFreq = 0.21;
                    const waveAmp = 0.2;
                    const waveOffset = Math.sin(t * waveFreq + progress * Math.PI * 2) * waveAmp;

                    const x = centerX + (distance + t) * Math.cos(symAngle * Math.PI / 180) + waveOffset * Math.sin(symAngle * Math.PI / 180);
                    const y = centerY + (distance + t) * Math.sin(symAngle * Math.PI / 180) - waveOffset * Math.cos(symAngle * Math.PI / 180);

                    if (pathData === '') {
                        pathData = `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }
                }

                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', ctx.getLineColor());
                path.setAttribute('stroke-width', lineWidth * 0.6);
                svg.appendChild(path);
            }
        }
    }
};

patternRegistry.register('diagonal-stripes', diagonalStripes);

export default diagonalStripes;
