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
            this.isGenerating = false;
        this.patternInfo = {
            'concentric-circles': 'Creates hypnotic circular patterns with varying spacing to produce optical illusions',
            'diagonal-stripes': 'Generates diagonal line patterns that create depth and movement effects',
            'cube-illusion': 'Produces 3D cube illusions using vertical lines and geometric positioning',
            'eye-pattern': 'Creates eye-like shapes with concentric curves for mesmerizing effects',
            'square-tunnel': 'Generates tunnel-like square spirals that appear to recede into distance',
            'wave-displacement': 'Horizontal stripes displaced by sine waves creating bulging illusions',
            'circular-displacement': 'Straight lines warped by circular displacement fields',
            'moire-interference': 'Overlapping patterns creating moiré interference effects',
            'spiral-distortion': 'Radial patterns with spiral displacement creating depth'
        };

            this.init();
        } catch (error) {
            console.error('Failed to initialize OpticalArtGenerator:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    init() {
        this.setupEventListeners();
        this.updateSliderValues();
        this.updateCanvasSize();
        this.updatePatternInfo();
        this.generatePatternPreviews();
        this.generatePattern();
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
            { id: 'eye-pattern', name: 'Eye' },
            { id: 'moire-interference', name: 'Moiré' },
            { id: 'spiral-distortion', name: 'Spiral' },
            { id: 'concentric-circles', name: 'Circles' },
            { id: 'diagonal-stripes', name: 'Stripes' },
            { id: 'cube-illusion', name: 'Cube' },
            { id: 'square-tunnel', name: 'Tunnel' }
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
        }

        return svg;
    }

    generateMiniConcentricCircles(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;
        const maxRadius = 22;

        for (let i = 0; i < complexity; i++) {
            const radius = (maxRadius / complexity) * (i + 1);
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', '#000');
            circle.setAttribute('stroke-width', lineWidth);
            svg.appendChild(circle);
        }
    }

    generateMiniDiagonalStripes(svg, seed, complexity, lineWidth) {
        const spacing = 56 / complexity;
        for (let i = -28; i < 84; i += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', i);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', i + 56);
            line.setAttribute('y2', 56);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth);
            line.setAttribute('transform', 'rotate(45 28 28)');
            svg.appendChild(line);
        }
    }

    generateMiniSquareTunnel(svg, seed, complexity, lineWidth) {
        const centerX = 28;
        const centerY = 28;

        for (let i = 0; i < complexity; i++) {
            const scale = 1 - (i / complexity);
            const squareSize = 44 * scale;
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', centerX - squareSize / 2);
            rect.setAttribute('y', centerY - squareSize / 2);
            rect.setAttribute('width', squareSize);
            rect.setAttribute('height', squareSize);
            rect.setAttribute('fill', 'none');
            rect.setAttribute('stroke', '#000');
            rect.setAttribute('stroke-width', lineWidth);
            svg.appendChild(rect);
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
        // Vertical background lines
        const spacing = 56 / (complexity * 2);
        for (let x = 0; x < 56; x += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', 56);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth * 0.5);
            svg.appendChild(line);
        }

        // Single cube in center
        const cubeSize = 16;
        const x = 20;
        const y = 20;
        const offset = cubeSize * 0.3;

        // Front face
        const frontFace = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        frontFace.setAttribute('x', x);
        frontFace.setAttribute('y', y);
        frontFace.setAttribute('width', cubeSize);
        frontFace.setAttribute('height', cubeSize);
        frontFace.setAttribute('fill', 'none');
        frontFace.setAttribute('stroke', '#000');
        frontFace.setAttribute('stroke-width', lineWidth);
        svg.appendChild(frontFace);

        // Back face
        const backFace = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        backFace.setAttribute('x', x + offset);
        backFace.setAttribute('y', y - offset);
        backFace.setAttribute('width', cubeSize);
        backFace.setAttribute('height', cubeSize);
        backFace.setAttribute('fill', 'none');
        backFace.setAttribute('stroke', '#000');
        backFace.setAttribute('stroke-width', lineWidth);
        svg.appendChild(backFace);

        // Connecting lines
        const connections = [
            [x, y, x + offset, y - offset],
            [x + cubeSize, y, x + cubeSize + offset, y - offset],
            [x, y + cubeSize, x + offset, y + cubeSize - offset],
            [x + cubeSize, y + cubeSize, x + cubeSize + offset, y + cubeSize - offset]
        ];

        connections.forEach(([x1, y1, x2, y2]) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth);
            svg.appendChild(line);
        });
    }

    setupEventListeners() {
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.currentSeed = Math.random();
            this.generatePattern();
        });

        document.getElementById('variation-btn').addEventListener('click', () => {
            this.currentSeed += 0.1;
            this.generatePattern();
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
            this.generatePattern();
        });

        document.getElementById('complexity').addEventListener('input', (e) => {
            document.getElementById('complexity-value').textContent = e.target.value;
            this.generatePattern();
        });

        document.getElementById('line-width').addEventListener('input', (e) => {
            document.getElementById('line-width-value').textContent = e.target.value;
            this.generatePattern();
        });

        document.getElementById('frequency').addEventListener('input', (e) => {
            document.getElementById('frequency-value').textContent = e.target.value;
            this.generatePattern();
        });

        document.getElementById('amplitude').addEventListener('input', (e) => {
            document.getElementById('amplitude-value').textContent = e.target.value;
            this.generatePattern();
        });

        document.getElementById('rotation').addEventListener('input', (e) => {
            document.getElementById('rotation-value').textContent = e.target.value + '°';
            this.generatePattern();
        });

        document.getElementById('format-preset').addEventListener('change', () => {
            this.updateCanvasSize();
            this.generatePattern();
        });

        document.getElementById('size').addEventListener('input', () => {
            this.updateCanvasSize();
            this.generatePattern();
        });

        document.getElementById('color-mode').addEventListener('change', () => {
            this.toggleColorControls();
            this.generatePattern();
        });

        document.getElementById('line-color').addEventListener('change', () => {
            this.generatePattern();
        });

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

        if (colorMode === 'single') {
            singleColorGroup.style.display = 'block';
        } else {
            singleColorGroup.style.display = 'none';
        }
    }

    getLineColor(index = 0, total = 1) {
        const colorMode = document.getElementById('color-mode').value;

        switch(colorMode) {
            case 'black':
                return '#000';
            case 'single':
                return document.getElementById('line-color').value;
            case 'gradient':
                const ratio = total > 1 ? index / (total - 1) : 0;
                const hue = ratio * 270; // Blue to red
                return `hsl(${hue}, 70%, 50%)`;
            case 'rainbow':
                const rainbowHue = (index * 137.5) % 360; // Golden angle for even distribution
                return `hsl(${rainbowHue}, 80%, 50%)`;
            case 'hue-shift':
                const baseHue = (this.currentSeed * 360) % 360;
                const shiftedHue = (baseHue + index * 10) % 360;
                return `hsl(${shiftedHue}, 75%, 55%)`;
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
    }

    generatePattern() {
        if (this.isGenerating) {
            return;
        }

        try {
            this.isGenerating = true;
            this.canvas.classList.add('optical-loading');

            setTimeout(() => {
                try {
                    this.clearCanvas();
                    const patternType = document.getElementById('pattern-type').value;

                    if (!patternType) {
                        throw new Error('No pattern type selected');
                    }

                    switch(patternType) {
                        case 'wave-displacement':
                            this.generateWaveDisplacement();
                            break;
                        case 'circular-displacement':
                            this.generateCircularDisplacement();
                            break;
                        case 'eye-pattern':
                            this.generateAdvancedEyePattern();
                            break;
                        case 'moire-interference':
                            this.generateMoireInterference();
                            break;
                        case 'spiral-distortion':
                            this.generateSpiralDistortion();
                            break;
                        case 'concentric-circles':
                            this.generateConcentricCircles();
                            break;
                        case 'diagonal-stripes':
                            this.generateDiagonalStripes();
                            break;
                        case 'cube-illusion':
                            this.generateCubeIllusion();
                            break;
                        case 'square-tunnel':
                            this.generateSquareTunnel();
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
                }
            }, 100);
        } catch (error) {
            console.error('Error in generatePattern:', error);
            this.showError('Failed to start pattern generation');
            this.isGenerating = false;
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

    generateConcentricCircles() {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;
        const maxRadius = Math.min(this.actualWidth, this.actualHeight) * 0.45;

        for (let i = 0; i < complexity; i++) {
            const radius = (maxRadius / complexity) * (i + 1);
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

            const offsetX = (this.seededRandom(this.currentSeed + i * 0.1) - 0.5) * (amplitude / 2);
            const offsetY = (this.seededRandom(this.currentSeed + i * 0.2) - 0.5) * (amplitude / 2);

            circle.setAttribute('cx', centerX + offsetX);
            circle.setAttribute('cy', centerY + offsetY);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', this.getLineColor(i, complexity));
            circle.setAttribute('stroke-width', lineWidth);

            if (rotation !== 0) {
                circle.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
            }

            this.canvas.appendChild(circle);
        }
    }

    generateDiagonalStripes() {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const maxDimension = Math.max(this.actualWidth, this.actualHeight);
        const spacing = maxDimension / complexity;

        for (let i = -maxDimension; i < maxDimension * 2; i += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

            const offset = (this.seededRandom(this.currentSeed + i * 0.01) - 0.5) * 10;
            const angle = 45 + (this.seededRandom(this.currentSeed + i * 0.02) - 0.5) * 20;

            line.setAttribute('x1', i + offset);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', i + maxDimension + offset);
            line.setAttribute('y2', maxDimension);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth);
            line.setAttribute('transform', `rotate(${angle} ${this.actualWidth/2} ${this.actualHeight/2})`);

            this.canvas.appendChild(line);
        }
    }

    generateCubeIllusion() {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);

        // Create vertical background lines
        const spacing = this.actualWidth / (complexity * 2);
        for (let x = 0; x < this.actualWidth; x += spacing) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', this.actualHeight);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth * 0.5);
            this.canvas.appendChild(line);
        }

        // Create cube shapes
        const cubeSize = Math.min(this.actualWidth, this.actualHeight) / 6;
        const rows = 3;
        const cols = 3;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (this.actualWidth / (cols + 1)) * (col + 1) - cubeSize / 2;
                const y = (this.actualHeight / (rows + 1)) * (row + 1) - cubeSize / 2;

                const randomOffset = (this.seededRandom(this.currentSeed + row + col) - 0.5) * cubeSize * 0.3;

                this.drawCube(x + randomOffset, y, cubeSize, lineWidth);
            }
        }
    }

    drawCube(x, y, size, lineWidth) {
        const offset = size * 0.3;

        // Front face
        const frontFace = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        frontFace.setAttribute('x', x);
        frontFace.setAttribute('y', y);
        frontFace.setAttribute('width', size);
        frontFace.setAttribute('height', size);
        frontFace.setAttribute('fill', 'none');
        frontFace.setAttribute('stroke', '#000');
        frontFace.setAttribute('stroke-width', lineWidth);
        this.canvas.appendChild(frontFace);

        // Back face
        const backFace = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        backFace.setAttribute('x', x + offset);
        backFace.setAttribute('y', y - offset);
        backFace.setAttribute('width', size);
        backFace.setAttribute('height', size);
        backFace.setAttribute('fill', 'none');
        backFace.setAttribute('stroke', '#000');
        backFace.setAttribute('stroke-width', lineWidth);
        this.canvas.appendChild(backFace);

        // Connecting lines
        const connections = [
            [x, y, x + offset, y - offset],
            [x + size, y, x + size + offset, y - offset],
            [x, y + size, x + offset, y + size - offset],
            [x + size, y + size, x + size + offset, y + size - offset]
        ];

        connections.forEach(([x1, y1, x2, y2]) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', lineWidth);
            this.canvas.appendChild(line);
        });
    }

    generateEyePattern() {
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

            this.canvas.appendChild(ellipse);
        }

        // Add pupil
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', Math.min(this.actualWidth, this.actualHeight) * 0.05);
        pupil.setAttribute('fill', '#000');
        this.canvas.appendChild(pupil);
    }

    generateSquareTunnel() {
        const complexity = parseInt(document.getElementById('complexity').value);
        const lineWidth = parseInt(document.getElementById('line-width').value);
        const centerX = this.actualWidth / 2;
        const centerY = this.actualHeight / 2;

        for (let i = 0; i < complexity; i++) {
            const scale = 1 - (i / complexity);
            const maxDimension = Math.max(this.actualWidth, this.actualHeight);
            const squareSize = maxDimension * scale * 0.8;

            const rotation = (this.seededRandom(this.currentSeed + i * 0.1) - 0.5) * 10;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', centerX - squareSize / 2);
            rect.setAttribute('y', centerY - squareSize / 2);
            rect.setAttribute('width', squareSize);
            rect.setAttribute('height', squareSize);
            rect.setAttribute('fill', 'none');
            rect.setAttribute('stroke', '#000');
            rect.setAttribute('stroke-width', lineWidth);
            rect.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);

            this.canvas.appendChild(rect);
        }
    }

    generateWaveDisplacement() {
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

            this.canvas.appendChild(path);
            lineIndex++;
        }
    }

    generateCircularDisplacement() {
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
            this.canvas.appendChild(path);
            lineIndex++;
        }
    }

    generateAdvancedEyePattern() {
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
            this.canvas.appendChild(path);
            lineIndex++;
        }

        // Add pupil
        const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pupil.setAttribute('cx', centerX);
        pupil.setAttribute('cy', centerY);
        pupil.setAttribute('r', Math.min(this.actualWidth, this.actualHeight) * 0.05);
        pupil.setAttribute('fill', '#000');
        this.canvas.appendChild(pupil);
    }

    generateMoireInterference() {
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
            this.canvas.appendChild(line);
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
            this.canvas.appendChild(line);
        }
    }

    generateSpiralDistortion() {
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
            this.canvas.appendChild(path);
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
            timestamp: new Date().toISOString(),
            svgData: new XMLSerializer().serializeToString(this.canvas)
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