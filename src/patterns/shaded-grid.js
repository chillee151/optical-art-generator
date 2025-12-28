/**
 * Shaded Grid Pattern
 * Creates a 3D-like grid pattern using mathematical shading to simulate depth and curvature.
 * Based on Vasarely's warped grid technique with perspective distortion.
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const shadedGrid = {
    name: 'Shaded Grid',
    description: 'Creates a 3D-like grid pattern using mathematical shading to simulate depth and curvature.',
    category: 'geometric',

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

        // Grid setup
        const cellsAcross = Math.max(8, Math.floor(complexity / 3));
        const cellSize = width / cellsAcross;
        const numCells = Math.ceil(height / cellSize);

        // Distortion centers (frequency controls count)
        const numCenters = Math.max(1, Math.floor(frequency / 25));
        const centers = [];

        if (numCenters === 1) {
            centers.push({
                x: centerX,
                y: centerY,
                strength: amplitude / 100,
                radius: Math.min(width, height) * 0.4
            });
        } else {
            // Multiple centers arranged in circle
            for (let i = 0; i < numCenters; i++) {
                const angle = (i / numCenters) * Math.PI * 2;
                const offsetRadius = Math.min(width, height) * 0.25;
                centers.push({
                    x: centerX + Math.cos(angle) * offsetRadius,
                    y: centerY + Math.sin(angle) * offsetRadius,
                    strength: amplitude / 100,
                    radius: Math.min(width, height) * 0.3
                });
            }
        }

        // Draw distorted grid
        for (let row = 0; row < numCells; row++) {
            for (let col = 0; col < cellsAcross; col++) {
                // Original grid position
                const gridX = col * cellSize;
                const gridY = row * cellSize;

                // Calculate 4 corner positions with distortion
                const corners = [
                    {ox: gridX, oy: gridY},                      // Top-left
                    {ox: gridX + cellSize, oy: gridY},           // Top-right
                    {ox: gridX + cellSize, oy: gridY + cellSize}, // Bottom-right
                    {ox: gridX, oy: gridY + cellSize}            // Bottom-left
                ];

                // Apply distortion to each corner
                corners.forEach(corner => {
                    let totalDX = 0, totalDY = 0;

                    centers.forEach(center => {
                        const dx = corner.ox - center.x;
                        const dy = corner.oy - center.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);

                        // Gaussian influence
                        const influence = Math.exp(-(distance*distance) /
                                                  (2 * center.radius * center.radius));

                        // Radial displacement (creates bulge/indent)
                        const displacementMag = influence * center.strength * cellSize * 2;

                        if (distance > 0) {
                            totalDX += (dx / distance) * displacementMag;
                            totalDY += (dy / distance) * displacementMag;
                        }
                    });

                    corner.x = corner.ox + totalDX;
                    corner.y = corner.oy + totalDY;
                });

                // Create distorted quad as SVG path
                const path = createSvgElement('path');
                const pathData = `M ${corners[0].x} ${corners[0].y} ` +
                               `L ${corners[1].x} ${corners[1].y} ` +
                               `L ${corners[2].x} ${corners[2].y} ` +
                               `L ${corners[3].x} ${corners[3].y} Z`;

                path.setAttribute('d', pathData);

                // Checkerboard coloring with palette support
                const isBlack = (row + col) % 2 === 0;
                const color = ctx.getLineColor(row * cellsAcross + col, cellsAcross * numCells);

                path.setAttribute('fill', isBlack ? color : 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth * 0.5);

                layerGroup.appendChild(path);
            }
        }

        if (rotation !== 0) {
            layerGroup.setAttribute('transform',
                `rotate(${rotation} ${centerX} ${centerY})`);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { width, height, centerX, centerY, lineWidth } = ctx;

        // Vasarely Warped Grid thumbnail
        const cellsAcross = 10; // complexity: 101 (higher density)
        const cellSize = width / cellsAcross;

        // Two distortion centers - frequency: 69 (69/25 = 2 centers)
        const numCenters = 2;
        const centers = [];
        for (let i = 0; i < numCenters; i++) {
            const angle = (i / numCenters) * Math.PI * 2;
            const offsetRadius = width * 0.25;
            centers.push({
                x: centerX + Math.cos(angle) * offsetRadius,
                y: centerY + Math.sin(angle) * offsetRadius,
                strength: -0.85, // amplitude: -85 (moderate concave)
                radius: width * 0.3
            });
        }

        // Draw distorted grid
        for (let row = 0; row < cellsAcross; row++) {
            for (let col = 0; col < cellsAcross; col++) {
                const gridX = col * cellSize;
                const gridY = row * cellSize;

                // Calculate 4 corner positions with distortion
                const corners = [
                    {ox: gridX, oy: gridY},
                    {ox: gridX + cellSize, oy: gridY},
                    {ox: gridX + cellSize, oy: gridY + cellSize},
                    {ox: gridX, oy: gridY + cellSize}
                ];

                // Apply distortion to each corner
                corners.forEach(corner => {
                    let totalDX = 0, totalDY = 0;

                    centers.forEach(center => {
                        const dx = corner.ox - center.x;
                        const dy = corner.oy - center.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);

                        const influence = Math.exp(-(distance*distance) / (2 * center.radius * center.radius));
                        const displacementMag = influence * center.strength * cellSize * 0.3;

                        if (distance > 0) {
                            totalDX += (dx / distance) * displacementMag;
                            totalDY += (dy / distance) * displacementMag;
                        }
                    });

                    corner.x = corner.ox + totalDX;
                    corner.y = corner.oy + totalDY;
                });

                // Create distorted quad
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const pathData = `M ${corners[0].x} ${corners[0].y} ` +
                               `L ${corners[1].x} ${corners[1].y} ` +
                               `L ${corners[2].x} ${corners[2].y} ` +
                               `L ${corners[3].x} ${corners[3].y} Z`;

                path.setAttribute('d', pathData);

                // Checkerboard pattern
                const isBlack = (row + col) % 2 === 0;
                path.setAttribute('fill', isBlack ? ctx.getLineColor() : '#000');
                path.setAttribute('stroke', ctx.getLineColor());
                path.setAttribute('stroke-width', lineWidth * 0.3);

                svg.appendChild(path);
            }
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('shaded-grid', shadedGrid);

export default shadedGrid;
