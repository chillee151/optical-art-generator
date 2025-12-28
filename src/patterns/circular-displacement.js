/**
 * Circular Displacement Pattern
 * Magnetic field visualization with multiple vortex centers, alternating charges,
 * vector field distortion, and black hole lensing effects
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const circularDisplacement = {
    name: 'Circular Displacement',
    description: 'Magnetic field visualization with multiple vortex centers, alternating charges, vector field distortion, and black hole lensing effects',
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
        const numLines = Math.max(20, complexity);
        const lineSpacing = height / numLines;

        // Use amplitude for field strength - much stronger multiplier for prominent effect
        // Default (amplitude=20) should create effect covering ~50% of canvas
        const baseFieldStrength = Math.max(50, amplitude * 5);

        // Use frequency to control circular distortion intensity
        const frequencyMultiplier = 0.5 + (frequency / 100) * 1.5; // 0.5 to 2.0
        const fieldStrength = baseFieldStrength * frequencyMultiplier;

        // Single centered vortex for clean circular displacement
        const vortices = [{
            x: centerX,
            y: centerY,
            charge: 1,
            strength: 1.0
        }];

        let lineIndex = 0;
        for (let y = 0; y < height + lineSpacing; y += lineSpacing) {
            const path = createSvgElement('path');
            let pathData = '';

            const numPoints = 150;

            for (let i = 0; i <= numPoints; i++) {
                const x = (width * i) / numPoints;

                // Calculate vector field from all vortices
                let totalDisplacementX = 0;
                let totalDisplacementY = 0;

                for (const vortex of vortices) {
                    const dx = x - vortex.x;
                    const dy = y - vortex.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);

                    if (distance < 5) continue; // Avoid singularity at center

                    // Vortex field (circular motion around center)
                    // Large decay distance so effect covers ~50% of canvas by default
                    const decay = Math.exp(-distance / 1000) * vortex.strength;
                    const vortexStrength = (fieldStrength * decay) / Math.sqrt(distance);

                    // Tangential component (circular flow)
                    const tangentialAngle = angle + (Math.PI / 2) * vortex.charge;
                    totalDisplacementX += Math.cos(tangentialAngle) * vortexStrength;
                    totalDisplacementY += Math.sin(tangentialAngle) * vortexStrength;

                    // Radial component (attraction/repulsion)
                    const radialStrength = vortexStrength * 0.3 * vortex.charge;
                    totalDisplacementX += Math.cos(angle) * radialStrength;
                    totalDisplacementY += Math.sin(angle) * radialStrength;
                }

                // Add black hole distortion effect at center
                const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                const angleToCenter = Math.atan2(y - centerY, x - centerX);

                if (distToCenter > 10) {
                    // Lens/gravitational lensing effect
                    const lensStrength = fieldStrength * 0.5 / distToCenter;
                    totalDisplacementX -= Math.cos(angleToCenter) * lensStrength;
                    totalDisplacementY -= Math.sin(angleToCenter) * lensStrength;
                }

                const finalX = x + totalDisplacementX;
                const finalY = y + totalDisplacementY;

                if (i === 0) {
                    pathData = `M ${finalX} ${finalY}`;
                } else {
                    pathData += ` L ${finalX} ${finalY}`;
                }
            }

            path.setAttribute('d', pathData);

            // Color and styling
            const color = ctx.getLineColor(lineIndex, numLines);

            // Variable thickness based on position
            const distFromCenter = Math.abs(y - centerY);
            const maxDist = height / 2;
            const thickness = lineWidth * (0.5 + 0.5 * (1 - distFromCenter / maxDist));

            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', thickness);

            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
            lineIndex++;
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        const { lineWidth } = ctx;
        const size = 56;

        const numLines = 18; // complexity: 154 (higher density)
        const spacing = size / numLines;

        // Single centered vortex - frequency: 73, amplitude: 69
        const vortexStrength = 0.69; // amplitude: 69 mapped to 0.69
        const vortexCharge = 0.73; // frequency: 73 mapped to rotation direction
        const vortex = { x: 28, y: 28, charge: vortexCharge, strength: vortexStrength };

        for (let i = 0; i < numLines; i++) {
            const y = i * spacing;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 60;
            for (let j = 0; j <= numPoints; j++) {
                const x = (size * j) / numPoints;

                // Calculate vector field from single centered vortex
                let dispX = 0, dispY = 0;

                const dx = x - vortex.x;
                const dy = y - vortex.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                if (dist > 2) {
                    const decay = Math.exp(-dist / 15) * vortex.strength;
                    const strength = (decay / Math.sqrt(dist)) * 4; // Increased strength

                    // Tangential component (circular flow)
                    const tangAngle = angle + (Math.PI / 2) * vortex.charge;
                    dispX += Math.cos(tangAngle) * strength;
                    dispY += Math.sin(tangAngle) * strength;

                    // Radial component (attraction)
                    const radialStrength = strength * 0.4 * vortex.charge;
                    dispX += Math.cos(angle) * radialStrength;
                    dispY += Math.sin(angle) * radialStrength;
                }

                // Add central lens effect
                if (dist > 3) {
                    const lensStrength = 2.0 / dist;
                    dispX -= Math.cos(angle) * lensStrength;
                    dispY -= Math.sin(angle) * lensStrength;
                }

                const finalX = x + dispX;
                const finalY = y + dispY;

                if (j === 0) {
                    pathData = `M ${finalX} ${finalY}`;
                } else {
                    pathData += ` L ${finalX} ${finalY}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', ctx.getLineColor());
            path.setAttribute('stroke-width', lineWidth * 0.6);
            svg.appendChild(path);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('circular-displacement', circularDisplacement);

export default circularDisplacement;
