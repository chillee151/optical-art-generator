# Optical Art Generator

A sophisticated web application for generating mesmerizing geometric patterns optimized for laser engraving and digital art creation. Create stunning optical illusions with advanced customization controls, symmetry transformation, color harmony generation, preset management, and professional export capabilities.

## 🚀 Recent Updates

### v5.4.0 (Latest - GPU OPTIMIZATIONS & ANIMATED ZOOM!)

**⚡ GPU HARDWARE ACCELERATION (M4 Pro Optimized!):**
- **Blazing Fast Rendering** - Hardware acceleration for silky smooth performance
  - GPU compositing layers with `translate3d` transforms
  - Adaptive quality: Complex patterns prioritize speed, simple patterns prioritize quality
  - Backface visibility optimization for smoother animations
  - Smart rendering modes based on element count (1000/5000 thresholds)
  - Console logging shows optimization mode (speed/balanced/quality)

**✨ OPTIMIZED GLOW EFFECTS:**
- **30-50% Faster** with enhanced visual quality!
  - Dynamic filter sizing based on intensity (smaller = faster)
  - Auto quality adjustment for complex patterns (>1000 elements)
  - sRGB color space for GPU acceleration
  - 1.2x brightness boost for more vibrant, dramatic glow
  - GPU hints (`will-change: filter`) for smooth performance
  - Keeps the beautiful vibe, runs way faster!

**🔍 ANIMATED ZOOM:**
- **Zoom Animation Controls** - Hypnotic zoom effects in the animation toolbox!
  - **Zoom Amount Slider (0-10)**: Control intensity/range of zoom
  - **Zoom Direction Dropdown**: 
    - **Zoom In**: Continuous zoom in (approaching infinity!)
    - **Zoom Out**: Continuous zoom out (receding effect)
    - **Pulse**: Breathe in/out (oscillating zoom)
  - **🎬 Animation Toggle**: Enable/disable with one click
  - **Syncs with Animation Speed**: Works with global speed control
  - Perfect for creating tunnel effects, pulsing mandalas, spiral vortexes
  - Combine with rotation for spiraling zoom effects!

### v5.3.0 (DARK MODE & ICON EXPORT!)

**🌙 DARK MODE:**
- **Dark Mode Toggle** - View patterns on black background for dramatic effect!
  - Located in Canvas & Color tab
  - Instantly switches canvas background to pure black
  - Perfect for neon/glow effects and vibrant colors
  - Preference saved in localStorage
  - Makes rainbow and gradient patterns pop!

**🖼️ ICON EXPORT:**
- **Export Icon PNG (1024x1024)** - Perfect for creating macOS icons!
  - One-click export at standard icon resolution
  - Transparent background (no white fill)
  - Ready for Preview.app → Export as ICNS
  - Ideal for app icons, folder icons, custom macOS icons
  - Success message guides you through ICNS conversion

### v5.2.0 (COLOR & RANDOMIZATION REFINEMENTS!)

**🎨 IMPROVED COLOR GENERATION:**
- **Generate Colors Button** - Now generates truly random gradient colors every time!
  - Always switches to "Custom Gradient" mode for consistency
  - Completely random hue selection (0-360°)
  - Smart contrast: 50% complementary (180° apart), 50% random offset (90-270°)
  - High saturation (75-100%) for vibrant optical art
  - Shows hex color values in success message
  - No more repetitive color combinations!

**🎲 SMARTER RANDOMIZE ALL:**
- **Black & White Option** - 30% chance to generate black patterns (perfect for laser engraving!)
- **Reduced Layering** - Only 15% chance to add layers (prevents overwhelming patterns)
- **Better Balance** - 70% colorful gradients, 30% classic black lines
- **Clear Feedback** - Shows "(Black & White)" when black mode is selected
- **Subtle Layers** - When layering occurs, adds depth without hiding the main pattern

### v5.1.0 (VIDEO EXPORT!)

**🎬 VIDEO RECORDING & ANIMATION IMPROVEMENTS:**
- **Record Video Button**: Export animations as MP4 or WebM video files!
  - Configurable duration: 3-30 seconds
  - 30 FPS, high quality (5 Mbps bitrate)
  - **H.264/MP4**: Universal compatibility (works on iPhone/iPad!)
  - Smart codec detection: Tries H.264 first, falls back to VP9/VP8
  - Real-time recording progress display
  - Only enabled when animation is active
  - One-click download when complete
- **Enhanced Animation**: Smoother frame rendering for video capture
- **Professional Export**: Perfect for social media, presentations, portfolios
- **iPhone Compatible**: H.264 codec works on all Apple devices
- **Browser-Native**: No external dependencies, works offline

### v5.0.0 (MAJOR UPDATE)

**🎨 SYMMETRY & GLOW (GAME-CHANGER!):**
- **Symmetry Dropdown**: None/2-Fold/4-Fold/6-Fold/8-Fold/Radial(12)
  - Transforms ANY pattern into mandalas, kaleidoscopes, and flowers
  - Rotates pattern copies around center point
  - Example: Spiral + 6-Fold = Flower mandala! 🌸
- **Glow Effect Slider (0-10)**: SVG Gaussian blur for psychedelic halos
  - Creates neon sign aesthetics, dreamlike depth
  - Perfect for optical illusions with soft edges
- **Auto Line Width**: Intelligently scales with complexity (thick at low, thin at high)
- **Removed Manual Line Width**: Replaced with smarter auto-calculation

**🎨 COLOR GENERATION (Updated in v5.2.0):**
- **Generate Colors Button**: Random gradient colors in one click!
  - Truly random color generation - never repeats the same combination
  - Smart contrast algorithms for visually striking gradients
  - Automatically switches to Custom Gradient mode
  - Perfect for exploring new color palettes

**🎲 RANDOMIZE ALL (Enhanced in v5.2.0):**
- One-click total randomization: pattern + settings + colors/black
- 30% chance for black patterns (laser engraving ready)
- 70% chance for vibrant gradient colors
- Only 15% chance to add subtle layers (prevents clutter)
- Perfect for instant inspiration and happy accidents

**⚡ PRESET SNAPSHOTS & A/B MORPH:**
- **9 Quick Presets**: Save/load pattern configurations instantly
- **Keyboard Shortcuts**: Ctrl+1-9 to save, 1-9 to load (mobile: tap 💾 button)
- **Visual Preset Slots**: Filled slots show pattern type
- **A/B Morphing**: Interpolate between two presets with slider
- **Mutate Settings**: ±20% variation for exploration
- **Dedicated Morph Tab**: Professional preset management interface

**🔧 MAJOR IMPROVEMENTS:**
- **Generate New**: Now randomizes ALL settings (complexity 10-250, full ranges)
- **Generate Variation**: Subtle ±30 complexity, ±10 frequency variations
- **Complexity Range**: Optimized from 5-300 (was 5-2000, preventing black-outs)
- **Mobile-Friendly Presets**: Tap visual save buttons (💾) on each slot
- **Better Random Generation**: Uses absolute ranges, not relative scaling

### v4.0.0

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

### v3.0.0
**Major Pattern Enhancements:**
- **Radial Vortex Pattern**: New mesmerizing 3D tunnel effect with alternating bands radiating from center
- **Enhanced Cube Illusion**: Complete redesign with isometric projection, Escher-style impossible geometry
- **Universal Color Support**: Added colorToRgb() function to handle hex, rgb(), and hsl() formats
- **16 Total Patterns**: Now includes Shaded Grid and Radial Vortex

## ✨ Features

### 🎨 Creative Features
- **⚡ GPU Acceleration** - Hardware-optimized rendering for M4 Pro and modern GPUs (v5.4.0)
- **🌙 Dark Mode** - View patterns on black background for dramatic effect (v5.3.0)
- **🌟 Symmetry Transformation** - Convert any pattern into mandalas/kaleidoscopes (2/4/6/8/12-fold)
- **✨ Optimized Glow Effects** - 30-50% faster psychedelic halos with enhanced brightness (v5.4.0)
- **🔍 Animated Zoom** - Zoom in/out/pulse animations with intensity control (v5.4.0)
- **🎨 Random Gradient Generator** - Truly random gradient colors every click (v5.2.0)
- **🎲 Randomize All** - Smart randomization with 30% black, 15% layering (v5.2.0)
- **⚡ Preset Snapshots** - 9 quick-save slots with keyboard shortcuts
- **🔄 A/B Morphing** - Smooth interpolation between two saved presets
- **🎬 Video Recording** - Export animations as MP4/WebM video (3-30 sec, 30 FPS, iPhone compatible!)
- **🎥 Animate Pattern** - Live animation with configurable parameters
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

### 🌈 Color Features

**Random Gradient Generator (v5.2.0):**
- Click "🎨 Generate Colors" for instant random gradients
- Truly random hue selection (0-360°) - never repeats
- Smart contrast: Complementary or random offset (90-270°)
- High saturation (75-100%) for vibrant optical art
- Automatically uses Custom Gradient mode
- Displays hex color values in success message

**Color Modes:**
- **Black Lines** - LightBurn compatible (laser engraving)
- **Artistic Palettes** - Curated schemes (Stanczak, Riley, Albers, Vasarely)
- **Custom Gradient** - Two-color linear gradients
- **Single Color** - Custom color picker
- **Gradient Lines** - Blue to red progression
- **Rainbow Lines** - Golden angle distributed rainbow
- **Hue Shift** - Seed-based color variations

### 💾 Pattern Library & Presets

**Quick Presets (NEW!):**
- 9 instant-save slots (keyboard: Ctrl+1-9 to save, 1-9 to load)
- Visual filled/empty indicators
- Mobile-friendly tap buttons (💾)
- Saves: pattern, all settings, colors, seed

**A/B Morphing (NEW!):**
- Select two presets (A & B)
- Morph slider (0-100%)
- Smooth parameter interpolation
- Discover in-between variations

**Pattern Library:**
- **Save Pattern** - Store configurations with custom names and thumbnails
- **Load Pattern** - Randomly load saved patterns for inspiration
- **Manage Saved** - Visual library with actual artwork previews
- **Local Storage** - Persistent browser storage
- **Pattern Metadata** - Creation date, type, settings, and thumbnail

### 📤 Export Options
- **SVG Export** - Vector format with millimeter units for LightBurn
- **PNG Export** - High-resolution (8x scale) lossless images
- **JPG Export** - Compressed format (95% quality)
- **Icon PNG Export** - 1024x1024 transparent PNG for macOS icons (v5.3.0)
- **MP4/WebM Video** - Animated patterns (H.264 codec, 3-30 sec, 30 FPS, iPhone compatible!)
- **Smart Filenames** - Auto-naming with pattern type, settings, timestamp

### 🛡️ Enhanced User Experience
- **Professional 2025 UI** - Glassmorphism, smooth animations, modern aesthetics
- **Compact Layout** - 40% more usable space, minimal scrolling
- **5-Tab Interface** - Pattern, Adjust, Canvas/Color, Morph, Actions
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
   - **Complexity (5-300)**: Density/detail level
   - **Symmetry**: None/2/4/6/8/12-fold transformation
   - **Frequency (1-100)**: Pattern frequency/cycles
   - **Amplitude (-1000 to +1000)**: Effect intensity (try negatives!)
   - **Rotation (-180° to +180°)**: Angle
   - **Glow (0-10)**: Blur intensity for psychedelic effects
4. Click **🎨 Generate Colors** for harmonious color palettes
5. Click **🎲 Randomize All** for total inspiration
6. Use mouse wheel to zoom in/out on canvas
7. Save to presets (Ctrl+1-9) for quick recall
8. Export as SVG (laser), PNG, or JPG

### Local Development
```bash
# Start a local server
cd "Optical art examples"
python3 -m http.server 8000

# Open browser to
http://localhost:8000
```

## 📖 Usage Guide

### Symmetry Transformations

**Create Instant Mandalas:**
1. Choose any pattern (e.g., Spiral)
2. Set Symmetry to **6-Fold**
3. Adjust Glow to **5**
4. Result: Flower mandala! 🌸

**Symmetry Options:**
- **None**: Original pattern (1 copy)
- **2-Fold Mirror**: Mirrored across center
- **4-Fold**: Rotated 4 times (90° apart) = Mandala
- **6-Fold**: Rotated 6 times (60° apart) = Flower
- **8-Fold**: Rotated 8 times (45° apart) = Star
- **Radial (12-Fold)**: Full kaleidoscope effect

### Random Gradient Generator (v5.2.0)

**Explore Infinite Color Combinations:**
1. Set up your pattern
2. Click **🎨 Generate Colors** repeatedly
3. Each click generates completely different gradient colors
4. Success message shows the hex color codes
5. Save favorite combos to presets (Ctrl+1-9)
6. Never see the same color pair twice!

**How It Works:**
- First color: Random hue (0-360°)
- Second color: Either complementary (180° opposite) or random contrast (90-270° offset)
- Both colors: High saturation (75-100%) for vibrant optical art
- Automatically switches to Custom Gradient mode

### Randomize All - Smart Exploration (v5.2.0)

**Discover New Patterns:**
- Click **🎲 Randomize All** for instant inspiration
- **70% of the time**: Vibrant gradient colors
- **30% of the time**: Classic black patterns (laser engraving ready)
- **15% of the time**: Adds a subtle second layer for depth
- Creates truly unique combinations every click
- Perfect for breaking creative blocks!

### Preset Snapshots

**Quick Workflow:**
1. Create a pattern you love
2. Press **Ctrl+1** (or tap 💾 on slot 1)
3. Tweak settings dramatically
4. Press **1** to instantly restore

**A/B Morphing:**
1. Save "Calm" preset → Ctrl+1
2. Save "Chaos" preset → Ctrl+2
3. Go to Morph tab
4. Select A=1, B=2
5. Move morph slider (0-100%)
6. Discover in-between patterns!

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
- **Color Modes**: Use Generate Colors, Artistic, Rainbow, Gradient
- **Dark Mode**: Enable for dramatic black background
- **Symmetry**: Try 4-Fold or 6-Fold for mandalas
- **Glow**: Add 3-7 for dreamlike quality
- **Export Format**: PNG for best quality
- **Recommended**: Radial Vortex + 6-Fold Symmetry + Glow 5

### For macOS Icons (v5.3.0)
1. Create your pattern with desired settings
2. Click **Export Icon PNG (1024x1024)**
3. Open the exported PNG in Preview.app
4. Go to File → Export
5. Change Format to **Apple Icon Image**
6. Save as .icns file
7. Use for custom app/folder icons!

### Animated Zoom Effects (v5.4.0)

**Create Hypnotic Zoom Animations:**
1. Go to **ADJUST tab**
2. Find **"Zoom Animation"** slider (set to 5 for moderate effect)
3. Choose **Zoom Direction**:
   - **Zoom In**: Continuous approach (tunnel effect)
   - **Zoom Out**: Continuous recede
   - **Pulse**: Breathing in/out (most hypnotic!)
4. Check the **🎬** animation box
5. Adjust **Animation Speed** slider to control tempo

**Powerful Combinations:**
- **Spiral Zoom**: Spiral pattern + Zoom In + Rotation Animation = Vortex!
- **Pulsing Mandala**: 6-Fold Symmetry + Pulse Zoom + Glow 7 = Breathing flower
- **Tunnel Vision**: Radial Vortex + Zoom In + Dark Mode = Infinite tunnel
- **Kaleidoscope Breath**: 12-Fold + Pulse Zoom + Rainbow Colors = Mesmerizing!
- **All Combined**: Rotation + Glow + Zoom + Complexity Animation = Sensory overload!

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
- **Symmetry Groups** - N-fold rotational symmetry transformations
- **Color Theory** - HSL-based harmony generation (complementary, triadic, etc.)
- **SVG Filters** - Gaussian blur for glow effects

### Pattern Algorithm Details

#### **Symmetry System** (NEW!)
- Clones pattern N times based on symmetry value
- Rotates each copy by (360/N)° around center
- Applied AFTER pattern generation, BEFORE glow
- Examples:
  - 4-Fold: 4 copies at 0°, 90°, 180°, 270°
  - 6-Fold: 6 copies at 0°, 60°, 120°, 180°, 240°, 300°

#### **Glow System** (NEW!)
- SVG `<filter>` with `<feGaussianBlur>`
- `stdDeviation = glowIntensity` (0-10)
- Applied to entire layer group
- Merged with original using `<feMerge>`

#### **Color Harmony Generator** (NEW!)
- Base hue: Random 0-360°
- Harmony angles applied to base
- HSL to Hex conversion for web colors
- High saturation (70-100%) for optical art
- Good contrast lightness (45-60%)

#### **Auto Line Width** (NEW!)
```javascript
if (complexity < 50) return 3-2px      // Thick for low detail
else if (complexity < 150) return 2-1px // Medium
else return 1-0.5px                     // Thin for high detail
```

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

### Architecture
- **Frontend**: Vanilla JavaScript ES6+ with SVG rendering
- **GPU Optimization**: Hardware-accelerated rendering with CSS transforms and compositing (v5.4.0)
  - `translate3d(0,0,0)` for GPU layer promotion
  - Adaptive `shape-rendering` based on complexity
  - Dynamic `will-change` hints for filtered elements
  - Backface visibility optimization
- **UI Framework**: Custom responsive design with CSS Grid/Flexbox
- **Layering**: Each pattern rendered into distinct `<g>` groups
- **Storage**: Browser localStorage with JSON serialization
- **Thumbnails**: Canvas API for PNG generation (200x200px)
- **Color System**: Universal RGB converter + HSL harmony generator
- **Responsive**: Mobile-first with breakpoints at 768px, 1024px, 1400px
- **Presets**: localStorage with separate 'opticalArtPresets' key
- **Performance**: Complexity-based quality modes, optimized glow filters, efficient SVG filters

### Browser Compatibility
- Modern browsers with ES6+ support
- SVG 1.1 rendering + SVG filters
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

**Presets:**
- **Ctrl+1 to Ctrl+9** (Cmd on Mac): Save to preset slot
- **1 to 9**: Load from preset slot

**Navigation:**
- **Mouse Wheel**: Zoom in/out on canvas
- **Tab**: Navigate through controls
- **Enter**: Activate focused button
- **Space**: Toggle checkboxes

## 🎯 Tips & Tricks

### Dark Mode Magic (v5.3.0)
1. **Neon Aesthetics**: Dark Mode + Rainbow Lines + Glow 8
2. **Dramatic Contrast**: Dark Mode + High saturation colors
3. **Starfield Effects**: Dark Mode + Low complexity points + Glow
4. **Cyberpunk Vibes**: Dark Mode + Custom Gradient (cyan/magenta)

### Symmetry Magic
1. **Instant Mandalas**: Any pattern + 4-Fold or 6-Fold symmetry
2. **Psychedelic Flowers**: Eye Pattern + 6-Fold + Glow 7
3. **Kaleidoscopes**: Wave Field + Radial (12-Fold) + High Complexity
4. **Sacred Geometry**: L-System + 6-Fold + Golden Ratio spacing

### Color Generation Mastery (v5.2.0)
1. **Click Generate Colors 10+ times** - every click is completely unique!
2. **Complementary gradients** (50% of the time) create dramatic contrast
3. **Random contrast gradients** (50% of the time) offer surprising combinations
4. **High saturation** (75-100%) ensures vibrant optical art results
5. **Save favorites to presets** when you find stunning color combos

### Workflow Optimization (Updated v5.2.0)
1. **Use Randomize All** for instant creative starts (click 5-10 times)
   - Expect ~3 black patterns and ~7 colorful ones per 10 clicks
   - Watch for occasional layered patterns (~1-2 per 10 clicks)
2. **Save to Presets** when you find something good (Ctrl+1-9)
3. **A/B Morph** between presets to find in-between sweet spots
4. **Mutate Settings** to explore variations of current aesthetic
5. **Mix black and color** - use Randomize All to explore both styles

### Advanced Techniques
1. **Explore Negative Amplitudes**: Try `-500` to `-1000` for completely inverted effects
2. **Layer Wisely**: Start with low-opacity base layers, add detailed top layers
3. **Golden Ratio Magic**: Use frequency > 50 on Concentric Circles for φ spacing
4. **L-System Symmetry**: High complexity (70+) + 6-Fold creates stunning mandalas
5. **Mouse Zoom**: Scroll while exploring to find the perfect detail level
6. **Glow + Symmetry Combo**: Radial symmetry + Glow 8 = Hypnotic halos
7. **Variation Button**: Click 3-5 times to explore related aesthetic families
8. **Save Often**: Thumbnails help you remember which patterns you loved
9. **Animated Zoom Magic** (v5.4.0): Combine zoom with other animations for layered effects
   - Zoom In + Rotation = Spiraling vortex approaching
   - Pulse + Glow Animation = Breathing luminous mandala
   - Zoom Out + Complexity Animation = Fractal emergence
10. **Performance Tips** (v5.4.0): Check browser console for optimization mode
    - "Quality mode" (<1000 elements): Beautiful, high-fidelity rendering
    - "Balanced mode" (1000-5000): Good balance
    - "Speed mode" (>5000): Fast rendering for complex patterns
    - Glow is now 30-50% faster with brighter output!

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
- Color harmony theory (Johannes Itten, Josef Albers)

---

**Built with ❤️ for laser engravers, digital artists, and optical art enthusiasts**

**Version**: 5.4.0 (2025 Edition - GPU Optimized & Animated Zoom)  
**Last Updated**: October 2025