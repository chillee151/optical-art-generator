# Optical Art Generator

A sophisticated web application for generating mesmerizing geometric patterns optimized for laser engraving and digital art creation. Create stunning optical illusions with advanced customization controls, pattern library management, and professional export capabilities.

## 🚀 Recent Updates

### v2.10.0 (Latest)
**New Features & Enhancements:**
- **Display Zoom & Pan**: Added functionality to zoom in/out and pan the pattern display, allowing for closer inspection of details. This is a display-only feature and does not affect SVG exports.

### v2.9.0
**Bug Fixes & Enhancements:**
- **Animation Smoothness**: Implemented a `slowAnimationTime` variable to drastically reduce animation speeds across all patterns, ensuring very subtle and fluid visual changes, preventing jitteriness.

### v2.8.0
**Bug Fixes & Enhancements:**
- **Animation Smoothness**: Further reduced animation speeds for all animated patterns to ensure very subtle and fluid visual changes, preventing jitteriness.

### v2.7.0
**Bug Fixes & Enhancements:**
- **Animation Smoothness**: Reduced animation speeds for all animated patterns to prevent jitteriness and improve visual fluidity.

### v2.6.0
**New Features & Enhancements:**
- **Animation Feature**: Added an 'Animate Pattern' checkbox to enable subtle, evolving animations for patterns, including global rotation, noise evolution, and parameter variation for chaotic systems.

### v2.5.0
**Bug Fixes & Enhancements:**
- **Save Patterns Fix**: Resolved an issue where saving patterns would fail due to exceeding local storage limits by no longer storing redundant SVG data.

### v2.4.0
**New Patterns & Enhancements:**
- **De Jong Attractor**: Added a new pattern based on strange attractors, generating chaotic yet beautiful single-line forms.
- **Cellular Automata**: Implemented a pattern based on 1D elementary cellular automata (Wolfram rules), creating emergent, rule-based designs.
- **L-System Growth**: Introduced a pattern that generates fractal-like branching structures using L-systems.

### v2.3.0
**New Features & Enhancements:**
- **Custom Gradients**: Added a new color mode with two pickers to define a custom linear gradient.
- **Fractal Noise Pattern**: Implemented a new, more advanced noise pattern using Fractal Brownian Motion for richer textures.
- **Artistic Color Palettes**: Added a new color mode with curated, artist-inspired palettes for more sophisticated designs.
- **Perlin Displacement Pattern**: Implemented a new pattern generator that uses Perlin noise to create organic, flowing textures.
- **Pattern Layering**: Added the ability to layer multiple patterns on top of each other to create complex compositions. Exported SVGs retain these layers as `<g>` groups.

### v2.1.0
**UI Refactoring:**
- Redesigned the controls panel into a tabbed interface to improve usability and eliminate scrolling.
- Grouped controls into logical tabs: "Pattern", "Adjust", "Canvas & Color", and "Actions".

## ✨ Features

### 🎨 Creative Features
- **Animation Feature** - Enable subtle, evolving animations for patterns, including global rotation, noise evolution, and parameter variation for chaotic systems.
- **Display Zoom & Pan** - Zoom in/out and pan the pattern display for closer inspection. This is a display-only feature and does not affect SVG exports.
- **Pattern Layering** - Combine multiple patterns into a single, complex design. Each layer is managed independently in the exported SVG.


### 🎯 Format Options
- **Square (1:1)** - Traditional format
- **Widescreen (16:9)** - Desktop wallpapers
- **Portrait (9:16)** - Mobile wallpapers
- **Traditional (3:4)** - Classic photo ratio
- **Landscape (4:3)** - Landscape format
- **Photo ratios (2:3, 3:2)** - Standard photo formats
- **Custom** - Any size from 50-1000mm base

### 🌈 Color Modes
- **Black Lines** - LightBurn compatible (laser engraving)
- **Custom Gradient** - Define a two-color linear gradient.
- **Artistic Palettes** - Curated color schemes inspired by famous artists.
- **Single Color** - Custom color picker
- **Gradient Lines** - Blue to red color progression
- **Rainbow Lines** - Golden angle distributed rainbow
- **Hue Shift** - Seed-based color variations

### 💾 Pattern Library Management
- **Save Pattern** - Store current configuration with custom names
- **Load Pattern** - Randomly load saved patterns for inspiration
- **Manage Saved** - Visual library with thumbnails and organization
- **Local Storage** - Persistent pattern storage in browser
- **Pattern Metadata** - Includes creation date, type, and settings

### 📤 Export Options
- **SVG Export** - Vector format with proper millimeter units for LightBurn. Layered designs are exported with `<g>` groups.
- **PNG Export** - High-resolution (8x scale) lossless images for wallpapers
- **JPG Export** - Compressed format (95% quality) for sharing
- **Smart Filenames** - Automatic naming with pattern type, settings, and timestamp

### 🛡️ Enhanced User Experience
- **Error Handling** - Comprehensive validation and user feedback
- **Interactive Previews** - Click thumbnails to instantly switch patterns
- **Real-time Updates** - Live preview as you adjust parameters
- **Success Notifications** - Clear feedback for all operations
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in any modern web browser
2. Select a pattern type from dropdown or click preview thumbnails
3. Adjust parameters using the control panel (now including generation buttons in the 'Adjust' tab).
4. Choose format preset or custom dimensions and a color mode.
5. Click **"Generate New"** to create a base design.
6. To layer patterns, select a new pattern type/color and click **"Layer Pattern"**.
7. Save your favorite patterns to the library and export in your preferred format.

### Local Development
```bash
# Start a local server (optional)
cd "Optical art examples"
python3 -m http.server 8000

# Open browser to
http://localhost:8000
```

## 📖 Usage Guide

### How to Layer Patterns
Layering allows you to combine multiple patterns into a single, intricate design.
1. **Create a Base**: Generate a pattern you like using the "Generate New" button.
2. **Select a New Pattern**: Choose a different pattern from the dropdown menu.
3. **Adjust Settings**: Change the complexity, colors, or other parameters for the new layer.
4. **Click "Layer Pattern"**: This will draw the new pattern on top of the existing one.
5. **Repeat**: You can add as many layers as you like to build up complexity.

### For Laser Engraving (LightBurn)
- **Color Mode**: Black Lines only
- **Export Format**: SVG (includes proper millimeter dimensions)

### For Digital Wallpapers
- **Color Modes**: Use any of the color modes for visual impact.
- **Export Format**: PNG for best quality

## 🔬 Technical Details

### Mathematical Principles
- **Displacement Field Theory** - Lines follow calculated force fields
- **Sine Wave Modulation** - Creates smooth curved distortions
- **Perlin Noise & Fractal Brownian Motion (fBm)** - For generating organic, flowing patterns.
- **Strange Attractors** - Chaotic systems generating intricate, non-repeating forms.
- **Cellular Automata** - Rule-based systems creating emergent patterns.
- **L-Systems** - Algorithmic generation of fractal-like branching structures.
- **Polar Coordinate Systems** - For radial and spiral effects

### Architecture
- **Frontend**: Vanilla JavaScript ES6+ with SVG rendering
- **Layering**: Each pattern is rendered into a distinct `<g>` group in the main SVG.
- **Storage**: Browser localStorage for pattern persistence

## 📋 Changelog

### v2.1.0
- **UI Refactoring:** Redesigned the controls panel into a tabbed interface.

### v2.0.1
- **Bug Fixes** - Resolved multiple errors in pattern generation and color support.

### v2.0.0
- **Major Features:** Interactive previews, advanced controls, pattern library, and improved export.

### v1.0.0
- **Initial Release**
