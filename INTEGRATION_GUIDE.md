# Integration Guide - Adding Riley Waves & Improvements

## Quick Start (3 Steps)

### Step 1: Add Riley Waves to HTML Dropdown

**File:** `index.html`
**Line:** Around 138 (after line `<option value="radial-vortex">Radial Vortex</option>`)

**Add this line:**
```html
<option value="riley-waves">Bridget Riley Waves</option>
```

---

### Step 2: Add Pattern Info

**File:** `script.js`
**Line:** Around 127 (in the `this.patternInfo` object, after `'radial-vortex': ...`)

**Add this line:**
```javascript
'riley-waves': 'Sinusoidal wave patterns with precisely controlled rhythm variation creating vibration and shimmer effects, inspired by Bridget Riley\'s Op Art masterpieces',
```

---

### Step 3: Add Riley Waves Functions

**File:** `script.js`
**Location:** After the `generateSpiralDistortion()` function (around line 4227)

**Copy the entire contents of `riley-waves-function.js` and paste it there.**

Then add the switch case:

**File:** `script.js`
**Line:** Around 2307 (in the switch statement, after the `'radial-vortex'` case)

**Add this:**
```javascript
case 'riley-waves':
    this.generateRileyWaves(layerGroup, currentRotation, slowAnimationTime);
    break;
```

And add the mini preview case:

**File:** `script.js`
**Line:** Around 614 (in the `generateMiniPattern` switch, after `'radial-vortex'` case)

**Add this:**
```javascript
case 'riley-waves':
    this.generateMiniRileyWaves(svg, miniSeed, miniComplexity, miniLineWidth);
    break;
```

---

## That's It! Riley Waves is Now Added

Test it:
1. Open `index.html` in browser
2. Select "Bridget Riley Waves" from Pattern Type dropdown
3. Adjust parameters:
   - **Complexity**: 50-100 (number of lines)
   - **Amplitude**: 30-70 (wave height)
   - **Frequency**: 40-80 (wave ripples)
   - **Rotation**: 0 or try 45° for diagonal

---

## Optional: Improve Existing Patterns

Want to make the other patterns more visually striking? Apply these improvements:

### Improvement 1: Better Diagonal Stripes (Vibration Effect)

**File:** `script.js`
**Line:** Around 3022-3050 in `generateDiagonalStripes()`

**Find this code:**
```javascript
// Use amplitude for wave distortion intensity
const waveIntensity = amplitude / 50;

// Use frequency for wave frequency along stripes
const waveFrequency = frequency / 10;
```

**Replace with:**
```javascript
// Use amplitude for wave distortion intensity
const waveIntensity = amplitude / 50;

// Use frequency for wave frequency along stripes
const waveFrequency = frequency / 10;

// Add Riley-style amplitude modulation (will be used in loop)
```

**Then find this code (line 3047):**
```javascript
// Add wave distortion perpendicular to stripe direction
const waveOffset = Math.sin(t * 0.01 * waveFrequency + progress * Math.PI * 2) * waveIntensity;
```

**Replace with:**
```javascript
// Add wave distortion perpendicular to stripe direction
// Riley-style: amplitude varies sinusoidally (strong in center, weak at edges)
const amplitudeModulation = Math.sin(progress * Math.PI);
const actualWaveIntensity = waveIntensity * amplitudeModulation;
const waveOffset = Math.sin(t * 0.01 * waveFrequency + progress * Math.PI * 2) * actualWaveIntensity;
```

**Effect:** Creates pulsing/vibrating effect like Bridget Riley's work!

---

### Improvement 2: More Hypnotic Concentric Circles

**File:** `script.js`
**Line:** Around 2922 in `generateConcentricCircles()`

**Find this:**
```javascript
// Use frequency for wave count (breathing effect)
const waveCount = Math.max(2, Math.floor(frequency / 20));
```

**Replace with:**
```javascript
// Use frequency for wave count (breathing effect)
const waveCount = Math.max(3, Math.floor(frequency / 15)); // More waves
```

**Then find (line 2948):**
```javascript
const waveModulation = 1 + Math.sin(angle * waveCount + progress * Math.PI * 2) * waveIntensity * 0.2;
```

**Replace with:**
```javascript
const waveModulation = 1 + Math.sin(angle * waveCount + progress * Math.PI * 4) * waveIntensity * 0.4;
```

**Effect:** Stronger breathing/pulsing effect!

---

### Improvement 3: Stronger Moiré Shimmer

**File:** `script.js`
**Line:** Around 4086-4088 in `generateMoireInterference()`

**Find this:**
```javascript
// Variable spacing for each layer to create moiré
const spacing = baseSpacing * (1 + spacingVariation * (layer * 0.1 + this.seededRandom(this.currentSeed + layer) * 0.1));

// Different angles for each layer
const layerAngle = rotation + angleStep * layer;
```

**Replace with:**
```javascript
// For TRUE moiré effect, spacing must be identical (or very close)
const spacing = baseSpacing; // IDENTICAL spacing creates stronger moiré!

// Different angles create the interference - 7.5° is optimal
const layerAngle = rotation + (7.5 * layer);
```

**Effect:** Much stronger moiré interference patterns!

---

### Improvement 4: Stronger 3D Spiral Effect

**File:** `script.js`
**Line:** Around 4199 in `generateSpiralDistortion()`

**Find this:**
```javascript
path.setAttribute('fill-opacity', '0.6');
```

**Replace with:**
```javascript
path.setAttribute('fill-opacity', '0.8'); // Stronger 3D contrast
```

**Effect:** More pronounced 3D depth illusion!

---

## Testing Your Changes

After making changes:

1. **Refresh browser** (or hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. **Test each pattern** you modified
3. **Try these settings** for best visual impact:

### Riley Waves:
- Complexity: 60
- Amplitude: 50
- Frequency: 60
- Color Mode: Black Lines (high contrast!)

### Improved Diagonal Stripes:
- Complexity: 40
- Amplitude: 60
- Frequency: 50
- See the vibration!

### Improved Concentric Circles:
- Complexity: 60
- Amplitude: 40
- Frequency: 80
- See the breathing!

### Improved Moiré:
- Complexity: 80
- Amplitude: 0
- Frequency: 35 (2 layers at 7.5° difference)
- See the shimmer!

---

## Files Summary

**Files you created:**
- `riley-waves-function.js` - The Riley Waves code
- `OP_ART_IMPROVEMENTS.md` - Full analysis and improvements
- `INTEGRATION_GUIDE.md` - This file!

**Files you'll modify:**
- `index.html` - Add dropdown option
- `script.js` - Add functions, improve existing patterns

**Files to ignore:**
- `optical-illusion-demo.html` - That was the wrong direction, sorry!
- `OPTICAL_ILLUSION_ANALYSIS.md` - Also wrong direction

---

## Questions?

If something doesn't work:
1. Check console for errors (F12 in browser)
2. Make sure line numbers match (your file might be slightly different)
3. Make sure you added ALL the pieces (dropdown, switch case, function)

The Riley Waves pattern should now appear in your dropdown and work just like the other patterns!
