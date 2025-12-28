/**
 * Moiré Interference Pattern
 * Multi-layer interference patterns creating mesmerizing moiré effects
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement, seededRandom } from '../core/utils.js';

const moireInterference = {
    name: 'Moiré Interference',
    description: 'Multi-layer interference patterns with three modes: traditional lines, grid networks, and radial circles, creating mesmerizing moiré effects',
    category: 'mathematical',

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
            rotation, centerX, centerY, lineWidth, seed
        } = ctx;

        // Use complexity for line density
        const baseSpacing = Math.max(height / complexity, 2);

        // Use amplitude for spacing variation between layers
        const spacingVariation = amplitude / 100;

        // Use frequency for rotation angles and number of layers
        const numLayers = frequency > 66 ? 3 : frequency > 33 ? 2 : 1;
        const angleStep = frequency / 10;

        // Create pattern type based on frequency
        const patternType = frequency > 60 ? 'radial' : frequency > 30 ? 'grid' : 'lines';

        if (patternType === 'radial') {
            // Radial moiré pattern with concentric circles
            for (let layer = 0; layer < numLayers; layer++) {
                const layerProgress = layer / Math.max(numLayers - 1, 1);
                const spacing = baseSpacing * (1 + spacingVariation * layer * 0.2);
                const maxRadius = Math.sqrt(width * width + height * height) / 2;
                const numCircles = Math.ceil(maxRadius / spacing);

                for (let i = 0; i < numCircles; i++) {
                    const radius = spacing * (i + 1);
                    const circle = createSvgElement('circle');
                    circle.setAttribute('cx', centerX);
                    circle.setAttribute('cy', centerY);
                    circle.setAttribute('r', radius);
                    circle.setAttribute('fill', 'none');

                    const color = ctx.getLineColor(layer, numLayers);
                    circle.setAttribute('stroke', color);
                    circle.setAttribute('stroke-width', lineWidth * (1 - layer * 0.2));
                    circle.setAttribute('stroke-opacity', 0.7);

                    // Rotation for each layer
                    const layerRotation = rotation + angleStep * layer;
                    if (layerRotation !== 0) {
                        circle.setAttribute('transform', `rotate(${layerRotation} ${centerX} ${centerY})`);
                    }

                    layerGroup.appendChild(circle);
                }
            }
        } else if (patternType === 'grid') {
            // Grid pattern (horizontal + vertical)
            for (let layer = 0; layer < numLayers; layer++) {
                const layerProgress = layer / Math.max(numLayers - 1, 1);
                const spacing = baseSpacing * (1 + spacingVariation * layer * 0.15);
                const color = ctx.getLineColor(layer, numLayers);
                const thickness = lineWidth * (1 - layer * 0.15);
                const layerRotation = rotation + angleStep * layer * 1.5;

                // Horizontal lines
                for (let y = 0; y < height + spacing; y += spacing) {
                    const line = createSvgElement('line');
                    line.setAttribute('x1', 0);
                    line.setAttribute('y1', y);
                    line.setAttribute('x2', width);
                    line.setAttribute('y2', y);
                    line.setAttribute('stroke', color);
                    line.setAttribute('stroke-width', thickness);
                    line.setAttribute('stroke-opacity', 0.7);

                    if (layerRotation !== 0) {
                        line.setAttribute('transform', `rotate(${layerRotation} ${centerX} ${centerY})`);
                    }

                    layerGroup.appendChild(line);
                }

                // Vertical lines
                for (let x = 0; x < width + spacing; x += spacing) {
                    const line = createSvgElement('line');
                    line.setAttribute('x1', x);
                    line.setAttribute('y1', 0);
                    line.setAttribute('x2', x);
                    line.setAttribute('y2', height);
                    line.setAttribute('stroke', color);
                    line.setAttribute('stroke-width', thickness);
                    line.setAttribute('stroke-opacity', 0.7);

                    if (layerRotation !== 0) {
                        line.setAttribute('transform', `rotate(${layerRotation} ${centerX} ${centerY})`);
                    }

                    layerGroup.appendChild(line);
                }
            }
        } else {
            // Linear pattern with multiple angles (traditional moiré)
            // Use identical spacing + precise angles for proper moiré effect
            const layers = Math.max(2, numLayers + 1);

            for (let layer = 0; layer < layers; layer++) {
                const layerProgress = layer / (layers - 1);

                // FIXED: Use identical spacing for all layers (no random variation)
                // This creates proper moiré interference patterns
                const spacing = baseSpacing;

                // Precise angle offsets for optimal moiré (small angles create best effect)
                const layerAngle = rotation + (layer * 3.5); // 3.5 degrees per layer for optimal interference

                const color = ctx.getLineColor(layer, layers);
                const thickness = lineWidth * (1 - layer * 0.12);

                // Calculate number of lines needed (accounting for rotation)
                const diagonal = Math.sqrt(width * width + height * height);
                const numLines = Math.ceil(diagonal / spacing) + 10;
                const startY = -diagonal / 2;

                for (let i = 0; i < numLines; i++) {
                    const y = startY + i * spacing;
                    const line = createSvgElement('line');
                    line.setAttribute('x1', -width);
                    line.setAttribute('y1', y);
                    line.setAttribute('x2', width * 2);
                    line.setAttribute('y2', y);
                    line.setAttribute('stroke', color);
                    line.setAttribute('stroke-width', thickness);
                    line.setAttribute('stroke-opacity', 0.7 - layer * 0.1);

                    line.setAttribute('transform', `rotate(${layerAngle} ${centerX} ${centerY})`);

                    layerGroup.appendChild(line);
                }
            }
        }

        // Add reference point
        const marker = createSvgElement('circle');
        marker.setAttribute('cx', centerX);
        marker.setAttribute('cy', centerY);
        marker.setAttribute('r', Math.max(2, lineWidth));
        marker.setAttribute('fill', ctx.getLineColor(0, 1));
        marker.setAttribute('fill-opacity', '0.5');
        layerGroup.appendChild(marker);
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { centerX, centerY, lineWidth } = ctx;

        // Updated to match default settings (complexity: 50, frequency: 50, amplitude: 50)
        // Grid pattern with 2 layers (frequency 50 is in 33-66 range, so numLayers = 2)
        const baseSpacing = 56 / 12.5; // Scaled from complexity: 50
        const spacingVariation = 0.5; // From amplitude: 50 → 50/100
        const angleStep = 5.0; // From frequency: 50 → 50/10

        const numLayers = 2; // frequency: 50 → in 33-66 range, so 2 layers

        for (let layer = 0; layer < numLayers; layer++) {
            const spacing = baseSpacing * (1 + spacingVariation * layer * 0.15);
            const layerAngle = angleStep * layer * 1.5; // Matches main pattern calculation
            const opacity = 0.7;
            const strokeWidth = lineWidth * (1 - layer * 0.15);

            const lineColor = ctx.getLineColor();

            // Horizontal lines
            for (let y = 0; y < 56 + spacing; y += spacing) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', 0);
                line.setAttribute('y1', y);
                line.setAttribute('x2', 56);
                line.setAttribute('y2', y);
                line.setAttribute('stroke', lineColor);
                line.setAttribute('stroke-width', strokeWidth);
                line.setAttribute('stroke-opacity', opacity);
                line.setAttribute('transform', `rotate(${layerAngle} ${centerX} ${centerY})`);
                svg.appendChild(line);
            }

            // Vertical lines
            for (let x = 0; x < 56 + spacing; x += spacing) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x);
                line.setAttribute('y1', 0);
                line.setAttribute('x2', x);
                line.setAttribute('y2', 56);
                line.setAttribute('stroke', lineColor);
                line.setAttribute('stroke-width', strokeWidth);
                line.setAttribute('stroke-opacity', opacity);
                line.setAttribute('transform', `rotate(${layerAngle} ${centerX} ${centerY})`);
                svg.appendChild(line);
            }
        }

        // Center marker
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', centerX);
        marker.setAttribute('cy', centerY);
        marker.setAttribute('r', 1.5);
        marker.setAttribute('fill', ctx.getLineColor());
        marker.setAttribute('fill-opacity', '0.5');
        svg.appendChild(marker);
    }
};

// Self-register with the pattern registry
patternRegistry.register('moire-interference', moireInterference);

export default moireInterference;
