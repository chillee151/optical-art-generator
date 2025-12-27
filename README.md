# Optical Art Generator

A sophisticated web application for generating mesmerizing geometric patterns optimized for laser engraving and digital art creation. Create stunning optical illusions with advanced customization controls, symmetry transformation, color harmony generation, preset management, and professional export capabilities.

## 🚀 Recent Updates

### v5.11.0 (Latest - MODULAR ARCHITECTURE & PATTERN FIXES!)

**🏗️ COMPLETE MODULAR REFACTORING:**
- **ES6 Module Architecture** - All 23 patterns now in separate files under `src/patterns/`
- **Core Module System**:
  - `src/core/PatternRegistry.js` - Dynamic pattern registration and lookup
  - `src/core/PatternContext.js` - Immutable context for pattern generators (replaces DOM reads)
  - `src/core/PerlinNoise.js` - Extracted Perlin noise implementation
  - `src/core/utils.js` - Shared utilities (seededRandom, fbm, color conversion, etc.)
- **Self-Registering Patterns** - Each pattern module auto-registers on import
- **Dependency Injection** - Patterns receive all values via `PatternContext` object
- **Easier Maintenance** - Add new patterns by creating a single file

**🎨 PATTERN-SPECIFIC FIXES:**
- **Spiral Distortion** - Complete redesign as true logarithmic spiral
  - Proper black/white contrast handling (fixes all-black screen bug)
  - All three sliders now have dramatic visible effects:
    - **Complexity**: Number of spiral arms (6-60)
    - **Frequency**: Spiral tightness/rotations (2-12 turns)
    - **Amplitude**: Curve shape and direction (-1000 to 1000)
  - Full canvas coverage (no black edges)
- **Diagonal Stripes** - Added sinusoidal amplitude modulation for pulsing thickness
- **Concentric Circles** - Increased wave modulation (0.2 → 0.4) for stronger breathing effect
- **Moiré Interference** - Fixed to use identical spacing + precise 3.5° angles for proper interference

**🔧 TECHNICAL IMPROVEMENTS:**
- Fixed `getLineColor` binding issue across all patterns (use `ctx.getLineColor()` not destructured)
- Patterns correctly handle dark mode and color modes
- Script loads as ES6 module (`type="module"` in index.html)

### v5.10.0 (PATTERN REFINEMENT & VASARELY GRID!)

**🎨 SHADED-GRID PATTERN REDESIGNED:**
- **Complete Transformation**: From 3D bump-mapping to **Vasarely Warped Grid**
  - **Before**: Grayscale 3D shading with lighting calculations (NOT true optical art)
  - **After**: Checkerboard perspective distortion creating genuine 3D illusions
  - **Technique**: Grid cells warp around Gaussian distortion centers
  - **Perfect for Laser**: High contrast black/white checkerboard pattern
  - **Artist Inspiration**: Victor Vasarely's "Vega" series
  - **Parameters**:
    - Complexity: Grid density (8-100+ cells)
    - Frequency: Number of distortion centers (1-4)
    - Amplitude: Distortion strength (positive=convex, negative=concave)

**✨ PATTERN DEFAULTS ADDED:**
- 8 patterns now have optimized default settings for instant beauty:
  - **Eye Pattern** (121/100/123): Large dramatic pupil
  - **Square Tunnel** (114/40/446/-73/8): 8-fold mandala symmetry
  - **Cube Illusion** (160/35/-892): Dense 5x5 isometric grid
  - **Concentric Circles** (103/70/-208): 20 wavy rings
  - **Diagonal Stripes** (35/74/269/0/8): 8-fold radial burst
  - **Shaded Grid** (101/69/-85): Dual-center Vasarely warp
  - **Wave Displacement** (185/62/-77): Dense interference
  - **Circular Displacement** (154/73/69): Strong vortex swirl

**🔧 USABILITY IMPROVEMENTS:**
- **Eye Pattern Enhancement**: Pupil size range 5-35% (was 2-12%) - much more dramatic
- **Reset All Fix**: Preserves current pattern (was hardcoded to concentric-circles)
- **Updated Thumbnails**: All pattern thumbnails reflect new default settings

**🎯 OPTICAL ART EXPERT CONSULTATION:**
- Consulted AI optical art expert for shaded-grid redesign
- Recommended Vasarely warped grid as quintessential Op Art technique
- Alternative suggestions documented: Riley Wave Grid, Moiré Rings

### v5.9.0 (ICONIC OP ART PATTERNS!)

**🎨 7 NEW ICONIC OP ART PATTERNS:**
- **Bridget Riley Collection**
  - **Riley Waves** - Sinusoidal patterns with rhythm variation (horizontal waves with amplitude modulation)
  - **Riley Crest** - Vertical lines creating traveling wave illusion (phase-shifted lateral shimmer)
- **Victor Vasarely Collection**
  - **Vasarely Zebra** - THE quintessential Op Art: stripes deforming around invisible spheres
  - **Vasarely Vega** - Billowing checkerboard with wave-based size modulation
- **Richard Anuszkiewicz**
  - **Anuszkiewicz Squares** - Complementary color squares creating chromatic vibration & afterimages
- **Jesús Rafael Soto**
  - **Soto Vibration** - Refined moiré: two transparent layers of lines at subtle angles
- **Carlos Cruz-Diez**
  - **Cruz-Diez Chromatic Strips** - Kinetic color mixing through vertical strip interference

**✨ Pattern Coverage Now Complete:**
- ✅ Form illusions (Vasarely Zebra, Vega - seeing 3D where none exists)
- ✅ Color effects (Anuszkiewicz, Cruz-Diez - chromatic phenomena)
- ✅ Motion/shimmer (Riley Waves/Crest, Soto - vibration & flow)
- ✅ Depth (Radial Vortex, Square Tunnel - tunnel effects)
- ✅ 23 total patterns (was 16)

**🔧 Technical Improvements:**
- All patterns fully integrated with Visual Explorer variants
- Proper dark mode support for all new patterns
- Mini preview thumbnails for pattern selector
- Comprehensive pattern info descriptions

### v5.8.0 (FRAME-PERFECT VIDEO EXPORT!)

**🎯 FRAME-PERFECT ANIMATION SYSTEM:**
- **Zero Jitter at Any FPS** - Butter-smooth animation at 24/30/60fps
  - **Discrete frame quantization** - values change in exact frame steps
  - Before: Sub-frame precision caused jitter
  - After: Frame-locked progression, perfectly smooth
  - Works by: `currentFrame = floor(time * totalFrames)` → discrete steps
  - Result: **No interpolation artifacts, crystal clear motion**

**🎚️ DISCRETE SPEED MULTIPLIER:**
- **Predictable Range Expansion** - No more guessing!
  - Dropdown replaces slider: **0.5×, 1×, 2×, 3×, 4×, 5×**
  - Before: Continuous 0.1-10.0 (confusing, unpredictable)
  - After: Discrete multipliers (clear, intentional)
  - **How it works**: `2×` = double the range in same time
  - Example: Complexity 50→100 becomes 50→200 @ 2×
  - **Only affects**: Complexity, Frequency, Amplitude, Glow
  - **Zoom/Rotation stay smooth** - independent controls

**🔢 FRAME-ALIGNED RANGE INPUTS:**
- **Auto-Snap to Frame Boundaries** - Eliminates jitter sources
  - Enter any value → auto-snaps on blur
  - Example @ 24fps, 10s (240 frames):
    - Enter `73` → snaps to `72.92` (aligns with frame 56/240)
    - Enter `47.3` → snaps to `47.08` (aligns with frame 182/240)
  - **Why?** Non-aligned values cause interpolation jitter
  - **Result**: Every value change = exactly 1 frame step
  - Applied to: Complexity, Frequency, Amplitude, Glow
  - **Not applied** to Zoom/Rotation (smooth camera motion)

**📐 ASPECT RATIO VIDEO EXPORT FIX:**
- **Canvas Ratio Now Persists in Video** - 9:16 exports as 9:16! ✅
  - Bug: Toolbar ratio button updated size but didn't regenerate pattern
  - Fix: Added `generatePattern(true)` call on ratio change
  - Result: Video export correctly detects canvas dimensions
  - Verified with debug logging at Frame 0

**🎬 ENHANCED FRAME RENDER TIMING:**
- **Fully Rendered Frames Guaranteed** - No partial captures
  - **4× requestAnimationFrame** (was 2×) - full render pipeline
    - Frame 1: JS updates DOM
    - Frame 2: Browser layout calculation  
    - Frame 3: Browser paint/composite
    - Frame 4: GPU filter application
  - **50ms fixed delay** (was variable) - complex patterns/glow
  - Total wait: ~100ms per frame (was ~35ms)
  - Trade-off: 2× slower capture, **ZERO incomplete frames**
  - Especially important for: Glow effects, high complexity, filters

**⚡ BLACK FRAMES AT START FIXED:**
- **Frame 0 Pre-Initialized** - Perfect first frame!
  - Bug: Capture loop started immediately, pattern still generating
  - Result: First 2-3 frames were black
  - Fix: Generate frame 0 BEFORE capture loop starts
  - Wait 167ms (4 RAF + 100ms) for full render
  - Pattern exists before first capture ✅
  - No more black frames in exported videos!

**📊 PERFORMANCE IMPACT:**
| Metric | Before | After |
|--------|--------|-------|
| Jitter | ❌ Visible | ✅ Zero |
| First frames | ❌ Black (2-3) | ✅ Perfect |
| Frame timing | ~35ms | ~100ms |
| Aspect ratio | ❌ Sometimes 1:1 | ✅ Always correct |
| Predictability | ❌ Confusing | ✅ Frame-based |

**🎯 RESULT:** Professional-quality video export with frame-perfect animation! 🚀

### v5.7.0 (ANIMATION PERFECTION!)

**🎬 TIMELINE PREVIEW RELOCATED:**
- **Now Below Canvas** - Direct visual connection between canvas and scrubber
  - Beautiful gradient slider with purple thumb
  - Time + frame counter in header
  - Percentage markers (0%-100%)
  - Removed from Video tab for cleaner interface
  - Always visible while adjusting patterns

**⚡ SPEED MULTIPLIER SYSTEM:**
- **Expands Animation Range** - Not just faster, but MORE dramatic!
  - `1x`: Complexity 50→200 (Δ150 change)
  - `2x`: Complexity 50→350 (Δ300 change) in same duration!
  - `0.5x`: Complexity 50→125 (Δ75 change) for subtle effects
  - Formula: Range × Speed = Expanded Range
  - Same frames, bigger visual change

**🎯 Smart Property Handling:**
- **Affected by Speed**: Complexity, Frequency, Amplitude, Glow
- **Independent (Smooth)**: Zoom & Rotation maintain own controls
- **Sub-frame precision**: No jitter, smooth interpolation
- **Optimized for visual smoothness**

**🌊 MOTION BLUR OPTION:**
- **FFmpeg Frame Blending** - Silky smooth video output
  - Optional checkbox in Video Export tab
  - Uses `tblend` filter for frame averaging
  - Eliminates jittery animation
  - No performance impact when disabled
  - Professional cinematic smoothness

### v5.6.0 (INTERACTIVE TOOLBAR!)

**🎛️ UNIFIED CONTROL TOOLBAR:**
- **All-in-One Control Panel** - Logo + controls in single sticky toolbar
  - **Integrated logo/title** at top - no separate header bar
  - **Saves ~80px of vertical space** - more room for canvas/controls
  - **Sticky positioning** - follows you as you scroll
  - **Beautiful glass morphism design** with purple/blue gradient accents
  - **5 organized rows** (header + 4 control rows)
  - **Live updates** - all info refreshes in real-time
  - **Responsive design** - scales beautifully on all screens

**🎨 Header Row - Logo & Title:**
- **🎨 Optical Art Generator** with gradient text effect
- Descriptive subtitle below logo
- Always visible (toolbar is sticky)
- Professional, clean appearance

**📐 Row 1 - Canvas Settings:**
- Quick canvas ratio buttons: **1:1**, **16:9**, **9:16**, **4:3**
- Live dimension display: `600×1200mm (2268×4536px)`
- One-click aspect ratio switching
- Perfect sync with canvas format selector

**🎬 Row 2 - Video Settings:**
- **Duration buttons**: 5s, 10s, 15s, 20s, 30s
- **FPS buttons**: 24fps, 30fps, 60fps
- Live frame count: `= 240 frames`
- Auto-calculated export resolution: `Export: 1215×2160`
- Format adapts to canvas aspect ratio
- Two-way sync with dropdown controls

**⚡ Row 3 - Animation Toggles:**
- **Interactive pills** for all parameters
- Click to enable/disable animations instantly
- Active pills show ranges: `Complexity ● 50→200`
- Syncs with animation checkboxes in real-time
- Updates live when you change ranges
- Beautiful rounded pill design with gradients

**🎯 Row 4 - Mode & Actions:**
- **Mode toggle**: Linear ➡️ / Bounce 🔄
- **Quick Export PNG** button (transparent background)
- **Quick Record Video** button
- Instant access to most-used actions
- No need to navigate to Actions tab

### v5.5.0 (ANIMATION REVOLUTION!)

**🎯 VIDEO-SYNCED ANIMATION (THE BIG FIX!):**
- **Animation Cycles ONCE Over Entire Video** - No more repetition!
  - **Problem Solved**: Animation no longer repeats multiple times during video
  - 5-second video = animation goes Start → End over 5 seconds
  - 10-second video = animation goes Start → End over 10 seconds
  - 15-second video = animation goes Start → End over 15 seconds
  - **Predictable & Professional**: One smooth cycle from beginning to end
  - Linear mode: Frame 0 = Start value, Frame 240 = End value
  - Works with ANY video duration you choose

**🎬 ANIMATION PREVIEW & LINEAR PROGRESSION:**
- **Timeline Preview Scrubber** - See your animation BEFORE rendering!
  - Drag slider from 0% to 100% to preview any moment
  - Shows exact time (0.0s - 10.0s)
  - Real-time pattern updates as you scrub
  - No more CPU-intensive surprises!
  - Perfect for planning glow/complexity animations

- **Frame-Accurate Preview** - Think in video frames, not just time!
  - **FPS Selector**: Choose 24fps, 30fps, or 60fps
  - **Frame Counter**: Shows "Frame 120/240" as you scrub
  - Frame-accurate timing: currentFrame / fps
  - Calculate exact per-frame changes
  - Example: 10s @ 24fps = 240 frames
  - Preview snaps to actual frame boundaries

- **Linear Animation Mode (Default)** - Smooth, cinematic progressions!
  - ➡️ No more repetitive pulsing/bouncing
  - Parameters progress smoothly from Start → End
  - Each frame is unique throughout the video
  - Perfect for professional video exports
  - Still have Bounce mode for looping effects

**🎛️ ANIMATION RANGE CONTROLS (GAME CHANGER!):**
- **User-Defined Start/End Ranges** - Total control over every parameter!
  - Check 🎬 to reveal collapsible range controls
  - Set EXACT Start and End values for each parameter
  - Beautiful purple-accented UI with number inputs
  - No more auto-reset - sliders keep their values!
  - Smart defaults initialize based on current value

- **Per-Parameter Control:**
  - **Complexity**: Start/End from 5-300 (e.g., 20 → 200)
  - **Frequency**: Start/End from 1-100 (e.g., 2 → 50)
  - **Amplitude**: Start/End from -1000 to +1000
  - **Rotation**: Start/End (e.g., 0° → 360° for full rotation)
  - **Glow**: Start/End from 0-10 (e.g., 0 → 8 for fade-in glow)
  - **Zoom**: Start/End zoom levels (e.g., 0.5x → 2.0x)

**📐 VIDEO ASPECT RATIO FIX:**
- **Dynamic Video Dimensions** - Video matches canvas aspect ratio!
  - Quality setting controls HEIGHT (1080p, 1440p, 2160p)
  - WIDTH auto-calculated based on canvas ratio
  - Square (1:1) → 2160×2160 at 4K
  - Widescreen (16:9) → 3840×2160 at 4K
  - Portrait (9:16) → 1215×2160 at 4K
  - Any custom ratio → perfectly calculated!

### v5.4.0 (GPU OPTIMIZATIONS & ANIMATED ZOOM!)

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
- **23 Total Patterns**: Now includes 7 iconic Op Art master patterns (v5.9.0), plus Shaded Grid and Radial Vortex

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

### 🎨 23 Sophisticated Patterns

#### 🎨 **Iconic Op Art Masters** (NEW!)
- **Bridget Riley Waves** - Sinusoidal wave patterns with rhythm variation creating vibration and shimmer
- **Riley Crest** - Vertical lines with phase-shifted horizontal displacement creating lateral motion illusion
- **Vasarely Zebra** - Parallel stripes warping around invisible spheres creating 3D form illusion
- **Vasarely Vega** - Checkerboard with wave-based size modulation creating billowing surface
- **Anuszkiewicz Squares** - Concentric squares in complementary colors creating intense chromatic vibration
- **Soto Vibration** - Two overlapping layers of fine lines creating shimmering moiré interference
- **Cruz-Diez Chromatic Strips** - Vertical color triads creating kinetic color mixing and additive interference

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
- **Vasarely Warped Grid** (Shaded Grid) - Checkerboard perspective distortion creating 3D illusions

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

### Animation Control with Range Presets (v5.5.0)

**Create Perfect Video Animations:**

**Step 1: Set Up Your Pattern**
1. Go to **ADJUST** tab
2. Set your starting values (Complexity: 100, Glow: 2, etc.)
3. Choose your canvas format (16:9 for widescreen, 1:1 for Instagram, etc.)

**Step 2: Define Animation Ranges**
1. Check 🎬 next to parameters you want to animate
2. **Range controls appear below** each checked parameter
3. Set your **Start** and **End** values:
   - **Complexity**: 20 → 200 (simple to complex)
   - **Glow**: 0 → 8 (fade-in glow effect)
   - **Rotation**: 0° → 360° (full rotation)
   - **Zoom**: 0.5x → 2.0x (zoom in effect)

**Step 3: Preview Your Animation**
1. Go to **ACTIONS** tab → **🎬 Video Export**
2. Choose **Frame Rate** (24fps, 30fps, or 60fps)
   - 24fps = cinematic (default)
   - 30fps = smooth web video
   - 60fps = ultra smooth
3. **Drag the Preview Timeline slider** (0% to 100%)
4. Watch **Frame Counter** (e.g., "Frame 120/240")
5. Watch the pattern change in real-time
6. Adjust Start/End values until it looks perfect
7. Set **Animation Mode** to **Linear** (smooth progression)

**Step 4: Calculate Your Animation** (Frame Math)
```
Total Frames = Duration × FPS
10s @ 24fps = 240 frames
10s @ 30fps = 300 frames
10s @ 60fps = 600 frames

Per-Frame Change = (End - Start) / Total Frames
Example: Complexity 50→200 over 240 frames
(200 - 50) / 240 = 0.625 per frame

Check halfway: Frame 120 should show ≈ 125
Scrub to frame 120 to verify!
```

**Step 5: Export Your Video**
1. Choose **Duration** (5s, 10s, or 15s)
2. Choose **Quality** (1080p, 1440p, or 4K)
   - Width auto-adjusts to your canvas aspect ratio!
3. Click **🎥 Record Video**
4. Wait for encoding (shows progress)
5. Download your perfect H.264 MP4!

**Pro Tips:**
- **🎯 Animation cycles ONCE**: Set Start/End values and they'll progress over the ENTIRE video duration
  - 5s video: Glow 0→8 over all 5 seconds (no repeating)
  - 10s video: Complexity 50→200 over all 10 seconds
  - 15s video: Rotation 0°→360° over all 15 seconds
- **Think in frames**: "I want glow to fade in over 120 frames" (more precise than "5 seconds")
- **Linear Mode** = Smooth start-to-finish progression (RECOMMENDED)
- **Bounce Mode** = Oscillating/pulsing over entire duration (for loops)
- **Frame counter** = See exact frame number as you scrub
- **Preview scrubber** = Frame-accurate preview snaps to real frames
- **Dark Mode** videos = Black background in export
- **Multiple animations** = Combine Complexity + Glow + Rotation for complex effects
- **Verify halfway**: Check frame count at 50% matches your math

**Example Workflows:**

**Fade-In Glow:**
```
Glow: Start 0 → End 10
Duration: 10s @ 24fps = 240 frames
Mode: Linear
Per-frame change: (10 - 0) / 240 = 0.042 glow per frame
Frame 60: Should show glow ≈ 2.5
Frame 120: Should show glow ≈ 5.0
Frame 180: Should show glow ≈ 7.5
Result: Smooth glow fade-in over 240 frames
```

**Complexity Reveal:**
```
Complexity: Start 10 → End 250
Rotation: Start 0° → End 360°
Duration: 15s
Mode: Linear
Result: Pattern evolves and rotates simultaneously
```

**Zoom Tunnel:**
```
Zoom: Start 0.3x → End 3.0x
Rotation: Start 0° → End 720° (2 full rotations)
Glow: Start 0 → End 8
Duration: 10s
Mode: Linear
Result: Spiraling zoom tunnel with glow
```

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
- **Gaussian Distortion Fields** - Vasarely-style perspective warping with exponential falloff
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

#### **Vasarely Warped Grid** (Shaded Grid - v5.10.0)
- **Perspective distortion on regular checkerboard grid**
- Gaussian influence fields: `influence = exp(-(d² / (2r²)))`
- Radial displacement: `displacement = influence × strength × cellSize × 2`
- Each grid cell corner warps based on distance from distortion centers
- Frequency controls number of distortion centers (1-4)
- Amplitude controls distortion strength (positive=bulge, negative=indent)
- Complexity controls grid density (8-100+ cells)
- **Pure geometry** - no shading, only form distortion
- Creates genuine 3D depth illusion without any lighting calculations
- Classic Op Art technique from Vasarely's "Vega" series

#### **L-System Growth** (Enhanced)
- 6 system types: bush, tree, fern, flower, spiral, fractal
- Rotational symmetry: 1-fold, 2-fold, 4-fold, 6-fold
- Depth-based coloring via HSL
- Variable thickness (thins toward tips)
- Leaves/flowers at branch endpoints

### Architecture
- **Frontend**: Vanilla JavaScript ES6 Modules with SVG rendering
- **Modular Pattern System** (v5.11.0):
  - `src/core/` - Core infrastructure (PatternRegistry, PatternContext, PerlinNoise, utils)
  - `src/patterns/` - 23 self-registering pattern modules
  - Each pattern exports: `name`, `description`, `category`, `defaults`, `generate()`, `generateMini()`
  - `PatternContext` provides immutable context with slider values, colors, dimensions
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

**Version**: 5.11.0 (2025 Edition - Modular Architecture)
**Last Updated**: December 2025