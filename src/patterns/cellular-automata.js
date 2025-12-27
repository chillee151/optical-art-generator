/**
 * Cellular Automata Pattern
 * Emergent patterns from simple rule-based cellular automata using elementary 1D rules
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const cellularAutomata = {
    name: 'Cellular Automata',
    description: 'Emergent patterns from simple rule-based cellular automata.',
    category: 'mathematical',

    // Default slider values for this pattern
    defaults: {
        complexity: 80,
        frequency: 49,
        amplitude: -69
    },

    /**
     * Generate full-size pattern
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context
     */
    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            centerX, centerY, slowAnimationTime
        } = ctx;

        const cellSize = Math.max(1, Math.floor(Math.min(width, height) / complexity));
        const cellsPerRow = Math.floor(width / cellSize);
        const numRows = Math.floor(height / cellSize);

        // Determine ruleset based on frequency slider (0-100) and slowAnimationTime
        let ruleNumber = 30; // Default
        const animatedFrequency = (frequency + slowAnimationTime * 0.1) % 100; // Subtle animation of frequency

        if (animatedFrequency < 10) ruleNumber = 30;
        else if (animatedFrequency < 20) ruleNumber = 90;
        else if (animatedFrequency < 30) ruleNumber = 110;
        else if (animatedFrequency < 40) ruleNumber = 182;
        else if (animatedFrequency < 50) ruleNumber = 250;
        else if (animatedFrequency < 60) ruleNumber = 54; // Another interesting rule
        else if (animatedFrequency < 70) ruleNumber = 126; // Another interesting rule
        else if (animatedFrequency < 80) ruleNumber = 150; // Another interesting rule
        else ruleNumber = 222; // Another interesting rule

        const ruleset = [];
        for (let i = 0; i < 8; i++) {
            ruleset.push((ruleNumber >> i) & 1);
        }

        let currentRow = new Array(cellsPerRow).fill(0);

        // AMPLITUDE controls initial seed pattern width
        // amplitude -1000 to +1000 maps to seed width
        const seedWidth = Math.max(1, Math.floor(Math.abs(amplitude) / 20)); // 1 to 50 cells
        const center = Math.floor(cellsPerRow / 2);

        if (amplitude >= 0) {
            // Positive amplitude: continuous seed cluster
            for (let i = 0; i < seedWidth; i++) {
                const offset = Math.floor(i - seedWidth / 2);
                const pos = (center + offset + cellsPerRow) % cellsPerRow;
                currentRow[pos] = 1;
            }
        } else {
            // Negative amplitude: scattered seed pattern
            for (let i = 0; i < seedWidth; i++) {
                const offset = i * 2; // Every other cell
                const pos = (center + offset - seedWidth + cellsPerRow) % cellsPerRow;
                currentRow[pos] = 1;
            }
        }

        for (let r = 0; r < numRows; r++) {
            let nextRow = new Array(cellsPerRow).fill(0);
            for (let i = 0; i < cellsPerRow; i++) {
                const left = currentRow[(i - 1 + cellsPerRow) % cellsPerRow];
                const self = currentRow[i];
                const right = currentRow[(i + 1) % cellsPerRow];

                const ruleIndex = (left << 2) | (self << 1) | right; // Convert 3-bit pattern to index (0-7)
                nextRow[i] = ruleset[ruleIndex];

                if (nextRow[i] === 1) {
                    const rect = createSvgElement('rect');
                    rect.setAttribute('x', i * cellSize);
                    rect.setAttribute('y', r * cellSize);
                    rect.setAttribute('width', cellSize);
                    rect.setAttribute('height', cellSize);
                    rect.setAttribute('fill', ctx.getLineColor(r, numRows));
                    rect.setAttribute('stroke', 'none'); // No stroke for solid cells
                    layerGroup.appendChild(rect);
                }
            }
            currentRow = nextRow;
        }

        if (ctx.currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${ctx.currentRotation} ${centerX} ${centerY})`);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        // Cellular automata thumbnail - complexity: 80, frequency: 49, amplitude: -69
        const width = 56;
        const height = 56;
        const cellSize = 1.4; // complexity: 80 (smaller cells for finer detail)
        const cellsPerRow = Math.floor(width / cellSize);
        const numRows = Math.floor(height / cellSize);

        // frequency: 49 maps to rule 250
        const ruleNumber = 250; // frequency: 49 -> rule 250
        const ruleset = [];
        for (let i = 0; i < 8; i++) {
            ruleset.push((ruleNumber >> i) & 1);
        }

        let currentRow = new Array(cellsPerRow).fill(0);

        // amplitude: -69 -> scattered seed pattern
        const seedWidth = Math.max(1, Math.floor(Math.abs(-69) / 20)); // 3 cells
        const center = Math.floor(cellsPerRow / 2);

        // Negative amplitude: scattered seed pattern (every other cell)
        for (let i = 0; i < seedWidth; i++) {
            const offset = i * 2; // Every other cell
            const pos = (center + offset - seedWidth + cellsPerRow) % cellsPerRow;
            currentRow[pos] = 1;
        }

        for (let r = 0; r < numRows; r++) {
            let nextRow = new Array(cellsPerRow).fill(0);
            for (let i = 0; i < cellsPerRow; i++) {
                const left = currentRow[(i - 1 + cellsPerRow) % cellsPerRow];
                const self = currentRow[i];
                const right = currentRow[(i + 1) % cellsPerRow];

                const ruleIndex = (left << 2) | (self << 1) | right;
                nextRow[i] = ruleset[ruleIndex];

                if (nextRow[i] === 1) {
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', i * cellSize);
                    rect.setAttribute('y', r * cellSize);
                    rect.setAttribute('width', cellSize);
                    rect.setAttribute('height', cellSize);
                    rect.setAttribute('fill', '#000');
                    svg.appendChild(rect);
                }
            }
            currentRow = nextRow;
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('cellular-automata', cellularAutomata);

export default cellularAutomata;
