/**
 * Wave Displacement Pattern
 * Multi-wave interference field with standing waves, traveling waves, radial sources,
 * and 3D surface bands creating complex wave patterns
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const waveDisplacement = {
    name: 'Wave Displacement',
    description: 'Multi-wave interference field with standing waves, traveling waves, radial sources, and 3D surface bands creating complex wave patterns',
    category: 'mathematical',

    // Default slider values for this pattern
    defaults: {
        complexity: 60,
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
        const stripeSpacing = height / numLines;

        // Use amplitude for wave intensity
        const waveAmplitude = amplitude / 10;

        // Use frequency for wave complexity (number of wave sources)
        const numWaveSources = Math.max(2, Math.floor(frequency / 20));

        // Create multiple wave source points for interference
        const waveSources = [];
        for (let i = 0; i < numWaveSources; i++) {
            const angle = (Math.PI * 2 * i) / numWaveSources;
            const radius = Math.min(width, height) * 0.3;
            waveSources.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                phase: i * Math.PI / 2
            });
        }

        let lineIndex = 0;
        for (let y = 0; y < height + stripeSpacing; y += stripeSpacing) {
            const path = createSvgElement('path');
            let pathData = '';

            const lineProgress = y / height;

            // Sample points along the line
            const numPoints = 200;
            for (let i = 0; i <= numPoints; i++) {
                const x = (width * i) / numPoints;

                // Calculate interference from all wave sources
                let totalDisplacement = 0;

                for (const source of waveSources) {
                    const distanceToSource = Math.sqrt(
                        Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2)
                    );

                    // Radial wave with decay
                    const waveNumber = 0.05 + (frequency / 1000);
                    const decay = Math.exp(-distanceToSource / 400);
                    const wave = Math.sin(distanceToSource * waveNumber + source.phase + seed * 10) * decay;

                    totalDisplacement += wave;
                }

                // Add horizontal traveling wave
                const travelingWave = Math.sin((x / width) * Math.PI * frequency * 0.1 + seed * 5);
                totalDisplacement += travelingWave * 0.3;

                // Add standing wave pattern
                const standingWave = Math.sin((x / width) * Math.PI * 4) * Math.cos(lineProgress * Math.PI * 3);
                totalDisplacement += standingWave * 0.2;

                // Scale by amplitude
                const displacedY = y + totalDisplacement * waveAmplitude;

                if (i === 0) {
                    pathData = `M ${x} ${displacedY}`;
                } else {
                    pathData += ` L ${x} ${displacedY}`;
                }
            }

            path.setAttribute('d', pathData);

            // Alternating styles for 3D surface effect
            const color = ctx.getLineColor(lineIndex, numLines);

            if (lineIndex % 4 === 0) {
                // Filled bands for 3D effect
                const nextY = y + stripeSpacing;

                // Complete the band
                for (let i = numPoints; i >= 0; i--) {
                    const x = (width * i) / numPoints;

                    // Calculate next line displacement
                    let totalDisplacement = 0;
                    for (const source of waveSources) {
                        const distanceToSource = Math.sqrt(
                            Math.pow(x - source.x, 2) + Math.pow(nextY - source.y, 2)
                        );
                        const waveNumber = 0.05 + (frequency / 1000);
                        const decay = Math.exp(-distanceToSource / 400);
                        const wave = Math.sin(distanceToSource * waveNumber + source.phase + seed * 10) * decay;
                        totalDisplacement += wave;
                    }

                    const travelingWave = Math.sin((x / width) * Math.PI * frequency * 0.1 + seed * 5);
                    totalDisplacement += travelingWave * 0.3;

                    const nextLineProgress = nextY / height;
                    const standingWave = Math.sin((x / width) * Math.PI * 4) * Math.cos(nextLineProgress * Math.PI * 3);
                    totalDisplacement += standingWave * 0.2;

                    const displacedY = nextY + totalDisplacement * waveAmplitude;
                    pathData += ` L ${x} ${displacedY}`;
                }
                pathData += ' Z';

                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.3');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth * 0.5);
            } else {
                // Outline only
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth);
            }

            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
            lineIndex++;
        }

        // Add wave source markers
        for (let i = 0; i < waveSources.length; i++) {
            const source = waveSources[i];
            const marker = createSvgElement('circle');
            marker.setAttribute('cx', source.x);
            marker.setAttribute('cy', source.y);
            marker.setAttribute('r', Math.max(2, lineWidth));
            marker.setAttribute('fill', ctx.getLineColor(i, waveSources.length));
            marker.setAttribute('fill-opacity', '0.5');
            marker.setAttribute('stroke', ctx.getLineColor(i, waveSources.length));
            marker.setAttribute('stroke-width', lineWidth);

            if (rotation !== 0) {
                marker.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(marker);
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

        const numLines = 20;
        const spacing = size / numLines;

        // Wave sources for interference
        const sources = [
            { x: 18, y: 28 },
            { x: 38, y: 28 },
            { x: 28, y: 18 }
        ];

        for (let i = 0; i < numLines; i++) {
            const y = i * spacing;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 50;
            for (let j = 0; j <= numPoints; j++) {
                const x = (size * j) / numPoints;

                // Interference pattern
                let displacement = 0;
                for (const source of sources) {
                    const dist = Math.sqrt(Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2));
                    const waveFreq = 0.6;
                    const waveAmp = 0.8;
                    displacement += Math.sin(dist * waveFreq) * Math.exp(-dist / 30) * waveAmp;
                }

                // Add horizontal wave component
                displacement += Math.sin((x / size) * Math.PI * 6) * 0.3;

                const finalY = y + displacement;

                if (j === 0) {
                    pathData = `M ${x} ${finalY}`;
                } else {
                    pathData += ` L ${x} ${finalY}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.4);

            svg.appendChild(path);
        }

        // Wave source markers
        for (const source of sources) {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', source.x);
            marker.setAttribute('cy', source.y);
            marker.setAttribute('r', 1.2);
            marker.setAttribute('fill', '#000');
            svg.appendChild(marker);
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('wave-displacement', waveDisplacement);

export default waveDisplacement;
