/**
 * Pattern Index - Imports all patterns to trigger self-registration
 * Each pattern file registers itself with the PatternRegistry on import
 */

// Import all 23 patterns to trigger self-registration
import './concentric-circles.js';
import './diagonal-stripes.js';
import './square-tunnel.js';
import './radial-vortex.js';
import './vasarely-zebra.js';
import './riley-waves.js';
import './cube-illusion.js';
import './eye-pattern.js';
import './wave-displacement.js';
import './circular-displacement.js';
import './moire-interference.js';
import './spiral-distortion.js';
import './perlin-displacement.js';
import './fractal-noise.js';
import './de-jong-attractor.js';
import './cellular-automata.js';
import './l-system-growth.js';
import './shaded-grid.js';
import './anuszkiewicz-squares.js';
import './riley-crest.js';
import './vasarely-vega.js';
import './soto-vibration.js';
import './cruz-diez-strips.js';

export { patternRegistry } from '../core/PatternRegistry.js';
