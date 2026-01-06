# 📦 Publishing Guide

Complete guide for publishing the extension to **Chrome Web Store** and **Firefox Add-ons (AMO)**.

---

## 🚀 Quick Start

```bash
# Build both versions
npm run build

# Or build separately
npm run build:chrome
npm run build:firefox

# Create ZIP packages
npm run zip:chrome    # → dist/chrome.zip
npm run zip:firefox   # → dist/firefox.zip
npm run zip           # → Both
```

---

## 🟢 Chrome Web Store

### Prerequisites

- ✅ Google account
- ✅ **5 USD** (one-time fee)
- ✅ Extension in **Manifest V3**

### Steps

1. **Build Chrome version**

   ```bash
   npm run zip:chrome
   ```

   → File: `dist/chrome.zip`

2. **Go to Chrome Web Store Developer Dashboard**

   - 👉 https://chrome.google.com/webstore/devconsole
   - Pay the **5 USD** (one-time)
   - Click **"New Item"**

3. **Upload the ZIP**

   - ⚠️ **Important**: Upload the contents of `dist/chrome.zip`
   - Do not upload the `dist/chrome/` folder directly

4. **Fill in the form**

   | Field              | Description                              |
   | ------------------ | ---------------------------------------- |
   | **Name**           | YouTube Speed (or **MSG_extensionName**) |
   | **Description**    | Detailed description of the extension    |
   | **Icons**          | Use `icons/icon128.png`                  |
   | **Screenshots**    | 1280×800 px recommended                  |
   | **Category**       | Productivity / Utilities                 |
   | **Privacy Policy** | ⚠️ **Required** if permissions           |

5. **Justify permissions** 🚨

   Chrome **manually reviews** each permission. Explain:

   - `storage`: To save playback speed per video
   - `activeTab`: To control speed on the active YouTube tab
   - `tabs`: To send messages from keyboard shortcuts
   - `host_permissions` (youtube.com): To inject controls into YouTube

   **Example justification**:

   > "The extension requires access to YouTube to inject a speed control into the video player. Local storage allows remembering the preferred speed per video. Tab access is necessary for keyboard shortcuts to work."

6. **Publish**

   - **Unlisted**: Private, accessible via link
   - **Public**: Visible in the store
   - **Draft**: Draft

7. **Review time**
   - ⏱️ A few minutes to a few days
   - Chrome reviews manually

---

## 🟠 Firefox Add-ons (AMO)

### Prerequisites

- ✅ Firefox account (free)
- ✅ Manifest V3 with `background.scripts` (not `service_worker`)
- ✅ **Firefox ID required** (already configured in `manifest.firefox.json`)

### Steps

1. **Build Firefox version**

   ```bash
   npm run zip:firefox
   ```

   → File: `dist/firefox.zip`

2. **Go to Mozilla Add-ons**

   - 👉 https://addons.mozilla.org/developers/
   - Sign in with a Firefox account
   - Click **"Submit a New Add-on"**
   - Choose **"On your own"**

3. **Upload the ZIP**

   - Firefox accepts `.zip` or `.xpi`
   - Upload `dist/firefox.zip`

4. **Firefox specifics** ⚠️

   The Firefox ID is **required** and already configured:

   ```json
   "browser_specific_settings": {
     "gecko": {
       "id": "ytspeed@example.com"
     }
   }
   ```

   ⚠️ **Important**: Change the ID `ytspeed@example.com` to your own ID before publishing!

   Recommended format: `yourextension@yourdomain.com`

5. **Fill in information**

   - Name, description, category
   - Screenshots (optional but recommended)
   - Privacy policy (if necessary)

6. **Review**

   - **Auto-review**: A few minutes (if everything is OK)
   - **Manual review**: 1 to 5 days (if flags)

7. **Firefox is more permissive than Chrome** ✅

---

## ⚠️ Common rejection reasons

### Chrome ❌

- ❌ Permissions too broad without justification
- ❌ Obfuscated code without source map
- ❌ Feature not explained
- ❌ External script downloads
- ❌ Content policy violations

### Firefox ❌

- ❌ Missing ID in `browser_specific_settings`
- ❌ Minified JS without source
- ❌ Undeclared tracking
- ❌ Using `background.service_worker` (use `background.scripts`)

---

## ✅ Pre-submission checklist

### Chrome

- [ ] Manifest V3 with `service_worker`
- [ ] All permissions justified
- [ ] Privacy policy (if permissions)
- [ ] Screenshots 1280×800 px
- [ ] Clear and complete description
- [ ] Quality icons (16, 48, 128 px)
- [ ] Tested on recent Chrome

### Firefox

- [ ] Manifest V3 with `background.scripts` (not `service_worker`)
- [ ] Unique Firefox ID in `browser_specific_settings`
- [ ] Privacy policy (if necessary)
- [ ] Clear description
- [ ] Tested on recent Firefox

---

## 🔄 Recommended workflow

1. **Development**

   ```bash
   # Use manifest.json for local development
   # (configured for Firefox by default)
   ```

2. **Before publishing**

   ```bash
   # Build both versions
   npm run build

   # Test the builds
   # - Chrome: load dist/chrome/ in chrome://extensions
   # - Firefox: load dist/firefox/ in about:debugging
   ```

3. **Create packages**

   ```bash
   npm run zip
   ```

4. **Publish**

   - Upload `dist/chrome.zip` to Chrome Web Store
   - Upload `dist/firefox.zip` to Firefox Add-ons

5. **Update**
   - Modify version in `manifest.chrome.json` and `manifest.firefox.json`
   - Rebuild and republish

---

## 📝 Important notes

### Firefox ID

The ID in `manifest.firefox.json` is currently `ytspeed@example.com`.
**Change it** before publishing with your own ID (email format).

### Version

The version is defined in:

- `manifest.chrome.json`
- `manifest.firefox.json`

Update both before each publication.

### Permissions

Permissions are identical for Chrome and Firefox:

- `storage`: Save preferences
- `activeTab`: Control active tab
- `tabs`: Communicate with tabs
- `host_permissions`: Access to YouTube

---

## 🤖 CI/CD (Optional)

To automate builds with GitHub Actions, see `.github/workflows/build.yml`.

---

## 📚 Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Firefox WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

---

**Good luck with publishing! 🚀**
