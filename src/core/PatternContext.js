/**
 * PatternContext - Immutable context object passed to pattern generators
 * Replaces direct DOM reads with explicit dependency injection
 */

import { seededRandom, hexToRgb, getAutoLineWidth, fbm, interpolateColor } from './utils.js';

/**
 * @typedef {Object} PatternContextConfig
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 * @property {number} complexity - Complexity slider value (5-300)
 * @property {number} frequency - Frequency slider value (0-100)
 * @property {number} amplitude - Amplitude slider value (-1000 to 1000)
 * @property {number} rotation - Rotation slider value (0-360)
 * @property {number} [currentRotation] - Current rotation including animation offset
 * @property {number} [slowAnimationTime] - Animation time offset
 * @property {boolean} [isAnimating] - Whether animation is active
 * @property {number} seed - Random seed for deterministic patterns
 * @property {string} colorMode - Color mode ('black', 'single', 'custom-gradient', etc.)
 * @property {Object} colors - Color configuration
 * @property {boolean} [isDarkMode] - Dark mode state
 * @property {Object} perlin - PerlinNoise instance
 * @property {Object} [artisticPalettes] - Artistic palette definitions
 */

export class PatternContext {
    /**
     * @param {PatternContextConfig} config - Configuration object
     */
    constructor(config) {
        // Canvas dimensions
        this.width = config.width;
        this.height = config.height;
        this.centerX = config.width / 2;
        this.centerY = config.height / 2;

        // Slider values
        this.complexity = config.complexity;
        this.frequency = config.frequency;
        this.amplitude = config.amplitude;
        this.rotation = config.rotation;
        this.currentRotation = config.currentRotation ?? config.rotation;

        // Animation timing
        this.slowAnimationTime = config.slowAnimationTime || 0;
        this.isAnimating = config.isAnimating || false;

        // Seed for deterministic randomness
        this.seed = config.seed;

        // Color configuration
        this.colorMode = config.colorMode;
        this.colors = config.colors || {};
        this.isDarkMode = config.isDarkMode || false;
        this.artisticPalettes = config.artisticPalettes || {};

        // Perlin noise instance
        this.perlin = config.perlin;

        // Computed values
        this.lineWidth = getAutoLineWidth(this.complexity);
        this.maxRadius = Math.min(this.width, this.height) * 0.48;
        this.maxDimension = Math.sqrt(this.width ** 2 + this.height ** 2);

        // Freeze to prevent mutation
        Object.freeze(this);
    }

    /**
     * Get line color based on color mode and index
     * @param {number} index - Current element index
     * @param {number} total - Total number of elements
     * @returns {string} Color string
     */
    getLineColor(index = 0, total = 1) {
        switch (this.colorMode) {
            case 'black':
                return this.isDarkMode ? '#fff' : '#000';

            case 'single':
                return this.colors.single || '#000';

            case 'custom-gradient': {
                const colorStart = hexToRgb(this.colors.start || '#000000');
                const colorEnd = hexToRgb(this.colors.end || '#FFFFFF');
                const ratio = total > 1 ? index / (total - 1) : 0;

                const r = Math.round(colorStart[0] + ratio * (colorEnd[0] - colorStart[0]));
                const g = Math.round(colorStart[1] + ratio * (colorEnd[1] - colorStart[1]));
                const b = Math.round(colorStart[2] + ratio * (colorEnd[2] - colorStart[2]));

                return `rgb(${r}, ${g}, ${b})`;
            }

            case 'gradient': {
                const gradRatio = total > 1 ? index / (total - 1) : 0;
                const hue = gradRatio * 270; // Blue to red
                return `hsl(${hue}, 70%, 50%)`;
            }

            case 'rainbow': {
                const rainbowHue = (index * 137.5) % 360; // Golden angle
                return `hsl(${rainbowHue}, 80%, 50%)`;
            }

            case 'hue-shift': {
                const baseHue = (this.seed * 360) % 360;
                const shiftedHue = (baseHue + index * 10) % 360;
                return `hsl(${shiftedHue}, 75%, 55%)`;
            }

            case 'artistic': {
                const paletteNames = Object.keys(this.artisticPalettes);
                if (paletteNames.length === 0) return '#000';
                const paletteIndex = Math.floor(seededRandom(this.seed) * paletteNames.length);
                const selectedPalette = this.artisticPalettes[paletteNames[paletteIndex]];
                return selectedPalette[index % selectedPalette.length];
            }

            default:
                return '#000';
        }
    }

    /**
     * Utility: seeded random
     * @param {number} seed - Seed value
     * @returns {number}
     */
    seededRandom(seed) {
        return seededRandom(seed);
    }

    /**
     * Utility: fractional Brownian motion
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} octaves
     * @param {number} persistence
     * @returns {number}
     */
    fbm(x, y, z, octaves, persistence) {
        return fbm(this.perlin, x, y, z, octaves, persistence);
    }

    /**
     * Create context from current DOM state
     * @param {Object} app - Main app instance with canvas state
     * @param {number} [slowAnimationTime=0] - Animation time offset
     * @returns {PatternContext}
     */
    static fromDOM(app, slowAnimationTime = 0) {
        const complexity = parseInt(document.getElementById('complexity').value);
        const frequency = parseInt(document.getElementById('frequency').value);
        const amplitude = parseInt(document.getElementById('amplitude').value);
        const rotation = parseInt(document.getElementById('rotation').value);
        const colorMode = document.getElementById('color-mode').value;

        let currentRotation = rotation;
        if (app.isAnimating) {
            currentRotation = (rotation + slowAnimationTime * 0.5) % 360;
        }

        return new PatternContext({
            width: app.actualWidth,
            height: app.actualHeight,
            complexity,
            frequency,
            amplitude,
            rotation,
            currentRotation,
            slowAnimationTime,
            isAnimating: app.isAnimating,
            seed: app.currentSeed,
            colorMode,
            colors: {
                start: document.getElementById('gradient-color-1')?.value || '#000000',
                end: document.getElementById('gradient-color-2')?.value || '#FFFFFF',
                single: document.getElementById('line-color')?.value || '#000000'
            },
            isDarkMode: localStorage.getItem('darkMode') === 'true',
            perlin: app.perlin,
            artisticPalettes: app.artisticPalettes
        });
    }
}

/**
 * MiniPatternContext - Simplified context for thumbnail previews
 * Uses fixed values for consistent mini preview appearance
 */
export class MiniPatternContext {
    /**
     * @param {Object} [config] - Optional configuration overrides
     */
    constructor(config = {}) {
        this.width = 56;
        this.height = 56;
        this.centerX = 28;
        this.centerY = 28;
        this.seed = config.seed ?? 0.5;
        this.complexity = config.complexity ?? 8;
        this.lineWidth = config.lineWidth ?? 1;
        this.frequency = config.frequency ?? 50;
        this.amplitude = config.amplitude ?? 100;
        this.maxRadius = 26;
        this.perlin = config.perlin;

        Object.freeze(this);
    }

    /**
     * Get line color for mini patterns (always black)
     * @returns {string}
     */
    getLineColor() {
        return '#000';
    }

    /**
     * Seeded random for mini patterns
     * @param {number} seed
     * @returns {number}
     */
    seededRandom(seed) {
        return seededRandom(seed);
    }
}

export default PatternContext;
