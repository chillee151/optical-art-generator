// Perlin Noise implementation in JavaScript
// Based on Ken Perlin's Improved Noise reference implementation (2002)
// Ported from Java to JavaScript.

class PerlinNoise {
    constructor() {
        this.p = new Array(512);
        this.permutation = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }
        this._shuffle(this.permutation);
        for (let i = 0; i < 256; i++) {
            this.p[i] = this.permutation[i];
            this.p[i + 256] = this.permutation[i];
        }
    }

    _shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    _fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    _lerp(t, a, b) {
        return a + t * (b - a);
    }

    _grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;
        let Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this._fade(x);
        const v = this._fade(y);
        const w = this._fade(z);

        const A = this.p[X] + Y;
        const AA = this.p[A] + Z;
        const AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y;
        const BA = this.p[B] + Z;
        const BB = this.p[B + 1] + Z;

        return this._lerp(w,
            this._lerp(v,
                this._lerp(u, this._grad(this.p[AA], x, y, z),
                    this._grad(this.p[BA], x - 1, y, z)),
                this._lerp(u, this._grad(this.p[AB], x, y - 1, z),
                    this._grad(this.p[BB], x - 1, y - 1, z))),
            this._lerp(v,
                this._lerp(u, this._grad(this.p[AA + 1], x, y, z - 1),
                    this._grad(this.p[BA + 1], x - 1, y, z - 1)),
                this._lerp(u, this._grad(this.p[AB + 1], x, y - 1, z - 1),
                    this._grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    }
}

class OpticalArtGenerator {
    constructor() {
        try {
            this.canvas = document.getElementById('art-canvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            this.currentPattern = null;
            this.currentSeed = Math.random();
            this.aspectRatios = {
                '1:1': [1, 1],
                '16:9': [16, 9],
                '9:16': [9, 16],
                '3:4': [3, 4],
                '4:3': [4, 3],
                '2:3': [2, 3],
                '3:2': [3, 2]
            };
            this.artisticPalettes = {
                'stanczak_vibrations': ['#FFC700', '#00A1E4', '#E50000', '#FFFFFF', '#000000'],
                'riley_cool': ['#000000', '#FFFFFF', '#7C7C7C', '#A5A5A5', '#595959'],
                'albers_homage': ['#D9D9D9', '#F2B705', '#F29F05', '#F28705', '#F25C05'],
                'vasarely_zebra': ['#000000', '#FFFFFF']
            };
            this.isGenerating = false;
            this.isAnimating = false;
            this.animationFrameId = null;
            this.zoomLevel = 1;
            this.panX = 0;
            this.panY = 0;
        this.patternInfo = {
            'concentric-circles': 'Hypnotic wavy rings with golden ratio spacing, variable thickness, breathing effects, and alternating fills creating powerful depth illusion',
            'diagonal-stripes': 'Dynamic Op-Art stripes with wave distortion, variable thickness, and alternating fills creating chevron-like patterns with 3D depth',
            'cube-illusion': 'Creates mesmerizing isometric cube arrays with Escher-style impossible geometry, dynamic perspective, and wave-based depth modulation',
            'eye-pattern': 'Creates eye-like shapes with concentric curves for mesmerizing effects',
            'square-tunnel': '3D vortex tunnel with exponential perspective, spiral twist, alternating fills, and depth-based transformations rivaling Radial Vortex',
            'wave-displacement': 'Horizontal stripes displaced by sine waves creating bulging illusions',
            'circular-displacement': 'Straight lines warped by circular displacement fields',
            'moire-interference': 'Overlapping patterns creating moiré interference effects',
            'spiral-distortion': 'Radial patterns with spiral displacement creating depth',
            'perlin-displacement': 'Organic patterns from a Perlin noise field',
            'fractal-noise': 'Rich, detailed patterns from layered Perlin noise (fBm)',
            'de-jong-attractor': 'Chaotic patterns based on the De Jong strange attractor.',
            'cellular-automata': 'Emergent patterns from simple rule-based cellular automata.',
            'l-system-growth': 'Fractal-like branching structures generated by L-systems.',
            'shaded-grid': 'Creates a 3D-like grid pattern using mathematical shading to simulate depth and curvature.',
            'radial-vortex': 'Mesmerizing 3D tunnel effect with alternating bands radiating from center, creating powerful depth illusion.'
        };

            this.init();
        } catch (error) {
            console.error('Failed to initialize OpticalArtGenerator:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    init() {
        this.perlin = new PerlinNoise(); // Create a single instance
        this.setupTabs();
        this.setupEventListeners();
        this.updateSliderValues();
        this.updateCanvasSize();
        this.updatePatternInfo();
        this.generatePatternPreviews();
        this.generatePattern();
    }

    _fbm(x, y, z, octaves, persistence) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.perlin.noise(x * frequency, y * frequency, z) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        return total / maxValue;
    }

    setupTabs() {
        const tabContainer = document.querySelector('.tabs-nav');
        if (!tabContainer) return;

        tabContainer.addEventListener('click', (e) => {
            if (e.target.matches('.tab-link')) {
                const tabId = e.target.dataset.tab;

                document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                e.target.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            }
        });
    }

    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showSuccess(message) {
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #44aa44;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        successDiv.textContent = message;

        document.body.appendChild(successDiv);
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    generatePatternPreviews() {
        const previewContainer = document.getElementById('pattern-previews');
        if (!previewContainer) return;

        const patterns = [
            { id: 'wave-displacement', name: 'Wave' },
            { id: 'circular-displacement', name: 'Circular' },
            { id: 'perlin-displacement', name: 'Perlin' },
            { id: 'fractal-noise', name: 'Fractal' },
            { id: 'de-jong-attractor', name: 'Attractor' },
            { id: 'cellular-automata', name: 'Automata' },
            { id: 'l-system-growth', name: 'L-System' },
            { id: 'eye-pattern', name: 'Eye' },
            { id: 'moire-interference', name: 'Moiré' },
            { id: 'spiral-distortion', name: 'Spiral' },
            { id: 'concentric-circles', name: 'Circles' },
            { id: 'diagonal-stripes', name: 'Stripes' },
            { id: 'cube-illusion', name: 'Cube' },
            { id: 'square-tunnel', name: 'Tunnel' },
            { id: 'shaded-grid', name: 'Shaded' },
            { id: 'radial-vortex', name: 'Vortex' }
        ];

        previewContainer.innerHTML = '';

        patterns.forEach(pattern => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'pattern-preview';
            previewDiv.dataset.pattern = pattern.id;

            if (pattern.id === document.getElementById('pattern-type').value) {
                previewDiv.classList.add('active');
            }

            const svg = this.generateMiniPattern(pattern.id);
            previewDiv.appendChild(svg);

            const label = document.createElement('div');
            label.className = 'pattern-preview-label';
            label.textContent = pattern.name;

            const container = document.createElement('div');
            container.appendChild(previewDiv);
            container.appendChild(label);

            previewContainer.appendChild(container);

            previewDiv.addEventListener('click', () => {
                document.getElementById('pattern-type').value = pattern.id;
                this.updatePatternPreviews();
                this.updatePatternInfo();
                this.generatePattern();
            });
        });
    }

    updatePatternPreviews() {
        const currentPattern = document.getElementById('pattern-type').value;
        document.querySelectorAll('.pattern-preview').forEach(preview => {
            preview.classList.toggle('active', preview.dataset.pattern === currentPattern);
        });
    }

    generateMiniPattern(patternType) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '56');
        svg.setAttribute('height', '56');
        svg.setAttribute('viewBox', '0 0 56 56');
        svg.style.background = 'white';

        const miniSeed = 0.5; // Fixed seed for consistent previews
        const miniComplexity = 8;
        const miniLineWidth = 1;

        switch(patternType) {
            case 'concentric-circles':
                this.generateMiniConcentricCircles(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'diagonal-stripes':
                this.generateMiniDiagonalStripes(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'cube-illusion':
                this.generateMiniCubeIllusion(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'eye-pattern':
                this.generateMiniEyePattern(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'square-tunnel':
                this.generateMiniSquareTunnel(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'wave-displacement':
                this.generateMiniWaveDisplacement(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'circular-displacement':
                this.generateMiniCircularDisplacement(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'moire-interference':
                this.generateMiniMoireInterference(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'spiral-distortion':
                this.generateMiniSpiralDistortion(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'perlin-displacement':
                this.generateMiniPerlinDisplacement(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'fractal-noise':
                this.generateMiniFractalNoise(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'de-jong-attractor':
                this.generateMiniDeJongAttractor(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'cellular-automata':
                this.generateMiniCellularAutomata(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'l-system-growth':
                this.generateMiniLSystem(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'shaded-grid':
                this.generateMiniShadedGrid(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'radial-vortex':
                this.generateMiniRadialVortex(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
        }

        return svg;
    }

    generateMiniLSystem(svg, seed, complexity, lineWidth) {
        // Simplified L-System for preview
        const axiom = "F";
        const rules = { "F": "F[+F]F[-F]F" };
        const angle = 25; // Fixed angle for preview
        const iterations = 2; // Low iterations for quick preview
        let currentString = axiom;

        for (let i = 0; i < iterations; i++) {
            let nextString = "";
            for (let j = 0; j < currentString.length; j++) {
                const char = currentString[j];
                nextString += rules[char] || char;
            }
            currentString = nextString;
        }

        let x = 28, y = 50;
        let currentAngle = -90; // Start pointing up
        const step = 5; // Fixed step for preview
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
        path.setAttribute('stroke-width', lineWidth * 0.5);
        svg.appendChild(path);
    }

    generateMiniCellularAutomata(svg, seed, complexity, lineWidth) {
        const cellSize = 2;
        const width = 56;
        const height = 56;
        const cellsPerRow = width / cellSize;
        const numRows = height / cellSize;

        // Rule 30 for a classic chaotic pattern
        const ruleset = [0, 0, 0, 1, 1, 1, 1, 0]; // Rule 30

        let currentRow = new Array(cellsPerRow).fill(0);
        currentRow[Math.floor(cellsPerRow / 2)] = 1; // Start with a single live cell in the middle

        for (let r = 0; r < numRows; r++) {
            let nextRow = new Array(cellsPerRow).fill(0);
            for (let i = 0; i < cellsPerRow; i++) {
                const left = currentRow[(i - 1 + cellsPerRow) % cellsPerRow];
                const self = currentRow[i];
                const right = currentRow[(i + 1) % cellsPerRow];

                const ruleIndex = (left << 2) | (self << 1) | right; // Convert 3-bit pattern to index (0-7)
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

    generateMiniDeJongAttractor(svg, seed, complexity, lineWidth) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = "M 28 28";
        let x = 0, y = 0;
        const a = 1.4, b = -2.3, c = 2.4, d = -2.1;
        const scale = 10;

        for (let i = 0; i < 500; i++) {
            const x_new = Math.sin(a * y) - Math.cos(b * x);
            const y_new = Math.sin(c * x) - Math.cos(d * y);
            x = x_new;
            y = y_new;
            pathData += ` L ${28 + x * scale} ${28 + y * scale}`;
        }
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', lineWidth * 0.5);
        svg.appendChild(path);
    }

    generateMiniFractalNoise(svg, seed, complexity, lineWidth) {
        const spacing = 56 / complexity;
        for (let y = 0; y < 56 + spacing; y += spacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;
            for (let x = 0; x <= 56; x += 2) {
                const noiseVal = this._fbm(x * 0.1, y * 0.1, seed * 10, 3, 0.5);
                const displacement = noiseVal * 10;
                pathData += ` L ${x} ${y + displacement}`;
            }
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth);
            svg.appendChild(path);
        }
    }

    generateMiniPerlinDisplacement(svg, seed, complexity, lineWidth) {
        const perlin = new PerlinNoise();
        const spacing = 56 / complexity;
        for (let y = 0; y < 56 + spacing; y += spacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;
            for (let x = 0; x <= 56; x += 2) {
                const noiseVal = perlin.noise(x * 0.1, y * 0.1, seed * 10);
                const displacement = noiseVal * 10;
                pathData += ` L ${x} ${y + displacement}`;
            }
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth);
            svg.appendChild(path);
        }
    }

    generateMiniConcentricCircles(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const maxRadius = 26;
        const numRings = 12;

        for (let i = 0; i < numRings; i++) {
            const progress = i / numRings;
            const baseRadius = maxRadius * progress;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            const numPoints = 60;
            const angleStep = (Math.PI * 2) / numPoints;
            
            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Wave modulation
                const waveModulation = 1 + Math.sin(angle * 3) * 0.15;
                const radius = baseRadius * waveModulation;
                
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            pathData += ' Z';
            
            path.setAttribute('d', pathData);
            
            // Alternating styles
            if (i % 3 === 0) {
                path.setAttribute('fill', '#333');
                path.setAttribute('fill-opacity', '0.6');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.5);
            } else if (i % 3 === 1) {
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth);
            } else {
                path.setAttribute('fill', '#fff');
                path.setAttribute('fill-opacity', '0.3');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.3);
            }
            
            svg.appendChild(path);
        }
    }

    generateMiniDiagonalStripes(svg, seed, complexity, lineWidth) {
        const numStripes = 12;
        const spacing = 80 / numStripes;
        
        for (let i = 0; i < numStripes; i++) {
            const progress = i / numStripes;
            const basePosition = -40 + i * spacing;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            // Create wavy stripe
            const numPoints = 30;
            for (let t = 0; t <= 80; t += 80 / numPoints) {
                const x = basePosition + t * 0.707;
                const y = t * 0.707;
                const waveOffset = Math.sin(t * 0.1 + progress * Math.PI * 2) * 2;
                
                const finalX = x + waveOffset * 0.707;
                const finalY = y - waveOffset * 0.707;
                
                if (pathData === '') {
                    pathData = `M ${finalX} ${finalY}`;
                } else {
                    pathData += ` L ${finalX} ${finalY}`;
                }
            }
            
            // Close stripe with width
            const thickness = lineWidth * (0.5 + progress);
            for (let t = 80; t >= 0; t -= 80 / numPoints) {
                const x = basePosition + t * 0.707;
                const y = t * 0.707;
                const waveOffset = Math.sin(t * 0.1 + progress * Math.PI * 2) * 2;
                
                pathData += ` L ${x + waveOffset * 0.707 + thickness * 0.707} ${y - waveOffset * 0.707 + thickness * 0.707}`;
            }
            pathData += ' Z';
            
            path.setAttribute('d', pathData);
            
            // Alternating pattern
            if (i % 4 === 0) {
                path.setAttribute('fill', '#000');
            } else if (i % 4 === 1) {
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.5);
            } else if (i % 4 === 2) {
                path.setAttribute('fill', '#fff');
            } else {
                path.setAttribute('fill', '#666');
                path.setAttribute('fill-opacity', '0.6');
            }
            
            path.setAttribute('transform', 'rotate(45 28 28)');
            svg.appendChild(path);
        }
    }

    generateMiniSquareTunnel(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const numSquares = 20;

        for (let i = 0; i < numSquares; i++) {
            const progress = i / numSquares;
            const scale = Math.pow(1 - progress, 1.5);
            const squareSize = 44 * scale;
            const rotation = progress * 180; // Twist effect
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const half = squareSize / 2;
            
            const pathData = `M ${-half} ${-half} L ${half} ${-half} L ${half} ${half} L ${-half} ${half} Z`;
            path.setAttribute('d', pathData);
            
            // Alternating fills
            if (i % 2 === 0) {
                path.setAttribute('fill', '#000');
            } else {
                path.setAttribute('fill', '#fff');
            }
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.3);
            
            const transform = `translate(${centerX}, ${centerY}) rotate(${rotation})`;
            path.setAttribute('transform', transform);
            
            svg.appendChild(path);
        }
    }

    generateMiniWaveDisplacement(svg, seed, complexity, lineWidth) {
        const spacing = 56 / complexity;
        for (let y = 0; y < 56 + spacing; y += spacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;
            for (let x = 0; x <= 56; x += 2) {
                const wave = Math.sin((x / 56) * Math.PI * 4) * 3;
                pathData += ` L ${x} ${y + wave}`;
            }
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth);
            svg.appendChild(path);
        }
    }

    generateMiniEyePattern(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        for (let i = 0; i < complexity; i++) {
            const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            const rx = (20 / complexity) * (i + 1);
            const ry = (10 / complexity) * (i + 1);
            ellipse.setAttribute('cx', centerX);
            ellipse.setAttribute('cy', centerY);
            ellipse.setAttribute('rx', rx);
            ellipse.setAttribute('ry', ry);
            ellipse.setAttribute('fill', 'none');
            ellipse.setAttribute('stroke', '#000');
            ellipse.setAttribute('stroke-width', lineWidth);
            svg.appendChild(ellipse);
        }
    }

    generateMiniCircularDisplacement(svg, seed, complexity, lineWidth) {
        const spacing = 56 / complexity;
        for (let y = 0; y < 56 + spacing; y += spacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;
            for (let x = 0; x <= 56; x += 1) {
                const dx = x - 28;
                const dy = y - 28;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const displacement = Math.sin(distance * 0.3) * 2;
                pathData += ` L ${x + displacement} ${y}`;
            }
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth);
            svg.appendChild(path);
        }
    }

    generateMiniMoireInterference(svg, seed, complexity, lineWidth) {
        const spacing1 = 56 / complexity;
        const spacing2 = 56 / (complexity + 1);

        // First set
        for (let y = 0; y < 56 + spacing1; y += spacing1) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', 56);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth);
            svg.appendChild(line);
        }

        // Second set with slight angle
        for (let y = 0; y < 56 + spacing2; y += spacing2) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', 56);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth * 0.7);
            line.setAttribute('transform', 'rotate(5 28 28)');
            svg.appendChild(line);
        }
    }

    generateMiniSpiralDistortion(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const numLines = complexity;

        for (let i = 0; i < numLines; i++) {
            const baseAngle = (i / numLines) * Math.PI * 2;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M ${centerX} ${centerY}`;

            for (let r = 1; r <= 20; r += 2) {
                const spiralTwist = (r / 20) * Math.PI;
                const angle = baseAngle + spiralTwist;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                pathData += ` L ${x} ${y}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth);
            svg.appendChild(path);
        }
    }

    generateMiniCubeIllusion(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const gridSize = 3; // 3x3 grid for preview
        const baseSize = 12;
        
        // Create isometric cube grid
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const xOffset = col - gridSize / 2;
                const yOffset = row - gridSize / 2;
                
                // Isometric positioning
                const isoX = centerX + (xOffset - yOffset) * baseSize * 0.866;
                const isoY = centerY + (xOffset + yOffset) * baseSize * 0.5;
                
                // Vary size slightly for depth
                const distFromCenter = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
                const sizeScale = 0.8 + 0.2 * (1 - distFromCenter / 2);
                const cubeSize = baseSize * sizeScale;
                
                // Draw isometric cube
                this.drawMiniIsometricCube(svg, isoX, isoY, cubeSize, lineWidth, (row + col) % 2 === 0);
            }
        }
    }

    drawMiniIsometricCube(svg, centerX, centerY, size, lineWidth, shouldFlip) {
        const angle = Math.PI / 6; // 30 degrees
        const cos30 = Math.cos(angle);
        const sin30 = Math.sin(angle);
        const halfSize = size / 2;
        const flipMult = shouldFlip ? -1 : 1;
        
        // Calculate vertices
        const vertices = [
            { x: centerX - halfSize * cos30 * flipMult, y: centerY + halfSize * sin30 + halfSize },
            { x: centerX + halfSize * cos30 * flipMult, y: centerY - halfSize * sin30 + halfSize },
            { x: centerX + halfSize * cos30 * flipMult, y: centerY - halfSize * sin30 - halfSize },
            { x: centerX - halfSize * cos30 * flipMult, y: centerY + halfSize * sin30 - halfSize },
            { x: centerX - halfSize * cos30 * flipMult, y: centerY + halfSize * sin30 },
            { x: centerX + halfSize * cos30 * flipMult, y: centerY - halfSize * sin30 },
            { x: centerX + halfSize * cos30 * flipMult, y: centerY - halfSize * sin30 - size },
            { x: centerX - halfSize * cos30 * flipMult, y: centerY + halfSize * sin30 - size }
        ];

        // Draw three visible faces
        // Top face
        const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        topFace.setAttribute('d', `M ${vertices[3].x} ${vertices[3].y} L ${vertices[2].x} ${vertices[2].y} L ${vertices[6].x} ${vertices[6].y} L ${vertices[7].x} ${vertices[7].y} Z`);
        topFace.setAttribute('fill', '#888');
        topFace.setAttribute('stroke', '#000');
        topFace.setAttribute('stroke-width', lineWidth * 0.5);
        svg.appendChild(topFace);

        // Left face
        const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leftFace.setAttribute('d', `M ${vertices[0].x} ${vertices[0].y} L ${vertices[3].x} ${vertices[3].y} L ${vertices[7].x} ${vertices[7].y} L ${vertices[4].x} ${vertices[4].y} Z`);
        leftFace.setAttribute('fill', '#666');
        leftFace.setAttribute('stroke', '#000');
        leftFace.setAttribute('stroke-width', lineWidth * 0.5);
        svg.appendChild(leftFace);

        // Right face
        const rightFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightFace.setAttribute('d', `M ${vertices[1].x} ${vertices[1].y} L ${vertices[2].x} ${vertices[2].y} L ${vertices[6].x} ${vertices[6].y} L ${vertices[5].x} ${vertices[5].y} Z`);
        rightFace.setAttribute('fill', '#aaa');
        rightFace.setAttribute('stroke', '#000');
        rightFace.setAttribute('stroke-width', lineWidth * 0.5);
        svg.appendChild(rightFace);
    }

    generateMiniShadedGrid(svg, seed, complexity, lineWidth) {
        const width = 56;
        const height = 56;
        const cellSize = Math.max(4, Math.floor(width / (complexity * 0.7))); // Larger cells for better visibility
        const lightAngle = Math.PI / 4; // 45 degrees, top-left light
        const lightDirX = Math.cos(lightAngle);
        const lightDirY = Math.sin(lightAngle);

        // Draw cell by cell instead of pixel by pixel for better performance
        for (let cellY = 0; cellY < height; cellY += cellSize) {
            for (let cellX = 0; cellX < width; cellX += cellSize) {
                // Calculate cell center
                const centerX = cellX + cellSize / 2;
                const centerY = cellY + cellSize / 2;
                
                // Distance from canvas center creates depth variation
                const distFromCenter = Math.sqrt(
                    Math.pow(centerX - width/2, 2) + 
                    Math.pow(centerY - height/2, 2)
                );
                const maxDist = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
                const depthFactor = 0.3 + 0.7 * (1 - distFromCenter / maxDist); // Edges darker
                
                // Calculate lighting based on cell position
                const normX = (centerX - width/2) / (width/2);
                const normY = (centerY - height/2) / (height/2);
                
                // Simulate 3D bump with lighting
                const dotProduct = normX * lightDirX + normY * lightDirY;
                const baseBrightness = 0.4 + 0.4 * dotProduct * depthFactor;
                
                // Add some variation
                const variation = Math.sin(centerX * 0.3 + seed) * 0.15;
                const finalBrightness = Math.max(0.1, Math.min(0.9, baseBrightness + variation));
                
                const colorComponent = Math.floor(finalBrightness * 255);
                
                // Draw the cell
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', cellX);
                rect.setAttribute('y', cellY);
                rect.setAttribute('width', Math.min(cellSize, width - cellX));
                rect.setAttribute('height', Math.min(cellSize, height - cellY));
                rect.setAttribute('fill', `rgb(${colorComponent}, ${colorComponent}, ${colorComponent})`);
                rect.setAttribute('stroke', '#666');
                rect.setAttribute('stroke-width', '0.5');
                svg.appendChild(rect);
            }
        }
    }

    generateMiniRadialVortex(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const numPetals = 6; // Number of lobes in the flower pattern
        const numBands = 40; // Number of alternating bands
        
        // Create the vortex pattern using polar coordinates
        for (let band = 0; band < numBands; band++) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            const innerRadius = band * 1.5;
            const outerRadius = (band + 1) * 1.5;
            
            // Create smooth curves for each petal
            for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
                // Modulate radius based on angle to create petals
                const petalModulation = Math.sin(angle * numPetals) * 0.3 + 1;
                const r = innerRadius * petalModulation;
                
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                
                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            
            // Close the path
            pathData += ' Z';
            
            // Create outer path
            let outerPathData = '';
            for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
                const petalModulation = Math.sin(angle * numPetals) * 0.3 + 1;
                const r = outerRadius * petalModulation;
                
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                
                if (outerPathData === '') {
                    outerPathData = `M ${x} ${y}`;
                } else {
                    outerPathData += ` L ${x} ${y}`;
                }
            }
            outerPathData += ' Z';
            
            // Combine paths for filled region
            path.setAttribute('d', pathData + ' ' + outerPathData);
            path.setAttribute('fill', band % 2 === 0 ? '#000' : '#fff');
            path.setAttribute('stroke', 'none');
            path.setAttribute('fill-rule', 'evenodd');
            svg.appendChild(path);
        }
    }

    setupEventListeners() {
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.currentSeed = Math.random();
            this.generatePattern(true);
        });

        document.getElementById('variation-btn').addEventListener('click', () => {
            this.currentSeed += 0.1;
            this.generatePattern(true);
        });

        document.getElementById('layer-btn').addEventListener('click', () => {
            this.currentSeed = Math.random();
            this.generatePattern(false);
        });

        document.getElementById('export-svg-btn').addEventListener('click', () => {
            this.exportSVG();
        });

        document.getElementById('export-png-btn').addEventListener('click', () => {
            this.exportImage('png');
        });

        document.getElementById('export-jpg-btn').addEventListener('click', () => {
            this.exportImage('jpeg');
        });

        document.getElementById('pattern-type').addEventListener('change', () => {
            this.updatePatternPreviews();
            this.updatePatternInfo();
            this.generatePattern(true);
        });

        document.getElementById('complexity').addEventListener('input', (e) => {
            document.getElementById('complexity-value').textContent = e.target.value;
            this.generatePattern(true);
        });

        document.getElementById('line-width').addEventListener('input', (e) => {
            document.getElementById('line-width-value').textContent = e.target.value;
            this.generatePattern(true);
        });

        document.getElementById('frequency').addEventListener('input', (e) => {
            document.getElementById('frequency-value').textContent = e.target.value;
            this.generatePattern(true);
        });

        document.getElementById('amplitude').addEventListener('input', (e) => {
            document.getElementById('amplitude-value').textContent = e.target.value;
            this.generatePattern(true);
        });

        document.getElementById('rotation').addEventListener('input', (e) => {
            document.getElementById('rotation-value').textContent = e.target.value + '°';
            this.generatePattern(true);
        });

        document.getElementById('format-preset').addEventListener('change', () => {
            this.updateCanvasSize();
            this.generatePattern(true);
        });

        document.getElementById('size').addEventListener('input', () => {
            this.updateCanvasSize();
            this.generatePattern(true);
        });

        document.getElementById('color-mode').addEventListener('change', () => {
            this.toggleColorControls();
            this.generatePattern(true);
        });

        document.getElementById('line-color').addEventListener('change', () => {
            this.generatePattern(true);
        });

        document.getElementById('gradient-color-1').addEventListener('change', () => {
            this.generatePattern(true);
        });

        document.getElementById('gradient-color-2').addEventListener('change', () => {
            this.generatePattern(true);
        });

        document.getElementById('animate-pattern').addEventListener('change', (e) => {
            this.isAnimating = e.target.checked;
            if (this.isAnimating) {
                this.startAnimation();
            } else {
                this.stopAnimation();
            }
        });

        document.getElementById('zoom-in-btn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.zoomOut());
        document.getElementById('reset-zoom-btn').addEventListener('click', () => this.resetZoom());

        // Save/Load pattern event listeners
        document.getElementById('save-pattern-btn').addEventListener('click', () => {
            this.showSaveModal();
        });

        document.getElementById('load-pattern-btn').addEventListener('click', () => {
            this.loadRandomPattern();
        });

        document.getElementById('manage-patterns-btn').addEventListener('click', () => {
            this.showManageModal();
        });

        document.getElementById('confirm-save-btn').addEventListener('click', () => {
            this.saveCurrentPattern();
        });

        // Modal close event listeners
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    startAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime; // elapsedTime is in milliseconds
            this.slowAnimationTime = elapsedTime / 10000; // Progress 10 times slower than seconds

            this.generatePattern(true, this.slowAnimationTime); // Pass slowAnimationTime

            if (this.isAnimating) {
                this.animationFrameId = requestAnimationFrame(animate);
            }
        };
        this.animationFrameId = requestAnimationFrame(animate);
    }

    stopAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    updateSliderValues() {
        document.getElementById('complexity-value').textContent =
            document.getElementById('complexity').value;
        document.getElementById('line-width-value').textContent =
            document.getElementById('line-width').value;
        document.getElementById('frequency-value').textContent =
            document.getElementById('frequency').value;
        document.getElementById('amplitude-value').textContent =
            document.getElementById('amplitude').value;
        document.getElementById('rotation-value').textContent =
            document.getElementById('rotation').value + '°';
    }

    toggleColorControls() {
        const colorMode = document.getElementById('color-mode').value;
        const singleColorGroup = document.getElementById('single-color-group');
        const customGradientGroup = document.getElementById('custom-gradient-group');

        singleColorGroup.style.display = (colorMode === 'single') ? 'block' : 'none';
        customGradientGroup.style.display = (colorMode === 'custom-gradient') ? 'block' : 'none';
    }

    getLineColor(index = 0, total = 1) {
        const colorMode = document.getElementById('color-mode').value;

        switch(colorMode) {
            case 'black':
                return '#000';
            case 'single':
                return document.getElementById('line-color').value;
            case 'custom-gradient':
                const colorStartHex = document.getElementById('gradient-color-1').value;
                const colorEndHex = document.getElementById('gradient-color-2').value;

                const hexToRgb = (hex) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0,0,0];
                };

                const colorStart = hexToRgb(colorStartHex);
                const colorEnd = hexToRgb(colorEndHex);

                const ratio = total > 1 ? index / (total - 1) : 0;
                
                const r = Math.round(colorStart[0] + ratio * (colorEnd[0] - colorStart[0]));
                const g = Math.round(colorStart[1] + ratio * (colorEnd[1] - colorStart[1]));
                const b = Math.round(colorStart[2] + ratio * (colorEnd[2] - colorStart[2]));

                return `rgb(${r}, ${g}, ${b})`;
            case 'gradient':
                const gradRatio = total > 1 ? index / (total - 1) : 0;
                const hue = gradRatio * 270; // Blue to red
                return `hsl(${hue}, 70%, 50%)`;
            case 'rainbow':
                const rainbowHue = (index * 137.5) % 360; // Golden angle for even distribution
                return `hsl(${rainbowHue}, 80%, 50%)`;
            case 'hue-shift':
                const baseHue = (this.currentSeed * 360) % 360;
                const shiftedHue = (baseHue + index * 10) % 360;
                return `hsl(${shiftedHue}, 75%, 55%)`;
            case 'artistic':
                const paletteNames = Object.keys(this.artisticPalettes);
                const paletteIndex = Math.floor(this.seededRandom(this.currentSeed) * paletteNames.length);
                const selectedPalette = this.artisticPalettes[paletteNames[paletteIndex]];
                return selectedPalette[index % selectedPalette.length];
            default:
                return '#000';
        }
    }

    updatePatternInfo() {
        const patternType = document.getElementById('pattern-type').value;
        document.getElementById('pattern-info').textContent =
            this.patternInfo[patternType];
    }

    updateCanvasSize() {
        const formatPreset = document.getElementById('format-preset').value;
        const baseSize = parseInt(document.getElementById('size').value);

        let width, height;

        if (formatPreset === 'custom') {
            width = height = baseSize;
        } else {
            const [ratioW, ratioH] = this.aspectRatios[formatPreset];
            // Scale to ensure the larger dimension equals baseSize
            const scale = baseSize / Math.max(ratioW, ratioH);
            width = Math.round(ratioW * scale);
            height = Math.round(ratioH * scale);
        }

        // Convert mm to pixels for display (using 96 DPI standard: 1mm = ~3.78 pixels)
        const pixelScale = 3.78;
        const displayWidth = Math.round(width * pixelScale);
        const displayHeight = Math.round(height * pixelScale);

        this.canvas.setAttribute('width', displayWidth);
        this.canvas.setAttribute('height', displayHeight);
        this.canvas.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Update the dimensions display
        document.getElementById('canvas-dimensions').textContent = `${width}×${height} mm`;

        // Store actual dimensions for export
        this.actualWidth = width;
        this.actualHeight = height;
        this.updateViewBox();
    }

    updateViewBox() {
        const currentWidth = this.actualWidth / this.zoomLevel;
        const currentHeight = this.actualHeight / this.zoomLevel;
        const viewBoxX = (this.actualWidth / 2) - (currentWidth / 2) + this.panX;
        const viewBoxY = (this.actualHeight / 2) - (currentHeight / 2) + this.panY;
        this.canvas.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${currentWidth} ${currentHeight}`);
    }

    zoomIn() {
        this.zoomLevel *= 1.2;
        this.updateViewBox();
    }

    zoomOut() {
        this.zoomLevel /= 1.2;
        if (this.zoomLevel < 0.1) this.zoomLevel = 0.1; // Prevent too much zoom out
        this.updateViewBox();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateViewBox();
    }

    generatePattern(clear = true, slowAnimationTime = 0) {
        if (this.isGenerating) {
            return;
        }

        try {
            this.isGenerating = true;
            this.canvas.classList.add('optical-loading');

            setTimeout(() => {
                try {
                    if (clear) {
                        this.clearCanvas();
                    }
                    const patternType = document.getElementById('pattern-type').value;

                    if (!patternType) {
                        throw new Error('No pattern type selected');
                    }

                    // Create a group for the new layer
                    const layerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    this.canvas.appendChild(layerGroup);

                    // Apply global rotation if animating
                    let currentRotation = parseInt(document.getElementById('rotation').value);
                    if (this.isAnimating) {
                        currentRotation = (currentRotation + slowAnimationTime * 0.5) % 360; // Rotate 0.5 degrees per second
                    }

                    switch(patternType) {
                        case 'wave-displacement':
                            this.generateWaveDisplacement(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'circular-displacement':
                            this.generateCircularDisplacement(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'eye-pattern':
                            this.generateAdvancedEyePattern(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'moire-interference':
                            this.generateMoireInterference(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'spiral-distortion':
                            this.generateSpiralDistortion(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'concentric-circles':
                            this.generateConcentricCircles(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'diagonal-stripes':
                            this.generateDiagonalStripes(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'cube-illusion':
                            this.generateCubeIllusion(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'square-tunnel':
                            this.generateSquareTunnel(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'perlin-displacement':
                            this.generatePerlinDisplacement(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'fractal-noise':
                            this.generateFractalNoisePattern(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'de-jong-attractor':
                            this.generateDeJongAttractor(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'cellular-automata':
                            this.generateCellularAutomata(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'l-system-growth':
                            this.generateLSystem(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'shaded-grid':
                            this.generateShadedGrid(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'radial-vortex':
                            this.generateRadialVortex(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        default:
                            throw new Error(`Unknown pattern type: ${patternType}`);
                    }
                } catch (error) {
                    console.error('Error generating pattern:', error);
                    this.showError(`Failed to generate pattern: ${error.message}`);
                } finally {
                    this.canvas.classList.remove('optical-loading');
                    this.isGenerating = false;
                    this.updateViewBox(); // Apply current zoom/pan after generation
                }
            }, 100);
        } catch (error) {
            console.error('Error in generatePattern:', error);
            this.showError('Failed to start pattern generation');
            this.isGenerating = false;
        }
    }

    generateLSystem(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const frequency = parseInt(document.getElementById('frequency').value); // Angle
        const amplitude = parseInt(document.getElementById('amplitude').value); // Segment Length
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // L-System rules (Fractal Tree example)
        const axiom = "X";
        const rules = {
            "X": "F[+X][-X]FX",
            "F": "FF"
        };
        const angle = frequency + Math.sin(slowAnimationTime * 0.02) * 5; // Animate angle slightly
        let iterations = Math.max(1, Math.floor(complexity / 100)); // Use complexity for iterations
        const maxIterations = 8; // Safeguard to prevent browser crashes

        if (iterations > maxIterations) {
            console.warn(`L-System iterations capped at ${maxIterations} to prevent browser crash.`);
            this.showError(`L-System iterations capped at ${maxIterations} for stability.`);
            iterations = maxIterations;
        }

        const segmentLength = Math.max(1, Math.floor(amplitude / 10)); // Use amplitude for segment length

        let currentString = axiom;

        for (let i = 0; i < iterations; i++) {
            let nextString = "";
            for (let j = 0; j < currentString.length; j++) {
                const char = currentString[j];
                nextString += rules[char] || char;
            }
            currentString = nextString;
        }

        let x = centerX, y = this.actualHeight; // Start at bottom center
        let currentAngle = -90; // Start pointing up
        const stack = [];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = `M ${x} ${y}`;

        let lineIndex = 0;
        for (let i = 0; i < currentString.length; i++) {
            const char = currentString[i];
            switch (char) {
                case 'F':
                    const x1 = x + segmentLength * Math.cos(currentAngle * Math.PI / 180);
                    const y1 = y + segmentLength * Math.sin(currentAngle * Math.PI / 180);
                    pathData += ` L ${x1} ${y1}`;
                    x = x1;
                    y = y1;
                    lineIndex++;
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
        path.setAttribute('stroke', this.getLineColor(0, 1)); // L-Systems are usually single color
        path.setAttribute('stroke-width', lineWidth);
        path.style.strokeLinecap = 'round';
        path.style.strokeLinejoin = 'round';

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }

        layerGroup.appendChild(path);
    }

    generateCellularAutomata(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const frequency = parseInt(document.getElementById('frequency').value); // Use frequency for rule selection
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        const cellSize = Math.max(1, Math.floor(Math.min(this.actualWidth, this.actualHeight) / complexity));
        const cellsPerRow = Math.floor(this.actualWidth / cellSize);
        const numRows = Math.floor(this.actualHeight / cellSize);

        // Determine ruleset based on frequency slider (1-100) and slowAnimationTime
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
        currentRow[Math.floor(cellsPerRow / 2)] = 1; // Start with a single live cell in the middle

        for (let r = 0; r < numRows; r++) {
            let nextRow = new Array(cellsPerRow).fill(0);
            for (let i = 0; i < cellsPerRow; i++) {
                const left = currentRow[(i - 1 + cellsPerRow) % cellsPerRow];
                const self = currentRow[i];
                const right = currentRow[(i + 1) % cellsPerRow];

                const ruleIndex = (left << 2) | (self << 1) | right; // Convert 3-bit pattern to index (0-7)
                nextRow[i] = ruleset[ruleIndex];

                if (nextRow[i] === 1) {
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', i * cellSize);
                    rect.setAttribute('y', r * cellSize);
                    rect.setAttribute('width', cellSize);
                    rect.setAttribute('height', cellSize);
                    rect.setAttribute('fill', this.getLineColor(r, numRows));
                    rect.setAttribute('stroke', 'none'); // No stroke for solid cells
                    layerGroup.appendChild(rect);
                }
            }
            currentRow = nextRow;
        }

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }
    }

    generateDeJongAttractor(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use sliders and slowAnimationTime to influence the attractor's parameters
        const a = -2.0 + (this.seededRandom(this.currentSeed + slowAnimationTime * 0.001) * 4.0) * (frequency / 100.0);
        const b = -2.0 + (this.seededRandom(this.currentSeed + 0.1 + slowAnimationTime * 0.001) * 4.0) * (amplitude / 1000.0);
        const c = -2.5 + (this.seededRandom(this.currentSeed + 0.2 + slowAnimationTime * 0.001) * 5.0);
        const d = -2.5 + (this.seededRandom(this.currentSeed + 0.3 + slowAnimationTime * 0.001) * 5.0);

        const iterations = complexity * 100;
        const scale = Math.min(this.actualWidth, this.actualHeight) / 4;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = "";
        let x = 0, y = 0;

        for (let i = 0; i < iterations; i++) {
            const x_new = Math.sin(a * y) - Math.cos(b * x);
            const y_new = Math.sin(c * x) - Math.cos(d * y);
            x = x_new;
            y = y_new;

            const pointX = centerX + x * scale;
            const pointY = centerY + y * scale;

            if (i === 0) {
                pathData += `M ${pointX} ${pointY}`;
            } else {
                pathData += ` L ${pointX} ${pointY}`;
            }
        }

        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this.getLineColor(0, 1)); // De Jong is usually single color
        path.setAttribute('stroke-width', lineWidth);
        path.style.strokeLinecap = 'round';
        path.style.strokeLinejoin = 'round';

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }

        layerGroup.appendChild(path);
    }

    generateFractalNoisePattern(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        const lineSpacing = this.actualHeight / complexity;
        const totalLines = Math.ceil(this.actualHeight / lineSpacing);
        const noiseScale = frequency / 1000;
        const octaves = Math.max(1, Math.floor(complexity / 100)); // Link octaves to complexity

        let lineIndex = 0;
        for (let y = 0; y < this.actualHeight + lineSpacing; y += lineSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= this.actualWidth; x += 5) {
                const noiseVal = this._fbm(x * noiseScale, y * noiseScale, this.currentSeed * 5 + slowAnimationTime * 0.1, octaves, 0.5);
                const displacement = noiseVal * amplitude;
                pathData += ` L ${x} ${y + displacement}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.getLineColor(lineIndex, totalLines));
            path.setAttribute('stroke-width', lineWidth);

            if (currentRotation !== 0) {
                path.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
            lineIndex++;
        }
    }

    clearCanvas() {
        while (this.canvas.firstChild) {
            this.canvas.removeChild(this.canvas.firstChild);
        }
    }

    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0,0,0];
    }

    colorToRgb(color) {
        // Handle hex colors
        if (color.startsWith('#')) {
            return this.hexToRgb(color);
        }
        
        // Handle rgb(r, g, b) format
        const rgbMatch = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);
        if (rgbMatch) {
            return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
        }
        
        // Handle hsl(h, s%, l%) format - convert to RGB
        const hslMatch = /hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/.exec(color);
        if (hslMatch) {
            const h = parseFloat(hslMatch[1]) / 360;
            const s = parseFloat(hslMatch[2]) / 100;
            const l = parseFloat(hslMatch[3]) / 100;
            
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        
        // Default to black if format is unrecognized
        return [0, 0, 0];
    }

    generatePerlinDisplacement(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        const lineSpacing = this.actualHeight / complexity;
        const totalLines = Math.ceil(this.actualHeight / lineSpacing);
        const noiseScale = frequency / 1000;

        let lineIndex = 0;
        for (let y = 0; y < this.actualHeight + lineSpacing; y += lineSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= this.actualWidth; x += 5) {
                const noiseVal = this.perlin.noise(x * noiseScale, y * noiseScale, this.currentSeed * 5 + slowAnimationTime * 0.1);
                const displacement = noiseVal * amplitude;
                pathData += ` L ${x} ${y + displacement}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.getLineColor(lineIndex, totalLines));
            path.setAttribute('stroke-width', lineWidth);

            if (currentRotation !== 0) {
                path.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
            lineIndex++;
        }
    }

    generateConcentricCircles(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;
        const maxRadius = Math.min(this.actualWidth, this.actualHeight) * 0.48;

        // Use complexity for number of rings
        const numRings = Math.max(10, complexity);
        
        // Use amplitude for wave modulation intensity
        const waveIntensity = amplitude / 100;
        
        // Use frequency for wave count (breathing effect)
        const waveCount = Math.max(2, Math.floor(frequency / 20));
        
        // Golden ratio for natural spacing (optional enhancement)
        const phi = (1 + Math.sqrt(5)) / 2;
        const useGoldenRatio = frequency > 50; // Use golden ratio at higher frequencies

        for (let i = 0; i < numRings; i++) {
            const progress = i / numRings;
            
            // Calculate radius with optional golden ratio spacing
            let baseRadius;
            if (useGoldenRatio) {
                baseRadius = maxRadius * (Math.pow(progress, 1 / phi));
            } else {
                baseRadius = maxRadius * progress;
            }
            
            // Create wavy circle using path for more control
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            const numPoints = 180; // High resolution for smooth curves
            const angleStep = (Math.PI * 2) / numPoints;
            
            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Add wave modulation for organic breathing effect
                const waveModulation = 1 + Math.sin(angle * waveCount + progress * Math.PI * 2) * waveIntensity * 0.2;
                const radius = baseRadius * waveModulation;
                
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            pathData += ' Z';
            
            path.setAttribute('d', pathData);
            
            // Variable thickness based on radius (thinner toward center)
            const thickness = lineWidth * (0.5 + progress * 0.5);
            
            // Alternating fills for hypnotic depth effect
            const colorIndex = i;
            const color = this.getLineColor(colorIndex, numRings);
            const colorMode = document.getElementById('color-mode').value;
            
            if (i % 3 === 0) {
                // Every third ring: filled
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.6');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', thickness);
            } else if (i % 3 === 1) {
                // Every third ring: outline only
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', thickness);
            } else {
                // Every third ring: semi-transparent
                if (colorMode === 'black') {
                    path.setAttribute('fill', '#fff');
                    path.setAttribute('fill-opacity', '0.3');
                    path.setAttribute('stroke', '#000');
                    path.setAttribute('stroke-width', thickness * 0.5);
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.3');
                    path.setAttribute('stroke', color);
                    path.setAttribute('stroke-width', thickness * 0.5);
                }
            }
            
            if (rotation !== 0) {
                const ringRotation = rotation + progress * 45; // Progressive rotation
                path.setAttribute('transform', `rotate(${ringRotation} ${centerX} ${centerY})`);
            }
            
            layerGroup.appendChild(path);
        }
        
        // Add center focal point
        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', centerX);
        centerCircle.setAttribute('cy', centerY);
        centerCircle.setAttribute('r', Math.max(3, lineWidth * 2));
        centerCircle.setAttribute('fill', this.getLineColor(0, 1));
        layerGroup.appendChild(centerCircle);
    }

    generateDiagonalStripes(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;
        
        const maxDimension = Math.sqrt(this.actualWidth * this.actualWidth + this.actualHeight * this.actualHeight);
        
        // Use complexity for number of stripes
        const numStripes = Math.max(10, complexity);
        const spacing = maxDimension / numStripes;
        
        // Use amplitude for wave distortion intensity
        const waveIntensity = amplitude / 50;
        
        // Use frequency for wave frequency along stripes
        const waveFrequency = frequency / 10;
        
        // Create Op-Art chevron effect with alternating fills
        for (let i = 0; i < numStripes; i++) {
            const progress = i / numStripes;
            const basePosition = -maxDimension * 0.5 + i * spacing;
            
            // Create wavy stripe using path
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            // Generate points along the stripe with wave distortion
            const numPoints = 100;
            const length = maxDimension * 1.5;
            const step = length / numPoints;
            
            // Draw top edge of stripe
            for (let t = 0; t <= length; t += step) {
                const x = basePosition + t * Math.cos(Math.PI / 4);
                const y = t * Math.sin(Math.PI / 4);
                
                // Add wave distortion perpendicular to stripe direction
                const waveOffset = Math.sin(t * 0.01 * waveFrequency + progress * Math.PI * 2) * waveIntensity;
                const offsetX = waveOffset * Math.cos(Math.PI / 4 + Math.PI / 2);
                const offsetY = waveOffset * Math.sin(Math.PI / 4 + Math.PI / 2);
                
                const finalX = x + offsetX;
                const finalY = y + offsetY;
                
                if (pathData === '') {
                    pathData = `M ${finalX} ${finalY}`;
                } else {
                    pathData += ` L ${finalX} ${finalY}`;
                }
            }
            
            // Variable thickness for depth
            const thickness = lineWidth * (0.5 + progress * 1.5);
            
            // Draw bottom edge of stripe (in reverse to create filled shape)
            for (let t = length; t >= 0; t -= step) {
                const x = basePosition + t * Math.cos(Math.PI / 4);
                const y = t * Math.sin(Math.PI / 4);
                
                const waveOffset = Math.sin(t * 0.01 * waveFrequency + progress * Math.PI * 2) * waveIntensity;
                const offsetX = waveOffset * Math.cos(Math.PI / 4 + Math.PI / 2);
                const offsetY = waveOffset * Math.sin(Math.PI / 4 + Math.PI / 2);
                
                // Offset for stripe width
                const widthOffsetX = thickness * Math.cos(Math.PI / 4 + Math.PI / 2);
                const widthOffsetY = thickness * Math.sin(Math.PI / 4 + Math.PI / 2);
                
                const finalX = x + offsetX + widthOffsetX;
                const finalY = y + offsetY + widthOffsetY;
                
                pathData += ` L ${finalX} ${finalY}`;
            }
            
            pathData += ' Z';
            path.setAttribute('d', pathData);
            
            // Op-Art alternating pattern
            const colorIndex = i;
            const color = this.getLineColor(colorIndex, numStripes);
            const colorMode = document.getElementById('color-mode').value;
            
            if (i % 4 === 0) {
                // Filled stripes
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '1');
                path.setAttribute('stroke', 'none');
            } else if (i % 4 === 1) {
                // Outlined stripes
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth);
            } else if (i % 4 === 2) {
                // White/light stripes for contrast
                if (colorMode === 'black') {
                    path.setAttribute('fill', '#fff');
                    path.setAttribute('fill-opacity', '1');
                    path.setAttribute('stroke', 'none');
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.3');
                    path.setAttribute('stroke', 'none');
                }
            } else {
                // Gradient-like effect with semi-transparent
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.6');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth * 0.3);
            }
            
            // Apply rotation
            const angle = 45 + rotation;
            path.setAttribute('transform', `rotate(${angle} ${centerX} ${centerY})`);
            
            layerGroup.appendChild(path);
        }
    }

    generateCubeIllusion(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use complexity to determine grid density
        const gridDensity = Math.max(2, Math.floor(complexity / 15));
        const baseSize = Math.min(this.actualWidth, this.actualHeight) / (gridDensity + 2);

        // Create isometric cube grid with depth illusion
        for (let row = 0; row < gridDensity; row++) {
            for (let col = 0; col < gridDensity; col++) {
                const index = row * gridDensity + col;
                
                // Calculate position with perspective
                const xOffset = col - gridDensity / 2;
                const yOffset = row - gridDensity / 2;
                
                // Create isometric positioning
                const isoX = centerX + (xOffset - yOffset) * baseSize * 0.866; // sqrt(3)/2 for 30° angle
                const isoY = centerY + (xOffset + yOffset) * baseSize * 0.5;
                
                // Dynamic cube size based on distance and mathematical functions
                const distFromCenter = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
                const maxDist = Math.sqrt(2) * gridDensity / 2;
                
                // Use frequency for wave-based size modulation
                const waveEffect = Math.sin(distFromCenter * frequency * 0.1 + this.currentSeed * 10) * 0.3;
                
                // Use amplitude for depth scaling
                const depthScale = 0.6 + 0.4 * (1 - distFromCenter / maxDist) * (amplitude / 50);
                const sizeScale = (0.7 + waveEffect) * depthScale;
                
                const cubeSize = baseSize * sizeScale;
                
                // Determine cube orientation (some flip to create Escher-like effect)
                const shouldFlip = (row + col) % 2 === 0;
                const orientationFactor = this.seededRandom(this.currentSeed + index) > 0.5 ? 1 : -1;
                
                // Calculate rotation angle for variety
                const rotationAngle = (index * frequency * 0.5) % 90;
                
                // Color index for gradients
                const colorIndex = index;
                const totalCubes = gridDensity * gridDensity;
                
                this.drawIsometricCube(
                    layerGroup, 
                    isoX, 
                    isoY, 
                    cubeSize, 
                    lineWidth,
                    shouldFlip,
                    orientationFactor,
                    rotationAngle,
                    colorIndex,
                    totalCubes
                );
            }
        }

        // Add connecting lines for impossible object effect (only if complexity is high)
        if (complexity > 30) {
            this.addImpossibleConnections(layerGroup, centerX, centerY, baseSize, gridDensity, lineWidth);
        }
    }

    drawIsometricCube(layerGroup, centerX, centerY, size, lineWidth, shouldFlip, orientationFactor, rotationAngle, colorIndex, totalCubes) {
        // Isometric projection angles: 30° for depth
        const angle = Math.PI / 6; // 30 degrees
        const cos30 = Math.cos(angle);
        const sin30 = Math.sin(angle);
        
        // Calculate cube vertices in isometric view
        const halfSize = size / 2;
        
        // Define 8 vertices of a cube in isometric projection
        // Flip orientation based on shouldFlip for Escher effect
        const flipMultiplier = shouldFlip ? -1 : 1;
        const orientMult = orientationFactor;
        
        const vertices = [
            // Bottom face (closer)
            { x: centerX - halfSize * cos30 * flipMultiplier, y: centerY + halfSize * sin30 + halfSize },
            { x: centerX + halfSize * cos30 * flipMultiplier, y: centerY - halfSize * sin30 + halfSize },
            { x: centerX + halfSize * cos30 * flipMultiplier, y: centerY - halfSize * sin30 - halfSize },
            { x: centerX - halfSize * cos30 * flipMultiplier, y: centerY + halfSize * sin30 - halfSize },
            // Top face (farther)
            { x: centerX - halfSize * cos30 * flipMultiplier * orientMult, y: centerY + halfSize * sin30 * orientMult },
            { x: centerX + halfSize * cos30 * flipMultiplier * orientMult, y: centerY - halfSize * sin30 * orientMult },
            { x: centerX + halfSize * cos30 * flipMultiplier * orientMult, y: centerY - halfSize * sin30 * orientMult - size },
            { x: centerX - halfSize * cos30 * flipMultiplier * orientMult, y: centerY + halfSize * sin30 * orientMult - size }
        ];

        // Get colors for different faces
        const topColor = this.getLineColor(colorIndex, totalCubes);
        const leftColor = this.getLineColor(colorIndex + totalCubes / 3, totalCubes);
        const rightColor = this.getLineColor(colorIndex + 2 * totalCubes / 3, totalCubes);

        // Draw three visible faces with different colors for depth
        
        // Top face (parallelogram)
        const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const topPath = `M ${vertices[3].x} ${vertices[3].y} 
                        L ${vertices[2].x} ${vertices[2].y} 
                        L ${vertices[6].x} ${vertices[6].y} 
                        L ${vertices[7].x} ${vertices[7].y} Z`;
        topFace.setAttribute('d', topPath);
        topFace.setAttribute('fill', topColor);
        topFace.setAttribute('fill-opacity', '0.3');
        topFace.setAttribute('stroke', topColor);
        topFace.setAttribute('stroke-width', lineWidth);
        layerGroup.appendChild(topFace);

        // Left face
        const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const leftPath = `M ${vertices[0].x} ${vertices[0].y} 
                         L ${vertices[3].x} ${vertices[3].y} 
                         L ${vertices[7].x} ${vertices[7].y} 
                         L ${vertices[4].x} ${vertices[4].y} Z`;
        leftFace.setAttribute('d', leftPath);
        leftFace.setAttribute('fill', leftColor);
        leftFace.setAttribute('fill-opacity', '0.2');
        leftFace.setAttribute('stroke', leftColor);
        leftFace.setAttribute('stroke-width', lineWidth);
        layerGroup.appendChild(leftFace);

        // Right face
        const rightFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const rightPath = `M ${vertices[1].x} ${vertices[1].y} 
                          L ${vertices[2].x} ${vertices[2].y} 
                          L ${vertices[6].x} ${vertices[6].y} 
                          L ${vertices[5].x} ${vertices[5].y} Z`;
        rightFace.setAttribute('d', rightPath);
        rightFace.setAttribute('fill', rightColor);
        rightFace.setAttribute('fill-opacity', '0.2');
        rightFace.setAttribute('stroke', rightColor);
        rightFace.setAttribute('stroke-width', lineWidth);
        layerGroup.appendChild(rightFace);
    }

    addImpossibleConnections(layerGroup, centerX, centerY, baseSize, gridDensity, lineWidth) {
        // Create Escher-style impossible connections between distant cubes
        const connectionColor = this.getLineColor(0, 1);
        
        for (let i = 0; i < gridDensity; i++) {
            const angle1 = (i / gridDensity) * Math.PI * 2;
            const angle2 = ((i + gridDensity / 2) % gridDensity / gridDensity) * Math.PI * 2;
            
            const radius = baseSize * gridDensity * 0.4;
            
            const x1 = centerX + Math.cos(angle1) * radius;
            const y1 = centerY + Math.sin(angle1) * radius;
            const x2 = centerX + Math.cos(angle2) * radius;
            const y2 = centerY + Math.sin(angle2) * radius;
            
            // Create curved connection for impossible effect
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const controlX = centerX + Math.cos((angle1 + angle2) / 2) * radius * 0.5;
            const controlY = centerY + Math.sin((angle1 + angle2) / 2) * radius * 0.5;
            
            const pathData = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', connectionColor);
            path.setAttribute('stroke-width', lineWidth * 0.5);
            path.setAttribute('stroke-dasharray', '5,5');
            path.setAttribute('opacity', '0.3');
            layerGroup.appendChild(path);
        }
    }

    generateEyePattern(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Create eye shape using ellipses
        for (let i = 0; i < complexity; i++) {
            const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

            const rx = (this.actualWidth * 0.4 / complexity) * (i + 1);
            const ry = (this.actualHeight * 0.2 / complexity) * (i + 1);

            const waveOffset = Math.sin((this.currentSeed + i * 0.2) * Math.PI * 2) * 20;

            ellipse.setAttribute('cx', centerX);
            ellipse.setAttribute('cy', centerY + waveOffset);
            ellipse.setAttribute('rx', rx);
            ellipse.setAttribute('ry', ry);
            ellipse.setAttribute('fill', 'none');
            ellipse.setAttribute('stroke', '#000');
            ellipse.setAttribute('stroke-width', lineWidth);

            layerGroup.appendChild(ellipse);
        }

        // Add pupil
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', Math.min(this.actualWidth, this.actualHeight) * 0.05);
        pupil.setAttribute('fill', '#000');
        layerGroup.appendChild(pupil);
    }

    generateSquareTunnel(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use complexity for number of squares (rings)
        const numSquares = Math.max(20, complexity);
        const maxDimension = Math.max(this.actualWidth, this.actualHeight);
        
        // Use amplitude for perspective distortion intensity
        const perspectiveStrength = amplitude / 100;
        
        // Use frequency for rotation twist
        const twistFactor = frequency / 50;

        for (let i = 0; i < numSquares; i++) {
            // Non-linear scaling for better perspective (exponential)
            const progress = i / numSquares;
            const scale = Math.pow(1 - progress, 1.5); // Exponential decay for depth
            
            // Calculate size with perspective
            const baseSize = maxDimension * scale * 0.9;
            
            // Add spiral twist - rotation increases toward center
            const rotation = progress * twistFactor * 360;
            
            // Add wave modulation to size for organic feel
            const waveModulation = 1 + Math.sin(progress * Math.PI * 4) * perspectiveStrength * 0.1;
            const squareSize = baseSize * waveModulation;
            
            // Calculate depth-based offset for 3D effect
            const depthOffset = (1 - scale) * perspectiveStrength * 5;
            
            // Create path for more control over shape
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Calculate corners with slight perspective distortion
            const half = squareSize / 2;
            const perspectiveDistortion = 1 + (1 - scale) * perspectiveStrength * 0.1;
            
            const corners = [
                [-half * perspectiveDistortion, -half * perspectiveDistortion],
                [half * perspectiveDistortion, -half * perspectiveDistortion],
                [half * perspectiveDistortion, half * perspectiveDistortion],
                [-half * perspectiveDistortion, half * perspectiveDistortion]
            ];
            
            // Build path
            let pathData = `M ${corners[0][0]} ${corners[0][1]}`;
            for (let j = 1; j < corners.length; j++) {
                pathData += ` L ${corners[j][0]} ${corners[j][1]}`;
            }
            pathData += ' Z';
            
            path.setAttribute('d', pathData);
            
            // Alternating fills for 3D tunnel effect (like Radial Vortex)
            const colorIndex = i;
            const color = this.getLineColor(colorIndex, numSquares);
            const colorMode = document.getElementById('color-mode').value;
            
            if (i % 2 === 0) {
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '1');
                path.setAttribute('stroke', 'none');
            } else {
                if (colorMode === 'black') {
                    path.setAttribute('fill', '#fff');
                    path.setAttribute('fill-opacity', '1');
                    path.setAttribute('stroke', 'none');
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.5');
                    path.setAttribute('stroke', color);
                    path.setAttribute('stroke-width', lineWidth * 0.5);
                }
            }
            
            // Apply rotation and center transformation
            const transform = `translate(${centerX + depthOffset}, ${centerY + depthOffset}) rotate(${rotation})`;
            path.setAttribute('transform', transform);
            
            layerGroup.appendChild(path);
        }
        
        // Add center focal point
        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerDot.setAttribute('cx', centerX);
        centerDot.setAttribute('cy', centerY);
        centerDot.setAttribute('r', Math.max(2, lineWidth));
        centerDot.setAttribute('fill', this.getLineColor(0, 1));
        layerGroup.appendChild(centerDot);
    }

    generateWaveDisplacement(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Create base horizontal stripes
        const stripeSpacing = this.actualHeight / complexity;
        const totalLines = Math.ceil(this.actualHeight / stripeSpacing);

        let lineIndex = 0;
        for (let y = 0; y < this.actualHeight + stripeSpacing; y += stripeSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            // Create sine wave displacement based on distance from center
            for (let x = 0; x <= this.actualWidth; x += 2) {
                const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
                const normalizedDistance = distanceFromCenter / maxDistance;

                // Displacement intensity decreases with distance
                const intensity = Math.exp(-normalizedDistance * 3) * (amplitude / 20);

                // Multiple wave frequencies for complexity
                const wave1 = Math.sin((x / this.actualWidth) * Math.PI * frequency + this.currentSeed * 10) * intensity;
                const wave2 = Math.sin((distanceFromCenter / 50) * Math.PI * 2 + this.currentSeed * 5) * intensity * 0.5;

                const displacedY = y + wave1 + wave2;
                pathData += ` L ${x} ${displacedY}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.getLineColor(lineIndex, totalLines));
            path.setAttribute('stroke-width', lineWidth);

            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
            lineIndex++;
        }
    }

    generateCircularDisplacement(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Create horizontal lines that get displaced by circular field
        const lineSpacing = this.actualHeight / complexity;
        const totalLines = Math.ceil(this.actualHeight / lineSpacing);

        let lineIndex = 0;
        for (let y = 0; y < this.actualHeight + lineSpacing; y += lineSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= this.actualWidth; x += 1) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                // Create circular displacement field
                const fieldRadius = Math.min(this.actualWidth, this.actualHeight) * 0.3;
                const fieldStrength = Math.exp(-(distance / fieldRadius)) * 30;

                // Displacement perpendicular to radius
                const displacementX = Math.sin(angle + Math.PI/2) * fieldStrength * Math.sin(distance * 0.1 + this.currentSeed * 5);
                const displacementY = -Math.cos(angle + Math.PI/2) * fieldStrength * Math.sin(distance * 0.1 + this.currentSeed * 5);

                pathData += ` L ${x + displacementX} ${y + displacementY}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.getLineColor(lineIndex, totalLines));
            path.setAttribute('stroke-width', lineWidth);
            layerGroup.appendChild(path);
            lineIndex++;
        }
    }

    generateAdvancedEyePattern(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Create horizontal lines that curve around eye shape
        const lineSpacing = this.actualHeight / complexity;
        const totalLines = Math.ceil((this.actualHeight + 2 * lineSpacing) / lineSpacing);

        let lineIndex = 0;
        for (let y = -lineSpacing; y < this.actualHeight + lineSpacing; y += lineSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= this.actualWidth; x += 1) {
                const dx = x - centerX;
                const dy = y - centerY;

                // Create eye-like displacement field
                const eyeWidth = this.actualWidth * 0.4;
                const eyeHeight = this.actualHeight * 0.2;

                // Elliptical field
                const normalizedX = dx / eyeWidth;
                const normalizedY = dy / eyeHeight;
                const ellipseDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

                // Eye field strength
                const fieldStrength = Math.exp(-ellipseDistance * 2) * 40;

                // Vertical displacement creating eye curve
                const eyeDisplacement = fieldStrength * Math.sin(normalizedX * Math.PI) * (1 - Math.abs(normalizedY));

                // Add wave variation
                const waveDisplacement = Math.sin(x * 0.02 + this.currentSeed * 3) * fieldStrength * 0.3;

                const finalY = y + eyeDisplacement + waveDisplacement;
                pathData += ` L ${x} ${finalY}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.getLineColor(lineIndex, totalLines));
            path.setAttribute('stroke-width', lineWidth);
            layerGroup.appendChild(path);
            lineIndex++;
        }

        // Add pupil
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', Math.min(this.actualWidth, this.actualHeight) * 0.05);
        pupil.setAttribute('fill', '#000');
        layerGroup.appendChild(pupil);
    }

    generateMoireInterference(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const spacing1 = this.actualHeight / complexity;
        const spacing2 = this.actualHeight / (complexity + this.seededRandom(this.currentSeed) * 5);

        // First set of lines
        for (let y = 0; y < this.actualHeight + spacing1; y += spacing1) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', this.actualWidth);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth);
            layerGroup.appendChild(line);
        }

        // Second set of lines with slight angle and spacing difference
        const angle = (this.seededRandom(this.currentSeed + 1) - 0.5) * 10;
        for (let y = 0; y < this.actualHeight + spacing2; y += spacing2) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', this.actualWidth);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth * 0.7);
            line.setAttribute('transform', `rotate(${angle} ${this.actualWidth/2} ${this.actualHeight/2})`);
            layerGroup.appendChild(line);
        }
    }

    generateSpiralDistortion(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Create radial lines that get twisted into spiral
        const numLines = complexity * 2;

        for (let i = 0; i < numLines; i++) {
            const baseAngle = (i / numLines) * Math.PI * 2;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            let pathData = `M ${centerX} ${centerY}`;
            const maxRadius = Math.min(this.actualWidth, this.actualHeight) * 0.4;

            for (let r = 1; r <= maxRadius; r += 2) {
                // Spiral twist increases with radius
                const spiralTwist = (r / maxRadius) * Math.PI * 2 * (this.seededRandom(this.currentSeed + i) + 0.5);
                const angle = baseAngle + spiralTwist;

                // Add wave distortion
                const waveDistortion = Math.sin(r * 0.1 + this.currentSeed * 5) * r * 0.1;
                const effectiveRadius = r + waveDistortion;

                const x = centerX + Math.cos(angle) * effectiveRadius;
                const y = centerY + Math.sin(angle) * effectiveRadius;

                pathData += ` L ${x} ${y}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.getLineColor(i, numLines));
            path.setAttribute('stroke-width', lineWidth);
            layerGroup.appendChild(path);
        }
    }

    generateShadedGrid(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const amplitude = parseInt(document.getElementById('amplitude').value); // Use amplitude for maxDepth
        const frequency = parseInt(document.getElementById('frequency').value); // Use frequency for power/light angle
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        const cellSize = Math.max(5, Math.floor(Math.min(this.actualWidth, this.actualHeight) / complexity));
        const maxDepth = amplitude / 100; // Scale amplitude to a reasonable maxDepth (e.g., 0.05 to 10)
        const power = 1 + (frequency / 100) * 3; // Power from 1 to 4, for curvature control

        // Animate light angle slightly
        const lightAngle = Math.PI / 4 + slowAnimationTime * 0.1;
        const lightDirX = Math.cos(lightAngle);
        const lightDirY = Math.sin(lightAngle);
        const lightDirZ = 0.7; // Simulate light coming slightly from front

        let pixelIndex = 0;
        for (let y = 0; y < this.actualHeight; y += cellSize) {
            for (let x = 0; x < this.actualWidth; x += cellSize) {
                const localX = (x + cellSize / 2) - centerX;
                const localY = (y + cellSize / 2) - centerY;
                const r = Math.sqrt(localX * localX + localY * localY);

                let Z = 0;
                const R_max_cell = cellSize / 2; // Radius within a single cell

                // Create a bump/indentation effect within each cell
                // Use a slightly randomized center for more organic look
                const cellCenterX = x + cellSize / 2 + (this.seededRandom(this.currentSeed + x * 0.01 + y * 0.02) - 0.5) * cellSize * 0.1;
                const cellCenterY = y + cellSize / 2 + (this.seededRandom(this.currentSeed + x * 0.03 + y * 0.01) - 0.5) * cellSize * 0.1;

                const currentLocalX = (x + cellSize / 2) - cellCenterX;
                const currentLocalY = (y + cellSize / 2) - cellCenterY;
                const currentR = Math.sqrt(currentLocalX * currentLocalX + currentLocalY * currentLocalY);

                if (currentR <= R_max_cell) {
                    Z = maxDepth * (1 - Math.pow(currentR / R_max_cell, power));
                }

                // Calculate normal for shading
                // Approximate normal based on Z gradient
                const dZ_dr = -maxDepth * power * Math.pow(currentR / R_max_cell, power - 1) / R_max_cell;
                let Nx = 0, Ny = 0;
                if (currentR > 0) {
                    Nx = (currentLocalX / currentR) * dZ_dr;
                    Ny = (currentLocalY / currentR) * dZ_dr;
                }
                const Nz = 1; // Z component of normal (pointing upwards)

                const normalLength = Math.sqrt(Nx*Nx + Ny*Ny + Nz*Nz);
                const N_normalizedX = Nx / normalLength;
                const N_normalizedY = Ny / normalLength;
                const N_normalizedZ = Nz / normalLength;

                // Calculate diffuse shading
                const dot_NL = N_normalizedX * lightDirX + N_normalizedY * lightDirY + N_normalizedZ * lightDirZ;
                const shadeIntensity = Math.max(0, Math.min(1, dot_NL)); // Clamp between 0 and 1

                // Use shadeIntensity to determine color
                const baseColor = this.getLineColor(pixelIndex, (this.actualWidth / cellSize) * (this.actualHeight / cellSize));
                const rgb = this.colorToRgb(baseColor); // Handles hex, rgb, and hsl formats

                const finalR = Math.floor(rgb[0] * shadeIntensity);
                const finalG = Math.floor(rgb[1] * shadeIntensity);
                const finalB = Math.floor(rgb[2] * shadeIntensity);

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', cellSize);
                rect.setAttribute('height', cellSize);
                rect.setAttribute('fill', `rgb(${finalR}, ${finalG}, ${finalB})`);
                rect.setAttribute('stroke', 'none'); // No stroke for filled cells
                layerGroup.appendChild(rect);
                pixelIndex++;
            }
        }

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }
    }

    generateRadialVortex(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use frequency to control number of petals (lobes)
        const numPetals = Math.max(3, Math.floor(frequency / 10));
        
        // Use complexity for number of bands
        const numBands = Math.max(20, complexity);
        
        // Use amplitude for the intensity of the petal modulation
        const petalIntensity = amplitude / 100;
        
        // Maximum radius to cover the canvas
        const maxRadius = Math.sqrt(this.actualWidth * this.actualWidth + this.actualHeight * this.actualHeight) / 2;
        const bandWidth = maxRadius / numBands;

        // Create the vortex pattern using polar coordinates
        for (let band = 0; band < numBands; band++) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            const innerRadius = band * bandWidth;
            const outerRadius = (band + 1) * bandWidth;
            
            // Higher resolution for smoother curves
            const angleStep = Math.PI / 180; // 1 degree steps
            let pathData = '';
            
            // Draw inner curve
            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Create petal/flower effect with sinusoidal modulation
                const petalModulation = 1 + Math.sin(angle * numPetals + slowAnimationTime * 0.5) * petalIntensity;
                
                // Add spiral twist effect based on radius for 3D depth
                const spiralTwist = innerRadius * 0.01;
                const adjustedAngle = angle + spiralTwist;
                
                const r = innerRadius * petalModulation;
                const x = centerX + r * Math.cos(adjustedAngle);
                const y = centerY + r * Math.sin(adjustedAngle);
                
                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            
            // Draw outer curve (in reverse to create closed shape)
            for (let angle = Math.PI * 2; angle >= 0; angle -= angleStep) {
                const petalModulation = 1 + Math.sin(angle * numPetals + slowAnimationTime * 0.5) * petalIntensity;
                const spiralTwist = outerRadius * 0.01;
                const adjustedAngle = angle + spiralTwist;
                
                const r = outerRadius * petalModulation;
                const x = centerX + r * Math.cos(adjustedAngle);
                const y = centerY + r * Math.sin(adjustedAngle);
                
                pathData += ` L ${x} ${y}`;
            }
            
            pathData += ' Z';
            
            path.setAttribute('d', pathData);
            
            // Alternate colors or use gradient
            const colorIndex = band;
            const color = this.getLineColor(colorIndex, numBands);
            
            if (band % 2 === 0) {
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '1');
            } else {
                // For odd bands, use complementary effect or white
                const colorMode = document.getElementById('color-mode').value;
                if (colorMode === 'black') {
                    path.setAttribute('fill', '#fff');
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.5');
                }
            }
            
            path.setAttribute('stroke', 'none');
            layerGroup.appendChild(path);
        }

        // Add center dot for focal point
        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerDot.setAttribute('cx', centerX);
        centerDot.setAttribute('cy', centerY);
        centerDot.setAttribute('r', Math.max(2, lineWidth * 2));
        centerDot.setAttribute('fill', this.getLineColor(0, 1));
        layerGroup.appendChild(centerDot);

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }
    }

    exportSVG() {
        try {
            if (!this.canvas || !this.canvas.children.length) {
                throw new Error('No pattern to export. Please generate a pattern first.');
            }

            if (!this.actualWidth || !this.actualHeight) {
                throw new Error('Invalid canvas dimensions');
            }

            // Clone the canvas to modify for export without affecting the display
            const exportCanvas = this.canvas.cloneNode(true);

            // Set proper dimensions in millimeters for LightBurn
            exportCanvas.setAttribute('width', `${this.actualWidth}mm`);
            exportCanvas.setAttribute('height', `${this.actualHeight}mm`);
            exportCanvas.setAttribute('viewBox', `0 0 ${this.actualWidth} ${this.actualHeight}`);

            // Add proper SVG namespace and units
            exportCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            exportCanvas.setAttribute('version', '1.1');

            // Create SVG content with proper header
            const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by Optical Art Generator for LightBurn -->
<!-- Dimensions: ${this.actualWidth}×${this.actualHeight} mm -->
${new XMLSerializer().serializeToString(exportCanvas)}`;

            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            const patternType = document.getElementById('pattern-type').value;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `optical-art-${patternType}-${this.actualWidth}x${this.actualHeight}mm-${timestamp}.svg`;

            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);

            this.showSuccess('SVG exported successfully!');
        } catch (error) {
            console.error('Error exporting SVG:', error);
            this.showError(`Failed to export SVG: ${error.message}`);
        }
    }

    exportImage(format) {
        try {
            if (!this.canvas || !this.canvas.children.length) {
                throw new Error('No pattern to export. Please generate a pattern first.');
            }

            if (!['png', 'jpeg'].includes(format)) {
                throw new Error('Invalid format. Supported formats: png, jpeg');
            }

            // Create a high-resolution canvas for export
            const exportCanvas = document.createElement('canvas');
            const ctx = exportCanvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // Set high resolution for wallpaper quality
            const scaleFactor = 2;
            const exportWidth = this.actualWidth * scaleFactor * 4; // Higher resolution
            const exportHeight = this.actualHeight * scaleFactor * 4;

            exportCanvas.width = exportWidth;
            exportCanvas.height = exportHeight;

            // Set white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, exportWidth, exportHeight);

            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(this.canvas);
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                try {
                    // Draw the SVG onto the canvas
                    ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

                    // Export the canvas as image
                    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                    const quality = format === 'jpeg' ? 0.95 : undefined;

                    exportCanvas.toBlob((blob) => {
                        if (!blob) {
                            this.showError('Failed to create image blob');
                            return;
                        }

                        const downloadUrl = URL.createObjectURL(blob);
                        const patternType = document.getElementById('pattern-type').value;
                        const colorMode = document.getElementById('color-mode').value;
                        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                        const filename = `optical-art-${patternType}-${colorMode}-${this.actualWidth}x${this.actualHeight}mm-${timestamp}.${format}`;

                        const downloadLink = document.createElement('a');
                        downloadLink.href = downloadUrl;
                        downloadLink.download = filename;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                        URL.revokeObjectURL(downloadUrl);

                        this.showSuccess(`${format.toUpperCase()} exported successfully!`);
                    }, mimeType, quality);

                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Error in image export:', error);
                    this.showError(`Failed to export ${format.toUpperCase()}: ${error.message}`);
                    URL.revokeObjectURL(url);
                }
            };

            img.onerror = () => {
                this.showError('Failed to load SVG for image export');
                URL.revokeObjectURL(url);
            };

            img.src = url;
        } catch (error) {
            console.error('Error exporting image:', error);
            this.showError(`Failed to export ${format?.toUpperCase() || 'image'}: ${error.message}`);
        }
    }

    // Pattern saving and loading functionality
    getCurrentPatternState() {
        return {
            patternType: document.getElementById('pattern-type').value,
            complexity: parseInt(document.getElementById('complexity').value),
            formatPreset: document.getElementById('format-preset').value,
            size: parseInt(document.getElementById('size').value),
            lineWidth: parseInt(document.getElementById('line-width').value),
            frequency: parseInt(document.getElementById('frequency').value),
            amplitude: parseInt(document.getElementById('amplitude').value),
            rotation: parseInt(document.getElementById('rotation').value),
            colorMode: document.getElementById('color-mode').value,
            lineColor: document.getElementById('line-color').value,
            seed: this.currentSeed,
            timestamp: new Date().toISOString()
        };
    }

    loadPatternState(patternData) {
        try {
            document.getElementById('pattern-type').value = patternData.patternType || 'wave-displacement';
            document.getElementById('complexity').value = patternData.complexity || 50;
            document.getElementById('format-preset').value = patternData.formatPreset || '1:1';
            document.getElementById('size').value = patternData.size || 350;
            document.getElementById('line-width').value = patternData.lineWidth || 2;
            document.getElementById('frequency').value = patternData.frequency || 4;
            document.getElementById('amplitude').value = patternData.amplitude || 20;
            document.getElementById('rotation').value = patternData.rotation || 0;
            document.getElementById('color-mode').value = patternData.colorMode || 'black';
            document.getElementById('line-color').value = patternData.lineColor || '#ff0000';

            this.currentSeed = patternData.seed || Math.random();

            this.updateSliderValues();
            this.updateCanvasSize();
            this.updatePatternPreviews();
            this.updatePatternInfo();
            this.toggleColorControls();
            this.generatePattern();

            this.showSuccess('Pattern loaded successfully!');
        } catch (error) {
            console.error('Error loading pattern:', error);
            this.showError('Failed to load pattern data');
        }
    }

    showSaveModal() {
        if (!this.canvas || !this.canvas.children.length) {
            this.showError('No pattern to save. Please generate a pattern first.');
            return;
        }

        const modal = document.getElementById('saveModal');
        const input = document.getElementById('pattern-name');

        // Generate default name
        const patternType = document.getElementById('pattern-type').value;
        const timestamp = new Date().toLocaleString().replace(/[:/,]/g, '-');
        input.value = `${patternType}-${timestamp}`;

        modal.style.display = 'block';
        input.focus();
        input.select();
    }

    showManageModal() {
        const modal = document.getElementById('manageModal');
        modal.style.display = 'block';
        this.displaySavedPatterns();
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    saveCurrentPattern() {
        const nameInput = document.getElementById('pattern-name');
        const patternName = nameInput.value.trim();

        if (!patternName) {
            this.showError('Please enter a pattern name');
            return;
        }

        try {
            const patternData = this.getCurrentPatternState();
            patternData.name = patternName;

            // Get existing saved patterns
            const savedPatterns = JSON.parse(localStorage.getItem('opticalArtPatterns') || '{}');

            // Save new pattern
            savedPatterns[patternName] = patternData;
            localStorage.setItem('opticalArtPatterns', JSON.stringify(savedPatterns));

            this.closeModals();
            this.showSuccess(`Pattern "${patternName}" saved successfully!`);
        } catch (error) {
            console.error('Error saving pattern:', error);
            this.showError('Failed to save pattern');
        }
    }

    loadRandomPattern() {
        try {
            const savedPatterns = JSON.parse(localStorage.getItem('opticalArtPatterns') || '{}');
            const patternNames = Object.keys(savedPatterns);

            if (patternNames.length === 0) {
                this.showError('No saved patterns found. Save a pattern first!');
                return;
            }

            const randomName = patternNames[Math.floor(Math.random() * patternNames.length)];
            const patternData = savedPatterns[randomName];

            this.loadPatternState(patternData);
            this.showSuccess(`Loaded "${randomName}"`);
        } catch (error) {
            console.error('Error loading random pattern:', error);
            this.showError('Failed to load pattern');
        }
    }

    displaySavedPatterns() {
        const container = document.getElementById('saved-patterns-container');

        try {
            const savedPatterns = JSON.parse(localStorage.getItem('opticalArtPatterns') || '{}');
            const patternNames = Object.keys(savedPatterns);

            if (patternNames.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No saved patterns found. Save your first pattern to get started!</p>';
                return;
            }

            container.innerHTML = '';

            patternNames.forEach(name => {
                const patternData = savedPatterns[name];
                const patternDiv = this.createSavedPatternElement(name, patternData);
                container.appendChild(patternDiv);
            });
        } catch (error) {
            console.error('Error displaying saved patterns:', error);
            container.innerHTML = '<p style="text-align: center; color: #ff4444; grid-column: 1/-1;">Error loading saved patterns</p>';
        }
    }

    createSavedPatternElement(name, patternData) {
        const div = document.createElement('div');
        div.className = 'saved-pattern-item';

        // Create preview
        const previewDiv = document.createElement('div');
        previewDiv.className = 'saved-pattern-preview';

        // Create mini pattern for preview
        const miniSvg = this.generateMiniPattern(patternData.patternType);
        previewDiv.appendChild(miniSvg);

        // Create info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'saved-pattern-info';

        const title = document.createElement('h4');
        title.textContent = name;

        const details = document.createElement('p');
        const date = new Date(patternData.timestamp).toLocaleDateString();
        details.textContent = `${patternData.patternType} • ${date}`;

        infoDiv.appendChild(title);
        infoDiv.appendChild(details);

        // Create action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'saved-pattern-actions';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'load-btn';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => {
            this.loadPatternState(patternData);
            this.closeModals();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            this.deletePattern(name);
        });

        actionsDiv.appendChild(loadBtn);
        actionsDiv.appendChild(deleteBtn);

        // Assemble the element
        div.appendChild(previewDiv);
        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);

        return div;
    }

    deletePattern(name) {
        if (!confirm(`Are you sure you want to delete the pattern "${name}"?`)) {
            return;
        }

        try {
            const savedPatterns = JSON.parse(localStorage.getItem('opticalArtPatterns') || '{}');
            delete savedPatterns[name];
            localStorage.setItem('opticalArtPatterns', JSON.stringify(savedPatterns));

            this.displaySavedPatterns(); // Refresh the display
            this.showSuccess(`Pattern "${name}" deleted successfully`);
        } catch (error) {
            console.error('Error deleting pattern:', error);
            this.showError('Failed to delete pattern');
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OpticalArtGenerator();
});