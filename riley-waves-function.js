// ═══════════════════════════════════════════════════════════════════════
// BRIDGET RILEY WAVES PATTERN
// Add this function to script.js around line 4227 (after generateSpiralDistortion)
// ═══════════════════════════════════════════════════════════════════════

generateRileyWaves(layerGroup, currentRotation, slowAnimationTime) {
    const complexity = parseInt(document.getElementById('complexity').value);
    const lineWidth = this.getAutoLineWidth();
    const amplitude = parseInt(document.getElementById('amplitude').value);
    const frequency = parseInt(document.getElementById('frequency').value);
    const rotation = parseInt(document.getElementById('rotation').value);
    const centerX = this.actualWidth / 2;
    const centerY = this.actualHeight / 2;

    // Use complexity for number of wave lines
    const numLines = Math.max(20, complexity * 2);
    const spacing = this.actualHeight / numLines;

    // Use amplitude for maximum wave amplitude
    const maxAmplitude = (amplitude / 100) * this.actualWidth * 0.2;

    // Use frequency for wave frequency along each line
    const waveFrequency = Math.max(2, frequency / 20);

    // Create wavy lines with Riley-style rhythm variation
    for (let i = 0; i < numLines; i++) {
        const progress = i / numLines;
        const y = i * spacing;

        // CRITICAL: Sinusoidal amplitude variation (Riley's signature!)
        // Lines at edges are straighter, center lines have maximum wave
        const amplitudeModulation = Math.sin(progress * Math.PI);
        const lineAmplitude = maxAmplitude * amplitudeModulation;

        // Frequency variation creates rhythm
        const frequencyModulation = 1 + 0.3 * Math.sin(progress * Math.PI * 2);
        const lineFrequency = waveFrequency * frequencyModulation;

        // Phase shift creates flowing pattern
        const phase = progress * Math.PI * 2;

        // Generate smooth wave path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = '';

        const numPoints = 200; // High resolution for smooth curves
        const step = this.actualWidth / numPoints;

        for (let x = 0; x <= this.actualWidth; x += step) {
            const xProgress = x / this.actualWidth;

            // Sinusoidal wave with modulated amplitude
            const waveY = y + lineAmplitude * Math.sin(xProgress * Math.PI * 2 * lineFrequency + phase);

            if (pathData === '') {
                pathData = `M ${x} ${waveY}`;
            } else {
                pathData += ` L ${x} ${waveY}`;
            }
        }

        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');

        // Get color
        const color = this.getLineColor(i, numLines);
        path.setAttribute('stroke', color);

        // Variable line weight for depth
        const thickness = lineWidth * (0.8 + progress * 0.4);
        path.setAttribute('stroke-width', thickness);

        // Apply rotation if set
        if (rotation !== 0) {
            path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        }

        layerGroup.appendChild(path);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// RILEY WAVES MINI PREVIEW
// Add this function around line 1200 (with other mini preview functions)
// ═══════════════════════════════════════════════════════════════════════

generateMiniRileyWaves(svg, seed, complexity, lineWidth) {
    const size = 56;
    const numLines = Math.min(15, complexity * 2);
    const spacing = size / numLines;
    const maxAmplitude = size * 0.15;

    for (let i = 0; i < numLines; i++) {
        const progress = i / numLines;
        const y = i * spacing;

        // Riley amplitude modulation
        const amplitudeModulation = Math.sin(progress * Math.PI);
        const lineAmplitude = maxAmplitude * amplitudeModulation;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = '';

        for (let x = 0; x <= size; x += 2) {
            const xProgress = x / size;
            const waveY = y + lineAmplitude * Math.sin(xProgress * Math.PI * 2 * 3);

            if (pathData === '') {
                pathData = `M ${x} ${waveY}`;
            } else {
                pathData += ` L ${x} ${waveY}`;
            }
        }

        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', lineWidth * 0.5);

        svg.appendChild(path);
    }
}
