# Optical Art Generator

A sophisticated web application for generating mesmerizing geometric patterns optimized for laser engraving and digital art creation. Create stunning optical illusions with advanced customization controls, pattern library management, and professional export capabilities.

## 🚀 Recent Updates

### v4.0.0 (Latest - 2025 Edition)

**🎨 Professional UI Redesign:**
- **Modern 2025 Interface**: Complete redesign with glassmorphism, backdrop blur, and optical art aesthetics
- **Photoshop/Illustrator Layout**: Compact sidebar (280-320px), sleek header, professional tool placement
- **Mobile-First Design**: Canvas-first on mobile, responsive breakpoints (768px, 1024px, 1400px)
- **Compact Controls**: 40% more usable space, minimal scrolling, efficient layout
- **Visual Polish**: Gradient accents, smooth animations, custom scrollbars, micro-interactions

**🎛️ Bidirectional Sliders:**
- **Amplitude**: Now -1000 to +1000 (center-start for inverted effects)
- **Rotation**: Now -180° to +180° (bidirectional control)
- **Visual Indicators**: Red (negative) ← Black center → Blue (positive)
- **Creative Freedom**: Explore inverted waves, reversed patterns, mirrored effects
- **Display**: Shows +/- signs (e.g., `+20`, `-500`, `0°`)

**🖱️ Mouse/Trackpad Zoom:**
- Scroll wheel or trackpad gestures to zoom in/out on canvas
- Natural, intuitive control for exploring pattern details
- Works alongside zoom buttons

**✨ Major Pattern Enhancements:**
- **L-System Growth**: 6 fractal types (bush/tree/fern/flower/spiral/fractal) with 2/4/6-fold rotational symmetry, depth-based coloring, leaves/flowers
- **Concentric Circles**: Enhanced as "Hypnotic Rings" with wave modulation, golden ratio spacing, optical art line style
- **Square Tunnel**: Transformed to "3D Vortex Tunnel" with perspective, spiral twist, depth effects
- **Diagonal Stripes**: Enhanced as "Dynamic Op-Art Stripes" with wave distortion, chevron patterns
- **Eye Pattern**: Upgraded to "Psychedelic Eye" with organic distortion, detailed iris, eyelids
- **Wave Displacement**: Now "Multi-Wave Field" with multiple sources, interference, 3D surface effects
- **Circular Displacement**: Enhanced as "Field Distortion" with magnetic fields, black hole lensing
- **Spiral Distortion**: Transformed to "Golden Ratio Spirals" with double arms, 3D ribbons
- **Moiré Interference**: Enhanced as "Multi-Layer Patterns" with 3 modes (lines/grid/radial)

**🖼️ Smart Thumbnails:**
- Saved patterns now display actual artwork thumbnails (200x200px PNG)
- Automatic thumbnail generation on save
- Fallback to generic previews for legacy patterns

**🐛 Bug Fixes:**
- Fixed variation button (now creates noticeable 30-70% seed changes)
- Fixed concentric circles redundant center dot
- Improved tab readability (no more black-on-black text)
- Better color contrast throughout UI

### v3.0.0
**Major Pattern Enhancements:**
- **Radial Vortex Pattern**: New mesmerizing 3D tunnel effect with alternating bands radiating from center
- **Enhanced Cube Illusion**: Complete redesign with isometric projection, Escher-style impossible geometry
- **Universal Color Support**: Added colorToRgb() function to handle hex, rgb(), and hsl() formats
- **16 Total Patterns**: Now includes Shaded Grid and Radial Vortex

## ✨ Features

### 🎨 Creative Features
- **Bidirectional Controls** - Amplitude and rotation sliders support negative values for inverted/mirrored effects
- **Mouse Wheel Zoom** - Scroll to zoom in/out on canvas for detailed exploration
- **Animation Feature** - Enable subtle, evolving animations with global rotation and parameter variation
- **Display Zoom & Pan** - Advanced zoom controls for closer pattern inspection
- **Pattern Layering** - Combine multiple patterns into complex, multi-layer designs
- **Smart Thumbnails** - Saved patterns display actual artwork previews

### 🎨 16 Sophisticated Patterns

#### ⭐ **Advanced/Sophisticated Patterns**
- **Radial Vortex** - 3D tunnel with flower-petal modulation and hypnotic depth
- **Cube Illusion** - Isometric 3D cubes with Escher-style impossible geometry
- **L-System Growth** - 6 fractal types with rotational symmetry and depth coloring
- **Perlin Displacement** - Organic noise fields with smooth displacement
- **Fractal Noise** - Multi-octave fbm for rich textures
- **De Jong Attractor** - Chaotic strange attractor forms

#### 🎯 **Enhanced Optical Art Patterns**
- **Hypnotic Rings** (Concentric Circles) - Wave-modulated circles with golden ratio
- **3D Vortex Tunnel** (Square Tunnel) - Perspective spiral with depth transforms
- **Dynamic Op-Art Stripes** (Diagonal Stripes) - Wave-distorted chevron patterns
- **Psychedelic Eye** - Organic eye with detailed iris and eyelids
- **Multi-Wave Field** (Wave Displacement) - Interference patterns and 3D surfaces
- **Field Distortion** (Circular Displacement) - Magnetic fields and black hole effects
- **Golden Ratio Spirals** (Spiral Distortion) - Double arms with 3D ribbons
- **Multi-Layer Patterns** (Moiré) - Three modes with dynamic rotation
- **Cellular Automata** - Emergent rule-based patterns
- **Shaded Grid** - 3D embossed cells with mathematical lighting

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
- **Artistic Palettes** - Curated schemes (Stanczak, Riley, Albers, Vasarely)
- **Custom Gradient** - Two-color linear gradients
- **Single Color** - Custom color picker
- **Gradient Lines** - Blue to red progression
- **Rainbow Lines** - Golden angle distributed rainbow
- **Hue Shift** - Seed-based color variations

### 💾 Pattern Library Management
- **Save Pattern** - Store configurations with custom names and thumbnails
- **Load Pattern** - Randomly load saved patterns for inspiration
- **Manage Saved** - Visual library with actual artwork previews
- **Local Storage** - Persistent browser storage
- **Pattern Metadata** - Creation date, type, settings, and thumbnail

### 📤 Export Options
- **SVG Export** - Vector format with millimeter units for LightBurn
- **PNG Export** - High-resolution (8x scale) lossless images
- **JPG Export** - Compressed format (95% quality)
- **Smart Filenames** - Auto-naming with pattern type, settings, timestamp

### 🛡️ Enhanced User Experience
- **Professional 2025 UI** - Glassmorphism, smooth animations, modern aesthetics
- **Compact Layout** - 40% more usable space, minimal scrolling
- **Interactive Previews** - Click thumbnails to instantly switch patterns
- **Real-time Updates** - Live preview as you adjust parameters
- **Error Handling** - Comprehensive validation and feedback
- **Responsive Design** - Mobile-first, works on all devices
- **Bidirectional Sliders** - Visual center markers for negative values
- **Mouse/Trackpad Zoom** - Intuitive scroll-to-zoom on canvas

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in any modern web browser
2. Select a pattern type from dropdown or click preview thumbnails
3. Adjust parameters using compact sidebar controls:
   - **Complexity**: Density/detail level
   - **Line Width**: Stroke thickness
   - **Frequency**: Pattern frequency/cycles
   - **Amplitude**: Effect intensity (-1000 to +1000, try negatives!)
   - **Rotation**: Angle (-180° to +180°)
4. Use mouse wheel to zoom in/out on canvas
5. Click **"Generate New"** for completely new pattern
6. Click **"Generate Variation"** for related designs
7. Click **"Layer Pattern"** to overlay multiple patterns
8. Save favorites to library (with thumbnails!)
9. Export as SVG (laser), PNG, or JPG

### Local Development
```bash
# Start a local server
cd "Optical art examples"
python3 -m http.server 8000

# Open browser to
http://localhost:8000
```

## 📖 Usage Guide

### Creative Exploration with Bidirectional Sliders

**Amplitude (-1000 to +1000):**
- **Positive values**: Normal wave direction, outward effects
- **Zero (0)**: Neutral, flat, no displacement
- **Negative values**: Inverted waves, reversed patterns, mirrored effects

**Try these:**
- Wave Displacement with `-300` amplitude → Inverted wave flow
- Radial Vortex with `-500` amplitude → Inward spiraling vortex
- Concentric Circles with `-80` amplitude → Reversed wave modulation

**Rotation (-180° to +180°):**
- Bidirectional control centered at 0°
- Symmetrical exploration of angles

### Mouse/Trackpad Zoom
1. Hover cursor over canvas
2. Scroll up (or swipe up on trackpad) to zoom in
3. Scroll down (or swipe down) to zoom out
4. Use zoom buttons or mouse wheel interchangeably

### Pattern Layering
1. **Create a Base**: Generate a pattern with "Generate New"
2. **Select New Pattern**: Choose different pattern type
3. **Adjust Settings**: Change complexity, colors, parameters
4. **Click "Layer Pattern"**: Overlays new pattern on existing
5. **Repeat**: Add as many layers as desired

### For Laser Engraving (LightBurn)
- **Color Mode**: Black Lines only
- **Export Format**: SVG (includes millimeter dimensions)
- **Recommended Patterns**: Any pattern works, test line density

### For Digital Wallpapers
- **Color Modes**: Artistic, Rainbow, Gradient for visual impact
- **Export Format**: PNG for best quality
- **Recommended**: Try enhanced patterns (Radial Vortex, Cube Illusion)

## 🔬 Technical Details

### Mathematical Principles
- **Displacement Field Theory** - Lines follow calculated force fields
- **Sine Wave Modulation** - Smooth curved distortions
- **Perlin Noise & fBm** - Organic, flowing patterns with multiple octaves
- **Strange Attractors** - Chaotic systems (De Jong attractor)
- **Cellular Automata** - Emergent rule-based patterns (Wolfram rules)
- **L-Systems** - Algorithmic fractal branching with rotation matrices
- **Polar Coordinates** - Radial and spiral effects (r, θ)
- **Isometric Projection** - True 3D with 30° angles and depth scaling
- **Mathematical Shading** - Normal vectors, diffuse lighting, height maps
- **Radial Vortex Math** - Sinusoidal petal modulation with spiral twist
- **Golden Ratio** - Natural spacing (φ = 1.618...) in spirals and circles
- **Interference Patterns** - Multi-wave superposition and standing waves
- **Vector Fields** - Magnetic field simulation, attraction/repulsion

### Pattern Algorithm Details

#### **Radial Vortex** (Advanced)
- Polar coordinate system with petal modulation
- Formula: `r_final = r × (1 + sin(θ × petals) × intensity)`
- Spiral twist: `θ_adjusted = θ + r × 0.01`
- 3-10 dynamic petals based on frequency
- Alternating band colors for depth illusion

#### **Cube Illusion** (Enhanced)
- Isometric projection: `X = (col - row) × 0.866, Y = (col + row) × 0.5`
- Wave modulation for size variation
- Three-face rendering with gradients
- Impossible geometry connections
- Radial depth scaling

#### **L-System Growth** (Enhanced)
- 6 system types: bush, tree, fern, flower, spiral, fractal
- Rotational symmetry: 1-fold, 2-fold, 4-fold, 6-fold
- Depth-based coloring via HSL
- Variable thickness (thins toward tips)
- Leaves/flowers at branch endpoints

#### **Hypnotic Rings** (Enhanced Concentric Circles)
- Wave modulation: `r = base_r × (1 + sin(θ × waves) × intensity)`
- Golden ratio spacing option (φ-based)
- Variable thickness (thinner toward center)
- Optical art style (mostly outlines)
- Progressive rotation with depth

#### **3D Vortex Tunnel** (Enhanced Square Tunnel)
- Exponential perspective scaling
- Spiral twist: `rotation = depth × twist_factor`
- Alternating fill/outline for depth
- Wave-based size modulation
- True vanishing point effect

#### **Golden Ratio Spirals** (Enhanced Spiral Distortion)
- Double counter-rotating arms
- φ-based angle increments
- 3D ribbon bands with varying thickness
- Organic wave modulation
- Depth-based coloring

### Architecture
- **Frontend**: Vanilla JavaScript ES6+ with SVG rendering
- **UI Framework**: Custom responsive design with CSS Grid/Flexbox
- **Layering**: Each pattern rendered into distinct `<g>` groups
- **Storage**: Browser localStorage with JSON serialization
- **Thumbnails**: Canvas API for PNG generation (200x200px)
- **Color System**: Universal RGB converter supporting hex, rgb(), hsl()
- **Responsive**: Mobile-first with breakpoints at 768px, 1024px, 1400px

### Browser Compatibility
- Modern browsers with ES6+ support
- SVG 1.1 rendering
- Canvas API for thumbnails
- localStorage for persistence
- Backdrop-filter for glassmorphism (fallback graceful)

## 🎨 Design Philosophy

**2025 Modern Aesthetic:**
- Glassmorphism with 85% opacity and backdrop blur
- Gradient accents inspired by optical art (purple/pink spectrum)
- Micro-interactions and smooth animations (cubic-bezier)
- Professional tool placement (Photoshop/Illustrator paradigm)
- Minimal, efficient, information-dense layout

**Optical Art DNA:**
- Animated geometric background patterns
- Gradient-based visual hierarchy
- Pattern-inspired UI elements
- Bidirectional sliders with visual center markers
- Color system matching optical art aesthetics

## 📋 Keyboard Shortcuts

- **Mouse Wheel**: Zoom in/out on canvas
- **Tab**: Navigate through controls
- **Enter**: Activate focused button
- **Space**: Toggle checkboxes

## 🎯 Tips & Tricks

1. **Explore Negative Amplitudes**: Try `-500` to `-1000` for completely inverted effects
2. **Layer Wisely**: Start with low-opacity base layers, add detailed top layers
3. **Golden Ratio Magic**: Use frequency > 50 on Concentric Circles for φ spacing
4. **L-System Symmetry**: High complexity (70+) creates stunning mandalas
5. **Mouse Zoom**: Scroll while exploring to find the perfect detail level
6. **Color Combinations**: Artistic palettes + low line width = professional results
7. **Variation Button**: Click 3-5 times to explore related aesthetic families
8. **Save Often**: Thumbnails help you remember which patterns you loved

## 📄 License

This project is open source. See LICENSE file for details.

## 🙏 Acknowledgments

Inspired by classic optical artists:
- Julian Stanczak (vibrant color interactions)
- Bridget Riley (black & white optical illusions)
- Josef Albers (color theory)
- Victor Vasarely (geometric abstraction)

Mathematical foundations from:
- Perlin noise algorithm (Ken Perlin)
- L-Systems (Aristid Lindenmayer)
- Strange attractors (Peter de Jong)
- Cellular automata (Stephen Wolfram)

---

**Built with ❤️ for laser engravers, digital artists, and optical art enthusiasts**

**Version**: 4.0.0 (2025 Edition)  
**Last Updated**: September 2025