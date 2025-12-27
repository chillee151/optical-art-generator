/**
 * L-System Growth Pattern
 * Fractal branching with 6 types (bush/tree/fern/flower/spiral/fractal), rotational symmetry (2/4/6-fold), colored branches by depth, and leaves
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const lSystemGrowth = {
    name: 'L-System Growth',
    description: 'Fractal branching with 6 types (bush/tree/fern/flower/spiral/fractal), rotational symmetry (2/4/6-fold), colored branches by depth, and leaves',
    category: 'organic',

    // Default slider values for this pattern
    defaults: {
        complexity: 166,
        frequency: 55,
        amplitude: 31
    },

    /**
     * Generate full-size pattern
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context
     */
    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            centerX, centerY, lineWidth, rotation
        } = ctx;

        // Select L-System type based on frequency
        let systemType;
        if (frequency < 15) systemType = 'bush';
        else if (frequency < 30) systemType = 'tree';
        else if (frequency < 45) systemType = 'fern';
        else if (frequency < 60) systemType = 'flower';
        else if (frequency < 75) systemType = 'spiral';
        else systemType = 'fractal';

        // L-System definitions
        const systems = {
            bush: {
                axiom: "F",
                rules: { "F": "FF+[+F-F-F]-[-F+F+F]" },
                angle: 22.5,
                startAngle: -90,
                iterations: Math.min(4, Math.floor(complexity / 25) + 2)
            },
            tree: {
                axiom: "X",
                rules: { "X": "F[+X][-X]FX", "F": "FF" },
                angle: 25,
                startAngle: -90,
                iterations: Math.min(6, Math.floor(complexity / 20) + 2)
            },
            fern: {
                axiom: "X",
                rules: { "X": "F[+X]F[-X]+X", "F": "FF" },
                angle: 20,
                startAngle: -90,
                iterations: Math.min(6, Math.floor(complexity / 20) + 3)
            },
            flower: {
                axiom: "F",
                rules: { "F": "F[+F]F[-F][F]" },
                angle: 20,
                startAngle: -90,
                iterations: Math.min(5, Math.floor(complexity / 25) + 2)
            },
            spiral: {
                axiom: "F",
                rules: { "F": "F+F-F-F+F" },
                angle: 90,
                startAngle: 0,
                iterations: Math.min(5, Math.floor(complexity / 20) + 2)
            },
            fractal: {
                axiom: "F-F-F-F",
                rules: { "F": "F-F+F+FF-F-F+F" },
                angle: 90,
                startAngle: 0,
                iterations: Math.min(4, Math.floor(complexity / 30) + 1)
            }
        };

        const system = systems[systemType];

        // Use amplitude for scaling (fills screen better)
        const baseSize = Math.min(width, height);
        const scaleFactor = amplitude / 50;
        const segmentLength = (baseSize / Math.pow(2, system.iterations)) * scaleFactor;

        // Determine symmetry based on complexity
        const numCopies = complexity > 70 ? 6 : complexity > 50 ? 4 : complexity > 30 ? 2 : 1;
        const angleStep = 360 / numCopies;

        // Generate the L-system string
        let currentString = system.axiom;
        for (let iter = 0; iter < system.iterations; iter++) {
            let nextString = "";
            for (let j = 0; j < currentString.length; j++) {
                const char = currentString[j];
                nextString += system.rules[char] || char;
            }
            currentString = nextString;
        }

        // Draw multiple copies with rotational symmetry
        for (let copy = 0; copy < numCopies; copy++) {
            const copyRotation = angleStep * copy;

            // Starting position based on system type
            let startX, startY;
            if (systemType === 'spiral' || systemType === 'fractal') {
                startX = centerX;
                startY = centerY;
            } else {
                // Plants start from bottom
                startX = centerX;
                startY = height - 20;
            }

            // Rotate start position around center for symmetry
            if (numCopies > 1) {
                const rotRad = (copyRotation * Math.PI) / 180;
                const dx = startX - centerX;
                const dy = startY - centerY;
                startX = centerX + dx * Math.cos(rotRad) - dy * Math.sin(rotRad);
                startY = centerY + dx * Math.sin(rotRad) + dy * Math.cos(rotRad);
            }

            let x = startX;
            let y = startY;
            let currentAngle = system.startAngle + copyRotation;
            const stack = [];
            let depth = 0;
            const maxDepth = system.iterations * 2;

            // Track segments by depth for coloring
            const segments = [];

            for (let i = 0; i < currentString.length; i++) {
                const char = currentString[i];
                switch (char) {
                    case 'F':
                        const x1 = x + segmentLength * Math.cos(currentAngle * Math.PI / 180);
                        const y1 = y + segmentLength * Math.sin(currentAngle * Math.PI / 180);
                        segments.push({
                            x1: x, y1: y, x2: x1, y2: y1, depth: depth
                        });
                        x = x1;
                        y = y1;
                        break;
                    case '+':
                        currentAngle += system.angle;
                        break;
                    case '-':
                        currentAngle -= system.angle;
                        break;
                    case '[':
                        stack.push({ x, y, angle: currentAngle, depth: depth });
                        depth++;
                        break;
                    case ']':
                        const prev = stack.pop();
                        if (prev) {
                            // Add leaf/flower at branch tip
                            if (systemType === 'flower' || systemType === 'fern') {
                                const leaf = createSvgElement('circle');
                                leaf.setAttribute('cx', x);
                                leaf.setAttribute('cy', y);
                                leaf.setAttribute('r', lineWidth * 1.5);
                                leaf.setAttribute('fill', ctx.getLineColor(depth, maxDepth));
                                leaf.setAttribute('fill-opacity', '0.7');
                                layerGroup.appendChild(leaf);
                            }

                            x = prev.x;
                            y = prev.y;
                            currentAngle = prev.angle;
                            depth = prev.depth;
                        }
                        break;
                }
            }

            // Draw segments with color variation by depth
            segments.forEach((seg, idx) => {
                const line = createSvgElement('line');
                line.setAttribute('x1', seg.x1);
                line.setAttribute('y1', seg.y1);
                line.setAttribute('x2', seg.x2);
                line.setAttribute('y2', seg.y2);

                // Color by depth (trunk darker, branches lighter)
                const color = ctx.getLineColor(seg.depth, maxDepth);
                line.setAttribute('stroke', color);

                // Thickness decreases with depth
                const thickness = lineWidth * (1 - seg.depth / maxDepth * 0.7);
                line.setAttribute('stroke-width', Math.max(0.5, thickness));
                line.setAttribute('stroke-linecap', 'round');

                layerGroup.appendChild(line);
            });
        }

        // Add center marker for radial patterns
        if (numCopies > 1) {
            const centerDot = createSvgElement('circle');
            centerDot.setAttribute('cx', centerX);
            centerDot.setAttribute('cy', centerY);
            centerDot.setAttribute('r', Math.max(2, lineWidth));
            centerDot.setAttribute('fill', ctx.getLineColor(0, 1));
            centerDot.setAttribute('fill-opacity', '0.8');
            layerGroup.appendChild(centerDot);
        }

        if (rotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { lineWidth } = ctx;

        // L-System thumbnail - complexity: 166, frequency: 55, amplitude: 31
        const axiom = "F";
        const rules = { "F": "F[+F]F[-F]F" }; // Bush-like branching
        const angle = 27.5; // frequency: 55 mapped to branching angle (55/2)
        const iterations = 3; // complexity: 166 (higher iterations for more detail)
        let currentString = axiom;

        for (let i = 0; i < iterations; i++) {
            let nextString = "";
            for (let j = 0; j < currentString.length; j++) {
                const char = currentString[j];
                nextString += rules[char] || char;
            }
            currentString = nextString;
        }

        let x = 28, y = 52;
        let currentAngle = -90; // Start pointing up
        const step = 3.1; // amplitude: 31 mapped to step size (31/10)
        const stack = [];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = `M ${x} ${y}`;

        for (let i = 0; i < currentString.length; i++) {
            const char = currentString[i];
            switch (char) {
                case 'F':
                    const x1 = x + step * Math.cos(currentAngle * Math.PI / 180);
                    const y1 = y + step * Math.sin(currentAngle * Math.PI / 180);
                    pathData += ` L ${x1} ${y1}`;
                    x = x1;
                    y = y1;
                    break;
                case '+':
                    currentAngle += angle;
                    break;
                case '-':
                    currentAngle -= angle;
                    break;
                case '[':
                    stack.push({ x, y, angle: currentAngle });
                    break;
                case ']':
                    const prev = stack.pop();
                    x = prev.x;
                    y = prev.y;
                    currentAngle = prev.angle;
                    pathData += ` M ${x} ${y}`;
                    break;
            }
        }
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', lineWidth * 0.4);
        svg.appendChild(path);
    }
};

// Self-register with the pattern registry
patternRegistry.register('l-system-growth', lSystemGrowth);

export default lSystemGrowth;
