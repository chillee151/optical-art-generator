/**
 * Cafe Wall Illusion - Geometric Optical Illusion
 * Parallel mortar lines appear tilted due to edge processing effects
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const cafeWall = {
    name: 'Cafe Wall',
    description: 'Powerful geometric illusion where parallel gray mortar lines appear tilted and wedged despite being perfectly horizontal',
    category: 'illusion',

    defaults: {
        complexity: 80,
        frequency: 50,
        amplitude: 100
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, amplitude,
            rotation, centerX, centerY
        } = ctx;

        // Use complexity to determine tile size
        const numCols = Math.max(5, Math.floor(complexity / 10));
        const tileSize = Math.min(width, height) / numCols;

        // Mortar width is critical - 10% of tile size is optimal
        const mortarWidth = tileSize * 0.1;

        // Offset is critical for the illusion - 50% offset between rows
        const offset = amplitude > 50 ? tileSize * 0.5 : tileSize * (amplitude / 100);

        const numRows = Math.ceil(height / (tileSize + mortarWidth)) + 1;
        const numColsActual = Math.ceil(width / tileSize) + 2;

        const color1 = ctx.getLineColor(0, 2);
        const color2 = ctx.getLineColor(1, 2);
        const mortarColor = '#888888';

        // Draw tiles
        for (let row = 0; row < numRows; row++) {
            const rowOffset = (row % 2) * offset;
            const y = row * (tileSize + mortarWidth);

            for (let col = 0; col < numColsActual; col++) {
                const x = col * tileSize + rowOffset;

                // Alternate colors
                const color = (row + col) % 2 === 0 ? color1 : color2;

                const rect = createSvgElement('rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', tileSize);
                rect.setAttribute('height', tileSize);
                rect.setAttribute('fill', color);
                rect.setAttribute('stroke', 'none');
                layerGroup.appendChild(rect);
            }

            // Draw mortar line after each row
            if (row < numRows - 1) {
                const mortarLine = createSvgElement('rect');
                mortarLine.setAttribute('x', 0);
                mortarLine.setAttribute('y', y + tileSize);
                mortarLine.setAttribute('width', width);
                mortarLine.setAttribute('height', mortarWidth);
                mortarLine.setAttribute('fill', mortarColor);
                mortarLine.setAttribute('stroke', 'none');
                layerGroup.appendChild(mortarLine);
            }
        }

        if (rotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }
    },

    generateMini(svg, ctx) {
        const tileSize = 6;
        const mortarWidth = tileSize * 0.1;
        const offset = tileSize * 0.5;
        const numRows = 10;
        const numCols = 12;

        for (let row = 0; row < numRows; row++) {
            const rowOffset = (row % 2) * offset;
            const y = row * (tileSize + mortarWidth);

            for (let col = 0; col < numCols; col++) {
                const x = col * tileSize + rowOffset;
                const color = (row + col) % 2 === 0 ? '#000' : '#fff';

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', tileSize);
                rect.setAttribute('height', tileSize);
                rect.setAttribute('fill', color);
                rect.setAttribute('stroke', 'none');
                svg.appendChild(rect);
            }

            // Mortar
            if (row < numRows - 1) {
                const mortarLine = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                mortarLine.setAttribute('x', 0);
                mortarLine.setAttribute('y', y + tileSize);
                mortarLine.setAttribute('width', 56);
                mortarLine.setAttribute('height', mortarWidth);
                mortarLine.setAttribute('fill', '#888');
                mortarLine.setAttribute('stroke', 'none');
                svg.appendChild(mortarLine);
            }
        }
    }
};

patternRegistry.register('cafe-wall', cafeWall);

export default cafeWall;
