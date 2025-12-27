/**
 * PatternRegistry - Central registry for all pattern generators
 * Replaces the switch statements in generatePattern() and generateMiniPattern()
 */

/**
 * @typedef {Object} PatternDefinition
 * @property {string} name - Display name for the pattern
 * @property {string} description - Pattern description for info panel
 * @property {string} [category] - Category for gallery grouping
 * @property {Object} [defaults] - Default slider values { complexity, frequency, amplitude }
 * @property {function(SVGGElement, PatternContext): void} generate - Full-size generator
 * @property {function(SVGElement, MiniPatternContext): void} generateMini - Mini preview generator
 */

class PatternRegistry {
    constructor() {
        /** @type {Map<string, PatternDefinition>} */
        this.patterns = new Map();
    }

    /**
     * Register a pattern with the registry
     * @param {string} id - Unique pattern identifier (e.g., 'concentric-circles')
     * @param {PatternDefinition} definition - Pattern definition object
     * @returns {PatternRegistry} - Returns this for chaining
     */
    register(id, definition) {
        if (this.patterns.has(id)) {
            console.warn(`Pattern "${id}" is already registered. Overwriting.`);
        }

        // Validate definition
        if (typeof definition.generate !== 'function') {
            throw new Error(`Pattern "${id}" must have a generate() function`);
        }
        if (typeof definition.generateMini !== 'function') {
            throw new Error(`Pattern "${id}" must have a generateMini() function`);
        }
        if (!definition.name) {
            throw new Error(`Pattern "${id}" must have a name`);
        }

        this.patterns.set(id, definition);
        return this;
    }

    /**
     * Get a registered pattern definition
     * @param {string} id - Pattern identifier
     * @returns {PatternDefinition|undefined}
     */
    get(id) {
        return this.patterns.get(id);
    }

    /**
     * Check if a pattern is registered
     * @param {string} id - Pattern identifier
     * @returns {boolean}
     */
    has(id) {
        return this.patterns.has(id);
    }

    /**
     * Get all registered pattern IDs
     * @returns {string[]}
     */
    getAllIds() {
        return Array.from(this.patterns.keys());
    }

    /**
     * Get all registered patterns with their definitions
     * @returns {Array<{id: string, definition: PatternDefinition}>}
     */
    getAll() {
        return Array.from(this.patterns.entries()).map(([id, definition]) => ({
            id,
            definition
        }));
    }

    /**
     * Get pattern info/description
     * @param {string} id - Pattern identifier
     * @returns {string|undefined}
     */
    getInfo(id) {
        const pattern = this.get(id);
        return pattern?.description;
    }

    /**
     * Get pattern defaults
     * @param {string} id - Pattern identifier
     * @returns {Object|undefined}
     */
    getDefaults(id) {
        const pattern = this.get(id);
        return pattern?.defaults;
    }

    /**
     * Generate a full-size pattern
     * @param {string} id - Pattern identifier
     * @param {SVGGElement} layerGroup - SVG group to render into
     * @param {PatternContext} ctx - Pattern context with all dependencies
     * @throws {Error} If pattern is not registered
     */
    generatePattern(id, layerGroup, ctx) {
        const pattern = this.get(id);
        if (!pattern) {
            throw new Error(`Unknown pattern type: ${id}`);
        }
        pattern.generate(layerGroup, ctx);
    }

    /**
     * Generate a mini preview pattern
     * @param {string} id - Pattern identifier
     * @param {SVGElement} svg - SVG element to render into
     * @param {MiniPatternContext} ctx - Mini pattern context
     * @throws {Error} If pattern is not registered
     */
    generateMiniPattern(id, svg, ctx) {
        const pattern = this.get(id);
        if (!pattern) {
            throw new Error(`Unknown pattern type: ${id}`);
        }
        pattern.generateMini(svg, ctx);
    }

    /**
     * Get count of registered patterns
     * @returns {number}
     */
    get size() {
        return this.patterns.size;
    }
}

// Singleton instance
export const patternRegistry = new PatternRegistry();
export default PatternRegistry;
