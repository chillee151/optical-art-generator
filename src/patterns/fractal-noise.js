/**
 * Fractal Noise Pattern
 * TURBULENT FLUX FIELD - Dynamic flow visualization with curl noise streamlines
 */

import { patternRegistry } from '../core/PatternRegistry.js';
import { createSvgElement } from '../core/utils.js';

/**
 * Map complexity (0-300) to number of streamlines (20-1000) with exponential curve
 */
function mapComplexity(c) {
    return Math.floor(20 + Math.pow(c / 300, 1.5) * 980);
}

/**
 * Map frequency (0-100) to noise scale (0.001-0.03) with smooth curve
 */
function mapFrequency(f) {
    return 0.001 + (f / 100) * 0.029;
}

/**
 * Compute curl noise field using fractional Brownian motion
 * @param {PatternContext} ctx - Pattern context
 * @param {number} scale - Noise scale
 * @param {number} octaves - Number of octaves for fbm
 * @param {number} intensity - Curl intensity multiplier
 * @param {number} time - Time offset for animation
 * @returns {Object} Flow field data {field, cellSize, cols, rows}
 */
function computeCurlNoiseField(ctx, scale, octaves, intensity, time) {
    const cellSize = 8; // Grid resolution
    const cols = Math.ceil(ctx.width / cellSize);
    const rows = Math.ceil(ctx.height / cellSize);
    const field = [];

    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            const wx = x * cellSize;
            const wy = y * cellSize;

            // Compute curl using finite differences
            const offset = cellSize * 0.5;
            const n1 = ctx.fbm(wx * scale, (wy + offset) * scale, time, octaves, 0.5);
            const n2 = ctx.fbm(wx * scale, (wy - offset) * scale, time, octaves, 0.5);
            const n3 = ctx.fbm((wx + offset) * scale, wy * scale, time, octaves, 0.5);
            const n4 = ctx.fbm((wx - offset) * scale, wy * scale, time, octaves, 0.5);

            let vx = (n1 - n2) / (2 * offset);
            let vy = -(n3 - n4) / (2 * offset);

            // Apply intensity scaling
            vx *= intensity;
            vy *= intensity;

            // Normalize and store
            const mag = Math.sqrt(vx * vx + vy * vy);
            row.push({
                vx: vx,
                vy: vy,
                magnitude: mag
            });
        }
        field.push(row);
    }

    return { field, cellSize, cols, rows };
}

/**
 * Distribute seed points for streamlines
 * @param {PatternContext} ctx - Pattern context
 * @param {number} numPoints - Number of seed points to generate
 * @param {Object} flowField - Flow field data
 * @param {number} amplitude - Amplitude parameter affecting distribution strategy
 * @returns {Array<{x: number, y: number}>} Array of seed points
 */
function distributeSeedPoints(ctx, numPoints, flowField, amplitude) {
    const points = [];
    const strategy = Math.abs(amplitude);

    if (strategy < 300) {
        // Uniform grid distribution
        const gridSize = Math.ceil(Math.sqrt(numPoints));
        const spacingX = ctx.width / gridSize;
        const spacingY = ctx.height / gridSize;

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                // Add jitter
                const jitterX = (ctx.seededRandom(ctx.seed + i * 1000 + j) - 0.5) * spacingX * 0.5;
                const jitterY = (ctx.seededRandom(ctx.seed + i * 2000 + j) - 0.5) * spacingY * 0.5;

                points.push({
                    x: i * spacingX + spacingX / 2 + jitterX,
                    y: j * spacingY + spacingY / 2 + jitterY
                });

                if (points.length >= numPoints) break;
            }
            if (points.length >= numPoints) break;
        }
    } else {
        // Concentrate in high-curl regions
        const highCurlRegions = findHighCurlRegions(flowField, 20);

        for (let i = 0; i < numPoints; i++) {
            const rand = ctx.seededRandom(ctx.seed + i * 100);
            if (highCurlRegions.length > 0 && rand < 0.7) {
                // 70% in high-curl regions
                const regionIdx = Math.floor(ctx.seededRandom(ctx.seed + i * 200) * highCurlRegions.length);
                const region = highCurlRegions[regionIdx];
                points.push({
                    x: region.x + (ctx.seededRandom(ctx.seed + i * 300) - 0.5) * 50,
                    y: region.y + (ctx.seededRandom(ctx.seed + i * 400) - 0.5) * 50
                });
            } else {
                // 30% random
                points.push({
                    x: ctx.seededRandom(ctx.seed + i * 500) * ctx.width,
                    y: ctx.seededRandom(ctx.seed + i * 600) * ctx.height
                });
            }
        }
    }

    return points;
}

/**
 * Sample flow field at a point using bilinear interpolation
 * @param {Object} point - Point to sample {x, y}
 * @param {Array} field - Flow field grid
 * @param {number} cellSize - Size of grid cells
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @returns {Object|null} Velocity at point {vx, vy, magnitude} or null if out of bounds
 */
function sampleFlowField(point, field, cellSize, cols, rows) {
    const gx = point.x / cellSize;
    const gy = point.y / cellSize;

    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);

    if (x0 < 0 || x0 >= cols - 1 || y0 < 0 || y0 >= rows - 1) {
        return null;
    }

    // Bilinear interpolation
    const fx = gx - x0;
    const fy = gy - y0;

    const v00 = field[y0][x0];
    const v10 = field[y0][x0 + 1];
    const v01 = field[y0 + 1][x0];
    const v11 = field[y0 + 1][x0 + 1];

    const vx = (1 - fx) * (1 - fy) * v00.vx + fx * (1 - fy) * v10.vx +
        (1 - fx) * fy * v01.vx + fx * fy * v11.vx;
    const vy = (1 - fx) * (1 - fy) * v00.vy + fx * (1 - fy) * v10.vy +
        (1 - fx) * fy * v01.vy + fx * fy * v11.vy;

    const magnitude = Math.sqrt(vx * vx + vy * vy);

    return { vx, vy, magnitude };
}

/**
 * Trace a streamline using RK4 integration
 * @param {PatternContext} ctx - Pattern context
 * @param {Object} startPoint - Starting point {x, y}
 * @param {Object} flowFieldData - Flow field data
 * @param {number} maxSteps - Maximum integration steps
 * @param {number} stepSize - Integration step size
 * @returns {Array<{x: number, y: number}>} Array of points forming the streamline
 */
function traceStreamline(ctx, startPoint, flowFieldData, maxSteps, stepSize) {
    const { field, cellSize, cols, rows } = flowFieldData;
    const points = [{ ...startPoint }];
    let current = { ...startPoint };

    // Integrate forward
    for (let step = 0; step < maxSteps; step++) {
        const velocity = sampleFlowField(current, field, cellSize, cols, rows);

        if (!velocity || velocity.magnitude < 0.001) break;

        // RK4 integration for smooth curves
        const k1 = sampleFlowField(current, field, cellSize, cols, rows);
        if (!k1) break;

        const mid1 = {
            x: current.x + k1.vx * stepSize * 0.5,
            y: current.y + k1.vy * stepSize * 0.5
        };

        const k2 = sampleFlowField(mid1, field, cellSize, cols, rows);
        if (!k2) break;

        const mid2 = {
            x: current.x + k2.vx * stepSize * 0.5,
            y: current.y + k2.vy * stepSize * 0.5
        };

        const k3 = sampleFlowField(mid2, field, cellSize, cols, rows);
        if (!k3) break;

        const end = {
            x: current.x + k3.vx * stepSize,
            y: current.y + k3.vy * stepSize
        };

        const k4 = sampleFlowField(end, field, cellSize, cols, rows);
        if (!k4) break;

        // Combined velocity
        current = {
            x: current.x + (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx) * stepSize / 6,
            y: current.y + (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy) * stepSize / 6
        };

        // Check bounds
        if (current.x < 0 || current.x > ctx.width ||
            current.y < 0 || current.y > ctx.height) {
            break;
        }

        points.push({ ...current });
    }

    return points;
}

/**
 * Smooth streamline using Catmull-Rom splines
 * @param {Array<{x: number, y: number}>} points - Input points
 * @returns {Array<{x: number, y: number}>} Smoothed points
 */
function smoothStreamline(points) {
    if (points.length < 4) return points;

    // Catmull-Rom spline smoothing
    const smooth = [];

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        // Sample curve with 5 points between each pair
        for (let t = 0; t < 1; t += 0.2) {
            const t2 = t * t;
            const t3 = t2 * t;

            const x = 0.5 * (
                (2 * p1.x) +
                (-p0.x + p2.x) * t +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
            );

            const y = 0.5 * (
                (2 * p1.y) +
                (-p0.y + p2.y) * t +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
            );

            smooth.push({ x, y });
        }
    }

    return smooth;
}

/**
 * Create SVG path element from streamline points
 * @param {Array<{x: number, y: number}>} points - Streamline points
 * @param {number} index - Streamline index
 * @param {number} total - Total number of streamlines
 * @param {PatternContext} ctx - Pattern context
 * @returns {SVGPathElement} Path element
 */
function createStreamlinePath(points, index, total, ctx) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
    }

    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', ctx.getLineColor(index, total));
    path.setAttribute('stroke-width', ctx.lineWidth);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-opacity', '0.7'); // Layering effect

    return path;
}

/**
 * Find high curl regions in the flow field
 * @param {Object} flowFieldData - Flow field data
 * @param {number} numRegions - Number of regions to return
 * @returns {Array<{x: number, y: number, curl: number}>} High curl regions
 */
function findHighCurlRegions(flowFieldData, numRegions) {
    const { field, cellSize, cols, rows } = flowFieldData;
    const regions = [];

    // Compute curl magnitude (Laplacian approximation)
    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            const left = field[y][x - 1];
            const right = field[y][x + 1];
            const top = field[y - 1][x];
            const bottom = field[y + 1][x];

            // Discrete curl magnitude
            const curl = Math.abs(
                (right.vy - left.vy) / 2 - (bottom.vx - top.vx) / 2
            );

            regions.push({
                x: x * cellSize,
                y: y * cellSize,
                curl: curl
            });
        }
    }

    // Sort by curl magnitude and return top regions
    regions.sort((a, b) => b.curl - a.curl);
    return regions.slice(0, numRegions);
}

/**
 * Highlight vortex cores in the pattern
 * @param {SVGGElement} layerGroup - Layer to add vortex cores to
 * @param {Object} flowFieldData - Flow field data
 * @param {PatternContext} ctx - Pattern context
 */
function highlightVortexCores(layerGroup, flowFieldData, ctx) {
    const cores = findHighCurlRegions(flowFieldData, 10);

    cores.forEach((core, i) => {
        if (i > 5) return; // Limit to top 5

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', core.x);
        circle.setAttribute('cy', core.y);
        circle.setAttribute('r', 3);
        circle.setAttribute('fill', ctx.getLineColor(i, 5));
        circle.setAttribute('fill-opacity', '0.5');

        layerGroup.appendChild(circle);
    });
}

const fractalNoise = {
    name: 'Fractal Noise',
    description: 'TURBULENT FLUX FIELD - Dynamic flow visualization with curl noise streamlines',
    category: 'mathematical',

    // Default slider values for this pattern
    defaults: {
        complexity: 150,
        frequency: 60,
        amplitude: 500
    },

    /**
     * Generate full-size pattern
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context
     */
    generate(layerGroup, ctx) {
        // === PARAMETERS ===
        const numStreamlines = mapComplexity(ctx.complexity); // 20-1000
        const integrationSteps = 50 + Math.floor(ctx.complexity * 0.8); // 50-290
        const noiseScale = mapFrequency(ctx.frequency); // 0.001-0.03
        const octaves = Math.floor(3 + (ctx.frequency / 20)); // 3-8
        const stepSize = Math.abs(ctx.amplitude) / 200 + 1.0; // 0.5-6.0
        const curlIntensity = 1.0 + (ctx.amplitude / 1000); // 0-2.0

        // === FLOW FIELD GENERATION ===
        const flowField = computeCurlNoiseField(
            ctx,
            noiseScale,
            octaves,
            curlIntensity,
            ctx.seed * 5 + ctx.slowAnimationTime * 0.1
        );

        // === SEED POINT DISTRIBUTION ===
        const seedPoints = distributeSeedPoints(
            ctx,
            numStreamlines,
            flowField,
            ctx.amplitude
        );

        // === STREAMLINE INTEGRATION ===
        seedPoints.forEach((seed, index) => {
            const streamline = traceStreamline(
                ctx,
                seed,
                flowField,
                integrationSteps,
                stepSize
            );

            if (streamline.length < 3) return;

            // Smooth the streamline with Catmull-Rom splines
            const smoothed = smoothStreamline(streamline);

            if (smoothed.length < 2) return;

            // Render as SVG path
            const path = createStreamlinePath(
                smoothed,
                index,
                numStreamlines,
                ctx
            );

            layerGroup.appendChild(path);
        });

        // === OPTIONAL: ADD VORTEX CORES ===
        if (ctx.complexity > 100) {
            highlightVortexCores(layerGroup, flowField, ctx);
        }

        if (ctx.currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${ctx.currentRotation} ${ctx.centerX} ${ctx.centerY})`);
        }
    },

    /**
     * Generate mini preview pattern
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     */
    generateMini(svg, ctx) {
        // Turbulent Topology thumbnail - complexity: 150, frequency: 60, amplitude: 500
        const width = 56;
        const height = 56;
        const numContours = 15; // complexity: 150 → 50 contours, scaled down for thumbnail
        const octaves = 5; // frequency: 60 → 5 octaves
        const cellSize = 3; // amplitude: 500 → moderate smoothing

        const gridWidth = Math.ceil(width / cellSize);
        const gridHeight = Math.ceil(height / cellSize);
        const noiseScale = 0.3; // frequency: 60 → 0.3 scale

        // Generate 2D fractal noise field
        const noiseField = [];
        let minNoise = Infinity, maxNoise = -Infinity;

        for (let gy = 0; gy < gridHeight; gy++) {
            const row = [];
            for (let gx = 0; gx < gridWidth; gx++) {
                // Use fbm if available on ctx, otherwise use basic perlin noise
                const noiseValue = ctx.perlin
                    ? ctx.perlin.noise(gx * noiseScale, gy * noiseScale, ctx.seed * 10)
                    : Math.sin(gx * noiseScale + ctx.seed) * Math.cos(gy * noiseScale + ctx.seed);
                row.push(noiseValue);
                minNoise = Math.min(minNoise, noiseValue);
                maxNoise = Math.max(maxNoise, noiseValue);
            }
            noiseField.push(row);
        }

        // Draw organic contour lines
        for (let contourIndex = 0; contourIndex < numContours; contourIndex++) {
            const t = contourIndex / (numContours - 1);
            const threshold = minNoise + (maxNoise - minNoise) * t;

            // Simple horizontal scan line contour tracing
            for (let y = 0; y < gridHeight - 1; y++) {
                let pathData = '';
                for (let x = 0; x < gridWidth - 1; x++) {
                    const current = noiseField[y][x];
                    const next = noiseField[y][x + 1];

                    if ((current < threshold && next >= threshold) || (current >= threshold && next < threshold)) {
                        const t = (threshold - current) / (next - current);
                        const px = (x + t) * cellSize;
                        const py = y * cellSize;

                        if (pathData === '') {
                            pathData = `M ${px} ${py}`;
                        } else {
                            pathData += ` L ${px} ${py}`;
                        }
                    }
                }

                if (pathData !== '') {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathData);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', ctx.getLineColor());
                    path.setAttribute('stroke-width', ctx.lineWidth * 0.4);
                    svg.appendChild(path);
                }
            }
        }
    }
};

// Self-register with the pattern registry
patternRegistry.register('fractal-noise', fractalNoise);

export default fractalNoise;
