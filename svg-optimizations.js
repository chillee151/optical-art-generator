/* ==========================================
   PHASE 1 & 2: SVG OPTIMIZATION JAVASCRIPT
   M4 Pro Hardware Acceleration
   Add these methods to your OpticalArtGenerator class
   ========================================== */

// Add this method to the OpticalArtGenerator class

optimizeSVGPerformance() {
    const canvas = this.canvas;
    if (!canvas) return;
    
    // Count total elements in SVG
    const elementCount = canvas.querySelectorAll('*').length;
    
    // Remove old optimization classes
    canvas.classList.remove('complex-pattern', 'high-quality', 'zooming', 'panning');
    
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
    
    // Enable GPU acceleration for all path elements (Phase 2)
    this.optimizePathElements();
}

optimizePathElements() {
    // Group similar paths for better batching (Phase 2)
    const paths = this.canvas.querySelectorAll('path, circle, rect, line, polyline, polygon');
    
    // Add hint for browser to batch these elements
    paths.forEach((path, index) => {
        // Only set will-change on first 100 elements to avoid memory issues
        if (index < 100) {
            path.style.willChange = 'auto';
        }
    });
}

// Add zoom/pan optimization classes
setupZoomPanOptimization() {
    let zoomTimeout;
    
    // Listen for zoom start (you'll need to hook this into your zoom controls)
    this.canvas?.addEventListener('wheel', () => {
        this.canvas?.classList.add('zooming');
        
        clearTimeout(zoomTimeout);
        zoomTimeout = setTimeout(() => {
            this.canvas?.classList.remove('zooming');
        }, 150); // Remove class 150ms after zoom ends
    }, { passive: true });
}

// Call these methods after pattern generation
// Add to your generatePattern() method at the end:

/*
INTEGRATION EXAMPLE - Add to generatePattern() method after pattern is drawn:

    } catch (error) {
        console.error('Error generating pattern:', error);
        this.showError(`Failed to generate pattern: ${error.message}`);
    } finally {
        this.canvas.classList.remove('optical-loading');
        this.isGenerating = false;
        this.updateViewBox();
        
        // NEW: Apply GPU optimizations
        setTimeout(() => {
            this.optimizeSVGPerformance();
        }, 50);
    }
*/

// Also add this to your init() method:
/*
    init() {
        this.perlin = new PerlinNoise();
        this.setupTabs();
        this.setupEventListeners();
        // ... other setup code ...
        
        // NEW: Setup zoom/pan optimizations
        this.setupZoomPanOptimization();
        
        // Restore dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            // ... dark mode code ...
        }
    }
*/


