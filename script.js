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
        
        // Visual Explorer state
        this.explorerVariants = [];
        this.selectedVariantIndex = -1;
        this.explorerGeneration = 1;
        this.parentVariant = null;
        this.patternInfo = {
            'concentric-circles': 'Hypnotic wavy rings with golden ratio spacing, variable thickness, breathing effects, and alternating fills creating powerful depth illusion',
            'diagonal-stripes': 'Dynamic Op-Art stripes with wave distortion, variable thickness, and alternating fills creating chevron-like patterns with 3D depth',
            'cube-illusion': 'Creates mesmerizing isometric cube arrays with Escher-style impossible geometry, dynamic perspective, and wave-based depth modulation',
            'eye-pattern': 'Psychedelic eye with organic distortion, detailed iris lines, realistic pupil with highlight, and eyelid curves creating hypnotic depth',
            'square-tunnel': '3D vortex tunnel with exponential perspective, spiral twist, alternating fills, and depth-based transformations rivaling Radial Vortex',
            'wave-displacement': 'Multi-wave interference field with standing waves, traveling waves, radial sources, and 3D surface bands creating complex wave patterns',
            'circular-displacement': 'Magnetic field visualization with multiple vortex centers, alternating charges, vector field distortion, and black hole lensing effects',
            'moire-interference': 'Multi-layer interference patterns with three modes: traditional lines, grid networks, and radial circles, creating mesmerizing moiré effects',
            'spiral-distortion': 'Golden ratio spirals with double counter-rotating arms, variable thickness, 3D ribbon bands, and organic wave modulation creating mesmerizing depth',
            'perlin-displacement': 'Organic patterns from a Perlin noise field',
            'fractal-noise': 'Rich, detailed patterns from layered Perlin noise (fBm)',
            'de-jong-attractor': 'Chaotic patterns based on the De Jong strange attractor.',
            'cellular-automata': 'Emergent patterns from simple rule-based cellular automata.',
            'l-system-growth': 'Fractal branching with 6 types (bush/tree/fern/flower/spiral/fractal), rotational symmetry (2/4/6-fold), colored branches by depth, and leaves',
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
        this.setupToolbar(); // Setup interactive toolbar
        this.setupPresetListeners();
        this.updateSliderValues();
        this.updateCanvasSize();
        this.updatePatternInfo();
        this.generatePatternPreviews();
        this.generatePattern();
        
        // Setup GPU optimizations for zoom/pan
        this.setupZoomPanOptimization();
        
        // Restore dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.getElementById('dark-mode-toggle').checked = true;
            document.querySelector('.canvas-container').classList.add('dark-mode');
            document.body.classList.add('dark-mode');
            this.applyDarkMode(true);
        }
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

                // Initialize Visual Explorer when tab is opened
                if (tabId === 'tab-explore' && this.explorerVariants.length === 0) {
                    setTimeout(() => this.generateRandomVariants(), 100);
                }
            }
        });
    }

    setupToolbar() {
        // Canvas ratio buttons
        document.querySelectorAll('.canvas-ratio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ratio = e.target.dataset.ratio;
                document.querySelectorAll('.canvas-ratio-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update the hidden canvas format selector
                document.getElementById('format-preset').value = ratio;
                this.updateCanvasSize();
                this.updateToolbarInfo();
            });
        });

        // Video duration buttons
        document.querySelectorAll('.video-duration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const duration = e.target.dataset.duration;
                document.querySelectorAll('.video-duration-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update the hidden video duration selector
                document.getElementById('video-duration').value = duration;
                document.getElementById('record-video-btn').textContent = `🎥 Record Video (${duration}s)`;
                this.updateToolbarInfo();
            });
        });

        // Video FPS buttons
        document.querySelectorAll('.video-fps-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fps = e.target.dataset.fps;
                document.querySelectorAll('.video-fps-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update the hidden FPS selector
                document.getElementById('video-fps').value = fps;
                this.updateToolbarInfo();
            });
        });

        // Animation pills
        const pillParams = ['complexity', 'frequency', 'amplitude', 'rotation', 'glow', 'zoom'];
        pillParams.forEach(param => {
            const pill = document.getElementById(`pill-${param}`);
            if (pill) {
                pill.addEventListener('click', () => {
                    const checkbox = document.getElementById(`animate-${param}`);
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                    this.updateToolbarAnimationPills();
                });
            }
        });

        // Animation mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update the hidden animation mode selector
                document.getElementById('animation-mode').value = mode;
            });
        });

        // Action buttons
        document.getElementById('toolbar-export-png').addEventListener('click', () => {
            this.exportTransparentPNG();
        });

        document.getElementById('toolbar-record-video').addEventListener('click', async () => {
            const duration = parseInt(document.getElementById('video-duration').value);
            
            if (!this.isAnimating) {
                this.showError('Please enable at least one animation (🎬) before recording!');
                return;
            }
            
            await this.startVideoRecording(duration);
        });

        // Sync toolbar buttons when hidden controls change
        document.getElementById('format-preset')?.addEventListener('change', (e) => {
            const ratio = e.target.value;
            document.querySelectorAll('.canvas-ratio-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.ratio === ratio);
            });
            this.updateToolbarInfo();
        });

        document.getElementById('video-duration')?.addEventListener('change', (e) => {
            const duration = e.target.value;
            document.querySelectorAll('.video-duration-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.duration === duration);
            });
            this.updateToolbarInfo();
        });

        document.getElementById('video-fps')?.addEventListener('change', (e) => {
            const fps = e.target.value;
            document.querySelectorAll('.video-fps-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.fps === fps);
            });
            this.updateToolbarInfo();
        });

        document.getElementById('animation-mode')?.addEventListener('change', (e) => {
            const mode = e.target.value;
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === mode);
            });
        });

        // Initial update
        this.updateToolbarInfo();
        this.updateToolbarAnimationPills();

        // Listen for changes to animation checkboxes to update pills
        pillParams.forEach(param => {
            const checkbox = document.getElementById(`animate-${param}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateToolbarAnimationPills();
                });
            }
        });

        // Listen for changes to range inputs to update pill ranges
        pillParams.forEach(param => {
            const startInput = document.getElementById(`${param}-start`);
            const endInput = document.getElementById(`${param}-end`);
            if (startInput && endInput) {
                startInput.addEventListener('input', () => this.updateToolbarAnimationPills());
                endInput.addEventListener('input', () => this.updateToolbarAnimationPills());
            }
        });
    }

    updateToolbarInfo() {
        // Update canvas info
        const canvasInfo = document.getElementById('toolbar-canvas-info');
        const width = this.actualWidth;
        const height = this.actualHeight;
        const pixelScale = 3.78; // 96 DPI conversion
        const displayWidth = Math.round(width * pixelScale);
        const displayHeight = Math.round(height * pixelScale);
        canvasInfo.textContent = `${width}×${height}mm (${displayWidth}×${displayHeight}px)`;

        // Update video info
        const videoInfo = document.getElementById('toolbar-video-info');
        const duration = parseInt(document.getElementById('video-duration').value);
        const fps = parseInt(document.getElementById('video-fps')?.value || 24);
        const totalFrames = duration * fps;
        
        // Calculate export resolution based on canvas aspect ratio
        const canvasAspectRatio = this.actualWidth / this.actualHeight;
        const quality = document.getElementById('video-quality')?.value || '2160';
        const targetHeights = { '1080': 1080, '1440': 1440, '2160': 2160 };
        const exportHeight = targetHeights[quality] || 2160;
        const exportWidth = Math.round(exportHeight * canvasAspectRatio);
        
        videoInfo.textContent = `= ${totalFrames} frames • Export: ${exportWidth}×${exportHeight}`;
    }

    updateToolbarAnimationPills() {
        const pillParams = [
            { id: 'complexity', format: (s, e) => `${s}→${e}` },
            { id: 'frequency', format: (s, e) => `${s}→${e}` },
            { id: 'amplitude', format: (s, e) => `${s}→${e}` },
            { id: 'rotation', format: (s, e) => `${s}°→${e}°` },
            { id: 'glow', format: (s, e) => `${s}→${e}` },
            { id: 'zoom', format: (s, e) => `${s}×→${e}×` }
        ];

        pillParams.forEach(({ id, format }) => {
            const pill = document.getElementById(`pill-${id}`);
            const checkbox = document.getElementById(`animate-${id}`);
            const rangeSpan = pill.querySelector('.pill-range');
            
            if (checkbox && checkbox.checked) {
                pill.classList.add('active');
                const startVal = document.getElementById(`${id}-start`)?.value || '0';
                const endVal = document.getElementById(`${id}-end`)?.value || '0';
                rangeSpan.textContent = format(startVal, endVal);
                rangeSpan.style.display = 'inline';
            } else {
                pill.classList.remove('active');
                rangeSpan.style.display = 'none';
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

    applyDarkMode(isDark) {
        // Remove existing background rect if any
        const existingBg = document.getElementById('dark-mode-bg');
        if (existingBg) {
            existingBg.remove();
        }

        if (isDark) {
            // Add a black background rectangle as the first element
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('id', 'dark-mode-bg');
            bgRect.setAttribute('x', '0');
            bgRect.setAttribute('y', '0');
            bgRect.setAttribute('width', '100%');
            bgRect.setAttribute('height', '100%');
            bgRect.setAttribute('fill', '#000000');
            
            // Insert as first child so it's behind everything
            if (this.canvas.firstChild) {
                this.canvas.insertBefore(bgRect, this.canvas.firstChild);
            } else {
                this.canvas.appendChild(bgRect);
            }
        }
        
        // Regenerate pattern to update line colors (black->white or white->black)
        this.generatePattern(false);
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
        const numRings = 15;

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
            
            // Optical art style - mostly outlines
            if (i % 5 === 0) {
                // Only every 5th ring with subtle fill
                path.setAttribute('fill', '#ddd');
                path.setAttribute('fill-opacity', '0.2');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.7);
            } else {
                // All other rings: outline only (optical art!)
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * (0.5 + progress * 0.5));
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
        const numLines = 12;
        const spacing = 56 / numLines;
        
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
            
            const numPoints = 40;
            for (let j = 0; j <= numPoints; j++) {
                const x = (56 * j) / numPoints;
                
                // Interference pattern
                let displacement = 0;
                for (const source of sources) {
                    const dist = Math.sqrt(Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2));
                    displacement += Math.sin(dist * 0.3) * Math.exp(-dist / 30) * 2;
                }
                
                // Add horizontal wave
                displacement += Math.sin((x / 56) * Math.PI * 3) * 0.5;
                
                const finalY = y + displacement;
                
                if (j === 0) {
                    pathData = `M ${x} ${finalY}`;
                } else {
                    pathData += ` L ${x} ${finalY}`;
                }
            }
            
            path.setAttribute('d', pathData);
            
            if (i % 4 === 0) {
                path.setAttribute('fill', '#ddd');
                path.setAttribute('fill-opacity', '0.3');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.5);
            } else {
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth);
            }
            
            svg.appendChild(path);
        }
        
        // Wave source markers
        for (const source of sources) {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', source.x);
            marker.setAttribute('cy', source.y);
            marker.setAttribute('r', 1.5);
            marker.setAttribute('fill', '#666');
            marker.setAttribute('fill-opacity', '0.5');
            svg.appendChild(marker);
        }
    }

    generateMiniEyePattern(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const maxRadius = 24;
        const numRings = 10;
        
        // Organic eye rings
        for (let i = 0; i < numRings; i++) {
            const progress = i / numRings;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            const baseRx = maxRadius * progress;
            const baseRy = maxRadius * 0.6 * progress;
            
            const numPoints = 40;
            for (let j = 0; j <= numPoints; j++) {
                const angle = (Math.PI * 2 * j) / numPoints;
                const wave = Math.sin(angle * 2) * 0.1 + Math.sin(angle * 4) * 0.05;
                const modulation = 1 + wave;
                
                const x = centerX + baseRx * modulation * Math.cos(angle);
                const y = centerY + baseRy * modulation * Math.sin(angle);
                
                if (j === 0) {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            pathData += ' Z';
            
            path.setAttribute('d', pathData);
            
            if (i % 3 === 0) {
                path.setAttribute('fill', '#555');
                path.setAttribute('fill-opacity', '0.3');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.3);
            } else if (i % 3 === 1) {
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth);
            } else {
                path.setAttribute('fill', '#ddd');
                path.setAttribute('fill-opacity', '0.2');
                path.setAttribute('stroke', 'none');
            }
            
            svg.appendChild(path);
        }
        
        // Iris lines
        const irisRadius = 7;
        const pupilRadius = 3;
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX + pupilRadius * Math.cos(angle));
            line.setAttribute('y1', centerY + pupilRadius * Math.sin(angle));
            line.setAttribute('x2', centerX + irisRadius * Math.cos(angle));
            line.setAttribute('y2', centerY + irisRadius * Math.sin(angle));
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth * 0.2);
            line.setAttribute('stroke-opacity', '0.4');
            svg.appendChild(line);
        }
        
        // Pupil
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', pupilRadius);
        pupil.setAttribute('fill', '#000');
        svg.appendChild(pupil);
        
        // Highlight
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        highlight.setAttribute('cx', centerX - 1);
        highlight.setAttribute('cy', centerY - 1);
        highlight.setAttribute('r', 1);
        highlight.setAttribute('fill', '#fff');
        highlight.setAttribute('fill-opacity', '0.7');
        svg.appendChild(highlight);
    }

    generateMiniCircularDisplacement(svg, seed, complexity, lineWidth) {
        const numLines = 14;
        const spacing = 56 / numLines;
        
        // Vortex centers
        const vortices = [
            { x: 18, y: 28, charge: 1 },
            { x: 38, y: 28, charge: -1 }
        ];
        
        for (let i = 0; i < numLines; i++) {
            const y = i * spacing;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            const numPoints = 50;
            for (let j = 0; j <= numPoints; j++) {
                const x = (56 * j) / numPoints;
                
                // Calculate vector field
                let dispX = 0, dispY = 0;
                
                for (const vortex of vortices) {
                    const dx = x - vortex.x;
                    const dy = y - vortex.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    
                    if (dist > 2) {
                        const decay = Math.exp(-dist / 15);
                        const strength = (decay / Math.sqrt(dist)) * 3;
                        
                        // Tangential
                        const tangAngle = angle + (Math.PI / 2) * vortex.charge;
                        dispX += Math.cos(tangAngle) * strength;
                        dispY += Math.sin(tangAngle) * strength;
                    }
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
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth);
            svg.appendChild(path);
        }
        
        // Vortex markers with field lines
        for (const vortex of vortices) {
            // Field lines
            for (let ring = 1; ring <= 2; ring++) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', vortex.x);
                circle.setAttribute('cy', vortex.y);
                circle.setAttribute('r', ring * 6);
                circle.setAttribute('fill', 'none');
                circle.setAttribute('stroke', '#666');
                circle.setAttribute('stroke-width', lineWidth * 0.2);
                circle.setAttribute('stroke-opacity', 0.3);
                circle.setAttribute('stroke-dasharray', '2,2');
                svg.appendChild(circle);
            }
            
            // Center marker
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', vortex.x);
            marker.setAttribute('cy', vortex.y);
            marker.setAttribute('r', 2);
            marker.setAttribute('fill', vortex.charge > 0 ? '#333' : '#666');
            marker.setAttribute('fill-opacity', '0.7');
            svg.appendChild(marker);
        }
    }

    generateMiniMoireInterference(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const spacing = 56 / (complexity + 2);
        
        // Three layers with different angles (grid pattern preview)
        const layers = [
            { angle: 0, opacity: 0.8 },
            { angle: 15, opacity: 0.6 },
            { angle: -12, opacity: 0.5 }
        ];
        
        for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
            const layer = layers[layerIdx];
            
            // Horizontal lines
            for (let y = 0; y < 56 + spacing; y += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', 56);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#000');
                line.setAttribute('stroke-width', lineWidth * (1 - layerIdx * 0.15));
                line.setAttribute('stroke-opacity', layer.opacity);
                line.setAttribute('transform', `rotate(${layer.angle} ${centerX} ${centerY})`);
            svg.appendChild(line);
        }

            // Vertical lines
            for (let x = 0; x < 56 + spacing; x += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x);
                line.setAttribute('y1', 0);
                line.setAttribute('x2', x);
                line.setAttribute('y2', 56);
            line.setAttribute('stroke', '#000');
                line.setAttribute('stroke-width', lineWidth * (1 - layerIdx * 0.15));
                line.setAttribute('stroke-opacity', layer.opacity);
                line.setAttribute('transform', `rotate(${layer.angle} ${centerX} ${centerY})`);
            svg.appendChild(line);
        }
        }
        
        // Center marker
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', centerX);
        marker.setAttribute('cy', centerY);
        marker.setAttribute('r', 1.5);
        marker.setAttribute('fill', '#000');
        marker.setAttribute('fill-opacity', '0.5');
        svg.appendChild(marker);
    }

    generateMiniSpiralDistortion(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const numArms = 4; // Clean 4-arm spiral
        const maxRadius = 26;
        const phi = (1 + Math.sqrt(5)) / 2;

        for (let armIdx = 0; armIdx < numArms; armIdx++) {
            const baseAngle = (armIdx / numArms) * Math.PI * 2;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 40;
            for (let i = 0; i <= numPoints; i++) {
                const progress = i / numPoints;
                const radius = maxRadius * Math.pow(progress, 1 / phi);
                const angleProgress = progress * 3; // 3 full rotations
                const angle = baseAngle + angleProgress * Math.PI * 2;
                
                // Subtle wave for beauty
                const waveOffset = Math.sin(angleProgress * 4) * 0.1 * radius;
                const finalRadius = radius + waveOffset;
                
                const x = centerX + Math.cos(angle) * finalRadius;
                const y = centerY + Math.sin(angle) * finalRadius;
                
                if (i === 0) {
                    pathData = `M ${x} ${y}`;
                } else {
                pathData += ` L ${x} ${y}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.9);
            path.style.strokeLinecap = 'round';
            svg.appendChild(path);
        }
        
        // Center dot
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', centerX);
        center.setAttribute('cy', centerY);
        center.setAttribute('r', 2);
        center.setAttribute('fill', '#000');
        svg.appendChild(center);
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
            this.generateNew();
        });

        document.getElementById('variation-btn').addEventListener('click', () => {
            this.generateVariation();
        });

        document.getElementById('layer-btn').addEventListener('click', () => {
            this.currentSeed = Math.random();
            this.generatePattern(false);
        });

        document.getElementById('randomize-all-btn').addEventListener('click', () => {
            this.randomizeAll();
        });

        document.getElementById('reset-all-btn').addEventListener('click', () => {
            this.resetAll();
        });

        document.getElementById('generate-colors-btn').addEventListener('click', () => {
            this.generateColorPalette();
        });

        // Visual Explorer listeners
        document.getElementById('new-generation-btn').addEventListener('click', () => {
            this.generateRandomVariants();
        });

        document.getElementById('use-variant-btn').addEventListener('click', () => {
            this.applyVariantToCanvas();
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

        document.getElementById('export-transparent-png-btn').addEventListener('click', () => {
            this.exportTransparentPNG();
        });

        document.getElementById('export-icon-png-btn').addEventListener('click', () => {
            this.exportIconPNG();
        });

        // Video export listeners
        document.getElementById('record-video-btn').addEventListener('click', async () => {
            const duration = parseInt(document.getElementById('video-duration').value);
            
            if (!this.isAnimating) {
                this.showError('Please enable at least one animation (🎬) before recording!');
                return;
            }
            
            await this.startVideoRecording(duration);
        });

        document.getElementById('video-duration').addEventListener('change', (e) => {
            const btn = document.getElementById('record-video-btn');
            btn.textContent = `🎥 Record Video (${e.target.value}s)`;
        });

        // Animation preview scrubber
        document.getElementById('animation-preview').addEventListener('input', (e) => {
            const duration = parseInt(document.getElementById('video-duration').value);
            const fps = parseInt(document.getElementById('video-fps')?.value || 24);
            const totalFrames = duration * fps;
            
            const progress = parseFloat(e.target.value) / 100; // 0 to 1
            const currentFrame = Math.round(progress * totalFrames);
            const timeInSeconds = currentFrame / fps;
            
            // Update time and frame display
            document.getElementById('preview-time').textContent = `${timeInSeconds.toFixed(2)}s`;
            document.getElementById('preview-frame').textContent = `Frame ${currentFrame}/${totalFrames}`;
            
            // Preview the animation at this point in time
            this.previewAnimationAtTime(timeInSeconds, duration);
        });
        
        // Update frame count when duration or FPS changes
        const updateFrameCount = () => {
            const duration = parseInt(document.getElementById('video-duration').value);
            const fps = parseInt(document.getElementById('video-fps')?.value || 24);
            const totalFrames = duration * fps;
            const preview = document.getElementById('animation-preview');
            const progress = parseFloat(preview.value) / 100;
            const currentFrame = Math.round(progress * totalFrames);
            document.getElementById('preview-frame').textContent = `Frame ${currentFrame}/${totalFrames}`;
        };
        
        document.getElementById('video-duration').addEventListener('change', updateFrameCount);
        document.getElementById('video-fps').addEventListener('change', updateFrameCount);

        // Dark mode toggle
        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            const canvasContainer = document.querySelector('.canvas-container');
            if (e.target.checked) {
                canvasContainer.classList.add('dark-mode');
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                this.applyDarkMode(true);
            } else {
                canvasContainer.classList.remove('dark-mode');
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                this.applyDarkMode(false);
            }
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

        document.getElementById('symmetry').addEventListener('change', () => {
            this.generatePattern(true);
        });

        document.getElementById('frequency').addEventListener('input', (e) => {
            document.getElementById('frequency-value').textContent = e.target.value;
            this.generatePattern(true);
        });
        
        document.getElementById('glow').addEventListener('input', (e) => {
            document.getElementById('glow-value').textContent = e.target.value;
            this.generatePattern(true);
        });

        document.getElementById('zoom-amount').addEventListener('input', (e) => {
            document.getElementById('zoom-amount-value').textContent = e.target.value;
        });

        document.getElementById('amplitude').addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            document.getElementById('amplitude-value').textContent = val >= 0 ? `+${val}` : val;
            this.generatePattern(true);
        });

        document.getElementById('rotation').addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            const sign = val > 0 ? '+' : (val < 0 ? '' : '');
            document.getElementById('rotation-value').textContent = `${sign}${val}°`;
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

        // Individual animation checkboxes
        const animationCheckboxes = [
            { id: 'animate-complexity', rangeId: 'complexity-range', param: 'complexity', min: 5, max: 300, factor: 0.5 },
            { id: 'animate-frequency', rangeId: 'frequency-range', param: 'frequency', min: 1, max: 100, factor: 0.6 },
            { id: 'animate-amplitude', rangeId: 'amplitude-range', param: 'amplitude', min: -1000, max: 1000, factor: 0.5 },
            { id: 'animate-rotation', rangeId: 'rotation-range', param: 'rotation', min: -180, max: 180, isRotation: true },
            { id: 'animate-glow', rangeId: 'glow-range', param: 'glow', min: 0, max: 10, factor: 0.5 },
            { id: 'animate-zoom', rangeId: 'zoom-range', param: 'zoom', min: 0.1, max: 10, isZoom: true }
        ];
        
        animationCheckboxes.forEach(({id, rangeId, param, min, max, factor, isRotation, isZoom}) => {
            document.getElementById(id).addEventListener('change', (e) => {
                const rangeGroup = document.getElementById(rangeId);
                const isChecked = e.target.checked;
                
                // Show/hide range controls
                rangeGroup.style.display = isChecked ? 'block' : 'none';
                
                // Initialize smart defaults when first checked
                if (isChecked) {
                    const currentValue = parseInt(document.getElementById(param).value);
                    
                    if (isRotation) {
                        // Rotation: default to full 360° rotation
                        document.getElementById(`${param}-start`).value = currentValue;
                        document.getElementById(`${param}-end`).value = 360;
                    } else if (isZoom) {
                        // Zoom: default range around current level
                        document.getElementById(`${param}-start`).value = 0.5;
                        document.getElementById(`${param}-end`).value = 2.0;
                    } else {
                        // Others: create range based on current value
                        const range = Math.abs(currentValue) * factor;
                        const startVal = Math.max(min, Math.round(currentValue - range));
                        const endVal = Math.min(max, Math.round(currentValue + range * 1.5));
                        document.getElementById(`${param}-start`).value = startVal;
                        document.getElementById(`${param}-end`).value = endVal;
                    }
                }
                
                this.updateAnimationState();
            });
        });
        
        // Initial animation state
        this.updateAnimationState();

        // Animation speed slider
        document.getElementById('animation-speed').addEventListener('input', (e) => {
            document.getElementById('animation-speed-value').textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
        });

        document.getElementById('zoom-in-btn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.zoomOut());
        document.getElementById('reset-zoom-btn').addEventListener('click', () => this.resetZoom());

        // Mouse wheel / trackpad zoom on canvas
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY;
            
            if (delta < 0) {
                // Scroll up = Zoom in
                this.zoomIn();
            } else if (delta > 0) {
                // Scroll down = Zoom out
                this.zoomOut();
            }
        }, { passive: false });

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

    updateAnimationState() {
        const anyAnimationActive = 
            document.getElementById('animate-complexity').checked ||
            document.getElementById('animate-frequency').checked ||
            document.getElementById('animate-amplitude').checked ||
            document.getElementById('animate-rotation').checked ||
            document.getElementById('animate-glow').checked ||
            document.getElementById('animate-zoom').checked;
        
        this.isAnimating = anyAnimationActive;
        
        if (this.isAnimating) {
            this.startAnimation();
        } else {
            this.stopAnimation();
        }
    }

    startAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Store original values
        if (!this.originalValues) {
            this.originalValues = {
                complexity: parseInt(document.getElementById('complexity').value),
                frequency: parseInt(document.getElementById('frequency').value),
                amplitude: parseInt(document.getElementById('amplitude').value),
                rotation: parseInt(document.getElementById('rotation').value),
                glow: parseInt(document.getElementById('glow').value),
                zoomLevel: this.zoomLevel
            };
        }
        
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime; // elapsedTime in milliseconds
            const speedMultiplier = parseFloat(document.getElementById('animation-speed').value);
            this.slowAnimationTime = (elapsedTime / 10000) * speedMultiplier;
            
            // Check animation mode
            const animationMode = document.getElementById('animation-mode')?.value || 'bounce';
            
            // Calculate oscillation/progression based on mode
            let oscillation;
            if (animationMode === 'linear') {
                // Linear progression: 0 to 1 over time (for smooth video transitions)
                oscillation = (this.slowAnimationTime % 1); // 0 to 1, repeats
            } else {
                // Bounce mode: sine wave oscillation -1 to 1
                oscillation = Math.sin(this.slowAnimationTime * Math.PI * 2);
            }
            
            // Animate each parameter if checkbox is checked (using user-defined ranges)
            if (document.getElementById('animate-complexity').checked) {
                const startVal = parseFloat(document.getElementById('complexity-start').value);
                const endVal = parseFloat(document.getElementById('complexity-end').value);
                const newValue = animationMode === 'linear' 
                    ? Math.round(startVal + oscillation * (endVal - startVal))
                    : Math.round(this.originalValues.complexity + oscillation * (endVal - startVal) / 2);
                document.getElementById('complexity').value = Math.max(5, Math.min(300, newValue));
                document.getElementById('complexity-value').textContent = newValue;
            }
            
            if (document.getElementById('animate-frequency').checked) {
                const startVal = parseFloat(document.getElementById('frequency-start').value);
                const endVal = parseFloat(document.getElementById('frequency-end').value);
                const newValue = animationMode === 'linear'
                    ? Math.round(startVal + oscillation * (endVal - startVal))
                    : Math.round(this.originalValues.frequency + oscillation * (endVal - startVal) / 2);
                document.getElementById('frequency').value = Math.max(1, Math.min(100, newValue));
                document.getElementById('frequency-value').textContent = newValue;
            }
            
            if (document.getElementById('animate-amplitude').checked) {
                const startVal = parseFloat(document.getElementById('amplitude-start').value);
                const endVal = parseFloat(document.getElementById('amplitude-end').value);
                const newValue = animationMode === 'linear'
                    ? Math.round(startVal + oscillation * (endVal - startVal))
                    : Math.round(this.originalValues.amplitude + oscillation * (endVal - startVal) / 2);
                document.getElementById('amplitude').value = Math.max(-1000, Math.min(1000, newValue));
                document.getElementById('amplitude-value').textContent = newValue >= 0 ? `+${newValue}` : newValue;
            }
            
            if (document.getElementById('animate-rotation').checked) {
                const startVal = parseFloat(document.getElementById('rotation-start').value);
                const endVal = parseFloat(document.getElementById('rotation-end').value);
                const newValue = animationMode === 'linear'
                    ? Math.round(startVal + oscillation * (endVal - startVal))
                    : Math.round(this.originalValues.rotation + this.slowAnimationTime * 30) % 360;
                const normalizedValue = newValue > 180 ? newValue - 360 : newValue;
                document.getElementById('rotation').value = normalizedValue;
                const sign = normalizedValue > 0 ? '+' : (normalizedValue < 0 ? '' : '');
                document.getElementById('rotation-value').textContent = `${sign}${normalizedValue}°`;
            }
            
            if (document.getElementById('animate-glow').checked) {
                const startVal = parseFloat(document.getElementById('glow-start').value);
                const endVal = parseFloat(document.getElementById('glow-end').value);
                const newValue = animationMode === 'linear'
                    ? Math.round(startVal + oscillation * (endVal - startVal))
                    : Math.round(this.originalValues.glow + oscillation * (endVal - startVal) / 2);
                document.getElementById('glow').value = Math.max(0, Math.min(10, newValue));
                document.getElementById('glow-value').textContent = newValue;
            }
            
            if (document.getElementById('animate-zoom').checked) {
                const startZoom = parseFloat(document.getElementById('zoom-start').value);
                const endZoom = parseFloat(document.getElementById('zoom-end').value);
                const newZoomLevel = animationMode === 'linear'
                    ? startZoom + oscillation * (endZoom - startZoom)
                    : this.originalValues.zoomLevel + oscillation * (endZoom - startZoom) / 2;
                
                // Clamp zoom level to reasonable bounds
                this.zoomLevel = Math.max(0.1, Math.min(10, newZoomLevel));
                this.updateViewBox();
            }

            this.generatePattern(true, this.slowAnimationTime);

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
        
        // Reset to original values
        if (this.originalValues) {
            document.getElementById('complexity').value = this.originalValues.complexity;
            document.getElementById('complexity-value').textContent = this.originalValues.complexity;
            
            document.getElementById('frequency').value = this.originalValues.frequency;
            document.getElementById('frequency-value').textContent = this.originalValues.frequency;
            
            document.getElementById('amplitude').value = this.originalValues.amplitude;
            const amp = this.originalValues.amplitude;
            document.getElementById('amplitude-value').textContent = amp >= 0 ? `+${amp}` : amp;
            
            document.getElementById('rotation').value = this.originalValues.rotation;
            const rot = this.originalValues.rotation;
            const sign = rot > 0 ? '+' : (rot < 0 ? '' : '');
            document.getElementById('rotation-value').textContent = `${sign}${rot}°`;
            
            document.getElementById('glow').value = this.originalValues.glow;
            document.getElementById('glow-value').textContent = this.originalValues.glow;
            
            this.zoomLevel = this.originalValues.zoomLevel;
            this.updateViewBox();
            
            this.originalValues = null;
            this.generatePattern(true);
        }
    }

    previewAnimationAtTime(timeInSeconds, totalDuration) {
        // Store original values if not already stored
        if (!this.originalValues) {
            this.originalValues = {
                complexity: parseInt(document.getElementById('complexity').value),
                frequency: parseInt(document.getElementById('frequency').value),
                amplitude: parseInt(document.getElementById('amplitude').value),
                rotation: parseInt(document.getElementById('rotation').value),
                glow: parseInt(document.getElementById('glow').value),
                zoomLevel: this.zoomLevel
            };
        }
        
        // Calculate progress (0 to 1) based on current time in duration
        const progress = timeInSeconds / totalDuration;
        
        // Get animation mode
        const animationMode = document.getElementById('animation-mode').value;
        
        // Use the SAME method as video export for perfect alignment
        this.applyAnimationForFrame(progress, animationMode);
    }


    applyAnimationForFrame(progress, animationMode) {
        // progress is 0 to 1 representing position in the entire video
        // This ensures animation completes exactly once over the video duration
        
        // Get speed multiplier (expands range but keeps same duration)
        const speedMultiplier = parseFloat(document.getElementById('animation-speed')?.value || 1);
        
        // Calculate oscillation based on mode
        let oscillation;
        if (animationMode === 'linear') {
            // Linear: simple 0 to 1 progression over entire video
            oscillation = progress;
        } else {
            // Bounce: sine wave over entire video
            oscillation = Math.sin(progress * Math.PI * 2);
        }
        
        // Debug first and last frame
        if (progress < 0.01 || progress > 0.99) {
            console.log(`🎬 Frame progress: ${(progress * 100).toFixed(1)}%, mode: ${animationMode}, oscillation: ${oscillation.toFixed(3)}, speed: ${speedMultiplier}x`);
        }
        
        // Apply animation to each parameter if checked (using user-defined ranges)
        // Speed multiplier EXPANDS the range for most properties (not zoom/rotation)
        
        if (document.getElementById('animate-complexity').checked) {
            const startVal = parseFloat(document.getElementById('complexity-start').value);
            const endVal = parseFloat(document.getElementById('complexity-end').value);
            const baseRange = endVal - startVal;
            const expandedRange = baseRange * speedMultiplier; // Expand range by speed
            const newValue = animationMode === 'linear'
                ? startVal + oscillation * expandedRange  // Smooth sub-frame precision
                : startVal + (expandedRange / 2) + oscillation * (expandedRange / 2);
            document.getElementById('complexity').value = Math.max(5, Math.min(300, newValue));
            document.getElementById('complexity-value').textContent = Math.round(newValue);
            
            // Debug first and last frame
            if (progress < 0.01 || progress > 0.99) {
                console.log(`  Complexity: ${startVal} → ${startVal + expandedRange} (speed ${speedMultiplier}x), current: ${newValue.toFixed(1)}`);
            }
        }
        
        if (document.getElementById('animate-frequency').checked) {
            const startVal = parseFloat(document.getElementById('frequency-start').value);
            const endVal = parseFloat(document.getElementById('frequency-end').value);
            const baseRange = endVal - startVal;
            const expandedRange = baseRange * speedMultiplier;
            const newValue = animationMode === 'linear'
                ? startVal + oscillation * expandedRange
                : startVal + (expandedRange / 2) + oscillation * (expandedRange / 2);
            document.getElementById('frequency').value = Math.max(1, Math.min(100, newValue));
            document.getElementById('frequency-value').textContent = Math.round(newValue);
        }
        
        if (document.getElementById('animate-amplitude').checked) {
            const startVal = parseFloat(document.getElementById('amplitude-start').value);
            const endVal = parseFloat(document.getElementById('amplitude-end').value);
            const baseRange = endVal - startVal;
            const expandedRange = baseRange * speedMultiplier;
            const newValue = animationMode === 'linear'
                ? startVal + oscillation * expandedRange
                : startVal + (expandedRange / 2) + oscillation * (expandedRange / 2);
            document.getElementById('amplitude').value = Math.max(-1000, Math.min(1000, newValue));
            const rounded = Math.round(newValue);
            document.getElementById('amplitude-value').textContent = rounded >= 0 ? `+${rounded}` : rounded;
        }
        
        if (document.getElementById('animate-glow').checked) {
            const startVal = parseFloat(document.getElementById('glow-start').value);
            const endVal = parseFloat(document.getElementById('glow-end').value);
            const baseRange = endVal - startVal;
            const expandedRange = baseRange * speedMultiplier;
            const newValue = animationMode === 'linear'
                ? startVal + oscillation * expandedRange
                : startVal + (expandedRange / 2) + oscillation * (expandedRange / 2);
            document.getElementById('glow').value = Math.max(0, Math.min(10, newValue));
            document.getElementById('glow-value').textContent = Math.round(newValue);
        }
        
        // ROTATION & ZOOM: Keep independent (not affected by speed multiplier)
        if (document.getElementById('animate-rotation').checked) {
            const startVal = parseFloat(document.getElementById('rotation-start').value);
            const endVal = parseFloat(document.getElementById('rotation-end').value);
            const newValue = animationMode === 'linear'
                ? startVal + oscillation * (endVal - startVal)  // No speed multiplier
                : startVal + (endVal - startVal) / 2 + oscillation * (endVal - startVal) / 2;
            const normalizedValue = newValue > 180 ? newValue - 360 : newValue;
            document.getElementById('rotation').value = normalizedValue;
            const sign = normalizedValue > 0 ? '+' : (normalizedValue < 0 ? '' : '');
            document.getElementById('rotation-value').textContent = `${sign}${Math.round(normalizedValue)}°`;
        }
        
        if (document.getElementById('animate-zoom').checked) {
            const startZoom = parseFloat(document.getElementById('zoom-start').value);
            const endZoom = parseFloat(document.getElementById('zoom-end').value);
            const newZoomLevel = animationMode === 'linear'
                ? startZoom + oscillation * (endZoom - startZoom)  // No speed multiplier - smooth zoom
                : startZoom + (endZoom - startZoom) / 2 + oscillation * (endZoom - startZoom) / 2;
            
            this.zoomLevel = Math.max(0.1, Math.min(10, newZoomLevel));
            this.updateViewBox();
        }
        
        // Regenerate pattern with new values
        this.generatePattern(true);
    }

    updateSliderValues() {
        document.getElementById('complexity-value').textContent =
            document.getElementById('complexity').value;
        document.getElementById('frequency-value').textContent =
            document.getElementById('frequency').value;
        const amp = parseInt(document.getElementById('amplitude').value);
        document.getElementById('amplitude-value').textContent = amp >= 0 ? `+${amp}` : amp;
        const rot = parseInt(document.getElementById('rotation').value);
        const sign = rot > 0 ? '+' : (rot < 0 ? '' : '');
        document.getElementById('rotation-value').textContent = `${sign}${rot}°`;
        document.getElementById('glow-value').textContent =
            document.getElementById('glow').value;
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
        const isDarkMode = localStorage.getItem('darkMode') === 'true';

        switch(colorMode) {
            case 'black':
                // Switch to white lines in dark mode for visibility
                return isDarkMode ? '#fff' : '#000';
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

                    // Apply symmetry transformation
                    this.applySymmetry(layerGroup);
                    
                    // Apply glow effect
                    this.applyGlow(layerGroup);

                } catch (error) {
                    console.error('Error generating pattern:', error);
                    this.showError(`Failed to generate pattern: ${error.message}`);
                } finally {
                    this.canvas.classList.remove('optical-loading');
                    this.isGenerating = false;
                    this.updateViewBox(); // Apply current zoom/pan after generation
                    
                    // Apply GPU optimizations after pattern is rendered
                    setTimeout(() => {
                        this.optimizeSVGPerformance();
                        this.optimizePathElements();
                    }, 50);
                }
            }, 100);
        } catch (error) {
            console.error('Error in generatePattern:', error);
            this.showError('Failed to start pattern generation');
            this.isGenerating = false;
        }
    }

    // Helper to get auto line width based on complexity
    getAutoLineWidth() {
        const complexity = parseInt(document.getElementById('complexity').value);
        // Auto-scale line width inversely with complexity
        // Low complexity (5-50): thicker lines (3-2px)
        // Medium complexity (50-150): medium lines (2-1px)
        // High complexity (150+): thinner lines (1-0.5px)
        if (complexity < 50) {
            return 3 - (complexity / 50);  // 3 to 2
        } else if (complexity < 150) {
            return 2 - ((complexity - 50) / 100); // 2 to 1
        } else {
            return Math.max(0.5, 1 - ((complexity - 150) / 300)); // 1 to 0.5
        }
    }

    applySymmetry(layerGroup) {
        const symmetry = document.getElementById('symmetry').value;
        if (symmetry === 'none') return;

        const copies = parseInt(symmetry);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Clone the original layer for each symmetry copy
        const originalContent = layerGroup.cloneNode(true);
        layerGroup.innerHTML = ''; // Clear original

        for (let i = 0; i < copies; i++) {
            const copy = originalContent.cloneNode(true);
            const angle = (360 / copies) * i;
            
            // Apply rotation transform around center
            copy.setAttribute('transform', `rotate(${angle} ${centerX} ${centerY})`);
            layerGroup.appendChild(copy);
        }
    }

    applyGlow(layerGroup) {
        const glowIntensity = parseInt(document.getElementById('glow').value);
        if (glowIntensity === 0) return;

        // Create or update glow filter
        let defs = this.canvas.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this.canvas.insertBefore(defs, this.canvas.firstChild);
        }

        // Remove old glow filter if exists
        const oldFilter = defs.querySelector('#glow-filter');
        if (oldFilter) {
            oldFilter.remove();
        }

        // OPTIMIZED: Calculate filter region based on glow intensity
        // Smaller region = faster rendering
        const filterPadding = Math.min(100, glowIntensity * 15);
        
        // OPTIMIZED: Count elements to decide quality vs speed
        const elementCount = layerGroup.querySelectorAll('*').length;
        const isComplex = elementCount > 1000;

        // Create new glow filter
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'glow-filter');
        filter.setAttribute('x', `-${filterPadding}%`);
        filter.setAttribute('y', `-${filterPadding}%`);
        filter.setAttribute('width', `${100 + filterPadding * 2}%`);
        filter.setAttribute('height', `${100 + filterPadding * 2}%`);
        
        // OPTIMIZED: Use sRGB for better GPU acceleration
        filter.setAttribute('color-interpolation-filters', 'sRGB');

        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('in', 'SourceGraphic');
        blur.setAttribute('stdDeviation', glowIntensity);
        
        // OPTIMIZED: Reduce quality for complex patterns (faster but still beautiful)
        if (isComplex && glowIntensity > 3) {
            blur.setAttribute('edgeMode', 'none'); // Faster edge handling
        }
        
        blur.setAttribute('result', 'coloredBlur');

        // OPTIMIZED: Add brightness boost for more vibrant glow
        const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        colorMatrix.setAttribute('in', 'coloredBlur');
        colorMatrix.setAttribute('type', 'matrix');
        // Boost brightness for more dramatic glow effect
        const boost = 1.2;
        colorMatrix.setAttribute('values', 
            `${boost} 0 0 0 0
             0 ${boost} 0 0 0
             0 0 ${boost} 0 0
             0 0 0 1 0`);
        colorMatrix.setAttribute('result', 'brightGlow');

        const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNode1.setAttribute('in', 'brightGlow');
        const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNode2.setAttribute('in', 'SourceGraphic');

        merge.appendChild(mergeNode1);
        merge.appendChild(mergeNode2);
        filter.appendChild(blur);
        filter.appendChild(colorMatrix);
        filter.appendChild(merge);
        defs.appendChild(filter);

        // Apply filter to layer group
        layerGroup.setAttribute('filter', 'url(#glow-filter)');
        
        // OPTIMIZED: GPU hint for filtered elements
        layerGroup.style.willChange = 'filter';
    }

    generateLSystem(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

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
        const baseSize = Math.min(this.actualWidth, this.actualHeight);
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
                startY = this.actualHeight - 20;
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
                                const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                                leaf.setAttribute('cx', x);
                                leaf.setAttribute('cy', y);
                                leaf.setAttribute('r', lineWidth * 1.5);
                                leaf.setAttribute('fill', this.getLineColor(depth, maxDepth));
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
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', seg.x1);
                line.setAttribute('y1', seg.y1);
                line.setAttribute('x2', seg.x2);
                line.setAttribute('y2', seg.y2);
                
                // Color by depth (trunk darker, branches lighter)
                const color = this.getLineColor(seg.depth, maxDepth);
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
            const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            centerDot.setAttribute('cx', centerX);
            centerDot.setAttribute('cy', centerY);
            centerDot.setAttribute('r', Math.max(2, lineWidth));
            centerDot.setAttribute('fill', this.getLineColor(0, 1));
            centerDot.setAttribute('fill-opacity', '0.8');
            layerGroup.appendChild(centerDot);
        }

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }
    }

    generateCellularAutomata(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
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
        const lineWidth = this.getAutoLineWidth();
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
        const lineWidth = this.getAutoLineWidth();
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
        const lineWidth = this.getAutoLineWidth();
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

    generateConcentricCircles(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
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
            
            // Optical art style - mostly outlines with occasional accents
            const colorIndex = i;
            const color = this.getLineColor(colorIndex, numRings);
            const colorMode = document.getElementById('color-mode').value;
            
            // Make it line-based optical art (not solid)
            if (i % 5 === 0 && amplitude > 50) {
                // Only every 5th ring filled, and only if amplitude is high
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.15'); // Very transparent
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', thickness);
            } else {
                // All other rings: outline only (optical art!)
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', thickness);
            }

            if (rotation !== 0) {
                const ringRotation = rotation + progress * 45; // Progressive rotation
                path.setAttribute('transform', `rotate(${ringRotation} ${centerX} ${centerY})`);
            }
            
            layerGroup.appendChild(path);
        }
        
        // Add subtle center dot only if complexity is low (otherwise rings already fill center)
        if (numRings < 30) {
            const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            centerDot.setAttribute('cx', centerX);
            centerDot.setAttribute('cy', centerY);
            centerDot.setAttribute('r', Math.max(2, lineWidth));
            centerDot.setAttribute('fill', this.getLineColor(0, 1));
            centerDot.setAttribute('opacity', '0.5');
            layerGroup.appendChild(centerDot);
        }
    }

    generateDiagonalStripes(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
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

    generateCubeIllusion(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
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

    generateEyePattern(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        const maxRadius = Math.min(this.actualWidth, this.actualHeight) * 0.45;
        const numRings = Math.max(15, complexity);
        
        // Use amplitude for organic distortion intensity
        const distortionIntensity = amplitude / 100;
        
        // Use frequency for iris detail complexity
        const irisDetailLevel = Math.max(8, Math.floor(frequency / 10));

        // Create organic eye shape with distorted ellipses
        for (let i = 0; i < numRings; i++) {
            const progress = i / numRings;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            // Ellipse parameters with organic variation
            const baseRx = maxRadius * progress;
            const baseRy = maxRadius * 0.6 * progress;
            
            const numPoints = 120;
            const angleStep = (Math.PI * 2) / numPoints;
            
            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Add multiple wave frequencies for organic feel
                const organicWave1 = Math.sin(angle * 2 + this.currentSeed * 10) * distortionIntensity * 0.1;
                const organicWave2 = Math.sin(angle * 4 + progress * Math.PI * 2) * distortionIntensity * 0.05;
                const organicWave3 = Math.sin(angle * 8) * distortionIntensity * 0.03;
                
                const modulation = 1 + organicWave1 + organicWave2 + organicWave3;
                
                const rx = baseRx * modulation;
                const ry = baseRy * modulation;
                
                const x = centerX + rx * Math.cos(angle);
                const y = centerY + ry * Math.sin(angle);
                
                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            pathData += ' Z';
            
            path.setAttribute('d', pathData);
            
            // Color and style variations
            const colorIndex = i;
            const color = this.getLineColor(colorIndex, numRings);
            const colorMode = document.getElementById('color-mode').value;
            
            // Alternating filled/outline for depth
            if (i % 3 === 0) {
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.4');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth * 0.5);
            } else if (i % 3 === 1) {
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth);
            } else {
                if (colorMode === 'black') {
                    path.setAttribute('fill', '#f0f0f0');
                    path.setAttribute('fill-opacity', '0.3');
                    path.setAttribute('stroke', '#000');
                    path.setAttribute('stroke-width', lineWidth * 0.3);
                } else {
                    path.setAttribute('fill', color);
                    path.setAttribute('fill-opacity', '0.2');
                    path.setAttribute('stroke', 'none');
                }
            }
            
            layerGroup.appendChild(path);
        }
        
        // Add radial iris lines for detail
        const irisRadius = maxRadius * 0.3;
        const pupilRadius = maxRadius * 0.12;
        
        for (let i = 0; i < irisDetailLevel * 3; i++) {
            const angle = (Math.PI * 2 * i) / (irisDetailLevel * 3);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Start from pupil edge
            const startX = centerX + pupilRadius * Math.cos(angle);
            const startY = centerY + pupilRadius * Math.sin(angle);
            
            // Create wavy iris line
            let pathData = `M ${startX} ${startY}`;
            const numSegments = 20;
            
            for (let t = 0; t <= numSegments; t++) {
                const progress = t / numSegments;
                const radius = pupilRadius + (irisRadius - pupilRadius) * progress;
                
                // Add wave to iris lines for organic texture
                const waveOffset = Math.sin(progress * Math.PI * 3) * distortionIntensity * 5;
                const offsetAngle = angle + waveOffset * 0.01;
                
                const x = centerX + radius * Math.cos(offsetAngle);
                const y = centerY + radius * Math.sin(offsetAngle);
                
                pathData += ` L ${x} ${y}`;
            }
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            
            const irisColor = this.getLineColor(i, irisDetailLevel * 3);
            path.setAttribute('stroke', irisColor);
            path.setAttribute('stroke-width', lineWidth * 0.3);
            path.setAttribute('stroke-opacity', '0.6');
            
            layerGroup.appendChild(path);
        }
        
        // Add animated pupil with gradient effect
        const pupilGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Outer pupil ring (iris border)
        const pupilBorder = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupilBorder.setAttribute('cx', centerX);
        pupilBorder.setAttribute('cy', centerY);
        pupilBorder.setAttribute('r', pupilRadius * 1.2);
        pupilBorder.setAttribute('fill', this.getLineColor(0, 1));
        pupilBorder.setAttribute('fill-opacity', '0.8');
        pupilGroup.appendChild(pupilBorder);
        
        // Main pupil
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', pupilRadius);
        pupil.setAttribute('fill', '#000');
        pupilGroup.appendChild(pupil);
        
        // Pupil highlight for realism
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        highlight.setAttribute('cx', centerX - pupilRadius * 0.3);
        highlight.setAttribute('cy', centerY - pupilRadius * 0.3);
        highlight.setAttribute('r', pupilRadius * 0.3);
        highlight.setAttribute('fill', '#fff');
        highlight.setAttribute('fill-opacity', '0.6');
        pupilGroup.appendChild(highlight);
        
        layerGroup.appendChild(pupilGroup);
        
        // Add eyelid curves for realism
        const eyelidTop = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const eyelidBottom = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        const eyelidWidth = maxRadius * 1.1;
        const eyelidCurve = maxRadius * 0.3;
        
        // Top eyelid
        eyelidTop.setAttribute('d', `M ${centerX - eyelidWidth} ${centerY} Q ${centerX} ${centerY - eyelidCurve} ${centerX + eyelidWidth} ${centerY}`);
        eyelidTop.setAttribute('fill', 'none');
        eyelidTop.setAttribute('stroke', this.getLineColor(0, 1));
        eyelidTop.setAttribute('stroke-width', lineWidth * 2);
        eyelidTop.setAttribute('stroke-linecap', 'round');
        layerGroup.appendChild(eyelidTop);
        
        // Bottom eyelid
        eyelidBottom.setAttribute('d', `M ${centerX - eyelidWidth} ${centerY} Q ${centerX} ${centerY + eyelidCurve * 0.7} ${centerX + eyelidWidth} ${centerY}`);
        eyelidBottom.setAttribute('fill', 'none');
        eyelidBottom.setAttribute('stroke', this.getLineColor(0, 1));
        eyelidBottom.setAttribute('stroke-width', lineWidth * 2);
        eyelidBottom.setAttribute('stroke-linecap', 'round');
        layerGroup.appendChild(eyelidBottom);
    }

    generateSquareTunnel(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;
        const isDarkMode = localStorage.getItem('darkMode') === 'true';

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
                    // In dark mode, color is already white, so alternate with black
                    const alternateFill = isDarkMode ? '#000' : '#fff';
                    path.setAttribute('fill', alternateFill);
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
        
        // Apply overall rotation if set
        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }
    }

    generateWaveDisplacement(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use complexity for line density
        const numLines = Math.max(20, complexity);
        const stripeSpacing = this.actualHeight / numLines;
        
        // Use amplitude for wave intensity
        const waveAmplitude = amplitude / 10;
        
        // Use frequency for wave complexity (number of wave sources)
        const numWaveSources = Math.max(2, Math.floor(frequency / 20));

        // Create multiple wave source points for interference
        const waveSources = [];
        for (let i = 0; i < numWaveSources; i++) {
            const angle = (Math.PI * 2 * i) / numWaveSources;
            const radius = Math.min(this.actualWidth, this.actualHeight) * 0.3;
            waveSources.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                phase: i * Math.PI / 2
            });
        }

        let lineIndex = 0;
        for (let y = 0; y < this.actualHeight + stripeSpacing; y += stripeSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            const lineProgress = y / this.actualHeight;
            
            // Sample points along the line
            const numPoints = 200;
            for (let i = 0; i <= numPoints; i++) {
                const x = (this.actualWidth * i) / numPoints;
                
                // Calculate interference from all wave sources
                let totalDisplacement = 0;
                
                for (const source of waveSources) {
                    const distanceToSource = Math.sqrt(
                        Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2)
                    );
                    
                    // Radial wave with decay
                    const waveNumber = 0.05 + (frequency / 1000);
                    const decay = Math.exp(-distanceToSource / 400);
                    const wave = Math.sin(distanceToSource * waveNumber + source.phase + this.currentSeed * 10) * decay;
                    
                    totalDisplacement += wave;
                }
                
                // Add horizontal traveling wave
                const travelingWave = Math.sin((x / this.actualWidth) * Math.PI * frequency * 0.1 + this.currentSeed * 5);
                totalDisplacement += travelingWave * 0.3;
                
                // Add standing wave pattern
                const standingWave = Math.sin((x / this.actualWidth) * Math.PI * 4) * Math.cos(lineProgress * Math.PI * 3);
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
            const color = this.getLineColor(lineIndex, numLines);
            const colorMode = document.getElementById('color-mode').value;
            
            if (lineIndex % 4 === 0) {
                // Filled bands for 3D effect
                const nextY = y + stripeSpacing;
                
                // Complete the band
                for (let i = numPoints; i >= 0; i--) {
                    const x = (this.actualWidth * i) / numPoints;
                    
                    // Calculate next line displacement
                    let totalDisplacement = 0;
                    for (const source of waveSources) {
                        const distanceToSource = Math.sqrt(
                            Math.pow(x - source.x, 2) + Math.pow(nextY - source.y, 2)
                        );
                        const waveNumber = 0.05 + (frequency / 1000);
                        const decay = Math.exp(-distanceToSource / 400);
                        const wave = Math.sin(distanceToSource * waveNumber + source.phase + this.currentSeed * 10) * decay;
                        totalDisplacement += wave;
                    }
                    
                    const travelingWave = Math.sin((x / this.actualWidth) * Math.PI * frequency * 0.1 + this.currentSeed * 5);
                    totalDisplacement += travelingWave * 0.3;
                    
                    const nextLineProgress = nextY / this.actualHeight;
                    const standingWave = Math.sin((x / this.actualWidth) * Math.PI * 4) * Math.cos(nextLineProgress * Math.PI * 3);
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
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', source.x);
            marker.setAttribute('cy', source.y);
            marker.setAttribute('r', Math.max(2, lineWidth));
            marker.setAttribute('fill', this.getLineColor(i, waveSources.length));
            marker.setAttribute('fill-opacity', '0.5');
            marker.setAttribute('stroke', this.getLineColor(i, waveSources.length));
            marker.setAttribute('stroke-width', lineWidth);
            
            if (rotation !== 0) {
                marker.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }
            
            layerGroup.appendChild(marker);
        }
    }

    generateCircularDisplacement(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use complexity for line density
        const numLines = Math.max(20, complexity);
        const lineSpacing = this.actualHeight / numLines;
        
        // Use amplitude for field strength
        const fieldStrength = amplitude / 5;
        
        // Use frequency for number of vortex centers
        const numVortices = Math.max(2, Math.floor(frequency / 25));

        // Create multiple vortex centers (magnetic field sources)
        const vortices = [];
        for (let i = 0; i < numVortices; i++) {
            const angle = (Math.PI * 2 * i) / numVortices + this.currentSeed * 10;
            const radius = Math.min(this.actualWidth, this.actualHeight) * 0.25;
            vortices.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                charge: (i % 2 === 0) ? 1 : -1, // Alternating positive/negative vortices
                strength: 1 + (i / numVortices) * 0.5
            });
        }

        let lineIndex = 0;
        for (let y = 0; y < this.actualHeight + lineSpacing; y += lineSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            const numPoints = 150;
            
            for (let i = 0; i <= numPoints; i++) {
                const x = (this.actualWidth * i) / numPoints;
                
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
                    const decay = Math.exp(-distance / 200) * vortex.strength;
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
            const color = this.getLineColor(lineIndex, numLines);
            const colorMode = document.getElementById('color-mode').value;
            
            // Variable thickness based on position
            const distFromCenter = Math.abs(y - centerY);
            const maxDist = this.actualHeight / 2;
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
        
        // Draw vortex centers with field lines
        for (let i = 0; i < vortices.length; i++) {
            const vortex = vortices[i];
            const vortexColor = this.getLineColor(i, vortices.length);
            
            // Draw circular field lines around vortex
            const numRings = 5;
            for (let ring = 1; ring <= numRings; ring++) {
                const radius = ring * 20;
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', vortex.x);
                circle.setAttribute('cy', vortex.y);
                circle.setAttribute('r', radius);
                circle.setAttribute('fill', 'none');
                circle.setAttribute('stroke', vortexColor);
                circle.setAttribute('stroke-width', lineWidth * 0.3);
                circle.setAttribute('stroke-opacity', 0.3 * (1 - ring / numRings));
                circle.setAttribute('stroke-dasharray', '5,5');
                
                if (rotation !== 0) {
                    circle.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
                }
                
                layerGroup.appendChild(circle);
            }
            
            // Vortex center marker
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', vortex.x);
            marker.setAttribute('cy', vortex.y);
            marker.setAttribute('r', Math.max(3, lineWidth * 1.5));
            marker.setAttribute('fill', vortexColor);
            marker.setAttribute('fill-opacity', '0.7');
            marker.setAttribute('stroke', vortexColor);
            marker.setAttribute('stroke-width', lineWidth);
            
            if (rotation !== 0) {
                marker.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }
            
            layerGroup.appendChild(marker);
            
            // Direction indicator
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const arrowSize = 8;
            const arrowAngle = vortex.charge > 0 ? 0 : Math.PI;
            const arrowPath = `M ${vortex.x + arrowSize} ${vortex.y} 
                               L ${vortex.x + arrowSize * 0.5} ${vortex.y + arrowSize * 0.5}
                               L ${vortex.x + arrowSize * 0.5} ${vortex.y - arrowSize * 0.5} Z`;
            arrow.setAttribute('d', arrowPath);
            arrow.setAttribute('fill', '#fff');
            arrow.setAttribute('fill-opacity', '0.8');
            arrow.setAttribute('transform', `rotate(${arrowAngle * 180 / Math.PI + (rotation || 0)} ${vortex.x} ${vortex.y})`);
            layerGroup.appendChild(arrow);
        }
        
        // Add center attractor
        const centerMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerMarker.setAttribute('cx', centerX);
        centerMarker.setAttribute('cy', centerY);
        centerMarker.setAttribute('r', Math.max(4, lineWidth * 2));
        centerMarker.setAttribute('fill', this.getLineColor(0, 1));
        centerMarker.setAttribute('fill-opacity', '0.5');
        centerMarker.setAttribute('stroke', this.getLineColor(0, 1));
        centerMarker.setAttribute('stroke-width', lineWidth);
        layerGroup.appendChild(centerMarker);
    }

    generateAdvancedEyePattern(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
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

    generateMoireInterference(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use complexity for line density
        const baseSpacing = Math.max(this.actualHeight / complexity, 2);
        
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
                const maxRadius = Math.sqrt(this.actualWidth * this.actualWidth + this.actualHeight * this.actualHeight) / 2;
                const numCircles = Math.ceil(maxRadius / spacing);
                
                for (let i = 0; i < numCircles; i++) {
                    const radius = spacing * (i + 1);
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', centerX);
                    circle.setAttribute('cy', centerY);
                    circle.setAttribute('r', radius);
                    circle.setAttribute('fill', 'none');
                    
                    const color = this.getLineColor(layer, numLayers);
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
                const color = this.getLineColor(layer, numLayers);
                const thickness = lineWidth * (1 - layer * 0.15);
                const layerRotation = rotation + angleStep * layer * 1.5;
                
                // Horizontal lines
                for (let y = 0; y < this.actualHeight + spacing; y += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', this.actualWidth);
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
                for (let x = 0; x < this.actualWidth + spacing; x += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x);
                    line.setAttribute('y1', 0);
                    line.setAttribute('x2', x);
                    line.setAttribute('y2', this.actualHeight);
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
            const layers = Math.max(2, numLayers + 1);
            
            for (let layer = 0; layer < layers; layer++) {
                const layerProgress = layer / (layers - 1);
                
                // Variable spacing for each layer to create moiré
                const spacing = baseSpacing * (1 + spacingVariation * (layer * 0.1 + this.seededRandom(this.currentSeed + layer) * 0.1));
                
                // Different angles for each layer
                const layerAngle = rotation + angleStep * layer;
                
                const color = this.getLineColor(layer, layers);
                const thickness = lineWidth * (1 - layer * 0.12);
                
                // Calculate number of lines needed (accounting for rotation)
                const diagonal = Math.sqrt(this.actualWidth * this.actualWidth + this.actualHeight * this.actualHeight);
                const numLines = Math.ceil(diagonal / spacing) + 10;
                const startY = -diagonal / 2;
                
                for (let i = 0; i < numLines; i++) {
                    const y = startY + i * spacing;
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', -this.actualWidth);
            line.setAttribute('y1', y);
                    line.setAttribute('x2', this.actualWidth * 2);
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
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', centerX);
        marker.setAttribute('cy', centerY);
        marker.setAttribute('r', Math.max(2, lineWidth));
        marker.setAttribute('fill', this.getLineColor(0, 1));
        marker.setAttribute('fill-opacity', '0.5');
        layerGroup.appendChild(marker);
    }

    generateSpiralDistortion(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use complexity for density of spiral rings (MANY more lines for optical art)
        const numRings = Math.max(50, complexity * 2);
        const maxRadius = Math.min(this.actualWidth, this.actualHeight) * 0.48;
        
        // Use amplitude for 3D depth illusion (alternating fills)
        const use3DEffect = Math.abs(amplitude) > 20;
        const absAmplitude = Math.abs(amplitude);
        
        // Use frequency for spiral tightness/rotation speed
        const rotationSpeed = frequency / 10;
        
        // Golden ratio for natural spiral
        const phi = (1 + Math.sqrt(5)) / 2;
        
        // SEED-BASED RANDOMNESS for variation
        const seedOffset = this.seededRandom(this.currentSeed) * Math.PI * 2; // Random rotation
        const wavePhase = this.seededRandom(this.currentSeed + 1) * Math.PI * 2; // Wave phase shift
        const waveFreqVariation = 2 + this.seededRandom(this.currentSeed + 2) * 4; // 2-6 waves
        const spiralDirection = this.seededRandom(this.currentSeed + 3) > 0.5 ? 1 : -1; // Clockwise/counter
        
        // Draw many concentric spiral rings for optical art density
        for (let ringIdx = 0; ringIdx < numRings; ringIdx++) {
            const progress = ringIdx / numRings;
            
            // Logarithmic spiral radius with seed-based micro-variation
            const radiusVariation = 1 + this.seededRandom(this.currentSeed + ringIdx * 0.01) * 0.05;
            const radius = maxRadius * Math.pow(progress, 1 / phi) * radiusVariation;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';
            
            // High resolution circle
            const numPoints = 180;
            for (let i = 0; i <= numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                
                // Spiral twist based on radius (with seed-based direction)
                const spiralAngle = angle + seedOffset + (radius / maxRadius) * rotationSpeed * Math.PI * 2 * spiralDirection;
                
                // Calculate position with seed-varied wave modulation
                const spiralOffset = Math.sin(spiralAngle * waveFreqVariation + wavePhase) * absAmplitude * 0.02;
                const finalRadius = radius + spiralOffset;
                
                const x = centerX + Math.cos(angle) * finalRadius;
                const y = centerY + Math.sin(angle) * finalRadius;
                
                if (i === 0) {
                    pathData = `M ${x} ${y}`;
                } else {
                pathData += ` L ${x} ${y}`;
            }
            }
            pathData += ' Z';

            path.setAttribute('d', pathData);
            
            const color = this.getLineColor(ringIdx, numRings);
            const colorMode = document.getElementById('color-mode').value;
            
            // 3D optical art effect - alternating fills create depth illusion
            if (use3DEffect && ringIdx % 2 === 0) {
                // Filled rings for 3D depth
                path.setAttribute('fill', color);
                path.setAttribute('fill-opacity', '0.6');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth * 0.3);
            } else {
                // Outline rings
            path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', lineWidth * (0.5 + progress * 0.5));
            }
            
            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }
            
            layerGroup.appendChild(path);
        }
        
        // Add center focal point
        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerDot.setAttribute('cx', centerX);
        centerDot.setAttribute('cy', centerY);
        centerDot.setAttribute('r', Math.max(3, lineWidth * 2));
        centerDot.setAttribute('fill', this.getLineColor(0, 1));
        centerDot.setAttribute('fill-opacity', '0.8');
        centerDot.setAttribute('stroke', this.getLineColor(0, 1));
        centerDot.setAttribute('stroke-width', lineWidth);
        layerGroup.appendChild(centerDot);
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

                // Apply shading differently for dark mode
                const isDarkMode = localStorage.getItem('darkMode') === 'true';
                const colorMode = document.getElementById('color-mode').value;
                let finalR, finalG, finalB;
                
                if (isDarkMode && colorMode === 'black') {
                    // In dark mode: invert the shading so bright areas are white, dim areas are gray (not black)
                    // This keeps the pattern visible on black background
                    const invertedIntensity = 0.3 + (shadeIntensity * 0.7); // Range from 30% to 100%
                    finalR = Math.floor(rgb[0] * invertedIntensity);
                    finalG = Math.floor(rgb[1] * invertedIntensity);
                    finalB = Math.floor(rgb[2] * invertedIntensity);
                } else {
                    // Normal shading: dark to bright based on lighting
                    finalR = Math.floor(rgb[0] * shadeIntensity);
                    finalG = Math.floor(rgb[1] * shadeIntensity);
                    finalB = Math.floor(rgb[2] * shadeIntensity);
                }

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
        const lineWidth = this.getAutoLineWidth();
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;
        const isDarkMode = localStorage.getItem('darkMode') === 'true';

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
                // For odd bands, use complementary effect or white/black
                const colorMode = document.getElementById('color-mode').value;
                if (colorMode === 'black') {
                    // In dark mode: use black for contrast with white lines
                    const alternateFill = isDarkMode ? '#000' : '#fff';
                    path.setAttribute('fill', alternateFill);
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

    exportTransparentPNG() {
        try {
            if (!this.canvas || !this.canvas.children.length) {
                throw new Error('No pattern to export. Please generate a pattern first.');
            }

            // Create a high-resolution canvas for export
            const exportCanvas = document.createElement('canvas');
            const ctx = exportCanvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // Set high resolution for wallpaper quality
            const scaleFactor = 2;
            const exportWidth = this.actualWidth * scaleFactor * 4;
            const exportHeight = this.actualHeight * scaleFactor * 4;

            exportCanvas.width = exportWidth;
            exportCanvas.height = exportHeight;

            // NO WHITE BACKGROUND - transparent!

            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(this.canvas);
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                try {
                    // Draw the SVG onto the canvas
                    ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

                    // Export the canvas as PNG with transparency
                    exportCanvas.toBlob((blob) => {
                        if (!blob) {
                            this.showError('Failed to create image blob');
                            return;
                        }

                        const downloadUrl = URL.createObjectURL(blob);
                        const patternType = document.getElementById('pattern-type').value;
                        const colorMode = document.getElementById('color-mode').value;
                        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                        const filename = `optical-art-${patternType}-${colorMode}-${this.actualWidth}x${this.actualHeight}mm-transparent-${timestamp}.png`;

                        const downloadLink = document.createElement('a');
                        downloadLink.href = downloadUrl;
                        downloadLink.download = filename;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                        URL.revokeObjectURL(downloadUrl);

                        this.showSuccess('Transparent PNG exported successfully!');
                    }, 'image/png');

                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Error in transparent PNG export:', error);
                    this.showError(`Failed to export transparent PNG: ${error.message}`);
                    URL.revokeObjectURL(url);
                }
            };

            img.onerror = () => {
                this.showError('Failed to load SVG for transparent PNG export');
                URL.revokeObjectURL(url);
            };

            img.src = url;
        } catch (error) {
            console.error('Error exporting transparent PNG:', error);
            this.showError(`Failed to export transparent PNG: ${error.message}`);
        }
    }

    exportIconPNG() {
        try {
            if (!this.canvas || !this.canvas.children.length) {
                throw new Error('No pattern to export. Please generate a pattern first.');
            }

            // Create a 1024x1024 canvas for macOS icon
            const iconSize = 1024;
            const exportCanvas = document.createElement('canvas');
            const ctx = exportCanvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            exportCanvas.width = iconSize;
            exportCanvas.height = iconSize;

            // NO WHITE BACKGROUND - transparent for icons!

            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(this.canvas);
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                try {
                    // Draw the SVG centered on the canvas
                    ctx.drawImage(img, 0, 0, iconSize, iconSize);

                    // Export the canvas as PNG
                    exportCanvas.toBlob((blob) => {
                        if (!blob) {
                            this.showError('Failed to create image blob');
                            return;
                        }

                        const downloadUrl = URL.createObjectURL(blob);
                        const patternType = document.getElementById('pattern-type').value;
                        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                        const filename = `optical-art-icon-${patternType}-1024x1024-${timestamp}.png`;

                        const downloadLink = document.createElement('a');
                        downloadLink.href = downloadUrl;
                        downloadLink.download = filename;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                        URL.revokeObjectURL(downloadUrl);

                        this.showSuccess('Icon PNG (1024x1024) exported! Open in Preview.app → Export as ICNS for macOS icons.');
                    }, 'image/png');

                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Error in icon PNG export:', error);
                    this.showError(`Failed to export icon PNG: ${error.message}`);
                    URL.revokeObjectURL(url);
                }
            };

            img.onerror = () => {
                this.showError('Failed to load SVG for icon PNG export');
                URL.revokeObjectURL(url);
            };

            img.src = url;
        } catch (error) {
            console.error('Error exporting icon PNG:', error);
            this.showError(`Failed to export icon PNG: ${error.message}`);
        }
    }

    // Pattern saving and loading functionality
    getCurrentPatternState() {
        return {
            patternType: document.getElementById('pattern-type').value,
            complexity: parseInt(document.getElementById('complexity').value),
            symmetry: document.getElementById('symmetry').value,
            formatPreset: document.getElementById('format-preset').value,
            size: parseInt(document.getElementById('size').value),
            frequency: parseInt(document.getElementById('frequency').value),
            amplitude: parseInt(document.getElementById('amplitude').value),
            rotation: parseInt(document.getElementById('rotation').value),
            glow: parseInt(document.getElementById('glow').value),
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
            document.getElementById('symmetry').value = patternData.symmetry || 'none';
            document.getElementById('format-preset').value = patternData.formatPreset || '1:1';
            document.getElementById('size').value = patternData.size || 350;
            document.getElementById('frequency').value = patternData.frequency || 4;
            document.getElementById('amplitude').value = patternData.amplitude || 20;
            document.getElementById('rotation').value = patternData.rotation || 0;
            document.getElementById('glow').value = patternData.glow || 0;
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

    async saveCurrentPattern() {
        const nameInput = document.getElementById('pattern-name');
        const patternName = nameInput.value.trim();

        if (!patternName) {
            this.showError('Please enter a pattern name');
            return;
        }

        try {
            const patternData = this.getCurrentPatternState();
            patternData.name = patternName;

            // Generate thumbnail from current canvas
            const thumbnail = await this.generateThumbnail();
            if (thumbnail) {
                patternData.thumbnail = thumbnail;
            }

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

    generateThumbnail() {
        try {
            if (!this.canvas) return null;

            // Create a temporary canvas to render the thumbnail
            const tempCanvas = document.createElement('canvas');
            const thumbnailSize = 200; // Square thumbnail
            tempCanvas.width = thumbnailSize;
            tempCanvas.height = thumbnailSize;
            const ctx = tempCanvas.getContext('2d');

            if (!ctx) return null;

            // White background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);

            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(this.canvas);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    // Calculate scaling to fit thumbnail (maintain aspect ratio)
                    const scale = Math.min(
                        thumbnailSize / this.actualWidth,
                        thumbnailSize / this.actualHeight
                    );
                    const scaledWidth = this.actualWidth * scale;
                    const scaledHeight = this.actualHeight * scale;
                    const x = (thumbnailSize - scaledWidth) / 2;
                    const y = (thumbnailSize - scaledHeight) / 2;

                    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                    URL.revokeObjectURL(url);

                    // Convert to data URL
                    const dataUrl = tempCanvas.toDataURL('image/png', 0.8);
                    resolve(dataUrl);
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    resolve(null);
                };
                img.src = url;
            });
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
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

        // Use stored thumbnail if available, otherwise generate mini pattern
        if (patternData.thumbnail) {
            const img = document.createElement('img');
            img.src = patternData.thumbnail;
            img.alt = name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            previewDiv.appendChild(img);
        } else {
            // Fallback to generic mini pattern
        const miniSvg = this.generateMiniPattern(patternData.patternType);
        previewDiv.appendChild(miniSvg);
        }

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

    // ==================== PRESET SNAPSHOTS SYSTEM ====================

    getCurrentSettings() {
        return {
            patternType: document.getElementById('pattern-type').value,
            complexity: parseInt(document.getElementById('complexity').value),
            symmetry: document.getElementById('symmetry').value,
            frequency: parseInt(document.getElementById('frequency').value),
            amplitude: parseInt(document.getElementById('amplitude').value),
            rotation: parseInt(document.getElementById('rotation').value),
            glow: parseInt(document.getElementById('glow').value),
            colorMode: document.getElementById('color-mode').value,
            lineColor: document.getElementById('line-color')?.value || '#ff0000',
            gradientColor1: document.getElementById('gradient-color-1')?.value || '#ff00ff',
            gradientColor2: document.getElementById('gradient-color-2')?.value || '#00ffff',
            seed: this.currentSeed
        };
    }

    applySettings(settings) {
        document.getElementById('pattern-type').value = settings.patternType;
        document.getElementById('complexity').value = settings.complexity;
        document.getElementById('symmetry').value = settings.symmetry || 'none';
        document.getElementById('frequency').value = settings.frequency;
        document.getElementById('amplitude').value = settings.amplitude;
        document.getElementById('rotation').value = settings.rotation;
        document.getElementById('glow').value = settings.glow || 0;
        document.getElementById('color-mode').value = settings.colorMode;
        if (settings.lineColor) document.getElementById('line-color').value = settings.lineColor;
        if (settings.gradientColor1) document.getElementById('gradient-color-1').value = settings.gradientColor1;
        if (settings.gradientColor2) document.getElementById('gradient-color-2').value = settings.gradientColor2;
        this.currentSeed = settings.seed;
        
        this.updateSliderValues();
        this.updatePatternInfo();
        this.generatePattern(true);
    }

    savePreset(slot) {
        const settings = this.getCurrentSettings();
        const presets = JSON.parse(localStorage.getItem('opticalArtPresets') || '{}');
        presets[slot] = {
            ...settings,
            timestamp: Date.now(),
            name: `Preset ${slot}`
        };
        localStorage.setItem('opticalArtPresets', JSON.stringify(presets));
        this.updatePresetUI();
        this.updateMorphDropdowns();
        this.showSuccess(`💾 Saved to Preset ${slot}`);
    }

    loadPreset(slot) {
        const presets = JSON.parse(localStorage.getItem('opticalArtPresets') || '{}');
        const preset = presets[slot];
        if (!preset) {
            this.showError(`Preset ${slot} is empty`);
            return;
        }
        this.applySettings(preset);
        this.showSuccess(`Loaded Preset ${slot}`);
    }

    updatePresetUI() {
        const presets = JSON.parse(localStorage.getItem('opticalArtPresets') || '{}');
        document.querySelectorAll('.preset-slot').forEach(button => {
            const slot = button.dataset.slot;
            const status = button.querySelector('.preset-status');
            if (presets[slot]) {
                button.classList.add('filled');
                status.textContent = presets[slot].patternType.split('-')[0];
            } else {
                button.classList.remove('filled');
                status.textContent = 'Empty';
            }
        });
    }

    updateMorphDropdowns() {
        const presets = JSON.parse(localStorage.getItem('opticalArtPresets') || '{}');
        const dropdownA = document.getElementById('morph-preset-a');
        const dropdownB = document.getElementById('morph-preset-b');
        
        [dropdownA, dropdownB].forEach(dropdown => {
            const currentValue = dropdown.value;
            dropdown.innerHTML = '<option value="">Select Preset</option>';
            for (let i = 1; i <= 9; i++) {
                if (presets[i]) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Preset ${i}: ${presets[i].patternType}`;
                    dropdown.appendChild(option);
                }
            }
            dropdown.value = currentValue;
        });
    }

    morphPresets() {
        const slotA = document.getElementById('morph-preset-a').value;
        const slotB = document.getElementById('morph-preset-b').value;
        const morphValue = parseInt(document.getElementById('morph-slider').value) / 100;
        
        if (!slotA || !slotB) {
            this.showError('Please select both Preset A and Preset B');
            return;
        }
        
        const presets = JSON.parse(localStorage.getItem('opticalArtPresets') || '{}');
        const presetA = presets[slotA];
        const presetB = presets[slotB];
        
        if (!presetA || !presetB) {
            this.showError('Selected presets not found');
            return;
        }
        
        // Linear interpolation between settings
        const morphed = {
            patternType: morphValue < 0.5 ? presetA.patternType : presetB.patternType,
            complexity: Math.round(presetA.complexity * (1 - morphValue) + presetB.complexity * morphValue),
            lineWidth: Math.round(presetA.lineWidth * (1 - morphValue) + presetB.lineWidth * morphValue),
            frequency: Math.round(presetA.frequency * (1 - morphValue) + presetB.frequency * morphValue),
            amplitude: Math.round(presetA.amplitude * (1 - morphValue) + presetB.amplitude * morphValue),
            rotation: Math.round(presetA.rotation * (1 - morphValue) + presetB.rotation * morphValue),
            colorMode: morphValue < 0.5 ? presetA.colorMode : presetB.colorMode,
            lineColor: presetA.lineColor,
            gradientColor1: presetA.gradientColor1,
            gradientColor2: presetA.gradientColor2,
            seed: morphValue < 0.5 ? presetA.seed : presetB.seed
        };
        
        this.applySettings(morphed);
        this.showSuccess(`Morphed ${Math.round(morphValue * 100)}% from A to B`);
    }

    generateNew() {
        // MASSIVE randomization - completely new look
        // Use ABSOLUTE ranges instead of scaling from current value
        const current = this.getCurrentSettings();
        const symmetryOptions = ['none', '2', '4', '6', '8', '12'];
        
        const newSettings = {
            ...current,
            complexity: Math.round(10 + Math.random() * 240), // 10-250 (absolute range!)
            symmetry: symmetryOptions[Math.floor(Math.random() * symmetryOptions.length)],
            frequency: Math.round(5 + Math.random() * 90), // 5-95
            amplitude: Math.round(-800 + Math.random() * 1600), // -800 to +800
            rotation: Math.round(-180 + Math.random() * 360), // -180 to +180
            glow: Math.round(Math.random() * 10), // 0-10
            seed: Math.random()
        };
        
        this.applySettings(newSettings);
        this.showSuccess('🎨 Generated new pattern!');
    }

    randomizeAll() {
        // Generate new pattern settings
        this.generateNew();
        
        // 30% chance to use black, 70% chance for colorful gradients
        const useBlack = Math.random() < 0.3;
        
        if (useBlack) {
            // Set to black mode for laser engraving
            document.getElementById('color-mode').value = 'black';
            this.toggleColorControls();
            this.generatePattern(true);
            this.showSuccess('🎲 Randomized EVERYTHING! (Black & White)');
        } else {
            // Generate colorful gradients
            this.generateColorPalette(true); // true = silent mode (no separate success message)
            this.showSuccess('🎲 Randomized EVERYTHING! Pattern + Colors + Settings');
        }
        
        // 15% chance to add a subtle layer for extra complexity
        // This creates interesting overlapping effects without overwhelming the pattern
        if (Math.random() < 0.15) {
            setTimeout(() => {
                this.currentSeed = Math.random();
                this.generatePattern(false); // false = don't clear canvas (creates layer)
                this.showSuccess('✨ Added a subtle layer for extra depth!');
            }, 100); // Small delay to let the first pattern render
        }
    }

    resetAll() {
        // Reset all controls to default values
        const defaultSettings = {
            patternType: 'concentric-circles',
            complexity: 50,
            symmetry: 'none',
            frequency: 4,
            amplitude: 20,
            rotation: 0,
            glow: 0,
            colorMode: 'black',
            lineColor: '#ff0000',
            gradientColor1: '#ff00ff',
            gradientColor2: '#00ffff',
            seed: Math.random()
        };
        
        this.applySettings(defaultSettings);
        this.showSuccess('↺ Reset to defaults! All settings restored');
    }

    generateColorPalette(silent = false) {
        // Generate two completely random colors for a gradient
        // Use full hue range (0-360) with high saturation for vibrant optical art
        
        // First color: completely random hue
        const hue1 = Math.floor(Math.random() * 360);
        const saturation1 = 75 + Math.random() * 25; // 75-100% for vibrant colors
        const lightness1 = 45 + Math.random() * 15; // 45-60% for good contrast
        const color1 = this.hslToHex(hue1, saturation1, lightness1);
        
        // Second color: random but ensure good contrast
        // Either complementary (180° apart) or a random offset (90-270°)
        const useComplementary = Math.random() > 0.5;
        const hueOffset = useComplementary 
            ? 180 
            : 90 + Math.floor(Math.random() * 180); // 90-270° offset
        
        const hue2 = (hue1 + hueOffset) % 360;
        const saturation2 = 75 + Math.random() * 25;
        const lightness2 = 45 + Math.random() * 15;
        const color2 = this.hslToHex(hue2, saturation2, lightness2);
        
        // Always switch to custom-gradient mode to show the generated colors
        document.getElementById('color-mode').value = 'custom-gradient';
        document.getElementById('gradient-color-1').value = color1;
        document.getElementById('gradient-color-2').value = color2;
        this.toggleColorControls();
        
        // Regenerate pattern to show new colors
        this.generatePattern(true);
        
        if (!silent) {
            const gradientType = useComplementary ? 'Complementary' : 'Contrast';
            this.showSuccess(`🎨 ${gradientType} Gradient Generated! (${color1} → ${color2})`);
        }
    }

    // Helper to convert HSL to Hex
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    generateVariation() {
        // SUBTLE variation - similar look with tweaks
        // ±20% variation but ensure it can reach full range
        const current = this.getCurrentSettings();
        
        const varied = {
            ...current,
            complexity: Math.max(5, Math.min(300, Math.round(current.complexity + (Math.random() - 0.5) * 60))), // ±30
            // symmetry stays the same for variations
            frequency: Math.max(1, Math.min(100, Math.round(current.frequency + (Math.random() - 0.5) * 20))), // ±10
            amplitude: Math.max(-1000, Math.min(1000, Math.round(current.amplitude + (Math.random() - 0.5) * 200))), // ±100
            rotation: Math.max(-180, Math.min(180, Math.round(current.rotation + (Math.random() - 0.5) * 40))), // ±20°
            glow: Math.max(0, Math.min(10, Math.round(current.glow + (Math.random() - 0.5) * 4))), // ±2
            seed: Math.random()
        };
        
        this.applySettings(varied);
        this.showSuccess('✨ Generated variation!');
    }

    mutateSettings() {
        const current = this.getCurrentSettings();
        const mutationAmount = 0.2; // 20% variation
        
        const mutated = {
            ...current,
            complexity: Math.max(5, Math.min(300, Math.round(current.complexity * (1 + (Math.random() - 0.5) * mutationAmount * 2)))),
            // symmetry stays the same for mutations (too jarring to change)
            frequency: Math.max(1, Math.min(100, Math.round(current.frequency * (1 + (Math.random() - 0.5) * mutationAmount * 2)))),
            amplitude: Math.max(-1000, Math.min(1000, Math.round(current.amplitude * (1 + (Math.random() - 0.5) * mutationAmount * 2)))),
            rotation: Math.max(-180, Math.min(180, Math.round(current.rotation + (Math.random() - 0.5) * 90))),
            glow: Math.max(0, Math.min(10, Math.round(current.glow + (Math.random() - 0.5) * 6))), // ±3
            seed: Math.random()
        };
        
        this.applySettings(mutated);
        this.showSuccess('Settings mutated! 🎲');
    }

    clearAllPresets() {
        if (!confirm('Clear all presets? This cannot be undone.')) {
            return;
        }
        localStorage.removeItem('opticalArtPresets');
        this.updatePresetUI();
        this.updateMorphDropdowns();
        this.showSuccess('All presets cleared');
    }

    // ==================== VISUAL EXPLORER SYSTEM ====================

    generateRandomVariants() {
        // Use current settings as starting point but create VERY different variations
        const currentSettings = this.getCurrentSettings();
        const symmetryOptions = ['none', '2', '4', '6', '8', '12'];
        
        this.explorerVariants = [];
        for (let i = 0; i < 12; i++) {
            // MUCH larger variations for visual diversity
            const complexityVar = Math.round((Math.random() - 0.5) * 200); // ±100 (was ±40)
            const frequencyVar = Math.round((Math.random() - 0.5) * 80); // ±40 (was ±20)
            const amplitudeVar = Math.round((Math.random() - 0.5) * 1200); // ±600 (was ±200)
            const rotationVar = Math.round((Math.random() - 0.5) * 240); // ±120° (was ±60°)
            const glowVar = Math.round((Math.random() - 0.5) * 12); // ±6 (was ±3)
            
            // Randomly shift symmetry sometimes (50% chance)
            let newSymmetry = currentSettings.symmetry;
            if (Math.random() > 0.5) {
                newSymmetry = symmetryOptions[Math.floor(Math.random() * symmetryOptions.length)];
            }
            
            // Dramatic color variations (full spectrum)
            const hueShift = (Math.random() - 0.5) * 240; // ±120° hue shift (was ±60°)
            
            this.explorerVariants.push({
                patternType: currentSettings.patternType,
                complexity: Math.max(5, Math.min(300, currentSettings.complexity + complexityVar)),
                symmetry: newSymmetry,
                frequency: Math.max(1, Math.min(100, currentSettings.frequency + frequencyVar)),
                amplitude: Math.max(-1000, Math.min(1000, currentSettings.amplitude + amplitudeVar)),
                rotation: Math.max(-180, Math.min(180, currentSettings.rotation + rotationVar)),
                glow: Math.max(0, Math.min(10, currentSettings.glow + glowVar)),
                colorMode: currentSettings.colorMode,
                lineColor: this.shiftHue(currentSettings.lineColor, hueShift),
                gradientColor1: this.shiftHue(currentSettings.gradientColor1, hueShift),
                gradientColor2: this.shiftHue(currentSettings.gradientColor2, hueShift),
                seed: Math.random()
            });
        }
        
        this.explorerGeneration = 1;
        this.selectedVariantIndex = -1;
        this.parentVariant = null;
        document.getElementById('generation-counter').textContent = 'Generation 1 - Exploring Variations';
        document.getElementById('use-variant-btn').disabled = true;
        
        this.renderExplorerGrid();
        this.showSuccess('🎨 12 diverse variations created!');
    }

    generateMutatedVariants(parent) {
        // Generate 12 mutations based on parent variant
        const symmetryOptions = ['none', '2', '4', '6', '8', '12'];
        const currentSymIndex = symmetryOptions.indexOf(parent.symmetry);
        
        this.explorerVariants = [];
        for (let i = 0; i < 12; i++) {
            // Mutation ranges (smaller than "variation")
            const complexityMutation = Math.round((Math.random() - 0.5) * 40); // ±20
            const frequencyMutation = Math.round((Math.random() - 0.5) * 20); // ±10
            const amplitudeMutation = Math.round((Math.random() - 0.5) * 200); // ±100
            const rotationMutation = Math.round((Math.random() - 0.5) * 60); // ±30°
            const glowMutation = Math.round((Math.random() - 0.5) * 4); // ±2
            
            // Sometimes shift symmetry by 1 step
            let newSymmetry = parent.symmetry;
            if (Math.random() > 0.7 && currentSymIndex >= 0) {
                const shift = Math.random() > 0.5 ? 1 : -1;
                const newIndex = Math.max(0, Math.min(symmetryOptions.length - 1, currentSymIndex + shift));
                newSymmetry = symmetryOptions[newIndex];
            }
            
            // Color mutations (hue shift)
            const hueShift = (Math.random() - 0.5) * 60; // ±30° hue shift
            
            this.explorerVariants.push({
                patternType: parent.patternType, // Keep same pattern type
                complexity: Math.max(5, Math.min(300, parent.complexity + complexityMutation)),
                symmetry: newSymmetry,
                frequency: Math.max(1, Math.min(100, parent.frequency + frequencyMutation)),
                amplitude: Math.max(-1000, Math.min(1000, parent.amplitude + amplitudeMutation)),
                rotation: Math.max(-180, Math.min(180, parent.rotation + rotationMutation)),
                glow: Math.max(0, Math.min(10, parent.glow + glowMutation)),
                colorMode: parent.colorMode,
                lineColor: this.shiftHue(parent.lineColor, hueShift),
                gradientColor1: this.shiftHue(parent.gradientColor1, hueShift),
                gradientColor2: this.shiftHue(parent.gradientColor2, hueShift),
                seed: Math.random()
            });
        }
        
        this.explorerGeneration++;
        this.selectedVariantIndex = -1;
        document.getElementById('generation-counter').textContent = `Generation ${this.explorerGeneration} - Evolving...`;
        document.getElementById('use-variant-btn').disabled = true;
        
        this.renderExplorerGrid();
        this.showSuccess(`🧬 Generation ${this.explorerGeneration} spawned!`);
    }

    shiftHue(hexColor, shift) {
        // Convert hex to HSL, shift hue, convert back
        const r = parseInt(hexColor.slice(1, 3), 16) / 255;
        const g = parseInt(hexColor.slice(3, 5), 16) / 255;
        const b = parseInt(hexColor.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        h = (h * 360 + shift + 360) % 360; // Shift and wrap
        s = s * 100;
        l = l * 100;
        
        return this.hslToHex(h, s, l);
    }

    renderExplorerGrid() {
        const grid = document.getElementById('variants-grid');
        grid.innerHTML = '';
        
        this.explorerVariants.forEach((variant, index) => {
            const item = document.createElement('div');
            item.className = 'variant-item';
            item.dataset.index = index;
            
            // Create thumbnail SVG (larger size for bigger thumbnails)
            const svg = this.generateVariantThumbnail(variant, 200);
            item.appendChild(svg);
            
            // Click handler
            item.addEventListener('click', () => {
                this.selectVariant(index);
            });
            
            grid.appendChild(item);
        });
    }

    generateVariantThumbnail(settings, size) {
        // Create a small SVG preview of the variant
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.style.background = 'white';
        
        // Temporarily store current settings
        const currentSettings = this.getCurrentSettings();
        
        // Apply variant settings temporarily
        this.actualWidth = size;
        this.actualHeight = size;
        
        // Create layer group
        const layerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Generate pattern based on type (simplified for thumbnail)
        try {
            switch(settings.patternType) {
                case 'concentric-circles':
                    this.generateMiniConcentricCircles(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'spiral-distortion':
                    this.generateMiniSpiralDistortion(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'diagonal-stripes':
                    this.generateMiniDiagonalStripes(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'wave-displacement':
                    this.generateMiniWaveDisplacement(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'cube-illusion':
                    this.generateMiniCubeIllusion(svg, settings.seed, Math.min(settings.complexity / 10, 15), this.getAutoLineWidth());
                    break;
                case 'radial-vortex':
                    this.generateMiniRadialVortex(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                default:
                    // Fallback to simple spiral
                    this.generateMiniSpiralDistortion(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
            }
            
            // Apply color
            if (settings.colorMode === 'gradient' || settings.colorMode === 'custom-gradient') {
                const elements = svg.querySelectorAll('path, circle, line, rect');
                elements.forEach((el, i) => {
                    const ratio = i / Math.max(1, elements.length - 1);
                    el.setAttribute('stroke', this.interpolateColor(settings.gradientColor1, settings.gradientColor2, ratio));
                });
            } else if (settings.colorMode === 'single') {
                const elements = svg.querySelectorAll('path, circle, line, rect');
                elements.forEach(el => {
                    el.setAttribute('stroke', settings.lineColor);
                });
            }
        } catch (error) {
            console.error('Error generating thumbnail:', error);
        }
        
        // Restore actual dimensions
        this.actualWidth = parseInt(document.getElementById('size').value);
        this.actualHeight = this.actualWidth;
        
        return svg;
    }

    interpolateColor(color1, color2, ratio) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    selectVariant(index) {
        this.selectedVariantIndex = index;
        this.parentVariant = this.explorerVariants[index];
        
        // Update UI
        document.querySelectorAll('.variant-item').forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
        
        document.getElementById('use-variant-btn').disabled = false;
        
        // Generate new mutated generation based on selection
        this.generateMutatedVariants(this.parentVariant);
    }

    applyVariantToCanvas() {
        if (this.selectedVariantIndex < 0 || !this.parentVariant) {
            this.showError('No variant selected');
            return;
        }
        
        console.log('Applying variant:', this.parentVariant);
        
        // Apply the parent variant to main canvas
        this.applySettings(this.parentVariant);
        
        // Switch to Adjust tab to show settings
        document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector('[data-tab="tab-adjust"]').classList.add('active');
        document.getElementById('tab-adjust').classList.add('active');
        
        this.showSuccess('✓ Variant applied to canvas! Check Adjust tab.');
    }

    setupPresetListeners() {
        // Preset slot buttons (LOAD)
        document.querySelectorAll('.preset-slot').forEach(button => {
            button.addEventListener('click', () => {
                const slot = button.dataset.slot;
                this.loadPreset(slot);
            });
        });
        
        // Preset save buttons (SAVE) 💾
        document.querySelectorAll('.preset-save-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering parent click
                const slot = button.dataset.slot;
                this.savePreset(parseInt(slot));
            });
        });
        
        // Mutate button
        document.getElementById('mutate-btn').addEventListener('click', () => {
            this.mutateSettings();
        });
        
        // Clear presets button
        document.getElementById('clear-presets-btn').addEventListener('click', () => {
            this.clearAllPresets();
        });
        
        // Morph slider
        document.getElementById('morph-slider').addEventListener('input', (e) => {
            document.getElementById('morph-value').textContent = e.target.value + '%';
        });
        
        // Apply morph button
        document.getElementById('apply-morph-btn').addEventListener('click', () => {
            this.morphPresets();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input field or select
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }
            
            // Number keys 1-9
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9 && !isNaN(num)) {
                // Ctrl+Number (Cmd+Number on Mac) = Save to preset
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.savePreset(num);
                } 
                // Number only = Load preset
                else {
                    e.preventDefault();
                    this.loadPreset(num);
                }
            }
        });
        
        // Initialize UI
        this.updatePresetUI();
        this.updateMorphDropdowns();
    }

    // =================================================================================
    // VIDEO EXPORT METHODS
    // =================================================================================

    async captureFrame(quality = '2160') {
        return new Promise((resolve) => {
            try {
                const tempCanvas = document.createElement('canvas');
                
                // Calculate canvas aspect ratio
                console.log(`📐 Canvas dimensions: ${this.actualWidth} × ${this.actualHeight}`);
                const canvasAspectRatio = this.actualWidth / this.actualHeight;
                console.log(`📐 Aspect ratio: ${canvasAspectRatio.toFixed(3)} (${this.actualWidth}:${this.actualHeight})`);
                
                // Define target heights for each quality level
                const targetHeights = {
                    '1080': 1080,
                    '1440': 1440,
                    '2160': 2160  // 4K
                };
                
                // Calculate width based on canvas aspect ratio
                const height = targetHeights[quality] || targetHeights['2160'];
                const width = Math.round(height * canvasAspectRatio);
                
                tempCanvas.width = width;
                tempCanvas.height = height;
                const ctx = tempCanvas.getContext('2d');
                
                if (!ctx) {
                    resolve(null);
                    return;
                }
                
                // Check dark mode for background color
                const isDarkMode = localStorage.getItem('darkMode') === 'true';
                ctx.fillStyle = isDarkMode ? '#000000' : '#ffffff';
                ctx.fillRect(0, 0, width, height);
                
                // Convert SVG to image
                const svgData = new XMLSerializer().serializeToString(this.canvas);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                
                const img = new Image();
                img.onload = () => {
                    // Center and scale
                    const scale = Math.min(width / this.actualWidth, height / this.actualHeight);
                    const scaledWidth = this.actualWidth * scale;
                    const scaledHeight = this.actualHeight * scale;
                    const x = (width - scaledWidth) / 2;
                    const y = (height - scaledHeight) / 2;
                    
                    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                    URL.revokeObjectURL(url);
                    
                    tempCanvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/png', 1.0);
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    resolve(null);
                };
                img.src = url;
            } catch (error) {
                console.error('Error capturing frame:', error);
                resolve(null);
            }
        });
    }

    async startVideoRecording(duration = 10) {
        if (window.isRecording) return;
        
        try {
            window.isRecording = true;
            window.recordedFrames = [];
            
            const fps = parseInt(document.getElementById('video-fps')?.value || 24);
            const totalFrames = duration * fps;
            const frameInterval = 1000 / fps;
            
            const recordBtn = document.getElementById('record-video-btn');
            const progressDiv = document.getElementById('video-progress');
            const progressBar = document.getElementById('video-progress-bar');
            const statusText = document.getElementById('video-status');
            const quality = document.getElementById('video-quality')?.value || '2160';
            const animationMode = document.getElementById('animation-mode')?.value || 'linear';
            
            // Debug: Check animation mode
            console.log(`🎬 Animation Mode: ${animationMode}`);
            console.log(`📐 Canvas: ${this.actualWidth} × ${this.actualHeight} (ratio: ${(this.actualWidth / this.actualHeight).toFixed(3)})`);
            
            if (recordBtn) {
                recordBtn.textContent = `🔴 Recording...`;
                recordBtn.disabled = true;
            }
            
            if (progressDiv) {
                progressDiv.style.display = 'block';
            }
            
            // CRITICAL: Stop any existing real-time animation
            const wasAnimating = this.isAnimating;
            if (this.isAnimating) {
                this.stopAnimation();
                console.log('⏹️ Stopped real-time animation for video recording');
            }
            const originalAnimationTime = this.slowAnimationTime || 0;
            
            // Animation mode will be passed to applyAnimationForFrame
            // 'linear' = smooth start to finish progression
            // 'bounce' = oscillating sine wave
            
            // Store original values before animation
            const originalValues = {
                complexity: parseInt(document.getElementById('complexity').value),
                frequency: parseInt(document.getElementById('frequency').value),
                amplitude: parseInt(document.getElementById('amplitude').value),
                rotation: parseInt(document.getElementById('rotation').value),
                glow: parseInt(document.getElementById('glow').value),
                zoomLevel: this.zoomLevel
            };
            
            // Capture frames with frame-accurate timing
            for (let i = 0; i < totalFrames; i++) {
                if (!window.isRecording) break;
                
                // Calculate progress through the entire video (0 to 1)
                const progress = i / totalFrames;
                const timeInSeconds = i / fps;
                
                // Apply animation values directly based on frame progress
                // This ensures the animation completes exactly once over the video duration
                this.applyAnimationForFrame(progress, animationMode);
                
                // Update progress
                const captureProgress = ((i + 1) / totalFrames) * 100;
                if (progressBar) {
                    progressBar.style.width = `${captureProgress}%`;
                    progressBar.textContent = `${Math.round(captureProgress)}%`;
                }
                if (statusText) {
                    statusText.textContent = `🎬 Capturing frame ${i + 1} of ${totalFrames} (${timeInSeconds.toFixed(1)}s)`;
                }
                
                // Wait for render
                await new Promise(resolve => requestAnimationFrame(resolve));
                await new Promise(resolve => requestAnimationFrame(resolve));
                
                const frameBlob = await this.captureFrame(quality);
                if (frameBlob) {
                    window.recordedFrames.push(frameBlob);
                } else {
                    console.error(`❌ Frame ${i} capture failed - received null blob`);
                    throw new Error(`Frame capture failed at frame ${i}`);
                }
                
                // Log progress every 30 frames
                if (i % 30 === 0 || i === totalFrames - 1) {
                    console.log(`📸 Captured ${i + 1}/${totalFrames} frames (${((i + 1) / totalFrames * 100).toFixed(1)}%)`);
                }
                
                // Smooth timing between frames
                await new Promise(resolve => setTimeout(resolve, Math.max(10, frameInterval / 2)));
            }
            
            console.log(`✅ Frame capture complete: ${window.recordedFrames.length} frames captured`);
            
            // Restore original values after recording
            document.getElementById('complexity').value = originalValues.complexity;
            document.getElementById('complexity-value').textContent = originalValues.complexity;
            document.getElementById('frequency').value = originalValues.frequency;
            document.getElementById('frequency-value').textContent = originalValues.frequency;
            document.getElementById('amplitude').value = originalValues.amplitude;
            const amp = originalValues.amplitude;
            document.getElementById('amplitude-value').textContent = amp >= 0 ? `+${amp}` : amp;
            document.getElementById('rotation').value = originalValues.rotation;
            const rot = originalValues.rotation;
            const sign = rot > 0 ? '+' : (rot < 0 ? '' : '');
            document.getElementById('rotation-value').textContent = `${sign}${rot}°`;
            document.getElementById('glow').value = originalValues.glow;
            document.getElementById('glow-value').textContent = originalValues.glow;
            this.zoomLevel = originalValues.zoomLevel;
            this.updateViewBox();
            this.generatePattern(true);
            
            if (recordBtn) {
                recordBtn.textContent = '⏳ Encoding video...';
            }
            if (statusText) {
                statusText.textContent = '🎞️ Preparing video encoder...';
            }
            
            // Use FFmpeg for QuickTime-compatible MP4
            if (statusText) {
                statusText.textContent = '🎞️ Encoding with FFmpeg...';
            }
            await this.encodeVideo(window.recordedFrames, fps, progressBar, statusText);
            
            if (recordBtn) {
                recordBtn.textContent = '🎥 Record Video (10s)';
                recordBtn.disabled = false;
            }
            
            if (progressDiv) {
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    if (progressBar) progressBar.style.width = '0%';
                }, 3000);
            }
            
            const qualityName = quality === '2160' ? '4K' : quality === '1440' ? '2K' : 'HD';
            this.showSuccess(`✅ Video recorded! (${qualityName} H.264 MP4)`);
            
        } catch (error) {
            console.error('❌ ERROR recording video:', error);
            console.error('Error stack:', error.stack);
            
            // Provide detailed error message
            let errorMessage = `Failed to record video: ${error.message}`;
            if (error.message.includes('Frame capture failed')) {
                errorMessage += '\n\nTip: This usually means the canvas couldn\'t be captured. Try:\n• Using a simpler pattern\n• Reducing complexity/glow\n• Waiting for the pattern to fully render';
            } else if (error.message.includes('FFmpeg')) {
                errorMessage += '\n\nTip: FFmpeg encoding failed. Try:\n• Refreshing the page\n• Using a shorter duration\n• Checking browser console for details';
            } else if (error.message.includes('frames')) {
                errorMessage += '\n\nTip: Check that animations are enabled and working correctly.';
            }
            
            this.showError(errorMessage);
            
            const recordBtn = document.getElementById('record-video-btn');
            const progressDiv = document.getElementById('video-progress');
            if (recordBtn) {
                const duration = document.getElementById('video-duration')?.value || '10';
                recordBtn.textContent = `🎥 Record Video (${duration}s)`;
                recordBtn.disabled = false;
            }
            if (progressDiv) {
                progressDiv.style.display = 'none';
            }
        } finally {
            window.isRecording = false;
            console.log(`🧹 Cleanup: Clearing ${window.recordedFrames?.length || 0} frames from memory`);
            window.recordedFrames = [];
        }
    }

    async encodeVideo(frames, fps, progressBar, statusText) {
        try {
            console.log(`🎬 Starting video encoding: ${frames.length} frames @ ${fps}fps`);
            
            if (statusText) statusText.textContent = '📦 Loading FFmpeg encoder...';
            const ffmpegInstance = await window.loadFFmpeg();
            
            console.log('✅ FFmpeg loaded, starting encoding process...');
            
            // Add progress tracking for FFmpeg
            ffmpegInstance.on('progress', ({ progress, time }) => {
                const encodingProgress = Math.min(progress * 100, 100);
                if (progressBar) {
                    progressBar.style.width = `${encodingProgress}%`;
                    progressBar.textContent = `${Math.round(encodingProgress)}%`;
                }
                if (statusText) {
                    statusText.textContent = `🎞️ Encoding: ${Math.round(encodingProgress)}% (${(time / 1000000).toFixed(1)}s processed)`;
                }
            });
            
            // Validate frames
            if (!frames || frames.length === 0) {
                throw new Error('No frames to encode! Please check frame capture.');
            }
            
            console.log(`📝 Validated ${frames.length} frames, writing to virtual filesystem...`);
            
            // Write frames to virtual filesystem
            if (statusText) statusText.textContent = '💾 Writing frames to memory...';
            for (let i = 0; i < frames.length; i++) {
                try {
                    const arrayBuffer = await frames[i].arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const paddedIndex = String(i).padStart(5, '0');
                    await ffmpegInstance.writeFile(`frame${paddedIndex}.png`, uint8Array);
                    
                    // Update progress for writing frames
                    const writeProgress = ((i + 1) / frames.length) * 50; // 0-50%
                    if (progressBar) {
                        progressBar.style.width = `${writeProgress}%`;
                        progressBar.textContent = `${Math.round(writeProgress)}%`;
                    }
                    if (statusText && i % 10 === 0) {
                        statusText.textContent = `💾 Writing frame ${i + 1}/${frames.length}...`;
                    }
                } catch (frameError) {
                    console.error(`❌ Error writing frame ${i}:`, frameError);
                    throw new Error(`Failed to write frame ${i}: ${frameError.message}`);
                }
            }
            
            console.log(`✅ All ${frames.length} frames written successfully`);
            
            if (statusText) statusText.textContent = '🎬 Starting H.264 encoding...';
            
            // Check if motion blur is enabled
            const motionBlurEnabled = document.getElementById('motion-blur-toggle')?.checked || false;
            console.log(`🎥 Executing FFmpeg with parameters: ${fps}fps, ${frames.length} frames, motion blur: ${motionBlurEnabled}`);
            
            // Build FFmpeg command with optional motion blur filter
            const ffmpegArgs = [
                '-framerate', String(fps),
                '-i', 'frame%05d.png'
            ];
            
            // Add motion blur filter if enabled (frame blending for smoother motion)
            if (motionBlurEnabled) {
                ffmpegArgs.push('-vf', 'tblend=all_mode=average,framestep=1');
                console.log('🌊 Motion blur filter enabled: tblend for smoother animation');
            }
            
            // Add encoding parameters
            ffmpegArgs.push(
                '-c:v', 'libx264',
                '-profile:v', 'high', // High profile for better compression
                '-level', '4.2', // HD support up to 4K
                '-pix_fmt', 'yuv420p', // Universal compatibility
                '-crf', '18', // Visually lossless quality
                '-preset', 'fast', // Balanced speed/quality
                '-tune', 'film', // Optimized for high-quality video content
                '-movflags', '+faststart', // Web/QuickTime optimization
                '-bf', '2', // 2 B-frames for better compression
                '-g', String(fps * 2), // GOP size = 2 seconds for seeking
                'output.mp4'
            );
            
            // Encode to H.264 MP4
            try {
                await ffmpegInstance.exec(ffmpegArgs);
                console.log('✅ FFmpeg encoding completed successfully');
            } catch (execError) {
                console.error('❌ FFmpeg exec failed:', execError);
                throw new Error(`FFmpeg encoding failed: ${execError.message}`);
            }
            
            // Read the output file
            console.log('📖 Reading output.mp4 from virtual filesystem...');
            const data = await ffmpegInstance.readFile('output.mp4');
            console.log(`✅ Read ${data.byteLength} bytes from output.mp4`);
            
            // Clean up virtual filesystem
            for (let i = 0; i < frames.length; i++) {
                const paddedIndex = String(i).padStart(5, '0');
                try {
                    await ffmpegInstance.deleteFile(`frame${paddedIndex}.png`);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
            try {
                await ffmpegInstance.deleteFile('output.mp4');
            } catch (e) {
                // Ignore cleanup errors
            }
            
            // Create download link
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `optical-art-${Date.now()}.mp4`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log(`✅ Video encoding complete! Downloaded as ${filename}`);
            console.log(`📊 Final stats: ${frames.length} frames @ ${fps}fps = ${(frames.length / fps).toFixed(1)}s video`);
            
        } catch (error) {
            console.error('❌ Error in encodeVideo:', error);
            console.error('Error details:', error.stack);
            throw error;
        }
    }

    // =================================================================================
    // GPU OPTIMIZATION METHODS - M4 Pro Hardware Acceleration
    // =================================================================================

    optimizeSVGPerformance() {
        const canvas = this.canvas;
        if (!canvas) return;
        
        // Count total elements in SVG
        const elementCount = canvas.querySelectorAll('*').length;
        
        // Remove old optimization classes
        canvas.classList.remove('complex-pattern', 'high-quality');
        
        // Apply appropriate optimization class based on complexity
        if (elementCount > 5000) {
            // Very complex pattern - prioritize speed
            canvas.classList.add('complex-pattern');
            console.log(`⚡ GPU Optimized: ${elementCount} elements (speed mode)`);
        } else if (elementCount < 1000) {
            // Simple pattern - prioritize quality
            canvas.classList.add('high-quality');
            console.log(`✨ GPU Optimized: ${elementCount} elements (quality mode)`);
        } else {
            // Medium complexity - balanced (default CSS)
            console.log(`⚖️ GPU Optimized: ${elementCount} elements (balanced mode)`);
        }
        
        // Force browser to create a new compositing layer
        canvas.style.transform = 'translateZ(0)';
    }

    optimizePathElements() {
        // Group similar paths for better GPU batching
        const paths = this.canvas.querySelectorAll('path, circle, rect, line, polyline, polygon');
        
        // Add hint for browser to batch these elements (limit to 100 to avoid memory issues)
        paths.forEach((path, index) => {
            if (index < 100) {
                path.style.willChange = 'auto';
            }
        });
    }

    setupZoomPanOptimization() {
        let zoomTimeout;
        
        // Listen for zoom events and optimize rendering during interaction
        this.canvas?.addEventListener('wheel', () => {
            this.canvas?.classList.add('zooming');
            
            clearTimeout(zoomTimeout);
            zoomTimeout = setTimeout(() => {
                this.canvas?.classList.remove('zooming');
            }, 150); // Remove class 150ms after zoom ends
        }, { passive: true });
    }

}

// =================================================================================
// VIDEO EXPORT - FFmpeg.wasm Setup
// =================================================================================

window.loadFFmpeg = async function() {
    if (window.ffmpeg) return window.ffmpeg;
    
    try {
        // Wait for FFmpeg to be available
        let attempts = 0;
        while (!window.FFmpeg && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.FFmpeg) {
            throw new Error('FFmpeg module not loaded');
        }
        
        window.ffmpeg = new window.FFmpeg();
        
        // Load FFmpeg core - use LOCAL files with proper CORS headers
        const baseURL = '/ffmpeg-core';
        await window.ffmpeg.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`,
            workerURL: `${baseURL}/ffmpeg-core.worker.js`,
        });
        
        window.ffmpeg.on('log', ({ message }) => {
            console.log('[FFmpeg]:', message);
        });
        
        console.log('✅ FFmpeg loaded successfully!');
        return window.ffmpeg;
    } catch (error) {
        console.error('❌ Error loading FFmpeg:', error);
        throw new Error(`Failed to load FFmpeg: ${error.message}`);
    }
};

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OpticalArtGenerator();
});