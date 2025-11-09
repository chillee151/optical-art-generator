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

            // Curated color palettes for Easy Mode
            this.curatedPalettes = [
                // Classic Op Art - High contrast, essential palettes
                { id: 'bw', name: 'Classic B&W', category: 'classic', mode: 'custom-gradient', colors: ['#000000', '#FFFFFF'] },
                { id: 'wb', name: 'Inverted', category: 'classic', mode: 'custom-gradient', colors: ['#FFFFFF', '#000000'] },
                { id: 'red-blue', name: 'Op Art Red/Blue', category: 'classic', mode: 'custom-gradient', colors: ['#E50000', '#0043FF'] },

                // Neon/Psychedelic - Vibrant, energetic
                { id: 'neon-pink-blue', name: 'Electric Dreams', category: 'neon', mode: 'custom-gradient', colors: ['#FF006E', '#00F5FF'] },
                { id: 'acid', name: 'Acid Trip', category: 'neon', mode: 'custom-gradient', colors: ['#CCFF00', '#FF00FF'] },
                { id: 'cyber', name: 'Cyberpunk', category: 'neon', mode: 'custom-gradient', colors: ['#9D00FF', '#00FFE5'] },
                { id: 'laser', name: 'Laser Show', category: 'neon', mode: 'custom-gradient', colors: ['#FF0080', '#00FF88'] },

                // Pastel - Soft, dreamy
                { id: 'mint-pink', name: 'Mint Cream', category: 'pastel', mode: 'custom-gradient', colors: ['#B4FFC9', '#FFB4D6'] },
                { id: 'lavender-peach', name: 'Lavender Dream', category: 'pastel', mode: 'custom-gradient', colors: ['#C9B4FF', '#FFDBB4'] },
                { id: 'powder-blue', name: 'Powder Blue', category: 'pastel', mode: 'custom-gradient', colors: ['#B4D6FF', '#FFB4E6'] },

                // Bold/Vibrant - Strong, saturated
                { id: 'fire', name: 'Fire', category: 'bold', mode: 'custom-gradient', colors: ['#FF0000', '#FFAA00'] },
                { id: 'sunset', name: 'Sunset', category: 'bold', mode: 'custom-gradient', colors: ['#8B00FF', '#FF6B35'] },
                { id: 'ocean', name: 'Ocean Deep', category: 'bold', mode: 'custom-gradient', colors: ['#001F54', '#00D9FF'] },
                { id: 'pop', name: 'Pop Art', category: 'bold', mode: 'custom-gradient', colors: ['#FF0000', '#FFD600'] },

                // Earth Tones - Natural, organic
                { id: 'desert', name: 'Desert', category: 'earth', mode: 'custom-gradient', colors: ['#D4745E', '#A8DABC'] },
                { id: 'forest', name: 'Forest', category: 'earth', mode: 'custom-gradient', colors: ['#2D5016', '#F4A460'] },

                // Monochrome Gradients - Single hue variations
                { id: 'purple-mono', name: 'Purple Haze', category: 'mono', mode: 'custom-gradient', colors: ['#4A0080', '#E0B0FF'] },
                { id: 'blue-mono', name: 'Blue Steel', category: 'mono', mode: 'custom-gradient', colors: ['#001F3F', '#7FDBFF'] },
                { id: 'green-mono', name: 'Matrix', category: 'mono', mode: 'custom-gradient', colors: ['#003300', '#00FF00'] },

                // Special effects - Use existing color modes
                { id: 'rainbow', name: 'Rainbow', category: 'special', mode: 'rainbow', colors: [] },
                { id: 'gradient', name: 'Full Spectrum', category: 'special', mode: 'gradient', colors: [] }
            ];
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
            'fractal-noise': 'Turbulent Topology - Organic contour maps using multi-octave fractal Brownian motion, creating topographic-like patterns with self-similar detail at all scales',
            'de-jong-attractor': 'Chaotic patterns based on the De Jong strange attractor.',
            'cellular-automata': 'Emergent patterns from simple rule-based cellular automata.',
            'l-system-growth': 'Fractal branching with 6 types (bush/tree/fern/flower/spiral/fractal), rotational symmetry (2/4/6-fold), colored branches by depth, and leaves',
            'shaded-grid': 'Creates a 3D-like grid pattern using mathematical shading to simulate depth and curvature.',
            'radial-vortex': 'Mesmerizing 3D tunnel effect with alternating bands radiating from center, creating powerful depth illusion.',
            'riley-waves': 'Sinusoidal wave patterns with precisely controlled rhythm variation creating vibration and shimmer effects, inspired by Bridget Riley\'s Op Art masterpieces',
            'vasarely-zebra': 'Iconic Vasarely stripe deformation where parallel lines warp around invisible spheres, creating the illusion of 3D forms beneath a striped surface',
            'anuszkiewicz-squares': 'Concentric squares in complementary colors creating intense chromatic vibration and afterimages through simultaneous contrast, inspired by Richard Anuszkiewicz',
            'riley-crest': 'Vertical lines with phase-shifted horizontal wave displacement creating mesmerizing traveling wave illusion and lateral shimmer effects, from Bridget Riley\'s Crest series',
            'vasarely-vega': 'Checkerboard pattern with wave-based size modulation creating billowing, undulating surface illusion through anamorphic distortion, from Vasarely\'s Vega series',
            'soto-vibration': 'Two overlapping layers of fine parallel lines at subtle angles creating shimmering moiré interference and vibration effects, inspired by Jesús Rafael Soto',
            'cruz-diez-strips': 'Vertical chromatic strips in carefully arranged color triads creating kinetic color mixing and additive interference effects, inspired by Carlos Cruz-Diez\'s Physichromie'
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
        this.initPalettePicker(); // Initialize curated color palette picker
        this.setupAdvancedTabsToggle(); // Setup progressive disclosure for advanced features
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
                console.log(`🎨 Toolbar canvas ratio button clicked: ${ratio}`);
                document.querySelectorAll('.canvas-ratio-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update the hidden canvas format selector
                document.getElementById('format-preset').value = ratio;
                this.updateCanvasSize();
                this.updateToolbarInfo();
                this.generatePattern(true); // Regenerate pattern with new canvas size
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

    // Snap range values to be frame-aligned (for smooth, jitter-free animation)
    snapToFrameAligned(value, min, max) {
        const fps = parseInt(document.getElementById('video-fps')?.value || 24);
        const duration = parseInt(document.getElementById('video-duration')?.value || 10);
        const totalFrames = fps * duration;
        
        // Calculate range and step per frame
        const totalRange = max - min;
        const stepPerFrame = totalRange / totalFrames;
        
        // Snap value to nearest frame-aligned increment
        const stepsFromMin = Math.round((value - min) / stepPerFrame);
        const snappedValue = min + (stepsFromMin * stepPerFrame);
        
        return Math.max(min, Math.min(max, snappedValue));
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

        // Organized patterns with categories for Easy Mode
        const patternCategories = [
            {
                name: 'Classic Op Art',
                id: 'classic',
                patterns: [
                    { id: 'vasarely-zebra', name: 'Vasarely Zebra' },
                    { id: 'riley-waves', name: 'Riley Waves' },
                    { id: 'riley-crest', name: 'Riley Crest' },
                    { id: 'anuszkiewicz-squares', name: 'Anuszkiewicz' },
                    { id: 'vasarely-vega', name: 'Vasarely Vega' },
                    { id: 'soto-vibration', name: 'Soto' },
                    { id: 'cruz-diez-strips', name: 'Cruz-Diez' }
                ]
            },
            {
                name: 'Psychedelic',
                id: 'psychedelic',
                patterns: [
                    { id: 'radial-vortex', name: 'Radial Vortex' },
                    { id: 'spiral-distortion', name: 'Spiral' },
                    { id: 'moire-interference', name: 'Moiré' },
                    { id: 'eye-pattern', name: 'Eye Pattern' }
                ]
            },
            {
                name: 'Geometric',
                id: 'geometric',
                patterns: [
                    { id: 'square-tunnel', name: 'Square Tunnel' },
                    { id: 'cube-illusion', name: 'Cube Illusion' },
                    { id: 'concentric-circles', name: 'Concentric Circles' },
                    { id: 'diagonal-stripes', name: 'Diagonal Stripes' },
                    { id: 'shaded-grid', name: 'Shaded Grid' }
                ]
            },
            {
                name: 'Organic',
                id: 'organic',
                patterns: [
                    { id: 'wave-displacement', name: 'Wave Field' },
                    { id: 'circular-displacement', name: 'Circular Field' },
                    { id: 'perlin-displacement', name: 'Perlin Noise' },
                    { id: 'fractal-noise', name: 'Fractal Noise' },
                    { id: 'l-system-growth', name: 'L-System' }
                ]
            },
            {
                name: 'Mathematical',
                id: 'mathematical',
                patterns: [
                    { id: 'de-jong-attractor', name: 'De Jong' },
                    { id: 'cellular-automata', name: 'Cellular Automata' }
                ]
            }
        ];

        previewContainer.innerHTML = '';

        // Create category filter buttons
        const filterContainer = document.createElement('div');
        filterContainer.className = 'pattern-category-filters';

        const allButton = document.createElement('button');
        allButton.className = 'category-filter-btn active';
        allButton.textContent = 'All';
        allButton.dataset.category = 'all';
        filterContainer.appendChild(allButton);

        patternCategories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-filter-btn';
            btn.textContent = category.name;
            btn.dataset.category = category.id;
            filterContainer.appendChild(btn);
        });

        previewContainer.appendChild(filterContainer);

        // Create pattern grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'pattern-preview-grid-inner';
        previewContainer.appendChild(gridContainer);

        // Generate all pattern previews
        patternCategories.forEach(category => {
            category.patterns.forEach(pattern => {
                const wrapper = document.createElement('div');
                wrapper.className = 'pattern-preview-wrapper';
                wrapper.dataset.category = category.id;

                const previewDiv = document.createElement('div');
                previewDiv.className = 'pattern-preview';
                previewDiv.dataset.pattern = pattern.id;
                previewDiv.setAttribute('role', 'button');
                previewDiv.setAttribute('aria-label', `Select ${pattern.name} pattern`);
                previewDiv.setAttribute('tabindex', '0');

                if (pattern.id === document.getElementById('pattern-type').value) {
                    previewDiv.classList.add('active');
                    previewDiv.setAttribute('aria-pressed', 'true');
                } else {
                    previewDiv.setAttribute('aria-pressed', 'false');
                }

                const svg = this.generateMiniPattern(pattern.id);
                previewDiv.appendChild(svg);

                const label = document.createElement('div');
                label.className = 'pattern-preview-label';
                label.textContent = pattern.name;

                wrapper.appendChild(previewDiv);
                wrapper.appendChild(label);
                gridContainer.appendChild(wrapper);

                previewDiv.addEventListener('click', () => {
                    document.getElementById('pattern-type').value = pattern.id;
                    this.updatePatternPreviews();
                    this.updatePatternInfo();
                    this.applyPatternDefaults(); // Apply pattern-specific defaults
                    this.generatePattern();
                });

                // Keyboard handler for pattern preview
                previewDiv.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('pattern-type').value = pattern.id;
                        this.updatePatternPreviews();
                        this.updatePatternInfo();
                        this.applyPatternDefaults(); // Apply pattern-specific defaults
                        this.generatePattern();
                    }
                });
            });
        });

        // Setup category filter listeners
        filterContainer.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active filter button
                filterContainer.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show/hide patterns based on category
                const category = btn.dataset.category;
                gridContainer.querySelectorAll('.pattern-preview-wrapper').forEach(wrapper => {
                    if (category === 'all' || wrapper.dataset.category === category) {
                        wrapper.style.display = '';
                    } else {
                        wrapper.style.display = 'none';
                    }
                });
            });
        });

        console.log(`✨ Pattern gallery initialized with ${patternCategories.reduce((sum, cat) => sum + cat.patterns.length, 0)} patterns across ${patternCategories.length} categories`);
    }

    updatePatternPreviews() {
        const currentPattern = document.getElementById('pattern-type').value;
        document.querySelectorAll('.pattern-preview').forEach(preview => {
            const isActive = preview.dataset.pattern === currentPattern;
            preview.classList.toggle('active', isActive);
            preview.setAttribute('aria-pressed', isActive ? 'true' : 'false');
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
            case 'riley-waves':
                this.generateMiniRileyWaves(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'vasarely-zebra':
                this.generateMiniVasarelyZebra(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'anuszkiewicz-squares':
                this.generateMiniAnuszkiewiczSquares(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'riley-crest':
                this.generateMiniRileyCrest(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'vasarely-vega':
                this.generateMiniVasarelyVega(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'soto-vibration':
                this.generateMiniSotoVibration(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
            case 'cruz-diez-strips':
                this.generateMiniCruzDiezStrips(svg, miniSeed, miniComplexity, miniLineWidth);
                break;
        }

        return svg;
    }

    generateMiniLSystem(svg, seed, complexity, lineWidth) {
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

    generateMiniCellularAutomata(svg, seed, complexity, lineWidth) {
        // Cellular automata thumbnail - complexity: 80, frequency: 49, amplitude: -69
        const width = 56;
        const height = 56;
        const cellSize = 1.4; // complexity: 80 (smaller cells for finer detail)
        const cellsPerRow = Math.floor(width / cellSize);
        const numRows = Math.floor(height / cellSize);

        // frequency: 49 maps to rule 250
        const ruleNumber = 250; // frequency: 49 -> rule 250
        const ruleset = [];
        for (let i = 0; i < 8; i++) {
            ruleset.push((ruleNumber >> i) & 1);
        }

        let currentRow = new Array(cellsPerRow).fill(0);

        // amplitude: -69 -> scattered seed pattern
        const seedWidth = Math.max(1, Math.floor(Math.abs(-69) / 20)); // 3 cells
        const center = Math.floor(cellsPerRow / 2);

        // Negative amplitude: scattered seed pattern (every other cell)
        for (let i = 0; i < seedWidth; i++) {
            const offset = i * 2; // Every other cell
            const pos = (center + offset - seedWidth + cellsPerRow) % cellsPerRow;
            currentRow[pos] = 1;
        }

        for (let r = 0; r < numRows; r++) {
            let nextRow = new Array(cellsPerRow).fill(0);
            for (let i = 0; i < cellsPerRow; i++) {
                const left = currentRow[(i - 1 + cellsPerRow) % cellsPerRow];
                const self = currentRow[i];
                const right = currentRow[(i + 1) % cellsPerRow];

                const ruleIndex = (left << 2) | (self << 1) | right;
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
        // De Jong attractor thumbnail - complexity: 197, frequency: 28, amplitude: 85
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = "M 28 28";
        let x = 0, y = 0;

        // frequency: 28 affects attractor parameters (2.8 scaled)
        const a = 1.4, b = -2.3, c = 2.8, d = -2.1; // c = 2.8 from frequency

        // amplitude: 85 affects scale
        const scale = 8.5; // amplitude: 85 mapped to 8.5

        // complexity: 197 affects number of iterations
        const iterations = 1970; // complexity: 197 mapped to 1970 points

        for (let i = 0; i < iterations; i++) {
            const x_new = Math.sin(a * y) - Math.cos(b * x);
            const y_new = Math.sin(c * x) - Math.cos(d * y);
            x = x_new;
            y = y_new;
            pathData += ` L ${28 + x * scale} ${28 + y * scale}`;
        }
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', lineWidth * 0.3);
        svg.appendChild(path);
    }

    generateMiniFractalNoise(svg, seed, complexity, lineWidth) {
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
                const noiseValue = this._fbm(gx * noiseScale, gy * noiseScale, seed * 10, octaves, 0.5);
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
                    path.setAttribute('stroke', '#000');
                    path.setAttribute('stroke-width', lineWidth * 0.4);
                    svg.appendChild(path);
                }
            }
        }
    }

    generateMiniPerlinDisplacement(svg, seed, complexity, lineWidth) {
        const perlin = new PerlinNoise();
        const numLines = 25; // complexity: 201 (high density)
        const spacing = 56 / numLines;

        for (let y = 0; y < 56 + spacing; y += spacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= 56; x += 1.5) {
                // frequency: 83 affects noise scale
                const noiseScale = 0.083; // frequency: 83 mapped to 0.083
                const noiseVal = perlin.noise(x * noiseScale, y * noiseScale, seed * 10);

                // amplitude: 15 affects displacement strength
                const displacement = noiseVal * 1.5; // amplitude: 15 mapped to 1.5
                pathData += ` L ${x} ${y + displacement}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.5);
            svg.appendChild(path);
        }
    }

    generateMiniConcentricCircles(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const maxRadius = 26;
        const numRings = 20; // complexity: 103 (more rings)

        for (let i = 0; i < numRings; i++) {
            const progress = i / numRings;
            const baseRadius = maxRadius * progress;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 80; // More points for smoother waves
            const angleStep = (Math.PI * 2) / numPoints;

            for (let angle = 0; angle <= Math.PI * 2; angle += angleStep) {
                // Wave modulation - frequency: 70, amplitude: -208
                const waveFreq = 7; // frequency: 70 mapped to 7 waves
                const waveAmp = 0.25; // amplitude: -208 mapped to stronger modulation
                const waveModulation = 1 + Math.sin(angle * waveFreq) * waveAmp;
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
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.4);

            svg.appendChild(path);
        }
    }

    generateMiniDiagonalStripes(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const symmetryCount = 4; // symmetry: 4
        const numStripes = 3; // complexity: 24 (fewer stripes)

        // Create 4-fold radial symmetry
        for (let sym = 0; sym < symmetryCount; sym++) {
            const symAngle = (360 / symmetryCount) * sym; // rotation: 0

            for (let i = 0; i < numStripes; i++) {
                const progress = i / numStripes;
                const distance = 3 + i * 6; // Distance from center

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                let pathData = '';

                // Create wavy stripe - frequency: 21, amplitude: 20
                const numPoints = 20;
                for (let j = 0; j <= numPoints; j++) {
                    const t = (j / numPoints) * 50; // Length of stripe
                    const waveFreq = 0.21; // frequency: 21 mapped
                    const waveAmp = 0.2; // amplitude: 20 mapped
                    const waveOffset = Math.sin(t * waveFreq + progress * Math.PI * 2) * waveAmp;

                    const x = centerX + (distance + t) * Math.cos(symAngle * Math.PI / 180) + waveOffset * Math.sin(symAngle * Math.PI / 180);
                    const y = centerY + (distance + t) * Math.sin(symAngle * Math.PI / 180) - waveOffset * Math.cos(symAngle * Math.PI / 180);

                    if (pathData === '') {
                        pathData = `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }
                }

                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.6);
                svg.appendChild(path);
            }
        }
    }

    generateMiniSquareTunnel(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const numSquares = 15;  // complexity: 114
        const symmetryCount = 8; // symmetry: 8

        // Create 8-fold radial symmetry
        for (let sym = 0; sym < symmetryCount; sym++) {
            const symAngle = (360 / symmetryCount) * sym - 73; // rotation: -73

            for (let i = 0; i < numSquares; i++) {
                const progress = i / numSquares;
                const scale = Math.pow(1 - progress, 1.5);
                const squareSize = 44 * scale;
                const rotation = progress * 40 + symAngle; // frequency: 40 affects twist

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const half = squareSize / 2;

                const pathData = `M ${-half} ${-half} L ${half} ${-half} L ${half} ${half} L ${-half} ${half} Z`;
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.2);

                const transform = `translate(${centerX}, ${centerY}) rotate(${rotation})`;
                path.setAttribute('transform', transform);

                svg.appendChild(path);
            }
        }
    }

    generateMiniWaveDisplacement(svg, seed, complexity, lineWidth) {
        const numLines = 20; // complexity: 185 (high density)
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

            const numPoints = 50;
            for (let j = 0; j <= numPoints; j++) {
                const x = (56 * j) / numPoints;

                // Interference pattern - frequency: 62, amplitude: -77
                let displacement = 0;
                for (const source of sources) {
                    const dist = Math.sqrt(Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2));
                    const waveFreq = 0.6; // frequency: 62 mapped
                    const waveAmp = 0.8; // amplitude: -77 (inverted) mapped
                    displacement += Math.sin(dist * waveFreq) * Math.exp(-dist / 30) * waveAmp;
                }

                // Add horizontal wave component
                displacement += Math.sin((x / 56) * Math.PI * 6) * 0.3;

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

    generateMiniEyePattern(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const width = 56;
        const height = 56;

        // Advanced Eye Pattern style: horizontal wavy lines forming eye shape
        const numLines = 20;
        const eyeWidth = width * 0.4;  // Amplitude controls eye size
        const eyeHeight = height * 0.2;

        for (let i = 0; i < numLines; i++) {
            const y = (i / numLines) * height;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= width; x += 2) {
                const dx = x - centerX;
                const dy = y - centerY;

                // Elliptical eye field
                const normalizedX = dx / eyeWidth;
                const normalizedY = dy / eyeHeight;
                const ellipseDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

                // Eye curve displacement
                const fieldStrength = Math.exp(-ellipseDistance * 2) * 8;
                const eyeDisplacement = fieldStrength * Math.sin(normalizedX * Math.PI) * (1 - Math.abs(normalizedY));

                const finalY = y + eyeDisplacement;
                pathData += ` L ${x} ${finalY}`;
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.5);
            svg.appendChild(path);
        }

        // Large pupil (frequency=100 means max dilation at 35%)
        const pupilRadius = 10;  // 35% of 28 (half canvas)
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', pupilRadius);
        pupil.setAttribute('fill', '#000');
        svg.appendChild(pupil);
    }

    generateMiniCircularDisplacement(svg, seed, complexity, lineWidth) {
        const numLines = 18; // complexity: 154 (higher density)
        const spacing = 56 / numLines;

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
                const x = (56 * j) / numPoints;

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
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.6);
            svg.appendChild(path);
        }
    }

    generateMiniMoireInterference(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;

        // Updated to match default settings (complexity: 70, frequency: 29, amplitude: 69)
        // Grid pattern with 2 layers (frequency 29 is in 30-60 range, so numLayers = 2)
        const baseSpacing = 56 / 18; // Scaled from complexity: 70
        const spacingVariation = 0.69; // From amplitude: 69 → 69/100
        const angleStep = 2.9; // From frequency: 29 → 29/10

        const numLayers = 2; // frequency: 29 → between 0-33 range would be 1, but actually >30 so 2 layers

        for (let layer = 0; layer < numLayers; layer++) {
            const spacing = baseSpacing * (1 + spacingVariation * layer * 0.15);
            const layerAngle = angleStep * layer * 1.5; // Matches main pattern calculation
            const opacity = layer === 0 ? 0.7 : 0.7;
            const strokeWidth = lineWidth * (1 - layer * 0.15);

            // Horizontal lines
            for (let y = 0; y < 56 + spacing; y += spacing) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', 0);
                line.setAttribute('y1', y);
                line.setAttribute('x2', 56);
                line.setAttribute('y2', y);
                line.setAttribute('stroke', '#000');
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
                line.setAttribute('stroke', '#000');
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
        marker.setAttribute('fill', '#000');
        marker.setAttribute('fill-opacity', '0.5');
        svg.appendChild(marker);
    }

    generateMiniSpiralDistortion(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const maxRadius = 26;

        // Updated to match default settings (complexity: 174, frequency: 3, amplitude: 0)
        // Very high density, subtle spiral effect, no 3D depth
        const numRings = 40; // High density from complexity: 174

        for (let ring = 0; ring < numRings; ring++) {
            const progress = ring / numRings;

            // Exponential spacing for vortex effect
            const radius = maxRadius * Math.pow(progress, 0.7);

            // More segments in outer rings
            const baseSegments = 8 + Math.floor(progress * 1.5); // Lower from frequency: 3
            const numSegments = Math.max(8, baseSegments);
            const segmentAngle = (Math.PI * 2) / numSegments;

            for (let seg = 0; seg < numSegments; seg++) {
                // Very subtle Fraser offset (low frequency = 3)
                const tiltStrength = 0.015; // From frequency: 3 → 3 * 0.005
                const tiltOffset = (ring * tiltStrength) + (seg * 0.08);

                const startAngle = seg * segmentAngle + tiltOffset;
                const endAngle = (seg + 0.75) * segmentAngle + tiltOffset;

                // Alternating thick/thin (Riley rhythm)
                const isThick = seg % 2 === 0;
                const weight = isThick
                    ? lineWidth * (0.6 + progress * 0.2)
                    : lineWidth * (0.3 + progress * 0.15);

                // Create arc segment
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                let pathData = '';

                const steps = 10;
                for (let i = 0; i <= steps; i++) {
                    const angle = startAngle + (endAngle - startAngle) * (i / steps);
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    pathData += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
                }

                path.setAttribute('d', pathData);
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', weight);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke-linecap', 'round');
                svg.appendChild(path);
            }
        }

        // Center dot
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', centerX);
        center.setAttribute('cy', centerY);
        center.setAttribute('r', 1.5);
        center.setAttribute('fill', '#000');
        svg.appendChild(center);
    }

    generateMiniCubeIllusion(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const gridSize = 5; // 5x5 grid for high complexity (160)
        const baseSize = 8;  // Smaller cubes to fit more

        // Create isometric cube grid with more complex patterns
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const xOffset = col - gridSize / 2;
                const yOffset = row - gridSize / 2;

                // Isometric positioning
                const isoX = centerX + (xOffset - yOffset) * baseSize * 0.866;
                const isoY = centerY + (xOffset + yOffset) * baseSize * 0.5;

                // Vary size for depth - amplitude: -892 affects depth variation
                const distFromCenter = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
                const depthScale = 0.6 + 0.4 * (1 - distFromCenter / 3.5);
                const cubeSize = baseSize * depthScale;

                // frequency: 35 affects flip pattern frequency
                const flipPattern = Math.sin((row * 35 + col * 35) * 0.1) > 0;

                // Draw isometric cube
                this.drawMiniIsometricCube(svg, isoX, isoY, cubeSize, lineWidth * 0.6, flipPattern);
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
        // Vasarely Warped Grid thumbnail
        const width = 56;
        const height = 56;
        const cellsAcross = 10; // complexity: 101 (higher density)
        const cellSize = width / cellsAcross;

        // Two distortion centers - frequency: 69 (69/25 = 2 centers)
        const numCenters = 2;
        const centers = [];
        for (let i = 0; i < numCenters; i++) {
            const angle = (i / numCenters) * Math.PI * 2;
            const offsetRadius = width * 0.25;
            centers.push({
                x: width/2 + Math.cos(angle) * offsetRadius,
                y: height/2 + Math.sin(angle) * offsetRadius,
                strength: -0.85, // amplitude: -85 (moderate concave)
                radius: width * 0.3
            });
        }

        // Draw distorted grid
        for (let row = 0; row < cellsAcross; row++) {
            for (let col = 0; col < cellsAcross; col++) {
                const gridX = col * cellSize;
                const gridY = row * cellSize;

                // Calculate 4 corner positions with distortion
                const corners = [
                    {ox: gridX, oy: gridY},
                    {ox: gridX + cellSize, oy: gridY},
                    {ox: gridX + cellSize, oy: gridY + cellSize},
                    {ox: gridX, oy: gridY + cellSize}
                ];

                // Apply distortion to each corner
                corners.forEach(corner => {
                    let totalDX = 0, totalDY = 0;

                    centers.forEach(center => {
                        const dx = corner.ox - center.x;
                        const dy = corner.oy - center.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);

                        const influence = Math.exp(-(distance*distance) / (2 * center.radius * center.radius));
                        const displacementMag = influence * center.strength * cellSize * 0.3;

                        if (distance > 0) {
                            totalDX += (dx / distance) * displacementMag;
                            totalDY += (dy / distance) * displacementMag;
                        }
                    });

                    corner.x = corner.ox + totalDX;
                    corner.y = corner.oy + totalDY;
                });

                // Create distorted quad
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const pathData = `M ${corners[0].x} ${corners[0].y} ` +
                               `L ${corners[1].x} ${corners[1].y} ` +
                               `L ${corners[2].x} ${corners[2].y} ` +
                               `L ${corners[3].x} ${corners[3].y} Z`;

                path.setAttribute('d', pathData);

                // Checkerboard pattern
                const isBlack = (row + col) % 2 === 0;
                path.setAttribute('fill', isBlack ? '#000' : '#fff');
                path.setAttribute('stroke', '#000');
                path.setAttribute('stroke-width', lineWidth * 0.3);

                svg.appendChild(path);
            }
        }
    }

    generateMiniRadialVortex(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;

        // Updated to match default settings (complexity: 62, frequency: 58, amplitude: -38)
        const numPetals = 5; // From frequency: 58 → floor(58/10) = 5
        const numBands = 35; // Scaled down from complexity: 62 for thumbnail
        const petalIntensity = -0.38; // From amplitude: -38 → -38/100 = -0.38 (inward petals)

        const maxRadius = 28; // Radius to edge of thumbnail
        const bandWidth = maxRadius / numBands;

        // Create the vortex pattern using polar coordinates
        for (let band = 0; band < numBands; band++) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const innerRadius = band * bandWidth;
            const outerRadius = (band + 1) * bandWidth;

            // Create smooth curves for each petal
            for (let angle = 0; angle <= Math.PI * 2; angle += 0.15) {
                // Modulate radius based on angle to create petals with negative amplitude
                const petalModulation = 1 + Math.sin(angle * numPetals) * petalIntensity;
                const r = innerRadius * petalModulation;

                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);

                if (pathData === '') {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }

            // Create outer path (reverse direction for proper fill)
            for (let angle = Math.PI * 2; angle >= 0; angle -= 0.15) {
                const petalModulation = 1 + Math.sin(angle * numPetals) * petalIntensity;
                const r = outerRadius * petalModulation;

                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);

                pathData += ` L ${x} ${y}`;
            }

            pathData += ' Z';

            // Combine paths for filled region
            path.setAttribute('d', pathData);
            path.setAttribute('fill', band % 2 === 0 ? '#000' : '#fff');
            path.setAttribute('stroke', 'none');
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

        // Toolbar Advanced Settings Toggle
        document.getElementById('toggle-advanced-settings').addEventListener('click', () => {
            const panel = document.getElementById('toolbar-advanced-panel');
            const toggleBtn = document.getElementById('toggle-advanced-settings');
            const isExpanded = panel.style.display !== 'none';

            if (isExpanded) {
                panel.style.display = 'none';
                toggleBtn.classList.remove('expanded');
                toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                panel.style.display = 'block';
                toggleBtn.classList.add('expanded');
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        });

        document.getElementById('generate-colors-btn').addEventListener('click', () => {
            this.generateColorPalette();
        });

        // Copy Settings button
        document.getElementById('copy-settings-btn').addEventListener('click', () => {
            this.copySettingsToClipboard();
        });

        // Mobile FAB (Floating Action Button) listeners
        const mobileFab = document.getElementById('mobile-export-fab');
        const fabMenu = document.getElementById('mobile-fab-menu');

        if (mobileFab && fabMenu) {
            // Toggle FAB menu
            mobileFab.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = fabMenu.classList.contains('active');
                fabMenu.classList.toggle('active');
                mobileFab.classList.toggle('active');
            });

            // Close FAB menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!fabMenu.contains(e.target) && !mobileFab.contains(e.target)) {
                    fabMenu.classList.remove('active');
                    mobileFab.classList.remove('active');
                }
            });

            // Handle FAB menu item clicks
            document.querySelectorAll('.fab-menu-item').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.getAttribute('data-action');

                    switch (action) {
                        case 'export-png':
                            this.exportImage('png');
                            break;
                        case 'export-svg':
                            this.exportSVG();
                            break;
                        case 'export-jpg':
                            this.exportImage('jpeg');
                            break;
                        case 'randomize':
                            this.randomizeAll();
                            break;
                    }

                    // Close menu after action
                    fabMenu.classList.remove('active');
                    mobileFab.classList.remove('active');
                });
            });
        }

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
            this.applyPatternDefaults(); // Apply pattern-specific defaults
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
            
            // Add frame-aligned snapping to range inputs (except zoom/rotation - they stay smooth)
            if (!isRotation && !isZoom) {
                const startInput = document.getElementById(`${param}-start`);
                const endInput = document.getElementById(`${param}-end`);
                
                startInput.addEventListener('blur', (e) => {
                    const value = parseFloat(e.target.value);
                    const snapped = this.snapToFrameAligned(value, min, max);
                    e.target.value = Math.round(snapped);
                    this.updateToolbarAnimationPills();
                });
                
                endInput.addEventListener('blur', (e) => {
                    const value = parseFloat(e.target.value);
                    const snapped = this.snapToFrameAligned(value, min, max);
                    e.target.value = Math.round(snapped);
                    this.updateToolbarAnimationPills();
                });
            }
        });
        
        // Initial animation state
        this.updateAnimationState();

        // Animation speed multiplier (discrete dropdown)
        document.getElementById('animation-speed').addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('animation-speed-value').textContent = `${value}×`;
            // Regenerate pattern with new speed
            if (this.isAnimating) {
                this.generatePattern(true);
            }
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
            
            // Time flows normally (NOT affected by speed multiplier)
            this.slowAnimationTime = (elapsedTime / 10000);
            
            // Check animation mode
            const animationMode = document.getElementById('animation-mode')?.value || 'bounce';
            
            // Get FPS and calculate discrete frame progression
            const fps = parseInt(document.getElementById('video-fps')?.value || 24);
            const duration = parseInt(document.getElementById('video-duration')?.value || 10);
            const totalFrames = fps * duration;
            
            // Calculate current frame number (discrete)
            const currentFrame = Math.floor((this.slowAnimationTime % 1) * totalFrames);
            
            // Frame-based progress (0 to 1, but in discrete steps)
            const frameProgress = currentFrame / totalFrames;
            
            // Calculate oscillation based on DISCRETE frames
            let oscillation;
            if (animationMode === 'linear') {
                // Linear: 0 to 1 progression in discrete frame steps
                oscillation = frameProgress;
            } else {
                // Bounce: sine wave based on discrete frames
                oscillation = Math.sin(frameProgress * Math.PI * 2);
            }
            
            // Get speed multiplier (discrete: 0.5x, 1x, 2x, 3x, 4x, 5x)
            const speedMultiplier = parseFloat(document.getElementById('animation-speed').value);
            
            // Animate each parameter if checkbox is checked (using user-defined ranges)
            // Speed multiplier EXPANDS range for complexity, frequency, amplitude, glow
            if (document.getElementById('animate-complexity').checked) {
                const startVal = parseFloat(document.getElementById('complexity-start').value);
                const endVal = parseFloat(document.getElementById('complexity-end').value);
                const baseRange = endVal - startVal;
                const expandedRange = baseRange * speedMultiplier; // Expand by speed
                const newValue = animationMode === 'linear' 
                    ? startVal + oscillation * expandedRange  // Frame-locked oscillation
                    : this.originalValues.complexity + oscillation * expandedRange / 2;
                document.getElementById('complexity').value = Math.max(5, Math.min(300, newValue));
                document.getElementById('complexity-value').textContent = Math.round(newValue);
            }
            
            if (document.getElementById('animate-frequency').checked) {
                const startVal = parseFloat(document.getElementById('frequency-start').value);
                const endVal = parseFloat(document.getElementById('frequency-end').value);
                const baseRange = endVal - startVal;
                const expandedRange = baseRange * speedMultiplier;
                const newValue = animationMode === 'linear'
                    ? startVal + oscillation * expandedRange  // Frame-locked oscillation
                    : this.originalValues.frequency + oscillation * expandedRange / 2;
                document.getElementById('frequency').value = Math.max(1, Math.min(100, newValue));
                document.getElementById('frequency-value').textContent = Math.round(newValue);
            }
            
            if (document.getElementById('animate-amplitude').checked) {
                const startVal = parseFloat(document.getElementById('amplitude-start').value);
                const endVal = parseFloat(document.getElementById('amplitude-end').value);
                const baseRange = endVal - startVal;
                const expandedRange = baseRange * speedMultiplier;
                const newValue = animationMode === 'linear'
                    ? startVal + oscillation * expandedRange  // Frame-locked oscillation
                    : this.originalValues.amplitude + oscillation * expandedRange / 2;
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
                    ? startVal + oscillation * expandedRange  // Frame-locked oscillation
                    : this.originalValues.glow + oscillation * expandedRange / 2;
                document.getElementById('glow').value = Math.max(0, Math.min(10, newValue));
                document.getElementById('glow-value').textContent = Math.round(newValue);
            }
            
            // ROTATION & ZOOM: Independent - NO speed multiplier, smooth (not quantized)
            if (document.getElementById('animate-rotation').checked) {
                const startVal = parseFloat(document.getElementById('rotation-start').value);
                const endVal = parseFloat(document.getElementById('rotation-end').value);
                const newValue = animationMode === 'linear'
                    ? startVal + oscillation * (endVal - startVal)  // Smooth, no speed multiplier
                    : (this.originalValues.rotation + this.slowAnimationTime * 30) % 360;
                const normalizedValue = newValue > 180 ? newValue - 360 : newValue;
                document.getElementById('rotation').value = normalizedValue;
                const sign = normalizedValue > 0 ? '+' : (normalizedValue < 0 ? '' : '');
                document.getElementById('rotation-value').textContent = `${sign}${Math.round(normalizedValue)}°`;
            }
            
            if (document.getElementById('animate-zoom').checked) {
                const startZoom = parseFloat(document.getElementById('zoom-start').value);
                const endZoom = parseFloat(document.getElementById('zoom-end').value);
                const newZoomLevel = animationMode === 'linear'
                    ? startZoom + oscillation * (endZoom - startZoom)  // Smooth, no speed multiplier
                    : this.originalValues.zoomLevel + oscillation * (endZoom - startZoom) / 2;
                
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

    // Apply a curated color palette
    applyPalette(palette) {
        console.log(`🎨 Applying palette: ${palette.name}`);

        // Set the color mode
        document.getElementById('color-mode').value = palette.mode;

        // If custom-gradient, set the color pickers
        if (palette.mode === 'custom-gradient' && palette.colors.length >= 2) {
            document.getElementById('gradient-color-1').value = palette.colors[0];
            document.getElementById('gradient-color-2').value = palette.colors[1];
        }

        // Update UI to show/hide gradient controls
        this.toggleColorControls();

        // Regenerate pattern with new colors
        this.generatePattern(true);

        // Store currently active palette
        this.activePaletteId = palette.id;

        // Update UI to show active state
        this.updatePalettePickerUI();
    }

    // Initialize the palette picker UI
    initPalettePicker() {
        const container = document.getElementById('palette-picker-container');
        if (!container) {
            console.warn('Palette picker container not found');
            return;
        }

        container.innerHTML = '';

        this.curatedPalettes.forEach(palette => {
            const chip = document.createElement('div');
            chip.className = 'palette-chip';
            chip.setAttribute('data-palette-id', palette.id);
            chip.setAttribute('title', palette.name);
            chip.setAttribute('role', 'button');
            chip.setAttribute('aria-label', `Apply ${palette.name} color palette`);
            chip.setAttribute('tabindex', '0');

            // Create visual representation
            if (palette.mode === 'custom-gradient' && palette.colors.length >= 2) {
                // Show gradient
                chip.style.background = `linear-gradient(135deg, ${palette.colors[0]} 0%, ${palette.colors[1]} 100%)`;
            } else if (palette.mode === 'rainbow') {
                chip.style.background = 'linear-gradient(90deg, #FF0000, #FFAA00, #AAFF00, #00FF00, #00FFAA, #00AAFF, #0000FF, #AA00FF, #FF00AA)';
            } else if (palette.mode === 'gradient') {
                chip.style.background = 'linear-gradient(90deg, hsl(240, 70%, 50%), hsl(180, 70%, 50%), hsl(0, 70%, 50%))';
            } else {
                // Solid color fallback
                chip.style.background = palette.colors[0] || '#000';
            }

            // Click handler
            chip.addEventListener('click', () => {
                this.applyPalette(palette);
            });

            // Keyboard handler
            chip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.applyPalette(palette);
                }
            });

            container.appendChild(chip);
        });

        console.log(`✨ Palette picker initialized with ${this.curatedPalettes.length} palettes`);
    }

    // Update palette picker UI to show active state
    updatePalettePickerUI() {
        const chips = document.querySelectorAll('.palette-chip');
        chips.forEach(chip => {
            if (chip.getAttribute('data-palette-id') === this.activePaletteId) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    // Setup progressive disclosure for advanced features
    setupAdvancedTabsToggle() {
        const showAdvancedBtn = document.getElementById('show-advanced-tabs');
        if (!showAdvancedBtn) return;

        // Check if user has already enabled advanced mode
        const advancedMode = localStorage.getItem('advancedMode') === 'true';
        if (advancedMode) {
            this.showAdvancedTabs();
        }

        showAdvancedBtn.addEventListener('click', () => {
            this.showAdvancedTabs();
            // Remember preference
            localStorage.setItem('advancedMode', 'true');
        });
    }

    showAdvancedTabs() {
        // Show advanced tab buttons
        document.querySelectorAll('.advanced-tab').forEach(tab => {
            tab.style.display = '';
        });

        // Hide the "+ More" button
        const showAdvancedBtn = document.getElementById('show-advanced-tabs');
        if (showAdvancedBtn) {
            showAdvancedBtn.style.display = 'none';
        }

        console.log('✨ Advanced features unlocked');
    }

    updatePatternInfo() {
        const patternType = document.getElementById('pattern-type').value;
        document.getElementById('pattern-info').textContent =
            this.patternInfo[patternType];
    }

    // Apply pattern-specific default settings when a pattern is selected
    applyPatternDefaults() {
        const patternType = document.getElementById('pattern-type').value;

        // Pattern-specific defaults
        const patternDefaults = {
            'vasarely-zebra': {
                complexity: 70,
                frequency: 62,
                amplitude: 123,
                rotation: 0,
                symmetry: 'none'
            },
            'vasarely-vega': {
                complexity: 232,
                frequency: 65,
                amplitude: 85,
                rotation: 0,
                symmetry: 'none'
            },
            'riley-waves': {
                complexity: 62,
                frequency: 57,
                amplitude: 62,
                rotation: -90,
                symmetry: 'none'
            },
            'riley-crest': {
                complexity: 48,
                frequency: 63,
                amplitude: 15,
                rotation: 0,
                symmetry: 'none'
            },
            'anuszkiewicz-squares': {
                complexity: 284,
                frequency: 26,
                amplitude: 23,
                rotation: 0,
                symmetry: 'none'
            },
            'soto-vibration': {
                complexity: 14,
                frequency: 64,
                amplitude: -162,
                rotation: 11,
                symmetry: 'none'
            },
            'cruz-diez-strips': {
                complexity: 197,
                frequency: 61,
                amplitude: 77,
                rotation: 0,
                symmetry: 'none'
            },
            'radial-vortex': {
                complexity: 62,
                frequency: 58,
                amplitude: -38,
                rotation: 0,
                symmetry: 'none'
            },
            'spiral-distortion': {
                complexity: 174,
                frequency: 3,
                amplitude: 0,
                rotation: 0,
                symmetry: 'none'
            },
            'moire-interference': {
                complexity: 70,
                frequency: 29,
                amplitude: 69,
                rotation: 0,
                symmetry: 'none'
            },
            'eye-pattern': {
                complexity: 121,
                frequency: 100,
                amplitude: 123,
                rotation: 0,
                symmetry: 'none'
            },
            'square-tunnel': {
                complexity: 114,
                frequency: 40,
                amplitude: 446,
                rotation: -73,
                symmetry: '8'
            },
            'cube-illusion': {
                complexity: 160,
                frequency: 35,
                amplitude: -892,
                rotation: 0,
                symmetry: 'none'
            },
            'concentric-circles': {
                complexity: 103,
                frequency: 70,
                amplitude: -208,
                rotation: 0,
                symmetry: 'none'
            },
            'diagonal-stripes': {
                complexity: 24,
                frequency: 21,
                amplitude: 20,
                rotation: 0,
                symmetry: '4'
            },
            'shaded-grid': {
                complexity: 101,
                frequency: 69,
                amplitude: -85,
                rotation: 0,
                symmetry: 'none'
            },
            'wave-displacement': {
                complexity: 185,
                frequency: 62,
                amplitude: -77,
                rotation: 0,
                symmetry: 'none'
            },
            'circular-displacement': {
                complexity: 154,
                frequency: 73,
                amplitude: 69,
                rotation: 0,
                symmetry: 'none'
            },
            'perlin-displacement': {
                complexity: 201,
                frequency: 83,
                amplitude: 15,
                rotation: 0,
                symmetry: 'none'
            },
            'l-system-growth': {
                complexity: 166,
                frequency: 55,
                amplitude: 31,
                rotation: 0,
                symmetry: 'none'
            },
            'de-jong-attractor': {
                complexity: 197,
                frequency: 28,
                amplitude: 85,
                rotation: 0,
                symmetry: 'none'
            },
            'cellular-automata': {
                complexity: 80,
                frequency: 49,
                amplitude: -69,
                rotation: 0,
                symmetry: 'none'
            },
            'fractal-noise': {
                complexity: 150,
                frequency: 60,
                amplitude: 500,
                rotation: 0,
                symmetry: 'none'
            }
        };

        // If this pattern has custom defaults, apply them
        if (patternDefaults[patternType]) {
            const defaults = patternDefaults[patternType];

            // Apply complexity
            if (defaults.complexity !== undefined) {
                document.getElementById('complexity').value = defaults.complexity;
                document.getElementById('complexity-value').textContent = defaults.complexity;
            }

            // Apply frequency
            if (defaults.frequency !== undefined) {
                document.getElementById('frequency').value = defaults.frequency;
                document.getElementById('frequency-value').textContent = defaults.frequency;
            }

            // Apply amplitude
            if (defaults.amplitude !== undefined) {
                document.getElementById('amplitude').value = defaults.amplitude;
                document.getElementById('amplitude-value').textContent = defaults.amplitude;
            }

            // Apply rotation
            if (defaults.rotation !== undefined) {
                document.getElementById('rotation').value = defaults.rotation;
                document.getElementById('rotation-value').textContent = defaults.rotation + '°';
            }

            // Apply symmetry
            if (defaults.symmetry !== undefined) {
                document.getElementById('symmetry').value = defaults.symmetry;
            }
        }
    }

    // Copy current pattern and settings to clipboard in easy-to-paste format
    copySettingsToClipboard() {
        const patternType = document.getElementById('pattern-type').value;
        const complexity = document.getElementById('complexity').value;
        const frequency = document.getElementById('frequency').value;
        const amplitude = document.getElementById('amplitude').value;
        const rotation = document.getElementById('rotation').value;
        const symmetry = document.getElementById('symmetry').value;

        // Format for easy pasting
        const settingsText = `Pattern: ${patternType}
- Complexity: ${complexity}
- Frequency: ${frequency}
- Amplitude: ${amplitude}
- Rotation: ${rotation}
- Symmetry: ${symmetry}`;

        // Copy to clipboard
        navigator.clipboard.writeText(settingsText).then(() => {
            // Show success feedback
            const btn = document.getElementById('copy-settings-btn');
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            btn.style.background = 'rgba(76, 175, 80, 0.1)';
            btn.style.borderColor = 'rgba(76, 175, 80, 0.3)';
            btn.style.color = '#4CAF50';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy settings:', err);
            alert('Failed to copy settings to clipboard');
        });
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
        
        console.log(`📐 Canvas updated: ${formatPreset} → ${width}×${height}mm (${displayWidth}×${displayHeight}px), aspect: ${(width/height).toFixed(3)}`);
        
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
                        case 'riley-waves':
                            this.generateRileyWaves(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'vasarely-zebra':
                            this.generateVasarelyZebra(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'anuszkiewicz-squares':
                            this.generateAnuszkiewiczSquares(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'riley-crest':
                            this.generateRileyCrest(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'vasarely-vega':
                            this.generateVasarelyVega(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'soto-vibration':
                            this.generateSotoVibration(layerGroup, currentRotation, slowAnimationTime);
                            break;
                        case 'cruz-diez-strips':
                            this.generateCruzDiezStrips(layerGroup, currentRotation, slowAnimationTime);
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
        const amplitude = parseInt(document.getElementById('amplitude').value); // Use amplitude for initial seed pattern
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

        // AMPLITUDE controls initial seed pattern width
        // amplitude -1000 to +1000 maps to seed width
        const seedWidth = Math.max(1, Math.floor(Math.abs(amplitude) / 20)); // 1 to 50 cells
        const center = Math.floor(cellsPerRow / 2);

        if (amplitude >= 0) {
            // Positive amplitude: continuous seed cluster
            for (let i = 0; i < seedWidth; i++) {
                const offset = Math.floor(i - seedWidth / 2);
                const pos = (center + offset + cellsPerRow) % cellsPerRow;
                currentRow[pos] = 1;
            }
        } else {
            // Negative amplitude: scattered seed pattern
            for (let i = 0; i < seedWidth; i++) {
                const offset = i * 2; // Every other cell
                const pos = (center + offset - seedWidth + cellsPerRow) % cellsPerRow;
                currentRow[pos] = 1;
            }
        }

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
        // TURBULENT TOPOLOGY - Organic contour map using multi-octave fBm
        const complexity = parseInt(document.getElementById('complexity').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Complexity controls number of contour levels (3-100)
        const numContours = Math.max(3, Math.min(100, Math.floor(complexity / 3)));

        // Frequency controls noise scale AND octaves
        const octaves = Math.max(1, Math.min(8, Math.floor(1 + frequency / 15)));
        const noiseScale = frequency / 200;

        // Amplitude controls contour smoothing (sampling density)
        const cellSize = Math.max(2, Math.min(15, 15 - (amplitude / 100)));

        const gridWidth = Math.ceil(this.actualWidth / cellSize);
        const gridHeight = Math.ceil(this.actualHeight / cellSize);

        // Generate 2D fractal noise field
        const noiseField = [];
        let minNoise = Infinity, maxNoise = -Infinity;

        for (let gy = 0; gy < gridHeight; gy++) {
            const row = [];
            for (let gx = 0; gx < gridWidth; gx++) {
                const x = gx * cellSize;
                const y = gy * cellSize;

                const noiseValue = this._fbm(
                    x * noiseScale,
                    y * noiseScale,
                    this.currentSeed * 5 + slowAnimationTime * 0.1,
                    octaves,
                    0.5
                );

                row.push(noiseValue);
                minNoise = Math.min(minNoise, noiseValue);
                maxNoise = Math.max(maxNoise, noiseValue);
            }
            noiseField.push(row);
        }

        // Draw contour lines by sampling threshold levels
        for (let contourIndex = 0; contourIndex < numContours; contourIndex++) {
            const t = contourIndex / (numContours - 1);
            const threshold = minNoise + (maxNoise - minNoise) * t;

            // Trace contour at this threshold level
            const contourPaths = this._traceContours(noiseField, threshold, cellSize, gridWidth, gridHeight);

            contourPaths.forEach(points => {
                if (points.length < 3) return;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                let pathData = `M ${points[0].x} ${points[0].y}`;

                for (let i = 1; i < points.length; i++) {
                    pathData += ` L ${points[i].x} ${points[i].y}`;
                }

                // Close path if it loops back
                const dist = Math.sqrt(
                    Math.pow(points[0].x - points[points.length-1].x, 2) +
                    Math.pow(points[0].y - points[points.length-1].y, 2)
                );
                if (dist < cellSize * 2) {
                    pathData += ' Z';
                }

                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', this.getLineColor(contourIndex, numContours));
                path.setAttribute('stroke-width', this.getAutoLineWidth());
                path.setAttribute('stroke-linejoin', 'round');
                path.setAttribute('stroke-linecap', 'round');

                layerGroup.appendChild(path);
            });
        }

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform', `rotate(${currentRotation} ${centerX} ${centerY})`);
        }
    }

    _traceContours(noiseField, threshold, cellSize, gridWidth, gridHeight) {
        // Simplified contour tracing using horizontal scan lines
        const contours = [];

        for (let y = 0; y < gridHeight - 1; y++) {
            let inContour = false;
            let currentContour = [];

            for (let x = 0; x < gridWidth - 1; x++) {
                const current = noiseField[y][x];
                const next = noiseField[y][x + 1];

                // Crossing detection
                if ((current < threshold && next >= threshold) || (current >= threshold && next < threshold)) {
                    // Linear interpolation for smooth crossing
                    const t = (threshold - current) / (next - current);
                    const px = (x + t) * cellSize;
                    const py = y * cellSize;

                    currentContour.push({ x: px, y: py });

                    if (!inContour) {
                        inContour = true;
                    } else {
                        // End of contour segment
                        if (currentContour.length > 2) {
                            contours.push(currentContour);
                        }
                        currentContour = [];
                        inContour = false;
                    }
                }
            }

            if (currentContour.length > 2) {
                contours.push(currentContour);
            }
        }

        return contours;
    }

    clearCanvas() {
        // Remove all children except dark-mode-bg (preserve it to stay behind patterns)
        Array.from(this.canvas.children).forEach(child => {
            if (child.id !== 'dark-mode-bg') {
                child.remove();
            }
        });
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

        console.log(`🔵 EYE PATTERN GENERATING - Amplitude: ${amplitude}, Frequency: ${frequency}`);

        // Amplitude controls the size/scale of the eye (0-100 maps to 20%-90% of canvas)
        const eyeScale = 0.2 + (amplitude / 100) * 0.7; // 0.2 to 0.9

        // Calculate base eye size - this determines the size of everything including the pupil
        const baseSize = Math.min(this.actualWidth, this.actualHeight) * eyeScale;
        const maxRadius = baseSize * 0.45;
        const numRings = Math.max(15, complexity);

        // Frequency controls both wave frequencies AND distortion intensity
        const distortionIntensity = 0.5 + (frequency / 100) * 2.5; // 0.5 to 3.0 based on frequency
        const waveFreq1 = 1 + (frequency / 100) * 6; // Primary wave: 1-7
        const waveFreq2 = 2 + (frequency / 100) * 10; // Secondary wave: 2-12
        const waveFreq3 = 3 + (frequency / 100) * 17; // Tertiary wave: 3-20
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
                // Add multiple wave frequencies for organic feel - MUCH larger multipliers for visible effect
                const organicWave1 = Math.sin(angle * waveFreq1 + this.currentSeed * 10) * distortionIntensity * 0.4;
                const organicWave2 = Math.sin(angle * waveFreq2 + progress * Math.PI * 2) * distortionIntensity * 0.3;
                const organicWave3 = Math.sin(angle * waveFreq3) * distortionIntensity * 0.25;

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
        
        // Iris and pupil sizing
        const irisRadius = maxRadius * 0.4; // Fixed proportion of eye

        // FREQUENCY controls pupil dilation (0-100 maps to 5%-35% of maxRadius)
        const pupilScale = 0.05 + (frequency / 100) * 0.3; // 0.05 to 0.35
        const pupilRadius = maxRadius * pupilScale;

        console.log(`⚫ PUPIL SIZE - Frequency: ${frequency}, Pupil Radius: ${pupilRadius.toFixed(1)}px (${(pupilScale * 100).toFixed(0)}% of eye)`);

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

                // Add wave to iris lines for organic texture - frequency controls wave intensity
                const waveOffset = Math.sin(progress * Math.PI * waveFreq3) * distortionIntensity * 15;
                const offsetAngle = angle + waveOffset * 0.03;
                
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
    }

    generateAdvancedEyePattern(layerGroup) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        console.log(`🔵 EYE PATTERN (Advanced) - Amplitude: ${amplitude}, Frequency: ${frequency}`);

        // Create horizontal lines that curve around eye shape
        const lineSpacing = this.actualHeight / complexity;
        const totalLines = Math.ceil((this.actualHeight + 2 * lineSpacing) / lineSpacing);

        // Amplitude controls overall eye size (0-100 maps to 0.2-0.8x size)
        const eyeScale = 0.2 + (Math.abs(amplitude) / 100) * 0.6;
        const displacementStrength = 3.0; // Fixed strength

        // Frequency controls wave detail (0-100 maps to 0.01-0.2 wave frequency)
        const waveFrequency = 0.01 + (Math.abs(frequency) / 100) * 0.19;

        let lineIndex = 0;
        for (let y = -lineSpacing; y < this.actualHeight + lineSpacing; y += lineSpacing) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = `M 0 ${y}`;

            for (let x = 0; x <= this.actualWidth; x += 1) {
                const dx = x - centerX;
                const dy = y - centerY;

                // Create eye-like displacement field - scaled by amplitude
                const eyeWidth = this.actualWidth * 0.4 * eyeScale;
                const eyeHeight = this.actualHeight * 0.2 * eyeScale;

                // Elliptical field
                const normalizedX = dx / eyeWidth;
                const normalizedY = dy / eyeHeight;
                const ellipseDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

                // Eye field strength controlled by amplitude
                const baseFieldStrength = Math.exp(-ellipseDistance * 2) * 40;
                const fieldStrength = baseFieldStrength * displacementStrength;

                // Vertical displacement creating eye curve
                const eyeDisplacement = fieldStrength * Math.sin(normalizedX * Math.PI) * (1 - Math.abs(normalizedY));

                // Add wave variation controlled by frequency
                const waveDisplacement = Math.sin(x * waveFrequency + this.currentSeed * 3) * fieldStrength * 0.5;

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

        // Add pupil - FREQUENCY controls pupil size (dilation)
        // 0-100 maps to 5%-35% of canvas size
        const basePupilSize = Math.min(this.actualWidth, this.actualHeight);
        const pupilScale = 0.05 + (Math.abs(frequency) / 100) * 0.3; // 0.05 to 0.35
        const pupilRadius = basePupilSize * pupilScale * eyeScale; // Also scales with overall eye size

        console.log(`⚫ PUPIL SIZE - Frequency: ${frequency}, Pupil Radius: ${pupilRadius.toFixed(1)}px`);

        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', pupilRadius);
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

        // Fraser Spiral: Concentric circles with tilted arc segments create spiral illusion
        const numRings = Math.max(30, complexity * 1.5);
        const maxRadius = Math.min(this.actualWidth, this.actualHeight) * 0.48;

        // Golden ratio for natural spacing
        const phi = (1 + Math.sqrt(5)) / 2;

        // SEED-BASED RANDOMNESS for organic variation
        const seedOffset = this.seededRandom(this.currentSeed) * Math.PI * 2;
        const spiralDirection = this.seededRandom(this.currentSeed + 3) > 0.5 ? 1 : -1;

        // LAYER 1: Fraser-style concentric circles with directional arcs
        for (let ring = 0; ring < numRings; ring++) {
            const progress = ring / numRings;

            // Exponential spacing creates vortex acceleration toward center
            const radius = maxRadius * Math.pow(progress, 0.7);

            // More segments in outer rings (density variation - Riley technique)
            const baseSegments = 12 + Math.floor(progress * frequency * 0.5);
            const numSegments = Math.max(8, baseSegments);
            const segmentAngle = (Math.PI * 2) / numSegments;

            for (let seg = 0; seg < numSegments; seg++) {
                // Fraser offset: systematic tilt creates spiral illusion
                const tiltStrength = frequency * 0.005;
                const tiltOffset = (ring * tiltStrength * spiralDirection) + (seg * 0.08) + seedOffset;

                const startAngle = seg * segmentAngle + tiltOffset;
                const endAngle = (seg + 0.75) * segmentAngle + tiltOffset; // 75% coverage creates gaps

                // Vasarely depth: radial wave modulation for 3D bulge effect
                const radialPhase = seg * segmentAngle + (ring * frequency * 0.03);
                const depthFactor = Math.sin((progress) * Math.PI); // Bell curve peaks at middle
                const depthModulation = Math.sin(radialPhase) * (amplitude / 100) * maxRadius * 0.15 * depthFactor;

                // Riley rhythm: variable line weights create visual breathing
                const isThick = seg % 2 === 0;
                const baseWeight = lineWidth;
                const weight = isThick
                    ? baseWeight * (1.5 + progress * 0.5) // Thick gets thicker outward
                    : baseWeight * (0.5 + progress * 0.3); // Thin stays thinner

                // Micro-variation for organic feel
                const microJitter = this.seededRandom(this.currentSeed + ring * 100 + seg) * 0.5;
                const finalRadius = radius + depthModulation + microJitter;

                // Create arc segment
                const path = this.createSpiralArcSegment(
                    centerX, centerY,
                    finalRadius,
                    startAngle, endAngle,
                    weight
                );

                // Alternating colors enhance Fraser effect
                const colorOffset = isThick ? 0 : Math.floor(numRings / 2);
                const color = this.getLineColor(ring + colorOffset, numRings);

                path.setAttribute('stroke', color);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke-linecap', 'round');

                if (rotation !== 0) {
                    path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
                }

                layerGroup.appendChild(path);
            }
        }

        // LAYER 2 (OPTIONAL): Counter-rotating interference spiral for moiré patterns
        if (Math.abs(amplitude) > 50) {
            const interferenceRings = Math.floor(numRings * 0.3);
            const interferenceOpacity = Math.min(0.6, Math.abs(amplitude - 50) / 100);

            for (let ring = 0; ring < interferenceRings; ring++) {
                const progress = ring / interferenceRings;

                // Logarithmic growth for contrast with Layer 1
                const radius = maxRadius * 0.1 * Math.exp(progress * 2.5);
                const spiralAngle = ring * (frequency * 0.08) * -spiralDirection; // Counter-rotate

                // Draw continuous spiral curve
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                let pathData = '';

                const numPoints = 60;
                for (let i = 0; i <= numPoints; i++) {
                    const angle = (i / numPoints) * Math.PI * 2 + spiralAngle;
                    const r = radius * (1 + (i / numPoints) * 0.3); // Slight expansion

                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;

                    pathData += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
                }

                path.setAttribute('d', pathData);
                path.setAttribute('stroke', this.getLineColor(ring, interferenceRings));
                path.setAttribute('stroke-width', lineWidth * 0.3);
                path.setAttribute('fill', 'none');
                path.setAttribute('opacity', interferenceOpacity);
                path.setAttribute('stroke-linecap', 'round');

                if (rotation !== 0) {
                    path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
                }

                layerGroup.appendChild(path);
            }
        }

        // Add center focal point
        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerDot.setAttribute('cx', centerX);
        centerDot.setAttribute('cy', centerY);
        centerDot.setAttribute('r', Math.max(2, lineWidth * 1.5));
        centerDot.setAttribute('fill', this.getLineColor(0, 1));
        centerDot.setAttribute('fill-opacity', '0.9');
        layerGroup.appendChild(centerDot);
    }

    // Helper function: Create arc segment with precise control
    createSpiralArcSegment(cx, cy, radius, startAngle, endAngle, strokeWidth) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // High-resolution arc for smooth curves
        const steps = 20;
        let pathData = '';

        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / steps);
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            pathData += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
        }

        path.setAttribute('d', pathData);
        path.setAttribute('stroke-width', strokeWidth);
        return path;
    }

    generateShadedGrid(layerGroup, currentRotation, slowAnimationTime) {
        // VASARELY WARPED GRID - True optical art using perspective distortion
        const complexity = parseInt(document.getElementById('complexity').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);

        // Grid setup
        const cellsAcross = Math.max(8, Math.floor(complexity / 3));
        const cellSize = this.actualWidth / cellsAcross;
        const numCells = Math.ceil(this.actualHeight / cellSize);

        // Distortion centers (frequency controls count)
        const numCenters = Math.max(1, Math.floor(frequency / 25));
        const centers = [];

        if (numCenters === 1) {
            centers.push({
                x: this.actualWidth / 2,
                y: this.actualHeight / 2,
                strength: amplitude / 100,
                radius: Math.min(this.actualWidth, this.actualHeight) * 0.4
            });
        } else {
            // Multiple centers arranged in circle
            for (let i = 0; i < numCenters; i++) {
                const angle = (i / numCenters) * Math.PI * 2;
                const offsetRadius = Math.min(this.actualWidth, this.actualHeight) * 0.25;
                centers.push({
                    x: this.actualWidth/2 + Math.cos(angle) * offsetRadius,
                    y: this.actualHeight/2 + Math.sin(angle) * offsetRadius,
                    strength: amplitude / 100,
                    radius: Math.min(this.actualWidth, this.actualHeight) * 0.3
                });
            }
        }

        // Draw distorted grid
        for (let row = 0; row < numCells; row++) {
            for (let col = 0; col < cellsAcross; col++) {
                // Original grid position
                const gridX = col * cellSize;
                const gridY = row * cellSize;

                // Calculate 4 corner positions with distortion
                const corners = [
                    {ox: gridX, oy: gridY},                      // Top-left
                    {ox: gridX + cellSize, oy: gridY},           // Top-right
                    {ox: gridX + cellSize, oy: gridY + cellSize}, // Bottom-right
                    {ox: gridX, oy: gridY + cellSize}            // Bottom-left
                ];

                // Apply distortion to each corner
                corners.forEach(corner => {
                    let totalDX = 0, totalDY = 0;

                    centers.forEach(center => {
                        const dx = corner.ox - center.x;
                        const dy = corner.oy - center.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);

                        // Gaussian influence
                        const influence = Math.exp(-(distance*distance) /
                                                  (2 * center.radius * center.radius));

                        // Radial displacement (creates bulge/indent)
                        const displacementMag = influence * center.strength * cellSize * 2;

                        if (distance > 0) {
                            totalDX += (dx / distance) * displacementMag;
                            totalDY += (dy / distance) * displacementMag;
                        }
                    });

                    corner.x = corner.ox + totalDX;
                    corner.y = corner.oy + totalDY;
                });

                // Create distorted quad as SVG path
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const pathData = `M ${corners[0].x} ${corners[0].y} ` +
                               `L ${corners[1].x} ${corners[1].y} ` +
                               `L ${corners[2].x} ${corners[2].y} ` +
                               `L ${corners[3].x} ${corners[3].y} Z`;

                path.setAttribute('d', pathData);

                // Checkerboard coloring with palette support
                const isBlack = (row + col) % 2 === 0;
                const color = this.getLineColor(row * cellsAcross + col, cellsAcross * numCells);

                path.setAttribute('fill', isBlack ? color : 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', this.getAutoLineWidth() * 0.5);

                layerGroup.appendChild(path);
            }
        }

        if (currentRotation !== 0) {
            layerGroup.setAttribute('transform',
                `rotate(${currentRotation} ${this.actualWidth/2} ${this.actualHeight/2})`);
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

    // ═══════════════════════════════════════════════════════════════════════
    // BRIDGET RILEY WAVES PATTERN
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
    // ═══════════════════════════════════════════════════════════════════════

    generateMiniRileyWaves(svg, seed, complexity, lineWidth) {
        const size = 56;
        // Updated to match default settings (complexity: 62, frequency: 57, amplitude: 62)
        const numLines = 12; // Scaled down from 62 for thumbnail
        const spacing = size / numLines;
        const maxAmplitude = size * 0.22; // Scaled from amplitude: 62 (about 62% of range)
        const frequency = 2.8; // Scaled from frequency: 57 (about 57% of range)

        // Rotate -90° for vertical waves (default rotation)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `rotate(-90 ${size/2} ${size/2})`);

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
                const waveY = y + lineAmplitude * Math.sin(xProgress * Math.PI * 2 * frequency);

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

            g.appendChild(path);
        }

        svg.appendChild(g);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VASARELY ZEBRA PATTERN (Stripe Deformation)
    // ═══════════════════════════════════════════════════════════════════════

    generateVasarelyZebra(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Number of stripes based on complexity
        const numStripes = Math.max(20, complexity * 3);
        const stripeSpacing = this.actualHeight / numStripes;

        // Single centered sphere - classic Vasarely Zebra effect
        const spheres = [{
            x: centerX,
            y: centerY,
            radius: (amplitude / 100) * Math.min(this.actualWidth, this.actualHeight) * 0.3
        }];

        // Use frequency to control deformation strength (how much stripes bend)
        const deformationStrength = (frequency / 100) * 0.8; // 0 to 0.8

        // Create horizontal stripes that warp around the spheres
        for (let i = 0; i < numStripes; i++) {
            const isBlack = i % 2 === 0;
            const y = i * stripeSpacing;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 200;
            const step = this.actualWidth / numPoints;

            // Generate stripe with deformation
            for (let x = 0; x <= this.actualWidth; x += step) {
                let totalDisplacement = 0;

                // Calculate displacement from all influence spheres
                for (const sphere of spheres) {
                    const dx = x - sphere.x;
                    const dy = y - sphere.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < sphere.radius) {
                        // Vasarely displacement formula with frequency-controlled strength
                        const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                        totalDisplacement += influence * sphere.radius * deformationStrength;
                    }
                }

                const warpedY = y + totalDisplacement;

                if (pathData === '') {
                    pathData = `M ${x} ${warpedY}`;
                } else {
                    pathData += ` L ${x} ${warpedY}`;
                }
            }

            // Complete the stripe by going back
            pathData += ` L ${this.actualWidth} ${y + stripeSpacing}`;
            for (let x = this.actualWidth; x >= 0; x -= step) {
                let totalDisplacement = 0;

                for (const sphere of spheres) {
                    const dx = x - sphere.x;
                    const dy = (y + stripeSpacing) - sphere.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < sphere.radius) {
                        const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                        totalDisplacement += influence * sphere.radius * deformationStrength;
                    }
                }

                const warpedY = (y + stripeSpacing) + totalDisplacement;
                pathData += ` L ${x} ${warpedY}`;
            }

            pathData += ' Z';

            path.setAttribute('d', pathData);
            // Use color palette system instead of hardcoded black/white
            const color = isBlack ? this.getLineColor(0, 2) : this.getLineColor(1, 2);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', 'none');

            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VASARELY ZEBRA MINI PREVIEW
    // ═══════════════════════════════════════════════════════════════════════

    generateMiniVasarelyZebra(svg, seed, complexity, lineWidth) {
        const size = 56;
        const numStripes = Math.min(12, complexity * 2);
        const stripeSpacing = size / numStripes;

        // Single centered sphere for preview
        const sphere = {
            x: size / 2,
            y: size / 2,
            radius: size * 0.35
        };

        for (let i = 0; i < numStripes; i++) {
            const isBlack = i % 2 === 0;
            const y = i * stripeSpacing;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            // Top edge of stripe
            for (let x = 0; x <= size; x += 2) {
                const dx = x - sphere.x;
                const dy = y - sphere.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let displacement = 0;
                if (distance < sphere.radius) {
                    const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                    displacement = influence * sphere.radius * 0.5;
                }

                const warpedY = y + displacement;
                if (pathData === '') {
                    pathData = `M ${x} ${warpedY}`;
                } else {
                    pathData += ` L ${x} ${warpedY}`;
                }
            }

            // Bottom edge of stripe (reverse)
            pathData += ` L ${size} ${y + stripeSpacing}`;
            for (let x = size; x >= 0; x -= 2) {
                const dx = x - sphere.x;
                const dy = (y + stripeSpacing) - sphere.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let displacement = 0;
                if (distance < sphere.radius) {
                    const influence = 1 - (distance * distance) / (sphere.radius * sphere.radius);
                    displacement = influence * sphere.radius * 0.5;
                }

                const warpedY = (y + stripeSpacing) + displacement;
                pathData += ` L ${x} ${warpedY}`;
            }

            pathData += ' Z';

            path.setAttribute('d', pathData);
            // Thumbnails use hardcoded black/white for consistency
            path.setAttribute('fill', isBlack ? '#000' : '#fff');
            path.setAttribute('stroke', 'none');

            svg.appendChild(path);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ANUSZKIEWICZ RADIATING SQUARES (Chromatic Vibration)
    // ═══════════════════════════════════════════════════════════════════════

    generateAnuszkiewiczSquares(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;
        const colorMode = document.getElementById('color-mode').value;

        // Number of concentric squares
        const numSquares = Math.max(10, complexity * 2);
        const maxSize = Math.max(this.actualWidth, this.actualHeight) * 1.4;

        // Amplitude controls size variation/spacing (0-100 maps to 0.5-2.0x spacing)
        const sizeVariation = 0.5 + (amplitude / 100) * 1.5;
        const sizeStep = (maxSize / numSquares) * sizeVariation;

        // Frequency controls color cycling speed (higher = faster color changes)
        const colorCycleSpeed = Math.max(1, frequency / 10);

        // Create concentric squares with colors from palette
        for (let i = 0; i < numSquares; i++) {
            const size = maxSize - (i * sizeStep);

            // For black/single color modes, use alternating complementary colors
            // Otherwise use full gradient across all squares with frequency-based cycling
            let color;
            if (colorMode === 'black' || colorMode === 'single') {
                // Fallback to complementary colors for contrast
                const complementaryPairs = [
                    ['#FF0000', '#00FFFF'], // Red / Cyan
                    ['#0000FF', '#FFB000'], // Blue / Orange
                ];
                const pairIndex = Math.floor((amplitude / 100) * (complementaryPairs.length - 1));
                const colors = complementaryPairs[pairIndex];
                color = colors[Math.floor(i * colorCycleSpeed) % 2];
            } else {
                // Use full palette with frequency-controlled cycling
                const colorIndex = Math.floor(i * colorCycleSpeed) % numSquares;
                color = this.getLineColor(colorIndex, numSquares);
            }

            // Rotation per square for enhanced effect
            const squareRotation = rotation + (i * 0.5);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', centerX - size / 2);
            rect.setAttribute('y', centerY - size / 2);
            rect.setAttribute('width', size);
            rect.setAttribute('height', size);
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', 'none');

            if (squareRotation !== 0) {
                rect.setAttribute('transform', `rotate(${squareRotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(rect);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ANUSZKIEWICZ RADIATING SQUARES MINI PREVIEW
    // ═══════════════════════════════════════════════════════════════════════

    generateMiniAnuszkiewiczSquares(svg, seed, complexity, lineWidth) {
        const size = 56;
        const centerX = size / 2;
        const centerY = size / 2;

        // Updated to match default settings (complexity: 284, frequency: 26, amplitude: 23)
        const numSquares = 22; // Scaled down from complexity: 284
        const sizeVariation = 0.845; // From amplitude: 23 (0.5 + 23/100 * 1.5)
        const sizeStep = (size / numSquares) * sizeVariation;
        const colorCycleSpeed = 2.6; // From frequency: 26 (26/10)

        // Red/Cyan for preview
        const colors = ['#FF0000', '#00FFFF'];

        for (let i = 0; i < numSquares; i++) {
            const squareSize = size - (i * sizeStep);

            // Apply frequency-based color cycling
            const colorIndex = Math.floor(i * colorCycleSpeed) % 2;
            const color = colors[colorIndex];

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', centerX - squareSize / 2);
            rect.setAttribute('y', centerY - squareSize / 2);
            rect.setAttribute('width', squareSize);
            rect.setAttribute('height', squareSize);
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', 'none');

            svg.appendChild(rect);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RILEY CREST PATTERN (Vertical Wave Lines)
    // ═══════════════════════════════════════════════════════════════════════

    generateRileyCrest(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Number of vertical lines
        const numLines = Math.max(30, complexity * 3);
        const spacing = this.actualWidth / numLines;

        // Horizontal wave amplitude
        const maxAmplitude = (amplitude / 100) * this.actualWidth * 0.15;

        // Wavelength and phase shift
        const wavelength = Math.max(50, this.actualHeight / (frequency / 20));
        const phaseShift = (Math.PI * 2) / numLines;

        // Create vertical lines with horizontal wave displacement
        for (let i = 0; i < numLines; i++) {
            const x = i * spacing;
            const phase = i * phaseShift;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            const numPoints = 100;
            const step = this.actualHeight / numPoints;

            for (let y = 0; y <= this.actualHeight; y += step) {
                // Horizontal displacement with phase shift
                const dx = maxAmplitude * Math.sin((2 * Math.PI * y / wavelength) + phase);
                const warpedX = x + dx;

                if (pathData === '') {
                    pathData = `M ${warpedX} ${y}`;
                } else {
                    pathData += ` L ${warpedX} ${y}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');

            const color = this.getLineColor(i, numLines);
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', lineWidth);

            if (rotation !== 0) {
                path.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(path);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RILEY CREST MINI PREVIEW
    // ═══════════════════════════════════════════════════════════════════════

    generateMiniRileyCrest(svg, seed, complexity, lineWidth) {
        const size = 56;
        // Updated to match default settings (complexity: 48, frequency: 63, amplitude: 15)
        const numLines = 10; // Scaled down from complexity: 48
        const spacing = size / numLines;
        const maxAmplitude = size * 0.08; // Scaled from amplitude: 15 (subtle waves)
        const wavelength = size / 3.15; // Scaled from frequency: 63 (about 63% of range = higher frequency)
        const phaseShift = (Math.PI * 2) / numLines;

        for (let i = 0; i < numLines; i++) {
            const x = i * spacing;
            const phase = i * phaseShift;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData = '';

            for (let y = 0; y <= size; y += 2) {
                const dx = maxAmplitude * Math.sin((2 * Math.PI * y / wavelength) + phase);
                const warpedX = x + dx;

                if (pathData === '') {
                    pathData = `M ${warpedX} ${y}`;
                } else {
                    pathData += ` L ${warpedX} ${y}`;
                }
            }

            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', lineWidth * 0.5);

            svg.appendChild(path);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VASARELY VEGA CHECKERBOARD (Bulging Grid)
    // ═══════════════════════════════════════════════════════════════════════

    generateVasarelyVega(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Grid dimensions based on complexity
        const gridSize = Math.max(8, Math.floor(complexity / 15));
        const baseSquareSize = Math.min(this.actualWidth, this.actualHeight) / gridSize;

        // Wave parameters for size modulation
        const waveAmplitude = (amplitude / 100) * 0.8; // Scale factor: 0-0.8
        const freqX = Math.max(1, frequency / 30);
        const freqY = Math.max(1, frequency / 30);

        // Create checkerboard with size-modulated squares
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const isBlack = (row + col) % 2 === 0;

                // Calculate center of this grid cell
                const cellCenterX = col * baseSquareSize + baseSquareSize / 2;
                const cellCenterY = row * baseSquareSize + baseSquareSize / 2;

                // Calculate wave-based size modulation
                const normalizedX = col / gridSize;
                const normalizedY = row / gridSize;

                // Combine sine waves to create bulging/caving effect
                const wave = Math.sin(normalizedX * Math.PI * 2 * freqX) *
                           Math.sin(normalizedY * Math.PI * 2 * freqY);

                // Map wave to size multiplier (1.0 - waveAmplitude to 1.0 + waveAmplitude)
                const sizeMultiplier = 1.0 + (wave * waveAmplitude);
                const squareSize = baseSquareSize * sizeMultiplier;

                // Create square centered in cell
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', cellCenterX - squareSize / 2);
                rect.setAttribute('y', cellCenterY - squareSize / 2);
                rect.setAttribute('width', squareSize);
                rect.setAttribute('height', squareSize);
                // Use color palette system instead of hardcoded black/white
                const color = isBlack ? this.getLineColor(0, 2) : this.getLineColor(1, 2);
                rect.setAttribute('fill', color);
                rect.setAttribute('stroke', 'none');

                if (rotation !== 0) {
                    rect.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
                }

                layerGroup.appendChild(rect);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VASARELY VEGA MINI PREVIEW
    // ═══════════════════════════════════════════════════════════════════════

    generateMiniVasarelyVega(svg, seed, complexity, lineWidth) {
        const size = 56;

        // Updated to match default settings (complexity: 232, frequency: 65, amplitude: 85)
        const gridSize = 14; // Scaled down from 15 (232/15) for thumbnail
        const baseSquareSize = size / gridSize;
        const waveAmplitude = 0.68; // From amplitude: 85 → (85/100) * 0.8
        const freq = 2.17; // From frequency: 65 → 65/30

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const isBlack = (row + col) % 2 === 0;

                const cellCenterX = col * baseSquareSize + baseSquareSize / 2;
                const cellCenterY = row * baseSquareSize + baseSquareSize / 2;

                const normalizedX = col / gridSize;
                const normalizedY = row / gridSize;

                const wave = Math.sin(normalizedX * Math.PI * 2 * freq) *
                           Math.sin(normalizedY * Math.PI * 2 * freq);

                const sizeMultiplier = 1.0 + (wave * waveAmplitude);
                const squareSize = baseSquareSize * sizeMultiplier;

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', cellCenterX - squareSize / 2);
                rect.setAttribute('y', cellCenterY - squareSize / 2);
                rect.setAttribute('width', squareSize);
                rect.setAttribute('height', squareSize);
                // Thumbnails use hardcoded black/white for consistency
                rect.setAttribute('fill', isBlack ? '#000' : '#fff');
                rect.setAttribute('stroke', 'none');

                svg.appendChild(rect);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SOTO VIBRATION LINES (Superimposed Layers)
    // ═══════════════════════════════════════════════════════════════════════

    generateSotoVibration(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        // Use color palette system instead of hardcoded black/white
        const lineColor = this.getLineColor(0, 1);

        // Dense vertical lines for layer 1 - cap at 150 to prevent white-out
        const numLines = Math.min(150, Math.max(50, complexity * 5));
        const spacing = this.actualWidth / numLines;

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
            line.setAttribute('y2', this.actualHeight);
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
            line.setAttribute('y2', this.actualHeight);
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', strokeWidth);
            layer2.appendChild(line);
        }

        const totalRotation = rotation + layer2Rotation;
        layer2.setAttribute('transform', `rotate(${totalRotation} ${centerX} ${centerY})`);

        layerGroup.appendChild(layer1);
        layerGroup.appendChild(layer2);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SOTO VIBRATION LINES MINI PREVIEW
    // ═══════════════════════════════════════════════════════════════════════

    generateMiniSotoVibration(svg, seed, complexity, lineWidth) {
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

    // ═══════════════════════════════════════════════════════════════════════
    // CRUZ-DIEZ CHROMATIC STRIPS (Kinetic Color)
    // ═══════════════════════════════════════════════════════════════════════

    generateCruzDiezStrips(layerGroup, currentRotation, slowAnimationTime) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = this.getAutoLineWidth();
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;
        const colorMode = document.getElementById('color-mode').value;

        // Complexity controls strip width (higher complexity = thinner strips)
        const stripWidth = Math.max(0.5, 10 / Math.max(1, complexity / 10));
        const numStrips = Math.floor(this.actualWidth / stripWidth);

        // Frequency controls pattern repeat (how often the color sequence repeats)
        const patternRepeat = Math.max(1, Math.floor(frequency / 10));

        // Amplitude controls strip width variation (0-100 = uniform, >100 = varied widths)
        const widthVariation = Math.max(0, (amplitude - 100) / 100);

        // Create vertical strips in A-B-C pattern using palette colors
        for (let i = 0; i < numStrips; i++) {
            // Apply width variation if amplitude > 100
            const thisStripWidth = stripWidth * (1 + (Math.sin(i * 0.5) * widthVariation));
            const x = i * stripWidth;

            // Determine color based on position in pattern - use 3-color cycling
            const posInPattern = i % (patternRepeat * 3);
            let colorIndex;

            if (posInPattern < patternRepeat) {
                colorIndex = 0; // Color A
            } else if (posInPattern < patternRepeat * 2) {
                colorIndex = 1; // Color B (middle)
            } else {
                colorIndex = 2; // Color C
            }

            const color = this.getLineColor(colorIndex, 3);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', thisStripWidth);
            rect.setAttribute('height', this.actualHeight);
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', 'none');

            if (rotation !== 0) {
                rect.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            layerGroup.appendChild(rect);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CRUZ-DIEZ CHROMATIC STRIPS MINI PREVIEW
    // ═══════════════════════════════════════════════════════════════════════

    generateMiniCruzDiezStrips(svg, seed, complexity, lineWidth) {
        const size = 56;

        // Updated to match default settings (complexity: 197, frequency: 61, amplitude: 77)
        const stripWidth = 0.5; // Very thin strips from high complexity (197)
        const numStrips = Math.floor(size / stripWidth);
        const patternRepeat = 6; // From frequency: 61 → floor(61/10)

        // Red + Blue + White for preview
        const colors = ['#FF0000', '#FFFFFF', '#0000FF'];

        for (let i = 0; i < numStrips; i++) {
            const x = i * stripWidth;

            // 3-color cycling pattern
            const posInPattern = i % (patternRepeat * 3);
            let colorIndex;

            if (posInPattern < patternRepeat) {
                colorIndex = 0; // Red
            } else if (posInPattern < patternRepeat * 2) {
                colorIndex = 1; // White
            } else {
                colorIndex = 2; // Blue
            }

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', stripWidth);
            rect.setAttribute('height', size);
            rect.setAttribute('fill', colors[colorIndex]);
            rect.setAttribute('stroke', 'none');

            svg.appendChild(rect);
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
        // Reset all controls to default values, but keep current pattern
        const currentPattern = document.getElementById('pattern-type').value;

        const defaultSettings = {
            patternType: currentPattern, // Keep the currently selected pattern
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
                case 'riley-waves':
                    this.generateMiniRileyWaves(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'vasarely-zebra':
                    this.generateMiniVasarelyZebra(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'anuszkiewicz-squares':
                    this.generateMiniAnuszkiewiczSquares(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'riley-crest':
                    this.generateMiniRileyCrest(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'vasarely-vega':
                    this.generateMiniVasarelyVega(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'soto-vibration':
                    this.generateMiniSotoVibration(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
                    break;
                case 'cruz-diez-strips':
                    this.generateMiniCruzDiezStrips(svg, settings.seed, Math.min(settings.complexity / 10, 20), this.getAutoLineWidth());
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

            // Spacebar = Randomize
            if (e.code === 'Space') {
                e.preventDefault();
                this.randomizeAll();
                return;
            }

            // E = Export PNG
            if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                this.exportImage('png');
                return;
            }

            // Arrow keys = Navigate patterns
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const select = document.getElementById('pattern-type');
                const currentIndex = select.selectedIndex;

                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    select.selectedIndex = currentIndex - 1;
                } else if (e.key === 'ArrowRight' && currentIndex < select.options.length - 1) {
                    select.selectedIndex = currentIndex + 1;
                }

                select.dispatchEvent(new Event('change'));
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
            
            // CRITICAL: Generate initial frame (frame 0) BEFORE starting capture loop
            console.log('🎬 Initializing first frame (progress 0)...');
            this.applyAnimationForFrame(0, animationMode);
            
            // Wait for initial pattern to fully render
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => setTimeout(resolve, 100)); // Extra time for first frame
            
            console.log('✅ Initial frame rendered, starting capture...');
            
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
                
                // Wait for render to fully complete (more robust timing)
                // Multiple RAF calls + fixed delay ensures SVG/DOM has time to render
                await new Promise(resolve => requestAnimationFrame(resolve));
                await new Promise(resolve => requestAnimationFrame(resolve));
                await new Promise(resolve => requestAnimationFrame(resolve));
                await new Promise(resolve => requestAnimationFrame(resolve));
                
                // Additional fixed delay for complex patterns (especially glow/filters)
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Debug: Log dimensions before capture (first frame only)
                if (i === 0) {
                    console.log(`🎥 VIDEO EXPORT DEBUG (Frame 0):`);
                    console.log(`   format-preset value: ${document.getElementById('format-preset').value}`);
                    console.log(`   this.actualWidth: ${this.actualWidth}`);
                    console.log(`   this.actualHeight: ${this.actualHeight}`);
                    console.log(`   Aspect ratio: ${(this.actualWidth / this.actualHeight).toFixed(3)}`);
                    console.log(`   Canvas SVG width: ${this.canvas.getAttribute('width')}`);
                    console.log(`   Canvas SVG height: ${this.canvas.getAttribute('height')}`);
                    console.log(`   Canvas viewBox: ${this.canvas.getAttribute('viewBox')}`);
                }
                
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
                
                // Small breathing room for browser event loop (prevent UI freeze)
                if (i % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
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