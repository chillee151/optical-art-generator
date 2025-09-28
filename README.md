# Optical Art Generator

A sophisticated web application for generating mesmerizing geometric patterns optimized for laser engraving and digital art creation. Create stunning optical illusions with advanced customization controls, pattern library management, and professional export capabilities.

## ✨ Features

### 🎨 Pattern Types (with Interactive Previews)
- **Wave Displacement** - Horizontal stripes with sine wave distortions creating bulging effects
- **Circular Displacement** - Straight lines warped by circular force fields
- **Advanced Eye Pattern** - Horizontal lines curved around elliptical eye shapes
- **Moiré Interference** - Overlapping patterns creating interference effects
- **Spiral Distortion** - Radial lines twisted into hypnotic spirals
- **Concentric Circles** - Hypnotic circular patterns with varying spacing
- **Diagonal Stripes** - Angled lines with randomized variations
- **Cube Illusion** - 3D cube effects with background line patterns
- **Square Tunnel** - Nested squares creating depth illusion

### 🎛️ Advanced Controls
- **Complexity** - Pattern density and detail level (5-500)
- **Pattern Frequency** - Wave frequency and oscillation rate (1-20)
- **Pattern Amplitude** - Displacement intensity and effect strength (5-100)
- **Pattern Rotation** - Rotate entire patterns around center point (0-360°)
- **Line Width** - Stroke thickness for laser engraving compatibility (1-10)

### 🎯 Format Options
- **Square (1:1)** - Traditional format
- **Widescreen (16:9)** - Desktop wallpapers
- **Portrait (9:16)** - Mobile wallpapers
- **Traditional (3:4)** - Classic photo ratio
- **Landscape (4:3)** - Landscape format
- **Photo ratios (2:3, 3:2)** - Standard photo formats
- **Custom** - Any size from 50-500mm base

### 🌈 Color Modes
- **Black Lines** - LightBurn compatible (laser engraving)
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
- **SVG Export** - Vector format with proper millimeter units for LightBurn
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
3. Adjust parameters using the control panel:
   - **Complexity** (5-500) for detail level
   - **Frequency** (1-20) for wave patterns
   - **Amplitude** (5-100) for displacement intensity
   - **Rotation** (0-360°) for pattern orientation
4. Choose format preset or custom dimensions
5. Select color mode and line width
6. Click "Generate New" or "Generate Variation"
7. Save your favorite patterns to the library
8. Export in your preferred format

### Local Development
```bash
# Start a local server (optional)
cd "Optical art examples"
python3 -m http.server 8000

# Open browser to
http://localhost:8000
```

## 📖 Usage Guide

### Pattern Creation Workflow
1. **Choose Pattern Type**: Use dropdown or click preview thumbnails
2. **Adjust Core Parameters**:
   - **Complexity**: Start with 50-100, increase for more detail
   - **Frequency**: 2-8 for subtle effects, 10-20 for intense patterns
   - **Amplitude**: 10-30 for gentle curves, 50+ for dramatic effects
   - **Rotation**: 0° for standard, 45° for diagonal, 90° for perpendicular
3. **Set Dimensions**: Choose preset ratios or custom size
4. **Select Colors**: Black for laser, colored modes for digital art
5. **Generate & Iterate**: Use "New" for completely different, "Variation" for subtle changes

### Pattern Library Management
- **Save Frequently**: Store interesting configurations as you create them
- **Use Descriptive Names**: Include pattern type and key settings
- **Organize by Purpose**: Separate laser patterns from wallpaper patterns
- **Load for Inspiration**: Use random loading to discover new combinations

### For Laser Engraving (LightBurn)
- **Color Mode**: Black Lines only
- **Export Format**: SVG (includes proper millimeter dimensions)
- **Recommended Settings**:
  - Complexity: 50-150 (higher may be too dense for cutting)
  - Frequency: 2-6 (avoid too high for clean cuts)
  - Amplitude: 10-40 (excessive amplitude may create overlapping lines)
  - Line Width: 1-3 (matches typical laser beam width)

### For Digital Wallpapers
- **Color Modes**: Rainbow, Gradient, or Hue Shift for visual impact
- **Export Format**: PNG for best quality
- **Desktop (16:9)**: Base size 250-300mm, complexity 150-300
- **Mobile (9:16)**: Base size 200-250mm, complexity 100-200
- **Tablet**: Use 4:3 or 3:4 ratios depending on orientation

### Performance Optimization
- **Start Small**: Begin with complexity 50-100 and increase gradually
- **Monitor Generation Time**: Higher complexity (300+) may take several seconds
- **Color Impact**: Colored patterns require more processing than black lines
- **Browser Performance**: Close other tabs for complex pattern generation

## 🔬 Technical Details

### Mathematical Principles
The generator uses advanced mathematical techniques from optical illusion research:
- **Displacement Field Theory** - Lines follow calculated force fields
- **Sine Wave Modulation** - Creates smooth curved distortions with frequency control
- **Exponential Field Decay** - Natural intensity gradients with amplitude scaling
- **Polar Coordinate Systems** - For radial and spiral effects with rotation transforms
- **Vector Field Calculations** - Proper directional displacement with parametric control
- **Moiré Pattern Mathematics** - Wave interference principles with frequency modulation

### Architecture
- **Frontend**: Vanilla JavaScript ES6+ with SVG rendering
- **Pattern Engine**: Mathematical algorithms with real-time parameter control
- **Storage**: Browser localStorage for pattern persistence
- **Export Pipeline**: SVG and Canvas-based high-resolution rendering
- **Error Handling**: Comprehensive validation and user feedback systems

### File Structure
```
Optical art examples/
├── index.html          # Main application interface
├── styles.css          # Styling, layout, and modal systems
├── script.js           # Core algorithms and functionality
└── README.md           # This documentation
```

### Browser Compatibility
- **Chrome/Chromium**: 60+ (recommended for best performance)
- **Firefox**: 55+ (excellent SVG support)
- **Safari**: 12+ (good performance on macOS/iOS)
- **Edge**: 79+ (Chromium-based versions)
- **Mobile**: Modern mobile browsers supported

### Export Features

#### SVG Export (Laser Engraving)
- Proper XML declaration and namespaces
- Millimeter units for accurate scaling in LightBurn
- Optimized vector paths for clean laser cutting
- Descriptive metadata comments with dimensions
- No rasterization - pure vector graphics

#### Image Export (Digital Art)
- 8x scale factor for high resolution output
- Canvas-based rendering for pixel-perfect quality
- White background for clean wallpapers
- Intelligent filename generation with metadata
- PNG (lossless) and JPG (optimized) options

## 🎯 Example Configurations

### Desktop Wallpaper (2560x1440)
```
Pattern: Wave Displacement
Format: 16:9
Base Size: 250mm
Complexity: 200
Frequency: 6
Amplitude: 30
Rotation: 0°
Color: Rainbow Lines
Export: PNG
```

### Mobile Wallpaper (1080x1920)
```
Pattern: Circular Displacement
Format: 9:16
Base Size: 200mm
Complexity: 150
Frequency: 4
Amplitude: 25
Rotation: 45°
Color: Gradient Lines
Export: PNG
```

### Laser Engraving Project
```
Pattern: Concentric Circles
Format: 1:1
Base Size: 100mm
Complexity: 75
Frequency: 3
Amplitude: 15
Rotation: 0°
Color: Black Lines
Line Width: 2
Export: SVG
```

### Artistic Print (A4 Size)
```
Pattern: Spiral Distortion
Format: 3:4
Base Size: 210mm (A4 width)
Complexity: 250
Frequency: 8
Amplitude: 40
Rotation: 15°
Color: Hue Shift
Export: PNG
```

## 🚀 Recent Updates

### Version 2.0.1 - Current Release
- ✅ **Bug Fixes** - Resolved "lineIndex is not defined" errors in pattern generation
- ✅ **Stable Color Support** - All patterns now properly support multi-color modes
- ✅ **Enhanced Reliability** - Comprehensive error handling and validation

### Version 2.0 Features
- ✅ **Interactive Pattern Previews** - Click thumbnails to instantly switch patterns
- ✅ **Advanced Parameter Controls** - Frequency, amplitude, and rotation controls
- ✅ **Pattern Library System** - Save, load, and manage pattern configurations
- ✅ **Enhanced Error Handling** - Comprehensive validation and user feedback
- ✅ **Improved Export Pipeline** - Better file naming and metadata
- ✅ **Professional UI/UX** - Modal interfaces and success notifications

## 🤝 Contributing

This project uses vanilla JavaScript with SVG manipulation for maximum compatibility and performance. The mathematical algorithms are implemented from scratch based on optical illusion research.

### Areas for Enhancement
- Additional pattern types and mathematical algorithms
- Animation and motion effects
- Cloud storage and pattern sharing
- Mobile app development
- Performance optimizations for complex patterns

## 🛠️ Troubleshooting

### Common Issues

**Pattern generation fails or shows errors:**
- Refresh the page to reset the application state
- Ensure JavaScript is enabled in your browser
- Try reducing complexity settings for better performance

**Export functions not working:**
- Generate a pattern first before attempting export
- Check browser compatibility (modern browsers required)
- Ensure sufficient system memory for high-complexity patterns

**Pattern library not saving:**
- Verify browser localStorage is enabled
- Check if running in private/incognito mode (localStorage disabled)
- Clear browser cache if experiencing corruption

**Performance issues:**
- Reduce complexity below 200 for smoother generation
- Close other browser tabs to free memory
- Use "Black Lines" mode for fastest generation

### Browser Support
- **Recommended**: Chrome 60+ for optimal performance
- **Supported**: Firefox 55+, Safari 12+, Edge 79+
- **Not supported**: Internet Explorer (any version)

## 📋 Changelog

### v2.0.1 (Latest)
**Bug Fixes:**
- Fixed "lineIndex is not defined" error in Spiral Distortion pattern
- Fixed missing variable initialization in Advanced Eye Pattern
- Fixed missing loop increment in Circular Displacement pattern
- Improved color mode support across all pattern types

**Improvements:**
- Enhanced error handling and user feedback
- More stable pattern generation across all types
- Better color progression in multi-colored patterns

### v2.0.0
**Major Features:**
- Interactive pattern preview thumbnails
- Advanced parameter controls (frequency, amplitude, rotation)
- Pattern library with save/load functionality
- Enhanced export pipeline with smart file naming
- Professional modal interfaces
- Comprehensive error handling system

### v1.0.0
**Initial Release:**
- 9 core optical illusion patterns
- Basic parameter controls
- SVG and image export capabilities
- LightBurn laser engraving compatibility
- Responsive design

## 📄 License

Open source project for educational and creative use. Compatible with LightBurn laser engraving software.

---

*Create stunning optical illusions with mathematical precision and professional export capabilities.*
