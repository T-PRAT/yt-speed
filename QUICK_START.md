# 🚀 Quick Start - Publishing

## Essential commands

```bash
# Build both versions
npm run build

# Or build separately
npm run build:chrome
npm run build:firefox

# Create ZIP packages (requires 'zip' installed)
npm run zip:chrome    # → dist/chrome.zip
npm run zip:firefox   # → dist/firefox.zip
npm run zip           # → Both
```

## If 'zip' is not installed

**Linux:**

```bash
sudo apt-get install zip  # Debian/Ubuntu
sudo pacman -S zip        # Arch
```

**Manual alternative:**

1. Build: `npm run build`
2. Go to `dist/chrome/` or `dist/firefox/`
3. Select all files
4. Create a ZIP archive

## Build structure

```
dist/
├── chrome/          # Chrome version (service_worker)
├── firefox/         # Firefox version (background.scripts)
├── chrome.zip       # Chrome Web Store package
└── firefox.zip      # Firefox Add-ons package
```

## Before publishing

### Chrome

- [ ] Verify that `dist/chrome/manifest.json` uses `service_worker`
- [ ] Test `dist/chrome/` in Chrome
- [ ] Prepare screenshots (1280×800 px)
- [ ] Prepare privacy policy

### Firefox

- [ ] **IMPORTANT**: Change the ID in `manifest.firefox.json`:
  ```json
  "browser_specific_settings": {
    "gecko": {
      "id": "your-extension@your-domain.com"
    }
  }
  ```
- [ ] Rebuild: `npm run build:firefox`
- [ ] Verify that `dist/firefox/manifest.json` uses `background.scripts`
- [ ] Test `dist/firefox/` in Firefox

## Publishing

1. **Chrome Web Store**

   - 👉 https://chrome.google.com/webstore/devconsole
   - Upload `dist/chrome.zip`
   - Cost: 5 USD (one-time)

2. **Firefox Add-ons**
   - 👉 https://addons.mozilla.org/developers/
   - Upload `dist/firefox.zip`
   - Free

## Complete documentation

See [PUBLISHING.md](./PUBLISHING.md) for the detailed guide.
