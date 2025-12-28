/**
 * Riley Warp - Bridget Riley Op Art Technique
 * Parallel lines warped by Gaussian bulge fields creating 3D surface illusion
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const rileyWarp = {
    name: 'Riley Warp',
    description: 'Quintessential Bridget Riley Op Art - parallel lines warped by Gaussian bulge fields creating the illusion of 3D surface undulation',
    category: 'op-art',

    defaults: {
        complexity: 80,
        frequency: 40,
        amplitude: 200
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, amplitude, frequency,
            rotation, centerX, centerY, lineWidth, slowAnimationTime
        } = ctx;

        // Number of lines based on complexity
        const numLines = Math.max(10, complexity);
        const lineSpacing = height / numLines;

        // Warp parameters
        const warpWidth = width * 0.3; // Width of the bulge
        const warpHeight = amplitude * 2; // Amplitude of the bulge

        // Frequency controls number of bulges
        const numBulges = Math.max(1, Math.floor(frequency / 20));

        const color = ctx.getLineColor(0, 1);

        for (let i = 0; i < numLines; i++) {
            const y = i * lineSpacing;
            const path = createSvgElement('path');
            let pathData = '';

            // Sample points along the line
            const numPoints = 200;
            for (let j = 0; j <= numPoints; j++) {
                const x = (j / numPoints) * width;

                // Calculate warp offset
                let warpY = 0;
                for (let bulge = 0; bulge < numBulges; bulge++) {
                    const bulgeCenter = ((bulge + 0.5) / numBulges) * width;
                    const distFromCenter = Math.abs(x - bulgeCenter);
                    const warpFactor = Math.exp(-Math.pow(distFromCenter / warpWidth, 2));

                    // Sinusoidal modulation based on line position
                    const phase = (i / numLines) * Math.PI;
                    warpY += warpHeight * warpFactor * Math.sin(phase + (slowAnimationTime || 0) * 0.1);
                }

                const finalY = y + warpY;

                if (j === 0) {
                    pathData = `M ${x} ${finalY}`;
                } else {
                    pathData += ` L ${x} ${finalY}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', lineWidth);
            layerGroup.appendChild(path);
        }

        if (rotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }
    },

    generateMini(svg, ctx) {
        const { lineWidth } = ctx;
        const numLines = 20;
        const lineSpacing = 56 / numLines;
        const warpWidth = 56 * 0.3;
        const warpHeight = 8;

        for (let i = 0; i < numLines; i++) {
            const y = i * lineSpacing;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 50;
            for (let j = 0; j <= numPoints; j++) {
                const x = (j / numPoints) * 56;
                const distFromCenter = Math.abs(x - 28);
                const warpFactor = Math.exp(-Math.pow(distFromCenter / warpWidth, 2));
                const phase = (i / numLines) * Math.PI;
                const warpY = warpHeight * warpFactor * Math.sin(phase);
                const finalY = y + warpY;

                if (j === 0) {
                    pathData = `M ${x} ${finalY}`;
                } else {
                    pathData += ` L ${x} ${finalY}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', ctx.getLineColor());
            path.setAttribute('stroke-width', lineWidth * 0.5);
            svg.appendChild(path);
        }
    }
};

patternRegistry.register('riley-warp', rileyWarp);

export default rileyWarp;
