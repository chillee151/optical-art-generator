/**
 * Scintillating Grid - Classic Optical Illusion
 * Demonstrates lateral inhibition in the visual system
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const scintillatingGrid = {
    name: 'Scintillating Grid',
    description: 'Classic optical illusion demonstrating lateral inhibition - gray dots appear and disappear at intersections',
    category: 'illusion',

    defaults: {
        complexity: 50,
        frequency: 50,
        amplitude: 75
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, amplitude,
            rotation, centerX, centerY, isDarkMode
        } = ctx;

        // Grid spacing based on complexity (more complexity = denser grid)
        const gridSpacing = Math.max(15, Math.min(width, height) / Math.max(10, complexity / 5));

        // Line width is critical for the illusion - should be about 15% of grid spacing
        const actualLineWidth = gridSpacing * 0.15;

        // Use amplitude to control dot size
        const dotRadius = amplitude > 50 ? actualLineWidth * 0.4 : actualLineWidth * 0.3;

        const color = ctx.getLineColor(0, 1);
        const lineColor = isDarkMode ? '#ffffff' : color;
        const dotColor = isDarkMode ? '#000000' : (amplitude > 75 ? color : '#000000');

        // Draw horizontal lines
        for (let y = 0; y < height; y += gridSpacing) {
            const line = createSvgElement('line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', actualLineWidth);
            layerGroup.appendChild(line);
        }

        // Draw vertical lines
        for (let x = 0; x < width; x += gridSpacing) {
            const line = createSvgElement('line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', actualLineWidth);
            layerGroup.appendChild(line);
        }

        // Draw dots at intersections (critical for scintillating effect)
        for (let y = 0; y < height; y += gridSpacing) {
            for (let x = 0; x < width; x += gridSpacing) {
                const dot = createSvgElement('circle');
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
                dot.setAttribute('r', dotRadius);
                dot.setAttribute('fill', dotColor);
                layerGroup.appendChild(dot);
            }
        }

        if (rotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }
    },

    generateMini(svg, ctx) {
        const gridSpacing = 8;
        const actualLineWidth = gridSpacing * 0.15;
        const dotRadius = actualLineWidth * 0.4;

        // Draw horizontal lines
        for (let y = 0; y <= 56; y += gridSpacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', 56);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#fff');
            line.setAttribute('stroke-width', actualLineWidth);
            svg.appendChild(line);
        }

        // Draw vertical lines
        for (let x = 0; x <= 56; x += gridSpacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', 56);
            line.setAttribute('stroke', '#fff');
            line.setAttribute('stroke-width', actualLineWidth);
            svg.appendChild(line);
        }

        // Draw dots at intersections
        const dotColor = ctx.getLineColor();
        for (let y = 0; y <= 56; y += gridSpacing) {
            for (let x = 0; x <= 56; x += gridSpacing) {
                const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
                dot.setAttribute('r', dotRadius);
                dot.setAttribute('fill', dotColor);
                svg.appendChild(dot);
            }
        }
    }
};

patternRegistry.register('scintillating-grid', scintillatingGrid);

export default scintillatingGrid;
