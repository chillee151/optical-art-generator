/**
 * Utility functions for the Optical Art Generator
 * Extracted from main script for modularity
 */

/**
 * Seeded random number generator
 * @param {number} seed - Seed value
 * @returns {number} Pseudo-random number between 0 and 1
 */
export function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

/**
 * Convert hex color to RGB array
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @returns {number[]} RGB array [r, g, b]
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

/**
 * Convert any color format to RGB array
 * Supports: hex, rgb(), hsl()
 * @param {string} color - Color string
 * @returns {number[]} RGB array [r, g, b]
 */
export function colorToRgb(color) {
    // Handle hex colors
    if (color.startsWith('#')) {
        return hexToRgb(color);
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

/**
 * Fractional Brownian Motion using Perlin noise
 * @param {PerlinNoise} perlin - PerlinNoise instance
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate (often used for animation/seed)
 * @param {number} octaves - Number of noise octaves
 * @param {number} persistence - Amplitude decay per octave
 * @returns {number} Noise value
 */
export function fbm(perlin, x, y, z, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
        total += perlin.noise(x * frequency, y * frequency, z) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }
    return total / maxValue;
}

/**
 * Interpolate between two hex colors
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} ratio - Interpolation ratio (0-1)
 * @returns {string} Interpolated color as rgb() string
 */
export function interpolateColor(color1, color2, ratio) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const r = Math.round(rgb1[0] + ratio * (rgb2[0] - rgb1[0]));
    const g = Math.round(rgb1[1] + ratio * (rgb2[1] - rgb1[1]));
    const b = Math.round(rgb1[2] + ratio * (rgb2[2] - rgb1[2]));

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Calculate auto line width based on complexity
 * @param {number} complexity - Complexity value (5-300)
 * @returns {number} Line width in pixels
 */
export function getAutoLineWidth(complexity) {
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

/**
 * Create SVG namespace element
 * @param {string} tagName - SVG element tag name
 * @returns {SVGElement}
 */
export function createSvgElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
