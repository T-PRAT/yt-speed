# YT Speed Control

A minimal browser extension for YouTube that provides playback speed control with keyboard shortcuts. Works on both Chrome and Firefox.

## Features

- **Speed Control**: Adjust playback speed from 0.25x to 8x
- **Keyboard Shortcuts**: Quick speed adjustments without leaving the video
- **Mouse Wheel**: Adjust speed by scrolling over the speed button
- **YouTube Integration**: Speed control injected directly into YouTube's player
- **Multi-language**: English and French support (auto-detects browser language)
- **Persistence**: Remembers speed for each video
- **Dark Theme**: Modern dark UI matching YouTube's style

## Installation

### Chrome (Development)

1. Build the Chrome version:
   ```bash
   npm run build:chrome
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `dist/chrome` folder
6. Go to YouTube to start using the extension

### Firefox (Development)

1. Build the Firefox version:
   ```bash
   npm run build:firefox
   ```
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file in the `dist/firefox` folder
6. Go to YouTube to start using the extension

**Note:** For quick local testing, you can also use the root `manifest.json` (configured for Firefox) directly in Firefox.

## Usage

### YouTube Player Control

A speed control button is injected into YouTube's video player control bar (right side). Click it to see speed presets from 0.25x to 8x.

### Extension Popup

Click the extension icon in the browser toolbar to see:

- Extension logo and name
- Instructions for using the speed control
- Keyboard shortcuts reference

The popup displays information only - all controls are in the YouTube player.

### Changing Speed

- **Click** the speed button in the YouTube player to open the speed menu
- **Mouse wheel**: Scroll over the speed button to adjust speed
  - Scroll up → Increase speed
  - Scroll down → Decrease speed
- **Keyboard shortcuts**: Use `.` and `,` keys

### Keyboard Shortcuts

| Shortcut | Action         |
| -------- | -------------- |
| `.`      | Increase speed |
| `,`      | Decrease speed |

Note: Keyboard shortcuts only work when you're not typing in a text field (search bar, comments, etc.).

## Building for Publication

### Quick Start

```bash
# Install dependencies (if needed)
npm install

# Build both versions
npm run build

# Or build separately
npm run build:chrome
npm run build:firefox

# Create ZIP packages for stores
npm run zip:chrome    # → dist/chrome.zip
npm run zip:firefox   # → dist/firefox.zip
npm run zip           # → Both packages
```

### Build Outputs

- `dist/chrome/` - Chrome version (Manifest V3 with service_worker)
- `dist/firefox/` - Firefox version (Manifest V3 with background.scripts)
- `dist/chrome.zip` - Ready for Chrome Web Store
- `dist/firefox.zip` - Ready for Firefox Add-ons

### Publishing

See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions on publishing to Chrome Web Store and Firefox Add-ons.

## Development

### Project Structure

```
yt-speed/
├── manifest.json              # Development manifest (Firefox config)
├── manifest.chrome.json       # Chrome build manifest (service_worker)
├── manifest.firefox.json       # Firefox build manifest (background.scripts)
├── package.json                # NPM scripts for building
├── build.js                   # Build script
├── zip.js                     # ZIP creation script
├── content/
│   └── content.js            # YouTube integration
├── background/
│   └── background.js         # Background script
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.css             # Popup styles
│   └── popup.js              # Popup logic
├── _locales/
│   ├── en/
│   │   └── messages.json     # English translations
│   └── fr/
│       └── messages.json     # French translations
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── dist/                      # Build outputs (gitignored)
│   ├── chrome/               # Chrome build
│   ├── firefox/              # Firefox build
│   ├── chrome.zip            # Chrome package
│   └── firefox.zip           # Firefox package
├── README.md
└── PUBLISHING.md             # Publishing guide
```

### Building Icons

Icons are included, but if you need to regenerate them:

```bash
# Requires ImageMagick
magick -size 16x16 xc:none -fill '#FF0000' -draw 'circle 8,8 8,8' -fill '#FFFFFF' -pointsize 12 -gravity center -annotate +0+0 '1x' icons/icon16.png
magick -size 48x48 xc:none -fill '#FF0000' -draw 'circle 24,24 24,24' -fill '#FFFFFF' -pointsize 24 -gravity center -annotate +0+0 '1x' icons/icon48.png
magick -size 128x128 xc:none -fill '#FF0000' -draw 'circle 64,64 64,64' -fill '#FFFFFF' -pointsize 48 -gravity center -annotate +0+0 '1x' icons/icon128.png
```

### Adding Translations

To add a new language:

1. Create a new folder in `_locales/` (e.g., `es/`)
2. Create a `messages.json` file with translations
3. The extension will automatically detect and use the appropriate language

## Permissions

The extension requires:

- `storage`: To save speed preferences per video
- `activeTab`: To control speed on the current YouTube tab
- `https://www.youtube.com/*`: To inject controls on YouTube
- `https://m.youtube.com/*`: To inject controls on mobile YouTube

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
