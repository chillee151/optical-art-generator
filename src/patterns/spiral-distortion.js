/**
 * Spiral Distortion - True Logarithmic Spiral Optical Art
 * Creates hypnotic spiral patterns with alternating black/white bands
 * that fill the entire canvas
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

const spiralDistortion = {
    name: 'Spiral Distortion',
    description: 'Hypnotic logarithmic spiral with alternating contrast bands creating powerful optical depth',
    category: 'op-art',

    defaults: {
        complexity: 60,
        frequency: 50,
        amplitude: 500
    },

    generate(layerGroup, ctx) {
        const {
            width, height, complexity, frequency, amplitude,
            rotation, centerX, centerY, lineWidth, isDarkMode, colorMode
        } = ctx;

        // Use diagonal to ensure we cover corners
        const maxRadius = Math.sqrt(width * width + height * height) / 2 * 1.1;

        // COMPLEXITY: Number of spiral arms/bands (6-60)
        const numArms = Math.max(6, Math.min(60, Math.floor(6 + complexity * 0.54)));

        // FREQUENCY: Spiral tightness - how many rotations from center to edge (2-12)
        const numRotations = Math.max(2, Math.min(12, 2 + (frequency / 100) * 10));

        // AMPLITUDE: Controls spiral curve shape (-1000 to 1000)
        // At 0: Archimedean spiral (linear growth)
        // Positive: Tighter center, looser edge
        // Negative: Looser center, tighter edge
        const curveExponent = 1 + (amplitude / 1000) * 0.5; // 0.5 to 1.5
        const spiralDirection = amplitude >= 0 ? 1 : -1;

        // Total angle covered by the spiral
        const totalAngle = numRotations * Math.PI * 2;

        // Determine foreground and background colors
        // For black/white optical art, we need explicit contrast
        let fgColor, bgColor;
        if (colorMode === 'black' || colorMode === 'single') {
            // Black & white mode: explicit black/white contrast
            fgColor = isDarkMode ? '#fff' : '#000';
            bgColor = isDarkMode ? '#000' : '#fff';
        } else {
            // Color modes: use getLineColor for gradient effect
            fgColor = ctx.getLineColor(0, numArms);
            bgColor = isDarkMode ? '#000' : '#fff';
        }

        // First, add a background to ensure no edge artifacts
        const bg = createSvgElement('circle');
        bg.setAttribute('cx', centerX);
        bg.setAttribute('cy', centerY);
        bg.setAttribute('r', maxRadius);
        bg.setAttribute('fill', bgColor);
        layerGroup.appendChild(bg);

        // Draw alternating spiral bands
        for (let arm = 0; arm < numArms; arm++) {
            // Only draw foreground arms - the background shows through for contrast
            if (arm % 2 !== 0) continue;

            // Angular offset for this arm
            const armOffset = (arm / numArms) * Math.PI * 2;
            const nextArmOffset = ((arm + 1) / numArms) * Math.PI * 2;

            // Create the spiral band as a filled path
            const path = createSvgElement('path');
            let pathData = '';

            const numPoints = 300; // High resolution for smooth spiral

            // Draw outer edge of this band (current arm)
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const angle = t * totalAngle * spiralDirection + armOffset;

                // Archimedean-style spiral with adjustable curvature
                const radius = maxRadius * Math.pow(t, curveExponent);

                const x = centerX + Math.cos(angle + rotation * Math.PI / 180) * radius;
                const y = centerY + Math.sin(angle + rotation * Math.PI / 180) * radius;

                pathData += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
            }

            // Draw inner edge (next arm's path, going backwards)
            for (let i = numPoints; i >= 0; i--) {
                const t = i / numPoints;
                const angle = t * totalAngle * spiralDirection + nextArmOffset;

                const radius = maxRadius * Math.pow(t, curveExponent);

                const x = centerX + Math.cos(angle + rotation * Math.PI / 180) * radius;
                const y = centerY + Math.sin(angle + rotation * Math.PI / 180) * radius;

                pathData += ` L ${x} ${y}`;
            }

            pathData += ' Z';

            // Use gradient colors if in color mode
            const fillColor = (colorMode !== 'black' && colorMode !== 'single')
                ? ctx.getLineColor(arm, numArms)
                : fgColor;

            path.setAttribute('d', pathData);
            path.setAttribute('fill', fillColor);
            path.setAttribute('stroke', 'none');

            layerGroup.appendChild(path);
        }

        // Center dot
        const centerDot = createSvgElement('circle');
        centerDot.setAttribute('cx', centerX);
        centerDot.setAttribute('cy', centerY);
        centerDot.setAttribute('r', Math.max(4, lineWidth * 2));
        centerDot.setAttribute('fill', fgColor);
        layerGroup.appendChild(centerDot);
    },

    generateMini(svg, ctx) {
        const { centerX, centerY } = ctx;
        const maxRadius = 32; // Larger to fill the 56x56 thumbnail

        const numArms = 12;
        const numRotations = 4;
        const curveExponent = 1.0;
        const totalAngle = numRotations * Math.PI * 2;

        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bg.setAttribute('cx', centerX);
        bg.setAttribute('cy', centerY);
        bg.setAttribute('r', maxRadius);
        bg.setAttribute('fill', '#fff');
        svg.appendChild(bg);

        for (let arm = 0; arm < numArms; arm++) {
            if (arm % 2 !== 0) continue;

            const armOffset = (arm / numArms) * Math.PI * 2;
            const nextArmOffset = ((arm + 1) / numArms) * Math.PI * 2;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 80;

            // Outer edge
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const angle = t * totalAngle + armOffset;
                const radius = maxRadius * Math.pow(t, curveExponent);

                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                pathData += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
            }

            // Inner edge
            for (let i = numPoints; i >= 0; i--) {
                const t = i / numPoints;
                const angle = t * totalAngle + nextArmOffset;
                const radius = maxRadius * Math.pow(t, curveExponent);

                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                pathData += ` L ${x} ${y}`;
            }

            pathData += ' Z';

            path.setAttribute('d', pathData);
            path.setAttribute('fill', ctx.getLineColor());
            path.setAttribute('stroke', 'none');

            svg.appendChild(path);
        }

        // Center dot
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', centerX);
        center.setAttribute('cy', centerY);
        center.setAttribute('r', 2);
        center.setAttribute('fill', ctx.getLineColor());
        svg.appendChild(center);
    }
};

patternRegistry.register('spiral-distortion', spiralDistortion);

export default spiralDistortion;
