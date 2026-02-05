# YouTube Rabbit - Project Notes

## Project Overview

A lightweight browser extension for YouTube playback speed control. Chrome and Firefox support using Manifest V3.

**Tech Stack:**
- Vanilla JavaScript (no frameworks)
- Chrome/Firefox Extension APIs
- Manifest V3

**File Structure:**
```
youtube-rabbit/
├── content/
│   ├── content.js      # Main speed control logic (475 lines)
│   └── content.css     # Styles for speed controls (71 lines)
├── background/background.js # Keyboard command handling (42 lines)
├── popup/                  # Extension popup UI
├── icons/                  # Extension icons
├── build.js               # Build script
├── zip.js                 # Packaging script
└── manifest*.json         # Browser manifests
```

---

## Recent Improvements (February 2025)

All critical issues and code quality improvements have been completed:

### Completed Fixes

**Phase 1 - Critical (Publishing Blockers)**
- ✅ Fixed Firefox extension ID placeholder → `youtuberabbit@tprat`
- ✅ Fixed README release links placeholders → `tprat`
- ✅ Filled empty author field in package.json

**Phase 2 - Bug Fixes**
- ✅ Removed unused `showSpeedIndicator()` function (32 lines)
- ✅ Fixed fragile tooltip cleanup with data attributes
- ✅ Fixed page reload for button repositioning (now uses messaging)
- ✅ Fixed YouTube URL detection for international TLDs

**Phase 3 - Code Quality**
- ✅ Added logging to all silent error handlers
- ✅ Improved MutationObserver scope (targets #movie_player)
- ✅ Cleaned up global event listeners (prevents memory leaks)
- ✅ Encapsulated global scope with IIFE
- ✅ Extracted CSS to separate file (content.css)
- ✅ Extracted all selectors to constants

**Results:**
- Reduced content.js from 532 to 475 lines (-57 lines, 10.7% reduction)
- All code now properly scoped in IIFE
- Better error logging for debugging
- Improved performance with targeted DOM observation
- Memory leak prevention with proper listener cleanup
- More maintainable code with selector constants

---

## Known Issues & TODOs

### Remaining Items

**None!** All previously identified issues have been resolved.
   - All catch blocks are empty - add logging or user feedback

3. **Fragile Tooltip Cleanup** - `content/content.js:164-169`
   ```javascript
   if (text === 'Scroll to change speed') { tt.remove(); }
   ```
   - Breaks if tooltip text changes - use data attributes instead

4. **Heavy-Handed Button Repositioning** - `popup/popup.js:15`
   ```javascript
   chrome.tabs.reload(tabs[0].id); // Reloads entire page!
   ```
   - Should reposition without page reload via messaging

5. **YouTube URL Detection** - `background/background.js:10-12`
   ```javascript
   if (!tab.url.includes('youtube.com')) return;
   ```
   - Only catches `.com` - should handle all TLDs or use pattern matching

### Performance Concerns

1. **Aggressive MutationObserver** - `content/content.js:467-470`
   ```javascript
   observer.observe(document.body, { childList: true, subtree: true });
   ```
   - Observes entire DOM tree - could impact performance
   - Consider observing specific containers only

2. **Global Event Listeners** - `content/content.js:346-352`
   - Scroll and resize listeners never removed
   - Potential memory leak if script runs multiple times

3. **Global Scope Pollution** - `content/content.js:6-12`
   - All variables declared in global scope
   - Use IIFE or module pattern to isolate

### Architecture Improvements

1. **CSS in JavaScript** - `content/content.js:257-303, 390-405`
   - All styling via `style.cssText`
   - Extract to separate CSS file for maintainability

2. **Hardcoded Selectors** - Multiple locations
   - `.ytp-right-controls`, `.ytp-left-controls`, `.html5-main-video`
   - Extract to constants at top of file

3. **No Message Validation** - `content/content.js:498-525`
   - Messages from background not validated
   - Add schema validation

4. **Race Condition** - `content/content.js:24-34`
   - `findVideoElement()` can find stale video element during navigation
   - Add element validity checks

---

## Build & Deployment

### Build Commands

```bash
npm run build          # Build both Chrome and Firefox
npm run build:chrome   # Chrome only
npm run build:firefox  # Firefox only
npm run zip            # Create distribution packages
```

### Version Management

Version numbers are in 3 places:
1. `package.json` (line 3)
2. `manifest.chrome.json` (line 4)
3. `manifest.firefox.json` (line 4)

**TODO:** Keep these in sync automatically via build script

### Permissions Review

Current permissions:
- `storage` - Required for saving speed preferences
- `activeTab` - Required for keyboard shortcuts
- `tabs` - **May be unnecessary** - review if can use `activeTab` instead

---

## Chrome Web Store & AMO Publishing

### Chrome Web Store

1. Prepare assets:
   - Screenshots (1280x800 or 640x400)
   - Small tile (440x280) - optional
   - Marquee screenshot (2120x1192) - optional

2. Store listing:
   - Description: see README.md
   - Categories: "Accessibility, Fun"
   - Language: English (add French later?)

### Firefox Add-ons (AMO)

1. Get proper extension ID (replace `youtuberabbit@example.com`)
2. Submit source code for review
3. AMO requires:
   - Source code URL (GitHub)
   - Privacy policy (if collecting data - currently doesn't apply)

---

## Testing Status

- **No tests configured** - Manual testing only
- **No linting** - Consider adding ESLint
- **No TypeScript** - Pure JavaScript

### Manual Testing Checklist

- [ ] Speed adjustment (0.25x to 8x)
- [ ] Keyboard shortcuts (`,` and `.`)
- [ ] Alt+Up/Down shortcuts
- [ ] Mouse wheel on button
- [ ] Double-click to reset
- [ ] Middle-click to reset
- [ ] Speed persistence across videos
- [ ] Button repositioning (left, right-start, right-end)
- [ ] Dropdown preset selection
- [ ] Mobile YouTube (m.youtube.com)
- [ ] Short URLs (youtu.be)

---

## Important Patterns

### Content Script Initialization

The content script uses a retry pattern for DOM-dependent operations:
```javascript
if (!controls) {
  setTimeout(injectSpeedControl, 500);
  return;
}
```
This is necessary because YouTube's DOM loads asynchronously.

### Storage Usage

All settings stored in `chrome.storage.local`:
- `speed`: Current playback speed
- `stepSize`: Speed adjustment increment (0.25)
- `buttonPosition`: UI button placement

### Message Protocol

Background → Content:
```javascript
{ action: 'setSpeed', value: number }
{ action: 'adjustSpeed', delta: number }
{ action: 'getSpeed' }
{ action: 'repositionButton' }
```

---

## Browser Differences

### Manifest V3

- **Chrome**: Uses `service_worker` for background
- **Firefox**: Uses `scripts` array (persistent background page)

### Storage API

Both use `chrome.storage.local` (Firefox supports this for compatibility)

---

## YouTube DOM Structure (as of 2025)

**Video element:**
- `#movie_player video` (primary selector)
- `.html5-main-video` (fallback)
- `video` (last resort)

**Control bar:**
- `.ytp-left-controls` - Left side (play, volume)
- `.ytp-right-controls` - Right side (settings, fullscreen)

**Selectors are subject to change by YouTube.**

---

## Development Notes

### Adding New Features

1. Add feature to `content/content.js` (UI/logic)
2. Add background command if needed (global shortcuts)
3. Update manifest permissions if accessing new APIs
4. Test on both Chrome and Firefox

### Debugging

- Chrome: `chrome://extensions` → "Details" → "Inspect views: content script"
- Firefox: Browser Console (Ctrl+Shift+J) or about:debugging

Console logs prefixed with `[YouTube Rabbit]` in background script.

---

## Future Enhancement Ideas

1. **Custom speed presets** - Let users define their own preset speeds
2. **Keyboard shortcut customization** - Allow remapping `,`, `.`, Alt+Up/Down
3. **Speed presets per channel** - Remember different speeds for different channels
4. **Global speed indicator** - Always-on speed display option
5. **Speed transition smoothing** - Gradual speed changes instead of instant
6. **Theater mode support** - Detect and adapt to theater/fullscreen modes
7. **Mobile support** - Currently desktop-focused
