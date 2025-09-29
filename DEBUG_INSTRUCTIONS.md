# Debug Instructions for Preset Shortcuts

## Step 1: Open Developer Console
1. **Hard refresh** the page: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Open Chrome DevTools Console: `Cmd + Option + J` (Mac) or `Ctrl + Shift + J` (Windows)
3. Keep the console open at the bottom of your browser

## Step 2: Test Keyboard Shortcuts

### Test A: Press Shift+1
1. Click somewhere on the page (not in any input field)
2. Press and hold **Shift**, then press **1**
3. Check console output - you should see:
   ```
   Keydown event: 1 Shift: true Target: BODY
   Parsed number: 1
   Valid number detected: 1
   Calling savePreset
   savePreset called with slot: 1
   Current settings: {patternType: "...", complexity: ..., ...}
   Saved presets: {1: {...}}
   ```

### Test B: Click Preset Button
1. Click on the "Morph" tab
2. Click directly on the "1" button in the preset slots
3. This should also save

### Test C: Press number key only
1. Press **1** (without Shift)
2. Should load preset (or show "Preset 1 is empty")

## Step 3: Report Results
Please share:
- What you see in the console
- Any red error messages
- Whether a green success message appears at the top
- Any differences from expected output

## Common Issues:

### Issue 1: Console shows nothing
- JavaScript might not be loading
- Check Network tab for 404 errors

### Issue 2: "Ignoring - typing in input field"
- Click on the canvas or background first
- Don't click in any sliders/inputs

### Issue 3: Events fire but no success message
- Check if `showSuccess` method exists
- Look for JavaScript errors (red text)

### Issue 4: Events don't fire at all
- Check if page fully loaded
- Try clicking "Morph" tab first
- Check browser extensions aren't blocking

## Quick Test Alternative:
Open browser console and type:
```javascript
app.savePreset(1)
```
If this works, the methods are fine and it's just the keyboard shortcuts.
