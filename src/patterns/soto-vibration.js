/**
 * Soto Vibration Pattern
 * Two overlapping layers of fine parallel lines at subtle angles creating shimmering moiré interference
 * and vibration effects, inspired by Jesús Rafael Soto
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const sotoVibration = {
    name: 'Soto Vibration',
    description: 'Two overlapping layers of fine parallel lines at subtle angles creating shimmering moiré interference and vibration effects, inspired by Jesús Rafael Soto',
    category: 'op-art',

    defaults: {
        complexity: 14,
        frequency: 64,
        amplitude: -162
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            rotation, centerX, centerY, lineWidth
        } = ctx;

        const lineColor = ctx.getLineColor(0, 1);

        // Dense vertical lines for layer 1 - cap at 150 to prevent white-out
        const numLines = Math.min(150, Math.max(50, complexity * 5));
        const spacing = width / numLines;

        // Layer 2 rotation angle controlled by amplitude
        const layer2Rotation = (amplitude / 100) * 5; // -5 to 5 degrees (amplitude can be negative)

        // Layer 2 phase shift controlled by frequency
        const phaseShift = (frequency / 100) * 15; // 0 to 15 pixels

        // Scale stroke width down as complexity increases to prevent overcrowding
        const strokeWidth = Math.max(1, lineWidth * (50 / Math.max(50, complexity)));

        // Create Layer 1 - vertical lines
        const layer1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer1.setAttribute('opacity', '1.0');

        for (let i = 0; i < numLines; i++) {
            const x = i * spacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', strokeWidth);
            layer1.appendChild(line);
        }

        if (rotation !== 0) {
            layer1.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }

        // Create Layer 2 - slightly rotated or phase-shifted lines
        const layer2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer2.setAttribute('opacity', '0.5');

        for (let i = 0; i < numLines; i++) {
            const x = i * spacing + phaseShift;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', strokeWidth);
            layer2.appendChild(line);
        }

        const totalRotation = rotation + layer2Rotation;
        layer2.setAttribute('transform', `rotate(${totalRotation} ${centerX} ${centerY})`);

        layerGroup.appendChild(layer1);
        layerGroup.appendChild(layer2);
    },

    generateMini(svg, ctx) {
        const { lineWidth } = ctx;
        const size = 56;

        // Updated to match default settings (complexity: 14, frequency: 64, amplitude: -162, rotation: 11)
        const numLines = 25; // Low complexity (14 * 5 = 70, scaled down for thumbnail)
        const spacing = size / numLines;
        const layer2Rotation = -8.1; // From amplitude: -162 → (-162/100) * 5
        const phaseShift = 2.2; // From frequency: 64 → (64/100) * 15, scaled for thumbnail
        const baseRotation = 11; // Overall rotation

        // Layer 1
        const layer1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer1.setAttribute('opacity', '1.0');

        for (let i = 0; i < numLines; i++) {
            const x = i * spacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', size);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth * 0.4);
            layer1.appendChild(line);
        }

        layer1.setAttribute('transform', `rotate(${baseRotation} ${size/2} ${size/2})`);

        // Layer 2 with phase shift and counter-rotation
        const layer2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer2.setAttribute('opacity', '0.5');

        for (let i = 0; i < numLines; i++) {
            const x = i * spacing + phaseShift;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', size);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth * 0.4);
            layer2.appendChild(line);
        }

        const totalRotation = baseRotation + layer2Rotation;
        layer2.setAttribute('transform', `rotate(${totalRotation} ${size/2} ${size/2})`);

        svg.appendChild(layer1);
        svg.appendChild(layer2);
    }
};

patternRegistry.register('soto-vibration', sotoVibration);

export default sotoVibration;
