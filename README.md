<div align="center">
	<h1>YouTube Rabbit</h1>
	<p>
  	<img src="icons/icon128.png" alt="YouTube Rabbit Logo" width="64">
	</p>
</div>

A lightweight browser extension that adds precise playback speed control to YouTube videos. Works on Chrome and Firefox.

## ✨ Features

- 🎚️ Speed control: 0.25x to 8x
- ⌨️ Keyboard shortcuts: `.` / `,` (page) or `Alt+Up` / `Alt+Down` (global)
- 🖱️ Mouse wheel support
- 💾 Remembers your preferred speed
- 🌍 English and French support

## 🚀 Installation

### Chrome

1. Download `chrome.zip` from [Releases](https://github.com/t-prat/youtube-rabbit/releases)
2. Extract and load in `chrome://extensions/` (Developer mode)

### Firefox

1. Download `firefox.zip` from [Releases](https://github.com/t-prat/youtube-rabbit/releases)
2. Extract and load in `about:debugging` → "Load Temporary Add-on"

## 📖 Usage

- **Click** the speed button in YouTube's player controls
- **Scroll** over the button to adjust speed
- **Keyboard**: `.` / `,` (when not typing) or `Alt+Up` / `Alt+Down` (always)

## 🛠️ Development

```bash
npm install
npm run build          # Build both versions
npm run build:chrome   # Chrome only
npm run build:firefox  # Firefox only
npm run zip            # Create packages
```

Load `dist/chrome/` or `dist/firefox/` in your browser for testing.

## 📦 Publishing

See [PUBLISHING.md](./PUBLISHING.md) for details.

**Quick**: `npm run zip` → Upload `dist/chrome.zip` and `dist/firefox.zip` to stores.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
