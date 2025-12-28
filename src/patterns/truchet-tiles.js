/**
 * Truchet Tiles - Classic Generative Art Pattern
 * Creates emergent maze-like patterns from randomly rotated tiles
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement, seededRandom } from '../core/utils.js';

const truchetTiles = {
    name: 'Truchet Tiles',
    description: 'Classic generative pattern with quarter-circle tiles randomly rotated to create emergent maze-like patterns',
    category: 'generative',

    defaults: {
        complexity: 50,
        frequency: 50,
        amplitude: 0
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency,
            rotation, centerX, centerY, lineWidth, seed
        } = ctx;

        // Use complexity to determine grid density
        const gridSize = Math.max(5, Math.floor(complexity / 5));
        const tileSize = Math.min(width, height) / gridSize;

        // Use frequency to select tile type
        const tileTypes = ['quarter-circle', 'diagonal', 'double-curve'];
        const tileTypeIndex = Math.floor(frequency / 34);
        const tileType = tileTypes[Math.min(tileTypeIndex, tileTypes.length - 1)];

        // Create seeded random function for reproducibility
        const seededRandomLocal = (i, j) => {
            const x = Math.sin(seed + i * 12.9898 + j * 78.233) * 43758.5453;
            return x - Math.floor(x);
        };

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                const tileRotation = Math.floor(seededRandomLocal(row, col) * 4) * 90;

                const tileGroup = createSvgElement('g');
                tileGroup.setAttribute('transform', `translate(${x}, ${y}) rotate(${tileRotation}, ${tileSize/2}, ${tileSize/2})`);

                const color = ctx.getLineColor(row * gridSize + col, gridSize * gridSize);

                if (tileType === 'quarter-circle') {
                    // Quarter circle from one corner to adjacent edge
                    const path = createSvgElement('path');
                    path.setAttribute('d', `M 0 0 Q 0 ${tileSize} ${tileSize} ${tileSize}`);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', color);
                    path.setAttribute('stroke-width', lineWidth);
                    tileGroup.appendChild(path);
                } else if (tileType === 'diagonal') {
                    // Diagonal line
                    const line = createSvgElement('line');
                    line.setAttribute('x1', 0);
                    line.setAttribute('y1', 0);
                    line.setAttribute('x2', tileSize);
                    line.setAttribute('y2', tileSize);
                    line.setAttribute('stroke', color);
                    line.setAttribute('stroke-width', lineWidth);
                    tileGroup.appendChild(line);
                } else if (tileType === 'double-curve') {
                    // Two quarter circles
                    const path1 = createSvgElement('path');
                    path1.setAttribute('d', `M 0 0 Q 0 ${tileSize/2} ${tileSize/2} ${tileSize/2}`);
                    path1.setAttribute('fill', 'none');
                    path1.setAttribute('stroke', color);
                    path1.setAttribute('stroke-width', lineWidth);
                    tileGroup.appendChild(path1);

                    const path2 = createSvgElement('path');
                    path2.setAttribute('d', `M ${tileSize/2} ${tileSize/2} Q ${tileSize} ${tileSize/2} ${tileSize} ${tileSize}`);
                    path2.setAttribute('fill', 'none');
                    path2.setAttribute('stroke', color);
                    path2.setAttribute('stroke-width', lineWidth);
                    tileGroup.appendChild(path2);
                }

                layerGroup.appendChild(tileGroup);
            }
        }

        if (rotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }
    },

    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth, seed } = ctx;
        const gridSize = 8;
        const tileSize = 56 / gridSize;

        const seededRandomLocal = (i, j) => {
            const x = Math.sin((seed || 0.5) + i * 12.9898 + j * 78.233) * 43758.5453;
            return x - Math.floor(x);
        };

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                const rotation = Math.floor(seededRandomLocal(row, col) * 4) * 90;

                const tileGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                tileGroup.setAttribute('transform', `translate(${x}, ${y}) rotate(${rotation}, ${tileSize/2}, ${tileSize/2})`);

                // Quarter circle tile
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M 0 0 Q 0 ${tileSize} ${tileSize} ${tileSize}`);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', ctx.getLineColor());
                path.setAttribute('stroke-width', lineWidth * 0.5);
                tileGroup.appendChild(path);

                svg.appendChild(tileGroup);
            }
        }
    }
};

patternRegistry.register('truchet-tiles', truchetTiles);

export default truchetTiles;
